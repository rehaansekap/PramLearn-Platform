from rest_framework import viewsets, permissions, generics
from pramlearnapp.models import CustomUser
from pramlearnapp.permissions import IsAdminUser
from pramlearnapp.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance User.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def perform_create(self, serializer):
        """
        Menyimpan instance pengguna baru.
        """
        serializer.save()

    def perform_update(self, serializer):
        """
        Memperbarui instance pengguna.
        """
        serializer.save()

    def perform_destroy(self, instance):
        """
        Menghapus instance pengguna.
        """
        instance.delete()


class RegisterView(generics.CreateAPIView):
    """
    View untuk mendaftarkan pengguna baru.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
