import os
import django
import json
import random
from django.utils.text import slugify
from faker import Faker
from datetime import timezone, datetime
import logging
logging.getLogger('faker.factory').setLevel(logging.ERROR)

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()

fake = Faker()


def generate_roles():
    """Generate roles sesuai dengan Role model"""
    roles = [
        {"model": "pramlearnapp.role", "pk": 1, "fields": {
            "name": "Admin", "description": "Administrator with full access"}},
        {"model": "pramlearnapp.role", "pk": 2, "fields": {
            "name": "Teacher", "description": "Teacher with limited access"}},
        {"model": "pramlearnapp.role", "pk": 3, "fields": {
            "name": "Student", "description": "Student with view access"}}
    ]
    return roles


def generate_users(num_admins, num_teachers, num_students):
    """Generate users dengan fields yang benar dari CustomUser model"""
    users = []

    # Admin users dengan pre-hashed passwords (untuk PostgreSQL juga sama)
    for i in range(1, num_admins + 1):
        users.append({
            "model": "pramlearnapp.customuser",
            "pk": i,
            "fields": {
                "username": f"admin{i}",
                "password": "pbkdf2_sha256$600000$dummy$dummy",  # Will be reset anyway
                "email": f"admin{i}@pramlearn.com",
                "first_name": f"Admin{i}",
                "last_name": "User",
                "role": 1,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "is_online": False,
                "last_activity": None
            }
        })

    # Teacher users
    for i in range(num_admins + 1, num_admins + num_teachers + 1):
        users.append({
            "model": "pramlearnapp.customuser",
            "pk": i,
            "fields": {
                "username": f"teacher{i - num_admins}",
                "password": "pbkdf2_sha256$600000$dummy$dummy",  # teacher123
                "email": f"teacher{i - num_admins}@pramlearn.com",
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "role": 2,
                "is_staff": False,
                "is_superuser": False,
                "is_active": True,
                "is_online": False,
                "last_activity": None
            }
        })

    # Student users
    for i in range(num_admins + num_teachers + 1, num_admins + num_teachers + num_students + 1):
        users.append({
            "model": "pramlearnapp.customuser",
            "pk": i,
            "fields": {
                "username": f"student{i - num_admins - num_teachers}",
                "password": "pbkdf2_sha256$600000$dummy$dummy",  # student123
                "email": f"student{i - num_admins - num_teachers}@pramlearn.com",
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "role": 3,
                "is_staff": False,
                "is_superuser": False,
                "is_active": True,
                "is_online": False,
                "last_activity": None
            }
        })

    return users

# Sisa fungsi sama seperti sebelumnya...


def generate_classes(num_classes):
    """Generate classes sesuai dengan Class model"""
    classes = []
    class_names = [
        "Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5",
        "Kelas 6", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 10",
        "Kelas 11", "Kelas 12"
    ]

    for i in range(1, min(num_classes + 1, len(class_names) + 1)):
        name = class_names[i - 1] if i <= len(class_names) else f"Kelas {i}"
        slug = slugify(name)
        classes.append({
            "model": "pramlearnapp.class",
            "pk": i,
            "fields": {
                "name": name,
                "slug": slug
            }
        })
    return classes


def generate_subjects(num_subjects):
    """Generate subjects sesuai dengan Subject model - tanpa subject_class reference"""
    subjects = []
    subject_names = [
        "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS",
        "Pendidikan Agama", "PPKN", "Seni Budaya", "Penjaskes", "Prakarya",
        "Fisika", "Kimia", "Biologi", "Sejarah", "Geografi",
        "Ekonomi", "Sosiologi", "Antropologi", "Psikologi", "Informatika"
    ]

    for i in range(1, min(num_subjects + 1, len(subject_names) + 1)):
        name = subject_names[i -
                             1] if i <= len(subject_names) else f"Subject {i}"
        slug = slugify(name)
        subjects.append({
            "model": "pramlearnapp.subject",
            "pk": i,
            "fields": {
                "name": name,
                "slug": slug,
                "subject_class": None
            }
        })
    return subjects


def generate_subject_classes(num_subject_classes, num_teachers, num_classes, num_subjects):
    """Generate subject classes sesuai dengan SubjectClass model"""
    subject_classes = []
    teacher_ids = list(range(6, 6 + num_teachers))  # Teacher IDs start from 6

    for i in range(1, num_subject_classes + 1):
        subject_classes.append({
            "model": "pramlearnapp.subjectclass",
            "pk": i,
            "fields": {
                "teacher": random.choice(teacher_ids),
                "class_id": random.randint(1, num_classes),
                "subject": random.randint(1, min(num_subjects, 20))
            }
        })
    return subject_classes


def generate_class_students(num_class_students, num_classes, num_students, num_admins, num_teachers):
    """Generate class students sesuai dengan ClassStudent model"""
    class_students = []
    student_start_id = num_admins + num_teachers + 1
    student_ids = list(
        range(student_start_id, student_start_id + num_students))
    random.shuffle(student_ids)

    for i, student_id in enumerate(student_ids[:num_class_students]):
        class_students.append({
            "model": "pramlearnapp.classstudent",
            "pk": i + 1,
            "fields": {
                "student": student_id,
                "class_id": random.randint(1, num_classes)
            }
        })
    return class_students


def main():
    """Main function untuk generate data dasar saja"""
    # Parameters - dikurangi untuk data dasar saja
    num_admins = 2
    num_teachers = 10
    num_students = 50
    num_classes = 8
    num_subject_classes = 15
    num_subjects = 20
    num_class_students = 50

    print("Generating basic initial data...")

    data = []

    # Generate hanya data dasar yang diperlukan
    print("- Generating roles...")
    data.extend(generate_roles())

    print("- Generating users...")
    data.extend(generate_users(num_admins, num_teachers, num_students))

    print("- Generating classes...")
    data.extend(generate_classes(num_classes))

    print("- Generating subjects...")
    data.extend(generate_subjects(num_subjects))

    print("- Generating subject classes...")
    data.extend(generate_subject_classes(num_subject_classes,
                num_teachers, num_classes, num_subjects))

    print("- Generating class students...")
    data.extend(generate_class_students(num_class_students,
                num_classes, num_students, num_admins, num_teachers))

    # Ensure fixtures directory exists
    os.makedirs('pramlearnapp/fixtures', exist_ok=True)

    print("- Writing to file...")
    with open('pramlearnapp/fixtures/initial_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print(f"Generated {len(data)} records successfully!")
    print("- Roles: 3")
    print(f"- Users: {num_admins + num_teachers + num_students}")
    print(f"- Classes: {num_classes}")
    print(f"- Subjects: {num_subjects}")
    print(f"- Subject Classes: {num_subject_classes}")
    print(f"- Class Students: {num_class_students}")
    print("")
    print("✓ Basic data generated successfully!")
    print("✓ Materials, Files, Assignments, Quizzes can be created manually via the application")


if __name__ == "__main__":
    main()
