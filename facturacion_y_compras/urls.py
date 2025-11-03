from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FacturaViewSet, DetalleFacturaViewSet, PagoViewSet, ReciboViewSet
)

router = DefaultRouter()
router.register(r'facturas', FacturaViewSet, basename='factura')
router.register(r'detalles-factura', DetalleFacturaViewSet, basename='detalle-factura')
router.register(r'pagos', PagoViewSet, basename='pago')
router.register(r'recibos', ReciboViewSet, basename='recibo')

urlpatterns = [
    path('', include(router.urls)),
]
