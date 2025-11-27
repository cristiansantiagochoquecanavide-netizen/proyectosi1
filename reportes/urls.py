from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReporteFinancieroViewSet,
    ReporteClinicoViewSet,
    ReporteDefaultViewSet,
    MetaReporteViewSet
)

# Router para las rutas de la API REST
router = DefaultRouter()
router.register(r'financieros', ReporteFinancieroViewSet, basename='reporte-financiero')
router.register(r'clinicos', ReporteClinicoViewSet, basename='reporte-clinico')
router.register(r'default', ReporteDefaultViewSet, basename='reporte-default')
router.register(r'meta', MetaReporteViewSet, basename='meta-reporte')

# Incluir rutas del router
urlpatterns = [
    path('', include(router.urls)),
]
