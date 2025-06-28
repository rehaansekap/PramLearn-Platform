from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, Max
from django.utils import timezone
from datetime import timedelta
from pramlearnapp.models import (
    Subject,
    SubjectClass,
    Material,
    ClassStudent,
    StudentMaterialProgress,
    StudentAttendance,
    Assignment,
    Quiz,
    Grade,
    AssignmentSubmission,
    GroupQuizResult,
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherSessionsView(APIView):
    """
    API untuk mendapatkan daftar mata pelajaran yang diampu oleh teacher untuk sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        teacher = request.user
        search = request.query_params.get("search", "")
        class_filter = request.query_params.get("class", "")

        try:
            # Get subject classes taught by this teacher
            subject_classes = SubjectClass.objects.filter(
                teacher=teacher
            ).select_related("subject", "class_id")

            # Apply filters
            if search:
                subject_classes = subject_classes.filter(
                    Q(subject__name__icontains=search)
                    | Q(class_id__name__icontains=search)
                )

            if class_filter:
                subject_classes = subject_classes.filter(class_id__id=class_filter)

            subjects_data = []

            for subject_class in subject_classes:
                subject = subject_class.subject
                class_obj = subject_class.class_id

                # Get materials (sessions) count
                materials = Material.objects.filter(subject=subject)
                materials_count = materials.count()

                # Get students count in this class
                students_count = ClassStudent.objects.filter(class_id=class_obj).count()

                # Calculate session progress
                total_sessions = materials_count
                if total_sessions > 0:
                    # Get average progress across all sessions
                    progress_data = StudentMaterialProgress.objects.filter(
                        material__subject=subject
                    ).aggregate(avg_completion=Avg("completion_percentage"))
                    average_progress = progress_data["avg_completion"] or 0
                else:
                    average_progress = 0

                # Get recent activity (last 7 days)
                week_ago = timezone.now() - timedelta(days=7)
                recent_activities = StudentMaterialProgress.objects.filter(
                    material__subject=subject, updated_at__gte=week_ago
                ).count()

                # Get attendance rate
                if materials_count > 0 and students_count > 0:
                    total_attendance_records = StudentAttendance.objects.filter(
                        material__subject=subject
                    ).count()
                    present_records = StudentAttendance.objects.filter(
                        material__subject=subject, status="present"
                    ).count()

                    attendance_rate = (
                        present_records / max(total_attendance_records, 1)
                    ) * 100
                else:
                    attendance_rate = 0

                total_assignments = Assignment.objects.filter(
                    material__subject=subject
                ).count()

                total_quizzes = Quiz.objects.filter(material__subject=subject).count()

                student_ids = ClassStudent.objects.filter(
                    class_id=class_obj
                ).values_list("student_id", flat=True)

                assignment_grades = (
                    Grade.objects.filter(
                        assignment__material__subject=subject,
                        student_id__in=student_ids,
                    ).aggregate(avg_grade=Avg("grade"))["avg_grade"]
                    or 0
                )

                quiz_grades = (
                    Grade.objects.filter(
                        quiz__material__subject=subject, student_id__in=student_ids
                    ).aggregate(avg_grade=Avg("grade"))["avg_grade"]
                    or 0
                )

                group_quiz_grades = (
                    GroupQuizResult.objects.filter(
                        group_quiz__quiz__material__subject=subject,
                        group_quiz__group__groupmember__student_id__in=student_ids,
                    ).aggregate(avg_score=Avg("score"))["avg_score"]
                    or 0
                )

                grades = [
                    g
                    for g in [assignment_grades, quiz_grades, group_quiz_grades]
                    if g > 0
                ]
                average_grade = sum(grades) / len(grades) if grades else 0

                # Completion rate = percentage of students who completed all materials
                completion_rate = 0
                if students_count > 0 and materials_count > 0:
                    completed_students = (
                        StudentMaterialProgress.objects.filter(
                            material__subject=subject, completion_percentage=100
                        )
                        .values("student_id")
                        .distinct()
                        .count()
                    )
                    completion_rate = (completed_students / students_count) * 100

                subjects_data.append(
                    {
                        "id": subject.id,
                        "name": subject.name,
                        "slug": subject.slug,
                        "class_name": class_obj.name,
                        "class_id": class_obj.id,
                        "total_sessions": materials_count,
                        "students_count": students_count,
                        "average_progress": round(average_progress, 1),
                        "attendance_rate": round(attendance_rate, 1),
                        "recent_activities": recent_activities,
                        "last_session_date": (
                            materials.aggregate(last_created=Max("created_at"))[
                                "last_created"
                            ]
                            if materials_count > 0
                            else None
                        ),
                        "total_assignments": total_assignments,
                        "total_quizzes": total_quizzes,
                        "average_grade": round(average_grade, 1),
                        "overall_completion": round(completion_rate, 1),
                    }
                )

            # Get available classes for filter
            available_classes = (
                SubjectClass.objects.filter(teacher=teacher)
                .values_list("class_id__id", "class_id__name")
                .distinct()
            )

            return Response(
                {
                    "subjects": subjects_data,
                    "total_count": len(subjects_data),
                    "available_classes": [
                        {"id": class_id, "name": class_name}
                        for class_id, class_name in available_classes
                    ],
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            import traceback

            print(f"❌ Error in TeacherSessionsView: {str(e)}")
            print(f"❌ Traceback: {traceback.format_exc()}")
            return Response(
                {"error": f"Failed to fetch sessions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
