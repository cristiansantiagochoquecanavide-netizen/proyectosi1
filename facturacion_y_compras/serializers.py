from rest_framework import serializers
from .models import (
    Factura, DetalleFactura, Pago, Recibo
)


class DetalleFacturaSerializer(serializers.ModelSerializer):
    """Serializer para DetalleFactura"""
    class Meta:
        model = DetalleFactura
        fields = [
            'id_detalle', 'id_factura', 'concepto', 'cantidad',
            'precio_unitario', 'subtotal', 'id_procedimiento'
        ]
        read_only_fields = ['id_detalle', 'subtotal']


class FacturaSerializer(serializers.ModelSerializer):
    """Serializer para Factura (CU14: Cerrar atención y emitir comprobante)"""
    detalles = DetalleFacturaSerializer(many=True, read_only=True)
    paciente_nombre = serializers.CharField(source='id_paciente.nombre', read_only=True)
    emitida_por_nombre = serializers.CharField(source='emitida_por.nombre', read_only=True)
    
    class Meta:
        model = Factura
        fields = [
            'id_factura', 'numero_factura', 'id_atencion', 'id_paciente',
            'fecha_emision', 'fecha_vencimiento', 'subtotal', 'descuento',
            'impuestos', 'total', 'saldo_pendiente', 'estado', 'metodo_pago',
            'observaciones', 'emitida_por', 'created_at', 'updated_at',
            'detalles', 'paciente_nombre', 'emitida_por_nombre'
        ]
        read_only_fields = ['id_factura', 'saldo_pendiente', 'created_at', 'updated_at']
        extra_kwargs = {
            'id_atencion': {'required': False, 'allow_null': True},
            'numero_factura': {'required': False},
        }


class PagoSerializer(serializers.ModelSerializer):
    """Serializer para Pago"""
    factura_numero = serializers.CharField(source='id_factura.numero_factura', read_only=True)
    recibido_por_nombre = serializers.CharField(source='recibido_por.nombre', read_only=True)
    
    class Meta:
        model = Pago
        fields = [
            'id_pago', 'id_factura', 'fecha_pago', 'monto', 'metodo_pago',
            'numero_referencia', 'observaciones', 'recibido_por', 'created_at',
            'factura_numero', 'recibido_por_nombre'
        ]
        read_only_fields = ['id_pago', 'created_at']


class ReciboSerializer(serializers.ModelSerializer):
    """Serializer para Recibo"""
    pago_monto = serializers.DecimalField(source='id_pago.monto', max_digits=10, decimal_places=2, read_only=True)
    paciente_nombre = serializers.CharField(source='id_paciente.nombre', read_only=True)
    
    class Meta:
        model = Recibo
        fields = [
            'id_recibo', 'numero_recibo', 'id_pago', 'id_paciente',
            'fecha_emision', 'observaciones', 'pago_monto', 'paciente_nombre'
        ]
        read_only_fields = ['id_recibo']
