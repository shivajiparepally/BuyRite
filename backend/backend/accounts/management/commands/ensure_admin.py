"""
Provision the single admin account from ADMIN_USERNAME / ADMIN_PASSWORD.

Run with: python manage.py ensure_admin

Creates or updates that one user (is_staff + is_superuser) and strips staff
access from every other account, so only the configured username can reach
the admin dashboard.
"""

from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()


class Command(BaseCommand):
    help = "Create/update the configured admin account and revoke staff from all others."

    def handle(self, *args, **options):
        username = settings.ADMIN_USERNAME
        password = settings.ADMIN_PASSWORD
        if not username or not password:
            raise CommandError(
                "ADMIN_USERNAME and ADMIN_PASSWORD must both be set in the environment / .env."
            )

        user, created = User.objects.get_or_create(username=username)
        user.is_staff = True
        user.is_superuser = True
        user.email_verified = True  # admin never goes through the OTP flow
        if not user.date_of_birth:
            user.date_of_birth = date(1990, 1, 1)  # keeps age gate satisfied
        user.set_password(password)
        user.save()

        demoted = (
            User.objects.exclude(pk=user.pk)
            .filter(is_staff=True)
            .update(is_staff=False, is_superuser=False)
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"{'Created' if created else 'Updated'} admin '{username}'. "
                f"Revoked staff from {demoted} other account(s)."
            )
        )
