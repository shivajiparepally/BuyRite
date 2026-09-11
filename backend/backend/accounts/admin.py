from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import EmailOTP, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Age & Contact", {"fields": ("date_of_birth", "phone_number", "email_verified")}),
    )
    list_display = ("username", "email", "email_verified", "date_of_birth", "is_staff", "is_active")


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("user", "purpose", "code", "created_at", "expires_at", "consumed_at", "attempts")
    list_filter = ("purpose",)
    search_fields = ("user__username", "user__email")
