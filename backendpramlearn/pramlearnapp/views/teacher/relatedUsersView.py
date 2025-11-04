from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.models import SubjectClass, ClassStudent, CustomUser, Class
from pramlearnapp.serializers import StudentSerializer
from pramlearnapp.permissions import IsTeacherUser
from pramlearnapp.serializers.user import CustomUserSerializer
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Gunakan CustomUserSerializer yang tidak memiliki password field
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update status online user"""
        user = request.user
        allowed_fields = ['is_online', 'last_activity']

        # Handle data dari form atau JSON
        if request.content_type == 'application/json':
            data = request.data
        else:
            # Handle FormData dari sendBeacon
            data = {}
            for field in allowed_fields:
                if field in request.POST:
                    data[field] = request.POST[field]

        # Update field yang diizinkan
        update_data = {}
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        # Update database
        for field, value in update_data.items():
            if field == 'last_activity':
                if isinstance(value, str):
                    from django.utils.dateparse import parse_datetime
                    from django.utils import timezone
                    parsed_value = parse_datetime(value)
                    value = parsed_value if parsed_value else timezone.now()
                setattr(user, field, value)
            elif field == 'is_online':
                if isinstance(value, str):
                    value = value.lower() in ('true', '1', 'yes')
                setattr(user, field, value)
            else:
                setattr(user, field, value)

        user.save()
        print(
            f"💾 User {user.username} status updated: is_online={user.is_online}")

        # Broadcast real-time update via WebSocket
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    "user_status_updates",
                    {
                        'type': 'user_status_update',
                        'user_id': user.id,
                        'is_online': user.is_online,
                        'last_activity': user.last_activity.isoformat() if user.last_activity else None
                    }
                )
                print(f"📡 WebSocket broadcast sent for user {user.username}")
        except Exception as e:
            print(f"❌ WebSocket broadcast error: {e}")

        serializer = CustomUserSerializer(user)
        return Response(serializer.data)


class RelatedUsersForTeacherView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        teacher = request.user
        subject_classes = SubjectClass.objects.filter(teacher=teacher)
        class_ids = list(subject_classes.values_list(
            'class_id', flat=True).distinct())
        student_ids = list(ClassStudent.objects.filter(
            class_id__in=class_ids).values_list('student_id', flat=True).distinct())
        students = CustomUser.objects.filter(id__in=student_ids)
        from pramlearnapp.serializers.teacher.classSerializer import ClassSerializer
        classes = Class.objects.filter(id__in=class_ids)
        return Response({
            "users": CustomUserSerializer(students, many=True).data,
            "classes": ClassSerializer(classes, many=True).data
        })
