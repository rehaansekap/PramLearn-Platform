from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.models import ClassStudent, Subject, Assignment, Quiz, Material
from django.utils import timezone


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Pastikan hanya student
        if not hasattr(user, "role") or (hasattr(user, "role") and getattr(user.role, "name", None) != "Student" and getattr(user, "role", None) != 3):
            return Response({"detail": "Not authorized."}, status=403)

        # Subjects yang diikuti student
        class_students = ClassStudent.objects.filter(student=user)
        subject_ids = Subject.objects.filter(
            subject_classes__class_id__in=class_students.values("class_id")
        ).values_list("id", flat=True).distinct()
        subjects_count = subject_ids.count()

        # Pending assignments
        pending_assignments = Assignment.objects.filter(
            material__subject_id__in=subject_ids,
            assignmentsubmission__student=user,
            assignmentsubmission__isnull=True
        ).count()

        # Available quizzes
        available_quizzes = Quiz.objects.filter(
            material__subject_id__in=subject_ids
        ).count()

        # Progress dummy (implementasi lebih detail bisa pakai model progress)
        progress = 70  # TODO: hitung progress sebenarnya

        # Recent activities dummy
        recent_activities = [
            {
                "type": "material",
                "title": "Materi Terakhir",
                "description": "Membuka materi Matematika Bab 1",
                "time": timezone.now().strftime("%d %b %Y %H:%M"),
            },
            {
                "type": "assignment",
                "title": "Tugas Fisika",
                "description": "Mengumpulkan tugas Fisika Bab 2",
                "time": timezone.now().strftime("%d %b %Y %H:%M"),
            },
        ]

        # Jadwal hari ini dummy
        today_schedule = [
            {"time": "08:00", "activity": "Matematika"},
            {"time": "10:00", "activity": "Bahasa Inggris"},
        ]

        return Response({
            "stats": {
                "subjects": subjects_count,
                "pending_assignments": pending_assignments,
                "available_quizzes": available_quizzes,
                "progress": progress,
            },
            "recent_activities": recent_activities,
            "today_schedule": today_schedule,
        })
