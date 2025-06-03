from django.db import models
from django.utils.text import slugify
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .user import CustomUser
from .subject import SubjectClass, Subject


class Class(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Jika objek baru (self.pk belum ada), buat slug langsung
        if not self.pk or not self.slug:
            self.slug = slugify(self.name)
        else:
            # Jika objek sudah ada, cek apakah nama berubah
            existing_class = Class.objects.filter(pk=self.pk).first()
            if existing_class and existing_class.name != self.name:
                self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ClassStudent(models.Model):
    """
    Model yang merepresentasikan hubungan antara siswa dan kelas.
    """
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student.username} - {self.class_id.name}"


@receiver(post_delete, sender=Class)
def delete_related_subject_classes(sender, instance, **kwargs):
    subject_classes = SubjectClass.objects.filter(class_id=instance)
    for subject_class in subject_classes:
        subjects = Subject.objects.filter(subject_class=subject_class)
        for subject in subjects:
            subject.delete()
        subject_class.delete()
