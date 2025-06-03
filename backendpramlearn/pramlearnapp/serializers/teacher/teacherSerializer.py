from rest_framework import serializers
from pramlearnapp.models import CustomUser


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']
