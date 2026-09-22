from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.utils import timezone
from pramlearnapp.models.user import Role


@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Public health check endpoint.
    Executes a real database query against Supabase PostgreSQL to prevent auto-pause.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            db_res = cursor.fetchone()

        roles_count = Role.objects.count()

        return Response({
            "status": "healthy",
            "database": "connected",
            "roles_count": roles_count,
            "db_ping": db_res[0] if db_res else 1,
            "timestamp": timezone.now().isoformat()
        }, status=200)
    except Exception as e:
        return Response({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": timezone.now().isoformat()
        }, status=503)
