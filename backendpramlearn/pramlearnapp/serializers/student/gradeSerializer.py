from rest_framework import serializers
from pramlearnapp.models import Grade, GradeStatistics, Achievement


class GradeSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(read_only=True)
    material_title = serializers.CharField(
        source='material.title', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'type', 'title', 'subject_name', 'grade',
            'max_grade', 'date', 'teacher_feedback', 'material_title'
        ]
        read_only_fields = ['id', 'date']


class GradeStatisticsSerializer(serializers.ModelSerializer):
    pass_rate = serializers.SerializerMethodField()
    grade_distribution = serializers.SerializerMethodField()

    class Meta:
        model = GradeStatistics
        fields = [
            'total_assessments', 'average_grade', 'quiz_average',
            'assignment_average', 'gpa', 'pass_rate', 'grade_distribution',
            'last_updated'
        ]

    def get_pass_rate(self, obj):
        """Calculate pass rate (grades >= 60)"""
        total_grades = Grade.objects.filter(student=obj.student)
        if not total_grades.exists():
            return 0.0

        passing_grades = total_grades.filter(grade__gte=60)
        return round((passing_grades.count() / total_grades.count()) * 100, 1)

    def get_grade_distribution(self, obj):
        """Calculate grade distribution A, B, C, D, E"""
        grades = Grade.objects.filter(student=obj.student)
        total = grades.count()

        if total == 0:
            return {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0}

        distribution = {
            'A': grades.filter(grade__gte=90).count(),
            'B': grades.filter(grade__gte=80, grade__lt=90).count(),
            'C': grades.filter(grade__gte=70, grade__lt=80).count(),
            'D': grades.filter(grade__gte=60, grade__lt=70).count(),
            'E': grades.filter(grade__lt=60).count(),
        }

        # Convert to percentages
        return {k: round((v / total) * 100, 1) for k, v in distribution.items()}


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'type', 'title', 'description', 'icon', 'earned_date']
        read_only_fields = ['id', 'earned_date']


class StudentGradeAnalyticsSerializer(serializers.Serializer):
    """Serializer untuk analytics data yang kompleks"""
    grades = GradeSerializer(many=True, read_only=True)
    statistics = GradeStatisticsSerializer(read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    performance_trend = serializers.DictField(read_only=True)
    subject_breakdown = serializers.DictField(read_only=True)
