from django.conf import settings
from django.core.mail import send_mail

_SUBJECTS = {
    "register": "Verify your email",
    "password_reset": "Reset your password",
    "change_password": "Confirm your password change",
    "change_username": "Confirm your username change",
    "change_email": "Confirm your new email address",
}


def send_otp_email(to_email, code, purpose):
    """
    Send a one-time code. With the console email backend (the dev default)
    this prints the message to the backend terminal.
    """
    subject = _SUBJECTS.get(purpose, "Your verification code")
    body = (
        f"Your code is: {code}\n\n"
        f"Enter this in the app to {subject.lower()}.\n"
        f"It expires in 10 minutes. If you didn't request this, you can ignore this email.\n\n"
        f"— Buy Rite Renaissance Spirits"
    )
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False)
