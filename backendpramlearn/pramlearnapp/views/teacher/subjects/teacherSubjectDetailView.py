from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, Max, Min
from django.utils import timezone
from datetime import timedelta, datetime
from pramlearnapp.models import (
    Subject, SubjectClass, Material, Assignment, Quiz,
    AssignmentSubmission, GroupQuiz, GroupQuizResult, 
    ClassStudent, Grade, Schedule, StudentMaterialProgress,
    CustomUser, StudentAttendance
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherSubjectDetailView(APIView):
    """
    API untuk mendapatkan detail mata pelajaran yang diampu oleh teacher
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
            
            # Get students in this class
            students_qs = CustomUser.objects.filter(
                classstudent__class_id=class_obj,
                role__name='Student'
            ).select_related('studentmotivationprofile')
            
            students_data = []
            for student in students_qs:
                # Get student's grades for this subject
                student_grades = Grade.objects.filter(
                    student=student,
                    subject_name=subject.name
                )
                
                avg_grade = student_grades.aggregate(avg=Avg('grade'))['avg'] or 0
                
                # Get attendance rate
                total_materials = Material.objects.filter(subject=subject).count()
                if total_materials > 0:
                    present_count = StudentAttendance.objects.filter(
                        student=student,
                        material__subject=subject,
                        status='present'
                    ).count()
                    attendance_rate = round((present_count / total_materials) * 100, 1)
                else:
                    attendance_rate = 0
                
                # Get motivation level
                motivation_level = 'medium'
                if hasattr(student, 'studentmotivationprofile'):
                    motivation_level = student.studentmotivationprofile.motivation_level.lower()
                
                students_data.append({
                    'id': student.id,
                    'username': student.username,
                    'full_name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'email': student.email,
                    'average_grade': round(avg_grade, 1) if avg_grade else 0,
                    'attendance_rate': attendance_rate,
                    'motivation_level': motivation_level,
                    'is_online': student.is_online,
                    'last_activity': student.last_activity
                })
            
            # Performance overview
            total_students = len(students_data)
            if total_students > 0:
                avg_class_grade = sum(s['average_grade'] for s in students_data) / total_students
                avg_attendance = sum(s['attendance_rate'] for s in students_data) / total_students
                
                # Grade distribution
                high_performers = len([s for s in students_data if s['average_grade'] >= 80])
                avg_performers = len([s for s in students_data if 60 <= s['average_grade'] < 80])
                low_performers = len([s for s in students_data if s['average_grade'] < 60])
            else:
                avg_class_grade = 0
                avg_attendance = 0
                high_performers = avg_performers = low_performers = 0
            
            performance_overview = {
                'average_grade': round(avg_class_grade, 1),
                'average_attendance': round(avg_attendance, 1),
                'total_students': total_students,
                'high_performers': high_performers,
                'average_performers': avg_performers,
                'low_performers': low_performers
            }
            
            # Materials overview
            materials = Material.objects.filter(subject=subject)
            materials_data = []
            
            for material in materials:
                assignments_count = Assignment.objects.filter(material=material).count()
                quizzes_count = Quiz.objects.filter(material=material).count()
                
                # Calculate average completion rate
                total_students_in_class = ClassStudent.objects.filter(class_id=class_obj).count()
                if total_students_in_class > 0:
                    completed_students = StudentMaterialProgress.objects.filter(
                        material=material,
                        student__classstudent__class_id=class_obj,
                        completion_percentage=100
                    ).count()
                    completion_rate = round((completed_students / total_students_in_class) * 100, 1)
                else:
                    completion_rate = 0
                
                materials_data.append({
                    'id': material.id,
                    'title': material.title,
                    'slug': material.slug,
                    'assignments_count': assignments_count,
                    'quizzes_count': quizzes_count,
                    'completion_rate': completion_rate
                })
            
            # Assignment statistics
            assignments = Assignment.objects.filter(material__subject=subject)
            total_assignments = assignments.count()
            pending_submissions = AssignmentSubmission.objects.filter(
                assignment__in=assignments,
                grade__isnull=True,
                is_draft=False
            ).count()
            graded_submissions = AssignmentSubmission.objects.filter(
                assignment__in=assignments,
                grade__isnull=False
            ).count()
            
            if graded_submissions > 0:
                avg_assignment_grade = AssignmentSubmission.objects.filter(
                    assignment__in=assignments,
                    grade__isnull=False
                ).aggregate(avg=Avg('grade'))['avg'] or 0
            else:
                avg_assignment_grade = 0
            
            assignment_stats = {
                'total_assignments': total_assignments,
                'pending_submissions': pending_submissions,
                'graded_submissions': graded_submissions,
                'average_grade': round(avg_assignment_grade, 1)
            }
            
            # Quiz statistics
            quizzes = Quiz.objects.filter(material__subject=subject)
            total_quizzes = quizzes.count()
            
            # Individual quiz results
            individual_quiz_results = Grade.objects.filter(
                quiz__in=quizzes,
                type='quiz'
            ).count()
            
            # Group quiz results
            group_quiz_results = GroupQuizResult.objects.filter(
                group_quiz__quiz__in=quizzes
            ).count()
            
            if individual_quiz_results + group_quiz_results > 0:
                avg_quiz_grade = Grade.objects.filter(
                    quiz__in=quizzes,
                    type='quiz'
                ).aggregate(avg=Avg('grade'))['avg'] or 0
            else:
                avg_quiz_grade = 0
            
            quiz_stats = {
                'total_quizzes': total_quizzes,
                'individual_results': individual_quiz_results,
                'group_results': group_quiz_results,
                'average_grade': round(avg_quiz_grade, 1)
            }
            
            # Recent activities (last 7 days)
            week_ago = timezone.now() - timedelta(days=7)
            recent_submissions = AssignmentSubmission.objects.filter(
                assignment__material__subject=subject,
                submission_date__gte=week_ago,
                is_draft=False
            ).select_related('student', 'assignment').order_by('-submission_date')[:10]
            
            recent_activities = []
            for submission in recent_submissions:
                recent_activities.append({
                    'type': 'assignment_submission',
                    'student_name': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                    'assignment_title': submission.assignment.title,
                    'submission_date': submission.submission_date,
                    'grade': submission.grade
                })
            
            # Schedule information
            schedules = Schedule.objects.filter(
                subject=subject,
                class_obj=class_obj
            ).order_by('day_of_week', 'time')
            
            schedule_data = []
            for schedule in schedules:
                schedule_data.append({
                    'day': schedule.get_day_of_week_display(),
                    'time': schedule.time.strftime('%H:%M'),
                    'day_of_week': schedule.day_of_week
                })
            
            return Response({
                'subject_info': subject_info,
                'students': students_data,
                'performance_overview': performance_overview,
                'materials': materials_data,
                'assignment_stats': assignment_stats,
                'quiz_stats': quiz_stats,
                'recent_activities': recent_activities,
                'schedules': schedule_data
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
                {'error': f'Failed to fetch subject detail: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )