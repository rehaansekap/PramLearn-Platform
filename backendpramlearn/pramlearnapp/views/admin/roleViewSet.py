from rest_framework import viewsets, permissions
from pramlearnapp.models import Role
from pramlearnapp.serializers import RoleSerializer


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance Role.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]
