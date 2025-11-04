from django.core.management.base import BaseCommand
from pramlearnapp.models import CustomUser
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = 'Change password for all users to "123"'

    def handle(self, *args, **options):
        # Bulk update semua user sekaligus
        hashed_password = make_password("123")
        updated_count = CustomUser.objects.update(password=hashed_password)

        self.stdout.write(
            self.style.SUCCESS(f"Password berhasil diubah untuk {updated_count} users")
        )
