from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Loader, Downtime
from .serializers import LoaderSerializer, DowntimeSerializer


def login_view(request):
    """Login page"""
    if request.user.is_authenticated:
        return redirect('loader-page')
    
    error = None
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('loader-page')
        else:
            error = 'Неверное имя пользователя или пароль'
    
    return render(request, 'loader/login.html', {'error': error})


def logout_view(request):
    """Logout view"""
    logout(request)
    return redirect('login')


@login_required(login_url='/login/')
def loader_page(request):
    """Main loader directory page"""
    return render(request, 'loader/loader_list.html', {'user': request.user})


class LoaderViewSet(viewsets.ModelViewSet):
    queryset = Loader.objects.all()
    serializer_class = LoaderSerializer

    def get_queryset(self):
        queryset = Loader.objects.all()
        number = self.request.query_params.get('number', None)
        if number:
            queryset = queryset.filter(number__icontains=number)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DowntimeViewSet(viewsets.ModelViewSet):
    queryset = Downtime.objects.all()
    serializer_class = DowntimeSerializer

    def get_queryset(self):
        queryset = Downtime.objects.all()
        loader_id = self.request.query_params.get('loader_id', None)
        if loader_id:
            queryset = queryset.filter(loader_id=loader_id)
        return queryset
