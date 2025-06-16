from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from pramlearnapp.models import Quiz, Group, GroupMember, GroupQuiz, GroupQuizSubmission, GroupQuizResult
from pramlearnapp.decorators import student_required
import traceback


class StudentGroupQuizListView(APIView):
    """API untuk mendapatkan daftar quiz kelompok yang tersedia untuk student"""

    @student_required
    def get(self, request):
        try:
            # Get user's groups
            user_groups = GroupMember.objects.filter(
                student=request.user
            ).values_list('group', flat=True)

            # Get group quizzes for user's groups
            group_quizzes = GroupQuiz.objects.filter(
                group__in=user_groups
            ).select_related('quiz', 'group').prefetch_related('submissions')

            quiz_data = []
            for group_quiz in group_quizzes:
                quiz = group_quiz.quiz

                # Check if quiz has been completed by the group
                is_completed = group_quiz.is_completed

                # Get completion info
                result = None
                if is_completed:
                    try:
                        result = GroupQuizResult.objects.get(
                            group_quiz=group_quiz)
                    except GroupQuizResult.DoesNotExist:
                        pass

                quiz_info = {
                    'id': quiz.id,
                    'title': quiz.title,
                    'content': quiz.content,
                    'slug': quiz.slug,
                    'is_group_quiz': True,  # Pastikan ini ada
                    'end_time': group_quiz.end_time,
                    'group_name': group_quiz.group.name,
                    'group_id': group_quiz.group.id,
                    'is_completed': is_completed,
                    'score': result.score if result else None,
                    'completed_at': result.completed_at if result else None,
                    'questions_count': quiz.questions.count(),  # Tambah ini
                    # Tambah ini
                    'duration': quiz.duration if hasattr(quiz, 'duration') else None,
                }

                quiz_data.append(quiz_info)

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GroupQuizDetailView(APIView):
    """API untuk mendapatkan detail quiz kelompok untuk student"""

    @student_required
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

            # 🔍 DEBUG: Log untuk memastikan group ID
            print(
                f"🔍 DEBUG: User {request.user.username} is in group {user_group.group.id}")

            # Get GroupQuiz
            group_quiz = GroupQuiz.objects.filter(
                quiz=quiz,
                group=user_group.group
            ).first()

            if not group_quiz:
                return Response(
                    {"error": "Quiz ini belum di-assign ke kelompok Anda"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if already completed
            if group_quiz.is_completed:
                return Response(
                    {"error": "Quiz sudah diselesaikan", "is_completed": True},
                    status=status.HTTP_400_BAD_REQUEST
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
                    'answered_by': submission.student.id,
                    'submitted_at': submission.submitted_at.isoformat()
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
                    'id': user_group.group.id,  # 🔧 PASTIKAN INI BENAR
                    'name': user_group.group.name,
                    'code': user_group.group.code,
                    'members': members_data
                },
                'current_answers': current_answers,
                'is_completed': group_quiz.is_completed,
                'time_remaining': self.calculate_time_remaining(group_quiz)
            }

            # 🔍 DEBUG: Log response data
            print(
                f"🔍 DEBUG: Returning group_id={user_group.group.id} for user {request.user.username}")

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in GroupQuizDetailView: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

    @student_required
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

            # Check if already completed
            if group_quiz.is_completed:
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
                'submitted_at': result.completed_at,
                'group_name': user_group.group.name,
                'is_completed': True
            }

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
                'group_members': members_data,  # CRITICAL: This must be included
                'material_slug': quiz.material.slug if quiz.material else None,
                'material_id': quiz.material.id if quiz.material else None,
                'material_title': quiz.material.title if quiz.material else None,
                'subject_slug': quiz.material.subject.slug if quiz.material and quiz.material.subject else None,
                'subject_name': quiz.material.subject.name if quiz.material and quiz.material.subject else None,
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
