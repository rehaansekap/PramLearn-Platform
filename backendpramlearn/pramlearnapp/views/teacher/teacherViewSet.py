from rest_framework import viewsets, permissions
from pramlearnapp.models import CustomUser
from pramlearnapp.serializers import TeacherSerializer


class TeacherViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance Teacher.
    """
    queryset = CustomUser.objects.filter(role__name='Teacher')
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
