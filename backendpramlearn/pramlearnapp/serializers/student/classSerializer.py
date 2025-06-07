from rest_framework import serializers
from pramlearnapp.models import Class


class ClassSerializer(serializers.ModelSerializer):

    """
    Serializer untuk data kelas.
    """
    class Meta:
        model = Class
        fields = '__all__'
