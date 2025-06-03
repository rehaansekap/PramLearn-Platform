from rest_framework import serializers
from pramlearnapp.models import StudentAttendance
from django.contrib import admin


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(
        source='student.username', read_only=True)
    student_name = serializers.SerializerMethodField()
    updated_by_username = serializers.CharField(
        source='updated_by.username', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'material', 'status', 'updated_at',
            'updated_by', 'student_username', 'student_name', 'updated_by_username'
        ]

    def get_student_name(self, obj):
        if obj.student.first_name or obj.student.last_name:
            return f"{obj.student.first_name or ''} {obj.student.last_name or ''}".strip()
        return obj.student.username


@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'material',
                    'status', 'updated_at', 'updated_by']
    list_filter = ['status', 'updated_at']
    search_fields = ['student__username', 'material__title']
    raw_id_fields = ['student', 'material', 'updated_by']
