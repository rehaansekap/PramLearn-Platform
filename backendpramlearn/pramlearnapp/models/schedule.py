from django.db import models
from .classes import Class
from .subject import Subject


class Schedule(models.Model):
    """
    Jadwal pelajaran untuk kelas tertentu pada hari tertentu.
    """
    DAY_CHOICES = [
        (0, 'Senin'),
        (1, 'Selasa'),
        (2, 'Rabu'),
        (3, 'Kamis'),
        (4, 'Jumat'),
        (5, 'Sabtu'),
        (6, 'Minggu'),
    ]
    class_obj = models.ForeignKey(
        Class, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    time = models.TimeField()

    def __str__(self):
        return f"{self.class_obj.name} - {self.subject.name} ({self.get_day_of_week_display()} {self.time})"
