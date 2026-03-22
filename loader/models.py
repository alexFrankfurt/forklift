from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Loader(models.Model):
    """
    Справочник погрузчиков (Loader Directory)
    """
    code = models.CharField(max_length=50, verbose_name='Код записи', blank=True)
    brand = models.CharField(max_length=255, verbose_name='Марка')
    number = models.CharField(max_length=100, verbose_name='Номер')
    capacity = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        verbose_name='Грузоподъемность'
    )
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Пользователь'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Время изменения')

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Погрузчик'
        verbose_name_plural = 'Погрузчики'

    def __str__(self):
        return f'{self.brand} - {self.number}'

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(self.pk or '1').zfill(4)
        super().save(*args, **kwargs)


class Downtime(models.Model):
    """
    Простои по погрузчику (Loader Downtime)
    """
    loader = models.ForeignKey(
        Loader,
        on_delete=models.CASCADE,
        related_name='downtimes',
        verbose_name='Погрузчик'
    )
    start_time = models.DateTimeField(verbose_name='Начало')
    end_time = models.DateTimeField(verbose_name='Окончание')
    duration = models.CharField(max_length=50, verbose_name='Время простоя')
    reason = models.TextField(verbose_name='Причина')

    class Meta:
        ordering = ['-start_time']
        verbose_name = 'Простой'
        verbose_name_plural = 'Простои'

    def __str__(self):
        return f'{self.loader.number} - {self.start_time}'
