from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .subject import SubjectClass
from .user import CustomUser
from .material import Material
from .group import GroupQuiz, GroupQuizSubmission, GroupQuizResult


class Assignment(models.Model):
    """
    Model yang merepresentasikan tugas.
    """
    material = models.ForeignKey(
        Material, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)  # Add this field
    updated_at = models.DateTimeField(auto_now=True)      # Add this field
    slug = models.SlugField(unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
            # Handle duplicate slugs
            original_slug = self.slug
            counter = 1
            while Assignment.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

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
    explanation = models.TextField(blank=True, null=True)
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
    is_draft = models.BooleanField(default=True)  # Tambahkan field ini
    start_time = models.DateTimeField(
        null=True, blank=True)  # Tambah field ini
    end_time = models.DateTimeField(
        null=True, blank=True)  # Tambah field ini

    def __str__(self):
        return f"{self.assignment.title} - {self.student.username}"

    def calculate_and_save_score(self):
        """Calculate and save the assignment score based on correct answers"""
        from django.utils import timezone

        # Get all questions for this assignment
        questions = self.assignment.questions.all()
        total_questions = questions.count()

        if total_questions == 0:
            self.grade = 0
        else:
            # Get all answers for this submission
            answers = self.answers.all()
            correct_count = 0

            for answer in answers:
                # For multiple choice questions
                if answer.selected_choice and answer.question.correct_choice:
                    if answer.selected_choice.upper() == answer.question.correct_choice.upper():
                        correct_count += 1
                        answer.is_correct = True
                    else:
                        answer.is_correct = False
                    answer.save()
                # For essay questions, grade is set manually by teacher
                # so we don't auto-calculate here

            # Calculate percentage score
            self.grade = (correct_count / total_questions) * 100

        # Update graded timestamp
        self.graded_at = timezone.now()
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
    essay_answer = models.TextField(blank=True, null=True)  # For essay answers

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
