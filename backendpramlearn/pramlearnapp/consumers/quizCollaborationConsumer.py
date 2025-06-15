import json
import logging
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from pramlearnapp.models import GroupQuiz, GroupMember, Quiz, Group, CustomUser, Question, GroupQuizSubmission
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)


class QuizCollaborationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.quiz_id = self.scope['url_route']['kwargs']['quiz_id']
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'quiz_collaboration_{self.quiz_id}_{self.group_id}'
        self.user = None
        self.is_connected = False

        logger.info(
            f"🔗 Quiz collaboration connection attempt: quiz_id={self.quiz_id}, group_id={self.group_id}")

        try:
            # Get token from query string
            query_string = self.scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]

            if not token:
                logger.warning("❌ No token provided in query parameter")
                await self.close(code=4001)
                return

            # Authenticate user with JWT token
            user = await self.authenticate_user(token)
            if not user:
                logger.warning("❌ Invalid token or user not found")
                await self.close(code=4001)
                return

            # Set authenticated user in scope
            self.scope["user"] = user
            self.user = user
            logger.info(
                f"✅ User authenticated: {user.username} (ID: {user.id})")

        except Exception as e:
            logger.error(f"❌ Authentication error: {str(e)}")
            await self.close(code=4001)
            return

        # Verify user is member of the group
        try:
            is_member = await self.is_group_member()
            if not is_member:
                logger.warning(
                    f"❌ User {user.username} is not a member of group {self.group_id}")
                await self.close(code=4003)
                return
        except Exception as e:
            logger.error(f"❌ Error checking group membership: {str(e)}")
            await self.close(code=4003)
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept connection
        await self.accept()
        self.is_connected = True
        logger.info(f"✅ Quiz collaboration connected: user={user.username}")

        # 🔧 PERBAIKAN: Notify other group members AFTER connection is stable
        try:
            # Small delay to ensure connection is stable
            await asyncio.sleep(0.1)

            if self.is_connected:  # Double check connection is still active
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_joined',
                        'user_id': user.id,
                        'username': user.username,
                        'message': f"{user.username} bergabung dengan quiz"
                    }
                )
                logger.info(
                    f"✅ Notified group members about {user.username} joining")
        except Exception as e:
            logger.error(f"❌ Error notifying group members: {str(e)}")

    @database_sync_to_async
    def authenticate_user(self, token):
        """Authenticate user with JWT token"""
        try:
            # Decode JWT token
            access_token = AccessToken(token)
            user_id = access_token['user_id']

            # Get user from database
            User = get_user_model()
            user = User.objects.get(id=user_id)

            logger.info(
                f"🔑 JWT token decoded successfully for user: {user.username}")
            return user

        except TokenError as e:
            logger.error(f"❌ JWT Token error: {str(e)}")
            return None
        except User.DoesNotExist:
            logger.error(f"❌ User with ID {user_id} not found")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected authentication error: {str(e)}")
            return None

    async def disconnect(self, close_code):
        self.is_connected = False

        # Leave room group
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"✅ Left room group: {self.room_group_name}")
        except Exception as e:
            logger.error(f"❌ Error leaving room group: {str(e)}")

        logger.info(
            f"📪 Quiz collaboration disconnected: close_code={close_code}")

        # Notify other group members if not intentional close
        if close_code != 1000 and self.user:
            try:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_left',
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'message': f"{self.user.username} keluar dari quiz"
                    }
                )
            except Exception as e:
                logger.error(f"❌ Error notifying user left: {str(e)}")

    async def receive(self, text_data):
        if not self.is_connected:
            logger.warning("⚠️ Received message on disconnected WebSocket")
            return

        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            user = self.scope['user']

            logger.info(
                f"📨 Received message: type={message_type}, user={user.username}")

            if message_type == 'ping':
                # Respond to heartbeat
                if self.is_connected:
                    await self.send(text_data=json.dumps({'type': 'pong'}))
                    logger.info("💓 Sent pong response")

            elif message_type == 'request_current_state':
                # 🔧 PERBAIKAN: Handle current state request more carefully
                logger.info("🔍 Processing request_current_state...")

                if not self.is_connected:
                    logger.warning(
                        "⚠️ Connection not active, skipping current_state request")
                    return

                try:
                    # Get current answers with timeout
                    current_answers = await asyncio.wait_for(
                        self.get_current_answers(),
                        timeout=5.0
                    )

                    logger.info(
                        f"✅ Got current answers: {len(current_answers)} items")

                    # Send response only if still connected
                    if self.is_connected:
                        response_data = {
                            'type': 'current_state',
                            'answers': current_answers
                        }

                        await self.send(text_data=json.dumps(response_data))
                        logger.info(
                            "✅ Sent current_state response successfully")

                        # 🔧 PERBAIKAN: Don't close connection after sending response
                        # Let the connection stay open for further communication

                    else:
                        logger.warning(
                            "⚠️ Connection lost before sending current_state response")

                except asyncio.TimeoutError:
                    logger.error("❌ Timeout getting current answers")
                    if self.is_connected:
                        await self.send(text_data=json.dumps({
                            'type': 'error',
                            'message': 'Timeout mengambil status quiz'
                        }))

                except Exception as e:
                    logger.error(f"❌ Error in request_current_state: {str(e)}")
                    import traceback
                    logger.error(f"❌ Traceback: {traceback.format_exc()}")

                    if self.is_connected:
                        await self.send(text_data=json.dumps({
                            'type': 'error',
                            'message': 'Gagal mengambil status quiz saat ini'
                        }))

            elif message_type == 'answer_selected':
                # Handle answer selection
                question_id = data.get('question_id')
                selected_choice = data.get('selected_choice')

                if self.is_connected:
                    success = await self.save_group_answer(question_id, selected_choice, user.id)

                    if success:
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'answer_updated',
                                'question_id': question_id,
                                'selected_choice': selected_choice,
                                'user_id': user.id,
                                'username': user.username
                            }
                        )

            elif message_type == 'question_changed':
                question_index = data.get('question_index')

                # Broadcast question change to other members
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'question_changed',
                        'question_index': question_index,
                        'user_id': user.id,
                        'username': user.username
                    }
                )

            # ✨ TAMBAHKAN INI: Handle quiz submission
            elif message_type == 'quiz_submitted':
                quiz_slug = data.get('quiz_slug')
                submitter_name = user.username

                logger.info(
                    f"🎯 Quiz submitted by {submitter_name}, broadcasting to all group members")

                # Broadcast submit event to all group members
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'quiz_submitted_broadcast',
                        'quiz_slug': quiz_slug,
                        'submitter_id': user.id,
                        'submitter_name': submitter_name,
                        'redirect_url': f'/student/group-quiz/{quiz_slug}/results'
                    }
                )

            # Add more detailed logging for other message types
            else:
                logger.warning(f"⚠️ Unknown message type: {message_type}")

        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON decode error: {str(e)}")
            if self.is_connected:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Format pesan tidak valid'
                }))
        except Exception as e:
            logger.error(f"❌ Error processing message: {str(e)}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")

            if self.is_connected:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Terjadi kesalahan saat memproses pesan'
                }))

    async def handle_answer_selection(self, data):
        """Handle when user selects an answer"""
        question_id = data.get('question_id')
        selected_choice = data.get('selected_choice')
        user_id = self.scope["user"].id

        # Save answer to database
        success = await self.save_group_answer(question_id, selected_choice, user_id)

        if success:
            # Broadcast answer update to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'answer_updated',
                    'question_id': question_id,
                    'selected_choice': selected_choice,
                    'user_id': user_id,
                    'username': self.scope["user"].username
                }
            )
        else:
            # Send error message back to user
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Gagal menyimpan jawaban'
            }))

    async def handle_question_change(self, data):
        """Handle when user changes question"""
        # Broadcast question change to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'question_changed',
                'question_index': data.get('question_index'),
                'user_id': self.scope["user"].id,
                'username': self.scope["user"].username
            }
        )

    # WebSocket message handlers
    async def answer_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'answer_updated',
            'question_id': event['question_id'],
            'selected_choice': event['selected_choice'],
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def question_changed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'question_changed',
            'question_index': event['question_index'],
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'username': event['username'],
            'message': event['message']
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'username': event['username'],
            'message': event['message']
        }))

    # ✨ TAMBAHKAN INI: Handler untuk broadcast quiz submission
    async def quiz_submitted_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'quiz_submitted',
            'quiz_slug': event['quiz_slug'],
            'submitter_id': event['submitter_id'],
            'submitter_name': event['submitter_name'],
            'redirect_url': event['redirect_url'],
            'message': f"Quiz telah disubmit oleh {event['submitter_name']}. Mengarahkan ke halaman hasil..."
        }))

    # Database operations
    @database_sync_to_async
    def is_group_member(self):
        """Check if user is member of the group"""
        try:
            return GroupMember.objects.filter(
                group_id=self.group_id,
                student=self.scope["user"]
            ).exists()
        except Exception as e:
            logger.error(f"❌ Error checking group membership: {e}")
            return False

    @database_sync_to_async
    def get_current_answers(self):
        try:
            logger.info(
                f"🔍 Getting current answers for quiz_id={self.quiz_id}, group_id={self.group_id}")

            # Check if GroupQuiz exists
            try:
                group_quiz = GroupQuiz.objects.get(
                    quiz_id=self.quiz_id,
                    group_id=self.group_id
                )
                logger.info(f"✅ Found GroupQuiz: {group_quiz}")
            except GroupQuiz.DoesNotExist:
                logger.warning(
                    f"⚠️ GroupQuiz not found for quiz_id={self.quiz_id}, group_id={self.group_id}")
                return {}

            # Get submissions
            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            logger.info(f"📊 Found {submissions.count()} submissions")

            answers = {}
            for submission in submissions:
                try:
                    answers[submission.question.id] = {
                        'selected_choice': submission.selected_choice,
                        'user_id': submission.student.id,
                        'username': submission.student.username,
                        'submitted_at': submission.submitted_at.isoformat() if submission.submitted_at else None
                    }
                except Exception as e:
                    logger.error(
                        f"❌ Error processing submission {submission.id}: {str(e)}")
                    continue

            logger.info(f"✅ Processed answers: {answers}")
            return answers

        except Exception as e:
            logger.error(f"❌ Error getting current answers: {str(e)}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            return {}

    @database_sync_to_async
    def save_group_answer(self, question_id, selected_choice, user_id):
        try:
            User = get_user_model()

            # Get required instances
            group_quiz = GroupQuiz.objects.get(
                quiz_id=self.quiz_id,
                group_id=self.group_id
            )
            question = Question.objects.get(id=question_id)
            user = User.objects.get(id=user_id)

            # Check if answer is correct
            is_correct = question.correct_choice == selected_choice

            # Save or update GroupQuizSubmission
            submission, created = GroupQuizSubmission.objects.update_or_create(
                group_quiz=group_quiz,
                question=question,
                defaults={
                    'student': user,
                    'selected_choice': selected_choice,
                    'is_correct': is_correct
                }
            )

            action = "Created" if created else "Updated"
            logger.info(f"💾 {action} GroupQuizSubmission: {submission}")

            return True

        except Exception as e:
            logger.error(f"❌ Error saving group answer: {str(e)}")
            return False

    async def send_current_state(self):
        """Send current quiz state to the user"""
        try:
            current_answers = await self.get_current_answers()
            await self.send(text_data=json.dumps({
                'type': 'current_state',
                'answers': current_answers
            }))
        except Exception as e:
            logger.error(f"❌ Error sending current state: {e}")

        try:
            group_quiz = GroupQuiz.objects.get(
                quiz_id=self.quiz_id,
                group_id=self.group_id
            )

            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            answers = {}
            for submission in submissions:
                answers[submission.question.id] = {
                    'selected_choice': submission.selected_choice,
                    'user_id': submission.student.id,
                    'username': submission.student.username,
                    'submitted_at': submission.submitted_at.isoformat()
                }

            return answers

        except Exception as e:
            logger.error(f"❌ Error getting current answers: {str(e)}")
            return {}
