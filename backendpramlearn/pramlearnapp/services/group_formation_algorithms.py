import random
import numpy as np
import math
from typing import List, Dict, Any
import logging

# DEAP imports
try:
    from deap import base, creator, tools, algorithms

    DEAP_AVAILABLE = True
except ImportError:
    DEAP_AVAILABLE = False

logger = logging.getLogger(__name__)


class GroupFormationAlgorithms:
    """Algorithms untuk pembentukan kelompok"""

    def create_homogeneous_groups(self, student_data, n_clusters):
        """Pembentukan kelompok homogen dengan siswa yang memiliki tingkat motivasi sama"""
        # Filter siswa yang sudah dianalisis sebagai populasi untuk algoritma genetik
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]

        # Kelompokkan siswa berdasarkan tingkat motivasi untuk pembentukan kromosom
        high_students = [
            s for s in analyzed_students if s["motivation_level"] == "High"
        ]
        medium_students = [
            s for s in analyzed_students if s["motivation_level"] == "Medium"
        ]
        low_students = [s for s in analyzed_students if s["motivation_level"] == "Low"]

        # Acak urutan dalam setiap level untuk diversitas populasi awal
        random.shuffle(high_students)
        random.shuffle(medium_students)
        random.shuffle(low_students)

        groups = []

        # Strategi 1: Buat kelompok murni berdasarkan level (prioritas homogenitas)
        def create_pure_groups(students, level_name):
            """Buat kelompok dengan siswa dari tingkat motivasi yang sama"""
            if not students:
                return []

            # Hitung berapa kelompok yang bisa dibuat dari level ini
            students_per_group = max(2, len(students) // min(n_clusters, len(students)))
            level_groups = []

            for i in range(0, len(students), students_per_group):
                group_students = students[i : i + students_per_group]
                if len(group_students) >= 1:  # Izinkan kelompok satu siswa jika perlu
                    level_groups.append(group_students)

            return level_groups

        # Buat kelompok murni untuk setiap level motivasi
        high_groups = create_pure_groups(high_students, "High")
        medium_groups = create_pure_groups(medium_students, "Medium")
        low_groups = create_pure_groups(low_students, "Low")

        # Gabungkan semua kelompok murni sebagai kromosom awal
        all_pure_groups = high_groups + medium_groups + low_groups

        # Jika kelompok lebih banyak dari yang diinginkan, gabungkan yang terkecil (mutasi adaptif)
        while len(all_pure_groups) > n_clusters:
            # Cari dua kelompok terkecil dengan tingkat motivasi sama
            sizes = [(i, len(group)) for i, group in enumerate(all_pure_groups)]
            sizes.sort(key=lambda x: x[1])

            # Coba gabungkan kelompok dengan tingkat motivasi sama terlebih dahulu
            merged = False
            for i in range(len(sizes) - 1):
                idx1 = sizes[i][0]
                for j in range(i + 1, len(sizes)):
                    idx2 = sizes[j][0]

                    # Periksa apakah mereka memiliki tingkat motivasi yang sama
                    if (
                        all_pure_groups[idx1]
                        and all_pure_groups[idx2]
                        and all_pure_groups[idx1][0]["motivation_level"]
                        == all_pure_groups[idx2][0]["motivation_level"]
                    ):

                        # Gabungkan dua kelompok (operasi crossover)
                        all_pure_groups[idx1].extend(all_pure_groups[idx2])
                        all_pure_groups.pop(idx2)
                        merged = True
                        break
                if merged:
                    break

            # Jika tidak ada penggabungan level sama, gabungkan kelompok terkecil
            if not merged:
                smallest_idx = sizes[0][0]
                second_smallest_idx = sizes[1][0]
                all_pure_groups[smallest_idx].extend(
                    all_pure_groups[second_smallest_idx]
                )
                all_pure_groups.pop(second_smallest_idx)

        # Jika kelompok kurang dari yang diinginkan, tambahkan kelompok kosong
        while len(all_pure_groups) < n_clusters:
            all_pure_groups.append([])

        return all_pure_groups[:n_clusters]

    def create_heterogeneous_groups_deap(
        self, student_data, n_clusters, priority_mode="balanced"
    ):
        """
        Pembentukan kelompok heterogen menggunakan algoritma genetik DEAP dengan mode prioritas
        """
        if not DEAP_AVAILABLE:
            return self.create_heterogeneous_groups_improved(
                student_data, n_clusters, priority_mode
            )

        # Filter siswa yang sudah dianalisis sebagai populasi
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]
        total_students = len(analyzed_students)

        if total_students == 0:
            return [[]]

        # Hitung konfigurasi kelompok optimal untuk constraint handling
        from pramlearnapp.services.group_formation_service import GroupFormationService

        service = GroupFormationService()
        optimal_config = service.calculate_optimal_groups(total_students)
        n_groups = optimal_config["n_groups"]
        target_sizes = optimal_config["sizes"]

        # Inisialisasi DEAP untuk algoritma genetik
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMax)

        toolbox = base.Toolbox()

        def create_individual():
            # Buat kromosom dengan alokasi kelompok acak
            individual = [
                random.randint(0, n_groups - 1) for _ in range(total_students)
            ]
            return creator.Individual(individual)

        def evaluate_grouping(individual):
            # Konversi kromosom menjadi kelompok untuk evaluasi fitness
            groups = [[] for _ in range(n_groups)]
            for i, group_idx in enumerate(individual):
                groups[group_idx].append(analyzed_students[i])

            # Hitung fitness menggunakan mode prioritas
            return (self.calculate_deap_fitness(groups, target_sizes, priority_mode),)

        def mutate_assignment(individual, indpb):
            # Mutasi gen dengan probabilitas tertentu
            for i in range(len(individual)):
                if random.random() < indpb:
                    individual[i] = random.randint(0, n_groups - 1)
            return (individual,)

        def crossover_assignment(ind1, ind2):
            # Crossover uniform antara dua parent
            for i in range(len(ind1)):
                if random.random() < 0.5:
                    ind1[i], ind2[i] = ind2[i], ind1[i]
            return ind1, ind2

        # Registrasi fungsi-fungsi algoritma genetik
        toolbox.register("individual", create_individual)
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        toolbox.register("evaluate", evaluate_grouping)
        toolbox.register("mate", crossover_assignment)
        toolbox.register("mutate", mutate_assignment, indpb=0.1)
        toolbox.register("select", tools.selTournament, tournsize=3)

        # Generate populasi awal dengan solusi heuristik
        population = toolbox.population(n=40)

        # Tambahkan solusi heuristik untuk mempercepat konvergensi
        heuristic_solutions = self.create_heuristic_solutions(
            analyzed_students, n_groups, target_sizes, priority_mode
        )

        for solution in heuristic_solutions[
            :10
        ]:  # Tambahkan maksimal 10 solusi heuristik
            population.append(creator.Individual(solution))

        # Jalankan algoritma genetik dengan strategi evolusi (μ+λ)
        algorithms.eaMuPlusLambda(
            population,
            toolbox,
            mu=50,
            lambda_=100,
            cxpb=0.7,
            mutpb=0.3,
            ngen=50,
            verbose=False,
        )

        # Ambil solusi terbaik dari populasi akhir
        best_individual = tools.selBest(population, k=1)[0]

        # Konversi solusi terbaik menjadi kelompok
        final_groups = [[] for _ in range(n_groups)]
        for i, group_idx in enumerate(best_individual):
            final_groups[group_idx].append(analyzed_students[i])

        # Perbaiki solusi jika ada constraint violation
        final_groups = self.repair_individual(
            best_individual, n_groups, analyzed_students, target_sizes
        )

        return final_groups

    def create_heterogeneous_groups_improved(
        self, student_data, n_clusters, priority_mode="balanced"
    ):
        """
        Algoritma fallback yang ditingkatkan untuk kelompok heterogen dengan mode prioritas
        """
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]
        total_students = len(analyzed_students)

        if total_students == 0:
            return [[]]

        # Hitung konfigurasi kelompok optimal
        from pramlearnapp.services.group_formation_service import GroupFormationService

        service = GroupFormationService()
        optimal_config = service.calculate_optimal_groups(total_students)
        n_groups = optimal_config["n_groups"]
        target_sizes = optimal_config["sizes"]

        # Kelompokkan siswa berdasarkan tingkat motivasi
        motivation_groups = {
            "High": [s for s in analyzed_students if s["motivation_level"] == "High"],
            "Medium": [
                s for s in analyzed_students if s["motivation_level"] == "Medium"
            ],
            "Low": [s for s in analyzed_students if s["motivation_level"] == "Low"],
        }

        # Inisialisasi kelompok kosong
        groups = [[] for _ in range(n_groups)]

        # Strategi berdasarkan mode prioritas
        if priority_mode == "size_first":
            # Prioritas keseimbangan ukuran terlebih dahulu
            groups = self.distribute_by_size_first(
                motivation_groups, n_groups, target_sizes
            )
        elif priority_mode == "uniformity_first":
            # Prioritas distribusi seragam antar kelompok
            groups = self.distribute_by_uniformity_first(
                motivation_groups, n_groups, target_sizes
            )
        elif priority_mode == "heterogeneity_first":
            # Prioritas heterogenitas maksimum dalam kelompok
            groups = self.distribute_by_heterogeneity_first(
                motivation_groups, n_groups, target_sizes
            )
        else:  # balanced
            # Pendekatan seimbang
            groups = self.distribute_balanced(motivation_groups, n_groups, target_sizes)

        return groups

    # Metode distribusi untuk berbagai strategi algoritma genetik
    def distribute_by_size_first(self, motivation_groups, n_groups, target_sizes):
        """Distribusi siswa dengan prioritas keseimbangan ukuran"""
        groups = [[] for _ in range(n_groups)]

        # Gabungkan semua siswa dan urutkan berdasarkan tingkat motivasi untuk distribusi merata
        all_students = []
        for level in ["High", "Medium", "Low"]:
            all_students.extend(motivation_groups[level])

        # Acak untuk randomisasi dalam setiap level
        random.shuffle(all_students)

        # Distribusi round-robin untuk memastikan keseimbangan ukuran
        for i, student in enumerate(all_students):
            group_idx = i % n_groups
            groups[group_idx].append(student)

        return groups

    def distribute_by_uniformity_first(self, motivation_groups, n_groups, target_sizes):
        """Distribusi siswa dengan prioritas keseragaman distribusi antar kelompok"""
        groups = [[] for _ in range(n_groups)]

        # Distribusi setiap tingkat motivasi secara merata antar kelompok
        for level in ["High", "Medium", "Low"]:
            students = motivation_groups[level]
            random.shuffle(students)

            for i, student in enumerate(students):
                group_idx = i % n_groups
                groups[group_idx].append(student)

        return groups

    def distribute_by_heterogeneity_first(
        self, motivation_groups, n_groups, target_sizes
    ):
        """Distribusi siswa dengan prioritas heterogenitas dalam kelompok"""
        groups = [[] for _ in range(n_groups)]

        # Pertama, coba berikan setiap kelompok setidaknya satu siswa dari setiap level
        for level in ["High", "Medium", "Low"]:
            students = motivation_groups[level]
            random.shuffle(students)

            # Berikan satu siswa dari level ini ke setiap kelompok (jika memungkinkan)
            for i in range(min(len(students), n_groups)):
                groups[i].append(students[i])

            # Distribusi siswa yang tersisa
            remaining = students[n_groups:]
            for i, student in enumerate(remaining):
                group_idx = i % n_groups
                groups[group_idx].append(student)

        return groups

    def distribute_balanced(self, motivation_groups, n_groups, target_sizes):
        """Pendekatan distribusi seimbang"""
        groups = [[] for _ in range(n_groups)]

        # Hitung berapa banyak siswa dari setiap level yang harus masuk ke setiap kelompok
        total_students = sum(len(students) for students in motivation_groups.values())

        for level in ["High", "Medium", "Low"]:
            students = motivation_groups[level]
            random.shuffle(students)

            # Distribusi merata, tapi pertimbangkan batas ukuran kelompok
            students_per_group = len(students) // n_groups
            remaining_students = len(students) % n_groups

            student_idx = 0
            for group_idx in range(n_groups):
                # Tambahkan jumlah siswa dasar
                for _ in range(students_per_group):
                    if student_idx < len(students):
                        groups[group_idx].append(students[student_idx])
                        student_idx += 1

                # Tambahkan satu siswa ekstra ke beberapa kelompok
                if group_idx < remaining_students and student_idx < len(students):
                    groups[group_idx].append(students[student_idx])
                    student_idx += 1

        return groups

    # Metode kalkulasi fitness untuk algoritma genetik
    def calculate_deap_fitness(self, groups, target_sizes, priority_mode="balanced"):
        """Hitung skor fitness dengan bobot mode prioritas"""
        # Dapatkan bobot mode prioritas
        weights = self.get_priority_weights(priority_mode)

        # Hitung komponen fitness individual
        size_score = self.calculate_size_fitness(groups, target_sizes)
        uniformity_score = self.calculate_uniformity_fitness(groups)
        heterogeneity_score = self.calculate_heterogeneity_fitness(groups)

        # Terapkan bobot mode prioritas
        total_score = (
            size_score * weights["size"]
            + uniformity_score * weights["uniformity"]
            + heterogeneity_score * weights["heterogeneity"]
        )

        return total_score

    def get_priority_weights(self, priority_mode):
        """Dapatkan bobot berdasarkan mode prioritas untuk objective function"""
        weights_map = {
            "balanced": {
                "size": 0.4,
                "uniformity": 0.4,
                "heterogeneity": 0.2,
            },
            "size_first": {
                "size": 0.6,
                "uniformity": 0.25,
                "heterogeneity": 0.15,
            },
            "uniformity_first": {
                "size": 0.25,
                "uniformity": 0.6,
                "heterogeneity": 0.15,
            },
            "heterogeneity_first": {
                "size": 0.25,
                "uniformity": 0.25,
                "heterogeneity": 0.5,
            },
        }

        return weights_map.get(priority_mode, weights_map["balanced"])

    def calculate_size_fitness(self, groups, target_sizes):
        """Hitung skor fitness untuk keseimbangan ukuran kelompok"""
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0.0

        # Hitung varians ukuran
        actual_sizes = [len(g) for g in non_empty_groups]
        if len(actual_sizes) == 0:
            return 0.0

        # Penalti untuk kelompok yang terlalu besar (> 5 siswa)
        large_group_penalty = sum(max(0, size - 5) for size in actual_sizes) * 0.1

        # Hitung varians dari ukuran target
        variance = np.var(actual_sizes)

        # Normalisasi skor (varians rendah = skor tinggi)
        max_variance = max(target_sizes) ** 2
        size_score = max(0, 1 - (variance / max_variance)) - large_group_penalty

        return max(0, size_score)

    def calculate_uniformity_fitness(self, groups):
        """Hitung skor fitness untuk keseragaman distribusi motivasi"""
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0.0

        # Hitung distribusi motivasi untuk setiap kelompok
        group_distributions = []
        for group in non_empty_groups:
            if not group:
                continue

            dist = {"High": 0, "Medium": 0, "Low": 0}
            for student in group:
                level = student.get("motivation_level", "Unanalyzed")
                if level in dist:
                    dist[level] += 1

            # Konversi ke proporsi
            total = sum(dist.values())
            if total > 0:
                for level in dist:
                    dist[level] = dist[level] / total

            group_distributions.append(dist)

        if not group_distributions:
            return 0.0

        # Hitung skor keseragaman
        uniformity_score = 0.0
        for level in ["High", "Medium", "Low"]:
            proportions = [dist[level] for dist in group_distributions]
            if proportions:
                variance = np.var(proportions)
                uniformity_score += max(0, 1 - variance)

        return uniformity_score / 3  # Rata-rata antar tingkat motivasi

    def calculate_heterogeneity_fitness(self, groups):
        """Hitung skor fitness untuk heterogenitas dalam kelompok"""
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0.0

        heterogeneity_scores = []
        for group in non_empty_groups:
            if len(group) <= 1:
                heterogeneity_scores.append(0.0)
                continue

            # Hitung tingkat motivasi yang berbeda dalam kelompok
            levels = set(s["motivation_level"] for s in group)
            unique_levels = len(levels)

            # Hitung skor heterogenitas
            if unique_levels == 1:
                score = 0.0  # Kelompok homogen
            elif unique_levels == 2:
                score = 0.6  # Agak heterogen
            elif unique_levels == 3:
                score = 1.0  # Sepenuhnya heterogen
            else:
                score = 0.0  # Tidak seharusnya terjadi dengan 3 tingkat motivasi

            heterogeneity_scores.append(score)

        return np.mean(heterogeneity_scores) if heterogeneity_scores else 0.0

    # Metode heuristik dan perbaikan untuk algoritma genetik
    def create_heuristic_solutions(
        self, students, n_groups, target_sizes, priority_mode="balanced"
    ):
        """Buat solusi heuristik untuk populasi awal algoritma genetik"""
        solutions = []

        # Solusi 1: Penugasan round-robin
        solutions.append(self.create_round_robin_solution(students, n_groups))

        # Solusi 2: Seimbang berdasarkan tingkat motivasi
        solutions.append(
            self.create_balanced_solution(students, n_groups, target_sizes)
        )

        # Solusi 3: Solusi berbasis prioritas
        if priority_mode == "size_first":
            solutions.append(
                self.create_size_first_solution(students, n_groups, target_sizes)
            )
        elif priority_mode == "uniformity_first":
            solutions.append(
                self.create_uniformity_first_solution(students, n_groups, target_sizes)
            )
        elif priority_mode == "heterogeneity_first":
            solutions.append(
                self.create_heterogeneity_first_solution(
                    students, n_groups, target_sizes
                )
            )

        # Solusi 4: Acak dengan constraint
        for _ in range(2):
            solution = [random.randint(0, n_groups - 1) for _ in range(len(students))]
            solutions.append(solution)

        return solutions

    def create_round_robin_solution(self, students, n_groups):
        """Buat solusi round-robin untuk inisialisasi populasi"""
        solution = []
        for i in range(len(students)):
            solution.append(i % n_groups)
        return solution

    def create_balanced_solution(self, students, n_groups, target_sizes):
        """Buat solusi seimbang berdasarkan tingkat motivasi"""
        # Kelompokkan siswa berdasarkan tingkat motivasi
        motivation_groups = {"High": [], "Medium": [], "Low": []}

        for i, student in enumerate(students):
            level = student["motivation_level"]
            if level in motivation_groups:
                motivation_groups[level].append(i)

        # Buat solusi
        solution = [0] * len(students)

        # Distribusi setiap tingkat motivasi secara merata
        for level, indices in motivation_groups.items():
            for i, student_idx in enumerate(indices):
                group_idx = i % n_groups
                solution[student_idx] = group_idx

        return solution

    def create_size_first_solution(self, students, n_groups, target_sizes):
        """Buat solusi dengan prioritas keseimbangan ukuran"""
        solution = [0] * len(students)
        group_sizes = [0] * n_groups

        for i, student in enumerate(students):
            # Cari kelompok dengan ukuran minimum
            min_group = min(range(n_groups), key=lambda x: group_sizes[x])
            solution[i] = min_group
            group_sizes[min_group] += 1

        return solution

    def create_uniformity_first_solution(self, students, n_groups, target_sizes):
        """Buat solusi dengan prioritas keseragaman"""
        # Kelompokkan berdasarkan tingkat motivasi
        motivation_indices = {"High": [], "Medium": [], "Low": []}

        for i, student in enumerate(students):
            level = student["motivation_level"]
            if level in motivation_indices:
                motivation_indices[level].append(i)

        solution = [0] * len(students)

        # Distribusi setiap level secara merata
        for level, indices in motivation_indices.items():
            for i, student_idx in enumerate(indices):
                group_idx = i % n_groups
                solution[student_idx] = group_idx

        return solution

    def create_heterogeneity_first_solution(self, students, n_groups, target_sizes):
        """Buat solusi dengan prioritas heterogenitas"""
        solution = [0] * len(students)

        # Kelompokkan berdasarkan tingkat motivasi
        motivation_indices = {"High": [], "Medium": [], "Low": []}

        for i, student in enumerate(students):
            level = student["motivation_level"]
            if level in motivation_indices:
                motivation_indices[level].append(i)

        # Putaran pertama: satu dari setiap level ke setiap kelompok
        group_idx = 0
        for level in ["High", "Medium", "Low"]:
            indices = motivation_indices[level]
            for i in range(min(len(indices), n_groups)):
                if indices:
                    student_idx = indices.pop(0)
                    solution[student_idx] = group_idx
                    group_idx = (group_idx + 1) % n_groups

        # Putaran kedua: distribusi sisa
        all_remaining = []
        for indices in motivation_indices.values():
            all_remaining.extend(indices)

        for i, student_idx in enumerate(all_remaining):
            solution[student_idx] = i % n_groups

        return solution

    def repair_individual(self, individual, n_groups, all_students, target_sizes):
        """Perbaiki kromosom untuk memastikan penugasan kelompok yang valid"""
        # Konversi kromosom menjadi kelompok
        groups = [[] for _ in range(n_groups)]
        for i, group_idx in enumerate(individual):
            if 0 <= group_idx < n_groups:
                groups[group_idx].append(all_students[i])

        return groups
