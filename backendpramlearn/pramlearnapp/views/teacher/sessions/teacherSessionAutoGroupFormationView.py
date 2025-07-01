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
from sklearn.cluster import KMeans
import numpy as np
import random
import string
import math
from collections import Counter
from pramlearnapp.services.group_formation_pdf_service import GroupFormationPDFService
from django.http import HttpResponse
from datetime import datetime
from django.conf import settings
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

# DEAP imports
try:
    from deap import base, creator, tools, algorithms

    DEAP_AVAILABLE = True
except ImportError:
    DEAP_AVAILABLE = False


class TeacherSessionAutoGroupFormationView(APIView):
    """
    API untuk pembentukan kelompok otomatis dalam context sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        logger.info(f"PDF export requested for material: {material_slug}")
        logger.info(
            f"Using Azure Storage: {bool(os.getenv('AZURE_STORAGE_CONNECTION_STRING'))}"
        )

        """Export group formation analysis as PDF"""
        teacher = request.user
        export_format = request.GET.get("export", None)

        if export_format != "pdf":
            return Response(
                {"error": "Invalid export format. Use ?export=pdf"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Get material and verify teacher access
            material = get_object_or_404(Material, slug=material_slug)
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=teacher
            )

            # Get existing groups
            existing_groups = Group.objects.filter(material=material).prefetch_related(
                "groupmember_set__student"
            )

            if not existing_groups.exists():
                return Response(
                    {
                        "error": "Tidak ada kelompok yang ditemukan untuk materi ini. Buat kelompok terlebih dahulu."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Prepare data for PDF
            material_data = {
                "title": material.title,
                "subject": material.subject.name,
                "teacher": teacher.get_full_name() or teacher.username,
                "slug": material.slug,
            }

            # Convert groups to expected format
            groups_data = []
            all_students_data = []

            for group in existing_groups:
                members = []
                motivation_dist = {"High": 0, "Medium": 0, "Low": 0}

                for group_member in group.groupmember_set.all():
                    student = group_member.student
                    motivation_level = self.get_motivation_level(student)

                    members.append(
                        {
                            "username": student.username,
                            "motivation_level": motivation_level,
                        }
                    )

                    # Add to all students data for analysis
                    all_students_data.append(
                        {
                            "student": student,
                            "motivation_level": motivation_level,
                            "motivation_score": self.get_motivation_score(student),
                        }
                    )

                    # Count distribution
                    if motivation_level in motivation_dist:
                        motivation_dist[motivation_level] += 1

                groups_data.append(
                    {
                        "name": group.name,
                        "code": group.code,
                        "size": len(members),
                        "motivation_distribution": motivation_dist,
                        "members": members,
                    }
                )

            # Recreate quality analysis
            # Convert to expected format for analysis
            groups_for_analysis = []
            for group_data in groups_data:
                group_students = []
                for member in group_data["members"]:
                    # Find student data
                    for student_data in all_students_data:
                        if student_data["student"].username == member["username"]:
                            group_students.append(student_data)
                            break
                groups_for_analysis.append(group_students)

            quality_analysis = self.analyze_group_quality(groups_for_analysis)

            # Determine formation mode based on heterogeneity
            avg_heterogeneity = quality_analysis.get("heterogeneity_score", 0)
            formation_mode = "heterogen" if avg_heterogeneity > 0.5 else "homogen"

            formation_params = {
                "mode": formation_mode,
                "groups": groups_data,
                "timestamp": datetime.now(),
            }

            # Generate PDF
            pdf_service = GroupFormationPDFService()
            pdf_content = pdf_service.generate_group_formation_report(
                material_data, groups_data, quality_analysis, formation_params
            )
            logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")

            # Create response
            response = HttpResponse(pdf_content, content_type="application/pdf")
            filename = f"analisis_kelompok_{material.slug}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"

            # Use proper Content-Disposition header format
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            response["Content-Length"] = len(pdf_content)
            response["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

            # Important: Don't try to save to media folder in production
            # Return the PDF directly from memory
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
            logger.error(f"PDF export error: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Terjadi kesalahan saat membuat PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, material_slug):
        teacher = request.user
        n_clusters = request.data.get("n_clusters", 3)
        # 'homogen' or 'heterogen'
        mode = request.data.get("mode", "heterogen")
        force_overwrite = request.data.get("force_overwrite", False)

        try:
            # Get material and verify teacher access
            material = get_object_or_404(Material, slug=material_slug)
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=teacher
            )

            # Check if groups already exist
            existing_groups = Group.objects.filter(material=material)
            if existing_groups.exists() and not force_overwrite:
                return Response(
                    {
                        "error": "Kelompok untuk materi ini sudah ada. Gunakan force_overwrite=true untuk menimpa."
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            # Get students from the class
            from pramlearnapp.models import ClassStudent

            class_students = ClassStudent.objects.filter(
                class_id=subject_class.class_id
            ).select_related("student")

            students = [cs.student for cs in class_students]

            # For heterogeneous mode, adjust n_clusters to ensure max 5 students per group
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

            # Validate motivation profiles before creating groups
            validation_result = self.validate_motivation_profiles(students)
            if not validation_result["is_valid"]:
                return Response(
                    {"error": validation_result["message"]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Delete existing groups if force overwrite
            if force_overwrite:
                existing_groups.delete()

            # Get motivation profiles
            student_data = []
            for student in students:
                motivation_score = self.get_motivation_score(student)
                student_data.append(
                    {
                        "student": student,
                        "motivation_score": motivation_score,
                        "motivation_level": self.get_motivation_level(student),
                    }
                )

            # Create groups based on mode
            if mode == "homogen":
                groups = self.create_homogeneous_groups(student_data, n_clusters)
            else:  # heterogen
                if DEAP_AVAILABLE:
                    groups = self.create_heterogeneous_groups_deap(
                        student_data, n_clusters
                    )
                else:
                    # Fallback to improved algorithm if DEAP not available
                    groups = self.create_heterogeneous_groups_improved(
                        student_data, n_clusters
                    )

            # Save groups to database
            created_groups = []
            for i, group_members in enumerate(groups):
                if not group_members:  # Skip empty groups
                    continue

                group_code = self.generate_group_code()
                group = Group.objects.create(
                    material=material,
                    name=f"Kelompok {len(created_groups) + 1}",
                    code=group_code,
                )

                for student_data in group_members:
                    GroupMember.objects.create(
                        group=group, student=student_data["student"]
                    )

                # Detailed group info
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

            # Analyze group quality
            quality_analysis = self.analyze_group_quality(groups)

            # Enhanced response message
            if mode == "homogen":
                avg_heterogeneity = quality_analysis["heterogeneity_score"]
                if avg_heterogeneity < 0.3:
                    quality_message = "✅ Kelompok homogen terbentuk dengan baik"
                elif avg_heterogeneity < 0.6:
                    quality_message = "⚠️ Kelompok cukup homogen, ada sedikit campuran"
                else:
                    quality_message = "❌ Kelompok masih terlalu heterogen"
            else:  # heterogen
                avg_heterogeneity = quality_analysis["heterogeneity_score"]
                uniformity_score = quality_analysis.get("uniformity_score", 0)

                if uniformity_score > 0.9 and avg_heterogeneity > 0.7:
                    quality_message = "✅ Kelompok heterogen dengan distribusi seragam terbentuk dengan sangat baik"
                elif uniformity_score > 0.8 and avg_heterogeneity > 0.6:
                    quality_message = (
                        "✅ Kelompok heterogen dengan distribusi cukup seragam"
                    )
                elif avg_heterogeneity > 0.7:
                    quality_message = (
                        "✅ Kelompok heterogen terbentuk dengan sangat baik"
                    )
                elif avg_heterogeneity > 0.4:
                    quality_message = "⚠️ Kelompok cukup heterogen"
                else:
                    quality_message = "❌ Kelompok masih terlalu homogen"

            return Response(
                {
                    "message": f"Berhasil membuat {len(created_groups)} kelompok dengan mode {mode}",
                    "quality_message": quality_message,
                    "groups": created_groups,
                    "motivation_distribution": validation_result["distribution"],
                    "quality_analysis": {
                        "formation_mode": mode,
                        "balance_score": quality_analysis["balance_score"],
                        "heterogeneity_score": quality_analysis["heterogeneity_score"],
                        "uniformity_score": quality_analysis.get("uniformity_score", 0),
                        "group_details": quality_analysis["group_details"],
                        "interpretation": {
                            "balance": (
                                "Sangat Seimbang"
                                if quality_analysis["balance_score"] > 0.8
                                else (
                                    "Cukup Seimbang"
                                    if quality_analysis["balance_score"] > 0.5
                                    else "Kurang Seimbang"
                                )
                            ),
                            "heterogeneity": (
                                "Sangat Beragam"
                                if quality_analysis["heterogeneity_score"] > 0.7
                                else (
                                    "Cukup Beragam"
                                    if quality_analysis["heterogeneity_score"] > 0.4
                                    else (
                                        "Cukup Homogen"
                                        if quality_analysis["heterogeneity_score"] > 0.2
                                        else "Sangat Homogen"
                                    )
                                )
                            ),
                            "uniformity": (
                                "Sangat Seragam"
                                if quality_analysis.get("uniformity_score", 0) > 0.8
                                else (
                                    "Cukup Seragam"
                                    if quality_analysis.get("uniformity_score", 0) > 0.6
                                    else "Kurang Seragam"
                                )
                            ),
                        },
                    },
                },
                status=status.HTTP_201_CREATED,
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
            return Response(
                {"error": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create_heterogeneous_groups_deap(self, student_data, n_clusters):
        """
        Create heterogeneous groups using DEAP genetic algorithm for optimal uniform distribution
        """
        # Filter analyzed students
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]
        total_students = len(analyzed_students)

        if total_students == 0:
            return []

        # Calculate optimal group configuration
        optimal_config = self.calculate_optimal_groups(total_students)
        n_groups = optimal_config["n_groups"]
        target_sizes = optimal_config["sizes"]

        # Group students by motivation level
        motivation_groups = {
            "High": [s for s in analyzed_students if s["motivation_level"] == "High"],
            "Medium": [
                s for s in analyzed_students if s["motivation_level"] == "Medium"
            ],
            "Low": [s for s in analyzed_students if s["motivation_level"] == "Low"],
        }

        # Initialize DEAP
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMax)

        toolbox = base.Toolbox()

        def create_individual():
            """Create random assignment of students to groups"""
            individual = []
            for i in range(total_students):
                # Assign student to random group (0 to n_groups-1)
                individual.append(random.randint(0, n_groups - 1))
            return creator.Individual(individual)

        def evaluate_grouping(individual):
            """Evaluate the quality of group assignment"""
            # Convert individual to groups
            groups = [[] for _ in range(n_groups)]
            for student_idx, group_idx in enumerate(individual):
                groups[group_idx].append(analyzed_students[student_idx])

            # Calculate fitness score
            score = self.calculate_deap_fitness(groups, target_sizes)
            return (score,)

        def mutate_assignment(individual, indpb):
            """Mutate assignment with constraint awareness"""
            for i in range(len(individual)):
                if random.random() < indpb:
                    # Smart mutation: prefer groups that need this motivation level
                    student = analyzed_students[i]
                    best_groups = self.find_best_groups_for_student(
                        individual, student, i, n_groups, analyzed_students
                    )
                    if best_groups:
                        individual[i] = random.choice(best_groups)
                    else:
                        individual[i] = random.randint(0, n_groups - 1)
            return (individual,)

        def crossover_assignment(ind1, ind2):
            """Custom crossover that maintains group constraints"""
            # Two-point crossover with repair
            tools.cxTwoPoint(ind1, ind2)

            # Repair if needed
            self.repair_individual(ind1, n_groups, analyzed_students, target_sizes)
            self.repair_individual(ind2, n_groups, analyzed_students, target_sizes)

            return ind1, ind2

        # Register functions
        toolbox.register("individual", create_individual)
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        toolbox.register("evaluate", evaluate_grouping)
        toolbox.register("mate", crossover_assignment)
        toolbox.register("mutate", mutate_assignment, indpb=0.2)
        toolbox.register("select", tools.selTournament, tournsize=3)

        # Create initial population
        population = toolbox.population(n=100)

        # Add some heuristic solutions to population
        heuristic_solutions = self.create_heuristic_solutions(
            analyzed_students, n_groups, target_sizes
        )
        # Add top 10 heuristic solutions
        for solution in heuristic_solutions[:10]:
            individual = creator.Individual(solution)
            population.append(individual)

        # Run genetic algorithm
        algorithms.eaSimple(
            population,
            toolbox,
            cxpb=0.7,  # Crossover probability
            mutpb=0.3,  # Mutation probability
            ngen=50,  # Number of generations
            verbose=False,
        )

        # Get best individual
        best_individual = tools.selBest(population, 1)[0]

        # Convert back to groups
        final_groups = [[] for _ in range(n_groups)]
        for student_idx, group_idx in enumerate(best_individual):
            final_groups[group_idx].append(analyzed_students[student_idx])

        # Remove empty groups
        final_groups = [group for group in final_groups if group]

        return final_groups

    def calculate_deap_fitness(self, groups, target_sizes):
        """
        Calculate fitness score for DEAP optimization
        Higher score = better grouping
        """
        if not groups:
            return 0

        total_score = 0

        # 1. Size constraint score (40% weight)
        size_score = self.calculate_size_fitness(groups, target_sizes)
        total_score += size_score * 0.4

        # 2. Uniformity score (40% weight) - NEW: prioritizes uniform distribution
        uniformity_score = self.calculate_uniformity_fitness(groups)
        total_score += uniformity_score * 0.4

        # 3. Heterogeneity score (20% weight)
        heterogeneity_score = self.calculate_heterogeneity_fitness(groups)
        total_score += heterogeneity_score * 0.2

        return total_score

    def calculate_size_fitness(self, groups, target_sizes):
        """Calculate fitness based on how close group sizes are to target"""
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0

        size_deviations = []
        actual_sizes = [len(g) for g in non_empty_groups]

        # Sort both for fair comparison
        actual_sizes.sort()
        target_sizes_sorted = sorted(target_sizes[: len(actual_sizes)])

        for actual, target in zip(actual_sizes, target_sizes_sorted):
            deviation = abs(actual - target)
            size_deviations.append(deviation)

        # Perfect size = score 1, deviation of 1 = score 0.8, etc.
        avg_deviation = np.mean(size_deviations)
        size_score = max(0, 1 - (avg_deviation / 3))  # Normalize

        return size_score

    def calculate_uniformity_fitness(self, groups):
        """
        FIXED: Calculate uniformity fitness - how similar the distribution patterns are
        """
        non_empty_groups = [g for g in groups if g]
        if len(non_empty_groups) < 2:
            return 1.0

        # Get absolute count distribution for each group (not normalized)
        patterns = []
        for group in non_empty_groups:
            pattern = {"High": 0, "Medium": 0, "Low": 0}
            for student in group:
                level = student["motivation_level"]
                pattern[level] += 1
            patterns.append(pattern)

        if not patterns:
            return 0

        # Calculate coefficient of variation for each motivation level
        uniformity_scores = []
        for level in ["High", "Medium", "Low"]:
            counts = [p[level] for p in patterns]
            if len(counts) > 1:
                mean_count = np.mean(counts)
                if mean_count > 0:
                    std_count = np.std(counts)
                    cv = std_count / mean_count  # Coefficient of variation
                    # Convert to uniformity score (lower CV = higher uniformity)
                    uniformity = max(0, 1 - cv)
                    uniformity_scores.append(uniformity)
                else:
                    # If mean is 0, check if all are 0 (perfect uniformity)
                    uniformity_scores.append(
                        1.0 if all(c == 0 for c in counts) else 0.0
                    )

        return np.mean(uniformity_scores) if uniformity_scores else 0.0

    def calculate_heterogeneity_fitness(self, groups):
        """Calculate heterogeneity fitness using Shannon diversity"""
        heterogeneity_scores = []

        for group in groups:
            if len(group) == 0:
                continue

            # Count motivation levels
            counts = {"High": 0, "Medium": 0, "Low": 0}
            for student in group:
                level = student["motivation_level"]
                counts[level] += 1

            # Calculate Shannon diversity
            total = sum(counts.values())
            if total <= 1:
                heterogeneity_scores.append(0)
                continue

            diversity = 0
            for count in counts.values():
                if count > 0:
                    proportion = count / total
                    diversity -= proportion * math.log(proportion)

            # Normalize (max diversity for 3 levels = log(3))
            max_diversity = math.log(min(3, total))
            normalized_diversity = diversity / max_diversity if max_diversity > 0 else 0
            heterogeneity_scores.append(normalized_diversity)

        return np.mean(heterogeneity_scores) if heterogeneity_scores else 0

    def find_best_groups_for_student(
        self, individual, student, student_idx, n_groups, all_students
    ):
        """Find best groups for a student during mutation"""
        student_level = student["motivation_level"]

        # Calculate current group compositions
        group_compositions = [
            {"High": 0, "Medium": 0, "Low": 0} for _ in range(n_groups)
        ]
        group_sizes = [0] * n_groups

        for i, group_idx in enumerate(individual):
            if i != student_idx:  # Exclude current student
                level = all_students[i]["motivation_level"]
                group_compositions[group_idx][level] += 1
                group_sizes[group_idx] += 1

        # Find groups that would benefit from this student
        good_groups = []
        for group_idx in range(n_groups):
            # Check if group needs this motivation level
            composition = group_compositions[group_idx]
            size = group_sizes[group_idx]

            # Don't overfill groups
            if size >= 5:
                continue

            # Prefer groups that need this motivation level for balance
            current_level_count = composition[student_level]
            other_levels_count = sum(composition.values()) - current_level_count

            # Good if this level is underrepresented
            if current_level_count <= other_levels_count // 2:
                good_groups.append(group_idx)

        return good_groups if good_groups else list(range(n_groups))

    def repair_individual(self, individual, n_groups, all_students, target_sizes):
        """Repair individual to satisfy constraints"""
        # Count current group sizes
        group_sizes = [0] * n_groups
        for group_idx in individual:
            group_sizes[group_idx] += 1

        # Move students from oversized groups to undersized groups
        while max(group_sizes) > 5 or (max(group_sizes) - min(group_sizes) > 2):
            # Find oversized and undersized groups
            max_group = group_sizes.index(max(group_sizes))
            min_group = group_sizes.index(min(group_sizes))

            if group_sizes[max_group] <= 3:  # Prevent infinite loop
                break

            # Find a student in max_group to move
            for i, group_idx in enumerate(individual):
                if group_idx == max_group:
                    individual[i] = min_group
                    group_sizes[max_group] -= 1
                    group_sizes[min_group] += 1
                    break

    def create_heuristic_solutions(self, students, n_groups, target_sizes):
        """Create good initial solutions using heuristics"""
        solutions = []

        # Solution 1: Round-robin by motivation level
        solution1 = self.create_round_robin_solution(students, n_groups)
        solutions.append(solution1)

        # Solution 2: Balanced distribution
        solution2 = self.create_balanced_solution(students, n_groups, target_sizes)
        solutions.append(solution2)

        # Solution 3: Random with repairs
        for _ in range(3):
            solution = [random.randint(0, n_groups - 1) for _ in range(len(students))]
            self.repair_individual(solution, n_groups, students, target_sizes)
            solutions.append(solution)

        return solutions

    def create_round_robin_solution(self, students, n_groups):
        """Create solution using round-robin assignment by motivation level"""
        # Group by motivation
        by_motivation = {"High": [], "Medium": [], "Low": []}
        for i, student in enumerate(students):
            by_motivation[student["motivation_level"]].append(i)

        # Shuffle each group
        for level_students in by_motivation.values():
            random.shuffle(level_students)

        # Round-robin assignment
        solution = [0] * len(students)
        group_counters = [0] * n_groups

        # Distribute each motivation level
        for level in ["High", "Medium", "Low"]:
            for student_idx in by_motivation[level]:
                # Find group with minimum students
                min_group = min(range(n_groups), key=lambda x: group_counters[x])
                solution[student_idx] = min_group
                group_counters[min_group] += 1

        return solution

    def create_balanced_solution(self, students, n_groups, target_sizes):
        """Create solution with balanced motivation distribution"""
        solution = [0] * len(students)

        # Create target patterns for each group
        patterns = self.create_target_patterns(n_groups, target_sizes, students)

        # Group students by motivation
        by_motivation = {"High": [], "Medium": [], "Low": []}
        for i, student in enumerate(students):
            by_motivation[student["motivation_level"]].append(i)

        # Shuffle for fairness
        for level_students in by_motivation.values():
            random.shuffle(level_students)

        # Assign according to patterns
        for group_idx, pattern in enumerate(patterns):
            for level, count in pattern.items():
                for _ in range(count):
                    if by_motivation[level]:
                        student_idx = by_motivation[level].pop(0)
                        solution[student_idx] = group_idx

        return solution

    def create_target_patterns(self, n_groups, target_sizes, students):
        """
        IMPROVED: Create STRICTLY uniform target distribution patterns
        """
        # Count available students by motivation
        motivation_counts = Counter(s["motivation_level"] for s in students)

        # Calculate ideal distribution per group
        total_high = motivation_counts["High"]
        total_medium = motivation_counts["Medium"]
        total_low = motivation_counts["Low"]
        for level in ["High", "Medium", "Low"]:
            if level not in motivation_counts:
                motivation_counts[level] = 0

        # For uniform distribution, each group should have similar patterns
        # Priority pattern for size 4: 1H, 2M, 1L
        ideal_pattern = {"High": 1, "Medium": 2, "Low": 1}

        patterns = []
        remaining = dict(motivation_counts)
        for level in ["High", "Medium", "Low"]:
            if level not in remaining:
                remaining[level] = 0

        for group_idx, size in enumerate(target_sizes):
            if size == 4:
                # Strict enforcement of 1H, 2M, 1L pattern
                if (
                    remaining["High"] >= 1
                    and remaining["Medium"] >= 2
                    and remaining["Low"] >= 1
                ):
                    pattern = {"High": 1, "Medium": 2, "Low": 1}
                # Fallback patterns that maintain balance
                elif (
                    remaining["High"] >= 1
                    and remaining["Medium"] >= 1
                    and remaining["Low"] >= 2
                ):
                    pattern = {"High": 1, "Medium": 1, "Low": 2}
                elif (
                    remaining["High"] >= 2
                    and remaining["Medium"] >= 1
                    and remaining["Low"] >= 1
                ):
                    pattern = {"High": 2, "Medium": 1, "Low": 1}
                else:
                    # Last resort: distribute remaining evenly
                    pattern = self.distribute_remaining_evenly(remaining, size)
            else:
                pattern = self.distribute_remaining_evenly(remaining, size)

            # Update remaining
            for level, count in pattern.items():
                remaining[level] = max(0, remaining[level] - count)

            patterns.append(pattern)

        return patterns

    def distribute_remaining_evenly(self, remaining, size):
        """Helper to distribute remaining students evenly"""
        pattern = {"High": 0, "Medium": 0, "Low": 0}
        total_remaining = sum(remaining.values())

        if total_remaining == 0:
            return pattern

        # Distribute proportionally
        for level in ["High", "Medium", "Low"]:
            if remaining[level] > 0:
                proportion = remaining[level] / total_remaining
                assigned = min(remaining[level], round(proportion * size))
                pattern[level] = assigned

        # Adjust if total doesn't match size
        current_total = sum(pattern.values())
        if current_total < size:
            # Add to levels that have remaining students
            for level in ["Medium", "High", "Low"]:  # Prefer Medium first
                if remaining[level] > pattern[level] and current_total < size:
                    pattern[level] += 1
                    current_total += 1
                    if current_total == size:
                        break

        return pattern

    def create_heterogeneous_groups_improved(self, student_data, n_clusters):
        """
        Improved fallback algorithm when DEAP is not available
        """
        # Filter analyzed students
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]

        if not analyzed_students:
            return []

        # Calculate optimal configuration
        optimal_config = self.calculate_optimal_groups(len(analyzed_students))
        n_groups = optimal_config["n_groups"]
        target_sizes = optimal_config["sizes"]

        # Group by motivation
        motivation_groups = {
            "High": [s for s in analyzed_students if s["motivation_level"] == "High"],
            "Medium": [
                s for s in analyzed_students if s["motivation_level"] == "Medium"
            ],
            "Low": [s for s in analyzed_students if s["motivation_level"] == "Low"],
        }

        # Shuffle for fairness
        for students_list in motivation_groups.values():
            random.shuffle(students_list)

        # Initialize groups
        groups = [[] for _ in range(n_groups)]

        # Create uniform distribution patterns
        target_patterns = []
        for size in target_sizes:
            if size == 4:
                # Primary pattern: 1H, 2M, 1L
                target_patterns.append({"High": 1, "Medium": 2, "Low": 1})
            elif size == 3:
                target_patterns.append({"High": 1, "Medium": 1, "Low": 1})
            elif size == 5:
                target_patterns.append({"High": 2, "Medium": 2, "Low": 1})

        # Assign students based on patterns
        remaining_students = dict(motivation_groups)

        for group_idx, pattern in enumerate(target_patterns):
            for level, count in pattern.items():
                for _ in range(count):
                    if remaining_students[level]:
                        student = remaining_students[level].pop(0)
                        groups[group_idx].append(student)

        # Handle remaining students
        all_remaining = []
        for level_students in remaining_students.values():
            all_remaining.extend(level_students)

        # Distribute remaining students to maintain balance
        for student in all_remaining:
            # Find group with minimum size
            min_size_group_idx = min(range(len(groups)), key=lambda x: len(groups[x]))
            groups[min_size_group_idx].append(student)

        return [group for group in groups if group]  # Remove empty groups

    def analyze_group_quality(self, groups):
        """Enhanced group quality analysis with uniformity measurement"""
        analysis = super().analyze_group_quality(groups)

        # Add uniformity score
        uniformity_score = self.calculate_uniformity_score(groups)
        analysis["uniformity_score"] = uniformity_score

        return analysis

    def calculate_uniformity_score(self, groups):
        """
        FINAL FIX: Calculate how uniform the distribution patterns are across groups
        """
        non_empty_groups = [g for g in groups if g]

        if len(non_empty_groups) < 2:
            return 1.0

        # Get distribution counts for each group
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

        # Calculate uniformity for each motivation level
        uniformity_scores = []
        for level in ["High", "Medium", "Low"]:
            counts = [p[level] for p in patterns]

            # Check if all groups have same count (perfect uniformity)
            unique_counts = set(counts)
            if len(unique_counts) == 1:
                uniformity_scores.append(1.0)
            else:
                # Calculate coefficient of variation
                mean_count = np.mean(counts)
                if mean_count > 0:
                    std_count = np.std(counts)
                    cv = std_count / mean_count
                    # Convert CV to uniformity score
                    # CV of 0 = uniformity 1.0, CV of 1 = uniformity 0
                    uniformity = max(0, 1 - cv)
                    uniformity_scores.append(uniformity)
                else:
                    # All zeros - perfectly uniform
                    uniformity_scores.append(1.0)

        final_score = np.mean(uniformity_scores) if uniformity_scores else 0.0
        return final_score

    # ... rest of the existing methods remain the same ...
    def validate_motivation_profiles(self, students):
        """Validate that students have motivation profiles analyzed"""
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

        # Require at least 80% of students to have analyzed motivation profiles
        if analyzed_percentage < 80:
            return {
                "is_valid": False,
                "message": f"Profil motivasi belum lengkap. Hanya {analyzed_students}/{total_students} siswa ({analyzed_percentage:.1f}%) yang sudah dianalisis. Minimal 80% siswa harus memiliki profil motivasi sebelum pembentukan kelompok. Silakan upload data ARCS terlebih dahulu.",
                "distribution": motivation_distribution,
            }

        # Check if there's enough diversity for heterogeneous grouping
        analyzed_levels = {
            k: v
            for k, v in motivation_distribution.items()
            if k != "Unanalyzed" and v > 0
        }
        if len(analyzed_levels) < 2:
            return {
                "is_valid": False,
                "message": f"Variasi tingkat motivasi tidak cukup untuk pembentukan kelompok yang optimal. Saat ini hanya ada {len(analyzed_levels)} tingkat motivasi yang berbeda. Disarankan memiliki minimal 2 tingkat motivasi.",
                "distribution": motivation_distribution,
            }

        return {
            "is_valid": True,
            "message": f"Validasi berhasil. {analyzed_students}/{total_students} siswa siap untuk pembentukan kelompok.",
            "distribution": motivation_distribution,
        }

    def get_motivation_score(self, student):
        """Get motivation score from student profile"""
        try:
            if hasattr(student, "studentmotivationprofile"):
                profile = student.studentmotivationprofile
                if profile.motivation_level:
                    level = profile.motivation_level.lower()
                    if level == "high":
                        return 3
                    elif level == "medium":
                        return 2
                    elif level == "low":
                        return 1
            return 0  # Unanalyzed - will be handled in validation
        except:
            return 0

    def get_motivation_level(self, student):
        """Get motivation level string from student profile"""
        try:
            if hasattr(student, "studentmotivationprofile"):
                profile = student.studentmotivationprofile
                return profile.motivation_level or "Unanalyzed"
            return "Unanalyzed"
        except:
            return "Unanalyzed"

    def create_homogeneous_groups(self, student_data, n_clusters):
        """Create truly homogeneous groups (students with SAME motivation levels)"""
        # Filter out unanalyzed students
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]

        # Group students by motivation level
        high_students = [
            s for s in analyzed_students if s["motivation_level"] == "High"
        ]
        medium_students = [
            s for s in analyzed_students if s["motivation_level"] == "Medium"
        ]
        low_students = [s for s in analyzed_students if s["motivation_level"] == "Low"]

        # Shuffle within each level for randomness
        import random

        random.shuffle(high_students)
        random.shuffle(medium_students)
        random.shuffle(low_students)

        groups = []

        # Strategy 1: Create pure groups by level (prioritize homogeneity)
        def create_pure_groups(students, level_name):
            """Create groups with only students from same motivation level"""
            if not students:
                return []

            # Calculate how many groups we can make from this level
            students_per_group = max(2, len(students) // min(n_clusters, len(students)))
            level_groups = []

            for i in range(0, len(students), students_per_group):
                group_students = students[i : i + students_per_group]
                if len(group_students) >= 1:  # Allow single-student groups if necessary
                    level_groups.append(group_students)

            return level_groups

        # Create pure groups for each level
        high_groups = create_pure_groups(high_students, "High")
        medium_groups = create_pure_groups(medium_students, "Medium")
        low_groups = create_pure_groups(low_students, "Low")

        # Combine all pure groups
        all_pure_groups = high_groups + medium_groups + low_groups

        # If we have more groups than desired, merge the smallest ones
        while len(all_pure_groups) > n_clusters:
            # Find two smallest groups with same motivation level
            sizes = [(i, len(group)) for i, group in enumerate(all_pure_groups)]
            sizes.sort(key=lambda x: x[1])

            # Try to merge groups with same motivation level first
            merged = False
            for i in range(len(sizes) - 1):
                idx1 = sizes[i][0]
                for j in range(i + 1, len(sizes)):
                    idx2 = sizes[j][0]

                    # Check if they have same motivation level
                    if (
                        all_pure_groups[idx1]
                        and all_pure_groups[idx2]
                        and all_pure_groups[idx1][0]["motivation_level"]
                        == all_pure_groups[idx2][0]["motivation_level"]
                    ):

                        # Merge the two groups
                        all_pure_groups[idx1].extend(all_pure_groups[idx2])
                        all_pure_groups.pop(idx2)
                        merged = True
                        break
                if merged:
                    break

            # If no same-level merge possible, merge smallest groups
            if not merged:
                smallest_idx = sizes[0][0]
                second_smallest_idx = sizes[1][0]
                all_pure_groups[smallest_idx].extend(
                    all_pure_groups[second_smallest_idx]
                )
                all_pure_groups.pop(second_smallest_idx)

        # If we have fewer groups than desired, pad with empty groups
        while len(all_pure_groups) < n_clusters:
            all_pure_groups.append([])

        return all_pure_groups[:n_clusters]

    def calculate_optimal_groups(self, total_students):
        """Calculate optimal number of groups and their sizes"""

        # Try different group configurations
        configs = []

        # Configuration 1: All groups size 4
        if total_students % 4 == 0:
            configs.append(
                {
                    "n_groups": total_students // 4,
                    "sizes": [4] * (total_students // 4),
                    "variance": 0,
                    "priority": 1,  # Highest priority
                }
            )

        # Configuration 2: Mix of 4 and 5
        for size4_groups in range(total_students // 4 + 1):
            remaining = total_students - (size4_groups * 4)
            if remaining >= 0 and remaining % 5 == 0:
                size5_groups = remaining // 5
                total_groups = size4_groups + size5_groups
                if 3 <= total_groups <= 12:  # Reasonable range
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

        # Configuration 3: Mix of 3, 4, and 5
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

        # Choose best configuration
        if configs:
            # Sort by priority first, then by variance
            configs.sort(key=lambda x: (x["priority"], x["variance"]))
            return configs[0]

        # Fallback: create groups of approximately equal size
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
        """Calculate variance in group sizes"""
        if not sizes:
            return 0
        mean_size = sum(sizes) / len(sizes)
        return sum((size - mean_size) ** 2 for size in sizes) / len(sizes)

    def analyze_group_quality(self, groups):
        """Enhanced group quality analysis with uniformity measurement"""
        import math

        # Consider ALL groups, including empty ones
        analysis = {
            "total_groups": len(groups),
            "group_details": [],
            "heterogeneity_score": 0,
            "balance_score": 0,
            "interpretation": {},
        }

        for i, group in enumerate(groups):
            if len(group) == 0:
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

                # Count motivation levels in this group
                for student in group:
                    level = student["motivation_level"]
                    if level in group_analysis["motivation_distribution"]:
                        group_analysis["motivation_distribution"][level] += 1

                # Calculate heterogeneity index (Shannon diversity)
                dist = group_analysis["motivation_distribution"]
                total = sum(dist.values())
                if total > 0:
                    diversity_sum = 0
                    for count in dist.values():
                        if count > 0:
                            proportion = count / total
                            diversity_sum += proportion * math.log(proportion)

                    # Normalize to 0-1 scale
                    max_diversity = math.log(min(3, total))
                    group_analysis["heterogeneity_index"] = (
                        -diversity_sum / max_diversity if max_diversity > 0 else 0
                    )

            analysis["group_details"].append(group_analysis)

        # Calculate heterogeneity score (average of non-empty groups)
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

        # Calculate balance score
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
            empty_penalty = 0.8 if has_empty_groups else 0
            analysis["balance_score"] = max(0, min(1, balance_raw - empty_penalty))
        else:
            analysis["balance_score"] = 1.0

        # ADD UNIFORMITY SCORE
        uniformity_score = self.calculate_uniformity_score(groups)
        analysis["uniformity_score"] = uniformity_score

        return analysis

    def generate_group_code(self):
        """Generate unique group code"""
        return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
