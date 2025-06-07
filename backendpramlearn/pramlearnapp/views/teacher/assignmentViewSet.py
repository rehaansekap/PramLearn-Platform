from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pramlearnapp.models import Assignment, AssignmentSubmission
from pramlearnapp.models.assignment import AssignmentQuestion, AssignmentAnswer
from pramlearnapp.serializers.teacher.assignmentSerializer import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    AssignmentQuestionSerializer,
    AssignmentAnswerSerializer,
    AssignmentSubmissionStudentInputSerializer,
)


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
        submission.calculate_and_save_grade()

    def perform_update(self, serializer):
        submission = serializer.save()
        submission.calculate_and_save_grade()


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


class AssignmentAnswerViewSet(viewsets.ModelViewSet):
    queryset = AssignmentAnswer.objects.all()
    serializer_class = AssignmentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubmitAssignmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AssignmentSubmissionStudentInputSerializer(
            data=request.data, context={'request': request})
        if (serializer.is_valid()):
            submission = serializer.save()
            return Response({"message": "Assignment submitted successfully.", "submission_id": submission.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
