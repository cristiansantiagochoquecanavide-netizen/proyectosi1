from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InsumoViewSet, MovimientoInventarioViewSet,
    OrdenCompraViewSet, DetalleOrdenCompraViewSet
)

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet, basename='insumo')
router.register(r'movimientos', MovimientoInventarioViewSet, basename='movimiento')
router.register(r'ordenes-compra', OrdenCompraViewSet, basename='orden-compra')
router.register(r'detalles-orden', DetalleOrdenCompraViewSet, basename='detalle-orden')

urlpatterns = [
    path('', include(router.urls)),
]
