from rest_framework import serializers
from .models import Odontologo, Cita, Disponibilidad

class OdontologoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Odontologo
        fields = '__all__'

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'

class DisponibilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidad
        fields = '__all__'
