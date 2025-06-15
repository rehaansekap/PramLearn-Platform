from django.urls import re_path
from pramlearnapp.consumers import UserStatusConsumer, AttendanceConsumer, QuizRankingConsumer
from pramlearnapp.consumers.notificationConsumer import NotificationConsumer
from pramlearnapp.consumers.quizCollaborationConsumer import QuizCollaborationConsumer  # Tambahkan ini

websocket_urlpatterns = [
    re_path(r'ws/attendance/(?P<material_id>\d+)/$',
            AttendanceConsumer.as_asgi()),
    re_path(r'ws/user-status/$', UserStatusConsumer.as_asgi()),
    re_path(r'ws/quiz-ranking/(?P<quiz_id>\d+)/(?P<material_id>\d+)/$',
            QuizRankingConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\d+)/$',
            NotificationConsumer.as_asgi()),
    # Tambahkan WebSocket untuk quiz collaboration
    re_path(r'ws/quiz-collaboration/(?P<quiz_id>\d+)/(?P<group_id>\d+)/$',
            QuizCollaborationConsumer.as_asgi()),
]
