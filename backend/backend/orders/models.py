from django.conf import settings
from django.db import models

from catalog.models import ProductVariant

STATUS_CHOICES = [
    ("new", "New"),
    ("preparing", "Preparing"),
    ("ready", "Ready"),
    ("completed", "Completed"),
    ("cancelled", "Cancelled"),
]

SCHEDULE_CHOICES = [
    ("today", "Today"),
    ("tomorrow", "Tomorrow"),
]

SUBSTITUTION_CHOICES = [
    ("substitute", "Store may substitute a similar item"),
    ("call", "Call customer before substituting"),
]


class Order(models.Model):
    """
    Pay-at-pickup order — no payment gateway yet. Orders are never hard
    deleted: cancel/archive/restore all just flip flags/status so nothing
    is ever lost.
    """

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    schedule = models.CharField(max_length=20, choices=SCHEDULE_CHOICES, default="today")
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def total(self):
        return sum(item.line_total for item in self.items.all())

    def __str__(self):
        return f"Order #{self.id} ({self.get_status_display()})"


class OrderItem(models.Model):
    """
    Snapshots product name/size/price at time of order, so the order stays
    accurate even if the product is later edited or removed from the catalog.
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_variant = models.ForeignKey(
        ProductVariant, on_delete=models.SET_NULL, null=True, related_name="order_items"
    )
    product_name = models.CharField(max_length=150)
    size = models.CharField(max_length=40)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    substitution_choice = models.CharField(
        max_length=20, choices=SUBSTITUTION_CHOICES, null=True, blank=True,
        help_text="Set only if this item was out of stock when ordered.",
    )

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.size})"
