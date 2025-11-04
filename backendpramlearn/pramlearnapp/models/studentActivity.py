from django.db import models
from .user import CustomUser


class StudentActivity(models.Model):
    """
    Aktivitas siswa (membuka materi, mengumpulkan tugas, dll).
    """
    ACTIVITY_TYPE_CHOICES = [
        ('material', 'Material'),
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        # Tambahkan tipe lain jika perlu
    ]
    student = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(
        max_length=20, choices=ACTIVITY_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    # description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    # opsional, untuk relasi ke materi/tugas/quiz
    related_object_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.activity_type} - {self.title}"
