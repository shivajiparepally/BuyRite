from rest_framework import serializers

from .emails import send_otp_email
from .models import EmailOTP


def issue_and_send(user, purpose, new_value="", to_email=None):
    """Mint a fresh OTP for user+purpose and email it (to new_value's address
    for change_email, otherwise the account email unless overridden)."""
    otp = EmailOTP.issue(user, purpose, new_value=new_value)
    recipient = to_email or (new_value if purpose == "change_email" else user.email)
    if recipient:
        send_otp_email(recipient, otp.code, purpose)
    return otp


def verify_code(user, purpose, code):
    """Return the matching open OTP, or raise ValidationError. Wrong guesses
    burn an attempt; the code is consumed by the caller on full success."""
    otp = (
        EmailOTP.objects.filter(user=user, purpose=purpose, consumed_at__isnull=True)
        .order_by("-created_at")
        .first()
    )
    if otp is None:
        raise serializers.ValidationError({"code": "No active code. Request a new one."})
    if otp.is_expired:
        raise serializers.ValidationError({"code": "This code has expired. Request a new one."})
    if otp.attempts >= 5:
        raise serializers.ValidationError({"code": "Too many attempts. Request a new one."})
    if str(code).strip() != otp.code:
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        raise serializers.ValidationError({"code": "Incorrect code."})
    return otp
