import math
import numpy as np
import logging

logger = logging.getLogger(__name__)


class GroupQualityService:
    """Service untuk analisis kualitas kelompok hasil algoritma genetik"""

    def analyze_group_quality(self, groups):
        """Analisis kualitas kelompok hasil optimasi algoritma genetik dengan pengukuran uniformity"""
        # Pertimbangkan SEMUA kelompok, termasuk yang kosong untuk evaluasi fitness
        analysis = {
            "total_groups": len(groups),
            "group_details": [],
            "heterogeneity_score": 0,
            "balance_score": 0,
            "interpretation": {},
        }

        for i, group in enumerate(groups):
            if len(group) == 0:
                # Kelompok kosong - penalti dalam fungsi fitness algoritma genetik
                group_analysis = {
                    "group_index": i + 1,
                    "size": 0,
                    "motivation_distribution": {"High": 0, "Medium": 0, "Low": 0},
                    "heterogeneity_index": 0,
                }
            else:
                group_analysis = {
                    "group_index": i + 1,
                    "size": len(group),
                    "motivation_distribution": {"High": 0, "Medium": 0, "Low": 0},
                    "heterogeneity_index": 0,
                }

                # Hitung distribusi tingkat motivasi dalam kelompok hasil algoritma genetik
                for student in group:
                    level = student["motivation_level"]
                    if level in group_analysis["motivation_distribution"]:
                        group_analysis["motivation_distribution"][level] += 1

                # Hitung indeks heterogenitas (Shannon diversity) sebagai metrik fitness
                dist = group_analysis["motivation_distribution"]
                total = sum(dist.values())
                if total > 0:
                    diversity_sum = 0
                    for count in dist.values():
                        if count > 0:
                            proportion = count / total
                            diversity_sum += proportion * math.log(proportion)

                    # Normalisasi ke skala 0-1 untuk objective function
                    max_diversity = math.log(min(3, total))
                    group_analysis["heterogeneity_index"] = (
                        -diversity_sum / max_diversity if max_diversity > 0 else 0
                    )

            analysis["group_details"].append(group_analysis)

        # Hitung skor heterogenitas (rata-rata kelompok non-kosong) untuk evaluasi solusi algoritma genetik
        non_empty_groups = [g for g in groups if len(g) > 0]
        if non_empty_groups:
            heterogeneity_scores = [
                g["heterogeneity_index"]
                for g in analysis["group_details"]
                if g["size"] > 0
            ]
            analysis["heterogeneity_score"] = (
                np.mean(heterogeneity_scores) if heterogeneity_scores else 0
            )

        # Hitung skor keseimbangan untuk constraint handling dalam algoritma genetik
        group_sizes = [len(group) for group in groups]
        if len(group_sizes) > 1:
            has_empty_groups = any(size == 0 for size in group_sizes)
            student_count = sum(group_sizes)
            ideal_group_size = student_count // len(group_sizes)
            remainder = student_count % len(group_sizes)
            ideal_sizes = [
                ideal_group_size + (1 if i < remainder else 0)
                for i in range(len(group_sizes))
            ]

            size_differences = []
            for i, size in enumerate(sorted(group_sizes, reverse=True)):
                ideal_size = ideal_sizes[i]
                size_differences.append(abs(size - ideal_size))

            max_possible_difference = student_count
            total_difference = sum(size_differences)
            balance_raw = 1 - (total_difference / max_possible_difference)
            empty_penalty = (
                0.8 if has_empty_groups else 0
            )  # Penalti untuk kelompok kosong
            analysis["balance_score"] = max(0, min(1, balance_raw - empty_penalty))
        else:
            analysis["balance_score"] = 1.0

        # Tambahkan skor uniformity sebagai objektif ketiga dalam multi-objective optimization
        uniformity_score = self.calculate_uniformity_score(groups)
        analysis["uniformity_score"] = uniformity_score

        # Interpretasi otomatis hasil optimasi algoritma genetik
        balance_score = analysis.get("balance_score", 0)
        heterogeneity_score = analysis.get("heterogeneity_score", 0)
        uniformity_score = analysis.get("uniformity_score", 0)
        interpretation = {}

        # Interpretasi keseimbangan berdasarkan constraint satisfaction
        if balance_score > 0.8:
            interpretation["balance"] = "Sangat Seimbang"
        elif balance_score > 0.6:
            interpretation["balance"] = "Cukup Seimbang"
        else:
            interpretation["balance"] = "Kurang Seimbang"

        # Interpretasi keberagaman berdasarkan diversity objective
        if heterogeneity_score > 0.7:
            interpretation["heterogeneity"] = "Sangat Beragam"
        elif heterogeneity_score > 0.5:
            interpretation["heterogeneity"] = "Cukup Beragam"
        else:
            interpretation["heterogeneity"] = "Kurang Beragam"

        # Interpretasi keseragaman berdasarkan uniformity objective
        if uniformity_score > 0.7:
            interpretation["uniformity"] = "Sangat Seragam"
        elif uniformity_score > 0.5:
            interpretation["uniformity"] = "Cukup Seragam"
        else:
            interpretation["uniformity"] = "Kurang Seragam"

        analysis["interpretation"] = interpretation

        return analysis

    def calculate_uniformity_score(self, groups):
        """
        Hitung seberapa seragam pola distribusi antar kelompok sebagai objective function
        dalam optimasi multi-objektif algoritma genetik
        """
        non_empty_groups = [g for g in groups if g]

        if len(non_empty_groups) < 2:
            return 1.0

        # Dapatkan distribusi tingkat motivasi untuk setiap kelompok hasil crossover dan mutasi
        patterns = []
        for group in non_empty_groups:
            dist = {"High": 0, "Medium": 0, "Low": 0}
            for student in group:
                level = student["motivation_level"]
                if level in dist:
                    dist[level] += 1
            patterns.append(dist)

        if not patterns:
            return 0.0

        # Hitung uniformity untuk setiap tingkat motivasi sebagai komponen fitness
        uniformity_scores = []
        for level in ["High", "Medium", "Low"]:
            counts = [p[level] for p in patterns]

            # Periksa apakah semua kelompok memiliki jumlah yang sama (uniformity sempurna)
            unique_counts = set(counts)
            if len(unique_counts) == 1:
                uniformity_scores.append(1.0)
            else:
                # Hitung koefisien variasi untuk mengukur penyebaran
                mean_count = np.mean(counts)
                if mean_count > 0:
                    std_count = np.std(counts)
                    cv = std_count / mean_count
                    # Konversi CV ke skor uniformity untuk maximization
                    # CV 0 = uniformity 1.0, CV 1 = uniformity 0
                    uniformity = max(0, 1 - cv)
                    uniformity_scores.append(uniformity)
                else:
                    # Semua nol - uniformity sempurna
                    uniformity_scores.append(1.0)

        final_score = np.mean(uniformity_scores) if uniformity_scores else 0.0
        return final_score

    def generate_quality_message(self, quality_analysis, mode, priority_mode):
        """
        Generate pesan kualitas dengan informasi mode prioritas algoritma genetik
        """
        if not quality_analysis:
            return "Analisis kualitas tidak tersedia"

        # Informasi mode prioritas untuk konfigurasi bobot fitness function
        priority_info = {
            "balanced": "Seimbang",
            "size_first": "Ukuran Prioritas",
            "uniformity_first": "Distribusi Prioritas",
            "heterogeneity_first": "Keberagaman Prioritas",
        }

        priority_name = priority_info.get(priority_mode, "Tidak Diketahui")

        balance_score = quality_analysis.get("balance_score", 0)
        heterogeneity_score = quality_analysis.get("heterogeneity_score", 0)
        uniformity_score = quality_analysis.get("uniformity_score", 0)

        message = f"Kelompok dibentuk dengan mode {mode} menggunakan prioritas {priority_name}. "
        message += f"Keseimbangan: {balance_score:.1%}, "
        message += f"Keberagaman: {heterogeneity_score:.1%}, "
        message += f"Keseragaman: {uniformity_score:.1%}"

        return message
