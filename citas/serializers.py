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
    class Meta:
        model = Cita
        fields = '__all__'

class DisponibilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidad
        fields = '__all__'
