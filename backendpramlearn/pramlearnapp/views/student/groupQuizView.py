from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from pramlearnapp.models import (
    Quiz, Group, GroupMember, GroupQuiz, GroupQuizSubmission,
    GroupQuizResult, Question, StudentActivity
)
from pramlearnapp.serializers.student.quizSerializer import GroupQuizSerializer, GroupQuizSubmissionSerializer
from django.utils import timezone
from django.db.models import Count, Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import traceback
import logging
from pramlearnapp.services.gradeService import create_grade_from_group_quiz

logger = logging.getLogger(__name__)


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

            # ✅ PERBAIKAN: Check submission status FIRST
            is_quiz_submitted = self.is_quiz_submitted(group_quiz)

            # If submitted, return completed status with results
            if is_quiz_submitted:
                try:
                    quiz_result = GroupQuizResult.objects.get(
                        group_quiz=group_quiz)
                    quiz_score = quiz_result.score
                except GroupQuizResult.DoesNotExist:
                    quiz_score = 0

                return Response({
                    'id': quiz.id,
                    'title': quiz.title,
                    'content': quiz.content,
                    'slug': quiz.slug,
                    'is_completed': True,
                    'is_submitted': True,
                    'score': quiz_score,
                    'completed_at': quiz_result.completed_at if 'quiz_result' in locals() else None,
                    'group': {
                        'id': user_group.group.id,
                        'name': user_group.group.name,
                        'code': user_group.group.code,
                    },
                    'questions_count': quiz.questions.count(),
                    'total_questions': quiz.questions.count(),
                }, status=status.HTTP_200_OK)

            # Continue dengan logic normal untuk quiz yang masih aktif
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
                'is_submitted': False,  # ✅ Quiz belum di-submit
                'is_completed': False,  # ✅ Quiz belum selesai
                'time_remaining': self.calculate_time_remaining(group_quiz)
            }

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"❌ Error in GroupQuizDetailView: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def is_quiz_submitted(self, group_quiz):
        """Check if quiz is already submitted"""
        return group_quiz.submitted_at is not None

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
            user = request.user
            logger.info(
                f"🎯 Starting quiz submission for user: {user.username}")

            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)
            logger.info(f"✅ Found quiz: {quiz.title}")

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=user,
                group__material=quiz.material
            ).first()

            if not user_group:
                logger.error(
                    f"❌ User {user.username} not in group for quiz {quiz.title}")
                return Response(
                    {"error": "User is not in any group for this quiz"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info(f"✅ User in group: {user_group.group.name}")

            # Get GroupQuiz
            group_quiz = GroupQuiz.objects.filter(
                quiz=quiz,
                group=user_group.group
            ).first()

            if not group_quiz:
                logger.error(
                    f"❌ GroupQuiz not found for quiz {quiz.id} and group {user_group.group.id}")
                return Response(
                    {"error": "Group quiz not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if already submitted
            if group_quiz.submitted_at is not None:
                logger.warning(
                    f"⚠️ Quiz already submitted at {group_quiz.submitted_at}")
                return Response(
                    {"error": "Quiz already submitted"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ PENTING: Gunakan transaction.atomic untuk memastikan konsistensi
            with transaction.atomic():
                logger.info("🔄 Starting quiz submission transaction...")

                # Step 1: Mark as submitted FIRST
                group_quiz.submitted_at = timezone.now()
                group_quiz.is_completed = True
                group_quiz.save()
                logger.info(
                    f"✅ GroupQuiz marked as submitted at {group_quiz.submitted_at}")

                # Step 2: Calculate and save score
                result = group_quiz.calculate_and_save_score()
                logger.info(f"✅ Score calculated and saved: {result.score}")

                # Step 3: Force refresh group_quiz dari database untuk memastikan data terbaru
                group_quiz.refresh_from_db()
                logger.info(
                    f"✅ GroupQuiz refreshed from DB - submitted_at: {group_quiz.submitted_at}")

                # Step 4: Get score value
                if hasattr(result, 'score'):
                    score = result.score
                    logger.info(f"✅ Score value: {score}")
                else:
                    score = 0
                    logger.warning("⚠️ No score in result, using 0")

                # Step 5: Get all group members
                group_members = GroupMember.objects.filter(
                    group=user_group.group
                ).select_related('student')

                logger.info(
                    f"📊 Found {group_members.count()} group members for grade creation")

                created_grades = []
                failed_grades = []

                # Step 6: Create grades for ALL group members
                for member in group_members:
                    try:
                        logger.info(
                            f"🔄 Creating grade for member: {member.student.username}")

                        # ✅ DEBUGGING: Log semua info sebelum create grade
                        logger.info(f"📊 About to create grade with:")
                        logger.info(f"   - GroupQuiz ID: {group_quiz.id}")
                        logger.info(
                            f"   - GroupQuiz submitted_at: {group_quiz.submitted_at}")
                        logger.info(
                            f"   - GroupQuiz is_completed: {group_quiz.is_completed}")
                        logger.info(f"   - Student: {member.student.username}")
                        logger.info(
                            f"   - Student role: {member.student.role}")

                        # Call grade creation function
                        grade = create_grade_from_group_quiz(
                            group_quiz, member.student)

                        if grade:
                            created_grades.append(grade)
                            logger.info(
                                f"✅ Grade created successfully for {member.student.username}: ID={grade.id}, Grade={grade.grade}")
                        else:
                            failed_grades.append(member.student.username)
                            logger.error(
                                f"❌ Grade creation returned None for {member.student.username}")

                    except Exception as grade_error:
                        failed_grades.append(member.student.username)
                        logger.error(
                            f"❌ Exception creating grade for {member.student.username}: {str(grade_error)}")
                        logger.error(f"❌ Traceback: {traceback.format_exc()}")

                # Step 7: Log activity
                try:
                    StudentActivity.objects.create(
                        student=user,
                        title=f"Menyelesaikan Group Quiz: {quiz.title}",
                        description=f"Group quiz diselesaikan dengan skor {score:.1f}",
                        activity_type="group_quiz",
                        timestamp=timezone.now(),
                    )
                    logger.info(f"✅ Activity logged for {user.username}")
                except Exception as activity_error:
                    logger.error(
                        f"❌ Failed to log student activity: {str(activity_error)}")

                # ✅ PENTING: Jika ada grade yang gagal dibuat, log detail error tapi jangan rollback transaction
                if failed_grades:
                    logger.warning(
                        f"⚠️ Some grades failed to create: {failed_grades}")

            # Return detailed response
            logger.info(f"🎉 Quiz submission completed successfully!")
            logger.info(f"📊 Summary:")
            logger.info(f"   - Total group members: {group_members.count()}")
            logger.info(f"   - Grades created: {len(created_grades)}")
            logger.info(f"   - Grades failed: {len(failed_grades)}")
            logger.info(f"   - Final score: {score}")

            response_data = {
                "message": "Group quiz submitted successfully",
                "group_quiz_id": group_quiz.id,
                "score": score,
                "grades_created": len(created_grades),
                "grades_failed": len(failed_grades),
                "total_members": group_members.count(),
                "redirect_url": f"/student/group-quiz/{quiz_slug}/results"
            }

            if failed_grades:
                response_data["failed_students"] = failed_grades
                logger.warning(
                    f"⚠️ Failed to create grades for: {failed_grades}")

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"❌ CRITICAL ERROR in quiz submission: {str(e)}")
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            return Response(
                {"error": "Internal server error during quiz submission"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GroupQuizResultsView(APIView):
    """API untuk mendapatkan hasil quiz kelompok"""

    def get(self, request, quiz_slug):
        try:
            logger.info(
                f"🔍 DEBUG: Fetching group quiz results for slug: {quiz_slug}")

            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)
            logger.info(f"✅ Found quiz: {quiz}")

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user,
                group__material=quiz.material
            ).first()

            if not user_group:
                logger.error(f"❌ User not in group for quiz: {quiz_slug}")
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
                logger.info(f"✅ Found result: {result}")
            except GroupQuizResult.DoesNotExist:
                logger.error(
                    f"❌ GroupQuizResult not found for group_quiz: {group_quiz}")
                return Response(
                    {"error": "Hasil quiz belum tersedia"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # If result exists but is_completed is False, update it
            if not group_quiz.is_completed:
                group_quiz.is_completed = True
                group_quiz.save()
                logger.info(f"✅ Updated group_quiz.is_completed to True")

            # Get submissions with details
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            logger.info(f"📊 Found {submissions.count()} submissions")

            # Get group members - ENSURE THIS IS ALWAYS EXECUTED
            group_members = GroupMember.objects.filter(
                group=user_group.group
            ).select_related('student').order_by('student__username')

            logger.info(f"📊 Found {group_members.count()} group members")

            members_data = []
            for member in group_members:
                # Count answers by this member
                member_answers_count = submissions.filter(
                    student=member.student
                ).count()

                logger.info(
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
                logger.info(f"📊 Added member data: {member_data}")

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
            logger.info(
                f"📤 Final response data keys: {list(results_data.keys())}")
            logger.info(
                f"📤 Response includes group_members: {'group_members' in results_data}")
            logger.info(
                f"📤 Group members type: {type(results_data.get('group_members'))}")
            logger.info(f"📤 Group members count: {len(members_data)}")
            logger.info(
                f"📤 Group members data: {results_data['group_members']}")

            # Test serialization
            import json
            try:
                json_str = json.dumps(results_data, default=str)
                logger.info(
                    f"📤 JSON serialization successful, length: {len(json_str)}")

                # Parse back to check
                parsed_data = json.loads(json_str)
                logger.info(
                    f"📤 Parsed back successfully, group_members in parsed: {'group_members' in parsed_data}")
                logger.info(
                    f"📤 Parsed group_members count: {len(parsed_data.get('group_members', []))}")
            except Exception as json_error:
                logger.error(f"❌ JSON serialization error: {json_error}")

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"❌ Error in GroupQuizResultsView: {str(e)}")
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
            logger.error(f"❌ Error saving group quiz answer: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
