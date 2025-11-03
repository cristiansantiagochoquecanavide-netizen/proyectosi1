from rest_framework import serializers
from .models import (
    Atencion, Procedimiento, Odontograma, PiezaDental,
    Tratamiento, TratamientoAtencion
)
from citas.models import Odontologo
from pacientes.models import Paciente


class ProcedimientoSerializer(serializers.ModelSerializer):
    """Serializer para Procedimiento (CU12: Registrar procedimientos en atención)"""
    class Meta:
        model = Procedimiento
        fields = [
            'id_procedimiento', 'id_atencion', 'nombre', 'descripcion',
            'pieza_dental', 'duracion_minutos', 'costo', 'created_at'
        ]
        read_only_fields = ['id_procedimiento', 'created_at']


class AtencionSerializer(serializers.ModelSerializer):
    """Serializer para Atencion (CU11: Iniciar atención desde cita)"""
    procedimientos = ProcedimientoSerializer(many=True, read_only=True)
    paciente_nombre = serializers.CharField(source='id_paciente.nombre', read_only=True)
    odontologo_nombre = serializers.CharField(source='id_odontologo.nombre', read_only=True)
    
    # Hacer estos campos opcionales en el input, se extraerán de la cita
    id_paciente = serializers.PrimaryKeyRelatedField(
        queryset=Paciente.objects.all(),
        required=False
    )
    id_odontologo = serializers.PrimaryKeyRelatedField(
        queryset=Odontologo.objects.all(),
        required=False
    )
    
    class Meta:
        model = Atencion
        fields = [
            'id_atencion', 'id_cita', 'id_paciente', 'id_odontologo',
            'fecha_inicio', 'fecha_fin', 'estado', 'observaciones_generales',
            'created_at', 'updated_at', 'procedimientos',
            'paciente_nombre', 'odontologo_nombre'
        ]
        read_only_fields = ['id_atencion', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """
        Al crear una atención, extrae automáticamente el paciente y odontólogo de la cita.
        El frontend solo necesita enviar id_cita y observaciones_generales.
        """
        id_cita = validated_data.get('id_cita')
        # Verificar si ya existe atención para esta cita
        if id_cita and hasattr(id_cita, 'atencion'):
            raise serializers.ValidationError({
                'id_cita': 'Ya existe una atención registrada para esta cita. Solo se permite una atención por cita.'
            })
        # Si no se proporcionaron id_paciente e id_odontologo, extraerlos de la cita
        if 'id_paciente' not in validated_data and id_cita:
            validated_data['id_paciente'] = id_cita.id_paciente
        if 'id_odontologo' not in validated_data and id_cita:
            if not id_cita.id_odontologo:
                raise serializers.ValidationError({
                    'id_cita': 'La cita seleccionada no tiene un odontólogo asignado.'
                })
            validated_data['id_odontologo'] = id_cita.id_odontologo
        return super().create(validated_data)


class PiezaDentalSerializer(serializers.ModelSerializer):
    """Serializer para PiezaDental (CU13: Actualizar odontograma)"""
    class Meta:
        model = PiezaDental
        fields = [
            'id_pieza', 'id_odontograma', 'numero_pieza', 'estado',
            'observaciones', 'cara_vestibular', 'cara_lingual',
            'cara_mesial', 'cara_distal', 'cara_oclusal'
        ]
        read_only_fields = ['id_pieza']


class OdontogramaSerializer(serializers.ModelSerializer):
    """Serializer para Odontograma (CU13: Actualizar odontograma)"""
    piezas = PiezaDentalSerializer(many=True, read_only=True)
    paciente_nombre = serializers.CharField(source='id_paciente.nombre', read_only=True)
    
    class Meta:
        model = Odontograma
        fields = [
            'id_odontograma', 'id_paciente', 'fecha_registro',
            'observaciones', 'created_at', 'updated_at',
            'piezas', 'paciente_nombre'
        ]
        read_only_fields = ['id_odontograma', 'created_at', 'updated_at']


class TratamientoAtencionSerializer(serializers.ModelSerializer):
    """Serializer para TratamientoAtencion"""
    class Meta:
        model = TratamientoAtencion
        fields = ['id_tratamiento', 'id_atencion', 'orden', 'observaciones']


class TratamientoSerializer(serializers.ModelSerializer):
    """Serializer para Tratamiento (CU15: Gestionar tratamientos)"""
    atenciones_relacionadas = TratamientoAtencionSerializer(many=True, read_only=True)
    paciente_nombre = serializers.CharField(source='id_paciente.nombre', read_only=True)
    odontologo_nombre = serializers.CharField(source='id_odontologo.nombre', read_only=True)
    
    class Meta:
        model = Tratamiento
        fields = [
            'id_tratamiento', 'id_paciente', 'id_odontologo', 'nombre',
            'descripcion', 'fecha_inicio', 'fecha_fin_estimada', 'fecha_fin_real',
            'estado', 'costo_estimado', 'costo_real', 'observaciones',
            'created_at', 'updated_at', 'atenciones_relacionadas',
            'paciente_nombre', 'odontologo_nombre'
        ]
        read_only_fields = ['id_tratamiento', 'created_at', 'updated_at']
