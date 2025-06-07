from rest_framework import serializers
from pramlearnapp.models import (
    Assignment, AssignmentSubmission, StudentAssignmentDraft,
    AssignmentQuestion
)
from django.utils import timezone


class StudentAssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(
        source='material.subject.name', read_only=True)
    subject_id = serializers.IntegerField(
        source='material.subject.id', read_only=True)
    material_title = serializers.CharField(
        source='material.title', read_only=True)
    questions_count = serializers.SerializerMethodField()
    submission_status = serializers.SerializerMethodField()
    student_grade = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'due_date', 'created_at', 'updated_at',
            'subject_name', 'subject_id', 'material_title', 'questions_count',
            'submission_status', 'student_grade', 'is_overdue', 'time_remaining'
        ]

    def get_questions_count(self, obj):
        """Get total number of questions for this assignment"""
        return obj.questions.count()

    def get_submission_status(self, obj):
        """Get submission status for current student"""
        student = self.context.get('student')
        if not student:
            return 'not_submitted'

        try:
            submission = AssignmentSubmission.objects.get(
                assignment=obj,
                student=student
            )
            if submission.grade is not None:
                return 'graded'
            return 'submitted'
        except AssignmentSubmission.DoesNotExist:
            # Check if overdue
            if timezone.now() > obj.due_date:
                return 'overdue'
            return 'available'

    def get_student_grade(self, obj):
        """Get student's grade for this assignment"""
        student = self.context.get('student')
        if not student:
            return None

        try:
            submission = AssignmentSubmission.objects.get(
                assignment=obj,
                student=student
            )
            return submission.grade
        except AssignmentSubmission.DoesNotExist:
            return None

    def get_is_overdue(self, obj):
        """Check if assignment is overdue"""
        return timezone.now() > obj.due_date

    def get_time_remaining(self, obj):
        """Get time remaining until due date"""
        now = timezone.now()
        if now > obj.due_date:
            return None

        time_diff = obj.due_date - now
        days = time_diff.days
        hours = time_diff.seconds // 3600

        if days > 0:
            return f"{days} days"
        elif hours > 0:
            return f"{hours} hours"
        else:
            return "Due soon"


class StudentAssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(
        source='assignment.title', read_only=True)
    student_name = serializers.SerializerMethodField()
    answers_data = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'submission_date', 'grade', 'teacher_feedback', 'graded_at',
            'files', 'answers_data'
        ]

    def get_student_name(self, obj):
        """Get student full name or username"""
        if obj.student.first_name and obj.student.last_name:
            return f"{obj.student.first_name} {obj.student.last_name}"
        return obj.student.username

    def get_answers_data(self, obj):
        """Get all answers for this submission"""
        answers = obj.answers.select_related('question').all()
        return [{
            'question_id': answer.question.id,
            'question_text': answer.question.text,
            'selected_choice': answer.selected_choice,
            'answer_text': answer.answer_text,
            'is_correct': answer.is_correct,
            'correct_choice': answer.question.correct_choice
        } for answer in answers]


class StudentAssignmentDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAssignmentDraft
        fields = ['draft_answers', 'uploaded_files',
                  'last_saved', 'created_at']
