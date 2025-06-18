from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from ...models import Grade, GradeStatistics, Achievement
from pramlearnapp.serializers import (
    GradeSerializer,
    GradeStatisticsSerializer,
    AchievementSerializer,
    StudentGradeAnalyticsSerializer
)
from ...services.gradeService import GradeService
import logging

logger = logging.getLogger(__name__)


class StudentGradeView(APIView):
    """
    API untuk mengambil grades siswa dengan filtering & sorting
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # ✅ PERBAIKAN: Pengecekan role yang lebih robust
            user = request.user
            is_student = False

            # Debug logging
            logger.info(
                f"User: {user.username}, Role object: {user.role}, Role type: {type(user.role)}")

            if hasattr(user, 'role'):
                # Jika role adalah objek Role dengan attribute name
                if hasattr(user.role, 'name'):
                    is_student = user.role.name.lower() == 'student'
                    logger.info(
                        f"Role name: {user.role.name}, is_student: {is_student}")
                # Jika role adalah integer langsung
                elif isinstance(user.role, int):
                    is_student = user.role == 3
                    logger.info(
                        f"Role integer: {user.role}, is_student: {is_student}")
                # Jika role adalah objek dengan id
                elif hasattr(user.role, 'id'):
                    is_student = user.role.id == 3
                    logger.info(
                        f"Role id: {user.role.id}, is_student: {is_student}")

            if not is_student:
                return Response(
                    {'error': 'Only students can access grades'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get atau create grade statistics
            grade_stats, created = GradeStatistics.objects.get_or_create(
                student=request.user
            )
            if created:
                grade_stats.update_statistics()

            # Get grades dengan filtering
            grades = Grade.objects.filter(student=request.user)

            # Apply filters
            subject_filter = request.GET.get('subject_id')
            type_filter = request.GET.get('type')
            date_from = request.GET.get('date_from')
            date_to = request.GET.get('date_to')

            if subject_filter:
                grades = grades.filter(
                    Q(assignment__material__subject_id=subject_filter) |
                    Q(quiz__material__subject_id=subject_filter) |
                    Q(material__subject_id=subject_filter)
                )

            if type_filter and type_filter in ['quiz', 'assignment', 'material']:
                grades = grades.filter(type=type_filter)

            if date_from:
                try:
                    date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d')
                    grades = grades.filter(date__gte=date_from_parsed)
                except ValueError:
                    pass

            if date_to:
                try:
                    date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d')
                    grades = grades.filter(date__lte=date_to_parsed)
                except ValueError:
                    pass

            # Sorting
            grades = grades.order_by('-date')

            # Serialize data
            grade_serializer = GradeSerializer(grades, many=True)
            stats_serializer = GradeStatisticsSerializer(grade_stats)

            return Response({
                'grades': grade_serializer.data,
                'statistics': stats_serializer.data,
                'total_count': grades.count()
            })

        except Exception as e:
            logger.error(f"Error in StudentGradeView: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentGradeAnalyticsView(APIView):
    """
    API untuk analytics grade siswa yang lebih detail
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # ✅ PERBAIKAN: Pengecekan role yang sama
            user = request.user
            is_student = False

            if hasattr(user, 'role'):
                if hasattr(user.role, 'name'):
                    is_student = user.role.name.lower() == 'student'
                elif isinstance(user.role, int):
                    is_student = user.role == 3
                elif hasattr(user.role, 'id'):
                    is_student = user.role.id == 3

            if not is_student:
                return Response(
                    {'error': 'Only students can access grade analytics'},
                    status=status.HTTP_403_FORBIDDEN
                )

            grade_service = GradeService(request.user)
            analytics_data = grade_service.get_comprehensive_analytics()

            return Response(analytics_data)

        except Exception as e:
            logger.error(f"Error in StudentGradeAnalyticsView: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentAchievementView(APIView):
    """
    API untuk achievement/badges siswa
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # ✅ PERBAIKAN: Pengecekan role yang sama
            user = request.user
            is_student = False

            if hasattr(user, 'role'):
                if hasattr(user.role, 'name'):
                    is_student = user.role.name.lower() == 'student'
                elif isinstance(user.role, int):
                    is_student = user.role == 3
                elif hasattr(user.role, 'id'):
                    is_student = user.role.id == 3

            if not is_student:
                return Response(
                    {'error': 'Only students can access achievements'},
                    status=status.HTTP_403_FORBIDDEN
                )

            achievements = Achievement.objects.filter(student=request.user)
            serializer = AchievementSerializer(achievements, many=True)

            # Check for new achievements
            grade_service = GradeService(request.user)
            new_achievements = grade_service.check_and_award_achievements()

            return Response({
                'achievements': serializer.data,
                'new_achievements': new_achievements
            })

        except Exception as e:
            logger.error(f"Error in StudentAchievementView: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
