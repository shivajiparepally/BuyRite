import uuid

from django.core.files.storage import default_storage
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product, ProductVariant
from .permissions import IsAdminOrReadOnly
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ProductWriteSerializer,
)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB


class ProductImageUploadView(APIView):
    """
    Admin-only: POST a multipart file under the "image" key, get back
    {"image_url": "<absolute url>"} to store on a product.
    """

    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser]

    def post(self, request):
        f = request.FILES.get("image")
        if not f:
            return Response({"detail": "No file uploaded under 'image'."}, status=400)
        if f.content_type not in ALLOWED_IMAGE_TYPES:
            return Response({"detail": "Unsupported file type. Use JPEG, PNG, WEBP, or GIF."}, status=400)
        if f.size > MAX_IMAGE_BYTES:
            return Response({"detail": "Image is too large (8MB max)."}, status=400)

        ext = f.name.rsplit(".", 1)[-1].lower() if "." in f.name else "jpg"
        path = default_storage.save(f"products/{uuid.uuid4().hex}.{ext}", f)
        url = request.build_absolute_uri(default_storage.url(path))
        return Response({"image_url": url}, status=201)


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
