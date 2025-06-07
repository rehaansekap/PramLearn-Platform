from rest_framework import serializers
from pramlearnapp.models import ClassStudent, Class


class ClassStudentSerializer(serializers.ModelSerializer):
    """
    Serializer untuk relasi siswa dan kelas.
    """
    classstudent_id = serializers.IntegerField(source='classstudent.id', read_only=True)
    class_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all()
    )
    # class_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ClassStudent
        fields = '__all__'

    def validate(self, data):
        """
        Validasi apakah siswa sudah terdaftar di kelas lain.
        """
        class_id = data.get('class_id')
        student = data.get('student')
        if ClassStudent.objects.filter(student=student).exists():
            raise serializers.ValidationError(
                "Student is already enrolled in another class.")
        return data

    def create(self, validated_data):
        """
        Membuat relasi siswa dan kelas.
        """
        return ClassStudent.objects.create(**validated_data)
