from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.permissions import IsStudentUser
from pramlearnapp.models import ClassStudent, Subject, SubjectClass, Material, CustomUser, StudentMaterialProgress, Schedule
from django.db.models import Prefetch


class StudentSubjectsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request):
        user = request.user
        print("DEBUG IsStudentUser:", user, getattr(user, "role", None),
              getattr(getattr(user, "role", None), "name", None))
        # Perbaiki pengecekan role student
        is_student = False
        if hasattr(user, "role"):
            # Jika role adalah objek Role
            if hasattr(user.role, "name"):
                is_student = user.role.name.lower() == "student"
            # Jika role adalah integer
            elif isinstance(user.role, int):
                is_student = user.role == 3

        if not is_student:
            return Response({"detail": "Not authorized."}, status=403)

        # Ambil semua kelas yang diikuti student
        class_students = ClassStudent.objects.filter(student=user)
        class_ids = class_students.values_list("class_id", flat=True)

        # Ambil semua SubjectClass yang terkait dengan kelas student
        subject_classes = SubjectClass.objects.filter(class_id__in=class_ids)
        subject_ids = subject_classes.values_list(
            "subject_id", flat=True).distinct()

        # Ambil semua subject yang diikuti student
        subjects = Subject.objects.filter(id__in=subject_ids)

        data = []
        for subject in subjects:
            materials = Material.objects.filter(subject=subject)
            total_materials = materials.count()
            if total_materials == 0:
                continue

            completed_count = 0
            last_accessed_material = None
            material_list = []
            total_progress = 0  # PERBAIKAN: Tambahkan ini untuk menghitung total progress

            for m in materials:
                try:
                    progress_obj = StudentMaterialProgress.objects.get(
                        student=user,
                        material=m
                    )
                    completed = progress_obj.is_completed
                    last_accessed = progress_obj.updated_at
                    progress_percent = progress_obj.completion_percentage
                except StudentMaterialProgress.DoesNotExist:
                    completed = False
                    last_accessed = None
                    progress_percent = 0

                material_list.append({
                    "id": m.id,
                    "title": m.title,
                    "slug": m.slug,
                    "description": getattr(m, "content", "")[:60] if hasattr(m, "content") else "",
                    "completed": completed,
                    "progress": int(progress_percent),
                    "last_accessed": last_accessed.isoformat() if last_accessed else None,
                })

                # PERBAIKAN: Tambahkan progress material ke total
                total_progress += progress_percent

                if completed:
                    completed_count += 1

                # Track material terakhir diakses
                if last_accessed and (not last_accessed_material or last_accessed > last_accessed_material['last_accessed']):
                    last_accessed_material = {
                        'title': m.title,
                        'slug': m.slug,
                        'last_accessed': last_accessed
                    }

            # PERBAIKAN: Hitung progress subject berdasarkan rata-rata progress materials
            subject_progress = int(
                total_progress / len(material_list)) if material_list else 0

            print(f"📊 Subject: {subject.name}")
            print(f"📊 Materials: {len(material_list)}")
            print(f"📊 Total progress: {total_progress}")
            print(f"📊 Subject progress: {subject_progress}%")

            # Ambil nama guru dari subject (pastikan ada relasi teacher pada model Subject)
            subject_class = SubjectClass.objects.filter(
                subject=subject).first()
            teacher_name = None
            if subject_class and subject_class.teacher:
                teacher_name = subject_class.teacher.get_full_name(
                ).strip() or subject_class.teacher.username

            # Ambil jadwal untuk subject dan kelas student
            schedules = []
            subject_class = SubjectClass.objects.filter(
                subject=subject).first()
            if subject_class:
                class_obj = subject_class.class_id
                subject_schedules = Schedule.objects.filter(
                    subject=subject, class_obj=class_obj)
                for sched in subject_schedules:
                    schedules.append({
                        "day_of_week": sched.get_day_of_week_display(),
                        "time": str(sched.time)[:5],  # Format HH:MM
                    })

            data.append({
                "id": subject.id,
                "name": subject.name,
                "teacher_name": teacher_name,
                "progress": subject_progress,
                "material_count": len(material_list),
                "last_material_title": last_accessed_material['title'] if last_accessed_material else None,
                "last_material_slug": last_accessed_material['slug'] if last_accessed_material else None,
                "materials": material_list,
                "schedules": schedules,
            })

        return Response(data)
