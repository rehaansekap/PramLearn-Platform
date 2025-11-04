from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def student_required(view_func):
    """
    Decorator untuk memastikan hanya student yang bisa akses
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user is student (role = 3)
        if hasattr(request.user, 'role'):
            if getattr(request.user.role, 'name', None) == 'Student' or getattr(request.user, 'role', None) == 3:
                return view_func(self, request, *args, **kwargs)
        
        return Response(
            {'error': 'Student access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    return wrapper