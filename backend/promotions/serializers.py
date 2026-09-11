from rest_framework import serializers

from catalog.models import Product
from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(many=True, queryset=Product.objects.all(), required=False)
    product_names = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = ["id", "title", "subtitle", "category", "products", "product_names", "is_active", "position"]

    def get_product_names(self, obj):
        return [p.name for p in obj.products.all()]
