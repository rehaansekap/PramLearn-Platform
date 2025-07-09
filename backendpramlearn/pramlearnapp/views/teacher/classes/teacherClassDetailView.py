from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q, F, Case, When, IntegerField
from django.shortcuts import get_object_or_404
from pramlearnapp.models import (
    Class, SubjectClass, ClassStudent, CustomUser, 
    Assignment, AssignmentSubmission, Quiz, GroupQuiz,
    GroupQuizResult, StudentAttendance, Material, Grade,
    StudentActivity, Subject, StudentMotivationProfile
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherClassDetailView(APIView):
    """
    API untuk mendapatkan detail kelas yang diampu oleh teacher
    """
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, class_slug):
        user = request.user
        
        try:
            # Get class by slug
            class_obj = get_object_or_404(Class, slug=class_slug)
            
            # Verify teacher has access to this class
            teacher_subject_classes = SubjectClass.objects.filter(
                teacher=user,
                class_id=class_obj.id
            )
            
            if not teacher_subject_classes.exists():
                return Response(
                    {'error': 'You do not have access to this class'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get teacher's subjects in this class
            teacher_subjects = Subject.objects.filter(
                id__in=teacher_subject_classes.values_list('subject_id', flat=True)
            )
            
            # Get materials for teacher's subjects
            materials = Material.objects.filter(
                subject__in=teacher_subjects
            )
            
            # Basic class info
            class_info = {
                'id': class_obj.id,
                'name': class_obj.name,
                'slug': class_obj.slug,
                'subjects': []
            }
            
            # Add subjects info
            for subject in teacher_subjects:
                subject_materials = materials.filter(subject=subject)
                class_info['subjects'].append({
                    'id': subject.id,
                    'name': subject.name,
                    'slug': subject.slug,
                    'materials_count': subject_materials.count()
                })
            
            # Get students in class with detailed info
            students_data = self.get_students_data(class_obj, materials, user)
            
            # Get class performance overview
            performance_overview = self.get_performance_overview(class_obj, materials, user)
            
            # Get attendance summary
            attendance_summary = self.get_attendance_summary(class_obj, materials)
            
            # Get recent activities
            recent_activities = self.get_recent_activities(class_obj, materials)
            
            # Get assignment statistics
            assignment_stats = self.get_assignment_statistics(class_obj, materials)
            
            # Get quiz statistics
            quiz_stats = self.get_quiz_statistics(class_obj, materials)
            
            return Response({
                'class_info': class_info,
                'students': students_data,
                'performance_overview': performance_overview,
                'attendance_summary': attendance_summary,
                'recent_activities': recent_activities,
                'assignment_statistics': assignment_stats,
                'quiz_statistics': quiz_stats
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_students_data(self, class_obj, materials, teacher):
        """Get detailed students data with performance metrics"""
        class_students = ClassStudent.objects.filter(
            class_id=class_obj.id
        ).select_related('student')
        
        students_data = []
        
        for class_student in class_students:
            student = class_student.student
            
            # Get student's grades for teacher's materials
            grades = Grade.objects.filter(
                Q(assignment__material__in=materials) |
                Q(quiz__material__in=materials) |
                Q(material__in=materials),
                student=student
            )
            
            avg_grade = grades.aggregate(avg=Avg('grade'))['avg'] or 0
            total_assessments = grades.count()
            
            # Get attendance for teacher's materials
            attendance_records = StudentAttendance.objects.filter(
                student=student,
                material__in=materials
            )
            
            total_attendance = attendance_records.count()
            present_count = attendance_records.filter(status='present').count()
            attendance_rate = 0
            if total_attendance > 0:
                attendance_rate = round((present_count / total_attendance) * 100, 1)
            
            # Get assignment submissions
            assignment_submissions = AssignmentSubmission.objects.filter(
                student=student,
                assignment__material__in=materials,
                is_draft=False
            )
            
            submitted_assignments = assignment_submissions.count()
            total_assignments = Assignment.objects.filter(material__in=materials).count()
            
            submission_rate = 0
            if total_assignments > 0:
                submission_rate = round((submitted_assignments / total_assignments) * 100, 1)
            
            # Get motivation profile
            motivation_level = None
            try:
                profile = StudentMotivationProfile.objects.get(student=student)
                motivation_level = profile.motivation_level
            except StudentMotivationProfile.DoesNotExist:
                motivation_level = 'Unknown'
            
            # Get recent activity
            recent_activity = StudentActivity.objects.filter(
                student=student
            ).order_by('-timestamp').first()
            
            last_activity = None
            if recent_activity:
                last_activity = recent_activity.timestamp.isoformat()
            
            # Performance status
            performance_status = self.get_student_performance_status(
                avg_grade, attendance_rate, submission_rate
            )
            
            students_data.append({
                'id': student.id,
                'username': student.username,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'full_name': f"{student.first_name} {student.last_name}".strip() or student.username,
                'email': student.email,
                'is_online': student.is_online,
                'last_activity': last_activity,
                'average_grade': round(avg_grade, 1),
                'total_assessments': total_assessments,
                'attendance_rate': attendance_rate,
                'submission_rate': submission_rate,
                'motivation_level': motivation_level,
                'performance_status': performance_status
            })
        
        # Sort by performance (average grade desc, then attendance rate desc)
        students_data.sort(key=lambda x: (-x['average_grade'], -x['attendance_rate']))
        
        return students_data
    
    def get_performance_overview(self, class_obj, materials, teacher):
        """Get class performance overview"""
        student_ids = ClassStudent.objects.filter(
            class_id=class_obj.id
        ).values_list('student_id', flat=True)
        
        # Grade statistics
        grades = Grade.objects.filter(
            Q(assignment__material__in=materials) |
            Q(quiz__material__in=materials) |
            Q(material__in=materials),
            student_id__in=student_ids
        )
        
        avg_grade = grades.aggregate(avg=Avg('grade'))['avg'] or 0
        total_assessments = grades.count()
        
        # Grade distribution
        grade_distribution = {
            'A': grades.filter(grade__gte=90).count(),
            'B': grades.filter(grade__gte=80, grade__lt=90).count(),
            'C': grades.filter(grade__gte=70, grade__lt=80).count(),
            'D': grades.filter(grade__gte=60, grade__lt=70).count(),
            'E': grades.filter(grade__lt=60).count()
        }
        
        # Attendance statistics
        attendance_records = StudentAttendance.objects.filter(
            student_id__in=student_ids,
            material__in=materials
        )
        
        total_attendance = attendance_records.count()
        present_count = attendance_records.filter(status='present').count()
        class_attendance_rate = 0
        if total_attendance > 0:
            class_attendance_rate = round((present_count / total_attendance) * 100, 1)
        
        # Assignment statistics
        total_assignments = Assignment.objects.filter(material__in=materials).count()
        submitted_assignments = AssignmentSubmission.objects.filter(
            student_id__in=student_ids,
            assignment__material__in=materials,
            is_draft=False
        ).count()
        
        class_submission_rate = 0
        if total_assignments > 0 and len(student_ids) > 0:
            expected_submissions = total_assignments * len(student_ids)
            class_submission_rate = round((submitted_assignments / expected_submissions) * 100, 1)
        
        return {
            'total_students': len(student_ids),
            'average_grade': round(avg_grade, 1),
            'total_assessments': total_assessments,
            'grade_distribution': grade_distribution,
            'attendance_rate': class_attendance_rate,
            'submission_rate': class_submission_rate,
            'performance_trend': self.get_performance_trend(student_ids, materials)
        }
    
    def get_attendance_summary(self, class_obj, materials):
        """Get attendance summary by material"""
        student_ids = ClassStudent.objects.filter(
            class_id=class_obj.id
        ).values_list('student_id', flat=True)
        
        attendance_by_material = []
        
        for material in materials:
            attendance_records = StudentAttendance.objects.filter(
                student_id__in=student_ids,
                material=material
            )
            
            total = attendance_records.count()
            present = attendance_records.filter(status='present').count()
            absent = attendance_records.filter(status='absent').count()
            late = attendance_records.filter(status='late').count()
            excused = attendance_records.filter(status='excused').count()
            
            rate = 0
            if total > 0:
                rate = round((present / total) * 100, 1)
            
            attendance_by_material.append({
                'material_id': material.id,
                'material_name': material.title,
                'subject_name': material.subject.name,
                'total_records': total,
                'present_count': present,
                'absent_count': absent,
                'late_count': late,
                'excused_count': excused,
                'attendance_rate': rate
            })
        
        return attendance_by_material
    
    def get_recent_activities(self, class_obj, materials):
        """Get recent activities from students in this class"""
        student_ids = ClassStudent.objects.filter(
            class_id=class_obj.id
        ).values_list('student_id', flat=True)
        
        activities = StudentActivity.objects.filter(
            student_id__in=student_ids
        ).order_by('-timestamp')[:10]
        
        activities_data = []
        for activity in activities:
            activities_data.append({
                'student_name': f"{activity.student.first_name} {activity.student.last_name}".strip() or activity.student.username,
                'activity_type': activity.activity_type,
                'title': activity.title,
                'timestamp': activity.timestamp.isoformat()
            })
        
        return activities_data
    
    def get_assignment_statistics(self, class_obj, materials):
        """Get assignment statistics"""
        student_ids = ClassStudent.objects.filter(
            class_id=class_obj.id
        ).values_list('student_id', flat=True)
        
        assignments = Assignment.objects.filter(material__in=materials)
        total_assignments = assignments.count()
        
        # Submissions statistics
        submissions = AssignmentSubmission.objects.filter(
            assignment__material__in=materials,
            student_id__in=student_ids,
            is_draft=False
        )
        
        total_submissions = submissions.count()
        graded_submissions = submissions.filter(grade__isnull=False).count()
        pending_submissions = submissions.filter(grade__isnull=True).count()
        
        avg_submission_grade = submissions.filter(
            grade__isnull=False
        ).aggregate(avg=Avg('grade'))['avg'] or 0
        
        return {
            'total_assignments': total_assignments,
            'total_submissions': total_submissions,
            'graded_submissions': graded_submissions,
            'pending_submissions': pending_submissions,
            'average_submission_grade': round(avg_submission_grade, 1)
        }
    
    def get_quiz_statistics(self, class_obj, materials):
        """Get quiz statistics"""
        student_ids = ClassStudent.objects.filter(
            class_id=class_obj.id
        ).values_list('student_id', flat=True)
        
        quizzes = Quiz.objects.filter(material__in=materials)
        total_quizzes = quizzes.count()
        
        # Group quiz results
        group_quiz_results = GroupQuizResult.objects.filter(
            group_quiz__quiz__material__in=materials,
            group_quiz__group__groupmember__student_id__in=student_ids
        ).distinct()
        
        total_attempts = group_quiz_results.count()
        avg_quiz_score = group_quiz_results.aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        return {
            'total_quizzes': total_quizzes,
            'total_attempts': total_attempts,
            'average_quiz_score': round(avg_quiz_score, 1)
        }
    
    def get_performance_trend(self, student_ids, materials):
        """Get performance trend over last 30 days"""
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Get grades from last 30 days grouped by week
        weekly_grades = []
        for i in range(4):  # 4 weeks
            week_start = thirty_days_ago + timedelta(weeks=i)
            week_end = week_start + timedelta(weeks=1)
            
            week_grades = Grade.objects.filter(
                (
                    Q(assignment__material__in=materials) |
                    Q(quiz__material__in=materials) |
                    Q(material__in=materials)
                ),
                student_id__in=student_ids,
                date__gte=week_start,
                date__lt=week_end
            ).aggregate(avg=Avg('grade'))['avg'] or 0
            
            weekly_grades.append({
                'week': i + 1,
                'average_grade': round(week_grades, 1)
            })
        
        return weekly_grades
    
    def get_student_performance_status(self, avg_grade, attendance_rate, submission_rate):
        """Get student performance status"""
        # Calculate overall score based on weighted average
        overall_score = (avg_grade * 0.5) + (attendance_rate * 0.3) + (submission_rate * 0.2)
        
        if overall_score >= 85:
            return {'status': 'excellent', 'color': '#52c41a', 'text': 'Sangat Baik'}
        elif overall_score >= 75:
            return {'status': 'good', 'color': '#1890ff', 'text': 'Baik'}
        elif overall_score >= 65:
            return {'status': 'average', 'color': '#faad14', 'text': 'Cukup'}
        else:
            return {'status': 'needs_improvement', 'color': '#ff4d4f', 'text': 'Perlu Perbaikan'}