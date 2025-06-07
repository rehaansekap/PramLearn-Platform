from django.db import models
from .user import CustomUser
from .classes import Class
from django.utils import timezone


class Announcement(models.Model):
    """
    Model untuk pengumuman/announcement
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    TARGET_AUDIENCE_CHOICES = [
        ('all', 'All Students'),
        ('class', 'Specific Class'),
        ('student', 'Specific Students'),
    ]

    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='announcements'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    target_audience = models.CharField(
        max_length=10,
        choices=TARGET_AUDIENCE_CHOICES,
        default='all'
    )
    target_class = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Set this if target_audience is 'class'"
    )
    is_active = models.BooleanField(default=True)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def author_name(self):
        return f"{self.author.first_name} {self.author.last_name}".strip() or self.author.username
