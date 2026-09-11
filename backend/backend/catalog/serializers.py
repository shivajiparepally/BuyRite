from rest_framework import serializers

from .models import Category, Product, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductVariantSerializer(serializers.ModelSerializer):
    in_stock = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = [
            "id", "product", "size", "sku", "price", "sale_price",
            "stock", "in_stock", "current_price",
        ]


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "category", "category_name", "name", "description",
            "image_url", "variants",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    """Used by the admin panel to create/update a product's own fields.
    Variants are created/edited through ProductVariantViewSet."""

    class Meta:
        model = Product
        fields = ["id", "category", "name", "description", "image_url"]
