# Generated migration for demo data

from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_demo_data(apps, schema_editor):
    """Create demo user and sample loaders"""
    
    # Create admin user
    User = apps.get_model('auth', 'User')
    
    # Delete existing admin if exists
    User.objects.filter(username='admin').delete()
    
    admin = User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='admin',
        first_name='Администратор',
        last_name='Системы',
        is_staff=True,
        is_superuser=True
    )
    
    # Create sample loaders
    Loader = apps.get_model('loader', 'Loader')
    
    loaders_data = [
        {
            'code': '0001',
            'brand': 'Амкадор',
            'number': '45-Б5 РН-1',
            'capacity': 2.500,
            'is_active': True,
        },
        {
            'code': '0002',
            'brand': 'Toyota',
            'number': '11-Б9 ЩЗ-1',
            'capacity': 3.125,
            'is_active': True,
        },
        {
            'code': '0003',
            'brand': 'Linde',
            'number': '22-В7 ГП-2',
            'capacity': 1.800,
            'is_active': True,
        },
        {
            'code': '0004',
            'brand': 'Komatsu',
            'number': '33-А4 СК-3',
            'capacity': 5.000,
            'is_active': False,
        },
        {
            'code': '0005',
            'brand': 'Caterpillar',
            'number': '44-Г8 ПГ-4',
            'capacity': 4.500,
            'is_active': True,
        },
    ]
    
    for loader_data in loaders_data:
        Loader.objects.create(
            **loader_data,
            created_by=admin
        )
    
    # Create sample downtimes
    Downtime = apps.get_model('loader', 'Downtime')
    from datetime import datetime, timedelta
    from django.utils import timezone
    
    loader = Loader.objects.filter(number='45-Б5 РН-1').first()
    if loader:
        now = timezone.now()
        Downtime.objects.create(
            loader=loader,
            start_time=now - timedelta(hours=2),
            end_time=now - timedelta(minutes=30),
            duration='1ч 30 мин',
            reason='Замена гидравлического масла'
        )
        Downtime.objects.create(
            loader=loader,
            start_time=now - timedelta(days=1),
            end_time=now - timedelta(days=1, hours=3),
            duration='3ч 00 мин',
            reason='Плановое ТО'
        )


def remove_demo_data(apps, schema_editor):
    """Remove demo data"""
    User = apps.get_model('auth', 'User')
    Loader = apps.get_model('loader', 'Loader')
    Downtime = apps.get_model('loader', 'Downtime')
    
    Downtime.objects.all().delete()
    Loader.objects.all().delete()
    User.objects.filter(username='admin').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('loader', '0002_alter_loader_options_loader_code_loader_created_by_and_more'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_demo_data, remove_demo_data),
    ]
