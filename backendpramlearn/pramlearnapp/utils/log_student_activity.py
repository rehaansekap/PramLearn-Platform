from pramlearnapp.models.studentActivity import StudentActivity
from django.utils import timezone


def log_student_activity(student, title, description, type_):
    StudentActivity.objects.create(
        student=student,
        title=title,
        description=description,
        type=type_,
        timestamp=timezone.now(),
    )
