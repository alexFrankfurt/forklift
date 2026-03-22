from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoaderViewSet, DowntimeViewSet

router = DefaultRouter()
router.register(r'', LoaderViewSet, basename='loader')

urlpatterns = [
    path('', include(router.urls)),
]
