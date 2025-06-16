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
import traceback


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
    """API untuk submit quiz kelompok"""

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

            # ENSURE is_completed is set to True
            group_quiz.is_completed = True
            group_quiz.save()

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
    """API untuk mendapatkan hasil quiz kelompok"""

    def get(self, request, quiz_slug):
        try:
            print(
                f"🔍 DEBUG: Fetching group quiz results for slug: {quiz_slug}")

            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)
            print(f"✅ Found quiz: {quiz}")

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user,
                group__material=quiz.material
            ).first()

            if not user_group:
                print(f"❌ User not in group for quiz: {quiz_slug}")
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

            # Check for result existence
            try:
                result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                print(f"✅ Found result: {result}")
            except GroupQuizResult.DoesNotExist:
                print(
                    f"❌ GroupQuizResult not found for group_quiz: {group_quiz}")
                return Response(
                    {"error": "Hasil quiz belum tersedia"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # If result exists but is_completed is False, update it
            if not group_quiz.is_completed:
                group_quiz.is_completed = True
                group_quiz.save()
                print(f"✅ Updated group_quiz.is_completed to True")

            # Get submissions with details
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            print(f"📊 Found {submissions.count()} submissions")

            # Get group members - ENSURE THIS IS ALWAYS EXECUTED
            group_members = GroupMember.objects.filter(
                group=user_group.group
            ).select_related('student').order_by('student__username')

            print(f"📊 Found {group_members.count()} group members")

            members_data = []
            for member in group_members:
                # Count answers by this member
                member_answers_count = submissions.filter(
                    student=member.student
                ).count()

                print(
                    f"📊 Member {member.student.username} answered {member_answers_count} questions")

                member_data = {
                    'id': member.student.id,
                    'username': member.student.username,
                    'first_name': member.student.first_name,
                    'last_name': member.student.last_name,
                    'full_name': f"{member.student.first_name} {member.student.last_name}".strip() or member.student.username,
                    'is_current_user': member.student.id == request.user.id,
                    'answered_count': member_answers_count
                }
                members_data.append(member_data)
                print(f"📊 Added member data: {member_data}")

            # Create answers detail - COMPLETE THIS SECTION
            answers_detail = []
            for submission in submissions:
                question = submission.question
                answer_data = {
                    'question_id': question.id,
                    'question_text': question.text,
                    'selected_answer': submission.selected_choice,
                    'correct_answer': question.correct_choice,
                    'is_correct': submission.is_correct,
                    'answered_by': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                    'answered_by_id': submission.student.id,
                    'answered_by_username': submission.student.username,
                    'selected_answer_text': getattr(question, f'choice_{submission.selected_choice.lower()}', ''),
                    'correct_answer_text': getattr(question, f'choice_{question.correct_choice.lower()}', ''),
                    'explanation': getattr(question, 'explanation', None)
                }
                answers_detail.append(answer_data)

            # Construct the final response
            results_data = {
                'quiz_title': quiz.title,
                'group_name': user_group.group.name,
                'group_code': user_group.group.code,
                'score': result.score,
                'total_questions': quiz.questions.count(),
                'correct_answers': submissions.filter(is_correct=True).count(),
                'submitted_at': result.completed_at,
                'time_taken': getattr(result, 'time_taken', 0),
                'rank': getattr(result, 'rank', None),
                'total_participants': getattr(result, 'total_participants', None),
                'answers': answers_detail,
                'group_members': members_data  # CRITICAL: This must be included
            }

            # Debug logging - DETAILED CHECK
            print(f"📤 Final response data keys: {list(results_data.keys())}")
            print(
                f"📤 Response includes group_members: {'group_members' in results_data}")
            print(
                f"📤 Group members type: {type(results_data.get('group_members'))}")
            print(f"📤 Group members count: {len(members_data)}")
            print(f"📤 Group members data: {results_data['group_members']}")

            # Test serialization
            import json
            try:
                json_str = json.dumps(results_data, default=str)
                print(
                    f"📤 JSON serialization successful, length: {len(json_str)}")

                # Parse back to check
                parsed_data = json.loads(json_str)
                print(
                    f"📤 Parsed back successfully, group_members in parsed: {'group_members' in parsed_data}")
                print(
                    f"📤 Parsed group_members count: {len(parsed_data.get('group_members', []))}")
            except Exception as json_error:
                print(f"❌ JSON serialization error: {json_error}")

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in GroupQuizResultsView: {str(e)}")
            import traceback
            traceback.print_exc()
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
