from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "status", "schedule", "is_archived", "created_at")
    list_filter = ("status", "schedule", "is_archived")
    inlines = [OrderItemInline]
