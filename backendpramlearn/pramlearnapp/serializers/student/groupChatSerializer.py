from rest_framework import serializers
from pramlearnapp.models.group import GroupMember, GroupChat, GroupChatRead


class GroupChatSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)
    is_current_user = serializers.SerializerMethodField()

    class Meta:
        model = GroupChat
        fields = [
            "id",
            "message",
            "created_at",
            "sender_name",
            "sender_username",
            "sender_id",
            "is_current_user",
        ]

    def get_is_current_user(self, obj):
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            return request.user.id == obj.sender.id
        return False


class GroupMemberStatusSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_username = serializers.CharField(source="student.username", read_only=True)
    student_id = serializers.IntegerField(
        source="student.id", read_only=True
    )  # Tambahkan ini
    is_online = serializers.BooleanField(source="student.is_online", read_only=True)
    last_activity = serializers.DateTimeField(
        source="student.last_activity", read_only=True
    )
    is_current_user = serializers.SerializerMethodField()

    class Meta:
        model = GroupMember
        fields = [
            "id",
            "student_name",
            "student_username",
            "student_id",
            "is_online",
            "last_activity",
            "is_current_user",
        ]

    def get_is_current_user(self, obj):
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            return request.user.id == obj.student.id
        return False
