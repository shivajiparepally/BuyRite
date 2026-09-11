from django.contrib import admin

from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_active", "position")
    list_editable = ("is_active", "position")
