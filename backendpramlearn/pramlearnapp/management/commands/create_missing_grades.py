from django.core.management.base import BaseCommand
from django.db import transaction
from pramlearnapp.models import GroupQuiz, GroupMember, Grade, GroupQuizResult, AssignmentSubmission
from pramlearnapp.services.gradeService import create_grade_from_group_quiz, create_grade_from_submission
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create missing grade records for completed group quizzes and assignments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['group_quiz', 'assignment', 'all'],
            default='all',
            help='Type of grades to create (group_quiz, assignment, or all)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating grades'
        )

    def handle(self, *args, **options):
        grade_type = options['type']
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '🔍 DRY RUN MODE - No grades will be created'))

        self.stdout.write('🔄 Creating missing grades...')

        total_created = 0
        total_checked = 0

        if grade_type in ['group_quiz', 'all']:
            created, checked = self.create_group_quiz_grades(dry_run)
            total_created += created
            total_checked += checked

        if grade_type in ['assignment', 'all']:
            created, checked = self.create_assignment_grades(dry_run)
            total_created += created
            total_checked += checked

        self.stdout.write(
            self.style.SUCCESS(
                f'🎉 Completed! {"Would create" if dry_run else "Created"} {total_created} new grades from {total_checked} checked records.'
            )
        )

    def create_group_quiz_grades(self, dry_run=False):
        """Create missing grades for completed group quizzes"""
        self.stdout.write('📊 Processing group quizzes...')

        # Get all completed group quizzes
        completed_group_quizzes = GroupQuiz.objects.filter(
            submitted_at__isnull=False,
            is_completed=True
        ).select_related('quiz', 'group')

        total_created = 0
        total_checked = 0

        for group_quiz in completed_group_quizzes:
            self.stdout.write(
                f'Processing group quiz: {group_quiz.quiz.title} for group {group_quiz.group.name}')

            # Get all members of this group
            group_members = GroupMember.objects.filter(
                group=group_quiz.group
            ).select_related('student')

            for member in group_members:
                total_checked += 1

                # Check if grade already exists
                existing_grade = Grade.objects.filter(
                    student=member.student,
                    quiz=group_quiz.quiz,
                    type='quiz',
                    title__icontains='Group'
                ).first()

                if not existing_grade:
                    if not dry_run:
                        try:
                            with transaction.atomic():
                                grade = create_grade_from_group_quiz(
                                    group_quiz, member.student)
                                if grade:
                                    total_created += 1
                                    self.stdout.write(
                                        self.style.SUCCESS(
                                            f'✅ Created grade for {member.student.username}: {grade.grade}'
                                        )
                                    )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(
                                    f'❌ Failed to create grade for {member.student.username}: {str(e)}'
                                )
                            )
                    else:
                        total_created += 1
                        self.stdout.write(
                            self.style.WARNING(
                                f'🔍 Would create grade for {member.student.username}'
                            )
                        )
                else:
                    self.stdout.write(
                        f'⏭️ Grade already exists for {member.student.username}')

        return total_created, total_checked

    def create_assignment_grades(self, dry_run=False):
        """Create missing grades for completed assignments"""
        self.stdout.write('📝 Processing assignments...')

        # Get all completed assignment submissions
        completed_submissions = AssignmentSubmission.objects.filter(
            is_draft=False,
            grade__isnull=False  # Has been graded
        ).select_related('assignment', 'student')

        total_created = 0
        total_checked = 0

        for submission in completed_submissions:
            total_checked += 1

            # Check if grade record already exists
            existing_grade = Grade.objects.filter(
                student=submission.student,
                assignment=submission.assignment,
                type='assignment'
            ).first()

            if not existing_grade:
                if not dry_run:
                    try:
                        with transaction.atomic():
                            grade = create_grade_from_submission(submission)
                            if grade:
                                total_created += 1
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f'✅ Created assignment grade for {submission.student.username}: {grade.grade}'
                                    )
                                )
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'❌ Failed to create assignment grade for {submission.student.username}: {str(e)}'
                            )
                        )
                else:
                    total_created += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f'🔍 Would create assignment grade for {submission.student.username}'
                        )
                    )
            else:
                self.stdout.write(
                    f'⏭️ Assignment grade already exists for {submission.student.username}')

        return total_created, total_checked

    def get_group_quiz_score(self, group_quiz):
        """Get score for group quiz"""
        try:
            result = GroupQuizResult.objects.get(group_quiz=group_quiz)
            return result.score
        except GroupQuizResult.DoesNotExist:
            # Calculate score manually
            from pramlearnapp.models import GroupQuizSubmission

            total_questions = group_quiz.quiz.questions.count()
            if total_questions == 0:
                return 0

            correct_answers = GroupQuizSubmission.objects.filter(
                group_quiz=group_quiz,
                is_correct=True
            ).count()

            return (correct_answers / total_questions) * 100
