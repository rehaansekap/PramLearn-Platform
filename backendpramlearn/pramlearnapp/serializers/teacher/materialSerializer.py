from rest_framework import serializers
from pramlearnapp.models import Material, File, MaterialYoutubeVideo, Quiz, Assignment
from django.utils.text import slugify


class FileSerializer(serializers.ModelSerializer):
    """
    Serializer untuk file.
    """
    file_size = serializers.SerializerMethodField()  # Tambahkan ini

    class Meta:
        model = File
        fields = ['id', 'file', 'uploaded_at', 'file_size']

    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return 0


class MaterialYoutubeVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialYoutubeVideo
        fields = ["id", "url"]


class MaterialSerializer(serializers.ModelSerializer):
    pdf_files = FileSerializer(many=True, read_only=True)
    pdf_files_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    youtube_videos = MaterialYoutubeVideoSerializer(many=True, required=False)

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'pdf_files', 'pdf_files_ids',
            "google_form_embed_arcs_awal", "google_form_embed_arcs_akhir",
            'google_form_embed', 'subject', 'slug', 'youtube_videos'
        ]

    def create(self, validated_data):
        pdf_files_ids = validated_data.pop('pdf_files_ids', [])
        youtube_videos_data = validated_data.pop('youtube_videos', [])
        title = validated_data.get('title')
        validated_data['slug'] = slugify(title)
        material = super().create(validated_data)
        material.pdf_files.set(File.objects.filter(id__in=pdf_files_ids))
        for video_data in youtube_videos_data:
            MaterialYoutubeVideo.objects.create(
                material=material, **video_data)
        return material

    def update(self, instance, validated_data):
        pdf_files_ids = validated_data.pop('pdf_files_ids', [])
        youtube_videos_data = validated_data.pop('youtube_videos', [])
        title = validated_data.get('title', instance.title)
        validated_data['slug'] = slugify(title)
        instance = super().update(instance, validated_data)
        if pdf_files_ids:
            instance.pdf_files.set(File.objects.filter(id__in=pdf_files_ids))
        # Hapus video lama, tambah yang baru
        instance.youtube_videos.all().delete()
        for video_data in youtube_videos_data:
            MaterialYoutubeVideo.objects.create(
                material=instance, **video_data)
        return instance


class MaterialDetailSerializer(serializers.ModelSerializer):
    from .quizSerializer import QuizSerializer
    from .assignmentSerializer import AssignmentSerializer
    pdf_files = FileSerializer(many=True, read_only=True)
    youtube_videos = MaterialYoutubeVideoSerializer(many=True, read_only=True)

    # PERBAIKAN: Gunakan SerializerMethodField untuk data dinamis
    quizzes = serializers.SerializerMethodField()
    assignments = serializers.SerializerMethodField()

    # Subject information
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_slug = serializers.CharField(source='subject.slug', read_only=True)

    class Meta:
        model = Material
        fields = '__all__'

    def get_quizzes(self, obj):
        from .quizSerializer import QuizSerializer
        # PERBAIKAN: Tambahkan subject dan material info ke quiz
        quizzes = Quiz.objects.filter(material=obj).select_related(
            'material', 'material__subject')
        quiz_data = []
        for quiz in quizzes:
            quiz_dict = QuizSerializer(quiz).data
            # Tambahkan informasi subject dan material
            quiz_dict['subject_name'] = obj.subject.name if obj.subject else None
            quiz_dict['subject_id'] = obj.subject.id if obj.subject else None
            quiz_dict['material_name'] = obj.title
            quiz_dict['material_id'] = obj.id
            quiz_dict['material_slug'] = obj.slug
            quiz_data.append(quiz_dict)
        return quiz_data

    def get_assignments(self, obj):
        from .assignmentSerializer import AssignmentSerializer
        assignments = Assignment.objects.filter(
            material=obj).select_related('material', 'material__subject')
        assignment_data = []

        # Get current user's submissions for these assignments
        user = self.context['request'].user if self.context.get(
            'request') else None

        for assignment in assignments:
            assignment_dict = AssignmentSerializer(assignment).data

            # PERBAIKAN: Pastikan slug disertakan
            if not assignment_dict.get('slug'):
                from django.utils.text import slugify
                assignment_dict['slug'] = slugify(assignment.title)

            # PERBAIKAN: Add submission info dengan error handling yang lebih baik
            if user and user.is_authenticated:
                try:
                    from pramlearnapp.models import AssignmentSubmission
                    submission = AssignmentSubmission.objects.filter(
                        assignment=assignment,
                        student=user
                        # Ambil submission terbaru
                    ).order_by('-submission_date').first()

                    if submission:
                        assignment_dict['is_submitted'] = True
                        assignment_dict['submitted_at'] = submission.submission_date.isoformat(
                        ) if submission.submission_date else None
                        assignment_dict['grade'] = submission.grade
                        assignment_dict['submission_id'] = submission.id

                        # Log untuk debugging
                        print(
                            f"✅ Found submission for assignment {assignment.id}, user {user.id}: grade={submission.grade}")
                    else:
                        assignment_dict['is_submitted'] = False
                        assignment_dict['submitted_at'] = None
                        assignment_dict['grade'] = None
                        assignment_dict['submission_id'] = None

                        # Log untuk debugging
                        print(
                            f"❌ No submission found for assignment {assignment.id}, user {user.id}")

                except Exception as e:
                    print(
                        f"🚨 Error checking submission for assignment {assignment.id}: {e}")
                    assignment_dict['is_submitted'] = False
                    assignment_dict['submitted_at'] = None
                    assignment_dict['grade'] = None
                    assignment_dict['submission_id'] = None
            else:
                assignment_dict['is_submitted'] = False
                assignment_dict['submitted_at'] = None
                assignment_dict['grade'] = None
                assignment_dict['submission_id'] = None

            # Add subject and material info
            assignment_dict['subject_name'] = obj.subject.name if obj.subject else None
            assignment_dict['subject_id'] = obj.subject.id if obj.subject else None
            assignment_dict['material_name'] = obj.title
            assignment_dict['material_id'] = obj.id
            assignment_dict['material_slug'] = obj.slug

            # Add allow late submission flag (default True jika tidak ada field ini di model)
            assignment_dict['allow_late_submission'] = getattr(
                assignment, 'allow_late_submission', True)

            assignment_data.append(assignment_dict)

        return assignment_data


# class MaterialDetailSerializer(serializers.ModelSerializer):
#     from .quizSerializer import QuizSerializer
#     from .assignmentSerializer import AssignmentSerializer
#     pdf_files = FileSerializer(many=True, read_only=True)
#     youtube_videos = MaterialYoutubeVideoSerializer(many=True, read_only=True)
#     quizzes = QuizSerializer(many=True, read_only=True)
#     assignments = AssignmentSerializer(many=True, read_only=True)

#     class Meta:
#         model = Material
#         fields = '__all__'  # atau sebutkan field yang diperlukan + quizzes + assignments

#     def get_quizzes(self, obj):
#         from .quizSerializer import QuizSerializer
#         quizzes = Quiz.objects.filter(material=obj)
#         return QuizSerializer(quizzes, many=True).data

#     def get_assignments(self, obj):
#         from .assignmentSerializer import AssignmentSerializer
#         assignments = Assignment.objects.filter(material=obj)
#         return AssignmentSerializer(assignments, many=True).data
