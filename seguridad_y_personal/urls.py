from django.urls import path, include  # Importa el sistema de rutas por path y la inclusión de otras rutas
from rest_framework.routers import DefaultRouter  # Importa el enrutador por defecto de DRF
from . import views  # Importa las vistas locales

# Configuración del enrutador
router = DefaultRouter()
router.register(r'roles', views.RolViewSet)  # Registra el ViewSet de roles
router.register(r'usuarios', views.UsuarioViewSet)  # Registra el ViewSet de usuarios
router.register(r'usuarios_roles', views.UsuarioRolViewSet)  # Registra el ViewSet de usuarios_roles
router.register(r'bitacoras', views.BitacoraViewSet)  # Registra el ViewSet de bitacoras

urlpatterns = [  # Lista de rutas de esta app
    path('login/', views.iniciar_sesion, name='login'),  # URL para iniciar sesión
    path('logout/', views.cerrar_sesion, name='logout'),  # URL para cerrar sesión

    # Usuarios
    path('usuarios/', views.listado_usuarios, name='listado_usuarios'),  # Lista usuarios
    path('usuarios/crear/', views.crear_usuario, name='crear_usuario'),  # Crear usuario
    path('usuarios/editar/<int:id_usuario>/', views.editar_usuario, name='editar_usuario'),  # Editar usuario
    path('usuarios/eliminar/<int:id_usuario>/', views.eliminar_usuario, name='eliminar_usuario'),  # Eliminar usuario

    # Roles
    path('roles/', views.listado_roles, name='listado_roles'),  # Lista roles
    path('roles/crear/', views.crear_rol, name='crear_rol'),  # Crear rol

    # API
    path('api/', include(router.urls)),  # Incluye las rutas de la API
]
