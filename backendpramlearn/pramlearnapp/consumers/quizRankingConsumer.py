import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from pramlearnapp.models import Quiz, Group, GroupQuiz, GroupQuizSubmission, GroupQuizResult, GroupMember
from django.utils import timezone


class QuizRankingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.quiz_id = self.scope['url_route']['kwargs']['quiz_id']
        self.material_id = self.scope['url_route']['kwargs'].get('material_id')
        self.quiz_group_name = f'quiz_ranking_{self.quiz_id}'

        # Join quiz ranking group
        await self.channel_layer.group_add(
            self.quiz_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"🔗 WebSocket connected to quiz ranking {self.quiz_id}")

        # Send initial ranking data
        await self.send_ranking_update()

    async def disconnect(self, close_code):
        # Leave quiz ranking group
        await self.channel_layer.group_discard(
            self.quiz_group_name,
            self.channel_name
        )
        print(f"❌ WebSocket disconnected from quiz ranking {self.quiz_id}")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'request_ranking_update':
            await self.send_ranking_update()

    async def quiz_ranking_update(self, event):
        """Handle quiz ranking updates from group"""
        await self.send(text_data=json.dumps({
            'type': 'ranking_update',
            'rankings': event['rankings'],
            'timestamp': event['timestamp']
        }))

    async def send_ranking_update(self):
        """Fetch and send current ranking data"""
        try:
            rankings = await self.get_quiz_rankings()
            await self.send(text_data=json.dumps({
                'type': 'ranking_update',
                'rankings': rankings,
                'timestamp': json.dumps(str(timezone.now()), default=str)
            }))
        except Exception as e:
            print(f"❌ Error sending ranking update: {e}")

    @database_sync_to_async
    def get_quiz_rankings(self):
        """Get quiz rankings from database"""
        try:
            from django.utils import timezone

            quiz = Quiz.objects.get(id=self.quiz_id)

            # Filter groups berdasarkan material
            if self.material_id:
                groups = Group.objects.filter(material_id=self.material_id)
            else:
                groups = Group.objects.filter(material=quiz.material)

            # Ambil GroupQuiz yang terkait dengan quiz ini
            group_quizzes = GroupQuiz.objects.filter(
                quiz=quiz,
                group__in=groups
            ).select_related('group')

            ranking_data = []

            for group_quiz in group_quizzes:
                group = group_quiz.group

                # Hitung jumlah anggota kelompok
                member_count = GroupMember.objects.filter(group=group).count()

                # Ambil atau hitung score dari GroupQuizResult
                try:
                    result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                    score = result.score
                except GroupQuizResult.DoesNotExist:
                    # Jika belum ada result, hitung manual
                    score = group_quiz.calculate_and_save_score().score

                # Hitung jawaban benar dan total soal
                total_questions = quiz.questions.count()
                correct_submissions = GroupQuizSubmission.objects.filter(
                    group_quiz=group_quiz,
                    is_correct=True
                ).count()

                # Tentukan status kelompok
                total_submissions = GroupQuizSubmission.objects.filter(
                    group_quiz=group_quiz
                ).count()

                if total_submissions == 0:
                    status_group = 'not_started'
                elif total_submissions < total_questions:
                    status_group = 'in_progress'
                else:
                    status_group = 'completed'

                ranking_data.append({
                    'group_id': group.id,
                    'group_name': group.name,
                    'group_code': group.code,
                    'score': round(score, 2),
                    'correct_answers': correct_submissions,
                    'total_questions': total_questions,
                    'member_count': member_count,
                    'status': status_group,
                    'start_time': group_quiz.start_time.isoformat() if group_quiz.start_time else None,
                    'end_time': group_quiz.end_time.isoformat() if group_quiz.end_time else None,
                })

            # Sort berdasarkan score (descending)
            ranking_data.sort(key=lambda x: (-x['score'], x['group_name']))

            return ranking_data

        except Exception as e:
            print(f"❌ Error getting quiz rankings: {e}")
            return []
