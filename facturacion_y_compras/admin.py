from django.contrib import admin
from .models import (
    Factura, DetalleFactura, Pago, Recibo
)


@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ('numero_factura', 'id_paciente', 'fecha_emision', 'estado', 'total', 'saldo_pendiente')
    list_filter = ('estado', 'fecha_emision', 'metodo_pago')
    search_fields = ('numero_factura', 'id_paciente__nombre')
    date_hierarchy = 'fecha_emision'

    def delete_model(self, request, obj):
        # Asegura que los pagos asociados se eliminen al borrar una factura desde el admin
        Pago.objects.filter(id_factura=obj).delete()
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        # Maneja el borrado masivo desde la acción "Eliminar seleccionados"
        Pago.objects.filter(id_factura__in=queryset).delete()
        super().delete_queryset(request, queryset)

@admin.register(DetalleFactura)
class DetalleFacturaAdmin(admin.ModelAdmin):
    list_display = ('id_detalle', 'id_factura', 'concepto', 'cantidad', 'precio_unitario', 'subtotal')
    search_fields = ('concepto',)

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id_pago', 'id_factura', 'fecha_pago', 'monto', 'metodo_pago')
    list_filter = ('metodo_pago', 'fecha_pago')
    search_fields = ('id_factura__numero_factura', 'numero_referencia')
    date_hierarchy = 'fecha_pago'

@admin.register(Recibo)
class ReciboAdmin(admin.ModelAdmin):
    list_display = ('numero_recibo', 'id_paciente', 'fecha_emision')
    search_fields = ('numero_recibo', 'id_paciente__nombre')
    date_hierarchy = 'fecha_emision'
