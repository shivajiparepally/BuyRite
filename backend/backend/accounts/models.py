import secrets
from datetime import date, timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

MIN_AGE = 21

OTP_PURPOSES = [
    ("register", "Verify email at registration"),
    ("password_reset", "Reset a forgotten password"),
    ("change_password", "Confirm a password change"),
    ("change_username", "Confirm a username change"),
    ("change_email", "Confirm a new email address"),
]

OTP_TTL = timedelta(minutes=10)
OTP_MAX_ATTEMPTS = 5


class User(AbstractUser):
    """
    Custom user model. Admin access is derived from settings.ADMIN_USERNAME,
    not the DB is_staff flag (see accounts.permissions).
    """

    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email_verified = models.BooleanField(default=False)

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = date.today()
        years = today.year - self.date_of_birth.year
        had_birthday = (today.month, today.day) >= (
            self.date_of_birth.month,
            self.date_of_birth.day,
        )
        return years if had_birthday else years - 1

    @property
    def is_age_verified(self):
        return self.age is not None and self.age >= MIN_AGE

    def __str__(self):
        return self.username


class EmailOTP(models.Model):
    """
    A short-lived 6-digit code emailed to the user to confirm a sensitive
    action. `new_value` holds the pending username/email for change flows so
    the client never has to re-send it at verify time.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    purpose = models.CharField(max_length=20, choices=OTP_PURPOSES)
    code = models.CharField(max_length=6)
    new_value = models.CharField(max_length=254, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "purpose", "consumed_at"])]

    @staticmethod
    def generate_code():
        return f"{secrets.randbelow(1_000_000):06d}"

    @classmethod
    def issue(cls, user, purpose, new_value=""):
        """Invalidate any prior open codes for this user+purpose and mint a new one."""
        cls.objects.filter(user=user, purpose=purpose, consumed_at__isnull=True).update(
            consumed_at=timezone.now()
        )
        return cls.objects.create(
            user=user,
            purpose=purpose,
            new_value=new_value,
            code=cls.generate_code(),
            expires_at=timezone.now() + OTP_TTL,
        )

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def is_open(self):
        return self.consumed_at is None and not self.is_expired and self.attempts < OTP_MAX_ATTEMPTS

    def consume(self):
        self.consumed_at = timezone.now()
        self.save(update_fields=["consumed_at"])
