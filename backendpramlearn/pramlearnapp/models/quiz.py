from django.db import models
from .subject import SubjectClass
from .material import Material
from .user import CustomUser  # Adjust the import path based on your project structure


class Quiz(models.Model):
    """
    Model yang merepresentasikan kuis.
    """
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    # Menentukan apakah kuis dikerjakan berkelompok atau mandiri
    is_group_quiz = models.BooleanField(default=False)

    def __str__(self):
        return self.title


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
