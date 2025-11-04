from django.db import models
from .subject import SubjectClass
from .material import Material
from .user import CustomUser  # Adjust the import path based on your project structure
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class Quiz(models.Model):
    """
    Model yang merepresentasikan kuis.
    """
    material = models.ForeignKey(
        Material, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_group_quiz = models.BooleanField(default=False)
    end_time = models.DateTimeField(null=True, blank=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    duration = models.PositiveIntegerField(
        default=0, help_text="Durasi quiz dalam menit")
    is_active = models.BooleanField(default=True, help_text="Quiz aktif/non-aktif")

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure unique slug
            original_slug = self.slug
            counter = 1
            while Quiz.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)


class Question(models.Model):
    """
    Model yang merepresentasikan soal kuis.
    """
    quiz = models.ForeignKey(
        Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    choice_a = models.CharField(max_length=255)
    choice_b = models.CharField(max_length=255)
    choice_c = models.CharField(max_length=255)
    choice_d = models.CharField(max_length=255)
    correct_choice = models.CharField(
        max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])

    def __str__(self):
        return self.text


class StudentQuizAttempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ['student', 'quiz']
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title}"


class StudentQuizAnswer(models.Model):
    ANSWER_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ]

    attempt = models.ForeignKey(
        StudentQuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['attempt', 'question']
        ordering = ['question__id']

    def __str__(self):
        return f"{self.attempt.student.username} - Q{self.question.id}: {self.selected_answer}"
