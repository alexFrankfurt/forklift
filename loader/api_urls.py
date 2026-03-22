from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoaderViewSet, DowntimeViewSet

router = DefaultRouter()
router.register(r'loaders', LoaderViewSet, basename='loader')
router.register(r'downtimes', DowntimeViewSet, basename='downtime')

urlpatterns = [
    path('', include(router.urls)),
]
