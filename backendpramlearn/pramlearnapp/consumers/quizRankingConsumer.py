import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from pramlearnapp.models import (
    Quiz,
    Group,
    GroupQuiz,
    GroupQuizSubmission,
    GroupQuizResult,
    GroupMember,
    Material,
)
from django.utils import timezone


class QuizRankingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.quiz_id = self.scope["url_route"]["kwargs"]["quiz_id"]
        self.material_id = self.scope["url_route"]["kwargs"].get("material_id")
        self.quiz_group_name = f"quiz_ranking_{self.quiz_id}"

        print(
            f"🔗 WebSocket connection attempt: quiz_id={self.quiz_id}, material_id={self.material_id}"
        )

        # Validate that quiz and material exist
        quiz_exists = await self.validate_quiz_and_material()
        if not quiz_exists:
            print(f"❌ Quiz {self.quiz_id} or Material {self.material_id} not found")
            await self.close(code=4004)
            return

        # Join quiz ranking group
        await self.channel_layer.group_add(self.quiz_group_name, self.channel_name)

        await self.accept()
        print(
            f"✅ WebSocket connected to quiz ranking {self.quiz_id} for material {self.material_id}"
        )

        # Send initial ranking data
        await self.send_ranking_update()

    async def disconnect(self, close_code):
        # Leave quiz ranking group
        await self.channel_layer.group_discard(self.quiz_group_name, self.channel_name)
        print(f"❌ WebSocket disconnected from quiz ranking {self.quiz_id}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get("type")

            if message_type == "request_ranking_update":
                await self.send_ranking_update()
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error: {e}")

    async def quiz_ranking_update(self, event):
        """Handle quiz ranking updates from group"""
        await self.send(
            text_data=json.dumps(
                {
                    "type": "ranking_update",
                    "rankings": event["rankings"],
                    "timestamp": event["timestamp"],
                }
            )
        )

    async def send_ranking_update(self):
        """Fetch and send current ranking data"""
        try:
            rankings = await self.get_quiz_rankings()
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "ranking_update",
                        "rankings": rankings,
                        "timestamp": str(timezone.now()),
                    }
                )
            )
            print(f"✅ Sent ranking update with {len(rankings)} groups")
        except Exception as e:
            print(f"❌ Error sending ranking update: {e}")

    @database_sync_to_async
    def validate_quiz_and_material(self):
        """Validate that quiz and material exist"""
        try:
            quiz = Quiz.objects.get(id=self.quiz_id)
            material = Material.objects.get(id=self.material_id)

            # Optional: Validate that quiz belongs to this material
            if quiz.material_id != material.id:
                print(
                    f"⚠️ Quiz {self.quiz_id} does not belong to material {self.material_id}"
                )
                return False

            return True
        except (Quiz.DoesNotExist, Material.DoesNotExist) as e:
            print(f"❌ Validation error: {e}")
            return False
        except Exception as e:
            print(f"❌ Unexpected validation error: {e}")
            return False

    @database_sync_to_async
    def get_quiz_rankings(self):
        """Get quiz rankings from database - PERBAIKAN UTAMA"""
        try:
            quiz = Quiz.objects.get(id=self.quiz_id)

            # Filter groups berdasarkan material_id yang diberikan
            groups = Group.objects.filter(material_id=self.material_id)

            print(f"🔍 Found {groups.count()} groups for material {self.material_id}")

            # Ambil SEMUA GroupQuiz yang terkait dengan quiz ini dan groups dari material
            group_quizzes = (
                GroupQuiz.objects.filter(quiz=quiz, group__in=groups)
                .select_related("group")
                .order_by("group__name")
            )  # Tambahkan ordering

            ranking_data = []
            total_questions = quiz.questions.count()

            for group_quiz in group_quizzes:
                group = group_quiz.group

                # Hitung jumlah anggota kelompok
                member_count = GroupMember.objects.filter(group=group).count()

                # Get member names
                members = GroupMember.objects.filter(group=group).select_related(
                    "student"
                )
                member_names = [
                    f"{m.student.first_name} {m.student.last_name}".strip()
                    or m.student.username
                    for m in members
                ]

                # Ambil atau hitung score dari GroupQuizResult
                try:
                    result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                    score = result.score
                except GroupQuizResult.DoesNotExist:
                    # Jika belum ada result, hitung manual dari submissions
                    if total_questions > 0:
                        correct_submissions = GroupQuizSubmission.objects.filter(
                            group_quiz=group_quiz, is_correct=True
                        ).count()
                        score = (correct_submissions / total_questions) * 100
                    else:
                        score = 0

                # Hitung jawaban benar
                correct_submissions = GroupQuizSubmission.objects.filter(
                    group_quiz=group_quiz, is_correct=True
                ).count()

                # Tentukan status kelompok
                total_submissions = GroupQuizSubmission.objects.filter(
                    group_quiz=group_quiz
                ).count()

                if group_quiz.submitted_at:
                    status_group = "completed"
                elif total_submissions > 0:
                    status_group = "in_progress"
                else:
                    status_group = "not_started"

                # Calculate time spent
                time_spent = 0
                if group_quiz.start_time and group_quiz.submitted_at:
                    time_diff = group_quiz.submitted_at - group_quiz.start_time
                    time_spent = int(time_diff.total_seconds())

                ranking_data.append(
                    {
                        "group_id": group.id,
                        "group_name": group.name,
                        "group_code": group.code,
                        "score": round(score, 2),
                        "correct_answers": correct_submissions,
                        "total_questions": total_questions,
                        "member_count": member_count,
                        "member_names": member_names,
                        "status": status_group,
                        "time_spent": time_spent,
                        "start_time": (
                            group_quiz.start_time.isoformat()
                            if group_quiz.start_time
                            else None
                        ),
                        "end_time": (
                            group_quiz.end_time.isoformat()
                            if group_quiz.end_time
                            else None
                        ),
                        "submitted_at": (
                            group_quiz.submitted_at.isoformat()
                            if group_quiz.submitted_at
                            else None
                        ),
                        "completed_at": (
                            group_quiz.submitted_at.isoformat()
                            if group_quiz.submitted_at
                            else None
                        ),
                    }
                )

            # Sort berdasarkan score (descending), kemudian nama grup
            ranking_data.sort(key=lambda x: (-x["score"], x["group_name"]))

            # Add rank
            for idx, item in enumerate(ranking_data):
                item["rank"] = idx + 1

            print(f"✅ Generated ranking data for {len(ranking_data)} groups")
            print(f"📊 Groups found: {[item['group_name'] for item in ranking_data]}")

            return ranking_data

        except Exception as e:
            print(f"❌ Error getting quiz rankings: {e}")
            import traceback

            traceback.print_exc()
            return []
