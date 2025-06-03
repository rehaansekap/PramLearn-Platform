import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from pramlearnapp.models import Quiz, Group, GroupQuiz, GroupQuizSubmission, GroupQuizResult, GroupMember
from django.utils import timezone


class AttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.material_id = self.scope['url_route']['kwargs']['material_id']
        self.group_name = f"attendance_{self.material_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print(
            f"🔗 WebSocket connected to attendance for material {self.material_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(
            f"❌ WebSocket disconnected from attendance for material {self.material_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            if message_type == 'attendance_update':
                # Broadcast ke semua client di group
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'attendance_notification',
                        'student_id': data.get('student_id'),
                        'status': data.get('status'),
                        'student_name': data.get('student_name'),
                        'timestamp': data.get('timestamp')
                    }
                )
        except json.JSONDecodeError:
            pass

    async def attendance_notification(self, event):
        # Send message ke WebSocket
        await self.send(text_data=json.dumps({
            'type': 'attendance_update',
            'student_id': event['student_id'],
            'status': event['status'],
            'student_name': event['student_name'],
            'timestamp': event['timestamp']
        }))
