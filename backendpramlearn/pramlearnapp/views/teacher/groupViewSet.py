from rest_framework import viewsets, permissions
from pramlearnapp.models import Material, CustomUser, StudentMotivationProfile, Group, Quiz, GroupQuiz, GroupMember, GroupQuiz, GroupQuizSubmission, GroupQuizResult, ClassStudent
from pramlearnapp.serializers import (
    GroupSerializer, GroupMemberSerializer, GroupQuizSerializer,
    GroupQuizSubmissionSerializer, GroupQuizResultSerializer
)
from sklearn.cluster import KMeans
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        material_id = self.request.query_params.get('material')
        if material_id:
            queryset = queryset.filter(material_id=material_id)
        return queryset


class GroupMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance GroupMember.
    """
    queryset = GroupMember.objects.all()
    serializer_class = GroupMemberSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupQuizViewSet(viewsets.ModelViewSet):
    queryset = GroupQuiz.objects.all()
    serializer_class = GroupQuizSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        return queryset

    @action(detail=True, methods=['post'], url_path='calculate-score')
    def calculate_score(self, request, pk=None):
        group_quiz = self.get_object()
        result = group_quiz.calculate_and_save_score()
        return Response({"score": result.score})


class GroupQuizSubmissionViewSet(viewsets.ModelViewSet):
    queryset = GroupQuizSubmission.objects.all()
    serializer_class = GroupQuizSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        submission = serializer.save()
        group_quiz = submission.group_quiz
        # Selalu update score setiap ada submission baru
        group_quiz.calculate_and_save_score()

        # Broadcast real-time update
        self.broadcast_ranking_update(group_quiz.quiz.id)

    def perform_update(self, serializer):
        submission = serializer.save()
        group_quiz = submission.group_quiz
        # Selalu update score setiap ada submission diubah
        group_quiz.calculate_and_save_score()

        # Broadcast real-time update
        self.broadcast_ranking_update(group_quiz.quiz.id)

    def broadcast_ranking_update(self, quiz_id):
        """Broadcast ranking update via WebSocket"""
        try:
            from django.utils import timezone
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'quiz_ranking_{quiz_id}',
                    {
                        'type': 'quiz_ranking_update',
                        'quiz_id': quiz_id,
                        'timestamp': timezone.now().isoformat()
                    }
                )
                print(f"📡 Quiz ranking broadcast sent for quiz {quiz_id}")
        except Exception as e:
            print(f"❌ Quiz ranking broadcast error: {e}")


class GroupQuizResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance GroupQuizResult.
    """
    queryset = GroupQuizResult.objects.all()
    serializer_class = GroupQuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]


class AssignQuizToGroupsView(APIView):
    def post(self, request):
        quiz_id = request.data.get("quiz_id")
        material_id = request.data.get("material_id")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")
        group_ids = request.data.get("group_ids", None)

        if not (quiz_id and material_id and start_time and end_time):
            return Response({"error": "quiz_id, material_id, start_time, end_time required."}, status=400)

        try:
            quiz = Quiz.objects.get(id=quiz_id)
            material = Material.objects.get(id=material_id)
        except (Quiz.DoesNotExist, Material.DoesNotExist):
            return Response({"error": "Quiz or Material not found."}, status=404)

        # --- Tambahkan logika ini sebelum assign baru ---
        if group_ids is not None:
            # Hapus GroupQuiz yang tidak ada di group_ids baru
            GroupQuiz.objects.filter(
                quiz=quiz,
                group__material=material
            ).exclude(group_id__in=group_ids).delete()

        # --- Tambahkan parsing tipe data group_ids ---
        if group_ids:
            # Jika group_ids berupa string JSON, parse ke list
            if isinstance(group_ids, str):
                import json
                try:
                    group_ids = json.loads(group_ids)
                except Exception:
                    group_ids = [int(group_ids)]
            # Pastikan semua elemen int
            group_ids = [int(gid) for gid in group_ids]
            groups = Group.objects.filter(id__in=group_ids, material=material)
        else:
            groups = Group.objects.filter(material=material)

        created = []
        for group in groups:
            group_quiz, created_flag = GroupQuiz.objects.get_or_create(
                group=group,
                quiz=quiz,
                defaults={"start_time": start_time, "end_time": end_time}
            )
            if created_flag:
                created.append(group_quiz.id)
        return Response({"message": f"Quiz assigned to {len(created)} groups.", "group_quiz_ids": created}, status=201)


class AutoGroupStudentsView(APIView):
    def post(self, request, material_id):
        material = Material.objects.get(pk=material_id)
        subject = material.subject
        subject_class = subject.subject_class
        class_id = subject_class.class_id.id

        # Cek apakah sudah ada group untuk material ini
        if Group.objects.filter(material=material).exists():
            if request.data.get("force_overwrite"):
                old_groups = Group.objects.filter(material=material)
                GroupMember.objects.filter(group__in=old_groups).delete()
                old_groups.delete()
            else:
                return Response(
                    {"error": "Kelompok untuk materi ini sudah ada."},
                    status=status.HTTP_409_CONFLICT
                )

        # Ambil student_ids dan profiles
        student_ids = ClassStudent.objects.filter(
            class_id=class_id).values_list('student_id', flat=True)
        profiles = StudentMotivationProfile.objects.filter(
            student_id__in=student_ids)

        # "homogen" (default) atau "heterogen"
        mode = request.data.get("mode", "homogen")

        # ...hapus group & member lama jika ingin allow overwrite (atau hapus kode ini jika tidak)
        # old_groups = Group.objects.filter(material=material)
        # GroupMember.objects.filter(group__in=old_groups).delete()
        # old_groups.delete()

        n_clusters = int(request.data.get("n_clusters", 3))
        if n_clusters < 2:
            n_clusters = 2

        if mode == "heterogen":
            # Stratified heterogen grouping
            low = [p.student_id for p in profiles if p.motivation_level == "Low"]
            medium = [
                p.student_id for p in profiles if p.motivation_level == "Medium"]
            high = [p.student_id for p in profiles if p.motivation_level == "High"]
            groups_members = [[] for _ in range(n_clusters)]
            for idx, sid in enumerate(low):
                groups_members[idx % n_clusters].append(sid)
            for idx, sid in enumerate(medium):
                groups_members[idx % n_clusters].append(sid)
            for idx, sid in enumerate(high):
                groups_members[idx % n_clusters].append(sid)
            groups = []
            for group_num, member_ids in enumerate(groups_members):
                group = Group.objects.create(
                    material=material,
                    name=f"Kelompok {group_num+1}",
                    code=f"{material_id}-{group_num+1}"
                )
                groups.append(group)
                for sid in member_ids:
                    GroupMember.objects.create(group=group, student_id=sid)
            return Response({"message": f"{n_clusters} kelompok heterogen berhasil dibentuk."})
        else:
            # Homogen (K-Means)
            features = []
            profile_students = []
            for profile in profiles:
                features.append([
                    profile.attention,
                    profile.relevance,
                    profile.confidence,
                    profile.satisfaction
                ])
                profile_students.append(profile.student_id)
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            labels = kmeans.fit_predict(features)
            groups = []
            for group_num in range(n_clusters):
                group = Group.objects.create(
                    material=material,
                    name=f"Kelompok {group_num+1}",
                    code=f"{material_id}-{group_num+1}"
                )
                groups.append(group)
            for idx, label in enumerate(labels):
                GroupMember.objects.create(
                    group=groups[label],
                    student_id=profile_students[idx]
                )
            return Response({"message": f"{n_clusters} kelompok homogen berhasil dibentuk."})
