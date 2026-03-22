from rest_framework import serializers
from .models import Loader, Downtime


class LoaderSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Loader
        fields = ['id', 'code', 'brand', 'number', 'capacity', 'is_active', 
                  'created_by_name', 'updated_at', 'created_at']
        read_only_fields = ['code', 'created_at', 'updated_at']


class DowntimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Downtime
        fields = ['id', 'loader', 'start_time', 'end_time', 'duration', 'reason']
        read_only_fields = ['id']
