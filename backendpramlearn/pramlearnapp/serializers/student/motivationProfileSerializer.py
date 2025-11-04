from rest_framework import serializers
from pramlearnapp.models import StudentMotivationProfile


class StudentMotivationProfileSerializer(serializers.ModelSerializer):
    """
    Serializer untuk profil motivasi siswa.
    """
    class Meta:
        model = StudentMotivationProfile
        fields = ['student', 'motivation_level']
