from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from pramlearnapp.models import Assignment, AssignmentSubmission
from pramlearnapp.models.assignment import AssignmentQuestion, AssignmentAnswer
from pramlearnapp.serializers.teacher.assignmentSerializer import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    AssignmentQuestionSerializer,
    AssignmentAnswerSerializer,
    AssignmentSubmissionStudentInputSerializer,
)
from pramlearnapp.decorators import student_required  # Add this import


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Pastikan menggunakan select_related dan prefetch_related yang benar
        return AssignmentSubmission.objects.select_related(
            'student', 'assignment'
        ).prefetch_related(
            'answers__question'
        ).all()

    def perform_create(self, serializer):
        submission = serializer.save()
        submission.calculate_and_save_score()

    def perform_update(self, serializer):
        submission = serializer.save()
        submission.calculate_and_save_score()


class AssignmentSubmissionDetailView(APIView):
    """API untuk mendapatkan detail submission dengan ranking"""

    @student_required
    def get(self, request, submission_id):
        try:
            # Get submission
            submission = get_object_or_404(
                AssignmentSubmission,
                id=submission_id,
                student=request.user
            )

            assignment = submission.assignment

            # Calculate ranking based on submission time
            earlier_submissions = AssignmentSubmission.objects.filter(
                assignment=assignment,
                submission_date__lt=submission.submission_date,
                # Filter same class if needed
            ).count()

            # Calculate grade
            submission.calculate_and_save_score()  # Change from calculate_and_save_grade
            print(f"📊 Grade calculated: {submission.grade}")

            total_participants = AssignmentSubmission.objects.filter(
                assignment=assignment
            ).count()

            rank = earlier_submissions + 1

            # Calculate work duration
            work_duration = None
            if submission.start_time and submission.submission_date:
                duration = submission.submission_date - submission.start_time
                hours = duration.total_seconds() // 3600
                minutes = (duration.total_seconds() % 3600) // 60
                if hours > 0:
                    work_duration = f"{int(hours)} jam {int(minutes)} menit"
                else:
                    work_duration = f"{int(minutes)} menit"

            # Get answers with details
            answers = []
            submission_answers = AssignmentAnswer.objects.filter(
                submission=submission
            ).select_related('question')

            for answer in submission_answers:
                question = answer.question
                is_correct = answer.selected_choice == question.correct_choice if answer.selected_choice else False

                answers.append({
                    'question_id': question.id,
                    'question_text': question.text,
                    'selected_choice': answer.selected_choice,
                    'selected_answer_text': getattr(question, f'choice_{answer.selected_choice.lower()}', '') if answer.selected_choice else '',
                    'essay_answer': answer.essay_answer,
                    'correct_answer': question.correct_choice,
                    'correct_answer_text': getattr(question, f'choice_{question.correct_choice.lower()}', '') if question.correct_choice else '',
                    'is_correct': is_correct,
                    'explanation': question.explanation or None,
                })

            # Calculate statistics
            correct_answers = sum(
                1 for answer in answers if answer['is_correct'])
            total_questions = len(answers)

            data = {
                'submission_id': submission.id,
                'rank': rank,
                'total_participants': total_participants,
                'work_duration': work_duration,
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'grade': submission.grade,
                'answers': answers,
                'teacher_feedback': submission.teacher_feedback,
                'submission_date': submission.submission_date,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AssignmentQuestionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentQuestion.objects.all()
    serializer_class = AssignmentQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        return queryset


@permission_classes([IsAuthenticated])
class AssignmentAnswerViewSet(APIView):
    """API untuk menyimpan dan mengambil jawaban assignment"""
    queryset = AssignmentAnswer.objects.all()
    serializer_class = AssignmentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get existing answers for assignment"""
        assignment_id = request.query_params.get('assignment')
        student_id = request.query_params.get('student')

        if not assignment_id:
            return Response(
                {"error": "assignment parameter required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = AssignmentAnswer.objects.filter(
            submission__assignment_id=assignment_id,
            submission__student_id=student_id
        )

        data = []
        for answer in answers:
            data.append({
                'id': answer.id,
                'question': answer.question.id,
                'selected_choice': answer.selected_choice,
                'essay_answer': answer.answer_text,  # Gunakan answer_text dari model
                'student': answer.submission.student.id,
                'answered_at': timezone.now(),
            })

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """Save or update assignment answer"""
        print(f"📝 POST /assignment-answers/ request data: {request.data}")
        print(f"👤 User: {request.user}")

        assignment_id = request.data.get('assignment')
        question_id = request.data.get('question')
        selected_choice = request.data.get('selected_choice')
        essay_answer = request.data.get('essay_answer')

        print(
            f"📊 Parsed data: assignment_id={assignment_id}, question_id={question_id}")

        if not assignment_id or not question_id:
            return Response(
                {"error": "assignment and question are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            assignment = get_object_or_404(Assignment, id=assignment_id)
            question = get_object_or_404(AssignmentQuestion, id=question_id)

            print(f"✅ Found assignment: {assignment.title}")
            print(f"✅ Found question: {question.text[:50]}...")

            # UBAH: Cari submission yang sudah ada, JANGAN buat yang baru untuk draft
            existing_submission = AssignmentSubmission.objects.filter(
                student=request.user,
                assignment=assignment
            ).first()

            # Jika ada submission dan sudah final (bukan draft), jangan izinkan edit
            if existing_submission and not existing_submission.is_draft:
                return Response(
                    {"error": "Assignment already submitted and cannot be modified"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Jika belum ada submission sama sekali, buat draft submission
            if not existing_submission:
                existing_submission = AssignmentSubmission.objects.create(
                    student=request.user,
                    assignment=assignment,
                    submission_date=timezone.now()  # Temporary date, akan diupdate saat submit final
                )
                print(f"📋 Draft submission created: {existing_submission.id}")
            else:
                print(f"📋 Using existing submission: {existing_submission.id}")

            # Save or update answer
            answer, created = AssignmentAnswer.objects.get_or_create(
                submission=existing_submission,
                question=question,
                defaults={
                    'selected_choice': selected_choice,
                    'answer_text': essay_answer,
                }
            )

            print(
                f"💬 Answer {'created' if created else 'updated'}: {answer.id}")

            if not created:
                # Update existing answer
                answer.selected_choice = selected_choice
                answer.answer_text = essay_answer
                answer.save()
                print(f"🔄 Updated answer {answer.id}")

            return Response({
                'id': answer.id,
                'message': 'Answer saved successfully',
                'created': created,
                'is_draft': True  # Indicate this is still a draft
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in POST assignment-answers: {str(e)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SubmitAssignmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        print(f"🔥 SUBMIT Assignment request: {request.data}")
        print(f"👤 User: {request.user}")

        serializer = AssignmentSubmissionStudentInputSerializer(
            data=request.data, context={'request': request})

        if serializer.is_valid():
            try:
                assignment_id = serializer.validated_data.get('assignment')

                # Cari submission yang sudah ada
                existing_submission = AssignmentSubmission.objects.filter(
                    student=request.user,
                    assignment_id=assignment_id
                ).first()

                print(
                    f"🔍 Checking existing submission for assignment {assignment_id}")
                print(f"📋 Existing submission: {existing_submission}")

                # TAMBAHKAN KODE INI DI SINI:
                # Jika submission sudah final (bukan draft), tolak submit ulang
                if existing_submission and not existing_submission.is_draft:
                    print("❌ Assignment already submitted")
                    return Response(
                        {"detail": "Assignment already submitted"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Jika submission belum ada, buat baru
                if not existing_submission:
                    submission = serializer.save()
                    print(f"✅ New submission created: {submission.id}")
                else:
                    # Update submission yang sudah ada menjadi final
                    submission = existing_submission
                    submission.submission_date = timezone.now()
                    submission.save()
                    print(f"🔄 Finalized existing submission: {submission.id}")

                # Calculate grade
                submission.calculate_and_save_grade()
                print(f"📊 Grade calculated: {submission.grade}")

                # TAMBAHKAN KODE INI JUGA DI SINI:
                # Update submission menjadi final
                submission.is_draft = False
                submission.save()

                return Response({
                    "message": "Assignment submitted successfully",
                    "submission_id": submission.id,
                    "grade": submission.grade
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"❌ Error submitting assignment: {str(e)}")
                import traceback
                print(f"❌ Traceback: {traceback.format_exc()}")

                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            print(f"❌ Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
