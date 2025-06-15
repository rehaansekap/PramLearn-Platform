import json
import logging
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

        logger.info(
            f"🔗 Quiz collaboration connection attempt: quiz_id={self.quiz_id}, group_id={self.group_id}")

        # Extract token from query string
        query_string = self.scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if not token:
            logger.warning("❌ No token provided in WebSocket connection")
            await self.close()
            return

        # Authenticate user with token
        user = await self.authenticate_user(token)
        if not user:
            logger.warning("❌ Token authentication failed")
            await self.close()
            return

        # Set authenticated user in scope
        self.scope["user"] = user

        # Check if user is member of the group
        is_member = await self.is_group_member()
        if not is_member:
            logger.warning(
                f"❌ User {user.id} is not a member of group {self.group_id}")
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(
            f"✅ Quiz collaboration connected: user={user.username}")

        # Send current quiz state to new connection
        await self.send_current_state()

        # Notify group about user joining
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': user.id,
                'username': user.username,
                'message': f'{user.username} bergabung dalam quiz'
            }
        )

    @database_sync_to_async
    def authenticate_user(self, token):
        """Authenticate user with JWT token"""
        try:
            # Decode and validate token
            access_token = AccessToken(token)
            user_id = access_token['user_id']

            # Get user from database
            User = get_user_model()
            user = User.objects.get(id=user_id)
            return user
        except (InvalidToken, TokenError, User.DoesNotExist) as e:
            logger.error(f"❌ Authentication error: {e}")
            return None

    async def disconnect(self, close_code):
        logger.info(
            f"📪 Quiz collaboration disconnected: close_code={close_code}")
        # Notify group about user leaving
        if hasattr(self, 'room_group_name') and hasattr(self.scope, 'user'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.scope["user"].id,
                    'username': self.scope["user"].username,
                    'message': f'{self.scope["user"].username} meninggalkan quiz'
                }
            )

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            logger.info(
                f"📨 Received message: type={message_type}, user={self.scope['user'].username}")

            if message_type == 'answer_selected':
                await self.handle_answer_selection(data)
            elif message_type == 'question_changed':
                await self.handle_question_change(data)
            elif message_type == 'request_current_state':
                await self.send_current_state()

        except json.JSONDecodeError:
            logger.error("❌ Invalid JSON received")
        except Exception as e:
            logger.error(f"❌ Error handling message: {e}")

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
            print(
                f"🔍 DEBUG: Getting current answers for quiz_id={self.quiz_id}, group_id={self.group_id}")

            group_quiz = GroupQuiz.objects.get(
                quiz_id=self.quiz_id,
                group_id=self.group_id
            )
            print(f"✅ Found GroupQuiz: {group_quiz}")

            submissions = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz
            ).select_related('question', 'student')

            print(f"📊 Found {submissions.count()} submissions")

            answers = {}
            for submission in submissions:
                answers[submission.question.id] = {
                    'selected_choice': submission.selected_choice,
                    'user_id': submission.student.id,
                    'username': submission.student.username,
                    'submitted_at': submission.submitted_at.isoformat() if hasattr(submission, 'submitted_at') else None
                }
                print(
                    f"  📝 Answer: Q{submission.question.id} = {submission.selected_choice} by {submission.student.username}")

            print(f"🎯 Returning answers: {answers}")
            return answers

        except GroupQuiz.DoesNotExist:
            print(f"❌ GroupQuiz not found in get_current_answers")
            return {}
        except Exception as e:
            print(f"❌ Error getting current answers: {str(e)}")
            import traceback
            traceback.print_exc()
            return {}

    @database_sync_to_async
    def save_group_answer(self, question_id, selected_choice, user_id):
        try:
            print(
                f"🔍 DEBUG: Attempting to save answer - question_id: {question_id}, choice: {selected_choice}, user_id: {user_id}")

            # Get GroupQuiz instance
            group_quiz = GroupQuiz.objects.get(
                quiz_id=self.quiz_id,
                group_id=self.group_id
            )
            print(f"✅ Found GroupQuiz: {group_quiz}")

            # Get Question instance
            question = Question.objects.get(id=question_id)
            print(f"✅ Found Question: {question}")

            # Get User instance
            User = get_user_model()
            user = User.objects.get(id=user_id)
            print(f"✅ Found User: {user}")

            # Check if answer is correct
            is_correct = question.correct_choice == selected_choice
            print(
                f"🎯 Answer correctness: {is_correct} (correct: {question.correct_choice}, selected: {selected_choice})")

            # Save or update GroupQuizSubmission
            submission, created = GroupQuizSubmission.objects.update_or_create(
                group_quiz=group_quiz,
                question=question,
                defaults={
                    'student': user,  # Make sure this is 'student', not 'student_id'
                    'selected_choice': selected_choice,
                    'is_correct': is_correct
                }
            )

            action = "Created" if created else "Updated"
            print(f"💾 {action} GroupQuizSubmission: {submission}")
            print(
                f"📊 Submission details: group={group_quiz.group.name}, question={question.text[:50]}..., answer={selected_choice}")

            return True

        except GroupQuiz.DoesNotExist:
            print(
                f"❌ GroupQuiz not found: quiz_id={self.quiz_id}, group_id={self.group_id}")
            return False
        except Question.DoesNotExist:
            print(f"❌ Question not found: question_id={question_id}")
            return False
        except Exception as e:
            print(f"❌ Error saving group answer: {str(e)}")
            import traceback
            traceback.print_exc()
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
