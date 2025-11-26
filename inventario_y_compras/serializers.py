from rest_framework import serializers
from .models import (
    Proveedor, Almacen, Insumo, MovimientoInventario, OrdenCompra, DetalleOrdenCompra
)
from decimal import Decimal


class ProveedorSerializer(serializers.ModelSerializer):
    """Serializer para Proveedor (CU20: Gestionar proveedores)"""
    class Meta:
        model = Proveedor
        fields = [
            'id_proveedor', 'nombre', 'nit', 'telefono',
            'email', 'direccion', 'estado',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id_proveedor', 'created_at', 'updated_at']


class AlmacenSerializer(serializers.ModelSerializer):
    """Serializer para Almacen (CU21: Gestionar almacenes)"""
    class Meta:
        model = Almacen
        fields = [
            'id_almacen', 'nombre', 'ubicacion', 'estado',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id_almacen', 'created_at', 'updated_at']


class InsumoSerializer(serializers.ModelSerializer):
    """Serializer para Insumo (CU18: Gestionar insumos)"""
    necesita_reposicion = serializers.SerializerMethodField()
    
    class Meta:
        model = Insumo
        fields = [
            'id_insumo', 'codigo', 'nombre', 'descripcion', 'categoria',
            'unidad_medida', 'stock_actual', 'stock_minimo', 'stock_maximo',
            'precio_unitario', 'proveedor', 'ubicacion', 'fecha_vencimiento',
            'estado', 'created_at', 'updated_at', 'necesita_reposicion'
        ]
        read_only_fields = ['id_insumo', 'created_at', 'updated_at']
    
    def get_necesita_reposicion(self, obj):
        return obj.necesita_reposicion()


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    """Serializer para MovimientoInventario (CU19: Registrar consumo en atención)"""
    insumo_nombre = serializers.CharField(source='id_insumo.nombre', read_only=True)
    responsable_nombre = serializers.CharField(source='responsable.nombre', read_only=True)
    
    class Meta:
        model = MovimientoInventario
        fields = [
            'id_movimiento', 'id_insumo', 'tipo_movimiento', 'cantidad',
            'stock_anterior', 'stock_posterior', 'id_atencion', 'id_procedimiento',
            'motivo', 'responsable', 'fecha_movimiento', 'created_at',
            'insumo_nombre', 'responsable_nombre'
        ]
        read_only_fields = ['id_movimiento', 'stock_anterior', 'stock_posterior', 'created_at']


class DetalleOrdenCompraSerializer(serializers.ModelSerializer):
    """Serializer para DetalleOrdenCompra"""
    insumo_nombre = serializers.CharField(source='id_insumo.nombre', read_only=True)
    
    class Meta:
        model = DetalleOrdenCompra
        fields = [
            'id_detalle', 'id_orden', 'id_insumo', 'cantidad',
            'precio_unitario', 'subtotal', 'cantidad_recibida',
            'insumo_nombre'
        ]
        read_only_fields = ['id_detalle', 'subtotal']


class OrdenCompraSerializer(serializers.ModelSerializer):
    """Serializer para OrdenCompra (CU18: Gestionar insumos - compras)"""
    detalles = DetalleOrdenCompraSerializer(many=True, read_only=True)
    created_by_nombre = serializers.CharField(source='created_by.nombre', read_only=True)
    
    class Meta:
        model = OrdenCompra
        fields = [
            'id_orden', 'numero_orden', 'proveedor', 'fecha_orden',
            'fecha_entrega_estimada', 'fecha_entrega_real', 'estado',
            'subtotal', 'impuestos', 'total', 'observaciones',
            'created_by', 'created_at', 'updated_at',
            'detalles', 'created_by_nombre'
        ]
        read_only_fields = ['id_orden', 'created_at', 'updated_at']
