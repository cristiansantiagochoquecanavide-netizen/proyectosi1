from django.urls import path, include  # Sistema de rutas
from rest_framework.routers import DefaultRouter
from . import views  # Vistas locales
from .views import PacienteViewSet, HistorialClinicaViewSet, ArchivoClinicoViewSet

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet)
router.register(r'historiales', HistorialClinicaViewSet)
router.register(r'archivos', ArchivoClinicoViewSet)

urlpatterns = [  # Conjunto de rutas de la app pacientes
    path('listar/', views.listado_pacientes, name='listado_pacientes'),  # Listar
    path('crear/', views.crear_paciente, name='crear_paciente'),  # Crear
    path('editar/<int:id_paciente>/', views.editar_paciente, name='editar_paciente'),  # Editar
    path('eliminar/<int:id_paciente>/', views.eliminar_paciente, name='eliminar_paciente'),  # Eliminar
    path('api/', include(router.urls)),
]
