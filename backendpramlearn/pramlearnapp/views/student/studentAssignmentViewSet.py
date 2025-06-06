from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.db.models import Q, Prefetch
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

            # Serialize with student context
            serializer = StudentAssignmentSerializer(
                assignments,
                many=True,
                context={'request': request, 'student': user}
            )

            return Response(serializer.data)

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
    permission_classes = [IsAuthenticated, IsStudentUser]

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

            # Check if already submitted
            existing_submission = AssignmentSubmission.objects.filter(
                student=user,
                assignment=assignment
            ).first()

            if existing_submission:
                return Response(
                    {"detail": "Assignment already submitted"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check due date (optional - allow late submission)
            is_late = timezone.now() > assignment.due_date

            # Create submission
            submission = AssignmentSubmission.objects.create(
                student=user,
                assignment=assignment,
                submission_date=timezone.now()
            )

            # Handle answers from request data
            answers_data = {}
            for key, value in request.data.items():
                if key.startswith('answers[') and key.endswith(']'):
                    # Extract question ID from answers[123] format
                    question_id = key[8:-1]  # Remove 'answers[' and ']'
                    try:
                        question_id = int(question_id)
                        answers_data[question_id] = value
                    except ValueError:
                        continue

            # Create answer records
            for question_id, answer_value in answers_data.items():
                try:
                    question = AssignmentQuestion.objects.get(
                        id=question_id, assignment=assignment)

                    # Create answer - handle both multiple choice and essay
                    if question.choice_a:  # Multiple choice
                        AssignmentAnswer.objects.create(
                            submission=submission,
                            question=question,
                            selected_choice=answer_value,
                            answer_text=None
                        )
                    else:  # Essay question
                        AssignmentAnswer.objects.create(
                            submission=submission,
                            question=question,
                            selected_choice=None,
                            answer_text=answer_value
                        )
                except AssignmentQuestion.DoesNotExist:
                    continue

            # Handle file uploads
            uploaded_files = []
            if 'files' in request.FILES:
                files = request.FILES.getlist('files')
                for file in files:
                    # Save file and store reference
                    file_path = default_storage.save(
                        f'assignment_submissions/{submission.id}/{file.name}',
                        file
                    )
                    uploaded_files.append({
                        'name': file.name,
                        'path': file_path,
                        'size': file.size,
                        'url': default_storage.url(file_path)
                    })

            # Update submission with files
            if uploaded_files:
                submission.files = uploaded_files
                submission.save()

            # Calculate grade for multiple choice questions
            submission.calculate_and_save_grade()

            # Clean up draft
            StudentAssignmentDraft.objects.filter(
                student=user,
                assignment=assignment
            ).delete()

            return Response({
                'id': submission.id,
                'submission_date': submission.submission_date,
                'grade': submission.grade,
                'is_late': is_late,
                'message': 'Assignment submitted successfully'
            }, status=status.HTTP_201_CREATED)

        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
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
