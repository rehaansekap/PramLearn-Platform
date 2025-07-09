from sklearn.cluster import KMeans
import numpy as np
import random
import string
import math
from collections import Counter
import logging

logger = logging.getLogger(__name__)


class GroupFormationService:
    """Service untuk menangani logic pembentukan kelompok"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def validate_motivation_profiles(self, students):
        """Validasi profil motivasi siswa sebagai prerequisite untuk algoritma genetik"""
        total_students = len(students)
        analyzed_students = 0
        motivation_distribution = {"High": 0, "Medium": 0, "Low": 0, "Unanalyzed": 0}

        for student in students:
            try:
                if hasattr(student, "studentmotivationprofile"):
                    profile = student.studentmotivationprofile
                    if profile.motivation_level:
                        analyzed_students += 1
                        motivation_distribution[profile.motivation_level] += 1
                    else:
                        motivation_distribution["Unanalyzed"] += 1
                else:
                    motivation_distribution["Unanalyzed"] += 1
            except:
                motivation_distribution["Unanalyzed"] += 1

        unanalyzed_count = motivation_distribution["Unanalyzed"]
        analyzed_percentage = (analyzed_students / total_students) * 100

        # Minimal 80% siswa harus memiliki profil motivasi untuk input algoritma genetik yang valid
        if analyzed_percentage < 80:
            return {
                "is_valid": False,
                "message": f"Profil motivasi belum lengkap. Hanya {analyzed_students}/{total_students} siswa ({analyzed_percentage:.1f}%) yang sudah dianalisis. Minimal 80% siswa harus memiliki profil motivasi sebelum pembentukan kelompok. Silakan upload data ARCS terlebih dahulu.",
                "distribution": motivation_distribution,
            }

        # Periksa keragaman tingkat motivasi untuk objektif diversity dalam algoritma genetik
        analyzed_levels = {
            k: v
            for k, v in motivation_distribution.items()
            if k != "Unanalyzed" and v > 0
        }
        if len(analyzed_levels) < 3:
            diversity_warning = f"⚠️ Peringatan: Hanya ditemukan {len(analyzed_levels)} tingkat motivasi yang berbeda. Untuk kelompok heterogen yang optimal, diperlukan siswa dengan tingkat motivasi High, Medium, dan Low."

            return {
                "is_valid": True,
                "message": f"Validasi berhasil dengan catatan. {analyzed_students}/{total_students} siswa siap untuk pembentukan kelompok.",
                "warning": diversity_warning,
                "distribution": motivation_distribution,
            }

        return {
            "is_valid": True,
            "message": f"Validasi berhasil. {analyzed_students}/{total_students} siswa siap untuk pembentukan kelompok.",
            "distribution": motivation_distribution,
        }

    def get_motivation_score(self, student):
        """Konversi tingkat motivasi menjadi nilai numerik untuk fitness function algoritma genetik"""
        try:
            if hasattr(student, "studentmotivationprofile"):
                profile = student.studentmotivationprofile
                if profile.motivation_level:
                    level = profile.motivation_level.lower()
                    if level == "high":
                        return 3  # Nilai tertinggi untuk optimasi
                    elif level == "medium":
                        return 2  # Nilai menengah
                    elif level == "low":
                        return 1  # Nilai terendah
            return 0  # Unanalyzed - akan dikecualikan dari algoritma genetik
        except:
            return 0

    def get_motivation_level(self, student):
        """Ekstrak label motivasi untuk klasifikasi individu dalam populasi algoritma genetik"""
        try:
            if hasattr(student, "studentmotivationprofile"):
                profile = student.studentmotivationprofile
                return profile.motivation_level or "Unanalyzed"
            return "Unanalyzed"
        except:
            return "Unanalyzed"

    def calculate_optimal_groups(self, total_students):
        """Hitung konfigurasi kelompok optimal sebagai constraint untuk algoritma genetik"""

        # Evaluasi berbagai konfigurasi kelompok untuk constraint handling
        configs = []

        # Konfigurasi 1: Semua kelompok berukuran 4 (optimal balance)
        if total_students % 4 == 0:
            configs.append(
                {
                    "n_groups": total_students // 4,
                    "sizes": [4] * (total_students // 4),
                    "variance": 0,
                    "priority": 1,  # Prioritas tertinggi untuk algoritma genetik
                }
            )

        # Konfigurasi 2: Campuran ukuran 4 dan 5 untuk fleksibilitas
        for size4_groups in range(total_students // 4 + 1):
            remaining = total_students - (size4_groups * 4)
            if remaining >= 0 and remaining % 5 == 0:
                size5_groups = remaining // 5
                total_groups = size4_groups + size5_groups
                if 3 <= total_groups <= 12:  # Range yang masuk akal untuk optimasi
                    sizes = [4] * size4_groups + [5] * size5_groups
                    variance = self.calculate_size_variance(sizes)
                    configs.append(
                        {
                            "n_groups": total_groups,
                            "sizes": sizes,
                            "variance": variance,
                            "priority": 2,
                        }
                    )

        # Konfigurasi 3: Campuran ukuran 3, 4, dan 5 sebagai alternatif
        for size3_groups in range(min(3, total_students // 3 + 1)):
            for size4_groups in range((total_students - size3_groups * 3) // 4 + 1):
                remaining = total_students - (size3_groups * 3) - (size4_groups * 4)
                if remaining >= 0 and remaining % 5 == 0:
                    size5_groups = remaining // 5
                    total_groups = size3_groups + size4_groups + size5_groups
                    if 3 <= total_groups <= 12:
                        sizes = (
                            [3] * size3_groups + [4] * size4_groups + [5] * size5_groups
                        )
                        variance = self.calculate_size_variance(sizes)
                        configs.append(
                            {
                                "n_groups": total_groups,
                                "sizes": sizes,
                                "variance": variance,
                                "priority": 3,
                            }
                        )

        # Pilih konfigurasi terbaik berdasarkan kriteria optimasi algoritma genetik
        if configs:
            # Urutkan berdasarkan prioritas kemudian varians untuk fitness evaluation
            configs.sort(key=lambda x: (x["priority"], x["variance"]))
            return configs[0]

        # Fallback: buat kelompok dengan ukuran yang hampir sama
        group_size = max(3, min(5, total_students // 3))
        n_groups = math.ceil(total_students / group_size)
        base_size = total_students // n_groups
        remainder = total_students % n_groups

        sizes = [base_size + (1 if i < remainder else 0) for i in range(n_groups)]

        return {
            "n_groups": n_groups,
            "sizes": sizes,
            "variance": self.calculate_size_variance(sizes),
            "priority": 4,
        }

    def calculate_size_variance(self, sizes):
        """Hitung varians ukuran kelompok untuk penalty function dalam algoritma genetik"""
        if not sizes:
            return 0
        mean_size = sum(sizes) / len(sizes)
        return sum((size - mean_size) ** 2 for size in sizes) / len(sizes)

    def generate_group_code(self):
        """Generate kode unik kelompok untuk identifikasi hasil algoritma genetik"""
        return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
