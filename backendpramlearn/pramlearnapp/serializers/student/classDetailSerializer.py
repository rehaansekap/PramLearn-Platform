from rest_framework import serializers
from pramlearnapp.models import Class, CustomUser, Subject
from pramlearnapp.serializers.user import CustomUserSerializer
# Import SubjectSerializer
from pramlearnapp.serializers.teacher import SubjectSerializer


class ClassDetailSerializer(serializers.ModelSerializer):
    subjects = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'slug', 'subjects', 'students']

    def get_subjects(self, obj):
        subjects = Subject.objects.filter(subject_class__class_id=obj)
        return SubjectSerializer(subjects, many=True).data

    def get_students(self, obj):
        students = CustomUser.objects.filter(
            classstudent__class_id=obj.id, role__name='Student')
        return CustomUserSerializer(students, many=True).data
