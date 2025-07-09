from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

from pramlearnapp.models import Material
from pramlearnapp.models.arcs_questionnaire import (
    ARCSQuestionnaire,
    ARCSQuestion,
    ARCSResponse,
    ARCSAnswer,
)
from pramlearnapp.permissions import IsStudentUser
from pramlearnapp.serializers.student.arcs_questionnaire import (
    StudentARCSQuestionnaireSerializer,
    StudentARCSQuestionSerializer,
    StudentARCSResponseSerializer,
)

logger = logging.getLogger(__name__)


class StudentARCSQuestionnaireListView(APIView):
    """
    API untuk mendapatkan daftar kuesioner ARCS yang aktif untuk material tertentu
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, material_slug):
        try:
            logger.info(f"Fetching ARCS questionnaires for material: {material_slug}")

            material = get_object_or_404(Material, slug=material_slug)
            logger.info(f"Material found: {material.id} - {material.title}")

            # Get questionnaires for this material (including inactive for status check)
            questionnaires = ARCSQuestionnaire.objects.filter(
                material=material
            ).prefetch_related("questions")

            logger.info(f"Found {questionnaires.count()} questionnaires")

            # Check which questionnaires student has already completed
            questionnaires_data = []
            for questionnaire in questionnaires:
                try:
                    response = ARCSResponse.objects.get(
                        questionnaire=questionnaire, student=request.user
                    )
                    is_completed = response.is_completed
                    completed_at = response.completed_at
                except ARCSResponse.DoesNotExist:
                    is_completed = False
                    completed_at = None

                # Check availability
                is_available, status_message = questionnaire.is_available_for_submission

                questionnaires_data.append(
                    {
                        "id": questionnaire.id,
                        "slug": questionnaire.slug,
                        "title": questionnaire.title,
                        "description": questionnaire.description,
                        "questionnaire_type": questionnaire.questionnaire_type,
                        "start_date": questionnaire.start_date,
                        "end_date": questionnaire.end_date,
                        "duration_minutes": questionnaire.duration_minutes,
                        "total_questions": questionnaire.questions.count(),
                        "is_completed": is_completed,
                        "completed_at": completed_at,
                        "is_available": is_available,
                        "status_message": status_message,
                        "time_remaining": questionnaire.time_remaining,
                        "estimated_time": questionnaire.questions.count()
                        * 2,  # 2 minutes per question
                    }
                )

            logger.info(f"Returning {len(questionnaires_data)} questionnaires")

            return Response(
                {
                    "material_title": material.title,
                    "questionnaires": questionnaires_data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error fetching questionnaires: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Update StudentARCSQuestionnaireDetailView untuk check availability
class StudentARCSQuestionnaireDetailView(APIView):
    """
    API untuk mendapatkan detail kuesioner ARCS beserta pertanyaan-pertanyaannya
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, material_slug, questionnaire_id):
        try:
            logger.info(
                f"Fetching questionnaire detail: {questionnaire_id} for material: {material_slug}"
            )

            material = get_object_or_404(Material, slug=material_slug)
            questionnaire = get_object_or_404(
                ARCSQuestionnaire,
                id=questionnaire_id,
                material=material,
            )

            logger.info(f"Questionnaire found: {questionnaire.title}")

            # Check availability
            is_available, status_message = questionnaire.is_available_for_submission
            if not is_available:
                return Response(
                    {"error": status_message},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if student has already completed this questionnaire
            try:
                existing_response = ARCSResponse.objects.get(
                    questionnaire=questionnaire, student=request.user
                )
                if existing_response.is_completed:
                    logger.warning(
                        f"Student {request.user.username} already completed questionnaire {questionnaire_id}"
                    )
                    return Response(
                        {"error": "Kuesioner ini sudah pernah Anda selesaikan"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except ARCSResponse.DoesNotExist:
                logger.info("No existing response found")

            # Get questions with their data
            questions = questionnaire.questions.all().order_by("order")
            logger.info(f"Found {questions.count()} questions")

            questions_data = []
            for question in questions:
                # Determine question type and set scale values
                if question.question_type == "likert_5":
                    scale_min, scale_max = 1, 5
                elif question.question_type == "likert_7":
                    scale_min, scale_max = 1, 7
                else:
                    scale_min = scale_max = None

                question_data = {
                    "id": question.id,
                    "text": question.text,
                    "dimension": question.dimension,
                    "order": question.order,
                    "question_type": question.question_type,
                    "is_required": question.is_required,
                    "choices": (
                        question.choices
                        if question.question_type == "multiple_choice"
                        else None
                    ),
                    "scale_min": scale_min,
                    "scale_max": scale_max,
                    "scale_labels": (
                        question.scale_labels
                        if question.question_type in ["likert_5", "likert_7"]
                        else None
                    ),
                }
                questions_data.append(question_data)
                logger.debug(f"Question {question.id}: {question.text[:50]}...")

            serializer_data = {
                "id": questionnaire.id,
                "title": questionnaire.title,
                "description": questionnaire.description,
                "questionnaire_type": questionnaire.questionnaire_type,
                "material_title": material.title,
                "start_date": questionnaire.start_date,
                "end_date": questionnaire.end_date,
                "duration_minutes": questionnaire.duration_minutes,
                "time_remaining": questionnaire.time_remaining,
                "questions": questions_data,
                "total_questions": len(questions_data),
            }

            logger.info(
                f"Returning questionnaire detail with {len(questions_data)} questions"
            )
            return Response(serializer_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching questionnaire detail: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentARCSResponseSubmitView(APIView):
    """
    API untuk submit jawaban kuesioner ARCS dari student
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def post(self, request, material_slug, arcs_slug):
        try:
            material = get_object_or_404(Material, slug=material_slug)
            questionnaire = get_object_or_404(
                ARCSQuestionnaire,
                slug=arcs_slug,
                material=material,
                is_active=True,
            )

            # Check if student has already completed this questionnaire
            try:
                existing_response = ARCSResponse.objects.get(
                    questionnaire=questionnaire, student=request.user
                )
                if existing_response.is_completed:
                    return Response(
                        {"error": "Kuesioner ini sudah pernah Anda selesaikan"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except ARCSResponse.DoesNotExist:
                pass

            answers_data = request.data.get("answers", [])
            if not answers_data:
                return Response(
                    {"error": "Jawaban tidak boleh kosong"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create or get response
            response, created = ARCSResponse.objects.get_or_create(
                questionnaire=questionnaire,
                student=request.user,
                defaults={"submitted_at": timezone.now(), "is_completed": False},
            )

            # Save answers
            saved_answers = []
            for answer_data in answers_data:
                question_id = answer_data.get("question_id")

                try:
                    question = ARCSQuestion.objects.get(
                        id=question_id, questionnaire=questionnaire
                    )
                except ARCSQuestion.DoesNotExist:
                    continue

                # Create or update answer
                answer, answer_created = ARCSAnswer.objects.get_or_create(
                    response=response,
                    question=question,
                    defaults={
                        "text_value": answer_data.get("text_value"),
                        "choice_value": answer_data.get("choice_value"),
                        "likert_value": answer_data.get("likert_value"),
                    },
                )

                if not answer_created:
                    # Update existing answer
                    answer.text_value = answer_data.get("text_value")
                    answer.choice_value = answer_data.get("choice_value")
                    answer.likert_value = answer_data.get("likert_value")
                    answer.save()

                saved_answers.append(answer)

            # Mark response as completed
            response.is_completed = True
            response.completed_at = timezone.now()
            response.save()

            # Process ARCS scores and update motivation profile
            self._process_arcs_scores(request.user, questionnaire, saved_answers)

            return Response(
                {
                    "message": "Kuesioner berhasil diselesaikan",
                    "response_id": response.id,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Error submitting questionnaire: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_arcs_scores(self, student, questionnaire, answers):
        """
        Process ARCS scores and update student motivation profile using KMeans
        """
        from pramlearnapp.models.user import StudentMotivationProfile
        from pramlearnapp.views.student.arcs.arcs_processor import ARCSProcessor

        try:
            # Calculate dimension scores
            dimension_scores = {}
            dimensions = ["attention", "relevance", "confidence", "satisfaction"]

            for dimension in dimensions:
                dimension_answers = [
                    answer
                    for answer in answers
                    if answer.question.dimension == dimension
                    and answer.likert_value is not None
                ]

                if dimension_answers:
                    total_score = sum(
                        answer.likert_value for answer in dimension_answers
                    )
                    avg_score = total_score / len(dimension_answers)
                    dimension_scores[dimension] = round(avg_score, 2)
                else:
                    dimension_scores[dimension] = 0.0

            # Get or create motivation profile
            profile, created = StudentMotivationProfile.objects.get_or_create(
                student=student,
                defaults={
                    "attention": dimension_scores["attention"],
                    "relevance": dimension_scores["relevance"],
                    "confidence": dimension_scores["confidence"],
                    "satisfaction": dimension_scores["satisfaction"],
                },
            )

            if not created:
                # Update existing profile with new scores
                profile.attention = dimension_scores["attention"]
                profile.relevance = dimension_scores["relevance"]
                profile.confidence = dimension_scores["confidence"]
                profile.satisfaction = dimension_scores["satisfaction"]
                profile.save()

            # Process with KMeans to determine motivation level
            processor = ARCSProcessor()
            processor.update_all_motivation_levels()

        except Exception as e:
            # Log error but don't fail the main request
            logger.error(f"Error processing ARCS scores: {str(e)}")


class StudentARCSBySlugView(APIView):
    """
    API untuk mengakses ARCS questionnaire berdasarkan slug
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, material_slug, arcs_slug):
        try:
            material = get_object_or_404(Material, slug=material_slug)

            questionnaire = get_object_or_404(
                ARCSQuestionnaire, slug=arcs_slug, material=material
            )

            # Check availability
            is_available, status_message = questionnaire.is_available_for_submission
            if not is_available:
                return Response(
                    {"error": status_message},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Serialize questionnaire with questions
            serializer = StudentARCSQuestionnaireSerializer(questionnaire)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except ARCSQuestionnaire.DoesNotExist:
            return Response(
                {"error": "Kuesioner ARCS tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Error in StudentARCSBySlugView: {e}")
            return Response(
                {"error": "Terjadi kesalahan server"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StudentARCSResultsView(APIView):
    """
    API untuk mendapatkan hasil ARCS yang sudah diselesaikan
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, material_slug, arcs_slug):
        try:
            material = get_object_or_404(Material, slug=material_slug)
            questionnaire = get_object_or_404(
                ARCSQuestionnaire, slug=arcs_slug, material=material
            )

            # Get completed response
            try:
                response = ARCSResponse.objects.get(
                    questionnaire=questionnaire, student=request.user, is_completed=True
                )
            except ARCSResponse.DoesNotExist:
                return Response(
                    {"error": "Hasil kuesioner tidak ditemukan"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Get answers
            answers = ARCSAnswer.objects.filter(response=response).select_related(
                "question"
            )
            answers_data = []

            for answer in answers:
                answer_data = {
                    "question_id": answer.question.id,
                    "question_text": answer.question.text,
                    "dimension": answer.question.dimension,
                    "order": answer.question.order,
                    "question_type": answer.question.question_type,
                }

                # Add answer value based on type
                if answer.question.question_type in ["likert_5", "likert_7"]:
                    answer_data["answer_value"] = answer.likert_value
                    answer_data["answer_text"] = (
                        f"{answer.likert_value}/5"
                        if answer.question.question_type == "likert_5"
                        else f"{answer.likert_value}/7"
                    )
                elif answer.question.question_type == "multiple_choice":
                    answer_data["answer_value"] = answer.choice_value
                    answer_data["answer_text"] = answer.choice_value
                else:
                    answer_data["answer_value"] = answer.text_value
                    answer_data["answer_text"] = answer.text_value

                answers_data.append(answer_data)

            # Calculate dimension scores
            dimension_scores = {}
            for dimension in ["attention", "relevance", "confidence", "satisfaction"]:
                dimension_answers = [
                    a
                    for a in answers_data
                    if a["dimension"] == dimension and a.get("answer_value")
                ]
                if dimension_answers:
                    if all(
                        isinstance(a["answer_value"], (int, float))
                        for a in dimension_answers
                    ):
                        avg_score = sum(
                            a["answer_value"] for a in dimension_answers
                        ) / len(dimension_answers)
                        dimension_scores[dimension] = round(avg_score, 2)

            # Get motivation profile if exists
            motivation_level = None
            try:
                if hasattr(request.user, "studentmotivationprofile"):
                    motivation_level = (
                        request.user.studentmotivationprofile.motivation_level
                    )
            except:
                pass

            result_data = {
                "questionnaire": {
                    "id": questionnaire.id,
                    "title": questionnaire.title,
                    "description": questionnaire.description,
                    "questionnaire_type": questionnaire.questionnaire_type,
                    "slug": questionnaire.slug,
                },
                "material": {
                    "title": material.title,
                    "slug": material.slug,
                },
                "response": {
                    "completed_at": response.completed_at,
                    "total_questions": len(answers_data),
                    "answered_questions": len(
                        [a for a in answers_data if a.get("answer_value")]
                    ),
                },
                "dimension_scores": dimension_scores,
                "motivation_level": motivation_level,
                "answers": answers_data,
            }

            return Response(result_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching ARCS results: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
