from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.permissions import IsStudentUser
from pramlearnapp.models import ClassStudent, Subject, SubjectClass, Material, CustomUser, StudentMaterialProgress
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

            for m in materials:
                # Cek progress material untuk student ini
                try:
                    progress = StudentMaterialProgress.objects.get(
                        student=user,
                        material=m
                    )
                    completed = progress.is_completed
                    last_accessed = progress.updated_at
                except StudentMaterialProgress.DoesNotExist:
                    completed = False
                    last_accessed = None

                material_list.append({
                    "id": m.id,
                    "title": m.title,
                    "slug": m.slug,
                    "description": getattr(m, "content", "")[:60] if hasattr(m, "content") else "",
                    "completed": completed,
                    "last_accessed": last_accessed.isoformat() if last_accessed else None,
                })

                if completed:
                    completed_count += 1

                # Track material terakhir diakses
                if last_accessed and (not last_accessed_material or last_accessed > last_accessed_material['last_accessed']):
                    last_accessed_material = {
                        'title': m.title,
                        'slug': m.slug,
                        'last_accessed': last_accessed
                    }

            # Hitung progress subject
            progress = int((completed_count / len(material_list))
                           * 100) if material_list else 0

            # Ambil nama guru dari subject (pastikan ada relasi teacher pada model Subject)
            teacher_name = subject.teacher.get_full_name() if hasattr(
                subject, "teacher") and subject.teacher else None

            data.append({
                "id": subject.id,
                "name": subject.name,
                "teacher_name": teacher_name,
                "progress": progress,
                "material_count": len(material_list),
                "last_material_title": last_accessed_material['title'] if last_accessed_material else None,
                "last_material_slug": last_accessed_material['slug'] if last_accessed_material else None,
                "materials": material_list,
            })

        return Response(data)
