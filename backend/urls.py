"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin  # Admin de Django
from django.urls import path, include  # include permite enrutar hacia las apps
from django.conf import settings
from django.conf.urls.static import static
from .views import csrf_token

urlpatterns = [  # Rutas a nivel de proyecto
    path('admin/', admin.site.urls),  # Panel admin
    path('citas/', include('citas.urls')),  # Incluye rutas de citas
    path('pacientes/', include('pacientes.urls')),  # Incluye rutas de pacientes
    path('seguridad/', include('seguridad_y_personal.urls')),  # Incluye rutas de seguridad
    path('csrf/', csrf_token, name='csrf'),  # Endpoint para obtener cookie/token CSRF
]

# Servir archivos de MEDIA en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

