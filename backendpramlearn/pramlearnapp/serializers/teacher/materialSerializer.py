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
    quizzes = QuizSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Material
        fields = '__all__'  # atau sebutkan field yang diperlukan + quizzes + assignments

    def get_quizzes(self, obj):
        from .quizSerializer import QuizSerializer
        quizzes = Quiz.objects.filter(material=obj)
        return QuizSerializer(quizzes, many=True).data

    def get_assignments(self, obj):
        from .assignmentSerializer import AssignmentSerializer
        assignments = Assignment.objects.filter(material=obj)
        return AssignmentSerializer(assignments, many=True).data
