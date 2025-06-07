from django.db import models
from .subject import SubjectClass, Subject
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db.models.signals import m2m_changed, post_save, post_delete
from django.dispatch import receiver


User = get_user_model()


class File(models.Model):
    file = models.FileField(upload_to='materials/files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


class Material(models.Model):
    title = models.CharField(max_length=255)
    pdf_files = models.ManyToManyField(File, blank=True)
    google_form_embed_arcs_awal = models.URLField(blank=True, null=True)
    google_form_embed_arcs_akhir = models.URLField(blank=True, null=True)
    google_form_embed = models.TextField(blank=True, null=True)
    subject = models.ForeignKey(
        Subject, related_name='materials', on_delete=models.CASCADE)
    slug = models.SlugField(unique=True, blank=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        else:
            try:
                existing_material = Material.objects.get(pk=self.pk)
                if self.title != existing_material.title:
                    self.slug = slugify(self.title)
            except Material.DoesNotExist:
                self.slug = slugify(self.title)

        if Material.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            raise ValidationError(
                f"Material with slug '{self.slug}' already exists.")
        super().save(*args, **kwargs)


class MaterialYoutubeVideo(models.Model):
    material = models.ForeignKey(
        Material, related_name="youtube_videos", on_delete=models.CASCADE)
    url = models.URLField(max_length=500)

    def __str__(self):
        return self.url


class StudentMaterialProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    completion_percentage = models.FloatField(default=0.0)
    time_spent = models.IntegerField(default=0)  # dalam detik
    last_position = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'material']

    @property
    def is_completed(self):
        return self.completion_percentage >= 100


class StudentMaterialBookmark(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=50)  # 'pdf', 'video', 'form'
    position = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'material', 'content_type', 'position']


class StudentMaterialActivity(models.Model):
    """Track specific activities done by student"""
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    # 'pdf_opened', 'video_played'
    activity_type = models.CharField(max_length=50)
    content_index = models.IntegerField()  # Index PDF/Video yang dibuka
    content_id = models.CharField(
        max_length=100, blank=True)  # Optional: ID spesifik
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'material',
                           'activity_type', 'content_id']

    def __str__(self):
        return f"{self.student.username} - {self.activity_type} - {self.content_index}"


def recalculate_all_student_progress(material):
    from .material import StudentMaterialProgress, StudentMaterialActivity

    total_pdfs = material.pdf_files.count()
    total_videos = material.youtube_videos.count()
    total_components = total_pdfs + total_videos
    if total_components == 0:
        return

    progresses = StudentMaterialProgress.objects.filter(material=material)
    for progress in progresses:
        student = progress.student
        # Hitung aktivitas unik yang sudah dilakukan (pdf_opened dan video_played)
        pdf_acts = StudentMaterialActivity.objects.filter(
            student=student,
            material=material,
            activity_type="pdf_opened"
        ).values_list("content_id", flat=True).distinct()
        video_acts = StudentMaterialActivity.objects.filter(
            student=student,
            material=material,
            activity_type="video_played"
        ).values_list("content_id", flat=True).distinct()
        done_count = len(set(pdf_acts)) + len(set(video_acts))
        progress.completion_percentage = (done_count / total_components) * 100
        progress.save(update_fields=["completion_percentage", "updated_at"])


# Trigger saat PDF/video materi berubah
@receiver(m2m_changed, sender=Material.pdf_files.through)
def pdf_files_changed(sender, instance, **kwargs):
    recalculate_all_student_progress(instance)


@receiver(post_save, sender=MaterialYoutubeVideo)
@receiver(post_delete, sender=MaterialYoutubeVideo)
def youtube_videos_changed(sender, instance, **kwargs):
    recalculate_all_student_progress(instance.material)


@receiver(post_save, sender=Material)
def material_updated(sender, instance, **kwargs):
    recalculate_all_student_progress(instance)
