import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from pramlearnapp.models import GroupMember, GroupChat, Material
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
import logging
from django.utils import timezone
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)
User = get_user_model()


class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.material_slug = self.scope["url_route"]["kwargs"]["material_slug"]
        self.user = self.scope["user"]

        # Get token from query string
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if not token:
            logger.error("❌ No token provided in WebSocket connection")
            await self.close()
            return

        # Validate token and get user
        try:
            validated_token = UntypedToken(token)
            user_id = validated_token.payload.get("user_id")
            if not user_id:
                raise InvalidToken("No user_id in token")

            self.user = await self.get_user(user_id)
            if not self.user:
                raise InvalidToken("User not found")

        except (InvalidToken, TokenError) as e:
            logger.error(f"❌ Invalid token: {str(e)}")
            await self.close()
            return

        if self.user.is_anonymous:
            await self.close()
            return

        # Verify user is in group for this material
        self.group_info = await self.get_user_group()
        if not self.group_info:
            await self.close()
            return

        self.room_group_name = f"group_chat_{self.group_info['group_id']}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "username": self.user.username,
                "status": "joined",
                "is_online": True,
            },
        )

        await self.channel_layer.group_send(
            "user_status_global",
            {
                "type": "user_status_update",
                "user_id": self.user.id,
                "is_online": True,
                "last_activity": timezone.now().isoformat(),
            },
        )

        channel_layer = get_channel_layer()
        if channel_layer:
            await channel_layer.group_send(
                "user_status_global",
                {
                    "type": "user_status_update",
                    "user_id": self.user.id,
                    "is_online": True,
                    "last_activity": timezone.now().isoformat(),
                },
            )

        self.connected_at = timezone.now()

        logger.info(
            f"✅ User {self.user.username} joined group chat {self.group_info['group_id']}"
        )

    @database_sync_to_async
    def get_user(self, user_id):
        """Get user by ID"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        logger.info(
            f"🔌 User {self.user.username} disconnecting with code: {close_code}"
        )

        if hasattr(self, "room_group_name") and hasattr(self, "user"):
            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_status",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "status": "left",
                    "is_online": False,
                },
            )

            await self.channel_layer.group_send(
                "user_status_global",
                {
                    "type": "user_status_update",
                    "user_id": self.user.id,
                    "is_online": False,
                    "last_activity": timezone.now().isoformat(),
                },
            )

            channel_layer = get_channel_layer()
            if channel_layer:
                await channel_layer.group_send(
                    "user_status_global",
                    {
                        "type": "user_status_update",
                        "user_id": self.user.id,
                        "is_online": False,
                        "last_activity": timezone.now().isoformat(),
                    },
                )

            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

        logger.info(
            f"✅ User {getattr(self, 'user', 'Unknown').username} left group chat"
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get("type", "")

            if message_type == "ping":
                # Heartbeat untuk maintain connection
                logger.debug(f"💓 Received ping from {self.user.username}")
                await self.send(text_data=json.dumps({"type": "pong"}))
            elif message_type == "typing":
                # Broadcast typing indicator
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "typing_indicator",
                        "user_id": self.user.id,
                        "username": self.user.username,
                        "is_typing": text_data_json.get("is_typing", False),
                    },
                )
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON decode error from {self.user.username}: {str(e)}")
        except Exception as e:
            logger.error(
                f"❌ Error processing message from {self.user.username}: {str(e)}"
            )

    async def chat_message(self, event):
        """Handle chat message from group send"""
        await self.send(
            text_data=json.dumps({"type": "chat_message", "message": event["message"]})
        )

    async def user_status(self, event):
        """Handle user status updates"""
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_status",
                    "user_id": event["user_id"],
                    "username": event["username"],
                    "status": event["status"],
                    "is_online": event["is_online"],
                }
            )
        )

    async def typing_indicator(self, event):
        """Handle typing indicators"""
        # Don't send to self
        if event["user_id"] != self.user.id:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "typing_indicator",
                        "user_id": event["user_id"],
                        "username": event["username"],
                        "is_typing": event["is_typing"],
                    }
                )
            )

    @database_sync_to_async
    def get_user_group(self):
        """Get user's group for this material"""
        try:
            material = Material.objects.get(slug=self.material_slug)
            user_group = (
                GroupMember.objects.filter(student=self.user, group__material=material)
                .select_related("group")
                .first()
            )

            if user_group:
                return {
                    "group_id": user_group.group.id,
                    "group_name": user_group.group.name,
                    "group_code": user_group.group.code,
                }
            return None
        except Material.DoesNotExist:
            return None
