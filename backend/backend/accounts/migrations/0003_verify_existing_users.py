from django.db import migrations


def mark_existing_verified(apps, schema_editor):
    """Grandfather in every account that existed before email verification:
    only NEW registrations should have to verify."""
    User = apps.get_model("accounts", "User")
    User.objects.update(email_verified=True)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_user_email_verified_emailotp"),
    ]

    operations = [
        migrations.RunPython(mark_existing_verified, noop),
    ]
