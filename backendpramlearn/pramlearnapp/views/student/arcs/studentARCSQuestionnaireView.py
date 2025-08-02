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
    API untuk mendapatkan daftar kuesioner ARCS yang tersedia untuk siswa

    Endpoint ini menampilkan semua kuesioner ARCS dalam suatu material beserta
    status penyelesaian dan ketersediaan untuk diisi oleh siswa
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, material_slug):
        """
        Mengambil daftar kuesioner ARCS untuk material tertentu

        Args:
            material_slug (str): Slug identifier untuk material pembelajaran

        Returns:
            Response: Daftar kuesioner dengan status dan informasi terkait
        """
        try:
            logger.info(
                f"Siswa {request.user.username} mengakses kuesioner ARCS untuk material: {material_slug}"
            )

            # Mencari material berdasarkan slug
            material = get_object_or_404(Material, slug=material_slug)
            logger.info(f"Material ditemukan: {material.id} - {material.title}")

            # Mengambil semua kuesioner untuk material ini (termasuk yang tidak aktif untuk pengecekan status)
            questionnaires = ARCSQuestionnaire.objects.filter(
                material=material
            ).prefetch_related("questions")

            logger.info(f"Ditemukan {questionnaires.count()} kuesioner")

            # Memproses setiap kuesioner untuk mendapatkan status lengkap
            questionnaires_data = []
            for questionnaire in questionnaires:
                questionnaire_info = self._process_questionnaire_status(
                    questionnaire, request.user
                )
                questionnaires_data.append(questionnaire_info)

            logger.info(f"Mengembalikan {len(questionnaires_data)} kuesioner ke siswa")

            return Response(
                {
                    "material_title": material.title,
                    "questionnaires": questionnaires_data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error saat mengambil daftar kuesioner: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_questionnaire_status(self, questionnaire, student):
        """
        Memproses status kuesioner untuk siswa tertentu

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            student (CustomUser): Siswa yang mengakses

        Returns:
            dict: Informasi lengkap kuesioner dengan status
        """
        # Mengecek apakah siswa sudah menyelesaikan kuesioner ini
        try:
            response = ARCSResponse.objects.get(
                questionnaire=questionnaire, student=student
            )
            is_completed = response.is_completed
            completed_at = response.completed_at
        except ARCSResponse.DoesNotExist:
            is_completed = False
            completed_at = None

        # Mengecek ketersediaan kuesioner untuk diisi
        is_available, status_message = questionnaire.is_available_for_submission

        return {
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
            * 2,  # 2 menit per pertanyaan
        }


class StudentARCSQuestionnaireDetailView(APIView):
    """
    API untuk mendapatkan detail kuesioner ARCS beserta pertanyaan-pertanyaannya

    Endpoint ini digunakan ketika siswa akan mengisi kuesioner dan membutuhkan
    semua pertanyaan beserta opsi jawabannya
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, material_slug, questionnaire_id):
        """
        Mengambil detail kuesioner ARCS untuk pengisian

        Args:
            material_slug (str): Slug material pembelajaran
            questionnaire_id (int): ID kuesioner yang akan diakses

        Returns:
            Response: Detail kuesioner dengan semua pertanyaan
        """
        try:
            logger.info(
                f"Siswa {request.user.username} mengakses detail kuesioner {questionnaire_id}"
            )

            # Validasi material dan kuesioner
            material = get_object_or_404(Material, slug=material_slug)
            questionnaire = get_object_or_404(
                ARCSQuestionnaire,
                id=questionnaire_id,
                material=material,
            )

            logger.info(f"Kuesioner ditemukan: {questionnaire.title}")

            # Mengecek ketersediaan kuesioner
            if not self._validate_questionnaire_availability(questionnaire):
                is_available, status_message = questionnaire.is_available_for_submission
                return Response(
                    {"error": status_message},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mengecek apakah siswa sudah menyelesaikan kuesioner
            if self._check_questionnaire_completion(questionnaire, request.user):
                logger.warning(
                    f"Siswa {request.user.username} sudah menyelesaikan kuesioner {questionnaire_id}"
                )
                return Response(
                    {"error": "Kuesioner ini sudah pernah Anda selesaikan"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mengambil dan memproses pertanyaan
            questions_data = self._get_questionnaire_questions(questionnaire)

            # Menyiapkan data response
            questionnaire_data = self._prepare_questionnaire_response(
                questionnaire, material, questions_data
            )

            logger.info(
                f"Mengembalikan detail kuesioner dengan {len(questions_data)} pertanyaan"
            )
            return Response(questionnaire_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error saat mengambil detail kuesioner: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _validate_questionnaire_availability(self, questionnaire):
        """
        Memvalidasi apakah kuesioner tersedia untuk diisi

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner

        Returns:
            bool: True jika tersedia, False jika tidak
        """
        is_available, _ = questionnaire.is_available_for_submission
        return is_available

    def _check_questionnaire_completion(self, questionnaire, student):
        """
        Mengecek apakah siswa sudah menyelesaikan kuesioner

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            student (CustomUser): Siswa yang mengakses

        Returns:
            bool: True jika sudah selesai, False jika belum
        """
        try:
            existing_response = ARCSResponse.objects.get(
                questionnaire=questionnaire, student=student
            )
            return existing_response.is_completed
        except ARCSResponse.DoesNotExist:
            return False

    def _get_questionnaire_questions(self, questionnaire):
        """
        Mengambil dan memproses semua pertanyaan dalam kuesioner

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner

        Returns:
            list: Daftar pertanyaan yang sudah diproses
        """
        questions = questionnaire.questions.all().order_by("order")
        logger.info(f"Ditemukan {questions.count()} pertanyaan")

        questions_data = []
        for question in questions:
            question_data = self._process_question_data(question)
            questions_data.append(question_data)
            logger.debug(f"Pertanyaan {question.id}: {question.text[:50]}...")

        return questions_data

    def _process_question_data(self, question):
        """
        Memproses data pertanyaan individual

        Args:
            question (ARCSQuestion): Objek pertanyaan

        Returns:
            dict: Data pertanyaan yang sudah diproses
        """
        # Menentukan tipe pertanyaan dan mengatur nilai skala
        if question.question_type == "likert_5":
            scale_min, scale_max = 1, 5
        elif question.question_type == "likert_7":
            scale_min, scale_max = 1, 7
        else:
            scale_min = scale_max = None

        return {
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

    def _prepare_questionnaire_response(self, questionnaire, material, questions_data):
        """
        Menyiapkan data response untuk kuesioner

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            material (Material): Objek material
            questions_data (list): Data pertanyaan yang sudah diproses

        Returns:
            dict: Data response yang lengkap
        """
        return {
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


class StudentARCSResponseSubmitView(APIView):
    """
    API untuk submit jawaban kuesioner ARCS dari siswa

    Endpoint ini menangani penyimpanan jawaban kuesioner dan memicu
    proses clustering otomatis untuk memperbarui profil motivasi siswa
    """

    permission_classes = [IsAuthenticated, IsStudentUser]

    def post(self, request, material_slug, arcs_slug):
        """
        Menyimpan jawaban kuesioner ARCS dan memproses clustering

        Args:
            material_slug (str): Slug material pembelajaran
            arcs_slug (str): Slug kuesioner ARCS

        Returns:
            Response: Konfirmasi penyimpanan dan hasil clustering
        """
        try:
            logger.info(
                f"Siswa {request.user.username} submit kuesioner ARCS: {arcs_slug}"
            )

            # Validasi material dan kuesioner
            material = get_object_or_404(Material, slug=material_slug)
            questionnaire = get_object_or_404(
                ARCSQuestionnaire,
                slug=arcs_slug,
                material=material,
                is_active=True,
            )

            # Mengecek apakah siswa sudah menyelesaikan kuesioner
            if self._check_existing_completion(questionnaire, request.user):
                return Response(
                    {"error": "Kuesioner ini sudah pernah Anda selesaikan"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Memvalidasi data jawaban
            answers_data = request.data.get("answers", [])
            if not self._validate_answers_data(answers_data):
                return Response(
                    {"error": "Jawaban tidak boleh kosong"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Menyimpan jawaban dan memproses clustering
            response = self._save_questionnaire_response(
                questionnaire, request.user, answers_data
            )

            logger.info(f"Kuesioner berhasil diselesaikan oleh {request.user.username}")

            return Response(
                {
                    "message": "Kuesioner berhasil diselesaikan dan profil motivasi telah diperbarui",
                    "response_id": response.id,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Error saat submit kuesioner: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _check_existing_completion(self, questionnaire, student):
        """
        Mengecek apakah siswa sudah menyelesaikan kuesioner

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            student (CustomUser): Siswa yang mengakses

        Returns:
            bool: True jika sudah selesai, False jika belum
        """
        try:
            existing_response = ARCSResponse.objects.get(
                questionnaire=questionnaire, student=student
            )
            return existing_response.is_completed
        except ARCSResponse.DoesNotExist:
            return False

    def _validate_answers_data(self, answers_data):
        """
        Memvalidasi data jawaban yang dikirim

        Args:
            answers_data (list): Data jawaban dari request

        Returns:
            bool: True jika valid, False jika tidak
        """
        return answers_data and len(answers_data) > 0

    def _save_questionnaire_response(self, questionnaire, student, answers_data):
        """
        Menyimpan response kuesioner dan jawaban-jawabannya

        Args:
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            student (CustomUser): Siswa yang menjawab
            answers_data (list): Data jawaban

        Returns:
            ARCSResponse: Objek response yang telah disimpan
        """
        # Membuat atau mengambil response object
        response, created = ARCSResponse.objects.get_or_create(
            questionnaire=questionnaire,
            student=student,
            defaults={"submitted_at": timezone.now(), "is_completed": False},
        )

        # Menyimpan jawaban-jawaban
        saved_answers = self._save_individual_answers(
            response, questionnaire, answers_data
        )

        # Menandai response sebagai selesai
        response.is_completed = True
        response.completed_at = timezone.now()
        response.save()

        # Memproses skor ARCS dan memperbarui profil motivasi
        self._process_arcs_scores_and_clustering(student, questionnaire, saved_answers)

        return response

    def _save_individual_answers(self, response, questionnaire, answers_data):
        """
        Menyimpan jawaban individual untuk setiap pertanyaan

        Args:
            response (ARCSResponse): Objek response
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            answers_data (list): Data jawaban

        Returns:
            list: Daftar objek ARCSAnswer yang telah disimpan
        """
        saved_answers = []

        for answer_data in answers_data:
            question_id = answer_data.get("question_id")

            try:
                question = ARCSQuestion.objects.get(
                    id=question_id, questionnaire=questionnaire
                )
            except ARCSQuestion.DoesNotExist:
                logger.warning(f"Pertanyaan dengan ID {question_id} tidak ditemukan")
                continue

            # Membuat atau memperbarui jawaban
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
                # Memperbarui jawaban yang sudah ada
                answer.text_value = answer_data.get("text_value")
                answer.choice_value = answer_data.get("choice_value")
                answer.likert_value = answer_data.get("likert_value")
                answer.save()

            saved_answers.append(answer)

        logger.info(f"Berhasil menyimpan {len(saved_answers)} jawaban")
        return saved_answers

    def _process_arcs_scores_and_clustering(self, student, questionnaire, answers):
        """
        Memproses skor ARCS dan memperbarui profil motivasi menggunakan clustering

        Proses yang dilakukan:
        1. Menghitung skor rata-rata untuk setiap dimensi ARCS
        2. Menyimpan/memperbarui profil motivasi siswa
        3. Menjalankan clustering untuk semua siswa

        Args:
            student (CustomUser): Siswa yang mengisi kuesioner
            questionnaire (ARCSQuestionnaire): Objek kuesioner
            answers (list): Daftar objek ARCSAnswer
        """
        try:
            logger.info(f"Memproses skor ARCS untuk siswa {student.username}")

            # Menghitung skor dimensi ARCS
            dimension_scores = self._calculate_arcs_dimension_scores(answers)

            # Menyimpan/memperbarui profil motivasi siswa
            self._update_student_motivation_profile(student, dimension_scores)

            # Menjalankan clustering untuk semua siswa
            self._trigger_motivation_clustering()

            logger.info(f"Profil motivasi siswa {student.username} berhasil diperbarui")

        except Exception as e:
            # Log error tapi tidak gagalkan request utama
            logger.error(f"Error saat memproses skor ARCS: {str(e)}")

    def _calculate_arcs_dimension_scores(self, answers):
        """
        Menghitung skor rata-rata untuk setiap dimensi ARCS

        Args:
            answers (list): Daftar objek ARCSAnswer

        Returns:
            dict: Skor rata-rata per dimensi ARCS
        """
        dimension_scores = {}
        dimensions = ["attention", "relevance", "confidence", "satisfaction"]

        for dimension in dimensions:
            # Mengambil jawaban untuk dimensi tertentu
            dimension_answers = [
                answer
                for answer in answers
                if answer.question.dimension == dimension
                and answer.likert_value is not None
            ]

            if dimension_answers:
                # Menghitung rata-rata skor untuk dimensi ini
                total_score = sum(answer.likert_value for answer in dimension_answers)
                avg_score = total_score / len(dimension_answers)
                dimension_scores[dimension] = round(avg_score, 2)
            else:
                dimension_scores[dimension] = 0.0

        logger.info(f"Skor dimensi ARCS: {dimension_scores}")
        return dimension_scores

    def _update_student_motivation_profile(self, student, dimension_scores):
        """
        Menyimpan atau memperbarui profil motivasi siswa

        Args:
            student (CustomUser): Siswa yang mengisi kuesioner
            dimension_scores (dict): Skor dimensi ARCS
        """
        from pramlearnapp.models.user import StudentMotivationProfile

        # Membuat atau mengambil profil motivasi siswa
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
            # Memperbarui profil yang sudah ada dengan skor baru
            profile.attention = dimension_scores["attention"]
            profile.relevance = dimension_scores["relevance"]
            profile.confidence = dimension_scores["confidence"]
            profile.satisfaction = dimension_scores["satisfaction"]
            profile.save()

        logger.info(
            f"Profil motivasi {'dibuat' if created else 'diperbarui'} untuk siswa {student.username}"
        )

    def _trigger_motivation_clustering(self):
        """
        Menjalankan proses clustering untuk memperbarui level motivasi semua siswa
        """
        from pramlearnapp.views.student.arcs.arcs_processor import ARCSProcessor

        try:
            logger.info("Memulai proses clustering motivasi siswa")

            processor = ARCSProcessor()
            clustering_result = processor.update_all_motivation_levels()

            if clustering_result:
                logger.info(f"Clustering berhasil: {clustering_result}")
            else:
                logger.warning("Clustering tidak dijalankan (data tidak cukup)")

        except Exception as e:
            logger.error(f"Error saat menjalankan clustering: {str(e)}")


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
