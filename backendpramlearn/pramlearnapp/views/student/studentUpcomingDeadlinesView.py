from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from pramlearnapp.models import (
    Assignment, Quiz, GroupQuiz, ClassStudent, SubjectClass, Subject, Material,
    AssignmentSubmission, StudentQuizAttempt
)


class StudentUpcomingDeadlinesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get student's classes
        student_classes = ClassStudent.objects.filter(
            student=user).values_list('class_id', flat=True)

        now = timezone.now()
        next_month = now + timedelta(days=30)

        # Ambil subject_class yang diikuti student
        subject_class_ids = SubjectClass.objects.filter(
            class_id__in=student_classes
        ).values_list('id', flat=True)

        # Ambil subject yang subject_class-nya ada di atas
        subject_ids = Subject.objects.filter(
            subject_class_id__in=subject_class_ids
        ).values_list('id', flat=True)

        # Ambil material dari subject di atas
        material_ids = Material.objects.filter(
            subject_id__in=subject_ids
        ).values_list('id', flat=True)

        # --- ASSIGNMENT: hanya yang BELUM submit ---
        submitted_assignment_ids = set(AssignmentSubmission.objects.filter(
            student=user
        ).values_list('assignment_id', flat=True))

        assignments = Assignment.objects.filter(
            material_id__in=material_ids,
            due_date__gte=now,
            due_date__lte=next_month
        ).select_related('material').order_by('due_date')[:10]

        assignment_deadlines = []
        for assignment in assignments:
            is_submitted = assignment.id in submitted_assignment_ids
            days_left = (assignment.due_date - now).days
            assignment_deadlines.append({
                'id': assignment.id,
                'title': assignment.title,
                'type': 'assignment',
                'due_date': assignment.due_date,
                'days_left': max(0, days_left),
                'subject': assignment.material.subject.name if assignment.material.subject else 'Unknown',
                'material': assignment.material.title,
                'is_overdue': assignment.due_date < now,
                'priority': 'high' if days_left <= 1 else 'medium' if days_left <= 3 else 'normal',
                'description': assignment.description if hasattr(assignment, 'description') else '',
                'is_submitted': is_submitted,
            })

        # --- QUIZ: cek submit ---
        submitted_quiz_ids = set(StudentQuizAttempt.objects.filter(
            student=user,
            submitted_at__isnull=False
        ).values_list('quiz_id', flat=True))

        group_quiz_qs = GroupQuiz.objects.filter(
            group__groupmember__student=user,
            start_time__lte=next_month
        ).select_related('quiz', 'quiz__material', 'group').order_by('start_time')

        quiz_deadline_list = []
        for group_quiz in group_quiz_qs:
            is_submitted = group_quiz.quiz.id in submitted_quiz_ids
            estimated_deadline = group_quiz.end_time or (
                group_quiz.start_time + timedelta(days=7))
            days_left = (estimated_deadline - now).days
            quiz_deadline_list.append({
                'id': group_quiz.quiz.id,
                'title': group_quiz.quiz.title,
                'type': 'quiz',
                'due_date': estimated_deadline,
                'days_left': max(0, days_left),
                'subject': group_quiz.quiz.material.subject.name if group_quiz.quiz.material.subject else 'Unknown',
                'material': group_quiz.quiz.material.title,
                'is_overdue': estimated_deadline < now,
                'priority': 'high' if days_left <= 1 else 'medium' if days_left <= 3 else 'normal',
                'group_name': group_quiz.group.name,
                'description': group_quiz.quiz.content if hasattr(group_quiz.quiz, 'content') else '',
                'is_submitted': is_submitted,
            })

        # Gabungkan dan urutkan
        all_deadlines = assignment_deadlines + quiz_deadline_list
        all_deadlines.sort(key=lambda x: x['due_date'])

        # Ambil hanya 8 terdekat
        upcoming_deadlines = all_deadlines[:8]

        return Response({
            'upcoming_deadlines': upcoming_deadlines,
            'total_count': len(all_deadlines),
            'overdue_count': len([d for d in all_deadlines if d['is_overdue']]),
            'high_priority_count': len([d for d in upcoming_deadlines if d['priority'] == 'high'])
        })
