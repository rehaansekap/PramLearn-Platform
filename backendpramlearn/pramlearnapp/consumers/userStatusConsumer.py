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
        self.group_name = "user_status"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

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
        except json.JSONDecodeError:
            pass

    async def user_status_update(self, event):
        # Send message ke WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_status_update',
            'user_id': event['user_id'],
            'is_online': event['is_online'],
            'last_activity': event['last_activity'],
        }))
