from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, F, Sum
from django.utils import timezone
from datetime import timedelta
from django.utils.dateparse import parse_datetime
from pramlearnapp.models import (
    Material,
    Quiz,
    Question,
    Group,
    GroupMember,
    GroupQuiz,
    GroupQuizSubmission,
    GroupQuizResult,
    Grade,
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


class TeacherSessionMaterialQuizView(APIView):
    """
    API untuk mengelola quiz dalam context sessions material
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        """Get all quizzes for a material with detailed statistics"""
        try:
            material = get_object_or_404(Material, slug=material_slug)

            # Get quizzes dengan relasi yang diperlukan
            quizzes = (
                Quiz.objects.filter(material=material)
                .prefetch_related(
                    "questions",
                    "groupquiz_set__group",
                    "groupquiz_set__submissions",
                    "groupquiz_set__result",
                )
                .order_by("-created_at")
            )

            # Get groups untuk material ini
            groups = Group.objects.filter(material=material)
            groups_data = []
            for group in groups:
                members = GroupMember.objects.filter(group=group).select_related(
                    "student"
                )
                groups_data.append(
                    {
                        "id": group.id,
                        "name": group.name,
                        "code": group.code,
                        "member_count": members.count(),
                        "members": [
                            {
                                "id": m.student.id,
                                "username": m.student.username,
                                "first_name": m.student.first_name,
                                "last_name": m.student.last_name,
                            }
                            for m in members
                        ],
                    }
                )

            quizzes_data = []
            for quiz in quizzes:
                # Get group assignments
                assigned_groups = GroupQuiz.objects.filter(quiz=quiz)
                assigned_groups_data = []

                total_submissions = 0
                completed_submissions = 0
                average_score = 0
                scores = []

                for group_quiz in assigned_groups:
                    group_data = {
                        "group_id": group_quiz.group.id,
                        "group_name": group_quiz.group.name,
                        "group_code": group_quiz.group.code,
                        "start_time": group_quiz.start_time,
                        "end_time": group_quiz.end_time,
                        "is_completed": group_quiz.is_completed,
                        "submitted_at": group_quiz.submitted_at,
                        "submissions_count": group_quiz.submissions.count(),
                    }

                    # Check if there's a result
                    try:
                        result = group_quiz.result
                        group_data["score"] = result.score
                        scores.append(result.score)
                        if group_quiz.is_completed:
                            completed_submissions += 1
                    except GroupQuizResult.DoesNotExist:
                        group_data["score"] = 0

                    assigned_groups_data.append(group_data)
                    total_submissions += 1

                # Calculate statistics
                if scores:
                    average_score = sum(scores) / len(scores)

                completion_rate = (
                    (completed_submissions / total_submissions * 100)
                    if total_submissions > 0
                    else 0
                )

                quizzes_data.append(
                    {
                        "id": quiz.id,
                        "title": quiz.title,
                        "content": quiz.content,
                        "slug": quiz.slug,
                        "created_at": quiz.created_at,
                        "duration": quiz.duration,
                        "is_active": quiz.is_active,
                        "question_count": quiz.questions.count(),
                        "is_group_quiz": quiz.is_group_quiz,
                        "assigned_groups": assigned_groups_data,
                        "assigned_groups_count": len(assigned_groups_data),
                        "total_submissions": total_submissions,
                        "completed_submissions": completed_submissions,
                        "completion_rate": round(completion_rate, 1),
                        "average_score": round(average_score, 1),
                        "highest_score": max(scores) if scores else 0,
                        "lowest_score": min(scores) if scores else 0,
                        "questions": [
                            {
                                "id": q.id,
                                "text": q.text,
                                "choice_a": q.choice_a,
                                "choice_b": q.choice_b,
                                "choice_c": q.choice_c,
                                "choice_d": q.choice_d,
                                "correct_choice": q.correct_choice,
                            }
                            for q in quiz.questions.all()
                        ],
                    }
                )

            # Overall statistics
            total_quizzes = len(quizzes_data)
            total_assigned_groups = sum(
                q["assigned_groups_count"] for q in quizzes_data
            )
            total_completed = sum(q["completed_submissions"] for q in quizzes_data)
            overall_completion_rate = (
                (total_completed / total_assigned_groups * 100)
                if total_assigned_groups > 0
                else 0
            )

            response_data = {
                "material": {
                    "id": material.id,
                    "title": material.title,
                    "slug": material.slug,
                },
                "quizzes": quizzes_data,
                "groups": groups_data,
                "statistics": {
                    "total_quizzes": total_quizzes,
                    "total_groups": len(groups_data),
                    "total_assigned_groups": total_assigned_groups,
                    "total_completed_submissions": total_completed,
                    "overall_completion_rate": round(overall_completion_rate, 1),
                    "average_questions_per_quiz": (
                        round(
                            sum(q["question_count"] for q in quizzes_data)
                            / total_quizzes,
                            1,
                        )
                        if total_quizzes > 0
                        else 0
                    ),
                },
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Material.DoesNotExist:
            return Response(
                {"error": "Material not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in TeacherSessionMaterialQuizView.get: {str(e)}")
            return Response(
                {"error": f"Failed to fetch quiz data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, material_slug):
        """Create new quiz for material"""
        try:
            material = get_object_or_404(Material, slug=material_slug)

            data = request.data
            title = data.get("title")
            content = data.get("content")
            is_active = data.get("is_active", True)
            questions_data = data.get("questions", [])
            group_ids = data.get("group_ids", [])
            duration = data.get("duration", 60)
            start_time = data.get("start_time")
            end_time = data.get("end_time")

            logger.info(f"Creating quiz with data: {data}")

            if not title or not content or not questions_data:
                return Response(
                    {"error": "Title, content, and questions are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not group_ids:
                return Response(
                    {"error": "At least one group must be selected"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Parse datetime strings if provided
            parsed_start_time = None
            parsed_end_time = None

            if start_time:
                try:
                    parsed_start_time = parse_datetime(start_time)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid start_time format: {start_time}")
                    parsed_start_time = timezone.now()

            if end_time:
                try:
                    parsed_end_time = parse_datetime(end_time)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid end_time format: {end_time}")
                    if parsed_start_time:
                        parsed_end_time = parsed_start_time + timedelta(
                            minutes=duration
                        )

            # If no times provided, use current time + duration
            if not parsed_start_time:
                parsed_start_time = timezone.now()
            if not parsed_end_time:
                parsed_end_time = parsed_start_time + timedelta(minutes=duration)

            # Create quiz
            quiz = Quiz.objects.create(
                material=material,
                title=title,
                content=content,
                is_group_quiz=True,
                is_active=is_active,
                duration=duration,  # Save duration
                end_time=parsed_end_time,  # Save global end_time if needed
            )

            logger.info(f"Created quiz: {quiz.id} with duration: {duration}")

            # Create questions
            for question_data in questions_data:
                Question.objects.create(
                    quiz=quiz,
                    text=question_data.get("text", ""),
                    choice_a=question_data.get("choice_a", ""),
                    choice_b=question_data.get("choice_b", ""),
                    choice_c=question_data.get("choice_c", ""),
                    choice_d=question_data.get("choice_d", ""),
                    correct_choice=question_data.get("correct_choice", "A"),
                )

            # Assign to groups with specific timing
            assignments_created = 0
            if group_ids:
                groups = Group.objects.filter(id__in=group_ids, material=material)
                for group in groups:
                    group_quiz = GroupQuiz.objects.create(
                        quiz=quiz,
                        group=group,
                        start_time=parsed_start_time,
                        end_time=parsed_end_time,  # Use the calculated end_time
                    )
                    assignments_created += 1
                    logger.info(
                        f"Created GroupQuiz for group {group.name}: {parsed_start_time} - {parsed_end_time}"
                    )

            logger.info(
                f"Quiz created successfully with {assignments_created} group assignments"
            )

            return Response(
                {
                    "message": "Quiz created successfully",
                    "quiz_id": quiz.id,
                    "assignments_created": assignments_created,
                    "duration": duration,
                    "start_time": parsed_start_time,
                    "end_time": parsed_end_time,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Error creating quiz: {str(e)}")
            return Response(
                {"error": f"Failed to create quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, material_slug, quiz_id):
        """Update quiz"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            quiz = get_object_or_404(Quiz, id=quiz_id, material=material)

            data = request.data
            quiz.title = data.get("title", quiz.title)
            quiz.content = data.get("content", quiz.content)
            quiz.is_active = data.get("is_active", quiz.is_active)

            # Update duration if provided
            if "duration" in data:
                quiz.duration = data.get("duration", quiz.duration)

            quiz.save()

            # Update questions if provided
            if "questions" in data:
                # Delete existing questions
                quiz.questions.all().delete()

                # Create new questions
                for question_data in data["questions"]:
                    Question.objects.create(
                        quiz=quiz,
                        text=question_data.get("text", ""),
                        choice_a=question_data.get("choice_a", ""),
                        choice_b=question_data.get("choice_b", ""),
                        choice_c=question_data.get("choice_c", ""),
                        choice_d=question_data.get("choice_d", ""),
                        correct_choice=question_data.get("correct_choice", "A"),
                    )

            # Update group assignments if provided
            if "group_ids" in data:
                # Delete existing assignments
                GroupQuiz.objects.filter(quiz=quiz).delete()

                # Parse new timing
                start_time = data.get("start_time")
                end_time = data.get("end_time")
                duration = data.get("duration", quiz.duration)

                parsed_start_time = timezone.now()
                if start_time:
                    try:
                        parsed_start_time = parse_datetime(start_time)
                    except (ValueError, TypeError):
                        parsed_start_time = timezone.now()

                parsed_end_time = parsed_start_time + timedelta(minutes=duration)
                if end_time:
                    try:
                        parsed_end_time = parse_datetime(end_time)
                    except (ValueError, TypeError):
                        parsed_end_time = parsed_start_time + timedelta(
                            minutes=duration
                        )

                # Create new assignments
                group_ids = data.get("group_ids", [])
                groups = Group.objects.filter(id__in=group_ids, material=material)
                for group in groups:
                    GroupQuiz.objects.create(
                        quiz=quiz,
                        group=group,
                        start_time=parsed_start_time,
                        end_time=parsed_end_time,
                    )

            return Response(
                {"message": "Quiz updated successfully"}, status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error updating quiz: {str(e)}")
            return Response(
                {"error": f"Failed to update quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, material_slug, quiz_id):
        """Update quiz status (active/inactive)"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            quiz = get_object_or_404(Quiz, id=quiz_id, material=material)

            is_active = request.data.get("is_active")
            if is_active is not None:
                quiz.is_active = is_active
                quiz.save()

                if not is_active:
                    self.broadcast_quiz_deactivated(quiz)

                return Response(
                    {
                        "message": f'Quiz {"activated" if is_active else "deactivated"} successfully',
                        "quiz_id": quiz.id,
                        "is_active": quiz.is_active,
                    }
                )

            return Response({"error": "is_active field required"}, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def broadcast_quiz_deactivated(self, quiz):
        """Broadcast quiz deactivation to all active students"""
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            if channel_layer:
                # Get all groups for this quiz
                group_quizzes = GroupQuiz.objects.filter(quiz=quiz)

                for group_quiz in group_quizzes:
                    group_name = f"quiz_collaboration_{quiz.id}_{group_quiz.group.id}"
                    async_to_sync(channel_layer.group_send)(
                        group_name,
                        {
                            "type": "quiz_deactivated",
                            "quiz_id": quiz.id,
                            "message": "Quiz telah dinonaktifkan oleh guru",
                        },
                    )
        except Exception as e:
            logger.error(f"Error broadcasting quiz deactivation: {e}")


class TeacherSessionQuizDetailView(APIView):
    """
    API untuk detail quiz dalam sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, quiz_id):
        """Get detailed quiz information"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            quiz = get_object_or_404(Quiz, id=quiz_id, material=material)

            # Get detailed results
            group_quizzes = GroupQuiz.objects.filter(quiz=quiz).select_related("group")
            results_data = []

            for group_quiz in group_quizzes:
                group_members = GroupMember.objects.filter(
                    group=group_quiz.group
                ).select_related("student")

                submissions = GroupQuizSubmission.objects.filter(group_quiz=group_quiz)
                answers = []
                for submission in submissions:
                    answers.append(
                        {
                            "question_id": submission.question.id,
                            "question_text": submission.question.text,
                            "correct_choice": submission.question.correct_choice,
                            "selected_choice": submission.selected_choice,
                            "is_correct": submission.is_correct,
                            "answered_by": (
                                {
                                    "id": submission.student.id,
                                    "username": submission.student.username,
                                    "first_name": submission.student.first_name,
                                    "last_name": submission.student.last_name,
                                }
                                if submission.student
                                else None
                            ),
                        }
                    )
                # Analisis performa sederhana
                total = len(answers)
                benar = sum(1 for a in answers if a["is_correct"])
                performance = {
                    "score": (
                        group_quiz.result.score if hasattr(group_quiz, "result") else 0
                    ),
                    "accuracy": (benar / total * 100) if total else 0,
                    "correct": benar,
                    "total": total,
                }

                result_data = {
                    "group_id": group_quiz.group.id,
                    "group_name": group_quiz.group.name,
                    "group_code": group_quiz.group.code,
                    "start_time": group_quiz.start_time,
                    "end_time": group_quiz.end_time,
                    "is_completed": group_quiz.is_completed,
                    "submitted_at": group_quiz.submitted_at,
                    "members": [
                        {
                            "id": m.student.id,
                            "username": m.student.username,
                            "first_name": m.student.first_name,
                            "last_name": m.student.last_name,
                        }
                        for m in group_members
                    ],
                    "answers": answers,
                    "performance": performance,
                }

                # Get result if exists
                try:
                    result = group_quiz.result
                    result_data.update(
                        {
                            "score": result.score,
                            "completed_at": result.completed_at,
                            "total_questions": quiz.questions.count(),
                            "correct_answers": group_quiz.submissions.filter(
                                is_correct=True
                            ).count(),
                        }
                    )
                except GroupQuizResult.DoesNotExist:
                    result_data.update(
                        {
                            "score": 0,
                            "completed_at": None,
                            "total_questions": quiz.questions.count(),
                            "correct_answers": 0,
                        }
                    )

                results_data.append(result_data)

            return Response(
                {
                    "quiz": {
                        "id": quiz.id,
                        "title": quiz.title,
                        "content": quiz.content,
                        "duration": quiz.duration,
                        "created_at": quiz.created_at,
                        "questions": [
                            {
                                "id": q.id,
                                "text": q.text,
                                "choice_a": q.choice_a,
                                "choice_b": q.choice_b,
                                "choice_c": q.choice_c,
                                "choice_d": q.choice_d,
                                "correct_choice": q.correct_choice,
                            }
                            for q in quiz.questions.all()
                        ],
                    },
                    "results": results_data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error fetching quiz detail: {str(e)}")
            return Response(
                {"error": f"Failed to fetch quiz detail: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, material_slug, quiz_id):
        """Delete quiz"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            quiz = get_object_or_404(Quiz, id=quiz_id, material=material)

            quiz_title = quiz.title
            quiz.delete()

            return Response(
                {"message": f'Quiz "{quiz_title}" deleted successfully'},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error deleting quiz: {str(e)}")
            return Response(
                {"error": f"Failed to delete quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TeacherSessionQuizRankingView(APIView):
    """
    API untuk ranking real-time quiz dalam sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, quiz_id):
        """Get real-time quiz ranking"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            quiz = get_object_or_404(Quiz, id=quiz_id, material=material)

            # Get all group quizzes
            group_quizzes = (
                GroupQuiz.objects.filter(quiz=quiz)
                .select_related("group")
                .prefetch_related("group__groupmember_set__student")
            )

            ranking_data = []

            for group_quiz in group_quizzes:
                group_members = group_quiz.group.groupmember_set.all()
                member_names = [
                    f"{m.student.first_name} {m.student.last_name}".strip()
                    or m.student.username
                    for m in group_members
                ]

                rank_item = {
                    "group_id": group_quiz.group.id,
                    "group_name": group_quiz.group.name,
                    "group_code": group_quiz.group.code,
                    "member_count": group_members.count(),
                    "member_names": member_names,
                    "status": (
                        "completed"
                        if group_quiz.is_completed
                        else (
                            "in_progress"
                            if group_quiz.submissions.exists()
                            else "not_started"
                        )
                    ),
                    "submitted_at": group_quiz.submitted_at,
                    "total_questions": quiz.questions.count(),
                    "correct_answers": group_quiz.submissions.filter(
                        is_correct=True
                    ).count(),
                }

                # Get score
                try:
                    result = group_quiz.result
                    rank_item["score"] = result.score
                except GroupQuizResult.DoesNotExist:
                    rank_item["score"] = 0

                ranking_data.append(rank_item)

            # Sort by score (descending), then by submission time
            ranking_data.sort(
                key=lambda x: (
                    -x["score"],
                    x["submitted_at"] if x["submitted_at"] else timezone.now(),
                )
            )

            # Add rank
            for idx, item in enumerate(ranking_data):
                item["rank"] = idx + 1

            return Response(ranking_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching ranking: {str(e)}")
            return Response(
                {"error": f"Failed to fetch ranking: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TeacherSessionQuizAssignmentView(APIView):
    """
    API untuk assignment quiz ke groups dalam sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def post(self, request, material_slug):
        """Assign quiz to groups"""
        try:
            material = get_object_or_404(Material, slug=material_slug)

            quiz_id = request.data.get("quiz_id")
            group_ids = request.data.get("group_ids", [])
            start_time = request.data.get("start_time")
            end_time = request.data.get("end_time")
            duration = request.data.get("duration", 60)

            if not quiz_id:
                return Response(
                    {"error": "Quiz ID is required"}, status=status.HTTP_400_BAD_REQUEST
                )

            quiz = get_object_or_404(Quiz, id=quiz_id, material=material)

            # Parse timing
            parsed_start_time = timezone.now()
            if start_time:
                try:
                    parsed_start_time = parse_datetime(start_time)
                except (ValueError, TypeError):
                    parsed_start_time = timezone.now()

            parsed_end_time = parsed_start_time + timedelta(minutes=duration)
            if end_time:
                try:
                    parsed_end_time = parse_datetime(end_time)
                except (ValueError, TypeError):
                    parsed_end_time = parsed_start_time + timedelta(minutes=duration)

            # Remove existing assignments if updating
            GroupQuiz.objects.filter(quiz=quiz).delete()

            # Create new assignments
            assignments_created = 0
            groups = Group.objects.filter(id__in=group_ids, material=material)
            for group in groups:
                GroupQuiz.objects.create(
                    quiz=quiz,
                    group=group,
                    start_time=parsed_start_time,
                    end_time=parsed_end_time,
                )
                assignments_created += 1

            # Broadcast update via WebSocket
            channel_layer = get_channel_layer()
            if channel_layer:
                try:
                    async_to_sync(channel_layer.group_send)(
                        f"quiz_ranking_{quiz_id}",
                        {
                            "type": "quiz_assignment_update",
                            "message": {
                                "quiz_id": quiz_id,
                                "assigned_groups": assignments_created,
                                "start_time": parsed_start_time.isoformat(),
                                "end_time": parsed_end_time.isoformat(),
                            },
                        },
                    )
                except Exception as ws_error:
                    logger.warning(f"WebSocket broadcast failed: {ws_error}")

            return Response(
                {
                    "message": f"Quiz assigned to {assignments_created} groups successfully",
                    "assignments_created": assignments_created,
                    "start_time": parsed_start_time,
                    "end_time": parsed_end_time,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error assigning quiz: {str(e)}")
            return Response(
                {"error": f"Failed to assign quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
