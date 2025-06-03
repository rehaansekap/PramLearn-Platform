from django.db import models
from django.utils.text import slugify
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .user import CustomUser


class Subject(models.Model):
    """
    Model yang merepresentasikan mata pelajaran.
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    subject_class = models.ForeignKey(
        'SubjectClass', on_delete=models.SET_NULL, null=True, blank=True, related_name='subjects')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class SubjectClass(models.Model):
    """
    Model yang merepresentasikan hubungan antara Subject dan Class.
    """
    subject = models.ForeignKey(
        'Subject', on_delete=models.SET_NULL, related_name='subject_classes', null=True, blank=True)
    class_id = models.ForeignKey('Class', on_delete=models.CASCADE)
    teacher = models.ForeignKey('CustomUser', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.class_id} - {self.subject.name} - {self.teacher.username}"


@receiver(post_delete, sender=Subject)
def delete_subject_class(sender, instance, **kwargs):
    try:
        subject_class = instance.subject_class
        if subject_class:
            subject_class.delete()
    except SubjectClass.DoesNotExist:
        pass
