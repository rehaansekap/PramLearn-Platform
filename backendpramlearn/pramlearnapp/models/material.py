from django.db import models
from .subject import SubjectClass, Subject
from django.utils.text import slugify
from django.core.exceptions import ValidationError


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
