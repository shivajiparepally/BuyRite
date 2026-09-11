from rest_framework.routers import DefaultRouter

from .views import StoreHoursViewSet

router = DefaultRouter()
router.register("", StoreHoursViewSet, basename="storehours")

urlpatterns = router.urls
