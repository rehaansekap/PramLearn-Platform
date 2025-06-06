from rest_framework import serializers


class StudentActivitySerializer(serializers.Serializer):
    type = serializers.CharField()
    title = serializers.CharField()
    # description = serializers.CharField()
    time = serializers.CharField()
