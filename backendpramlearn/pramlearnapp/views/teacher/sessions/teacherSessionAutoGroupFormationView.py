from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pramlearnapp.models import (
    Material,
    Group,
    GroupMember,
    CustomUser,
    SubjectClass,
    StudentMotivationProfile,
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.services.group_formation_pdf_service import GroupFormationPDFService
from django.http import HttpResponse
from datetime import datetime
from django.conf import settings
import tempfile
import os
import logging
import math

from pramlearnapp.services.group_formation_service import GroupFormationService
from pramlearnapp.services.adaptive_group_service import AdaptiveGroupService
from pramlearnapp.services.group_formation_algorithms import GroupFormationAlgorithms
from pramlearnapp.services.group_quality_service import GroupQualityService

logger = logging.getLogger(__name__)


class TeacherSessionAutoGroupFormationView(APIView):
    """
    API View untuk pembentukan kelompok otomatis menggunakan algoritma genetik.
    Algoritma genetik digunakan untuk mengoptimalkan pembagian siswa ke dalam kelompok
    berdasarkan profil motivasi mereka dengan tujuan menciptakan kelompok yang seimbang.
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Inisialisasi service untuk algoritma genetik dan analisis kelompok
        self.group_service = GroupFormationService()
        self.adaptive_service = AdaptiveGroupService()
        self.algorithms = GroupFormationAlgorithms()
        self.quality_service = GroupQualityService()

    def get(self, request, material_slug):
        """
        Menangani permintaan GET untuk ekspor PDF analisis kelompok atau analisis kelas.
        Analisis ini menggunakan hasil optimasi dari algoritma genetik.
        """
        logger.info(f"GET request for material: {material_slug}")

        if "class-analysis" in request.path:
            return self.get_class_analysis(request, material_slug)

        return self.handle_pdf_export(request, material_slug)

    def post(self, request, material_slug):
        """
        Menangani permintaan POST untuk membentuk kelompok menggunakan algoritma genetik.
        Algoritma akan mencari solusi optimal untuk pembagian kelompok.
        """
        return self.create_groups(request, material_slug)

    def handle_pdf_export(self, request, material_slug):
        """
        Mengekspor analisis hasil pembentukan kelompok dari algoritma genetik ke dalam format PDF.
        Laporan mencakup distribusi motivasi, kualitas kelompok, dan rekomendasi.
        """
        logger.info(f"PDF export requested for material: {material_slug}")
        logger.info(
            f"Using Azure Storage: {bool(os.getenv('AZURE_STORAGE_CONNECTION_STRING'))}"
        )

        teacher = request.user
        export_format = request.GET.get("export", None)

        if export_format != "pdf":
            return Response(
                {"error": "Invalid export format. Use ?export=pdf"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            material = get_object_or_404(Material, slug=material_slug)
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=teacher
            )

            # Verifikasi bahwa kelompok sudah terbentuk dari hasil algoritma genetik
            groups = Group.objects.filter(material=material)
            if not groups.exists():
                return Response(
                    {"error": "Belum ada kelompok yang terbentuk untuk material ini"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Kumpulkan data material untuk laporan PDF
            material_data = {
                "id": material.id,
                "title": material.title,
                "slug": material.slug,
                "subject": material.subject.name,
                "class": subject_class.class_id.name,
                "teacher": f"{teacher.first_name} {teacher.last_name}".strip()
                or teacher.username,
                "created_at": material.created_at,
            }

            # Analisis komposisi kelompok hasil algoritma genetik
            groups_data = []
            groups_for_analysis = []

            for group in groups:
                members = GroupMember.objects.filter(group=group).select_related(
                    "student", "student__studentmotivationprofile"
                )
                group_members = []
                group_students = []

                # Hitung distribusi tingkat motivasi dalam setiap kelompok
                motivation_dist = {"High": 0, "Medium": 0, "Low": 0, "Unanalyzed": 0}

                for member in members:
                    student = member.student
                    motivation_level = (
                        self.group_service.get_motivation_level(student) or "Unanalyzed"
                    )
                    if motivation_level not in motivation_dist:
                        motivation_level = "Unanalyzed"
                    motivation_dist[motivation_level] += 1

                    group_members.append(
                        {
                            "username": student.username,
                            "name": f"{student.first_name} {student.last_name}".strip()
                            or student.username,
                            "email": student.email,
                            "motivation_level": motivation_level,  # Ini yang penting untuk PDF
                        }
                    )

                    # Data untuk analisis kualitas kelompok
                    group_students.append(
                        {
                            "student": student,
                            "motivation_level": motivation_level,
                            "motivation_score": self.group_service.get_motivation_score(
                                student
                            ),
                        }
                    )

                groups_data.append(
                    {
                        "id": group.id,
                        "name": group.name,
                        "code": group.code,
                        "size": len(group_members),
                        "member_count": len(group_members),  # Tambahkan untuk konsistensi
                        "members": group_members,
                        "motivation_distribution": motivation_dist,
                    }
                )

                if group_students:
                    groups_for_analysis.append(group_students)

            # Evaluasi kualitas hasil optimasi algoritma genetik
            quality_analysis = self.quality_service.analyze_group_quality(
                groups_for_analysis
            )

            # Tentukan mode pembentukan berdasarkan komposisi aktual kelompok
            has_mixed_groups = any(
                len(
                    [
                        level
                        for level, count in group_data[
                            "motivation_distribution"
                        ].items()
                        if count > 0
                    ]
                )
                > 1
                for group_data in groups_data
            )

            formation_mode = "heterogen" if has_mixed_groups else "homogen"

            formation_params = {
                "mode": formation_mode,
                "groups": groups_data,
                "timestamp": datetime.now(),
                "priority_mode": "balanced",
            }

            # Generate laporan PDF dengan hasil analisis algoritma genetik
            pdf_service = GroupFormationPDFService()
            pdf_content = pdf_service.generate_group_formation_report(
                material_data, groups_data, quality_analysis, formation_params
            )
            logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")

            response = HttpResponse(pdf_content, content_type="application/pdf")
            filename = f"analisis_kelompok_{material.slug}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"

            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            response["Content-Length"] = len(pdf_content)
            response["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

            return response

        except Material.DoesNotExist:
            return Response(
                {"error": "Material tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND
            )
        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "Anda tidak memiliki akses ke material ini"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Terjadi kesalahan saat membuat PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create_groups(self, request, material_slug):
        """
        Membentuk kelompok menggunakan algoritma genetik yang mengoptimalkan distribusi
        siswa berdasarkan profil motivasi. Algoritma akan mencari solusi terbaik melalui
        proses evolusi dengan crossover, mutasi, dan seleksi.
        """
        teacher = request.user
        n_clusters = request.data.get("n_clusters", 3)
        mode = request.data.get("mode", "heterogen")
        use_adaptive = request.data.get("use_adaptive", False)
        priority_mode = request.data.get("priority_mode", "balanced")
        force_overwrite = request.data.get("force_overwrite", False)

        try:
            material = get_object_or_404(Material, slug=material_slug)
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=teacher
            )

            # Periksa apakah kelompok sudah ada sebelumnya
            existing_groups = Group.objects.filter(material=material)
            if existing_groups.exists() and not force_overwrite:
                return Response(
                    {
                        "error": "Kelompok untuk materi ini sudah ada. Gunakan force_overwrite=true untuk menimpa."
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            # Ambil data siswa sebagai input untuk algoritma genetik
            from pramlearnapp.models import ClassStudent

            class_students = ClassStudent.objects.filter(
                class_id=subject_class.class_id
            ).select_related("student")
            students = [cs.student for cs in class_students]

            # Optimasi jumlah kelompok untuk mode heterogen (maksimal 5 siswa per kelompok)
            if mode == "heterogen":
                min_groups_needed = math.ceil(len(students) / 5)
                if n_clusters < min_groups_needed:
                    n_clusters = min_groups_needed

            if len(students) < n_clusters:
                return Response(
                    {
                        "error": f"Jumlah siswa ({len(students)}) kurang dari jumlah kelompok yang diinginkan ({n_clusters})"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validasi profil motivasi siswa sebelum menjalankan algoritma genetik
            validation_result = self.group_service.validate_motivation_profiles(
                students
            )
            if not validation_result["is_valid"]:
                return Response(
                    {"error": validation_result["message"]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Sistem adaptif untuk menentukan parameter optimal algoritma genetik
            adaptive_info = {"used_adaptive": False}
            if use_adaptive and mode == "heterogen":
                # Analisis karakteristik kelas untuk menyesuaikan parameter algoritma
                class_analysis = self.adaptive_service.analyze_class_characteristics(
                    students
                )
                recommended_mode = self.adaptive_service.get_recommended_priority_mode(
                    class_analysis
                )

                # Sesuaikan mode prioritas berdasarkan analisis adaptif
                original_priority_mode = priority_mode
                priority_mode = recommended_mode["mode"]

                adaptive_info = {
                    "original_mode": original_priority_mode,
                    "recommended_mode": recommended_mode,
                    "class_analysis": class_analysis,
                    "used_adaptive": True,
                }

            if force_overwrite:
                existing_groups.delete()

            # Persiapan data siswa untuk algoritma genetik
            student_data = []
            for student in students:
                motivation_score = self.group_service.get_motivation_score(student)
                student_data.append(
                    {
                        "student": student,
                        "motivation_score": motivation_score,
                        "motivation_level": self.group_service.get_motivation_level(
                            student
                        ),
                    }
                )

            # Eksekusi algoritma genetik berdasarkan mode yang dipilih
            if mode == "homogen":
                # Algoritma untuk kelompok homogen (siswa dengan tingkat motivasi sama)
                groups = self.algorithms.create_homogeneous_groups(
                    student_data, n_clusters
                )
            else:
                # Algoritma genetik DEAP untuk kelompok heterogen dengan optimasi multi-objektif
                groups = self.algorithms.create_heterogeneous_groups_deap(
                    student_data, n_clusters, priority_mode
                )

            # Simpan hasil optimasi algoritma genetik ke database
            created_groups = []
            for i, group_members in enumerate(groups):
                if not group_members:
                    continue

                group_code = self.group_service.generate_group_code()
                group = Group.objects.create(
                    material=material,
                    name=f"Kelompok {len(created_groups) + 1}",
                    code=group_code,
                )

                for student_data in group_members:
                    GroupMember.objects.create(
                        group=group, student=student_data["student"]
                    )

                # Hitung distribusi motivasi hasil optimasi
                motivation_dist = {"High": 0, "Medium": 0, "Low": 0}
                for s in group_members:
                    level = s["motivation_level"]
                    if level in motivation_dist:
                        motivation_dist[level] += 1

                created_groups.append(
                    {
                        "name": group.name,
                        "code": group.code,
                        "size": len(group_members),
                        "motivation_distribution": motivation_dist,
                        "members": [
                            {
                                "username": s["student"].username,
                                "motivation_level": s["motivation_level"],
                            }
                            for s in group_members
                        ],
                    }
                )

            # Evaluasi kualitas hasil algoritma genetik
            quality_analysis = self.quality_service.analyze_group_quality(groups)
            quality_analysis["formation_mode"] = mode

            # Generate pesan kualitas berdasarkan hasil optimasi
            quality_message = self.quality_service.generate_quality_message(
                quality_analysis, mode, priority_mode
            )

            warning = None
            if validation_result.get("distribution", {}).get("Unanalyzed", 0) > 0:
                warning = f"Terdapat {validation_result['distribution']['Unanalyzed']} siswa yang belum memiliki profil motivasi."

            response_data = {
                "message": f"Berhasil membentuk {len(created_groups)} kelompok dengan mode {mode} menggunakan algoritma genetik",
                "groups": created_groups,
                "motivation_distribution": validation_result.get("distribution", {}),
                "quality_analysis": quality_analysis,
                "quality_message": quality_message,
                "warning": warning,
                "priority_mode": priority_mode,
                "adaptive_info": adaptive_info,
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Material.DoesNotExist:
            return Response(
                {"error": "Material tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND
            )
        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "Anda tidak memiliki akses ke material ini"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            logger.error(f"Error creating groups: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_class_analysis(self, request, material_slug):
        """
        Menganalisis karakteristik kelas untuk menentukan parameter optimal algoritma genetik.
        Analisis ini membantu sistem adaptif memilih strategi terbaik untuk pembentukan kelompok.
        """
        logger.info(f"Class analysis requested for material: {material_slug}")
        teacher = request.user

        try:
            material = get_object_or_404(Material, slug=material_slug)
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=teacher
            )

            from pramlearnapp.models import ClassStudent

            class_students = ClassStudent.objects.filter(
                class_id=subject_class.class_id
            ).select_related("student")
            students = [cs.student for cs in class_students]

            if not students:
                return Response(
                    {"error": "Tidak ada siswa dalam kelas ini"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Validasi data input untuk algoritma genetik
            validation_result = self.group_service.validate_motivation_profiles(
                students
            )

            # Analisis karakteristik untuk optimasi parameter algoritma genetik
            class_analysis = self.adaptive_service.analyze_class_characteristics(
                students
            )

            # Rekomendasi berdasarkan analisis untuk setting algoritma genetik
            recommendation = self.adaptive_service.get_recommended_priority_mode(
                class_analysis
            )

            return Response(
                {
                    "material": {
                        "title": material.title,
                        "slug": material.slug,
                        "subject": material.subject.name,
                        "class": subject_class.class_id.name,
                    },
                    "class_analysis": class_analysis,
                    "recommendation": recommendation,
                    "validation": validation_result,
                },
                status=status.HTTP_200_OK,
            )

        except Material.DoesNotExist:
            return Response(
                {"error": "Material tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND
            )
        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "Anda tidak memiliki akses ke material ini"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            logger.error(f"Error in class analysis: {str(e)}", exc_info=True)
