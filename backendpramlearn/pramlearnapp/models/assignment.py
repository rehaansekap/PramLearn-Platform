from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .subject import SubjectClass
from .user import CustomUser
from .material import Material


class Assignment(models.Model):
    """
    Model yang merepresentasikan tugas.
    """
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)  # Add this field
    updated_at = models.DateTimeField(auto_now=True)      # Add this field

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['due_date']


class AssignmentQuestion(models.Model):
    """
    Model untuk soal pilihan ganda pada assignment.
    """
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='questions'  # This creates Assignment.questions
    )
    text = models.TextField()
    choice_a = models.CharField(max_length=255, blank=True, null=True)
    choice_b = models.CharField(max_length=255, blank=True, null=True)
    choice_c = models.CharField(max_length=255, blank=True, null=True)
    choice_d = models.CharField(max_length=255, blank=True, null=True)
    correct_choice = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        blank=True, null=True
    )

    def __str__(self):
        return self.text


class AssignmentSubmission(models.Model):
    """
    Model yang merepresentasikan pengumpulan tugas.
    """
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    submission_date = models.DateTimeField()
    grade = models.FloatField(null=True, blank=True)
    teacher_feedback = models.TextField(
        blank=True, null=True)  # Add this field
    graded_at = models.DateTimeField(null=True, blank=True)  # Add this field
    # Store uploaded file info
    files = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.assignment.title} - {self.student.username}"

    def calculate_and_save_grade(self):
        # Use 'questions' instead of 'assignmentquestion_set'
        total_questions = self.assignment.questions.count()
        if total_questions > 0:
            correct_answers = self.answers.filter(is_correct=True).count()
            self.grade = (correct_answers / total_questions) * 100
        else:
            self.grade = 0
        self.save()


class AssignmentAnswer(models.Model):
    """
    Model untuk jawaban siswa pada soal pilihan ganda assignment.
    """
    submission = models.ForeignKey(
        AssignmentSubmission,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE)
    selected_choice = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        blank=True, null=True
    )
    answer_text = models.TextField(blank=True, null=True)  # For essay answers
    is_correct = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Only check correctness for multiple choice questions
        if self.selected_choice and self.question.correct_choice:
            self.is_correct = self.selected_choice == self.question.correct_choice
        else:
            self.is_correct = False
        super().save(*args, **kwargs)


class StudentAssignmentDraft(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    draft_answers = models.JSONField(default=dict, blank=True)
    uploaded_files = models.JSONField(default=list, blank=True)
    last_saved = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'assignment']
        db_table = 'student_assignment_drafts'

    def __str__(self):
        return f"Draft - {self.student.username} - {self.assignment.title}"


@receiver([post_save, post_delete], sender=AssignmentQuestion)
def recalculate_grades_on_question_change(sender, instance, **kwargs):
    assignment = instance.assignment
    submissions = assignment.assignmentsubmission_set.all()
    for submission in submissions:
        submission.calculate_and_save_grade()
