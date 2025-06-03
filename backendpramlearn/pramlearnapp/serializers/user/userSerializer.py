from rest_framework import serializers
from pramlearnapp.models import CustomUser, ClassStudent


class CustomUserSerializer(serializers.ModelSerializer):
    classstudent_id = serializers.SerializerMethodField()
    class_ids = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(required=False)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name',
            'last_name', 'role', 'class_ids', 'is_active', 'classstudent_id',
            'is_online', 'last_activity'  # Tambahkan field ini
        ]

    def get_classstudent_id(self, obj):
        class_id = self.context.get('class_id')
        if class_id:
            rel = ClassStudent.objects.filter(
                student=obj, class_id=class_id).first()
            return rel.id if rel else None
        rel = ClassStudent.objects.filter(student=obj).first()
        return rel.id if rel else None

    def get_class_ids(self, obj):
        return list(ClassStudent.objects.filter(student=obj).values_list('class_id', flat=True))


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer untuk detail pengguna.
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name',
                  'last_name', 'role', 'date_joined', 'last_login',
                  'is_online', 'last_activity']  # Tambahkan field ini juga
