from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from pramlearnapp.models import Material, GroupMember, GroupChat
from pramlearnapp.serializers.student.groupChatSerializer import (
    GroupChatSerializer,
    GroupMemberStatusSerializer,
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


class StudentGroupChatView(APIView):
    """API untuk chat kelompok siswa"""

    permission_classes = [IsAuthenticated]

    def get(self, request, material_slug):
        """Get group chat history dan member status"""
        try:
            # Get material
            material = get_object_or_404(Material, slug=material_slug)

            # Get user's group for this material
            user_group = GroupMember.objects.filter(
                student=request.user, group__material=material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok untuk materi ini"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Get group members with online status
            group_members = GroupMember.objects.filter(
                group=user_group.group
            ).select_related("student")

            # Get recent chat messages (last 50)
            chat_messages = (
                GroupChat.objects.filter(group=user_group.group)
                .select_related("sender")
                .order_by("-created_at")[:50]
            )

            # Serialize data
            members_serializer = GroupMemberStatusSerializer(
                group_members, many=True, context={"request": request}
            )

            chat_serializer = GroupChatSerializer(
                reversed(chat_messages),  # Reverse to show oldest first
                many=True,
                context={"request": request},
            )

            return Response(
                {
                    "group_info": {
                        "id": user_group.group.id,
                        "name": user_group.group.name,
                        "code": user_group.group.code,
                    },
                    "members": members_serializer.data,
                    "messages": chat_serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error in StudentGroupChatView: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, material_slug):
        """Send new chat message"""
        try:
            # Get material
            material = get_object_or_404(Material, slug=material_slug)

            # Get user's group
            user_group = GroupMember.objects.filter(
                student=request.user, group__material=material
            ).first()

            if not user_group:
                return Response(
                    {"error": "Anda tidak terdaftar dalam kelompok"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            message_text = request.data.get("message", "").strip()
            if not message_text:
                return Response(
                    {"error": "Pesan tidak boleh kosong"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create chat message
            chat_message = GroupChat.objects.create(
                group=user_group.group, sender=request.user, message=message_text
            )

            # Serialize message
            serializer = GroupChatSerializer(chat_message, context={"request": request})

            # Broadcast via WebSocket
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"group_chat_{user_group.group.id}",
                    {"type": "chat_message", "message": serializer.data},
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error sending chat message: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
