from django.contrib import admin

from .models import StoreHours


@admin.register(StoreHours)
class StoreHoursAdmin(admin.ModelAdmin):
    list_display = ("day_of_week", "open_time", "close_time", "is_closed")
    list_editable = ("open_time", "close_time", "is_closed")
