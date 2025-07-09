from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from pramlearnapp.models import (
    SubjectClass, Subject, Material, Assignment, Quiz, 
    AssignmentSubmission, GroupQuiz, ClassStudent, Grade,
    Schedule, StudentMaterialProgress
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherSubjectsView(APIView):
    """
    API untuk mendapatkan daftar mata pelajaran yang diampu oleh teacher
    """
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        teacher = request.user
        search = request.query_params.get('search', '')
        
        try:
            # Get subject classes taught by this teacher
            subject_classes = SubjectClass.objects.filter(
                teacher=teacher
            ).select_related('subject', 'class_id')
            
            # Apply search filter
            if search:
                subject_classes = subject_classes.filter(
                    Q(subject__name__icontains=search) |
                    Q(class_id__name__icontains=search)
                )
            
            subjects_data = []
            
            for subject_class in subject_classes:
                subject = subject_class.subject
                class_obj = subject_class.class_id
                
                # Get basic counts
                materials_count = Material.objects.filter(subject=subject).count()
                assignments_count = Assignment.objects.filter(
                    material__subject=subject
                ).count()
                quizzes_count = Quiz.objects.filter(
                    material__subject=subject
                ).count()
                
                # Get students count in this class
                students_count = ClassStudent.objects.filter(
                    class_id=class_obj
                ).count()
                
                # Get pending submissions count
                pending_submissions = AssignmentSubmission.objects.filter(
                    assignment__material__subject=subject,
                    grade__isnull=True,
                    is_draft=False
                ).count()
                
                # Get recent activity (last 7 days)
                week_ago = timezone.now() - timedelta(days=7)
                recent_submissions = AssignmentSubmission.objects.filter(
                    assignment__material__subject=subject,
                    submission_date__gte=week_ago,
                    is_draft=False
                ).count()
                
                # Calculate class average grade
                avg_grade = Grade.objects.filter(
                    student__classstudent__class_id=class_obj,
                    subject_name=subject.name
                ).aggregate(avg=Avg('grade'))['avg'] or 0
                
                # Get next schedule
                today = timezone.now().weekday()
                next_schedule = Schedule.objects.filter(
                    subject=subject,
                    class_obj=class_obj,
                    day_of_week__gte=today
                ).first()
                
                if not next_schedule:
                    # If no schedule today or later this week, get first schedule of next week
                    next_schedule = Schedule.objects.filter(
                        subject=subject,
                        class_obj=class_obj
                    ).first()
                
                schedule_info = None
                if next_schedule:
                    schedule_info = {
                        'day': next_schedule.get_day_of_week_display(),
                        'time': next_schedule.time.strftime('%H:%M')
                    }
                
                subjects_data.append({
                    'id': subject.id,
                    'name': subject.name,
                    'slug': subject.slug,
                    'class_name': class_obj.name,
                    'class_id': class_obj.id,
                    'materials_count': materials_count,
                    'assignments_count': assignments_count,
                    'quizzes_count': quizzes_count,
                    'students_count': students_count,
                    'pending_submissions': pending_submissions,
                    'recent_submissions': recent_submissions,
                    'average_grade': round(avg_grade, 1) if avg_grade else 0,
                    'next_schedule': schedule_info,
                    'subject_class_id': subject_class.id
                })
            
            return Response({
                'subjects': subjects_data,
                'total_count': len(subjects_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch subjects: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )