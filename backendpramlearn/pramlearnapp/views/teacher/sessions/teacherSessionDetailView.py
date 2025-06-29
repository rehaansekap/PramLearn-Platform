from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, Max, Min
from django.utils import timezone
from datetime import timedelta, datetime
from pramlearnapp.models import (
    Subject, SubjectClass, Material, Assignment, Quiz,
    ClassStudent, CustomUser, StudentMaterialProgress,
    StudentAttendance, Grade, GroupQuiz, GroupQuizResult,
    GroupMember, AssignmentSubmission
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherSessionDetailView(APIView):
    """
    API untuk mendapatkan detail session mata pelajaran yang diampu oleh teacher
    """
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, subject_slug):
        teacher = request.user

        try:
            # Get subject and verify teacher access
            subject = get_object_or_404(Subject, slug=subject_slug)
            subject_class = get_object_or_404(
                SubjectClass,
                subject=subject,
                teacher=teacher
            )

            class_obj = subject_class.class_id

            # Basic subject info
            subject_info = {
                'id': subject.id,
                'name': subject.name,
                'slug': subject.slug,
                'class_name': class_obj.name,
                'class_id': class_obj.id,
                'teacher_name': f"{teacher.first_name} {teacher.last_name}".strip() or teacher.username
            }

            # Get materials (sessions) with detailed info
            materials = Material.objects.filter(
                subject=subject).order_by('-id')

            sessions_data = []
            for material in materials:
                # Get assignments and quizzes count
                assignments_count = Assignment.objects.filter(
                    material=material).count()
                quizzes_count = Quiz.objects.filter(material=material).count()

                # Get student progress for this session
                progress_data = StudentMaterialProgress.objects.filter(
                    material=material
                ).aggregate(
                    avg_progress=Avg('completion_percentage'),
                    completed_count=Count(
                        'id', filter=Q(completion_percentage=100))
                )

                # Get students count
                students_count = ClassStudent.objects.filter(
                    class_id=class_obj).count()

                # Calculate completion rate
                completion_rate = 0
                if students_count > 0:
                    completion_rate = (
                        progress_data['completed_count'] or 0) / students_count * 100

                # Get attendance data
                attendance_data = StudentAttendance.objects.filter(
                    material=material
                ).aggregate(
                    total=Count('id'),
                    present=Count('id', filter=Q(status='present')),
                    absent=Count('id', filter=Q(status='absent')),
                    late=Count('id', filter=Q(status='late')),
                    excused=Count('id', filter=Q(status='excused'))
                )

                attendance_rate = 0
                if attendance_data['total'] > 0:
                    attendance_rate = (
                        attendance_data['present'] / attendance_data['total']) * 100

                # Get recent activity
                recent_activity = StudentMaterialProgress.objects.filter(
                    material=material
                ).order_by('-updated_at').first()

                # Get average grade for this session
                session_grades = Grade.objects.filter(
                    Q(quiz__material=material) | Q(
                        assignment__material=material)
                ).aggregate(avg_grade=Avg('grade'))

                sessions_data.append({
                    'id': material.id,
                    'title': material.title,
                    'slug': material.slug,
                    'assignments_count': assignments_count,
                    'quizzes_count': quizzes_count,
                    'students_count': students_count,
                    'average_progress': round(progress_data['avg_progress'] or 0, 1),
                    'completion_rate': round(completion_rate, 1),
                    'attendance_rate': round(attendance_rate, 1),
                    'attendance_summary': attendance_data,
                    'average_grade': round(session_grades['avg_grade'] or 0, 1),
                    'last_activity': recent_activity.updated_at if recent_activity else None,
                    'created_at': material.id,  # Using ID as proxy for creation order
                    'has_content': bool(
                        material.pdf_files.exists() or
                        material.youtube_videos.exists()
                        # or material.google_form_embed
                    )
                })

            # Overall statistics
            total_sessions = len(sessions_data)
            if total_sessions > 0:
                overall_progress = sum(s['average_progress']
                                       for s in sessions_data) / total_sessions
                overall_attendance = sum(s['attendance_rate']
                                         for s in sessions_data) / total_sessions
                overall_completion = sum(s['completion_rate']
                                         for s in sessions_data) / total_sessions
            else:
                overall_progress = overall_attendance = overall_completion = 0

            # Get students in this class with their overall performance
            students_qs = CustomUser.objects.filter(
                classstudent__class_id=class_obj,
                role__name='Student'
            ).select_related('studentmotivationprofile')

            students_performance = []
            for student in students_qs:
                student_progress = StudentMaterialProgress.objects.filter(
                    student=student,
                    material__subject=subject
                ).aggregate(
                    avg_progress=Avg('completion_percentage'),
                    completed_sessions=Count(
                        'id', filter=Q(completion_percentage=100))
                )

                student_attendance = StudentAttendance.objects.filter(
                    student=student,
                    material__subject=subject
                ).aggregate(
                    total=Count('id'),
                    present=Count('id', filter=Q(status='present'))
                )

                attendance_rate = 0
                if student_attendance['total'] > 0:
                    attendance_rate = (
                        student_attendance['present'] / student_attendance['total']) * 100

                # Get student grades
                student_grades = Grade.objects.filter(
                    Q(quiz__material__subject=subject) | Q(
                        assignment__material__subject=subject),
                    student=student
                ).aggregate(avg_grade=Avg('grade'))

                students_performance.append({
                    'id': student.id,
                    'username': student.username,
                    'full_name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'average_progress': round(student_progress['avg_progress'] or 0, 1),
                    'completed_sessions': student_progress['completed_sessions'] or 0,
                    'attendance_rate': round(attendance_rate, 1),
                    'average_grade': round(student_grades['avg_grade'] or 0, 1),
                    'motivation_level': getattr(
                        getattr(student, 'studentmotivationprofile', None),
                        'motivation_level',
                        'Unknown'
                    )
                })

            return Response({
                'subject': subject_info,
                'sessions': sessions_data,
                'statistics': {
                    'total_sessions': total_sessions,
                    'total_students': len(students_performance),
                    'overall_progress': round(overall_progress, 1),
                    'overall_attendance': round(overall_attendance, 1),
                    'overall_completion': round(overall_completion, 1)
                },
                'students_performance': students_performance
            }, status=status.HTTP_200_OK)

        except Subject.DoesNotExist:
            return Response(
                {'error': 'Subject not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except SubjectClass.DoesNotExist:
            return Response(
                {'error': 'You do not have access to this subject'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch session detail: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
