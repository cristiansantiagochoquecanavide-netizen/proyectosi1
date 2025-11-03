from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AtencionViewSet, ProcedimientoViewSet, OdontogramaViewSet,
    PiezaDentalViewSet, TratamientoViewSet
)

router = DefaultRouter()
router.register(r'atenciones', AtencionViewSet, basename='atencion')
router.register(r'procedimientos', ProcedimientoViewSet, basename='procedimiento')
router.register(r'odontogramas', OdontogramaViewSet, basename='odontograma')
router.register(r'piezas-dentales', PiezaDentalViewSet, basename='pieza-dental')
router.register(r'tratamientos', TratamientoViewSet, basename='tratamiento')

urlpatterns = [
    path('', include(router.urls)),
]
