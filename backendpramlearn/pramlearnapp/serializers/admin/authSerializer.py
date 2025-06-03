from rest_framework import serializers
from django.contrib.auth import authenticate


class LoginSerializer(serializers.Serializer):
    """
    Serializer untuk autentikasi pengguna (login).
    """
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        """
        Validasi kredensial pengguna.
        """
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")
