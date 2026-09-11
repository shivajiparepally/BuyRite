from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Category, Product, ProductVariant
from .permissions import IsAdminOrReadOnly
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ProductWriteSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    """
    Public: GET /api/catalog/products/?category=<id>&search=<text>
    Admin:  POST/PATCH/DELETE to manage the catalog.

    NOTE: bulk CSV import is not implemented yet — this is where a future
    `import_csv` action will live once the CSV format is finalized.
    """

    queryset = Product.objects.select_related("category").prefetch_related("variants").all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category"]
    search_fields = ["name"]

    def get_serializer_class(self):
        if self.request.method in ("POST", "PUT", "PATCH"):
            return ProductWriteSerializer
        return ProductSerializer


class ProductVariantViewSet(viewsets.ModelViewSet):
    """Lets admin edit price / sale price / stock per variant directly."""

    queryset = ProductVariant.objects.select_related("product").all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["product"]
