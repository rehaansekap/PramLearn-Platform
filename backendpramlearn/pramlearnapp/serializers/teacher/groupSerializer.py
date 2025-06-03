from rest_framework import serializers
from pramlearnapp.models import Group, GroupMember, GroupQuiz, GroupQuizSubmission, GroupQuizResult


class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = ['id', 'student']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(
        source='groupmember_set', many=True, read_only=True)
    class_id = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()

    """
    Serializer untuk data grup.
    """
    class Meta:
        model = Group
        fields = '__all__'

    def get_class_id(self, obj):
        # Ambil class_id dari relasi material -> subject -> subject_class -> class_id
        try:
            return obj.material.subject.subject_class.class_id.id
        except AttributeError:
            return None

    def get_class_name(self, obj):
        try:
            return obj.material.subject.subject_class.class_id.name
        except AttributeError:
            return None


class GroupQuizSerializer(serializers.ModelSerializer):
    """
    Serializer untuk kuis grup.
    """
    class Meta:
        model = GroupQuiz
        fields = '__all__'


class GroupQuizSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer untuk pengumpulan kuis grup.
    """
    class Meta:
        model = GroupQuizSubmission
        fields = '__all__'


class GroupQuizResultSerializer(serializers.ModelSerializer):
    """
    Serializer untuk hasil kuis grup.
    """
    class Meta:
        model = GroupQuizResult
        fields = '__all__'
