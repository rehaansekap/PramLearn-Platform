from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from pramlearnapp.models import (
    Quiz,
    Group,
    GroupMember,
    GroupQuiz,
    GroupQuizSubmission,
    GroupQuizResult,
    StudentActivity,
)
from pramlearnapp.decorators import student_required
import traceback
import logging

from pramlearnapp.services.gradeService import create_grade_from_group_quiz

logger = logging.getLogger(__name__)


class StudentGroupQuizListView(APIView):
    """API untuk mendapatkan daftar quiz kelompok yang tersedia untuk student"""

    @student_required
    def get(self, request):
        try:
            # Get user's groups
            user_groups = GroupMember.objects.filter(student=request.user).values_list(
                "group", flat=True
            )

            # Get group quizzes for user's groups
            group_quizzes = (
                GroupQuiz.objects.filter(group__in=user_groups)
                .select_related("quiz", "group")
                .prefetch_related("submissions")
            )

            quiz_data = []
            for group_quiz in group_quizzes:
                quiz = group_quiz.quiz

                # Check if quiz has been completed by the group
                is_completed = group_quiz.is_completed

                # Get completion info
                result = None
                if is_completed:
                    try:
                        result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                    except GroupQuizResult.DoesNotExist:
                        pass

                quiz_info = {
                    "id": quiz.id,
                    "title": quiz.title,
                    "content": quiz.content,
                    "slug": quiz.slug,
                    "is_group_quiz": True,
                    "end_time": group_quiz.end_time,
                    "group_name": group_quiz.group.name,
                    "group_id": group_quiz.group.id,
                    "is_completed": is_completed,
                    "score": result.score if result else None,
                    "completed_at": result.completed_at if result else None,
                    "questions_count": quiz.questions.count(),
                    "duration": quiz.duration if hasattr(quiz, "duration") else None,
                    # TAMBAHKAN INI - Informasi Subject dan Material
                    "subject_name": (
                        quiz.material.subject.name
                        if quiz.material and quiz.material.subject
                        else None
                    ),
                    "subject_id": (
                        quiz.material.subject.id
                        if quiz.material and quiz.material.subject
                        else None
                    ),
                    "material_name": quiz.material.title if quiz.material else None,
                    "material_id": quiz.material.id if quiz.material else None,
                    "material_slug": quiz.material.slug if quiz.material else None,
                }

                quiz_data.append(quiz_info)

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
                student=request.user, group__material=quiz.material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok untuk quiz ini"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Define user_groups before using it
            user_groups = GroupMember.objects.filter(student=request.user).values_list(
                "group", flat=True
            )

            group_quizzes = (
                GroupQuiz.objects.filter(group__in=user_groups, quiz__is_active=True)
                .select_related("quiz", "group")
                .prefetch_related("submissions")
            )

            # Get GroupQuiz
            group_quiz = GroupQuiz.objects.filter(
                quiz=quiz, group=user_group.group
            ).first()

            if not group_quiz:
                return Response(
                    {"error": "Quiz belum di-assign ke kelompok Anda"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            is_quiz_completed = self.is_quiz_completed(group_quiz)

            # Update GroupQuiz status if needed
            if is_quiz_completed and not group_quiz.is_completed:
                group_quiz.is_completed = True
                group_quiz.save()

            quiz_result = None
            quiz_score = None
            if is_quiz_completed:
                try:
                    quiz_result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                    quiz_score = quiz_result.score
                except GroupQuizResult.DoesNotExist:
                    # Calculate score if result doesn't exist
                    return Response(
                        {
                            "id": quiz.id,
                            "title": quiz.title,
                            "content": quiz.content,
                            "slug": quiz.slug,
                            "is_completed": False,
                            "is_submitted": False,
                            "score": quiz_score,
                            "completed_at": (
                                quiz_result.completed_at if quiz_result else None
                            ),
                            "group": {
                                "id": user_group.group.id,
                                "name": user_group.group.name,
                                "code": user_group.group.code,
                            },
                            "questions_count": quiz.questions.count(),
                            "total_questions": quiz.questions.count(),
                        },
                        status=status.HTTP_200_OK,
                    )

            # If completed, return completed status
            if is_quiz_completed:
                return Response(
                    {
                        "id": quiz.id,
                        "title": quiz.title,
                        "content": quiz.content,
                        "slug": quiz.slug,
                        "is_completed": True,
                        "score": quiz_score,
                        "completed_at": (
                            quiz_result.completed_at if quiz_result else None
                        ),
                        "group": {
                            "id": user_group.group.id,
                            "name": user_group.group.name,
                            "code": user_group.group.code,
                        },
                        "questions_count": quiz.questions.count(),
                        "total_questions": quiz.questions.count(),
                    },
                    status=status.HTTP_200_OK,
                )

            # Get current submissions
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related("question", "student")

            # Prepare current answers
            current_answers = {}
            for submission in submissions:
                current_answers[submission.question.id] = {
                    "selected_choice": submission.selected_choice,
                    "student_name": submission.student.username,
                    "answered_by": submission.student.id,
                }

            # Get group members
            group_members = GroupMember.objects.filter(
                group=user_group.group
            ).select_related("student")

            members_data = []
            for member in group_members:
                members_data.append(
                    {
                        "id": member.student.id,
                        "username": member.student.username,
                        "first_name": member.student.first_name,
                        "last_name": member.student.last_name,
                        "is_current_user": member.student.id == request.user.id,
                    }
                )

            # Serialize quiz data
            quiz_data = {
                "id": quiz.id,
                "title": quiz.title,
                "content": quiz.content,
                "slug": quiz.slug,
                "end_time": group_quiz.end_time,
                "start_time": group_quiz.start_time,
                "questions": [
                    {
                        "id": q.id,
                        "text": q.text,
                        "choice_a": q.choice_a,
                        "choice_b": q.choice_b,
                        "choice_c": q.choice_c,
                        "choice_d": q.choice_d,
                    }
                    for q in quiz.questions.all()
                ],
                "group": {
                    "id": user_group.group.id,
                    "name": user_group.group.name,
                    "code": user_group.group.code,
                    "members": members_data,
                },
                "current_answers": current_answers,
                "is_completed": is_quiz_completed,
                "score": quiz_score,
                "questions_count": quiz.questions.count(),
                "time_remaining": self.calculate_time_remaining(group_quiz),
            }

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in GroupQuizDetailView: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def is_quiz_completed(self, group_quiz):
        """Check if quiz is completed by checking if all questions are answered"""
        total_questions = group_quiz.quiz.questions.count()
        answered_questions = GroupQuizSubmission.objects.filter(
            group_quiz=group_quiz
        ).count()
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

    @student_required
    def post(self, request, quiz_slug):
        try:
            user = request.user
            logger.info(f"🎯 Starting quiz submission for user: {user.username}")

            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)
            logger.info(f"✅ Found quiz: {quiz.title}")

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user, group__material=quiz.material
            ).first()

            if not user_group:
                logger.error(
                    f"❌ User {user.username} not in group for quiz {quiz.title}"
                )
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            logger.info(f"✅ User in group: {user_group.group.name}")

            # Get GroupQuiz
            group_quiz = get_object_or_404(GroupQuiz, quiz=quiz, group=user_group.group)

            # Check if already completed
            if group_quiz.is_completed:
                logger.warning(f"⚠️ Quiz already completed")
                return Response(
                    {"error": "Quiz sudah di-submit sebelumnya"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                logger.info("🔄 Starting quiz submission transaction...")

                # Calculate and save score
                result = group_quiz.calculate_and_save_score()
                logger.info(f"✅ Score calculated and saved: {result.score}")

                # Mark as completed
                group_quiz.is_completed = True
                group_quiz.submitted_at = timezone.now()
                group_quiz.save()
                logger.info(
                    f"✅ GroupQuiz marked as completed at {group_quiz.submitted_at}"
                )

                group_members = GroupMember.objects.filter(
                    group=user_group.group
                ).select_related("student")

                logger.info(
                    f"📊 Found {group_members.count()} group members for grade creation"
                )

                created_grades = []
                failed_grades = []

                for member in group_members:
                    try:
                        logger.info(
                            f"🔄 Creating grade for member: {member.student.username}"
                        )

                        logger.info(f"📊 About to create grade with:")
                        logger.info(f"   - GroupQuiz ID: {group_quiz.id}")
                        logger.info(
                            f"   - GroupQuiz submitted_at: {group_quiz.submitted_at}"
                        )
                        logger.info(
                            f"   - GroupQuiz is_completed: {group_quiz.is_completed}"
                        )
                        logger.info(f"   - Student: {member.student.username}")
                        logger.info(f"   - Student role: {member.student.role}")

                        # Call grade creation function
                        grade = create_grade_from_group_quiz(group_quiz, member.student)

                        if grade:
                            created_grades.append(grade)
                            logger.info(
                                f"✅ Grade created successfully for {member.student.username}: ID={grade.id}, Grade={grade.grade}"
                            )
                        else:
                            failed_grades.append(member.student.username)
                            logger.error(
                                f"❌ Grade creation returned None for {member.student.username}"
                            )

                    except Exception as grade_error:
                        failed_grades.append(member.student.username)
                        logger.error(
                            f"❌ Exception creating grade for {member.student.username}: {str(grade_error)}"
                        )
                        logger.error(f"❌ Traceback: {traceback.format_exc()}")

                try:
                    StudentActivity.objects.create(
                        student=user,
                        title=f"Menyelesaikan Group Quiz: {quiz.title}",
                        description=f"Group quiz diselesaikan dengan skor {result.score:.1f}",
                        activity_type="group_quiz",
                        timestamp=timezone.now(),
                    )
                    logger.info(f"✅ Activity logged for {user.username}")
                except Exception as activity_error:
                    logger.error(
                        f"❌ Failed to log student activity: {str(activity_error)}"
                    )

            # Get detailed results
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related("question")

            total_questions = quiz.questions.count()
            correct_answers = submissions.filter(is_correct=True).count()

            results_data = {
                "group_quiz_id": group_quiz.id,
                "score": result.score,
                "total_questions": total_questions,
                "correct_answers": correct_answers,
                "submitted_at": result.completed_at,
                "group_name": user_group.group.name,
                "is_completed": True,
                "grades_created": len(created_grades),
                "grades_failed": len(failed_grades),
                "total_members": group_members.count(),
                "message": "Group quiz submitted successfully",
            }

            if failed_grades:
                results_data["failed_students"] = failed_grades
                logger.warning(f"⚠️ Failed to create grades for: {failed_grades}")

            logger.info(f"🎉 Quiz submission completed successfully!")
            logger.info(f"📊 Summary:")
            logger.info(f"   - Total group members: {group_members.count()}")
            logger.info(f"   - Grades created: {len(created_grades)}")
            logger.info(f"   - Grades failed: {len(failed_grades)}")
            logger.info(f"   - Final score: {result.score}")

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"❌ CRITICAL ERROR in quiz submission: {str(e)}")
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            return Response(
                {"error": "Internal server error during quiz submission"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GroupQuizResultsView(APIView):
    """API untuk mendapatkan hasil quiz kelompok"""

    def get(self, request, quiz_slug):
        try:
            print(f"🔍 DEBUG: Fetching group quiz results for slug: {quiz_slug}")

            # Get quiz by slug
            quiz = get_object_or_404(Quiz, slug=quiz_slug, is_group_quiz=True)
            print(f"✅ Found quiz: {quiz}")

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user, group__material=quiz.material
            ).first()

            if not user_group:
                print(f"❌ User not in group for quiz: {quiz_slug}")
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Get GroupQuiz and result
            group_quiz = get_object_or_404(GroupQuiz, quiz=quiz, group=user_group.group)

            # Check for result existence
            try:
                result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                print(f"✅ Found result: {result}")
            except GroupQuizResult.DoesNotExist:
                print(f"❌ GroupQuizResult not found for group_quiz: {group_quiz}")
                return Response(
                    {"error": "Hasil quiz belum tersedia"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # If result exists but is_completed is False, update it
            if not group_quiz.is_completed:
                group_quiz.is_completed = True
                group_quiz.save()
                print(f"✅ Updated group_quiz.is_completed to True")

            # Get submissions with details
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related("question", "student")

            print(f"📊 Found {submissions.count()} submissions")

            # Get group members - ENSURE THIS IS ALWAYS EXECUTED
            group_members = (
                GroupMember.objects.filter(group=user_group.group)
                .select_related("student")
                .order_by("student__username")
            )

            print(f"📊 Found {group_members.count()} group members")

            members_data = []
            for member in group_members:
                # Count answers by this member
                member_answers_count = submissions.filter(
                    student=member.student
                ).count()

                print(
                    f"📊 Member {member.student.username} answered {member_answers_count} questions"
                )

                member_data = {
                    "id": member.student.id,
                    "username": member.student.username,
                    "first_name": member.student.first_name,
                    "last_name": member.student.last_name,
                    "full_name": f"{member.student.first_name} {member.student.last_name}".strip()
                    or member.student.username,
                    "is_current_user": member.student.id == request.user.id,
                    "answered_count": member_answers_count,
                }
                members_data.append(member_data)
                print(f"📊 Added member data: {member_data}")

            # Create answers detail - COMPLETE THIS SECTION
            answers_detail = []
            for submission in submissions:
                question = submission.question
                answer_data = {
                    "question_id": question.id,
                    "question_text": question.text,
                    "selected_answer": submission.selected_choice,
                    "correct_answer": question.correct_choice,
                    "is_correct": submission.is_correct,
                    "answered_by": f"{submission.student.first_name} {submission.student.last_name}".strip()
                    or submission.student.username,
                    "answered_by_id": submission.student.id,
                    "answered_by_username": submission.student.username,
                    "selected_answer_text": getattr(
                        question, f"choice_{submission.selected_choice.lower()}", ""
                    ),
                    "correct_answer_text": getattr(
                        question, f"choice_{question.correct_choice.lower()}", ""
                    ),
                    "explanation": getattr(question, "explanation", None),
                }
                answers_detail.append(answer_data)

            # Construct the final response
            results_data = {
                "quiz_title": quiz.title,
                "group_name": user_group.group.name,
                "group_code": user_group.group.code,
                "score": result.score,
                "total_questions": quiz.questions.count(),
                "correct_answers": submissions.filter(is_correct=True).count(),
                "submitted_at": result.completed_at,
                "time_taken": getattr(result, "time_taken", 0),
                "rank": getattr(result, "rank", None),
                "total_participants": getattr(result, "total_participants", None),
                "answers": answers_detail,
                "group_members": members_data,  # CRITICAL: This must be included
                "material_slug": quiz.material.slug if quiz.material else None,
                "material_id": quiz.material.id if quiz.material else None,
                "material_title": quiz.material.title if quiz.material else None,
                "subject_slug": (
                    quiz.material.subject.slug
                    if quiz.material and quiz.material.subject
                    else None
                ),
                "subject_name": (
                    quiz.material.subject.name
                    if quiz.material and quiz.material.subject
                    else None
                ),
            }

            # Debug logging - DETAILED CHECK
            print(f"📤 Final response data keys: {list(results_data.keys())}")
            print(
                f"📤 Response includes group_members: {'group_members' in results_data}"
            )
            print(f"📤 Group members type: {type(results_data.get('group_members'))}")
            print(f"📤 Group members count: {len(members_data)}")
            print(f"📤 Group members data: {results_data['group_members']}")

            # Test serialization
            import json

            try:
                json_str = json.dumps(results_data, default=str)
                print(f"📤 JSON serialization successful, length: {len(json_str)}")

                # Parse back to check
                parsed_data = json.loads(json_str)
                print(
                    f"📤 Parsed back successfully, group_members in parsed: {'group_members' in parsed_data}"
                )
                print(
                    f"📤 Parsed group_members count: {len(parsed_data.get('group_members', []))}"
                )
            except Exception as json_error:
                print(f"❌ JSON serialization error: {json_error}")

            return Response(results_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in GroupQuizResultsView: {str(e)}")
            import traceback

            traceback.print_exc()
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
