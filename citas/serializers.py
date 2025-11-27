from rest_framework import serializers
from .models import Odontologo, Cita, Disponibilidad, EvaluacionSatisfaccion

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

    def validate(self, data):
        """Validar que el odontólogo no tenga dos pacientes en la misma fecha y hora"""
        fecha = data.get('fecha')
        odontologo = data.get('id_odontologo')
        
        if fecha and odontologo:
            # Verificar si ya existe una cita con ese odontólogo en esa fecha y hora
            conflicto = Cita.objects.filter(
                id_odontologo=odontologo,
                fecha=fecha
            )
            # Si estamos actualizando, excluir la cita actual
            if self.instance:
                conflicto = conflicto.exclude(pk=self.instance.pk)
            
            if conflicto.exists():
                raise serializers.ValidationError(
                    'El odontólogo ya tiene una cita asignada en esa fecha y hora.'
                )
        
        return data

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


class EvaluacionSatisfaccionSerializer(serializers.ModelSerializer):
    """Serializer para Evaluación de Satisfacción del Cliente"""
    nombre_paciente = serializers.CharField(source='id_cita.id_paciente.nombre', read_only=True)
    nombre_odontologo = serializers.CharField(source='id_odontologo.nombre', read_only=True)
    nivel_nombre = serializers.CharField(source='get_nivel_satisfaccion_display', read_only=True)
    
    class Meta:
        model = EvaluacionSatisfaccion
        fields = [
            'id_evaluacion',
            'id_cita',
            'nivel_satisfaccion',
            'nivel_nombre',
            'observaciones',
            'id_odontologo',
            'nombre_paciente',
            'nombre_odontologo',
            'fecha_registro',
            'actualizado_en',
        ]
        read_only_fields = ['id_evaluacion', 'fecha_registro', 'actualizado_en']