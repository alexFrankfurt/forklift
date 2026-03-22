from django.contrib import admin
from .models import Loader, Downtime


@admin.register(Loader)
class LoaderAdmin(admin.ModelAdmin):
    list_display = ['code', 'brand', 'number', 'capacity', 'is_active', 'updated_at']
    list_filter = ['is_active', 'brand']
    search_fields = ['brand', 'number']
    readonly_fields = ['code', 'created_at', 'updated_at']


@admin.register(Downtime)
class DowntimeAdmin(admin.ModelAdmin):
    list_display = ['loader', 'start_time', 'end_time', 'duration', 'reason']
    list_filter = ['loader']
    search_fields = ['loader__number', 'reason']
