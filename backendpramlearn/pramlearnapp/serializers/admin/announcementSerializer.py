from rest_framework import serializers
from pramlearnapp.models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(read_only=True)

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'author_name', 'priority',
            'target_audience', 'deadline', 'created_at', 'is_active'
        ]
        read_only_fields = ['created_at', 'author_name']
