from rest_framework import serializers
from pramlearnapp.models import CustomUser, StudentMotivationProfile, Role


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer untuk data siswa dengan profil motivasi.
    """
    motivation_profile = serializers.SerializerMethodField()
    studentmotivationprofile = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name',
                  'last_name', "is_online", "last_activity",
                  'motivation_profile', 'studentmotivationprofile']

    def get_motivation_profile(self, obj):
        try:
            profile = StudentMotivationProfile.objects.get(student=obj)
            return profile.motivation_level
        except StudentMotivationProfile.DoesNotExist:
            return None

    def get_studentmotivationprofile(self, obj):
        try:
            profile = StudentMotivationProfile.objects.get(student=obj)
            return {
                'motivation_level': profile.motivation_level,
                'attention': profile.attention,
                'relevance': profile.relevance,
                'confidence': profile.confidence,
                'satisfaction': profile.satisfaction
            }
        except StudentMotivationProfile.DoesNotExist:
            return None


class StudentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer sederhana khusus untuk detail student (untuk assignment, dll)
    """
    motivation_profile = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name',
                  'last_name', 'email', 'motivation_profile']

    def get_motivation_profile(self, obj):
        try:
            profile = StudentMotivationProfile.objects.get(student=obj)
            return profile.motivation_level
        except StudentMotivationProfile.DoesNotExist:
            return None


class AvailableStudentSerializer(serializers.ModelSerializer):
    """
    Serializer untuk siswa yang tersedia.
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'username']
