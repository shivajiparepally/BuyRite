from rest_framework import serializers

from catalog.models import ProductVariant
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            "id", "product_variant", "product_name", "size", "unit_price",
            "quantity", "substitution_choice", "line_total",
        ]


class OrderItemCreateSerializer(serializers.Serializer):
    product_variant = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    substitution_choice = serializers.ChoiceField(
        choices=["substitute", "call"], required=False, allow_null=True
    )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone_number", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "customer", "customer_username", "customer_phone", "status", "schedule",
            "is_archived", "created_at", "updated_at", "items", "total",
        ]
        read_only_fields = ["customer", "status", "is_archived", "created_at", "updated_at"]


class OrderCreateSerializer(serializers.Serializer):
    """
    Body: { "schedule": "today" | "tomorrow", "items": [{product_variant, quantity, substitution_choice?}] }
    Out-of-stock variants REQUIRE a substitution_choice — this is enforced here,
    not just on the frontend, so the rule holds even if someone calls the API directly.
    """

    schedule = serializers.ChoiceField(choices=["today", "tomorrow"])
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Cart is empty.")
        for item in items:
            variant = item["product_variant"]
            if variant.stock == 0 and not item.get("substitution_choice"):
                raise serializers.ValidationError(
                    f"'{variant.product.name}' ({variant.size}) is out of stock and needs a substitution choice."
                )
        return items

    def create(self, validated_data):
        customer = self.context["request"].user
        order = Order.objects.create(customer=customer, schedule=validated_data["schedule"])
        for item in validated_data["items"]:
            variant = item["product_variant"]
            OrderItem.objects.create(
                order=order,
                product_variant=variant,
                product_name=variant.product.name,
                size=variant.size,
                unit_price=variant.current_price,
                quantity=item["quantity"],
                substitution_choice=item.get("substitution_choice"),
            )
        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]
