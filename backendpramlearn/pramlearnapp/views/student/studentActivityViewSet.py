from rest_framework import viewsets, permissions
from pramlearnapp.models.studentActivity import StudentActivity
from pramlearnapp.serializers.student.studentActivitySerializer import StudentActivitySerializer


class StudentActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StudentActivity.objects.all().order_by('-timestamp')
    serializer_class = StudentActivitySerializer
    # Tambahkan custom permission jika perlu
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset
