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
        """Handle GET requests for both PDF export and class analysis"""
        logger.info(f"GET request for material: {material_slug}")

        # Check if this is a class analysis request by checking the URL path
        if "class-analysis" in request.path:
            return self.get_class_analysis(request, material_slug)

        # Otherwise, handle PDF export (existing code)
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

            # Check if groups exist for this material
            groups = Group.objects.filter(material=material)
            if not groups.exists():
                return Response(
                    {"error": "Belum ada kelompok yang terbentuk untuk material ini"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Get material info
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

            # Get groups with members
            groups_data = []
            groups_for_analysis = []

            for group in groups:
                members = GroupMember.objects.filter(group=group).select_related(
                    "student"
                )
                group_members = []
                group_students = []

                # Count motivation levels
                motivation_dist = {"High": 0, "Medium": 0, "Low": 0, "Unanalyzed": 0}

                for member in members:
                    student = member.student
                    motivation_level = (
                        self.get_motivation_level(student) or "Unanalyzed"
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
                            "motivation_level": motivation_level,  # <-- Tambahkan ini!
                        }
                    )

                    # For analysis
                    group_students.append(
                        {
                            "student": student,
                            "motivation_level": motivation_level,
                            "motivation_score": self.get_motivation_score(student),
                        }
                    )

                groups_data.append(
                    {
                        "id": group.id,
                        "name": group.name,
                        "code": group.code,
                        "size": len(group_members),
                        "members": group_members,
                        "motivation_distribution": motivation_dist,
                    }
                )

                if group_students:
                    groups_for_analysis.append(group_students)

            # Analyze group quality
            quality_analysis = self.analyze_group_quality(groups_for_analysis)

            # Determine formation mode based on actual group composition
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
                "priority_mode": "balanced",  # Default for existing groups
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

    def post(self, request, material_slug):
        teacher = request.user
        n_clusters = request.data.get("n_clusters", 3)
        mode = request.data.get("mode", "heterogen")
        # NEW: Check if using adaptive mode
        use_adaptive = request.data.get("use_adaptive", False)
        priority_mode = request.data.get("priority_mode", "balanced")
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

            # NEW: Adaptive algorithm - analyze class characteristics
            if use_adaptive and mode == "heterogen":
                class_analysis = self.analyze_class_characteristics(students)
                recommended_mode = self.get_recommended_priority_mode(class_analysis)

                # Override priority_mode if using adaptive
                original_priority_mode = priority_mode
                priority_mode = recommended_mode["mode"]

                # Store analysis results for response
                adaptive_info = {
                    "original_mode": original_priority_mode,
                    "recommended_mode": recommended_mode,
                    "class_analysis": class_analysis,
                    "used_adaptive": True,
                }
            else:
                adaptive_info = {"used_adaptive": False}

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

            # Create groups based on mode with priority mode
            if mode == "homogen":
                groups = self.create_homogeneous_groups(student_data, n_clusters)
            else:  # heterogen
                if DEAP_AVAILABLE:
                    groups = self.create_heterogeneous_groups_deap(
                        student_data, n_clusters, priority_mode
                    )
                else:
                    groups = self.create_heterogeneous_groups_improved(
                        student_data, n_clusters, priority_mode
                    )

            # Save groups to database
            created_groups = []
            for i, group_members in enumerate(groups):
                if not group_members:
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

            # Generate quality message with priority mode info
            quality_message = self.generate_quality_message(
                quality_analysis, mode, priority_mode
            )

            # Generate warning if needed
            warning = None
            if validation_result.get("distribution", {}).get("Unanalyzed", 0) > 0:
                warning = f"Terdapat {validation_result['distribution']['Unanalyzed']} siswa yang belum memiliki profil motivasi."

            response_data = {
                "message": f"Berhasil membentuk {len(created_groups)} kelompok dengan mode {mode}",
                "groups": created_groups,
                "motivation_distribution": validation_result.get("distribution", {}),
                "quality_analysis": quality_analysis,
                "quality_message": quality_message,
                "warning": warning,
                "priority_mode": priority_mode,
                "adaptive_info": adaptive_info,  # NEW: Include adaptive info
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

    def analyze_class_characteristics(self, students):
        """
        Analyze class characteristics to determine optimal priority mode
        """
        total_students = len(students)
        motivation_distribution = {"High": 0, "Medium": 0, "Low": 0, "Unanalyzed": 0}

        # Count motivation levels
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

        # Calculate diversity metrics
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

        # Calculate Shannon Diversity Index
        diversity_index = 0
        for level in ["High", "Medium", "Low"]:
            if motivation_distribution[level] > 0:
                proportion = motivation_distribution[level] / analyzed_students
                diversity_index += proportion * math.log(proportion)

        diversity_index = -diversity_index / math.log(3)  # Normalize to 0-1

        # Calculate size challenge
        ideal_group_size = 4
        remainder = total_students % ideal_group_size
        size_challenge = remainder / ideal_group_size

        # Calculate uniformity potential
        # How evenly can we distribute motivation levels?
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

        # Calculate heterogeneity potential
        # How many groups can have mixed motivation levels?
        optimal_groups = math.ceil(total_students / 4)
        max_mixed_groups = min(
            optimal_groups,
            min(motivation_distribution[level] for level in ["High", "Medium", "Low"]),
        )
        heterogeneity_potential = (
            max_mixed_groups / optimal_groups if optimal_groups > 0 else 0
        )

        # Determine analysis quality
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
        Recommend priority mode based on class characteristics
        """
        diversity_index = class_analysis["diversity_index"]
        size_challenge = class_analysis["size_challenge"]
        uniformity_potential = class_analysis["uniformity_potential"]
        heterogeneity_potential = class_analysis["heterogeneity_potential"]
        total_students = class_analysis["total_students"]

        # Decision tree for mode recommendation
        recommendations = []

        # Size-first conditions
        if size_challenge > 0.5 or total_students % 4 >= 2:
            recommendations.append(
                {
                    "mode": "size_first",
                    "score": 0.8 + (size_challenge * 0.2),
                    "reason": "Kelas memiliki tantangan dalam pembagian ukuran kelompok yang seimbang",
                }
            )

        # Uniformity-first conditions
        if diversity_index > 0.8 and uniformity_potential > 0.6:
            recommendations.append(
                {
                    "mode": "uniformity_first",
                    "score": 0.7 + (diversity_index * 0.3),
                    "reason": "Kelas memiliki keragaman motivasi yang tinggi dan potensi distribusi yang seragam",
                }
            )

        # Heterogeneity-first conditions
        if heterogeneity_potential > 0.7 and diversity_index > 0.6:
            recommendations.append(
                {
                    "mode": "heterogeneity_first",
                    "score": 0.6 + (heterogeneity_potential * 0.4),
                    "reason": "Kelas memiliki potensi tinggi untuk pembelajaran kolaboratif heterogen",
                }
            )

        # Balanced as default
        if diversity_index > 0.3 and diversity_index < 0.8:
            recommendations.append(
                {
                    "mode": "balanced",
                    "score": 0.5 + (0.3 if 0.4 < diversity_index < 0.7 else 0.1),
                    "reason": "Kelas memiliki karakteristik yang seimbang untuk pendekatan standar",
                }
            )

        # Handle edge cases
        if not recommendations:
            recommendations.append(
                {
                    "mode": "balanced",
                    "score": 0.3,
                    "reason": "Kondisi kelas tidak memenuhi kriteria khusus, menggunakan mode standar",
                }
            )

        # Sort by score and return best recommendation
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        best_recommendation = recommendations[0]

        return {
            "mode": best_recommendation["mode"],
            "confidence": best_recommendation["score"],
            "reason": best_recommendation["reason"],
            "alternatives": recommendations[1:3],  # Top 2 alternatives
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

    # Add endpoint for getting class analysis without creating groups
    def get_class_analysis(self, request, material_slug):
        """
        Get class analysis and recommendation without creating groups
        """
        logger.info(f"Class analysis requested for material: {material_slug}")
        teacher = request.user

        try:
            # Get material and verify teacher access
            material = get_object_or_404(Material, slug=material_slug)
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=teacher
            )

            # Get students from the class
            from pramlearnapp.models import ClassStudent

            class_students = ClassStudent.objects.filter(
                class_id=subject_class.class_id
            ).select_related("student")
            students = [cs.student for cs in class_students]

            if not students:
                return Response(
                    {"error": "Tidak ada siswa dalam kelas ini"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate motivation profiles
            validation_result = self.validate_motivation_profiles(students)
            if not validation_result["is_valid"]:
                return Response(
                    {"error": validation_result["message"]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Analyze class characteristics
            class_analysis = self.analyze_class_characteristics(students)
            recommended_mode = self.get_recommended_priority_mode(class_analysis)

            logger.info(f"Class analysis completed for {len(students)} students")

            return Response(
                {
                    "class_analysis": class_analysis,
                    "recommended_mode": recommended_mode,
                    "validation_result": validation_result,
                    "message": "Analisis kelas berhasil",
                }
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
            logger.error(f"Error analyzing class: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create_heterogeneous_groups_deap(
        self, student_data, n_clusters, priority_mode="balanced"
    ):
        """
        Create heterogeneous groups using DEAP genetic algorithm with priority mode
        """
        # Filter analyzed students
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]
        total_students = len(analyzed_students)

        if total_students == 0:
            return [[]]

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
            # Create random group assignment
            individual = [
                random.randint(0, n_groups - 1) for _ in range(total_students)
            ]
            return creator.Individual(individual)

        def evaluate_grouping(individual):
            # Convert individual to groups
            groups = [[] for _ in range(n_groups)]
            for i, group_idx in enumerate(individual):
                groups[group_idx].append(analyzed_students[i])

            # Calculate fitness using priority mode
            return (self.calculate_deap_fitness(groups, target_sizes, priority_mode),)

        def mutate_assignment(individual, indpb):
            for i in range(len(individual)):
                if random.random() < indpb:
                    individual[i] = random.randint(0, n_groups - 1)
            return (individual,)

        def crossover_assignment(ind1, ind2):
            for i in range(len(ind1)):
                if random.random() < 0.5:
                    ind1[i], ind2[i] = ind2[i], ind1[i]
            return ind1, ind2

        # Register functions
        toolbox.register("individual", create_individual)
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        toolbox.register("evaluate", evaluate_grouping)
        toolbox.register("mate", crossover_assignment)
        toolbox.register("mutate", mutate_assignment, indpb=0.1)
        toolbox.register("select", tools.selTournament, tournsize=3)

        # Generate initial population with heuristic solutions
        population = toolbox.population(n=40)

        # Add heuristic solutions
        heuristic_solutions = self.create_heuristic_solutions(
            analyzed_students, n_groups, target_sizes, priority_mode
        )

        for solution in heuristic_solutions[:10]:  # Add up to 10 heuristic solutions
            population.append(creator.Individual(solution))

        # Run genetic algorithm
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

        # Get best solution
        best_individual = tools.selBest(population, k=1)[0]

        # Convert to groups
        final_groups = [[] for _ in range(n_groups)]
        for i, group_idx in enumerate(best_individual):
            final_groups[group_idx].append(analyzed_students[i])

        # Repair solution if needed
        final_groups = self.repair_individual(
            best_individual, n_groups, analyzed_students, target_sizes
        )

        return final_groups

    def calculate_deap_fitness(self, groups, target_sizes, priority_mode="balanced"):
        """
        Calculate fitness score with priority mode weights
        """
        # Get priority mode weights
        weights = self.get_priority_weights(priority_mode)

        # Calculate individual fitness components
        size_score = self.calculate_size_fitness(groups, target_sizes)
        uniformity_score = self.calculate_uniformity_fitness(groups)
        heterogeneity_score = self.calculate_heterogeneity_fitness(groups)

        # Apply priority mode weights
        total_score = (
            size_score * weights["size"]
            + uniformity_score * weights["uniformity"]
            + heterogeneity_score * weights["heterogeneity"]
        )

        return total_score

    def get_priority_weights(self, priority_mode):
        """
        Get weights based on priority mode
        """
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
        """
        Calculate size fitness score (how close groups are to target sizes)
        """
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0.0

        # Calculate size variance
        actual_sizes = [len(g) for g in non_empty_groups]
        if len(actual_sizes) == 0:
            return 0.0

        # Penalize groups that are too large (> 5 students)
        large_group_penalty = sum(max(0, size - 5) for size in actual_sizes) * 0.1

        # Calculate variance from target sizes
        variance = np.var(actual_sizes)

        # Normalize score (lower variance = higher score)
        max_variance = max(target_sizes) ** 2
        size_score = max(0, 1 - (variance / max_variance)) - large_group_penalty

        return max(0, size_score)

    def calculate_uniformity_fitness(self, groups):
        """
        Calculate uniformity fitness score (how uniform the distribution is across groups)
        """
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0.0

        # Calculate motivation distribution for each group
        group_distributions = []
        for group in non_empty_groups:
            if not group:
                continue

            dist = {"High": 0, "Medium": 0, "Low": 0}
            for student in group:
                level = student.get("motivation_level", "Unanalyzed")
                if level in dist:
                    dist[level] += 1

            # Convert to proportions
            total = sum(dist.values())
            if total > 0:
                for level in dist:
                    dist[level] = dist[level] / total

            group_distributions.append(dist)

        if not group_distributions:
            return 0.0

        # Calculate uniformity score
        uniformity_score = 0.0
        for level in ["High", "Medium", "Low"]:
            proportions = [dist[level] for dist in group_distributions]
            if proportions:
                variance = np.var(proportions)
                uniformity_score += max(0, 1 - variance)

        return uniformity_score / 3  # Average across motivation levels

    def calculate_heterogeneity_fitness(self, groups):
        """
        Calculate heterogeneity fitness score (how diverse each group is internally)
        """
        non_empty_groups = [g for g in groups if g]
        if not non_empty_groups:
            return 0.0

        heterogeneity_scores = []
        for group in non_empty_groups:
            if len(group) <= 1:
                heterogeneity_scores.append(0.0)
                continue

            # Count different motivation levels in group
            levels = set(s["motivation_level"] for s in group)
            unique_levels = len(levels)

            # Calculate heterogeneity score
            if unique_levels == 1:
                score = 0.0  # Homogeneous group
            elif unique_levels == 2:
                score = 0.6  # Somewhat heterogeneous
            elif unique_levels == 3:
                score = 1.0  # Fully heterogeneous
            else:
                score = 0.0  # Shouldn't happen with 3 motivation levels

            heterogeneity_scores.append(score)

        return np.mean(heterogeneity_scores) if heterogeneity_scores else 0.0

    def create_heterogeneous_groups_improved(
        self, student_data, n_clusters, priority_mode="balanced"
    ):
        """
        Improved fallback algorithm for heterogeneous groups with priority mode
        """
        analyzed_students = [s for s in student_data if s["motivation_score"] > 0]
        total_students = len(analyzed_students)

        if total_students == 0:
            return [[]]

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

        # Initialize groups
        groups = [[] for _ in range(n_groups)]

        # Strategy based on priority mode
        if priority_mode == "size_first":
            # Prioritize balanced sizes first
            groups = self.distribute_by_size_first(
                motivation_groups, n_groups, target_sizes
            )
        elif priority_mode == "uniformity_first":
            # Prioritize uniform distribution across groups
            groups = self.distribute_by_uniformity_first(
                motivation_groups, n_groups, target_sizes
            )
        elif priority_mode == "heterogeneity_first":
            # Prioritize maximum heterogeneity within groups
            groups = self.distribute_by_heterogeneity_first(
                motivation_groups, n_groups, target_sizes
            )
        else:  # balanced
            # Balanced approach
            groups = self.distribute_balanced(motivation_groups, n_groups, target_sizes)

        return groups

    def distribute_by_size_first(self, motivation_groups, n_groups, target_sizes):
        """
        Distribute students prioritizing size balance
        """
        groups = [[] for _ in range(n_groups)]

        # Combine all students and sort by motivation level for even distribution
        all_students = []
        for level in ["High", "Medium", "Low"]:
            all_students.extend(motivation_groups[level])

        # Shuffle to randomize within each level
        random.shuffle(all_students)

        # Distribute round-robin to ensure size balance
        for i, student in enumerate(all_students):
            group_idx = i % n_groups
            groups[group_idx].append(student)

        return groups

    def distribute_by_uniformity_first(self, motivation_groups, n_groups, target_sizes):
        """
        Distribute students prioritizing uniform distribution across groups
        """
        groups = [[] for _ in range(n_groups)]

        # Distribute each motivation level evenly across groups
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
        """
        Distribute students prioritizing heterogeneity within groups
        """
        groups = [[] for _ in range(n_groups)]

        # First, try to give each group at least one student from each level
        for level in ["High", "Medium", "Low"]:
            students = motivation_groups[level]
            random.shuffle(students)

            # Give one student from this level to each group (if possible)
            for i in range(min(len(students), n_groups)):
                groups[i].append(students[i])

            # Distribute remaining students
            remaining = students[n_groups:]
            for i, student in enumerate(remaining):
                group_idx = i % n_groups
                groups[group_idx].append(student)

        return groups

    def distribute_balanced(self, motivation_groups, n_groups, target_sizes):
        """
        Balanced distribution approach
        """
        groups = [[] for _ in range(n_groups)]

        # Calculate how many students of each level should go to each group
        total_students = sum(len(students) for students in motivation_groups.values())

        for level in ["High", "Medium", "Low"]:
            students = motivation_groups[level]
            random.shuffle(students)

            # Distribute evenly, but consider group size limits
            students_per_group = len(students) // n_groups
            remaining_students = len(students) % n_groups

            student_idx = 0
            for group_idx in range(n_groups):
                # Add base number of students
                for _ in range(students_per_group):
                    if student_idx < len(students):
                        groups[group_idx].append(students[student_idx])
                        student_idx += 1

                # Add one extra student to some groups
                if group_idx < remaining_students and student_idx < len(students):
                    groups[group_idx].append(students[student_idx])
                    student_idx += 1

        return groups

    def generate_quality_message(self, quality_analysis, mode, priority_mode):
        """
        Generate quality message with priority mode information
        """
        if not quality_analysis:
            return "Analisis kualitas tidak tersedia"

        # Get priority mode info
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

    def repair_individual(self, individual, n_groups, all_students, target_sizes):
        """
        Repair individual to ensure valid group assignments
        """
        # Convert individual to groups
        groups = [[] for _ in range(n_groups)]
        for i, group_idx in enumerate(individual):
            if 0 <= group_idx < n_groups:
                groups[group_idx].append(all_students[i])

        return groups

    def create_heuristic_solutions(
        self, students, n_groups, target_sizes, priority_mode="balanced"
    ):
        """
        Create heuristic solutions for initial population
        """
        solutions = []

        # Solution 1: Round-robin assignment
        solutions.append(self.create_round_robin_solution(students, n_groups))

        # Solution 2: Balanced by motivation level
        solutions.append(
            self.create_balanced_solution(students, n_groups, target_sizes)
        )

        # Solution 3: Priority-based solutions
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

        # Solution 4: Random with constraints
        for _ in range(2):
            solution = [random.randint(0, n_groups - 1) for _ in range(len(students))]
            solutions.append(solution)

        return solutions

    def create_round_robin_solution(self, students, n_groups):
        """
        Create round-robin solution
        """
        solution = []
        for i in range(len(students)):
            solution.append(i % n_groups)
        return solution

    def create_balanced_solution(self, students, n_groups, target_sizes):
        """
        Create balanced solution by motivation level
        """
        # Group students by motivation level
        motivation_groups = {"High": [], "Medium": [], "Low": []}

        for i, student in enumerate(students):
            level = student["motivation_level"]
            if level in motivation_groups:
                motivation_groups[level].append(i)

        # Create solution
        solution = [0] * len(students)

        # Distribute each motivation level evenly
        for level, indices in motivation_groups.items():
            for i, student_idx in enumerate(indices):
                group_idx = i % n_groups
                solution[student_idx] = group_idx

        return solution

    def create_size_first_solution(self, students, n_groups, target_sizes):
        """
        Create solution prioritizing size balance
        """
        solution = [0] * len(students)
        group_sizes = [0] * n_groups

        for i, student in enumerate(students):
            # Find group with minimum size
            min_group = min(range(n_groups), key=lambda x: group_sizes[x])
            solution[i] = min_group
            group_sizes[min_group] += 1

        return solution

    def create_uniformity_first_solution(self, students, n_groups, target_sizes):
        """
        Create solution prioritizing uniformity
        """
        # Group by motivation level
        motivation_indices = {"High": [], "Medium": [], "Low": []}

        for i, student in enumerate(students):
            level = student["motivation_level"]
            if level in motivation_indices:
                motivation_indices[level].append(i)

        solution = [0] * len(students)

        # Distribute each level evenly
        for level, indices in motivation_indices.items():
            for i, student_idx in enumerate(indices):
                group_idx = i % n_groups
                solution[student_idx] = group_idx

        return solution

    def create_heterogeneity_first_solution(self, students, n_groups, target_sizes):
        """
        Create solution prioritizing heterogeneity
        """
        solution = [0] * len(students)

        # Group by motivation level
        motivation_indices = {"High": [], "Medium": [], "Low": []}

        for i, student in enumerate(students):
            level = student["motivation_level"]
            if level in motivation_indices:
                motivation_indices[level].append(i)

        # First round: one from each level to each group
        group_idx = 0
        for level in ["High", "Medium", "Low"]:
            indices = motivation_indices[level]
            for i in range(min(len(indices), n_groups)):
                if indices:
                    student_idx = indices.pop(0)
                    solution[student_idx] = group_idx
                    group_idx = (group_idx + 1) % n_groups

        # Second round: distribute remaining
        all_remaining = []
        for indices in motivation_indices.values():
            all_remaining.extend(indices)

        for i, student_idx in enumerate(all_remaining):
            solution[student_idx] = i % n_groups

        return solution

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

    def calculate_uniformity_score(self, groups):
        """
        Calculate how uniform the distribution patterns are across groups
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

    def generate_group_code(self):
        """Generate unique group code"""
        return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
