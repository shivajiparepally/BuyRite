from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import EmailOTP
from .otp import issue_and_send, verify_code
from .serializers import (
    ChangeEmailRequestSerializer,
    ChangePasswordConfirmSerializer,
    ChangePasswordRequestSerializer,
    ChangeUsernameRequestSerializer,
    CodeOnlySerializer,
    EmailOnlySerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)

User = get_user_model()


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class RegisterView(generics.CreateAPIView):
    """Create an unverified account and email a 6-digit verification code.
    No tokens are returned until the email is verified."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        issue_and_send(user, "register")
        return Response(
            {"detail": "Account created. Check your email for a verification code.",
             "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = VerifyEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=data.validated_data["email"]).first()
        if not user:
            return Response({"code": "Incorrect code."}, status=400)
        otp = verify_code(user, "register", data.validated_data["code"])
        otp.consume()
        user.email_verified = True
        user.save(update_fields=["email_verified"])
        return Response(tokens_for(user))


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = EmailOnlySerializer(data=request.data)
        data.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=data.validated_data["email"]).first()
        if user and not user.email_verified:
            issue_and_send(user, "register")
        # Never reveal whether the address exists.
        return Response({"detail": "If that account exists and is unverified, a new code is on its way."})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = EmailOnlySerializer(data=request.data)
        data.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=data.validated_data["email"]).first()
        if user:
            issue_and_send(user, "password_reset")
        return Response({"detail": "If that email is registered, a reset code has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = PasswordResetConfirmSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=data.validated_data["email"]).first()
        if not user:
            return Response({"code": "Incorrect code."}, status=400)
        otp = verify_code(user, "password_reset", data.validated_data["code"])
        otp.consume()
        user.set_password(data.validated_data["new_password"])
        user.email_verified = True  # proved control of the inbox
        user.save(update_fields=["password", "email_verified"])
        return Response(tokens_for(user))


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ProfileView(APIView):
    """View or update non-sensitive profile fields (name, phone)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


# ---- OTP-gated credential changes ---------------------------------------

class _AuthedPost(APIView):
    permission_classes = [permissions.IsAuthenticated]
    request_serializer = None

    def _validated(self, request):
        s = self.request_serializer(data=request.data, context={"request": request})
        s.is_valid(raise_exception=True)
        return s.validated_data


class ChangePasswordRequestView(_AuthedPost):
    request_serializer = ChangePasswordRequestSerializer

    def post(self, request):
        self._validated(request)
        issue_and_send(request.user, "change_password")
        return Response({"detail": "Enter the code we emailed you to confirm the change."})


class ChangePasswordConfirmView(_AuthedPost):
    request_serializer = ChangePasswordConfirmSerializer

    def post(self, request):
        data = self._validated(request)
        otp = verify_code(request.user, "change_password", data["code"])
        otp.consume()
        request.user.set_password(data["new_password"])
        request.user.save(update_fields=["password"])
        return Response(tokens_for(request.user))


class ChangeUsernameRequestView(_AuthedPost):
    request_serializer = ChangeUsernameRequestSerializer

    def post(self, request):
        data = self._validated(request)
        issue_and_send(request.user, "change_username", new_value=data["new_username"])
        return Response({"detail": "Enter the code we emailed you to confirm the change."})


class ChangeUsernameConfirmView(_AuthedPost):
    request_serializer = CodeOnlySerializer

    def post(self, request):
        data = self._validated(request)
        otp = verify_code(request.user, "change_username", data["code"])
        if not otp.new_value:
            return Response({"code": "Nothing to apply. Request a new code."}, status=400)
        otp.consume()
        request.user.username = otp.new_value
        request.user.save(update_fields=["username"])
        return Response(tokens_for(request.user))


class ChangeEmailRequestView(_AuthedPost):
    request_serializer = ChangeEmailRequestSerializer

    def post(self, request):
        data = self._validated(request)
        issue_and_send(request.user, "change_email", new_value=data["new_email"])
        return Response({"detail": "Enter the code we sent to your new email address."})


class ChangeEmailConfirmView(_AuthedPost):
    request_serializer = CodeOnlySerializer

    def post(self, request):
        data = self._validated(request)
        otp = verify_code(request.user, "change_email", data["code"])
        if not otp.new_value:
            return Response({"code": "Nothing to apply. Request a new code."}, status=400)
        otp.consume()
        request.user.email = otp.new_value
        request.user.email_verified = True
        request.user.save(update_fields=["email", "email_verified"])
        return Response(tokens_for(request.user))
