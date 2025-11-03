from django.contrib import admin
from .models import (
    Insumo, MovimientoInventario, OrdenCompra, DetalleOrdenCompra
)

@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'categoria', 'stock_actual', 'stock_minimo', 'estado')
    list_filter = ('categoria', 'estado')
    search_fields = ('codigo', 'nombre', 'proveedor')

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ('id_movimiento', 'id_insumo', 'tipo_movimiento', 'cantidad', 'fecha_movimiento')
    list_filter = ('tipo_movimiento', 'fecha_movimiento')
    search_fields = ('id_insumo__nombre', 'motivo')
    date_hierarchy = 'fecha_movimiento'

@admin.register(OrdenCompra)
class OrdenCompraAdmin(admin.ModelAdmin):
    list_display = ('numero_orden', 'proveedor', 'fecha_orden', 'estado', 'total')
    list_filter = ('estado', 'fecha_orden')
    search_fields = ('numero_orden', 'proveedor')
    date_hierarchy = 'fecha_orden'

@admin.register(DetalleOrdenCompra)
class DetalleOrdenCompraAdmin(admin.ModelAdmin):
    list_display = ('id_detalle', 'id_orden', 'id_insumo', 'cantidad', 'precio_unitario', 'subtotal')
    search_fields = ('id_insumo__nombre',)
