from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
from pramlearnapp.models.schedule import Schedule
from pramlearnapp.models.studentActivity import StudentActivity
from pramlearnapp.models.classes import ClassStudent
from pramlearnapp.models.assignment import Assignment
from pramlearnapp.models.quiz import Quiz
from pramlearnapp.models.subject import Subject, SubjectClass
from pramlearnapp.serializers import TodayScheduleSerializer, StudentActivitySerializer
from pramlearnapp.models.assignment import AssignmentSubmission
from pramlearnapp.models.material import Material
from pramlearnapp.models.group import GroupMember, GroupQuiz
from pramlearnapp.views.student.studentUpcomingDeadlinesView import StudentUpcomingDeadlinesView
from pramlearnapp.views.student.studentQuickActionsView import StudentQuickActionsView


class StudentDashboardView(APIView):
    """
    Dashboard utama student: subjects, assignments, quizzes, progress, recent activities, today schedule
    """

    def get(self, request):
        user = request.user
        # Pastikan hanya student
        if not hasattr(user, "role") or (hasattr(user, "role") and getattr(user.role, "name", None) != "Student" and getattr(user, "role", None) != 3):
            return Response({"detail": "Not authorized."}, status=403)

        # Ambil aktivitas terbaru student (misal 5 terakhir)
        recent_activities_qs = StudentActivity.objects.filter(
            student=user
        ).order_by('-timestamp')[:5]
        recent_activities = [
            {
                "title": activity.title,
                # "description": activity.description,
                "type": activity.activity_type,
                "time": activity.timestamp.isoformat(),
            }
            for activity in recent_activities_qs
        ]

        # Subjects yang diikuti student
        class_ids = ClassStudent.objects.filter(
            student=user).values_list("class_id", flat=True)

        # Ambil subject yang diikuti student via SubjectClass
        subject_ids = SubjectClass.objects.filter(
            class_id__in=class_ids
        ).values_list("subject_id", flat=True)
        subjects = Subject.objects.filter(id__in=subject_ids)
        subjects_count = subjects.count()

        # Assignment yang belum dikumpulkan
        material_ids = Material.objects.filter(
            subject_id__in=subject_ids).values_list("id", flat=True)
        pending_assignments = Assignment.objects.filter(
            material_id__in=material_ids
        ).exclude(
            assignmentsubmission__student=user
        ).count()

        # Ambil group yang diikuti student
        group_ids = GroupMember.objects.filter(
            student=user
        ).values_list("group_id", flat=True)

        # Quiz yang tersedia untuk student (via group assignment)
        group_quiz_ids = GroupQuiz.objects.filter(
            group_id__in=group_ids
        ).values_list("quiz_id", flat=True)
        available_quizzes = Quiz.objects.filter(
            id__in=group_quiz_ids
        ).count()

        # Progress rata-rata (manual, berdasarkan materi per subject)
        total_progress = 0
        subject_with_progress = 0
        for subject in subjects:
            materials = Material.objects.filter(subject=subject)
            total_materials = materials.count()
            if total_materials == 0:
                continue
            # Hitung jumlah materi yang sudah selesai oleh student
            completed = 0
            for m in materials:
                # Cek apakah ada AssignmentSubmission untuk student pada material ini
                if AssignmentSubmission.objects.filter(assignment__material=m, student=user).exists():
                    completed += 1
            progress = int((completed / total_materials)
                           * 100) if total_materials else 0
            total_progress += progress
            subject_with_progress += 1

        progress = int(total_progress /
                       subject_with_progress) if subject_with_progress else 0

        # Upcoming Deadlines
        upcoming_deadlines = StudentUpcomingDeadlinesView().get(
            request).data.get('upcoming_deadlines', [])

        # Learning Streak (Mock)
        learning_streak = {
            "current_streak": 12,
            "longest_streak": 28,
            "weekly_goal": 5,
            "weekly_progress": 4,
            "streak_status": "active",
            "next_milestone": 15,
            "streak_activities": [
                {"date": (timezone.now() - timedelta(days=0)
                          ).date().isoformat(), "completed": True, "activities": 3},
                {"date": (timezone.now() - timedelta(days=1)
                          ).date().isoformat(), "completed": True, "activities": 2},
                {"date": (timezone.now() - timedelta(days=2)
                          ).date().isoformat(), "completed": True, "activities": 4},
                {"date": (timezone.now() - timedelta(days=3)
                          ).date().isoformat(), "completed": True, "activities": 1},
                {"date": (timezone.now() - timedelta(days=4)
                          ).date().isoformat(), "completed": True, "activities": 2},
                {"date": (timezone.now() - timedelta(days=5)
                          ).date().isoformat(), "completed": True, "activities": 3},
                {"date": (timezone.now() - timedelta(days=6)
                          ).date().isoformat(), "completed": True, "activities": 2},
            ]
        }

        # Quick Actions Data (Mock)
        quick_actions = StudentQuickActionsView().get(request).data

        return Response({
            "subjects_count": subjects_count,
            "pending_assignments": pending_assignments,
            "available_quizzes": available_quizzes,
            "progress": progress,
            "recent_activities": recent_activities,
            "today_schedule": TodayScheduleSerializer(
                Schedule.objects.filter(
                    class_obj__in=class_ids,
                    day_of_week=datetime.now().weekday()
                ),
                many=True
            ).data,
            "upcoming_deadlines": upcoming_deadlines,
            "learning_streak": learning_streak,
            "quick_actions": quick_actions,
        })
