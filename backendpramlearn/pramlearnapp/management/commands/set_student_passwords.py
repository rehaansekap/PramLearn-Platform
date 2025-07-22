from django.core.management.base import BaseCommand
from pramlearnapp.models import CustomUser
import string
import random


class Command(BaseCommand):
    help = "Set random 5-character passwords for all students"

    def generate_random_password(self, length=5):
        """Generate random password dengan panjang tertentu"""
        characters = string.ascii_lowercase + string.digits
        return "".join(random.choice(characters) for _ in range(length))

    def handle(self, *args, **options):
        # Get all student users (role = 3)
        students = CustomUser.objects.filter(role=3)

        self.stdout.write("\n📝 SETTING STUDENT PASSWORDS:")
        self.stdout.write("=" * 70)

        student_data = []

        for student in students:
            # Generate random password 5 karakter
            random_password = self.generate_random_password(5)

            # Set password
            student.set_password(random_password)
            student.save()

            # Get full name
            full_name = f"{student.first_name} {student.last_name}".strip()

            student_data.append(
                {
                    "name": full_name,
                    "username": student.username,
                    "password": random_password,
                }
            )

            self.stdout.write(
                f"Name: {full_name:<35} Username: {student.username:<20} Password: {random_password}"
            )

        # Save passwords to file for reference
        with open("student_passwords.txt", "w", encoding="utf-8") as f:
            f.write("STUDENT LOGIN CREDENTIALS - XI TJ 2\n")
            f.write("=" * 70 + "\n")
            f.write(f"{'NAMA':<35} {'USERNAME':<20} {'PASSWORD'}\n")
            f.write("-" * 70 + "\n")
            for data in student_data:
                f.write(
                    f"{data['name']:<35} {data['username']:<20} {data['password']}\n"
                )

        self.stdout.write("=" * 70)
        self.stdout.write(f"✅ Passwords set for {len(students)} students")
        self.stdout.write("💾 Passwords saved to: student_passwords.txt")
