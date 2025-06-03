from django.urls import re_path
from pramlearnapp.consumers import UserStatusConsumer, AttendanceConsumer, QuizRankingConsumer

websocket_urlpatterns = [
    re_path(r'ws/attendance/(?P<material_id>\d+)/$',
            AttendanceConsumer.as_asgi()),
    re_path(r'ws/user-status/$', UserStatusConsumer.as_asgi()),
    re_path(r'ws/quiz-ranking/(?P<quiz_id>\d+)/(?P<material_id>\d+)/$',
            QuizRankingConsumer.as_asgi()),
]
