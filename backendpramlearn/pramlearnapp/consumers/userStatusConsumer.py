import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from pramlearnapp.models import Quiz, Group, GroupQuiz, GroupQuizSubmission, GroupQuizResult, GroupMember
from django.utils import timezone


class UserStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.group_name = "user_status"

            # Join group SEBELUM accept
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            # Accept connection
            await self.accept()
            print(f"✅ UserStatus WebSocket connected: {self.channel_name}")

        except Exception as e:
            print(f"❌ Error in UserStatus connect: {e}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            print(f"❌ UserStatus WebSocket disconnected: {self.channel_name}")
        except Exception as e:
            print(f"❌ Error in UserStatus disconnect: {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            if message_type == 'user_activity_update':
                # Broadcast ke semua client di group
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'user_status_update',
                        'user_id': data.get('user_id'),
                        'is_online': data.get('is_online'),
                        'last_activity': data.get('last_activity'),
                    }
                )
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error in UserStatus: {e}")
        except Exception as e:
            print(f"❌ Error in UserStatus receive: {e}")

    async def user_status_update(self, event):
        try:
            # Send message ke WebSocket
            await self.send(text_data=json.dumps({
                'type': 'user_status_update',
                'user_id': event['user_id'],
                'is_online': event['is_online'],
                'last_activity': event['last_activity'],
            }))
        except Exception as e:
            print(f"❌ Error sending user status update: {e}")
