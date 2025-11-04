from rest_framework import serializers
from pramlearnapp.models import Schedule


class TodayScheduleSerializer(serializers.ModelSerializer):
    activity = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = [
            'id', 'class_obj', 'subject', 'day_of_week', 'time', 'activity'
        ]

    def get_activity(self, obj):
        return obj.subject.name if obj.subject else ""


class ScheduleModelSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'class_obj', 'class_name',
                  'subject', 'subject_name', 'day_of_week', 'time']
