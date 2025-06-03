from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from pramlearnapp.serializers import LoginSerializer


class LoginView(generics.GenericAPIView):
    """
    View untuk autentikasi pengguna (login).
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]  # <--- tambahkan ini

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
