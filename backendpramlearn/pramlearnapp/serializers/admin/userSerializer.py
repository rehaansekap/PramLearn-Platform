from rest_framework import serializers
from pramlearnapp.models import CustomUser
from pramlearnapp.models import Role


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer untuk model CustomUser.
    """
    classstudent_id = serializers.IntegerField(read_only=True, required=False)
    class_ids = serializers.SerializerMethodField()
    class_names = serializers.SerializerMethodField()
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), required=True)
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'is_online', 'last_activity',
            'is_staff', 'is_superuser', 'class_ids', 'class_names',
            'password', 'classstudent_id'  # Tambahkan classstudent_id di sini
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_class_ids(self, obj):
        from pramlearnapp.models.classes import ClassStudent  # Hindari circular import
        return list(ClassStudent.objects.filter(student=obj).values_list('class_id', flat=True))

    def get_class_names(self, obj):
        from pramlearnapp.models.classes import ClassStudent  # Hindari circular import
        from pramlearnapp.models.classes import Class
        class_ids = ClassStudent.objects.filter(
            student=obj).values_list('class_id', flat=True)
        return list(Class.objects.filter(id__in=class_ids).values_list('name', flat=True))

    def create(self, validated_data):
        """
        Membuat pengguna baru dengan data yang divalidasi.
        """
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
