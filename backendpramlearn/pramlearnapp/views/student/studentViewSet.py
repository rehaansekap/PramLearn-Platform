from rest_framework import viewsets, permissions
from pramlearnapp.models import CustomUser, Role
from pramlearnapp.serializers.student.studentSerializer import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance Student.
    """
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Mengembalikan queryset untuk instance Student dengan profil motivasi.
        """
        role_student = Role.objects.get(name='Student')
        return CustomUser.objects.filter(
            role=role_student.id
        ).select_related('studentmotivationprofile')
