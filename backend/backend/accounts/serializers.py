from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import MIN_AGE

User = get_user_model()


def _check_age(value):
    today = date.today()
    years = today.year - value.year
    had_birthday = (today.month, today.day) >= (value.month, value.day)
    age = years if had_birthday else years - 1
    if age < MIN_AGE:
        raise serializers.ValidationError(f"You must be {MIN_AGE} or older to create an account.")
    return value


def _check_phone(value):
    if len([c for c in value if c.isdigit()]) < 10:
        raise serializers.ValidationError(
            "Enter a valid phone number (at least 10 digits) so the store can reach you about your order."
        )
    return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField(required=True, allow_blank=False, max_length=20)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "password", "first_name", "last_name",
            "date_of_birth", "phone_number",
        ]
        extra_kwargs = {
            "email": {"required": True, "allow_blank": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_phone_number(self, value):
        return _check_phone(value)

    def validate_date_of_birth(self, value):
        return _check_age(value)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data, email_verified=False)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    is_age_verified = serializers.ReadOnlyField()
    is_staff = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "date_of_birth", "phone_number", "email_verified",
            "is_staff", "is_age_verified",
        ]

    def get_is_staff(self, obj):
        """Admin status comes from the configured username, never the DB flag."""
        return bool(settings.ADMIN_USERNAME) and obj.username == settings.ADMIN_USERNAME


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number"]

    def validate_phone_number(self, value):
        return _check_phone(value)


class LoginSerializer(TokenObtainPairSerializer):
    """Standard JWT login, but unverified accounts are turned away with a
    machine-readable code so the frontend can jump to the OTP screen."""

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.email_verified:
            raise serializers.ValidationError(
                {"detail": "Please verify your email to continue.", "code": "email_not_verified",
                 "email": self.user.email}
            )
        data["user"] = UserSerializer(self.user).data
        return data


# ---- OTP flow inputs -------------------------------------------------------

class EmailOnlySerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ChangePasswordRequestSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, user=self.context["request"].user)
        return value


class ChangePasswordConfirmSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)

    def validate_new_password(self, value):
        validate_password(value, user=self.context["request"].user)
        return value


class ChangeUsernameRequestSerializer(serializers.Serializer):
    new_username = serializers.CharField(max_length=150)
    password = serializers.CharField()

    def validate_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Password is incorrect.")
        return value

    def validate_new_username(self, value):
        value = value.strip()
        if value == settings.ADMIN_USERNAME:
            raise serializers.ValidationError("That username is not available.")
        qs = User.objects.filter(username__iexact=value).exclude(pk=self.context["request"].user.pk)
        if qs.exists():
            raise serializers.ValidationError("That username is already taken.")
        return value


class ChangeEmailRequestSerializer(serializers.Serializer):
    new_email = serializers.EmailField()
    password = serializers.CharField()

    def validate_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Password is incorrect.")
        return value

    def validate_new_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exclude(pk=self.context["request"].user.pk).exists():
            raise serializers.ValidationError("That email is already in use.")
        return value


class CodeOnlySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
