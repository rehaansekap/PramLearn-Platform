from rest_framework import serializers
from pramlearnapp.models import Subject, SubjectClass, Material, CustomUser, Class
from .materialSerializer import MaterialSerializer
from django.utils.text import slugify


class SubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    teacher = serializers.PrimaryKeyRelatedField(
        source='subject_class.teacher', queryset=CustomUser.objects.filter(role__name='Teacher'), required=False)
    class_id = serializers.PrimaryKeyRelatedField(
        source='subject_class.class_id', queryset=Class.objects.all(), required=False)
    materials = MaterialSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'teacher', 'class_id',
                  'teacher_name', 'class_name', 'status', 'subject_class', 'materials', 'slug']

    def get_teacher_name(self, obj):
        return obj.subject_class.teacher.username if obj.subject_class else None

    def get_class_name(self, obj):
        return obj.subject_class.class_id.name if obj.subject_class else None

    def get_status(self, obj):
        if obj.subject_class:
            return f"{obj.subject_class.teacher.username} - {obj.subject_class.class_id.name} - {obj.name}"
        return None

    def get_class_id(self, obj):
        if obj.subject_class:
            return obj.subject_class.class_id.id
        return None

    def create(self, validated_data):
        subject_class_data = validated_data.pop('subject_class', None)
        if subject_class_data:
            teacher = subject_class_data['teacher']
            class_id = subject_class_data['class_id']
            subject_class, created = SubjectClass.objects.get_or_create(
                teacher=teacher, class_id=class_id)
            validated_data['subject_class'] = subject_class
        subject = Subject.objects.create(**validated_data)
        return subject

    def update(self, instance, validated_data):
        subject_class_data = validated_data.pop('subject_class', None)
        if subject_class_data:
            teacher = subject_class_data['teacher']
            class_id = subject_class_data['class_id']
            subject_class, created = SubjectClass.objects.get_or_create(
                teacher=teacher, class_id=class_id, subject=instance)
            instance.subject_class = subject_class
        instance.name = validated_data.get('name', instance.name)
        instance.slug = slugify(instance.name)
        instance.save()
        return instance


class SubjectDetailSerializer(serializers.ModelSerializer):
    """
    Serializer untuk detail mata pelajaran.
    """
    materials = MaterialSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'materials']


class SubjectClassSerializer(serializers.ModelSerializer):
    """
    Serializer untuk relasi mata pelajaran dan kelas.
    """
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all())

    class Meta:
        model = SubjectClass
        fields = ['id', 'teacher', 'class_id']
        depth = 1
