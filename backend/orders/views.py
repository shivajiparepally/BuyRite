from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsConfiguredAdmin, is_configured_admin
from .models import Order
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    """
    Customers: can create orders and see only their own.
    Admin (is_staff): sees every order, can update status / archive / restore.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related("items")
        if is_configured_admin(user):
            return qs
        return qs.filter(customer=user)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=201)

    @action(detail=True, methods=["patch"], permission_classes=[IsConfiguredAdmin])
    def set_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsConfiguredAdmin])
    def archive(self, request, pk=None):
        order = self.get_object()
        order.is_archived = True
        order.save(update_fields=["is_archived"])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsConfiguredAdmin])
    def restore(self, request, pk=None):
        order = self.get_object()
        order.is_archived = False
        order.save(update_fields=["is_archived"])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsConfiguredAdmin])
    def cancel(self, request, pk=None):
        order = self.get_object()
        order.status = "cancelled"
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)
