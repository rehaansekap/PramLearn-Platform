from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q, F
from pramlearnapp.models import (
    Class, SubjectClass, ClassStudent, CustomUser, 
    Assignment, AssignmentSubmission, Quiz, GroupQuiz,
    GroupQuizResult, StudentAttendance, Material, Grade
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherClassesListView(APIView):
    """
    API untuk mendapatkan daftar kelas yang diampu oleh teacher
    """
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        user = request.user
        search = request.GET.get('search', '')
        
        try:
            # Get classes taught by teacher
            subject_classes = SubjectClass.objects.filter(teacher=user)
            class_ids = subject_classes.values_list('class_id', flat=True).distinct()
            
            # Get classes with basic info
            classes_queryset = Class.objects.filter(id__in=class_ids)
            
            # Apply search filter
            if search:
                classes_queryset = classes_queryset.filter(
                    Q(name__icontains=search)
                )
            
            classes_data = []
            
            for class_obj in classes_queryset:
                # Count students in class
                student_count = ClassStudent.objects.filter(
                    class_id=class_obj.id
                ).count()
                
                # Count subjects taught by this teacher in this class
                subjects_count = SubjectClass.objects.filter(
                    teacher=user,
                    class_id=class_obj.id
                ).count()
                
                # Get materials for this teacher's subjects in this class
                teacher_subject_ids = SubjectClass.objects.filter(
                    teacher=user,
                    class_id=class_obj.id
                ).values_list('subject_id', flat=True)
                
                materials_count = Material.objects.filter(
                    subject_id__in=teacher_subject_ids
                ).count()
                
                # Get pending assignments (not graded yet)
                materials = Material.objects.filter(subject_id__in=teacher_subject_ids)
                pending_submissions = AssignmentSubmission.objects.filter(
                    assignment__material__in=materials,
                    grade__isnull=True,
                    is_draft=False
                ).count()
                
                # Calculate average attendance rate for this class
                total_attendance_records = StudentAttendance.objects.filter(
                    material__subject_id__in=teacher_subject_ids,
                    student__classstudent__class_id=class_obj.id
                ).count()
                
                present_records = StudentAttendance.objects.filter(
                    material__subject_id__in=teacher_subject_ids,
                    student__classstudent__class_id=class_obj.id,
                    status='present'
                ).count()
                
                attendance_rate = 0
                if total_attendance_records > 0:
                    attendance_rate = round((present_records / total_attendance_records) * 100, 1)
                
                # Calculate average grade for this class
                student_ids = ClassStudent.objects.filter(
                    class_id=class_obj.id
                ).values_list('student_id', flat=True)
                
                avg_grade = Grade.objects.filter(
                    student_id__in=student_ids,
                    assignment__material__subject_id__in=teacher_subject_ids
                ).aggregate(avg_grade=Avg('grade'))['avg_grade'] or 0
                
                # Recent activity (last 7 days)
                week_ago = timezone.now() - timedelta(days=7)
                recent_submissions = AssignmentSubmission.objects.filter(
                    assignment__material__subject_id__in=teacher_subject_ids,
                    student__classstudent__class_id=class_obj.id,
                    submission_date__gte=week_ago,
                    is_draft=False
                ).count()
                
                classes_data.append({
                    'id': class_obj.id,
                    'name': class_obj.name,
                    'slug': class_obj.slug,
                    'student_count': student_count,
                    'subjects_count': subjects_count,
                    'materials_count': materials_count,
                    'pending_submissions': pending_submissions,
                    'attendance_rate': attendance_rate,
                    'average_grade': round(avg_grade, 1),
                    'recent_activity_count': recent_submissions,
                    'performance_status': self.get_performance_status(avg_grade, attendance_rate)
                })
            
            # Sort by name
            classes_data.sort(key=lambda x: x['name'])
            
            return Response({
                'classes': classes_data,
                'total_classes': len(classes_data)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_performance_status(self, avg_grade, attendance_rate):
        """Determine performance status based on grade and attendance"""
        if avg_grade >= 80 and attendance_rate >= 80:
            return {'status': 'excellent', 'color': '#52c41a', 'text': 'Sangat Baik'}
        elif avg_grade >= 70 and attendance_rate >= 70:
            return {'status': 'good', 'color': '#1890ff', 'text': 'Baik'}
        elif avg_grade >= 60 and attendance_rate >= 60:
            return {'status': 'average', 'color': '#faad14', 'text': 'Cukup'}
        else:
            return {'status': 'needs_improvement', 'color': '#ff4d4f', 'text': 'Perlu Perbaikan'}