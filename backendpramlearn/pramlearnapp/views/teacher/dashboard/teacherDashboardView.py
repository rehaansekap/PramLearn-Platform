from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q
from pramlearnapp.models import (
    SubjectClass, Material, Assignment, Quiz, AssignmentSubmission,
    GroupQuiz, GroupQuizResult, ClassStudent, CustomUser, Grade,
    StudentActivity, Schedule, Announcement
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherDashboardView(APIView):
    """
    Dashboard utama teacher: classes, subjects, materials, assignments, quizzes, submissions overview
    """
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        try:
            # Get teacher's subject classes
            subject_classes = SubjectClass.objects.filter(teacher=user)
            subjects_count = subject_classes.count()
            
            # Get class IDs taught by teacher
            class_ids = subject_classes.values_list('class_id', flat=True).distinct()
            classes_count = len(set(class_ids))
            
            # Get subject IDs
            subject_ids = subject_classes.values_list('subject_id', flat=True)
            
            # Get materials created by teacher
            materials = Material.objects.filter(subject_id__in=subject_ids)
            materials_count = materials.count()
            
            # Get assignments created by teacher
            assignments = Assignment.objects.filter(material__in=materials)
            assignments_count = assignments.count()
            
            # Get quizzes created by teacher
            quizzes = Quiz.objects.filter(material__in=materials)
            quizzes_count = quizzes.count()
            
            # Get students taught by teacher
            total_students = CustomUser.objects.filter(
                classstudent__class_id__in=class_ids,
                role__name='Student'
            ).distinct().count()
            
            # Pending submissions (assignments not yet graded)
            pending_submissions = AssignmentSubmission.objects.filter(
                assignment__material__in=materials,
                grade__isnull=True,
                is_draft=False
            ).count()
            
            # Recent submissions (last 7 days)
            week_ago = timezone.now() - timedelta(days=7)
            recent_submissions = AssignmentSubmission.objects.filter(
                assignment__material__in=materials,
                submission_date__gte=week_ago,
                is_draft=False
            ).order_by('-submission_date')[:10]
            
            recent_submissions_data = []
            for submission in recent_submissions:
                recent_submissions_data.append({
                    'student_name': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                    'assignment_title': submission.assignment.title,
                    'subject_name': submission.assignment.material.subject.name,
                    'submission_date': submission.submission_date.isoformat(),
                    'grade': submission.grade,
                    'is_graded': submission.grade is not None
                })
            
            # Today's schedule
            today_schedule = Schedule.objects.filter(
                class_obj_id__in=class_ids,
                day_of_week=today.weekday(),
                subject_id__in=subject_ids
            ).select_related('subject', 'class_obj')
            
            today_schedule_data = []
            for schedule in today_schedule:
                today_schedule_data.append({
                    'id': schedule.id,
                    'subject_name': schedule.subject.name,
                    'class_name': schedule.class_obj.name,
                    'time': schedule.time.strftime('%H:%M'),
                    'day': schedule.get_day_of_week_display()
                })
            
            # Quick stats for performance
            total_quiz_attempts = GroupQuiz.objects.filter(
                quiz__material__in=materials,
                submitted_at__isnull=False
            ).count()
            
            avg_assignment_grade = AssignmentSubmission.objects.filter(
                assignment__material__in=materials,
                grade__isnull=False
            ).aggregate(avg_grade=Avg('grade'))['avg_grade'] or 0
            
            avg_quiz_score = GroupQuizResult.objects.filter(
                group_quiz__quiz__material__in=materials
            ).aggregate(avg_score=Avg('score'))['avg_score'] or 0
            
            # Recent activities from students in teacher's classes
            recent_activities = StudentActivity.objects.filter(
                student__classstudent__class_id__in=class_ids
            ).order_by('-timestamp')[:8]
            
            recent_activities_data = []
            for activity in recent_activities:
                recent_activities_data.append({
                    'student_name': f"{activity.student.first_name} {activity.student.last_name}".strip() or activity.student.username,
                    'title': activity.title,
                    'type': activity.activity_type,
                    'time': activity.timestamp.isoformat()
                })
            
            # Upcoming deadlines
            upcoming_assignments = Assignment.objects.filter(
                material__in=materials,
                due_date__gte=timezone.now(),
                due_date__lte=timezone.now() + timedelta(days=7)
            ).order_by('due_date')[:5]
            
            upcoming_deadlines = []
            for assignment in upcoming_assignments:
                # Count submissions
                total_submissions = AssignmentSubmission.objects.filter(
                    assignment=assignment,
                    is_draft=False
                ).count()
                
                # Count students who should submit
                expected_submissions = CustomUser.objects.filter(
                    classstudent__class_id__in=class_ids,
                    role__name='Student'
                ).distinct().count()
                
                days_left = (assignment.due_date - timezone.now()).days
                
                upcoming_deadlines.append({
                    'title': assignment.title,
                    'subject_name': assignment.material.subject.name,
                    'due_date': assignment.due_date.isoformat(),
                    'days_left': days_left,
                    'submissions_count': total_submissions,
                    'expected_submissions': expected_submissions,
                    'completion_rate': round((total_submissions / expected_submissions * 100), 1) if expected_submissions > 0 else 0
                })
            
            # Performance overview
            performance_overview = {
                'avg_assignment_grade': round(avg_assignment_grade, 1),
                'avg_quiz_score': round(avg_quiz_score, 1),
                'total_quiz_attempts': total_quiz_attempts,
                'completion_rate': round((recent_submissions.count() / assignments_count * 100), 1) if assignments_count > 0 else 0
            }
            
            return Response({
                'subjects_count': subjects_count,
                'classes_count': classes_count,
                'materials_count': materials_count,
                'assignments_count': assignments_count,
                'quizzes_count': quizzes_count,
                'total_students': total_students,
                'pending_submissions': pending_submissions,
                'recent_submissions': recent_submissions_data,
                'today_schedule': today_schedule_data,
                'recent_activities': recent_activities_data,
                'upcoming_deadlines': upcoming_deadlines,
                'performance_overview': performance_overview
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )