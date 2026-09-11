from django.urls import path

from .views import (
    ChangeEmailConfirmView,
    ChangeEmailRequestView,
    ChangePasswordConfirmView,
    ChangePasswordRequestView,
    ChangeUsernameConfirmView,
    ChangeUsernameRequestView,
    LoginView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfileView,
    RegisterView,
    ResendVerificationView,
    VerifyEmailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", ProfileView.as_view(), name="profile"),

    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),

    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),

    path("change-password/request/", ChangePasswordRequestView.as_view(), name="change-password-request"),
    path("change-password/confirm/", ChangePasswordConfirmView.as_view(), name="change-password-confirm"),

    path("change-username/request/", ChangeUsernameRequestView.as_view(), name="change-username-request"),
    path("change-username/confirm/", ChangeUsernameConfirmView.as_view(), name="change-username-confirm"),

    path("change-email/request/", ChangeEmailRequestView.as_view(), name="change-email-request"),
    path("change-email/confirm/", ChangeEmailConfirmView.as_view(), name="change-email-confirm"),
]
