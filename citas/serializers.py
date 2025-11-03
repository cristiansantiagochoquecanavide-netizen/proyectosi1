from rest_framework import serializers
from .models import Odontologo, Cita, Disponibilidad

class OdontologoSerializer(serializers.ModelSerializer):
    # Exponer matriculaProfesional en formato camelCase hacia el frontend
    matriculaProfesional = serializers.CharField(source='matricula_profesional', required=False, allow_blank=True)
    # Campos write-only para crear/actualizar el usuario de seguridad asociado
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    contrasena = serializers.CharField(write_only=True, required=False, allow_blank=True)
    class Meta:
        model = Odontologo
        fields = [
            'id_odontologo', 'user', 'usuario_seguridad',
            'nombre', 'especialidad', 'telefono', 'email',
            'matriculaProfesional',
            # write-only
            'username', 'contrasena',
        ]

    def create(self, validated_data):
        # Remover campos no pertenecientes al modelo antes de crear
        validated_data.pop('username', None)
        validated_data.pop('contrasena', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Remover campos no pertenecientes al modelo antes de actualizar
        validated_data.pop('username', None)
        validated_data.pop('contrasena', None)
        return super().update(instance, validated_data)

class CitaSerializer(serializers.ModelSerializer):
    nombre_paciente = serializers.CharField(source='id_paciente.nombre', read_only=True)
    nombre_odontologo = serializers.CharField(source='id_odontologo.nombre', read_only=True)
    atencion = serializers.SerializerMethodField()

    def get_atencion(self, obj):
        # Devuelve True si la cita ya tiene atención asociada, False si no
        return hasattr(obj, 'atencion')

    class Meta:
        model = Cita
        fields = '__all__'
        # Agregar el campo atencion al output
        extra_fields = ['atencion']

class DisponibilidadSerializer(serializers.ModelSerializer):
    """Serializer para Disponibilidad (CU10: Configurar disponibilidad de odontólogo)"""
    odontologo_nombre = serializers.CharField(source='id_odontologo.nombre', read_only=True)
    
    class Meta:
        model = Disponibilidad
        fields = [
            'id_disponibilidad', 'id_odontologo', 'fecha_inicio', 'fecha_fin',
            'estado', 'motivo_bloqueo', 'created_at', 'updated_at',
            'odontologo_nombre'
        ]
        read_only_fields = ['id_disponibilidad', 'created_at', 'updated_at']
