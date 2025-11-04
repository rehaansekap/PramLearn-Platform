from django.db import models
from .material import Material
from .user import CustomUser
from django.utils.text import slugify
from django.utils import timezone
import uuid


class ARCSQuestionnaire(models.Model):
    """
    Model untuk kuesioner ARCS yang dibuat oleh teacher
    """

    QUESTIONNAIRE_TYPES = [
        ("pre", "Pre-Assessment"),
        ("post", "Post-Assessment"),
    ]

    material = models.ForeignKey(
        Material, on_delete=models.CASCADE, related_name="arcs_questionnaires"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    questionnaire_type = models.CharField(max_length=10, choices=QUESTIONNAIRE_TYPES)
    is_active = models.BooleanField(default=True)

    start_date = models.DateTimeField(
        null=True, blank=True, help_text="Waktu mulai kuesioner dapat diisi"
    )
    end_date = models.DateTimeField(
        null=True, blank=True, help_text="Batas waktu pengisian kuesioner"
    )
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True, help_text="Durasi maksimal pengisian dalam menit"
    )

    created_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="created_arcs_questionnaires"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.title}-{self.questionnaire_type}")
            unique_id = uuid.uuid4().hex[:8]
            self.slug = f"{base_slug}-{unique_id}"
            counter = 1
            while ARCSQuestionnaire.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{unique_id}-{counter}"
                counter += 1

        super().save(*args, **kwargs)

    @property
    def is_available_for_submission(self):
        now = timezone.now()
        now = timezone.now()

        # Check if active
        if not self.is_active:
            return False, "Kuesioner tidak aktif"

        # Check start date
        if self.start_date and now < self.start_date:
            return (
                False,
                f"Kuesioner akan tersedia pada {self.start_date.strftime('%d/%m/%Y %H:%M')}",
            )

        # Check end date
        if self.end_date and now > self.end_date:
            return (
                False,
                f"Kuesioner telah berakhir pada {self.end_date.strftime('%d/%m/%Y %H:%M')}",
            )

        return True, "Tersedia"

    @property
    def time_remaining(self):
        """Get remaining time in minutes"""
        if not self.end_date:
            return None

        now = timezone.now()

        if now > self.end_date:
            return 0

        delta = self.end_date - now
        return int(delta.total_seconds() / 60)

    def __str__(self):
        return f"{self.title} ({self.get_questionnaire_type_display()})"

    class Meta:
        ordering = ["-created_at"]


class ARCSQuestion(models.Model):
    """
    Model untuk pertanyaan dalam kuesioner ARCS
    """

    ARCS_DIMENSIONS = [
        ("attention", "Attention"),
        ("relevance", "Relevance"),
        ("confidence", "Confidence"),
        ("satisfaction", "Satisfaction"),
    ]

    QUESTION_TYPES = [
        ("likert_5", "Likert Scale 1-5"),
        ("likert_7", "Likert Scale 1-7"),
        ("multiple_choice", "Multiple Choice"),
        ("text", "Text Input"),
    ]

    questionnaire = models.ForeignKey(
        ARCSQuestionnaire, on_delete=models.CASCADE, related_name="questions"
    )
    text = models.TextField()
    dimension = models.CharField(max_length=20, choices=ARCS_DIMENSIONS)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    order = models.PositiveIntegerField()
    is_required = models.BooleanField(default=True)

    # For multiple choice questions
    choice_a = models.CharField(max_length=255, blank=True, null=True)
    choice_b = models.CharField(max_length=255, blank=True, null=True)
    choice_c = models.CharField(max_length=255, blank=True, null=True)
    choice_d = models.CharField(max_length=255, blank=True, null=True)
    choice_e = models.CharField(max_length=255, blank=True, null=True)

    # For likert scale questions
    scale_min = models.IntegerField(default=1)
    scale_max = models.IntegerField(default=5)
    scale_label_min = models.CharField(max_length=100, blank=True, null=True)
    scale_label_max = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.questionnaire.title} - Q{self.order}: {self.text[:50]}"

    @property
    def choices(self):
        """Return choices for multiple choice questions"""
        if self.question_type == "multiple_choice":
            choices = []
            for choice in [
                self.choice_a,
                self.choice_b,
                self.choice_c,
                self.choice_d,
                self.choice_e,
            ]:
                if choice:
                    choices.append(choice)
            return choices
        return None

    @property
    def scale_labels(self):
        """Return scale labels for likert questions"""
        if self.question_type in ["likert_5", "likert_7"]:
            return {
                "min": self.scale_label_min or f"Sangat Tidak Setuju",
                "max": self.scale_label_max or f"Sangat Setuju",
            }
        return None

    class Meta:
        ordering = ["order"]
        unique_together = ["questionnaire", "order"]


class ARCSResponse(models.Model):
    """
    Model untuk jawaban siswa terhadap kuesioner ARCS
    """

    questionnaire = models.ForeignKey(
        ARCSQuestionnaire, on_delete=models.CASCADE, related_name="responses"
    )
    student = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="arcs_responses"
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.username} - {self.questionnaire.title}"

    class Meta:
        unique_together = ["questionnaire", "student"]


class ARCSAnswer(models.Model):
    """
    Model untuk jawaban spesifik terhadap pertanyaan ARCS
    """

    response = models.ForeignKey(
        ARCSResponse, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(ARCSQuestion, on_delete=models.CASCADE)
    # For different answer types
    likert_value = models.IntegerField(null=True, blank=True)  # 1-5 or 1-7
    choice_value = models.CharField(
        max_length=1, null=True, blank=True
    )  # A, B, C, D, E
    text_value = models.TextField(null=True, blank=True)

    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.response.student.username} - Q{self.question.order}"

    class Meta:
        unique_together = ["response", "question"]
