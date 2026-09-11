from django.db import models

from catalog.models import Category, Product


class Promotion(models.Model):
    """A homepage carousel banner that links to a category (clearance, sale, etc.)."""

    title = models.CharField(max_length=80)
    subtitle = models.CharField(max_length=140, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="promotions")
    products = models.ManyToManyField(
        Product, blank=True, related_name="promotions",
        help_text="Specific products this promotion applies to (optional).",
    )
    is_active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=0, help_text="Lower numbers show first.")

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return self.title
