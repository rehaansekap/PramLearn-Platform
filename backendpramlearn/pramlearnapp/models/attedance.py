from django.db import models
from .user import CustomUser
from .material import Material


class StudentAttendance(models.Model):
    """
    Model untuk kehadiran siswa pada material tertentu
    """
    ATTENDANCE_CHOICES = [
        ('present', 'Hadir'),
        ('absent', 'Tidak Hadir'),
        ('late', 'Terlambat'),
        ('excused', 'Izin'),
    ]

    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10, choices=ATTENDANCE_CHOICES, default='absent')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_updates'
    )

    class Meta:
        unique_together = ('student', 'material')

    def __str__(self):
        return f"{self.student.username} - {self.material.title} - {self.status}"
