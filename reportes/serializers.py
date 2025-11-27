from rest_framework import serializers
from .models import ReporteFinanciero, ReporteClinico, ReporteDefault, MetaReporte


class ReporteFinancieroSerializer(serializers.ModelSerializer):
    """Serializer para ReporteFinanciero (CU26: Reporte financiero)"""
    generado_por_nombre = serializers.StringRelatedField(
        source='generado_por',
        read_only=True
    )

    class Meta:
        model = ReporteFinanciero
        fields = [
            'id_reporte',
            'titulo',
            'fecha_inicio',
            'fecha_fin',
            'total_ingresos',
            'cantidad_facturas',
            'total_egresos',
            'cantidad_compras',
            'balance_neto',
            'detalles_por_procedimiento',
            'detalles_por_insumo',
            'generado_por',
            'generado_por_nombre',
            'estado',
            'mensaje_error',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id_reporte',
            'total_ingresos',
            'cantidad_facturas',
            'total_egresos',
            'cantidad_compras',
            'balance_neto',
            'estado',
            'mensaje_error',
            'created_at',
            'updated_at'
        ]


class ReporteClinicoSerializer(serializers.ModelSerializer):
    """Serializer para ReporteClinico (CU27: Reporte clínico y de citas)"""
    generado_por_nombre = serializers.StringRelatedField(
        source='generado_por',
        read_only=True
    )
    odontologo_nombre = serializers.CharField(
        source='id_odontologo.nombre',
        read_only=True
    )

    class Meta:
        model = ReporteClinico
        fields = [
            'id_reporte',
            'titulo',
            'fecha_inicio',
            'fecha_fin',
            'id_odontologo',
            'odontologo_nombre',
            'tipo_cita',
            'total_citas',
            'citas_completadas',
            'citas_canceladas',
            'citas_reprogramadas',
            'total_atenciones',
            'tiempo_promedio_atencion',
            'total_procedimientos',
            'procedimientos_por_tipo',
            'total_pacientes_atendidos',
            'pacientes_nuevos',
            'pacientes_recurrentes',
            'generado_por',
            'generado_por_nombre',
            'estado',
            'mensaje_error',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id_reporte',
            'total_citas',
            'citas_completadas',
            'citas_canceladas',
            'citas_reprogramadas',
            'total_atenciones',
            'tiempo_promedio_atencion',
            'total_procedimientos',
            'procedimientos_por_tipo',
            'total_pacientes_atendidos',
            'pacientes_nuevos',
            'pacientes_recurrentes',
            'estado',
            'mensaje_error',
            'created_at',
            'updated_at'
        ]


class ReporteDefaultSerializer(serializers.ModelSerializer):
    """Serializer para ReporteDefault (Bitácora de acciones)"""
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True
    )

    class Meta:
        model = ReporteDefault
        fields = [
            'id_registro',
            'usuario',
            'usuario_nombre',
            'tipo_accion',
            'modulo',
            'objeto_tipo',
            'objeto_id',
            'descripcion',
            'datos_anteriores',
            'datos_nuevos',
            'direccion_ip',
            'user_agent',
            'fecha_hora',
            'estado',
            'mensaje_error'
        ]
        read_only_fields = [
            'id_registro',
            'fecha_hora'
        ]


class MetaReporteSerializer(serializers.ModelSerializer):
    """Serializer para MetaReporte (Búsqueda y filtrado)"""

    class Meta:
        model = MetaReporte
        fields = [
            'id_meta',
            'tipo_reporte',
            'objeto_id',
            'palabras_clave',
            'etiquetas',
            'descripcion_indexada',
            'fecha_inicio',
            'fecha_fin',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id_meta',
            'created_at',
            'updated_at'
        ]
