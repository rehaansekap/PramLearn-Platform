from django.db import models
from django.contrib.auth import get_user_model
from .assignment import Assignment
from .quiz import Quiz
from .material import Material

User = get_user_model()


class Grade(models.Model):
    """Model untuk menyimpan nilai/grade siswa"""
    GRADE_TYPES = [
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('material', 'Material'),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='grades',
        limit_choices_to={'role': 3}  # Hanya siswa
    )
    type = models.CharField(max_length=20, choices=GRADE_TYPES)
    title = models.CharField(max_length=200)
    subject_name = models.CharField(max_length=100)
    grade = models.FloatField()  # 0-100
    max_grade = models.FloatField(default=100)
    date = models.DateTimeField(auto_now_add=True)
    teacher_feedback = models.TextField(blank=True, null=True)

    # Foreign keys untuk traceability
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='grades'
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='grades'
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='grades'
    )

    class Meta:
        # db_table = 'grades'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['student', 'type']),
            models.Index(fields=['student', 'date']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.title}: {self.grade}"


class GradeStatistics(models.Model):
    """Model untuk cache statistik grade siswa"""
    student = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='grade_statistics'
    )
    total_assessments = models.IntegerField(default=0)
    average_grade = models.FloatField(default=0.0)
    quiz_average = models.FloatField(default=0.0)
    assignment_average = models.FloatField(default=0.0)
    gpa = models.FloatField(default=0.0)  # 4.0 scale
    last_updated = models.DateTimeField(auto_now=True)

    # class Meta:
    # db_table = 'grade_statistics'

    def calculate_gpa(self):
        """Convert average grade to 4.0 scale"""
        if self.average_grade >= 90:
            return 4.0
        elif self.average_grade >= 80:
            return 3.0
        elif self.average_grade >= 70:
            return 2.0
        elif self.average_grade >= 60:
            return 1.0
        return 0.0

    def update_statistics(self):
        """Update semua statistik dari grades siswa"""
        grades = Grade.objects.filter(student=self.student)

        if grades.exists():
            self.total_assessments = grades.count()
            self.average_grade = grades.aggregate(
                avg=models.Avg('grade')
            )['avg'] or 0.0

            quiz_grades = grades.filter(type='quiz')
            self.quiz_average = quiz_grades.aggregate(
                avg=models.Avg('grade')
            )['avg'] or 0.0

            assignment_grades = grades.filter(type='assignment')
            self.assignment_average = assignment_grades.aggregate(
                avg=models.Avg('grade')
            )['avg'] or 0.0

            self.gpa = self.calculate_gpa()
        else:
            self.total_assessments = 0
            self.average_grade = 0.0
            self.quiz_average = 0.0
            self.assignment_average = 0.0
            self.gpa = 0.0

        self.save()


class Achievement(models.Model):
    """Model untuk achievement/badge siswa"""
    ACHIEVEMENT_TYPES = [
        ('perfect_scorer', 'Perfect Scorer'),
        ('consistent_performer', 'Consistent Performer'),
        ('quiz_master', 'Quiz Master'),
        ('assignment_expert', 'Assignment Expert'),
        ('high_achiever', 'High Achiever'),
        ('dedicated_learner', 'Dedicated Learner'),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    type = models.CharField(max_length=30, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10, default='🏆')
    earned_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # db_table = 'achievements'
        unique_together = ['student', 'type']

    def __str__(self):
        return f"{self.student.username} - {self.title}"
