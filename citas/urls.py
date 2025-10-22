from django.urls import path, include  # Sistema de rutas
from rest_framework.routers import DefaultRouter
from . import views  # Vistas locales
from .views import OdontologoViewSet, CitaViewSet, DisponibilidadViewSet

router = DefaultRouter()
router.register(r'odontologos', OdontologoViewSet)
router.register(r'citas', CitaViewSet)
router.register(r'disponibilidades', DisponibilidadViewSet)

urlpatterns = [  # Rutas de citas
    path('listar/', views.listado_citas, name='listado_citas'),  # Listar
    path('crear/', views.crear_cita, name='crear_cita'),  # Crear
    path('editar/<int:id_cita>/', views.editar_cita, name='editar_cita'),  # Editar
    path('eliminar/<int:id_cita>/', views.eliminar_cita, name='eliminar_cita'),  # Eliminar
    path('api/', include(router.urls)),
]
