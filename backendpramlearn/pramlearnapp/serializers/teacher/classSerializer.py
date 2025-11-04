from pramlearnapp.models import ClassStudent
from rest_framework import serializers
from pramlearnapp.models import Class, CustomUser, Subject
from django.db import models
# Import directly
from pramlearnapp.serializers.teacher.subjectSerializer import SubjectSerializer
# Import directly
from pramlearnapp.serializers.user.userSerializer import CustomUserSerializer


class ClassSerializer(serializers.ModelSerializer):
    """
    Serializer untuk data kelas.
    """
    class Meta:
        model = Class
        fields = ['id', 'name', 'slug']


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
        class_students = ClassStudent.objects.filter(class_id=obj.id)
        cs_map = {cs.student_id: cs.id for cs in class_students}
        students = CustomUser.objects.filter(id__in=cs_map.keys())
        data = []
        for stu in students:
            stu_data = CustomUserSerializer(
                stu, context={'class_id': obj.id}).data
            data.append(stu_data)
        return data
