from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Role

admin.site.register(Role)


class CustomUserAdmin(UserAdmin):
    """
    Model admin khusus untuk CustomUser.
    """
    model = CustomUser
    list_display = ['username', 'email', 'role', 'is_staff']


admin.site.register(CustomUser, CustomUserAdmin)
