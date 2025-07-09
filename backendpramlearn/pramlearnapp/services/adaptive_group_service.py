import math
import logging

logger = logging.getLogger(__name__)


class AdaptiveGroupService:
    """Service untuk adaptive algorithm dalam pembentukan kelompok"""

    def analyze_class_characteristics(self, students):
        """
        Analisis karakteristik kelas untuk menentukan mode prioritas optimal algoritma genetik.
        Menganalisis distribusi motivasi siswa sebagai input untuk parameter algoritma genetik.
        """
        total_students = len(students)
        motivation_distribution = {"High": 0, "Medium": 0, "Low": 0, "Unanalyzed": 0}

        # Hitung distribusi tingkat motivasi sebagai input fitness function algoritma genetik
        for student in students:
            try:
                if hasattr(student, "studentmotivationprofile"):
                    profile = student.studentmotivationprofile
                    if profile.motivation_level:
                        motivation_distribution[profile.motivation_level] += 1
                    else:
                        motivation_distribution["Unanalyzed"] += 1
                else:
                    motivation_distribution["Unanalyzed"] += 1
            except:
                motivation_distribution["Unanalyzed"] += 1

        # Hitung metrik keragaman untuk optimasi algoritma genetik
        analyzed_students = total_students - motivation_distribution["Unanalyzed"]

        if analyzed_students == 0:
            return {
                "total_students": total_students,
                "analyzed_students": analyzed_students,
                "motivation_distribution": motivation_distribution,
                "diversity_index": 0,
                "size_challenge": 0,
                "uniformity_potential": 0,
                "heterogeneity_potential": 0,
                "analysis_quality": "poor",
                "analysis_percentage": 0.0,
            }

        # Hitung Shannon Diversity Index untuk mengukur keragaman populasi algoritma genetik
        diversity_index = 0
        for level in ["High", "Medium", "Low"]:
            if motivation_distribution[level] > 0:
                proportion = motivation_distribution[level] / analyzed_students
                diversity_index += proportion * math.log(proportion)

        diversity_index = -diversity_index / math.log(3)  # Normalisasi ke 0-1

        # Hitung tantangan ukuran kelompok untuk constraint handling dalam algoritma genetik
        ideal_group_size = 4
        remainder = total_students % ideal_group_size
        size_challenge = remainder / ideal_group_size

        # Hitung potensi keseragaman untuk objective function uniformity
        min_level_count = min(
            motivation_distribution[level] for level in ["High", "Medium", "Low"]
        )
        max_level_count = max(
            motivation_distribution[level] for level in ["High", "Medium", "Low"]
        )

        if max_level_count > 0:
            uniformity_potential = min_level_count / max_level_count
        else:
            uniformity_potential = 0

        # Hitung potensi heterogenitas untuk objective function diversity
        optimal_groups = math.ceil(total_students / 4)
        max_mixed_groups = min(
            optimal_groups,
            min(motivation_distribution[level] for level in ["High", "Medium", "Low"]),
        )
        heterogeneity_potential = (
            max_mixed_groups / optimal_groups if optimal_groups > 0 else 0
        )

        # Tentukan kualitas analisis untuk parameter tuning algoritma genetik
        analysis_percentage = (analyzed_students / total_students) * 100
        if analysis_percentage >= 90:
            analysis_quality = "excellent"
        elif analysis_percentage >= 80:
            analysis_quality = "good"
        elif analysis_percentage >= 70:
            analysis_quality = "fair"
        else:
            analysis_quality = "poor"

        return {
            "total_students": total_students,
            "analyzed_students": analyzed_students,
            "motivation_distribution": motivation_distribution,
            "diversity_index": diversity_index,
            "size_challenge": size_challenge,
            "uniformity_potential": uniformity_potential,
            "heterogeneity_potential": heterogeneity_potential,
            "analysis_quality": analysis_quality,
            "analysis_percentage": analysis_percentage,
        }

    def get_recommended_priority_mode(self, class_analysis):
        """
        Rekomendasi mode prioritas berdasarkan karakteristik kelas untuk konfigurasi
        bobot objective function dalam algoritma genetik multi-objektif.
        """
        diversity_index = class_analysis["diversity_index"]
        size_challenge = class_analysis["size_challenge"]
        uniformity_potential = class_analysis["uniformity_potential"]
        heterogeneity_potential = class_analysis["heterogeneity_potential"]
        total_students = class_analysis["total_students"]

        # Decision tree untuk rekomendasi konfigurasi fitness function algoritma genetik
        recommendations = []

        # Kondisi size_first: prioritas constraint handling dalam algoritma genetik
        if size_challenge > 0.5 or total_students % 4 >= 2:
            recommendations.append(
                {
                    "mode": "size_first",
                    "score": 0.8 + (size_challenge * 0.2),
                    "reason": "Kelas memiliki tantangan dalam pembagian ukuran kelompok yang seimbang",
                }
            )

        # Kondisi uniformity_first: bobot tinggi untuk uniformity objective
        if diversity_index > 0.8 and uniformity_potential > 0.6:
            recommendations.append(
                {
                    "mode": "uniformity_first",
                    "score": 0.7 + (diversity_index * 0.3),
                    "reason": "Kelas memiliki keragaman motivasi yang tinggi dan potensi distribusi yang seragam",
                }
            )

        # Kondisi heterogeneity_first: bobot tinggi untuk diversity objective
        if heterogeneity_potential > 0.7 and diversity_index > 0.6:
            recommendations.append(
                {
                    "mode": "heterogeneity_first",
                    "score": 0.6 + (heterogeneity_potential * 0.4),
                    "reason": "Kelas memiliki potensi tinggi untuk pembelajaran kolaboratif heterogen",
                }
            )

        # Balanced: bobot seimbang untuk semua objective function
        if diversity_index > 0.3 and diversity_index < 0.8:
            recommendations.append(
                {
                    "mode": "balanced",
                    "score": 0.5 + (0.3 if 0.4 < diversity_index < 0.7 else 0.1),
                    "reason": "Kelas memiliki karakteristik yang seimbang untuk pendekatan standar",
                }
            )

        # Penanganan kasus edge: fallback ke mode default
        if not recommendations:
            recommendations.append(
                {
                    "mode": "balanced",
                    "score": 0.3,
                    "reason": "Kondisi kelas tidak memenuhi kriteria khusus, menggunakan mode standar",
                }
            )

        # Urutkan berdasarkan skor dan kembalikan rekomendasi terbaik
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        best_recommendation = recommendations[0]

        return {
            "mode": best_recommendation["mode"],
            "confidence": best_recommendation["score"],
            "reason": best_recommendation["reason"],
            "alternatives": recommendations[1:3],  # Top 2 alternatif
            "class_characteristics": {
                "diversity_level": (
                    "Tinggi"
                    if diversity_index > 0.7
                    else "Sedang" if diversity_index > 0.4 else "Rendah"
                ),
                "size_complexity": (
                    "Tinggi"
                    if size_challenge > 0.5
                    else "Sedang" if size_challenge > 0.25 else "Rendah"
                ),
                "uniformity_feasibility": (
                    "Tinggi"
                    if uniformity_potential > 0.6
                    else "Sedang" if uniformity_potential > 0.3 else "Rendah"
                ),
                "heterogeneity_feasibility": (
                    "Tinggi"
                    if heterogeneity_potential > 0.6
                    else "Sedang" if heterogeneity_potential > 0.3 else "Rendah"
                ),
            },
        }
