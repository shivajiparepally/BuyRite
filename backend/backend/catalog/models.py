from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    The "parent" item, e.g. Jack Daniel's Old No. 7.
    Actual price/stock/SKU live on ProductVariant, since a single product
    can come in multiple sizes.
    """

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=150)
    # Optional per-product description. Admin's choice whether to fill it in;
    # the frontend hides this field entirely on a product with no description.
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    """
    A specific sellable size of a Product, e.g. 750ml, 1L, 1.75L.
    Each variant has its own SKU, price, optional sale price, and stock.
    """

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    size = models.CharField(max_length=40, help_text="e.g. 750ml, 1L, 12-pack")
    sku = models.CharField(max_length=40, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    sale_price = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="If set, this is the price actually charged; `price` is shown crossed out.",
    )
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["price"]

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def current_price(self):
        return self.sale_price if self.sale_price is not None else self.price

    def __str__(self):
        return f"{self.product.name} ({self.size})"
