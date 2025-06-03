from rest_framework import serializers
from pramlearnapp.models import Role


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer untuk model Role.
    """
    class Meta:
        model = Role
        fields = '__all__'
