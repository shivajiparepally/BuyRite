from rest_framework import viewsets

from catalog.permissions import IsAdminOrReadOnly
from .models import Promotion
from .serializers import PromotionSerializer


class PromotionViewSet(viewsets.ModelViewSet):
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Promotion.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs
