from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime, timezone
from ...models import Quiz, GroupQuiz, Group, GroupMember, StudentQuizAttempt, StudentQuizAnswer, Question
from ...serializers import QuizSerializer
from pramlearnapp.decorators import student_required

class StudentAvailableQuizzesView(APIView):
    """
    Get available quizzes for student based on their group assignments
    """
    @student_required
    def get(self, request):
        user = request.user
        
        try:
            # Get student's groups
            student_groups = GroupMember.objects.filter(student=user).values_list('group', flat=True)
            
            if not student_groups:
                return Response([], status=status.HTTP_200_OK)
            
            # Get quizzes assigned to student's groups
            group_quizzes = GroupQuiz.objects.filter(
                group__in=student_groups
            ).select_related('quiz', 'group')
            
            available_quizzes = []
            
            for group_quiz in group_quizzes:
                quiz = group_quiz.quiz
                
                # Check if student already has attempt
                existing_attempt = StudentQuizAttempt.objects.filter(
                    student=user,
                    quiz=quiz
                ).first()
                
                quiz_data = {
                    'id': quiz.id,
                    'slug': quiz.slug if hasattr(quiz, 'slug') else f"quiz-{quiz.id}",
                    'title': quiz.title,
                    'content': quiz.content,
                    'questions': Question.objects.filter(quiz=quiz).count(),
                    'group_name': group_quiz.group.name,
                    'start_time': group_quiz.start_time,
                    'end_time': group_quiz.end_time,
                    'student_attempt': None
                }
                
                if existing_attempt:
                    quiz_data['student_attempt'] = {
                        'id': existing_attempt.id,
                        'start_time': existing_attempt.start_time,
                        'end_time': existing_attempt.end_time,
                        'submitted_at': existing_attempt.submitted_at,
                        'score': existing_attempt.score
                    }
                
                available_quizzes.append(quiz_data)
            
            return Response(available_quizzes, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentQuizDetailView(APIView):
    """
    Get quiz details for student
    """
    @student_required
    def get(self, request, quiz_slug):
        try:
            # Find quiz by slug or ID
            try:
                quiz = Quiz.objects.get(slug=quiz_slug)
            except Quiz.DoesNotExist:
                # Fallback: try to find by ID if slug doesn't work
                quiz = get_object_or_404(Quiz, id=quiz_slug)
            
            # Check if student has access to this quiz
            user = request.user
            student_groups = GroupMember.objects.filter(student=user).values_list('group', flat=True)
            
            has_access = GroupQuiz.objects.filter(
                quiz=quiz,
                group__in=student_groups
            ).exists()
            
            if not has_access:
                return Response(
                    {'error': 'You do not have access to this quiz'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get quiz questions
            questions = Question.objects.filter(quiz=quiz).order_by('id')
            
            quiz_data = {
                'id': quiz.id,
                'slug': quiz.slug if hasattr(quiz, 'slug') else f"quiz-{quiz.id}",
                'title': quiz.title,
                'content': quiz.content,
                'questions': [
                    {
                        'id': q.id,
                        'text': q.text,
                        'choice_a': q.choice_a,
                        'choice_b': q.choice_b,
                        'choice_c': q.choice_c,
                        'choice_d': q.choice_d,
                        # Don't send correct answer to student
                    }
                    for q in questions
                ]
            }
            
            return Response(quiz_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentQuizAttemptView(APIView):
    """
    Create or get quiz attempt for student
    """
    @student_required
    def post(self, request, quiz_slug):
        try:
            user = request.user
            
            # Find quiz
            try:
                quiz = Quiz.objects.get(slug=quiz_slug)
            except Quiz.DoesNotExist:
                quiz = get_object_or_404(Quiz, id=quiz_slug)
            
            # Check access
            student_groups = GroupMember.objects.filter(student=user).values_list('group', flat=True)
            group_quiz = GroupQuiz.objects.filter(
                quiz=quiz,
                group__in=student_groups
            ).first()
            
            if not group_quiz:
                return Response(
                    {'error': 'You do not have access to this quiz'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get or create attempt
            attempt, created = StudentQuizAttempt.objects.get_or_create(
                student=user,
                quiz=quiz,
                defaults={
                    'start_time': datetime.now(timezone.utc),
                    'end_time': group_quiz.end_time,
                }
            )
            
            # Get existing answers if any
            answers = StudentQuizAnswer.objects.filter(attempt=attempt)
            
            response_data = {
                'id': attempt.id,
                'quiz_id': quiz.id,
                'start_time': attempt.start_time,
                'end_time': attempt.end_time,
                'submitted_at': attempt.submitted_at,
                'score': attempt.score,
                'answers': [
                    {
                        'question': answer.question.id,
                        'selected_answer': answer.selected_answer,
                    }
                    for answer in answers
                ]
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentQuizAnswersView(APIView):
    """
    Save student answers for quiz attempt
    """
    @student_required
    def put(self, request, attempt_id):
        try:
            user = request.user
            attempt = get_object_or_404(StudentQuizAttempt, id=attempt_id, student=user)
            
            if attempt.submitted_at:
                return Response(
                    {'error': 'Quiz already submitted'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            answers_data = request.data.get('answers', [])
            
            # Save answers
            for answer_data in answers_data:
                question_id = answer_data.get('question')
                selected_answer = answer_data.get('selected_answer')
                
                if question_id and selected_answer:
                    question = get_object_or_404(Question, id=question_id)
                    
                    StudentQuizAnswer.objects.update_or_create(
                        attempt=attempt,
                        question=question,
                        defaults={
                            'selected_answer': selected_answer,
                            'is_correct': (selected_answer == question.correct_choice)
                        }
                    )
            
            return Response({'message': 'Answers saved successfully'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentQuizSubmitView(APIView):
    """
    Submit quiz attempt and calculate score
    """
    @student_required
    def post(self, request, attempt_id):
        try:
            user = request.user
            attempt = get_object_or_404(StudentQuizAttempt, id=attempt_id, student=user)
            
            if attempt.submitted_at:
                return Response(
                    {'error': 'Quiz already submitted'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate score
            total_questions = Question.objects.filter(quiz=attempt.quiz).count()
            correct_answers = StudentQuizAnswer.objects.filter(
                attempt=attempt,
                is_correct=True
            ).count()
            
            score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
            
            # Update attempt
            attempt.submitted_at = datetime.now(timezone.utc)
            attempt.score = score
            attempt.save()
            
            return Response({
                'message': 'Quiz submitted successfully',
                'score': score,
                'correct_answers': correct_answers,
                'total_questions': total_questions
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentQuizResultsView(APIView):
    """
    Get quiz results for student
    """
    @student_required
    def get(self, request, quiz_slug):
        try:
            user = request.user
            
            # Find quiz
            try:
                quiz = Quiz.objects.get(slug=quiz_slug)
            except Quiz.DoesNotExist:
                quiz = get_object_or_404(Quiz, id=quiz_slug)
            
            # Get student's attempt
            attempt = get_object_or_404(StudentQuizAttempt, student=user, quiz=quiz)
            
            if not attempt.submitted_at:
                return Response(
                    {'error': 'Quiz not yet submitted'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get answers with details
            answers = StudentQuizAnswer.objects.filter(attempt=attempt).select_related('question')
            total_questions = Question.objects.filter(quiz=quiz).count()
            correct_answers = answers.filter(is_correct=True).count()
            
            # Calculate time taken
            time_taken = 0
            if attempt.start_time and attempt.submitted_at:
                time_diff = attempt.submitted_at - attempt.start_time
                time_taken = int(time_diff.total_seconds() / 60)  # in minutes
            
            # Get ranking (optional)
            all_attempts = StudentQuizAttempt.objects.filter(
                quiz=quiz,
                submitted_at__isnull=False
            ).order_by('-score', 'submitted_at')
            
            rank = None
            total_participants = all_attempts.count()
            for idx, other_attempt in enumerate(all_attempts, 1):
                if other_attempt.id == attempt.id:
                    rank = idx
                    break
            
            response_data = {
                'score': attempt.score,
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'time_taken': time_taken,
                'submitted_at': attempt.submitted_at,
                'rank': rank,
                'total_participants': total_participants,
                'answers': [
                    {
                        'question_text': answer.question.text,
                        'selected_answer': answer.selected_answer,
                        'selected_answer_text': getattr(answer.question, f'choice_{answer.selected_answer.lower()}', ''),
                        'correct_answer': answer.question.correct_choice,
                        'correct_answer_text': getattr(answer.question, f'choice_{answer.question.correct_choice.lower()}', ''),
                        'is_correct': answer.is_correct,
                        'explanation': getattr(answer.question, 'explanation', '')
                    }
                    for answer in answers
                ]
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )