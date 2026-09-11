from django.conf import settings
from rest_framework.permissions import BasePermission


def is_configured_admin(user):
    """True only for the single account named by settings.ADMIN_USERNAME."""
    return bool(
        user
        and user.is_authenticated
        and settings.ADMIN_USERNAME
        and user.username == settings.ADMIN_USERNAME
    )


class IsConfiguredAdmin(BasePermission):
    """Allow only the env-configured admin account."""

    def has_permission(self, request, view):
        return is_configured_admin(request.user)
