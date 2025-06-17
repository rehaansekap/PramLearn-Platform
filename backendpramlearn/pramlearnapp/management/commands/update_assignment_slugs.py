from django.core.management.base import BaseCommand
from pramlearnapp.models import Assignment
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Update all assignments to have proper slugs'

    def handle(self, *args, **options):
        assignments = Assignment.objects.all()
        updated_count = 0

        for assignment in assignments:
            if not assignment.slug:
                assignment.slug = slugify(assignment.title)
                # Handle duplicate slugs
                original_slug = assignment.slug
                counter = 1
                while Assignment.objects.filter(slug=assignment.slug).exclude(id=assignment.id).exists():
                    assignment.slug = f"{original_slug}-{counter}"
                    counter += 1
                assignment.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated {assignment.title} -> {assignment.slug}")
                )
                updated_count += 1
            else:
                self.stdout.write(
                    f"Already has slug: {assignment.title} -> {assignment.slug}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully updated {updated_count} assignments")
        )
