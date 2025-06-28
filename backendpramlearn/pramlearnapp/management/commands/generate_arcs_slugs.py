from django.core.management.base import BaseCommand
from pramlearnapp.models.arcs_questionnaire import ARCSQuestionnaire
from django.utils.text import slugify
from django.db import models
import uuid


class Command(BaseCommand):
    help = "Generate slugs for existing ARCS questionnaires"

    def handle(self, *args, **options):
        questionnaires = ARCSQuestionnaire.objects.filter(
            models.Q(slug__isnull=True) | models.Q(slug="")
        )
        count = 0

        for questionnaire in questionnaires:
            # Generate slug manually for existing data
            base_slug = slugify(
                f"{questionnaire.title}-{questionnaire.questionnaire_type}"
            )
            unique_id = uuid.uuid4().hex[:8]
            questionnaire.slug = f"{base_slug}-{unique_id}"

            # Ensure unique
            counter = 1
            while ARCSQuestionnaire.objects.filter(slug=questionnaire.slug).exists():
                questionnaire.slug = f"{base_slug}-{unique_id}-{counter}"
                counter += 1

            questionnaire.save()
            count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully generated slugs for {count} questionnaires"
            )
        )
