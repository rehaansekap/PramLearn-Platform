from django.db.models import Avg, Count, Q, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta
from ..models import (
    Grade,
    GradeStatistics,
    Achievement,
    Assignment,
    Quiz,
    GroupQuiz,
    GroupMember,
)
import logging

logger = logging.getLogger(__name__)


def is_student(user):
    """Helper function to check if user is a student"""
    try:
        # Multiple ways to check student role
        if hasattr(user, "role"):
            # If role is an object with name attribute
            if hasattr(user.role, "name"):
                return user.role.name.lower() == "student"
            # If role is integer directly
            elif isinstance(user.role, int):
                return user.role == 3
            # If role is an object with id
            elif hasattr(user.role, "id"):
                return user.role.id == 3
        return False
    except Exception as e:
        logger.error(f"Error checking student role: {e}")
        return False


class GradeService:
    """
    Service class untuk business logic grades
    """

    def __init__(self, student):
        self.student = student

    def calculate_performance_trend(self):
        """Calculate performance trend (up/down/stable)"""
        grades = Grade.objects.filter(student=self.student).order_by("-date")

        if grades.count() < 10:
            return {
                "trend": "insufficient_data",
                "percentage": 0,
                "message": "Butuh minimal 10 nilai untuk analisis tren",
            }

        # Ambil 5 nilai terbaru vs 5 sebelumnya
        recent_grades = list(grades[:5])
        older_grades = list(grades[5:10])

        recent_avg = sum(g.grade for g in recent_grades) / len(recent_grades)
        older_avg = sum(g.grade for g in older_grades) / len(older_grades)

        difference = recent_avg - older_avg
        percentage = abs(difference / older_avg * 100) if older_avg > 0 else 0

        if difference > 2:
            trend = "up"
        elif difference < -2:
            trend = "down"
        else:
            trend = "stable"

        return {
            "trend": trend,
            "percentage": round(percentage, 1),
            "recent_average": round(recent_avg, 1),
            "previous_average": round(older_avg, 1),
        }

    def get_subject_breakdown(self):
        """Get performance breakdown by subject"""
        grades = Grade.objects.filter(student=self.student)

        # Group by subject
        subjects = {}
        for grade in grades:
            subject = grade.subject_name
            if subject not in subjects:
                subjects[subject] = {
                    "total_grades": [],
                    "quiz_grades": [],
                    "assignment_grades": [],
                }

            subjects[subject]["total_grades"].append(grade.grade)
            if grade.type == "quiz":
                subjects[subject]["quiz_grades"].append(grade.grade)
            elif grade.type == "assignment":
                subjects[subject]["assignment_grades"].append(grade.grade)

        # Calculate averages
        breakdown = {}
        for subject, data in subjects.items():
            breakdown[subject] = {
                "average": round(
                    sum(data["total_grades"]) / len(data["total_grades"]), 1
                ),
                "quiz_average": (
                    round(sum(data["quiz_grades"]) / len(data["quiz_grades"]), 1)
                    if data["quiz_grades"]
                    else 0
                ),
                "assignment_average": (
                    round(
                        sum(data["assignment_grades"]) / len(data["assignment_grades"]),
                        1,
                    )
                    if data["assignment_grades"]
                    else 0
                ),
                "total_assessments": len(data["total_grades"]),
            }

        return breakdown

    def check_and_award_achievements(self):
        """Check dan berikan achievement baru"""
        new_achievements = []
        grades = Grade.objects.filter(student=self.student)

        # Perfect Scorer: 3+ nilai sempurna (100)
        perfect_scores = grades.filter(grade=100).count()
        if perfect_scores >= 3:
            achievement, created = Achievement.objects.get_or_create(
                student=self.student,
                type="perfect_scorer",
                defaults={
                    "title": "Perfect Scorer",
                    "description": f"Meraih {perfect_scores} nilai sempurna!",
                    "icon": "🎯",
                },
            )
            if created:
                new_achievements.append(achievement)

        # Consistent Performer: 5 nilai >80 berturut-turut
        recent_grades = list(grades.order_by("-date")[:5])
        if len(recent_grades) >= 5 and all(g.grade > 80 for g in recent_grades):
            achievement, created = Achievement.objects.get_or_create(
                student=self.student,
                type="consistent_performer",
                defaults={
                    "title": "Consistent Performer",
                    "description": "5 nilai berturut-turut di atas 80!",
                    "icon": "📈",
                },
            )
            if created:
                new_achievements.append(achievement)

        # Quiz Master: Rata-rata quiz >85
        quiz_avg = grades.filter(type="quiz").aggregate(avg=Avg("grade"))["avg"]
        if quiz_avg and quiz_avg > 85:
            achievement, created = Achievement.objects.get_or_create(
                student=self.student,
                type="quiz_master",
                defaults={
                    "title": "Quiz Master",
                    "description": f"Rata-rata quiz {quiz_avg:.1f}!",
                    "icon": "🧠",
                },
            )
            if created:
                new_achievements.append(achievement)

        # Assignment Expert: Rata-rata assignment >85
        assignment_avg = grades.filter(type="assignment").aggregate(avg=Avg("grade"))[
            "avg"
        ]
        if assignment_avg and assignment_avg > 85:
            achievement, created = Achievement.objects.get_or_create(
                student=self.student,
                type="assignment_expert",
                defaults={
                    "title": "Assignment Expert",
                    "description": f"Rata-rata assignment {assignment_avg:.1f}!",
                    "icon": "📝",
                },
            )
            if created:
                new_achievements.append(achievement)

        # High Achiever: Overall average >90
        overall_avg = grades.aggregate(avg=Avg("grade"))["avg"]
        if overall_avg and overall_avg > 90:
            achievement, created = Achievement.objects.get_or_create(
                student=self.student,
                type="high_achiever",
                defaults={
                    "title": "High Achiever",
                    "description": f"Rata-rata keseluruhan {overall_avg:.1f}!",
                    "icon": "🏆",
                },
            )
            if created:
                new_achievements.append(achievement)

        # Dedicated Learner: 20+ assessments completed
        total_assessments = grades.count()
        if total_assessments >= 20:
            achievement, created = Achievement.objects.get_or_create(
                student=self.student,
                type="dedicated_learner",
                defaults={
                    "title": "Dedicated Learner",
                    "description": f"{total_assessments} assessment selesai!",
                    "icon": "📚",
                },
            )
            if created:
                new_achievements.append(achievement)

        return [
            {
                "type": a.type,
                "title": a.title,
                "description": a.description,
                "icon": a.icon,
            }
            for a in new_achievements
        ]

    def get_comprehensive_analytics(self):
        """Get comprehensive analytics data"""
        grades = Grade.objects.filter(student=self.student)

        # Update statistics
        grade_stats, created = GradeStatistics.objects.get_or_create(
            student=self.student
        )
        grade_stats.update_statistics()

        # Get all analytics
        performance_trend = self.calculate_performance_trend()
        subject_breakdown = self.get_subject_breakdown()
        achievements = Achievement.objects.filter(student=self.student)

        return {
            "grades": [
                {
                    "id": g.id,
                    "type": g.type,
                    "title": g.title,
                    "subject_name": g.subject_name,
                    "grade": g.grade,
                    "date": g.date.isoformat(),
                    "teacher_feedback": g.teacher_feedback,
                }
                for g in grades
            ],
            "statistics": {
                "total_assessments": grade_stats.total_assessments,
                "average_grade": grade_stats.average_grade,
                "quiz_average": grade_stats.quiz_average,
                "assignment_average": grade_stats.assignment_average,
                "gpa": grade_stats.gpa,
            },
            "performance_trend": performance_trend,
            "subject_breakdown": subject_breakdown,
            "achievements": [
                {
                    "type": a.type,
                    "title": a.title,
                    "description": a.description,
                    "icon": a.icon,
                    "earned_date": a.earned_date.isoformat(),
                }
                for a in achievements
            ],
        }


def create_grade_from_submission(submission):
    """
    Utility function untuk create grade dari assignment submission
    """
    try:

        logger.info(f"🔄 create_grade_from_submission called with:")
        logger.info(f"📊 submission: {submission}")
        logger.info(f"📊 submission.id: {submission.id}")
        logger.info(f"📊 submission.assignment: {submission.assignment}")
        logger.info(f"📊 submission.student: {submission.student}")
        logger.info(f"📊 submission.grade: {submission.grade}")
        logger.info(f"📊 submission.is_draft: {submission.is_draft}")

        # Validate student role first
        if not is_student(submission.student):
            logger.warning(
                f"User {submission.student.username} is not a student, skipping grade creation"
            )
            return None

        if submission.is_draft:
            logger.warning(f"❌ Submission {submission.id} is still a draft!")
            return None

        if submission.grade is None:
            logger.warning(f"❌ Submission {submission.id} has no grade calculated!")
            return None

        assignment = submission.assignment
        logger.info(
            f"🔄 Creating grade for assignment submission: {submission.id}, student: {submission.student.username}"
        )

        # Check if grade already exists to avoid duplicates
        from ..models import Grade

        existing_grade = Grade.objects.filter(
            student=submission.student, assignment=assignment, type="assignment"
        ).first()

        if existing_grade:
            logger.info(
                f"⏭️ Grade already exists for student {submission.student.username} and assignment {assignment.title}"
            )
            return existing_grade

        try:
            logger.info(f"🔄 Creating Grade object...")
            logger.info(f"📊 student: {submission.student}")
            logger.info(f"📊 assignment: {assignment}")
            logger.info(f"📊 assignment.title: {assignment.title}")
            logger.info(f"📊 grade_value: {submission.grade}")

            # Validate required data
            if not assignment.title:
                logger.error("❌ Assignment title is empty")
                return None

            if submission.grade is None:
                logger.error("❌ Submission grade is None")
                return None

            grade = Grade.objects.create(
                student=submission.student,
                type="assignment",
                title=assignment.title,
                subject_name=(
                    assignment.material.subject.name
                    if assignment.material and assignment.material.subject
                    else "Unknown"
                ),
                grade=float(submission.grade),
                max_grade=100.0,
                date=timezone.now(),
                assignment=assignment,
                material=assignment.material,
            )
            logger.info(
                f"✅ Grade created successfully: ID={grade.id}, Grade={grade.grade}"
            )

            # Update statistics
            try:
                from ..models import GradeStatistics

                grade_stats, created = GradeStatistics.objects.get_or_create(
                    student=submission.student
                )
                grade_stats.update_statistics()
                logger.info(
                    f"✅ Statistics updated for student {submission.student.username}"
                )
            except Exception as stats_error:
                logger.error(f"❌ Error updating statistics: {stats_error}")

            return grade

        except Exception as grade_error:
            logger.error(f"❌ Error creating Grade object: {grade_error}")
            import traceback

            logger.error(f"Traceback: {traceback.format_exc()}")
            return None

    except Exception as e:
        logger.error(f"❌ Error in create_grade_from_submission: {str(e)}")
        import traceback

        logger.error(f"Traceback: {traceback.format_exc()}")
        return None


def create_grade_from_quiz_attempt(quiz_attempt):
    """
    Utility function untuk create grade dari quiz attempt
    """
    try:
        quiz = quiz_attempt.quiz

        # Calculate grade
        total_questions = quiz.questions.count()
        if total_questions == 0:
            return None

        correct_answers = quiz_attempt.answers.filter(is_correct=True).count()

        grade_value = (correct_answers / total_questions) * 100

        # Create grade record
        grade = Grade.objects.create(
            student=quiz_attempt.student,
            type="quiz",
            title=quiz.title,
            subject_name=quiz.material.subject.name if quiz.material else "Unknown",
            grade=grade_value,
            quiz=quiz,
            material=quiz.material,
        )

        # Update statistics
        grade_stats, created = GradeStatistics.objects.get_or_create(
            student=quiz_attempt.student
        )
        grade_stats.update_statistics()

        return grade

    except Exception as e:
        logger.error(f"Error creating grade from quiz attempt: {str(e)}")
        return None


def create_grade_from_group_quiz(group_quiz, student):
    """
    Utility function untuk create grade dari group quiz attempt
    """
    try:

        logger.info(f"🔄 create_grade_from_group_quiz called with:")
        logger.info(f"📊 group_quiz: {group_quiz}")
        logger.info(f"📊 group_quiz.id: {group_quiz.id}")
        logger.info(f"📊 group_quiz.submitted_at: {group_quiz.submitted_at}")
        logger.info(f"📊 group_quiz.is_completed: {group_quiz.is_completed}")
        logger.info(f"📊 student: {student}")
        logger.info(f"📊 student.username: {student.username}")
        logger.info(f"📊 student.role: {student.role}")

        # Validate student role first
        if not is_student(student):
            logger.warning(
                f"User {student.username} is not a student, skipping grade creation"
            )
            return None

        quiz = group_quiz.quiz
        logger.info(
            f"🔄 Creating grade for group quiz: {group_quiz.id}, student: {student.username}"
        )

        if not group_quiz.submitted_at:
            logger.warning(f"❌ GroupQuiz {group_quiz.id} belum disubmit!")
            return None

        # Check if grade already exists to avoid duplicates
        from ..models import Grade

        existing_grade = (
            Grade.objects.filter(student=student, quiz=quiz, type="quiz")
            .filter(Q(title__icontains="Group") | Q(title=quiz.title))
            .first()
        )

        if existing_grade:
            logger.info(
                f"⏭️ Grade already exists for student {student.username} and quiz {quiz.title}"
            )
            return existing_grade

        try:
            from ..models import GroupQuizResult

            result = GroupQuizResult.objects.get(group_quiz=group_quiz)
            grade_value = result.score
            logger.info(f"✅ Found GroupQuizResult with score: {grade_value}")
        except GroupQuizResult.DoesNotExist:
            logger.error(
                f"❌ GroupQuizResult not found for group_quiz: {group_quiz.id}"
            )
            # Force calculate score
            try:
                result = group_quiz.calculate_and_save_score()
                if hasattr(result, "score"):
                    grade_value = result.score
                    logger.info(f"🔧 Calculated new score: {grade_value}")
                else:
                    grade_value = 0
                    logger.warning(f"⚠️ No score calculated, using 0")
            except Exception as calc_error:
                logger.error(f"❌ Error calculating score: {calc_error}")
                grade_value = 0

        try:
            logger.info(f"🔄 Creating Grade object...")
            logger.info(f"📊 student: {student}")
            logger.info(f"📊 quiz: {quiz}")
            logger.info(f"📊 quiz.title: {quiz.title}")
            logger.info(f"📊 grade_value: {grade_value}")

            # Validate required data
            if not quiz.title:
                logger.error("❌ Quiz title is empty")
                return None

            if grade_value is None:
                logger.error("❌ Grade value is None")
                return None

            grade = Grade.objects.create(
                student=student,
                type="quiz",
                title=f"{quiz.title} (Group)",
                subject_name=(
                    quiz.material.subject.name
                    if quiz.material and quiz.material.subject
                    else "Unknown"
                ),
                grade=float(grade_value),
                max_grade=100.0,
                date=timezone.now(),
                quiz=quiz,
                material=quiz.material,
            )
            logger.info(
                f"✅ Grade created successfully: ID={grade.id}, Grade={grade.grade}"
            )

            # Update statistics
            try:
                from ..models import GradeStatistics

                grade_stats, created = GradeStatistics.objects.get_or_create(
                    student=student
                )
                grade_stats.update_statistics()
                logger.info(f"✅ Statistics updated for student {student.username}")
            except Exception as stats_error:
                logger.error(f"❌ Error updating statistics: {stats_error}")

            return grade

        except Exception as grade_error:
            logger.error(f"❌ Error creating Grade object: {grade_error}")
            import traceback

            logger.error(f"Traceback: {traceback.format_exc()}")
            return None

    except Exception as e:
        logger.error(f"❌ Error in create_grade_from_group_quiz: {str(e)}")
        import traceback

        logger.error(f"Traceback: {traceback.format_exc()}")
        return None
