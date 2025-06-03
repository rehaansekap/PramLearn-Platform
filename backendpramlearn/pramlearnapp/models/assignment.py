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

    def __str__(self):
        return self.title


class AssignmentQuestion(models.Model):
    """
    Model untuk soal pilihan ganda pada assignment.
    """
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    choice_a = models.CharField(max_length=255)
    choice_b = models.CharField(max_length=255)
    choice_c = models.CharField(max_length=255)
    choice_d = models.CharField(max_length=255)
    correct_choice = models.CharField(
        max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]
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

    # Relasi ke AssignmentAnswer (jawaban pilihan ganda)
    # answers = related_name pada AssignmentAnswer

    def __str__(self):
        return f"{self.assignment.title} - {self.student.username}"

    def calculate_and_save_grade(self):
        total_questions = self.assignment.questions.count()
        correct_answers = self.answers.filter(is_correct=True).count()
        self.grade = (correct_answers / total_questions) * \
            100 if total_questions > 0 else 0
        self.save()


class AssignmentAnswer(models.Model):
    """
    Model untuk jawaban siswa pada soal pilihan ganda assignment.
    """
    submission = models.ForeignKey(
        AssignmentSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE)
    selected_choice = models.CharField(
        max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    is_correct = models.BooleanField()

    def save(self, *args, **kwargs):
        self.is_correct = self.selected_choice == self.question.correct_choice
        super().save(*args, **kwargs)


@receiver([post_save, post_delete], sender=AssignmentQuestion)
def recalculate_grades_on_question_change(sender, instance, **kwargs):
    assignment = instance.assignment
    submissions = assignment.assignmentsubmission_set.all()
    for submission in submissions:
        submission.calculate_and_save_grade()
