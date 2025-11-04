from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, Prefetch
from django.utils import timezone
from datetime import timedelta
from pramlearnapp.models import (
    Material,
    Assignment,
    AssignmentQuestion,
    AssignmentSubmission,
    AssignmentAnswer,
    ClassStudent,
    SubjectClass,
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.serializers.teacher.assignmentSerializer import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    AssignmentQuestionSerializer,
)
import logging

logger = logging.getLogger(__name__)


class TeacherSessionAssignmentView(APIView):
    """
    API untuk mengelola assignments dalam context sessions material
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        """Get all assignments for a material with detailed statistics"""
        try:
            material = get_object_or_404(Material, slug=material_slug)

            # Verify teacher has access to this material
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            # Get assignments dengan relasi yang diperlukan
            assignments = (
                Assignment.objects.filter(material=material)
                .prefetch_related(
                    "questions",
                    "assignmentsubmission_set__student",
                    "assignmentsubmission_set__answers",
                )
                .order_by("-created_at")
            )

            # Get students in this class for context
            class_students = ClassStudent.objects.filter(
                class_id=subject_class.class_id
            ).select_related("student")

            total_students = class_students.count()
            students_data = []
            for cs in class_students:
                student = cs.student
                students_data.append(
                    {
                        "id": student.id,
                        "username": student.username,
                        "first_name": student.first_name,
                        "last_name": student.last_name,
                        "full_name": f"{student.first_name} {student.last_name}".strip()
                        or student.username,
                    }
                )

            assignments_data = []
            for assignment in assignments:
                # Get submission statistics
                submissions = assignment.assignmentsubmission_set.filter(is_draft=False)
                total_submissions = submissions.count()
                graded_submissions = submissions.filter(grade__isnull=False).count()
                pending_submissions = submissions.filter(grade__isnull=True).count()

                # Calculate average grade
                avg_grade = 0
                if graded_submissions > 0:
                    grades = submissions.filter(grade__isnull=False)
                    avg_grade = grades.aggregate(avg=Avg("grade"))["avg"] or 0

                # Get submission rate
                submission_rate = (
                    (total_submissions / total_students * 100)
                    if total_students > 0
                    else 0
                )

                # Check if assignment is overdue
                is_overdue = (
                    timezone.now() > assignment.due_date
                    if assignment.due_date
                    else False
                )

                # Get recent submissions (last 24 hours)
                yesterday = timezone.now() - timedelta(hours=24)
                recent_submissions = submissions.filter(
                    submission_date__gte=yesterday
                ).count()

                assignment_dict = {
                    "id": assignment.id,
                    "title": assignment.title,
                    "description": assignment.description,
                    "due_date": (
                        assignment.due_date.isoformat() if assignment.due_date else None
                    ),
                    "created_at": assignment.created_at.isoformat(),
                    "updated_at": assignment.updated_at.isoformat(),
                    "slug": assignment.slug,
                    "question_count": assignment.questions.count(),
                    "total_submissions": total_submissions,
                    "graded_submissions": graded_submissions,
                    "pending_submissions": pending_submissions,
                    "average_grade": round(avg_grade, 1),
                    "submission_rate": round(submission_rate, 1),
                    "is_overdue": is_overdue,
                    "recent_submissions": recent_submissions,
                    "status": self.get_assignment_status(
                        assignment, total_submissions, total_students
                    ),
                }
                assignments_data.append(assignment_dict)

            # Overall statistics
            total_assignments = len(assignments_data)
            total_all_submissions = sum(
                a["total_submissions"] for a in assignments_data
            )
            total_pending = sum(a["pending_submissions"] for a in assignments_data)
            overall_avg_grade = (
                sum(a["average_grade"] for a in assignments_data) / total_assignments
                if total_assignments > 0
                else 0
            )
            overall_submission_rate = (
                sum(a["submission_rate"] for a in assignments_data) / total_assignments
                if total_assignments > 0
                else 0
            )

            response_data = {
                "material": {
                    "id": material.id,
                    "title": material.title,
                    "slug": material.slug,
                    "subject_name": material.subject.name,
                    "class_name": subject_class.class_id.name,
                },
                "assignments": assignments_data,
                "students": students_data,
                "statistics": {
                    "total_assignments": total_assignments,
                    "total_students": total_students,
                    "total_submissions": total_all_submissions,
                    "pending_grading": total_pending,
                    "overall_average_grade": round(overall_avg_grade, 1),
                    "overall_submission_rate": round(overall_submission_rate, 1),
                    "assignments_overdue": sum(
                        1 for a in assignments_data if a["is_overdue"]
                    ),
                },
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Material.DoesNotExist:
            return Response(
                {"error": "Material not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "You do not have access to this material"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            logger.error(f"Error fetching session assignments: {str(e)}")
            return Response(
                {"error": f"Failed to fetch assignments: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, material_slug):
        """Create new assignment for material"""
        try:
            material = get_object_or_404(Material, slug=material_slug)

            # Verify teacher has access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            # Create assignment
            assignment_data = request.data.copy()
            assignment_data["material"] = material.id

            serializer = AssignmentSerializer(data=assignment_data)
            if serializer.is_valid():
                assignment = serializer.save()

                # Create questions if provided
                questions_data = request.data.get("questions", [])
                for question_data in questions_data:
                    question_data["assignment"] = assignment.id
                    question_serializer = AssignmentQuestionSerializer(
                        data=question_data
                    )
                    if question_serializer.is_valid():
                        question_serializer.save()

                return Response(
                    {
                        "message": "Assignment created successfully",
                        "assignment": AssignmentSerializer(assignment).data,
                    },
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error creating session assignment: {str(e)}")
            return Response(
                {"error": f"Failed to create assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, material_slug, assignment_id):
        """Update assignment"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            assignment = get_object_or_404(
                Assignment, id=assignment_id, material=material
            )

            # Verify teacher access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            # Update assignment basic info
            assignment_data = {
                "title": request.data.get("title"),
                "description": request.data.get("description"),
                "due_date": request.data.get("due_date"),
            }

            serializer = AssignmentSerializer(
                assignment, data=assignment_data, partial=True
            )

            if serializer.is_valid():
                assignment = serializer.save()

                # Update questions if provided
                questions_data = request.data.get("questions", [])
                if questions_data:
                    # Get existing questions
                    existing_questions = {q.id: q for q in assignment.questions.all()}

                    # Track which questions to keep
                    updated_question_ids = []

                    for question_data in questions_data:
                        question_id = question_data.get("id")

                        if question_id and question_id in existing_questions:
                            # Update existing question
                            question = existing_questions[question_id]
                            question.text = question_data.get("text", question.text)
                            question.choice_a = question_data.get(
                                "choice_a", question.choice_a
                            )
                            question.choice_b = question_data.get(
                                "choice_b", question.choice_b
                            )
                            question.choice_c = question_data.get(
                                "choice_c", question.choice_c
                            )
                            question.choice_d = question_data.get(
                                "choice_d", question.choice_d
                            )
                            question.correct_choice = question_data.get(
                                "correct_choice", question.correct_choice
                            )

                            question.explanation = question_data.get("explanation", "")
                            question.save()
                            updated_question_ids.append(question_id)
                        else:
                            # Create new question
                            new_question_data = {
                                "assignment": assignment.id,
                                "text": question_data.get("text", ""),
                                "choice_a": question_data.get("choice_a", ""),
                                "choice_b": question_data.get("choice_b", ""),
                                "choice_c": question_data.get("choice_c", ""),
                                "choice_d": question_data.get("choice_d", ""),
                                "correct_choice": question_data.get(
                                    "correct_choice", "A"
                                ),
                                "explanation": question_data.get("explanation", ""),
                            }
                            question_serializer = AssignmentQuestionSerializer(
                                data=new_question_data
                            )
                            if question_serializer.is_valid():
                                new_question = question_serializer.save()
                                updated_question_ids.append(new_question.id)

                    # Delete questions that are no longer in the list
                    for question_id, question in existing_questions.items():
                        if question_id not in updated_question_ids:
                            question.delete()

                return Response(
                    {
                        "message": "Assignment updated successfully",
                        "assignment": AssignmentSerializer(assignment).data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error updating assignment: {str(e)}")
            return Response(
                {"error": f"Failed to update assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_assignment_status(self, assignment, submissions_count, total_students):
        """Determine assignment status"""
        if not assignment.due_date:
            return "active"

        now = timezone.now()
        if now > assignment.due_date:
            if submissions_count >= total_students:
                return "completed"
            else:
                return "overdue"
        else:
            if submissions_count >= total_students:
                return "completed"
            else:
                return "active"


class TeacherSessionAssignmentDetailView(APIView):
    """
    API untuk detail assignment dalam sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug, assignment_id):
        """Get detailed assignment information with submissions"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            assignment = get_object_or_404(
                Assignment, id=assignment_id, material=material
            )

            # Verify teacher access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            # Get submissions with student details and answers
            submissions = (
                AssignmentSubmission.objects.filter(
                    assignment=assignment, is_draft=False
                )
                .select_related("student")
                .prefetch_related("answers__question")
            )

            submissions_data = []
            for submission in submissions:
                student = submission.student

                # Get answers with question details
                answers_data = []
                for answer in submission.answers.all():
                    answers_data.append(
                        {
                            "question_id": answer.question.id,
                            "question_text": answer.question.text,
                            "selected_choice": answer.selected_choice,
                            "correct_choice": answer.question.correct_choice,
                            "is_correct": answer.is_correct,
                            "essay_answer": answer.essay_answer,
                        }
                    )

                submission_dict = {
                    "id": submission.id,
                    "student": {
                        "id": student.id,
                        "username": student.username,
                        "first_name": student.first_name,
                        "last_name": student.last_name,
                        "full_name": f"{student.first_name} {student.last_name}".strip()
                        or student.username,
                    },
                    "submission_date": submission.submission_date.isoformat(),
                    "grade": submission.grade,
                    "teacher_feedback": submission.teacher_feedback,
                    "graded_at": (
                        submission.graded_at.isoformat()
                        if submission.graded_at
                        else None
                    ),
                    "answers": answers_data,
                    "is_late": (
                        submission.submission_date > assignment.due_date
                        if assignment.due_date
                        else False
                    ),
                }
                submissions_data.append(submission_dict)

            # Get assignment questions - PERBAIKAN: tambahkan explanation field
            questions = assignment.questions.all()
            questions_data = []
            for question in questions:
                questions_data.append(
                    {
                        "id": question.id,
                        "text": question.text,
                        "choice_a": question.choice_a,
                        "choice_b": question.choice_b,
                        "choice_c": question.choice_c,
                        "choice_d": question.choice_d,
                        "correct_choice": question.correct_choice,
                        "explanation": question.explanation,  # TAMBAHKAN ini
                    }
                )

            response_data = {
                "assignment": {
                    "id": assignment.id,
                    "title": assignment.title,
                    "description": assignment.description,
                    "due_date": (
                        assignment.due_date.isoformat() if assignment.due_date else None
                    ),
                    "created_at": assignment.created_at.isoformat(),
                    "questions": questions_data,
                },
                "submissions": submissions_data,
                "statistics": {
                    "total_submissions": len(submissions_data),
                    "graded_count": len(
                        [s for s in submissions_data if s["grade"] is not None]
                    ),
                    "pending_count": len(
                        [s for s in submissions_data if s["grade"] is None]
                    ),
                    "average_grade": (
                        sum(
                            s["grade"]
                            for s in submissions_data
                            if s["grade"] is not None
                        )
                        / len([s for s in submissions_data if s["grade"] is not None])
                        if any(s["grade"] is not None for s in submissions_data)
                        else 0
                    ),
                    "late_submissions": len(
                        [s for s in submissions_data if s["is_late"]]
                    ),
                },
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching assignment detail: {str(e)}")
            return Response(
                {"error": f"Failed to fetch assignment detail: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, material_slug, assignment_id):
        """Update assignment"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            assignment = get_object_or_404(
                Assignment, id=assignment_id, material=material
            )

            # Verify teacher access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            serializer = AssignmentSerializer(
                assignment, data=request.data, partial=True
            )
            if serializer.is_valid():
                assignment = serializer.save()

                # Update questions if provided
                questions_data = request.data.get("questions", [])
                if questions_data:
                    # Delete existing questions
                    assignment.questions.all().delete()

                    # Create new questions
                    for question_data in questions_data:
                        question_data["assignment"] = assignment.id
                        question_serializer = AssignmentQuestionSerializer(
                            data=question_data
                        )
                        if question_serializer.is_valid():
                            question_serializer.save()

                return Response(
                    {
                        "message": "Assignment updated successfully",
                        "assignment": AssignmentSerializer(assignment).data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error updating assignment: {str(e)}")
            return Response(
                {"error": f"Failed to update assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, material_slug, assignment_id):
        """Delete assignment"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            assignment = get_object_or_404(
                Assignment, id=assignment_id, material=material
            )

            # Verify teacher access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            assignment.delete()

            return Response(
                {"message": "Assignment deleted successfully"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error deleting assignment: {str(e)}")
            return Response(
                {"error": f"Failed to delete assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TeacherSessionAssignmentGradingView(APIView):
    """
    API untuk grading assignments dalam sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def post(self, request, material_slug, assignment_id, submission_id):
        """Grade a specific assignment submission"""
        try:
            material = get_object_or_404(Material, slug=material_slug)
            assignment = get_object_or_404(
                Assignment, id=assignment_id, material=material
            )
            submission = get_object_or_404(
                AssignmentSubmission, id=submission_id, assignment=assignment
            )

            # Verify teacher access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            grade = request.data.get("grade")
            feedback = request.data.get("feedback", "")

            if grade is None:
                return Response(
                    {"error": "Grade is required"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Update submission
            submission.grade = float(grade)
            submission.teacher_feedback = feedback
            submission.graded_at = timezone.now()
            submission.save()

            # Create grade record for analytics
            from pramlearnapp.services.gradeService import create_grade_from_submission

            create_grade_from_submission(submission)

            return Response(
                {
                    "message": "Assignment graded successfully",
                    "submission": {
                        "id": submission.id,
                        "grade": submission.grade,
                        "teacher_feedback": submission.teacher_feedback,
                        "graded_at": submission.graded_at.isoformat(),
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error grading assignment: {str(e)}")
            return Response(
                {"error": f"Failed to grade assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TeacherSessionAssignmentAnalyticsView(APIView):
    """
    API untuk analytics assignments dalam sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        """Get assignment analytics for material"""
        try:
            material = get_object_or_404(Material, slug=material_slug)

            # Verify teacher access
            subject_class = get_object_or_404(
                SubjectClass, subject=material.subject, teacher=request.user
            )

            assignments = Assignment.objects.filter(material=material)

            # Performance analytics
            analytics_data = {
                "performance_trend": self.get_performance_trend(assignments),
                "question_analysis": self.get_question_analysis(assignments),
                "student_performance": self.get_student_performance(
                    assignments, subject_class.class_id
                ),
                "submission_timeline": self.get_submission_timeline(assignments),
            }

            return Response(analytics_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching assignment analytics: {str(e)}")
            return Response(
                {"error": f"Failed to fetch analytics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_performance_trend(self, assignments):
        """Calculate performance trend over time"""
        # Implementation for performance trend analysis
        return []

    def get_question_analysis(self, assignments):
        """Analyze question difficulty and accuracy"""
        # Implementation for question analysis
        return []

    def get_student_performance(self, assignments, class_obj):
        """Analyze individual student performance"""
        # Implementation for student performance analysis
        return []

    def get_submission_timeline(self, assignments):
        """Analyze submission patterns"""
        # Implementation for submission timeline analysis
        return []
