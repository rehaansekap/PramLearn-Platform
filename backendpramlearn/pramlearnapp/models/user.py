from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    """
    Model yang merepresentasikan peran pengguna.
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    """
    Model pengguna khusus yang memperluas model pengguna default Django.
    """
    role = models.ForeignKey(
        Role, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)  # Tambahkan field ini
    last_activity = models.DateTimeField(
        null=True, blank=True)  # Tambahkan field ini

    def __str__(self):
        return self.username


class StudentMotivationProfile(models.Model):
    """
    Model untuk menyimpan profil tingkat motivasi siswa.
    """
    student = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    attention = models.FloatField(null=True, blank=True)
    relevance = models.FloatField(null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    satisfaction = models.FloatField(null=True, blank=True)
    motivation_level = models.CharField(max_length=10, choices=[
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High')
    ], default='Medium')

    def __str__(self):
        return f"{self.student.username} - {self.motivation_level}"
