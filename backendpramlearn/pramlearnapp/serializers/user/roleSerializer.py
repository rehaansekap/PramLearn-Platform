from rest_framework import serializers
from pramlearnapp.models import Role


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer untuk data role pengguna.
    """
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']
