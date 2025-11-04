from rest_framework import permissions



class IsAdminUser(permissions.BasePermission):
    """
    Izin khusus untuk hanya mengizinkan pengguna dengan peran admin atau superuser mengakses tampilan ini.
    """

    def has_permission(self, request, view):
        return request.user and (
            request.user.is_superuser
            or (request.user.role and request.user.role.name == "Admin")
        )


class IsTeacherUser(permissions.BasePermission):
    """
    Izin khusus untuk hanya mengizinkan pengguna dengan peran guru mengakses tampilan ini.
    """

    def has_permission(self, request, view):
        return (
            request.user and request.user.role and request.user.role.name == "Teacher"
        )


class IsStudentUser(permissions.BasePermission):
    """
    Permission untuk memastikan user adalah student
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user role is student (role = 3)
        return hasattr(request.user, 'role') and request.user.role.id == 3


# class IsStudentUser(permissions.BasePermission):
#     """
#     Izin khusus untuk hanya mengizinkan pengguna dengan peran siswa mengakses tampilan ini.
#     """

#     def has_permission(self, request, view):
#         return (
#             request.user and request.user.role and request.user.role.name == "Student"
#         )
