from rest_framework import serializers
from pramlearnapp.models import StudentMaterialBookmark, StudentMaterialProgress


class StudentMaterialProgressSerializer(serializers.ModelSerializer):
    is_completed = serializers.ReadOnlyField()

    class Meta:
        model = StudentMaterialProgress
        fields = [
            'id', 'completion_percentage', 'time_spent', 'last_position',
            'completed_at', 'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


class StudentMaterialBookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentMaterialBookmark
        fields = [
            'id', 'student', 'material', 'title', 'content_type',
            'position', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
