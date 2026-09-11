from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ProductViewSet, ProductVariantViewSet, ProductImageUploadView

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("variants", ProductVariantViewSet, basename="variant")

urlpatterns = [
    path("upload-image/", ProductImageUploadView.as_view(), name="product-image-upload"),
] + router.urls
