from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.permissions import IsStudentUser
from pramlearnapp.models import ClassStudent, Subject, SubjectClass, Material, CustomUser
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
            # Ambil teacher dari SubjectClass (ambil salah satu)
            teacher_name = "-"
            subject_class = SubjectClass.objects.filter(
                subject=subject, class_id__in=class_ids
            ).first()
            if subject_class and subject_class.teacher:
                teacher = subject_class.teacher
                teacher_name = f"{teacher.first_name} {teacher.last_name}".strip(
                ) or teacher.username

            # Ambil semua material yang terkait subject ini
            materials = list(Material.objects.filter(
                subject=subject).order_by("-id"))
            completed_count = 0
            material_list = []
            for m in materials:
                completed = False  # TODO: Integrasi dengan StudentMaterialProgress jika sudah ada
                material_list.append({
                    "id": m.id,
                    "title": m.title,
                    "slug": m.slug,  # Tambahkan slug
                    "description": getattr(m, "content", "")[:60] if hasattr(m, "content") else "",
                    "completed": completed,
                    "last_accessed": None,  # TODO: Integrasi dengan progress
                })
                if completed:
                    completed_count += 1

            progress = int((completed_count / len(material_list))
                           * 100) if material_list else 0

            data.append({
                "id": subject.id,
                "name": subject.name,
                "teacher_name": teacher_name,
                "progress": progress,
                "material_count": len(material_list),
                "last_material_title": material_list[0]["title"] if material_list else None,
                    "last_material_slug": material_list[0]["slug"] if material_list else None,  # Ganti dari id ke slug

                "materials": material_list,
            })

        return Response(data)
