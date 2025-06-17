from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from django.utils import timezone
from django.db.models import Q, Prefetch
from django.utils.text import slugify
from pramlearnapp.permissions import IsStudentUser
from pramlearnapp.models import (
    Assignment, AssignmentQuestion, AssignmentSubmission,
    AssignmentAnswer, ClassStudent, SubjectClass, Material,
    StudentAssignmentDraft, StudentActivity
)
from pramlearnapp.serializers.student.studentAssignmentSerializer import (
    StudentAssignmentSerializer, StudentAssignmentSubmissionSerializer,
    StudentAssignmentDraftSerializer
)
import json
from django.core.files.storage import default_storage
from pramlearnapp.utils.log_student_activity import log_student_activity


class StudentAvailableAssignmentsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request):
        """Get available assignments for student"""
        user = request.user

        try:
            # Get student's classes
            class_students = ClassStudent.objects.filter(student=user)
            if not class_students.exists():
                return Response({
                    "message": "No classes found for this student",
                    "assignments": []
                })

            class_ids = class_students.values_list("class_id", flat=True)

            # Get subject classes for student's classes
            subject_classes = SubjectClass.objects.filter(
                class_id__in=class_ids)
            subject_ids = subject_classes.values_list(
                "subject_id", flat=True).distinct()

            if not subject_ids:
                return Response({
                    "message": "No subjects found for this student",
                    "assignments": []
                })

            # Get materials from student's subjects
            materials = Material.objects.filter(subject_id__in=subject_ids)
            material_ids = materials.values_list("id", flat=True)

            if not material_ids:
                return Response({
                    "message": "No materials found for this student",
                    "assignments": []
                })

            # Get assignments from those materials
            assignments = Assignment.objects.filter(
                material_id__in=material_ids
            ).select_related(
                'material',
                'material__subject'
            ).prefetch_related(
                'questions'
            ).order_by('-created_at')

            # UBAH: Manual serialization dengan informasi submission
            assignment_data = []
            for assignment in assignments:
                # Cek submission untuk assignment ini
                submission = AssignmentSubmission.objects.filter(
                    student=user,
                    assignment=assignment,
                    is_draft=False  # Hanya submission final
                ).first()

                # Get questions count
                questions_count = assignment.questions.count()

                # Get subject name
                subject_name = assignment.material.subject.name if assignment.material.subject else 'Unknown'

                assignment_dict = {
                    'id': assignment.id,
                    'title': assignment.title,
                    'description': assignment.description,
                    'due_date': assignment.due_date.isoformat(),
                    'created_at': assignment.created_at.isoformat() if hasattr(assignment, 'created_at') else None,
                    'questions_count': questions_count,
                    'subject_name': subject_name,
                    'material_title': assignment.material.title,
                    'slug': assignment.slug,
                    # TAMBAHKAN informasi submission
                    'submission_id': submission.id if submission else None,
                    'submitted_at': submission.submission_date.isoformat() if submission else None,
                    'grade': submission.grade if submission else None,
                    'is_submitted': submission is not None,
                }
                assignment_data.append(assignment_dict)

            return Response(assignment_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": f"Error fetching assignments: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentAssignmentQuestionsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, assignment_id):
        """Get questions for specific assignment"""
        try:
            # Verify student has access to this assignment
            user = request.user
            assignment = Assignment.objects.select_related(
                'material__subject'
            ).get(id=assignment_id)

            # Check if student's class has access to this assignment's subject
            class_students = ClassStudent.objects.filter(student=user)
            class_ids = class_students.values_list("class_id", flat=True)
            subject_classes = SubjectClass.objects.filter(
                class_id__in=class_ids,
                subject=assignment.material.subject
            )

            if not subject_classes.exists():
                return Response(
                    {"detail": "You don't have access to this assignment"},
                    status=status.HTTP_403_FORBIDDEN
                )

            questions = AssignmentQuestion.objects.filter(
                assignment=assignment
            ).order_by('id')

            questions_data = []
            for q in questions:
                questions_data.append({
                    'id': q.id,
                    'text': q.text,
                    'choice_a': q.choice_a,
                    'choice_b': q.choice_b,
                    'choice_c': q.choice_c,
                    'choice_d': q.choice_d,
                    'correct_choice': q.correct_choice,
                    'question_type': 'multiple_choice' if q.choice_a else 'essay',
                    'required': True,
                    'order': q.id
                })

            return Response({
                'assignment': {
                    'id': assignment.id,
                    'title': assignment.title,
                    'description': assignment.description,
                    'due_date': assignment.due_date,
                    'subject_name': assignment.material.subject.name,
                },
                'questions': questions_data
            })

        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentAssignmentDraftView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, assignment_id):
        """Load draft for assignment"""
        try:
            draft = StudentAssignmentDraft.objects.get(
                student=request.user,
                assignment_id=assignment_id
            )
            serializer = StudentAssignmentDraftSerializer(draft)
            return Response(serializer.data)
        except StudentAssignmentDraft.DoesNotExist:
            return Response({
                'draft_answers': {},
                'uploaded_files': [],
                'last_saved': None,
                'created_at': None
            })

    def put(self, request, assignment_id):
        """Save draft for assignment"""
        try:
            assignment = Assignment.objects.get(id=assignment_id)

            # Verify access
            user = request.user
            class_students = ClassStudent.objects.filter(student=user)
            class_ids = class_students.values_list("class_id", flat=True)
            subject_classes = SubjectClass.objects.filter(
                class_id__in=class_ids,
                subject=assignment.material.subject
            )

            if not subject_classes.exists():
                return Response(
                    {"detail": "You don't have access to this assignment"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get or create draft
            draft, created = StudentAssignmentDraft.objects.get_or_create(
                student=request.user,
                assignment=assignment,
                defaults={
                    'draft_answers': request.data.get('draft_answers', {}),
                    'uploaded_files': request.data.get('uploaded_files', []),
                }
            )

            if not created:
                draft.draft_answers = request.data.get('draft_answers', {})
                draft.uploaded_files = request.data.get('uploaded_files', [])
                draft.save()

            return Response({
                'status': 'Draft saved successfully',
                'last_saved': draft.last_saved
            })

        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentAssignmentSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, assignment_id):
        """Submit assignment"""
        try:
            assignment = Assignment.objects.select_related(
                'material__subject'
            ).get(id=assignment_id)

            # Verify access and due date
            user = request.user
            class_students = ClassStudent.objects.filter(student=user)
            class_ids = class_students.values_list("class_id", flat=True)
            subject_classes = SubjectClass.objects.filter(
                class_id__in=class_ids,
                subject=assignment.material.subject
            )

            if not subject_classes.exists():
                return Response(
                    {"detail": "You don't have access to this assignment"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # PERBAIKAN: Check if already submitted (final submission)
            existing_submission = AssignmentSubmission.objects.filter(
                student=user,
                assignment=assignment
            ).first()

            print(f"🔍 Checking existing submission: {existing_submission}")
            if existing_submission:
                print(f"📋 Submission is_draft: {existing_submission.is_draft}")

            # UBAH KONDISI INI: Hanya tolak jika submission sudah final (is_draft=False)
            if existing_submission and not existing_submission.is_draft:
                print("❌ Assignment already submitted (not draft)")
                return Response(
                    {"detail": "Assignment already submitted"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create or update submission
            if not existing_submission:
                # Create new submission
                submission = AssignmentSubmission.objects.create(
                    student=user,
                    assignment=assignment,
                    submission_date=timezone.now(),
                    is_draft=False  # Mark as final submission
                )
                print(f"✅ New final submission created: {submission.id}")
            else:
                # Update existing draft to final
                submission = existing_submission
                submission.submission_date = timezone.now()
                submission.is_draft = False  # Mark as final
                submission.save()
                print(f"🔄 Draft submission finalized: {submission.id}")

            # Calculate grade
            submission.calculate_and_save_score()
            print(f"📊 Grade calculated: {submission.grade}")

            return Response({
                "message": "Assignment submitted successfully",
                "submission_id": submission.id,
                "grade": submission.grade
            }, status=status.HTTP_201_CREATED)

        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"❌ Error submitting assignment: {str(e)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")

            return Response(
                {"detail": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentAssignmentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, assignment_id):
        """Get submission history for assignment"""
        try:
            assignment = Assignment.objects.get(id=assignment_id)

            submissions = AssignmentSubmission.objects.filter(
                student=request.user,
                assignment=assignment
            ).prefetch_related(
                'answers__question'
            ).order_by('-submission_date')
            StudentActivity.objects.create(
                student=request.user,
                title=f"Mengumpulkan Assignment: {assignment.title}",
                # description="Kamu telah mengumpulkan assignment.",
                activity_type="assignment",
                timestamp=timezone.now(),
            )

            serializer = StudentAssignmentSubmissionSerializer(
                submissions, many=True
            )

            return Response(serializer.data)

        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentAssignmentBySlugView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_slug):
        try:
            # Cari assignment berdasarkan slug
            assignment = Assignment.objects.select_related(
                'material__subject'
            ).prefetch_related('questions').get(slug=assignment_slug)

            # Verify student has access to this assignment
            user = request.user
            class_students = ClassStudent.objects.filter(student=user)
            class_ids = class_students.values_list("class_id", flat=True)
            subject_classes = SubjectClass.objects.filter(
                class_id__in=class_ids,
                subject=assignment.material.subject
            )

            if not subject_classes.exists():
                return Response(
                    {"error": "You don't have access to this assignment"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get assignment data
            assignment_data = {
                'id': assignment.id,
                'title': assignment.title,
                'description': assignment.description,
                'due_date': assignment.due_date.isoformat(),
                'slug': assignment.slug,
                'material_title': assignment.material.title,
                'subject_name': assignment.material.subject.name,
                'questions_count': assignment.questions.count(),
            }

            # Get submissions for this assignment and user
            submissions = AssignmentSubmission.objects.filter(
                assignment=assignment,
                student=user,
                is_draft=False  # Only final submissions
            ).order_by('-submission_date')

            submissions_data = []
            for submission in submissions:
                submissions_data.append({
                    'id': submission.id,
                    'submission_date': submission.submission_date.isoformat(),
                    'grade': submission.grade,
                    'teacher_feedback': submission.teacher_feedback,
                    'is_draft': submission.is_draft,
                })

            return Response({
                'assignment': assignment_data,
                'submissions': submissions_data
            }, status=status.HTTP_200_OK)

        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in StudentAssignmentBySlugView: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
