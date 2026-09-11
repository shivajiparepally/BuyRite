from django.db import models

DAY_CHOICES = [
    (0, "Sunday"), (1, "Monday"), (2, "Tuesday"), (3, "Wednesday"),
    (4, "Thursday"), (5, "Friday"), (6, "Saturday"),
]


class StoreHours(models.Model):
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES, unique=True)
    open_time = models.TimeField(default="09:00")
    close_time = models.TimeField(default="20:00")
    is_closed = models.BooleanField(default=False)

    class Meta:
        ordering = ["day_of_week"]
        verbose_name_plural = "Store hours"

    def __str__(self):
        return dict(DAY_CHOICES)[self.day_of_week]
