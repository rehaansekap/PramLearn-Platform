from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
from django.db.models import Avg, Count, Q
from pramlearnapp.models.schedule import Schedule
from pramlearnapp.models.studentActivity import StudentActivity
from pramlearnapp.models.classes import ClassStudent
from pramlearnapp.models.assignment import Assignment
from pramlearnapp.models.quiz import Quiz
from pramlearnapp.models.subject import Subject, SubjectClass
from pramlearnapp.serializers import TodayScheduleSerializer, StudentActivitySerializer
from pramlearnapp.models.assignment import AssignmentSubmission
from pramlearnapp.models.material import Material, StudentMaterialProgress
from pramlearnapp.models.group import GroupMember, GroupQuiz
from pramlearnapp.models.grade import Grade
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

        # PERBAIKAN: Progress berdasarkan StudentMaterialProgress per subject
        total_progress = 0
        subject_with_progress = 0

        for subject in subjects:
            # Ambil semua material dalam subject ini
            materials = Material.objects.filter(subject=subject)
            material_ids_in_subject = materials.values_list("id", flat=True)

            if not material_ids_in_subject:
                continue

            # Hitung rata-rata progress untuk subject ini
            subject_progress = StudentMaterialProgress.objects.filter(
                student=user,
                material_id__in=material_ids_in_subject
            ).aggregate(
                avg_progress=Avg('completion_percentage')
            )['avg_progress']

            # Jika student belum ada progress di subject ini, anggap 0%
            if subject_progress is None:
                subject_progress = 0

            total_progress += subject_progress
            subject_with_progress += 1

        # Hitung rata-rata progress keseluruhan
        overall_progress = int(
            total_progress / subject_with_progress) if subject_with_progress > 0 else 0

        # Upcoming Deadlines
        upcoming_deadlines = StudentUpcomingDeadlinesView().get(
            request).data.get('upcoming_deadlines', [])

        # PERBAIKAN: Learning Streak berdasarkan data grades
        learning_streak = self.calculate_learning_streak(user)

        # Quick Actions Data (Mock)
        quick_actions = StudentQuickActionsView().get(request).data

        return Response({
            "subjects_count": subjects_count,
            "pending_assignments": pending_assignments,
            "available_quizzes": available_quizzes,
            "progress": overall_progress,
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

    def calculate_learning_streak(self, student):
        """
        Hitung learning streak berdasarkan aktivitas grades/hasil belajar
        """
        # Ambil semua grades student, diurutkan berdasarkan tanggal
        grades = Grade.objects.filter(
            student=student
        ).order_by('-date')

        if not grades.exists():
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "weekly_goal": 5,
                "weekly_progress": 0,
                "streak_status": "inactive",
                "next_milestone": 7,
                "streak_activities": []
            }

        # Hitung current streak (hari berturut-turut dengan aktivitas)
        current_streak = 0
        longest_streak = 0
        temp_streak = 0

        # Kelompokkan grades berdasarkan tanggal
        from collections import defaultdict
        grades_by_date = defaultdict(list)

        for grade in grades:
            date_key = grade.date.date()
            grades_by_date[date_key].append(grade)

        # Urutkan tanggal dari yang terbaru
        sorted_dates = sorted(grades_by_date.keys(), reverse=True)

        # Hitung streak saat ini
        today = timezone.now().date()
        for i, date in enumerate(sorted_dates):
            expected_date = today - timedelta(days=i)

            if date == expected_date:
                current_streak += 1
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                break

        # Hitung longest streak keseluruhan
        temp_streak = 0
        prev_date = None

        for date in reversed(sorted_dates):
            if prev_date is None or (date - prev_date).days == 1:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
            prev_date = date

        # Hitung progress mingguan (7 hari terakhir)
        week_ago = today - timedelta(days=7)
        weekly_progress = len([d for d in sorted_dates if d >= week_ago])

        # Status streak
        streak_status = "active" if current_streak > 0 else "inactive"

        # Next milestone
        milestones = [7, 14, 30, 50, 100]
        next_milestone = next(
            (m for m in milestones if m > current_streak), 100)

        # Aktivitas 7 hari terakhir untuk visualisasi
        streak_activities = []
        for i in range(7):
            check_date = today - timedelta(days=i)
            has_activity = check_date in grades_by_date
            activity_count = len(grades_by_date.get(check_date, []))

            streak_activities.append({
                "date": check_date.isoformat(),
                "completed": has_activity,
                "activities": activity_count
            })

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "weekly_goal": 5,
            "weekly_progress": weekly_progress,
            "streak_status": streak_status,
            "next_milestone": next_milestone,
            "streak_activities": streak_activities
        }
