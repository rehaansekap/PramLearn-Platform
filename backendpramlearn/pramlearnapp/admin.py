from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Role, Announcement

admin.site.register(Role)


class CustomUserAdmin(UserAdmin):
    """
    Model admin khusus untuk CustomUser.
    """
    model = CustomUser
    list_display = ['username', 'email', 'role', 'is_staff']


admin.site.register(CustomUser, CustomUserAdmin)


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'priority',
                    'target_audience', 'is_active', 'created_at']
    list_filter = ['priority', 'target_audience', 'is_active', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
