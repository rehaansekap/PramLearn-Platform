from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from pramlearnapp.decorators import student_required
# Replace the wildcard import with specific imports
from pramlearnapp.models import (
    AssignmentSubmission, StudentQuizAttempt, StudentAttendance,
    Assignment, Quiz, CustomUser, Subject, StudentQuizAnswer,
)
from pramlearnapp.permissions import IsStudentUser


class StudentGradesView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request):
        """Get all student grades with filtering"""
        student = request.user

        # Get query parameters
        subject_id = request.GET.get('subject')
        assessment_type = request.GET.get('type')  # 'quiz' or 'assignment'
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        semester = request.GET.get('semester')

        # Build base queryset for quiz attempts
        quiz_attempts = StudentQuizAttempt.objects.filter(
            student=student,
            submitted_at__isnull=False,
            score__isnull=False
        ).select_related('quiz__subject')

        # Build base queryset for assignment submissions
        assignment_submissions = AssignmentSubmission.objects.filter(
            student=student,
            grade__isnull=False
        ).select_related('assignment__material__subject')

        # Apply filters
        if subject_id:
            quiz_attempts = quiz_attempts.filter(quiz__subject_id=subject_id)
            assignment_submissions = assignment_submissions.filter(
                assignment__material__subject_id=subject_id
            )

        if start_date:
            quiz_attempts = quiz_attempts.filter(submitted_at__gte=start_date)
            assignment_submissions = assignment_submissions.filter(
                submission_date__gte=start_date
            )

        if end_date:
            quiz_attempts = quiz_attempts.filter(submitted_at__lte=end_date)
            assignment_submissions = assignment_submissions.filter(
                submission_date__lte=end_date
            )

        # Combine grades
        grades = []

        # Add quiz grades
        if not assessment_type or assessment_type == 'quiz':
            for attempt in quiz_attempts:
                grades.append({
                    'id': f"quiz_{attempt.id}",
                    'title': attempt.quiz.title,
                    'subject_name': attempt.quiz.subject.name,
                    'subject_id': attempt.quiz.subject.id,
                    'score': float(attempt.score),
                    'date': attempt.submitted_at.date(),
                    'type': 'quiz',
                    'quiz_attempt_id': attempt.id,
                    'credits': 1,  # Default credit for quiz
                })

        # Add assignment grades
        if not assessment_type or assessment_type == 'assignment':
            for submission in assignment_submissions:
                grades.append({
                    'id': f"assignment_{submission.id}",
                    'title': submission.assignment.title,
                    'subject_name': submission.assignment.material.subject.name,
                    'subject_id': submission.assignment.material.subject.id,
                    'score': float(submission.grade),
                    'date': submission.submission_date.date(),
                    'type': 'assignment',
                    'assignment_submission_id': submission.id,
                    # Default credits for assignment
                    'credits': getattr(submission.assignment, 'credits', 2),
                })

        # Sort by date (newest first)
        grades.sort(key=lambda x: x['date'], reverse=True)

        # Get subjects
        subjects = Subject.objects.filter(
            Q(quiz__quizattempt__student=student) |
            Q(material__assignment__assignmentsubmission__student=student)
        ).distinct().values('id', 'name')

        return Response({
            'grades': grades,
            'subjects': list(subjects)
        })


class StudentGradeAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request):
        """Get detailed grade analytics"""
        student = request.user

        # Get all quiz attempts
        quiz_attempts = StudentQuizAttempt.objects.filter(
            student=student,
            submitted_at__isnull=False,
            score__isnull=False
        )

        # Get all assignment submissions
        assignment_submissions = AssignmentSubmission.objects.filter(
            student=student,
            grade__isnull=False
        )

        # Calculate overall statistics
        all_scores = []
        monthly_data = {}

        # Process quiz scores
        for attempt in quiz_attempts:
            score = float(attempt.score)
            all_scores.append(score)

            month_key = attempt.submitted_at.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'scores': [], 'count': 0}
            monthly_data[month_key]['scores'].append(score)
            monthly_data[month_key]['count'] += 1

        # Process assignment scores
        for submission in assignment_submissions:
            score = float(submission.grade)
            all_scores.append(score)

            month_key = submission.submission_date.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'scores': [], 'count': 0}
            monthly_data[month_key]['scores'].append(score)
            monthly_data[month_key]['count'] += 1

        # Calculate analytics
        if not all_scores:
            return Response({
                'overall_average': 0,
                'highest_score': 0,
                'lowest_score': 0,
                'total_assessments': 0,
                'gpa': 0,
                'monthly_trends': [],
                'grade_distribution': [],
                'subject_performance': []
            })

        analytics = {
            'overall_average': sum(all_scores) / len(all_scores),
            'highest_score': max(all_scores),
            'lowest_score': min(all_scores),
            'total_assessments': len(all_scores),
        }

        # Calculate GPA (4.0 scale)
        gpa_points = []
        for score in all_scores:
            if score >= 90:
                gpa_points.append(4.0)
            elif score >= 80:
                gpa_points.append(3.0)
            elif score >= 70:
                gpa_points.append(2.0)
            elif score >= 60:
                gpa_points.append(1.0)
            else:
                gpa_points.append(0.0)

        analytics['gpa'] = sum(gpa_points) / \
            len(gpa_points) if gpa_points else 0

        # Monthly trends
        monthly_trends = []
        for month, data in sorted(monthly_data.items()):
            avg_score = sum(data['scores']) / len(data['scores'])
            monthly_trends.append({
                'month': month,
                'average': round(avg_score, 1),
                'count': data['count']
            })

        analytics['monthly_trends'] = monthly_trends

        # Grade distribution
        distribution = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
        for score in all_scores:
            if score >= 90:
                distribution['A'] += 1
            elif score >= 80:
                distribution['B'] += 1
            elif score >= 70:
                distribution['C'] += 1
            elif score >= 60:
                distribution['D'] += 1
            else:
                distribution['F'] += 1

        analytics['grade_distribution'] = [
            {'grade': grade, 'count': count, 'percentage': round(
                (count/len(all_scores))*100, 1)}
            for grade, count in distribution.items()
        ]

        return Response(analytics)


class QuizAttemptReviewView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, attempt_id):
        """Get detailed quiz review"""
        try:
            attempt = StudentQuizAttempt.objects.get(
                id=attempt_id,
                student=request.user
            )

            # Get all answers with questions
            answers = StudentQuizAnswer.objects.filter(
                attempt=attempt).select_related('question')

            questions_data = []
            correct_count = 0

            for answer in answers:
                question = answer.question
                is_correct = answer.selected_answer == question.correct_answer
                if is_correct:
                    correct_count += 1

                questions_data.append({
                    'id': question.id,
                    'question_text': question.text,
                    'selected_answer': answer.selected_answer,
                    'selected_answer_text': getattr(question, f'choice_{answer.selected_answer.lower()}', ''),
                    'correct_answer': question.correct_answer,
                    'correct_answer_text': getattr(question, f'choice_{question.correct_answer.lower()}', ''),
                    'is_correct': is_correct,
                    'explanation': getattr(question, 'explanation', ''),
                    'choice_a': question.choice_a,
                    'choice_b': question.choice_b,
                    'choice_c': question.choice_c,
                    'choice_d': question.choice_d,
                    'points': 1,
                })

            # Calculate time taken
            time_taken = None
            if attempt.submitted_at and attempt.started_at:
                time_diff = attempt.submitted_at - attempt.started_at
                time_taken = int(time_diff.total_seconds() / 60)  # in minutes

            return Response({
                'score': float(attempt.score),
                'submitted_at': attempt.submitted_at,
                'time_taken': time_taken,
                'correct_answers': correct_count,
                'total_questions': len(questions_data),
                'questions': questions_data,
                'rank': None,  # Can be calculated if needed
                'total_participants': None,  # Can be calculated if needed
                'class_average': None,  # Can be calculated if needed
            })

        except StudentQuizAttempt.DoesNotExist:
            return Response({'error': 'Quiz attempt not found'}, status=404)


class AssignmentSubmissionFeedbackView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get(self, request, submission_id):
        """Get detailed assignment feedback"""
        try:
            submission = AssignmentSubmission.objects.get(
                id=submission_id,
                student=request.user
            )

            # Get assignment answers if they exist
            answers_data = []
            if hasattr(submission, 'answers'):
                for answer in submission.answers.all():
                    answers_data.append({
                        'id': answer.id,
                        'question_text': answer.question.text if hasattr(answer, 'question') else '',
                        'answer_text': answer.answer_text,
                        'answer_type': getattr(answer, 'answer_type', 'text'),
                        'teacher_feedback': getattr(answer, 'teacher_feedback', ''),
                        'points_earned': getattr(answer, 'points_earned', None),
                        'max_points': getattr(answer, 'max_points', 1),
                    })

            # Get submitted files
            files_data = []
            if hasattr(submission, 'files'):
                for file in submission.files.all():
                    files_data.append({
                        'name': file.name,
                        'url': file.file.url if hasattr(file, 'file') else '',
                        'size': getattr(file, 'size', ''),
                        'uploaded_at': getattr(file, 'uploaded_at', submission.submission_date),
                    })

            # Get rubric items if they exist
            rubric_items = []
            if hasattr(submission.assignment, 'rubric_items'):
                for item in submission.assignment.rubric_items.all():
                    # Get the grade for this rubric item
                    rubric_grade = getattr(
                        submission, f'rubric_{item.id}_grade', None)

                    rubric_items.append({
                        'id': item.id,
                        'criteria': item.criteria,
                        'description': item.description,
                        'max_points': item.max_points,
                        'points_earned': rubric_grade,
                        'teacher_comment': getattr(submission, f'rubric_{item.id}_comment', ''),
                    })

            return Response({
                'grade': float(submission.grade),
                'submission_date': submission.submission_date,
                'graded_at': getattr(submission, 'graded_at', None),
                'graded_by': getattr(submission, 'graded_by', ''),
                'teacher_feedback': getattr(submission, 'teacher_feedback', ''),
                'answers': answers_data,
                'submitted_files': files_data,
                'rubric_items': rubric_items,
                'improvement_suggestions': [],  # Can be implemented
            })

        except AssignmentSubmission.DoesNotExist:
            return Response({'error': 'Assignment submission not found'}, status=404)
