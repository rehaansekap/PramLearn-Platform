from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import models
from django.db.models import Count, Q, Avg
from pramlearnapp.models import Material
from pramlearnapp.models.arcs_questionnaire import (
    ARCSQuestionnaire,
    ARCSQuestion,
    ARCSResponse,
)
from pramlearnapp.models.subject import SubjectClass
from pramlearnapp.serializers.teacher.arcs_questionnaire import (
    ARCSQuestionnaireSerializer,
    ARCSQuestionnaireCreateSerializer,
    ARCSQuestionSerializer,
    ARCSResponseSerializer,
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherSessionARCSQuestionnaireListView(APIView):
    """
    API untuk mendapatkan daftar kuesioner ARCS dalam material
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        try:
            # Verify material and teacher access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            # Get questionnaires for this material
            questionnaires = ARCSQuestionnaire.objects.filter(
                material=material
            ).prefetch_related("questions", "responses")

            serializer = ARCSQuestionnaireSerializer(questionnaires, many=True)

            return Response(
                {
                    "questionnaires": serializer.data,
                    "material_title": material.title,
                    "total_count": questionnaires.count(),
                },
                status=status.HTTP_200_OK,
            )

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, material_slug):
        """Create new ARCS questionnaire"""
        try:
            # Verify material and teacher access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            # Add material and created_by to the data
            data = request.data.copy()
            data["material"] = material.id
            data["created_by"] = request.user.id

            serializer = ARCSQuestionnaireCreateSerializer(data=data)
            if serializer.is_valid():
                questionnaire = serializer.save(
                    material=material, created_by=request.user
                )

                response_serializer = ARCSQuestionnaireSerializer(questionnaire)
                return Response(
                    response_serializer.data, status=status.HTTP_201_CREATED
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherSessionARCSQuestionnaireDetailView(APIView):
    """
    API untuk detail, update, dan delete kuesioner ARCS
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, questionnaire_id):
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            serializer = ARCSQuestionnaireSerializer(questionnaire)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, material_slug, questionnaire_id):
        """Update questionnaire"""
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            serializer = ARCSQuestionnaireCreateSerializer(
                questionnaire, data=request.data, partial=True
            )

            if serializer.is_valid():
                questionnaire = serializer.save()
                response_serializer = ARCSQuestionnaireSerializer(questionnaire)
                return Response(response_serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, material_slug, questionnaire_id):
        """Delete questionnaire"""
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            questionnaire.delete()
            return Response(
                {"message": "Questionnaire deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherSessionARCSQuestionManagementView(APIView):
    """
    API untuk mengelola pertanyaan dalam kuesioner ARCS
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, questionnaire_id):
        """Get questions for a questionnaire"""
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            questions = questionnaire.questions.all()
            serializer = ARCSQuestionSerializer(questions, many=True)

            return Response(
                {
                    "questions": serializer.data,
                    "questionnaire_title": questionnaire.title,
                    "total_count": questions.count(),
                },
                status=status.HTTP_200_OK,
            )

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, material_slug, questionnaire_id):
        """Add new question to questionnaire"""
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            # Auto-assign order if not provided
            data = request.data.copy()
            if "order" not in data:
                max_order = (
                    questionnaire.questions.aggregate(max_order=models.Max("order"))[
                        "max_order"
                    ]
                    or 0
                )
                data["order"] = max_order + 1

            serializer = ARCSQuestionSerializer(data=data)
            if serializer.is_valid():
                question = serializer.save(questionnaire=questionnaire)
                return Response(
                    ARCSQuestionSerializer(question).data,
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherSessionARCSResponsesView(APIView):
    """
    API untuk melihat response/jawaban siswa terhadap kuesioner ARCS
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, questionnaire_id):
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            responses = (
                ARCSResponse.objects.filter(questionnaire=questionnaire)
                .select_related("student")
                .prefetch_related("answers")
            )

            serializer = ARCSResponseSerializer(responses, many=True)

            # Calculate statistics
            total_responses = responses.count()
            completed_responses = responses.filter(is_completed=True).count()
            completion_rate = (
                (completed_responses / total_responses * 100)
                if total_responses > 0
                else 0
            )

            return Response(
                {
                    "responses": serializer.data,
                    "statistics": {
                        "total_responses": total_responses,
                        "completed_responses": completed_responses,
                        "completion_rate": round(completion_rate, 1),
                    },
                    "questionnaire_title": questionnaire.title,
                },
                status=status.HTTP_200_OK,
            )

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherSessionARCSAnalyticsView(APIView):
    """
    API untuk analisis hasil kuesioner ARCS
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, questionnaire_id):
        try:
            # Verify access
            material = get_object_or_404(Material, slug=material_slug)
            SubjectClass.objects.get(subject=material.subject, teacher=request.user)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, id=questionnaire_id, material=material
            )

            # Calculate ARCS dimension averages
            from pramlearnapp.models.arcs_questionnaire import ARCSAnswer

            dimension_stats = {}
            for dimension, _ in ARCSQuestion.ARCS_DIMENSIONS:
                questions = questionnaire.questions.filter(dimension=dimension)
                if questions.exists():
                    answers = ARCSAnswer.objects.filter(
                        question__in=questions,
                        response__is_completed=True,
                        likert_value__isnull=False,
                    )

                    if answers.exists():
                        avg_score = answers.aggregate(avg=Avg("likert_value"))["avg"]
                        dimension_stats[dimension] = {
                            "average_score": round(avg_score, 2),
                            "total_responses": answers.count(),
                            "questions_count": questions.count(),
                        }
                    else:
                        dimension_stats[dimension] = {
                            "average_score": 0,
                            "total_responses": 0,
                            "questions_count": questions.count(),
                        }

            return Response(
                {
                    "dimension_statistics": dimension_stats,
                    "questionnaire_title": questionnaire.title,
                    "questionnaire_type": questionnaire.questionnaire_type,
                },
                status=status.HTTP_200_OK,
            )

        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You don't have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
