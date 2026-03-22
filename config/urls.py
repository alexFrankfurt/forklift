"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from loader.views import loader_page, login_view, logout_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('loader.api_urls')),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('', loader_page, name='loader-page'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
