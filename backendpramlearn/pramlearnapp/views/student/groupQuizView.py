from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pramlearnapp.models import Quiz, Group, GroupMember, GroupQuiz, GroupQuizSubmission, GroupQuizResult, Question
from pramlearnapp.serializers.student.quizSerializer import GroupQuizSerializer, GroupQuizSubmissionSerializer
from django.utils import timezone
from django.db.models import Count, Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class GroupQuizDetailView(APIView):
    """
    API untuk mendapatkan detail quiz kelompok untuk student
    """

    def get(self, request, quiz_slug):
        try:
            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)

            # Get user's group for this quiz
            user_group = GroupMember.objects.filter(
                student=request.user,
                group__material=quiz.material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok untuk quiz ini"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get or create GroupQuiz
            group_quiz = GroupQuiz.objects.filter(
                quiz=quiz,
                group=user_group.group
            ).first()

            if not group_quiz:
                return Response(
                    {"error": "Quiz ini belum di-assign ke kelompok Anda"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get current submissions
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            # Prepare current answers
            current_answers = {}
            for submission in submissions:
                current_answers[submission.question.id] = {
                    'selected_choice': submission.selected_choice,
                    'student_name': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                    'answered_by': submission.student.id
                }

            # Get group members
            group_members = GroupMember.objects.filter(
                group=user_group.group
            ).select_related('student')

            members_data = []
            for member in group_members:
                members_data.append({
                    'id': member.student.id,
                    'username': member.student.username,
                    'full_name': f"{member.student.first_name} {member.student.last_name}".strip() or member.student.username,
                    'is_current_user': member.student.id == request.user.id
                })

            # Serialize quiz data
            quiz_data = {
                'id': quiz.id,
                'title': quiz.title,
                'content': quiz.content,
                'slug': quiz.slug,
                'end_time': group_quiz.end_time,
                'start_time': group_quiz.start_time,
                'questions': [
                    {
                        'id': q.id,
                        'text': q.text,
                        'choice_a': q.choice_a,
                        'choice_b': q.choice_b,
                        'choice_c': q.choice_c,
                        'choice_d': q.choice_d,
                    } for q in quiz.questions.all()
                ],
                'group': {
                    'id': user_group.group.id,
                    'name': user_group.group.name,
                    'code': user_group.group.code,
                    'members': members_data
                },
                'current_answers': current_answers,
                'is_submitted': self.is_quiz_submitted(group_quiz),
                'time_remaining': self.calculate_time_remaining(group_quiz)
            }

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Quiz.DoesNotExist:
            return Response(
                {"error": "Quiz tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def is_quiz_submitted(self, group_quiz):
        """Check if quiz is completed by checking if all questions are answered"""
        total_questions = group_quiz.quiz.questions.count()
        answered_questions = GroupQuizSubmission.objects.filter(
            group_quiz=group_quiz
        ).count()

        return answered_questions >= total_questions

    def calculate_time_remaining(self, group_quiz):
        """Calculate remaining time in seconds"""
        if not group_quiz.end_time:
            return None

        now = timezone.now()
        if now >= group_quiz.end_time:
            return 0

        remaining = group_quiz.end_time - now
        return int(remaining.total_seconds())


class SubmitGroupQuizView(APIView):
    """
    API untuk submit quiz kelompok
    """

    def post(self, request, quiz_slug):
        try:
            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user,
                group__material=quiz.material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get GroupQuiz
            group_quiz = get_object_or_404(
                GroupQuiz,
                quiz=quiz,
                group=user_group.group
            )

            # Check if already submitted
            if self.is_quiz_submitted(group_quiz):
                return Response(
                    {"error": "Quiz sudah di-submit sebelumnya"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate and save score
            result = group_quiz.calculate_and_save_score()

            # Get detailed results
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question')

            total_questions = quiz.questions.count()
            correct_answers = submissions.filter(is_correct=True).count()

            results_data = {
                'group_quiz_id': group_quiz.id,
                'score': result.score,
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'submitted_at': timezone.now(),
                'group_name': user_group.group.name
            }

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def is_quiz_submitted(self, group_quiz):
        """Check if quiz is already submitted"""
        try:
            GroupQuizResult.objects.get(group_quiz=group_quiz)
            return True
        except GroupQuizResult.DoesNotExist:
            return False


class GroupQuizResultsView(APIView):
    """
    API untuk mendapatkan hasil quiz kelompok
    """

    def get(self, request, quiz_slug):
        try:
            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user,
                group__material=quiz.material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get GroupQuiz and result
            group_quiz = get_object_or_404(
                GroupQuiz,
                quiz=quiz,
                group=user_group.group
            )

            try:
                result = GroupQuizResult.objects.get(group_quiz=group_quiz)
            except GroupQuizResult.DoesNotExist:
                return Response(
                    {"error": "Hasil quiz belum tersedia"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get submissions with details
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            answers_detail = []
            for submission in submissions:
                question = submission.question
                answers_detail.append({
                    'question_id': question.id,
                    'question_text': question.text,
                    'selected_answer': submission.selected_choice,
                    'correct_answer': question.correct_choice,
                    'is_correct': submission.is_correct,
                    'answered_by': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username
                })

            results_data = {
                'quiz_title': quiz.title,
                'group_name': user_group.group.name,
                'score': result.score,
                'total_questions': quiz.questions.count(),
                'correct_answers': submissions.filter(is_correct=True).count(),
                'submitted_at': result.created_at,
                'answers': answers_detail
            }

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class SaveGroupQuizAnswerView(APIView):
    """API untuk menyimpan jawaban quiz kelompok"""

    def post(self, request, quiz_slug):
        try:
            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user,
                group__material=quiz.material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get GroupQuiz
            group_quiz = get_object_or_404(
                GroupQuiz,
                quiz=quiz,
                group=user_group.group
            )

            # Extract data from request
            question_id = request.data.get('question_id')
            selected_choice = request.data.get('selected_choice')

            if not question_id or not selected_choice:
                return Response(
                    {"error": "question_id dan selected_choice wajib diisi"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get question
            question = get_object_or_404(Question, id=question_id)

            # Check if answer is correct
            is_correct = question.correct_choice == selected_choice

            # Save or update GroupQuizSubmission
            submission, created = GroupQuizSubmission.objects.update_or_create(
                group_quiz=group_quiz,
                question=question,
                defaults={
                    'student': request.user,
                    'selected_choice': selected_choice,
                    'is_correct': is_correct
                }
            )

            return Response({
                'success': True,
                'submission_id': submission.id,
                'is_correct': is_correct,
                'created': created
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
