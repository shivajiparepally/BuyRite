from rest_framework import viewsets

from catalog.permissions import IsAdminOrReadOnly
from .models import StoreHours
from .serializers import StoreHoursSerializer


class StoreHoursViewSet(viewsets.ModelViewSet):
    queryset = StoreHours.objects.all()
    serializer_class = StoreHoursSerializer
    permission_classes = [IsAdminOrReadOnly]
