from rest_framework import serializers
from .models import Paciente, HistorialClinica, ArchivoClinico

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class HistorialClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialClinica
        fields = '__all__'

class ArchivoClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivoClinico
        fields = ['id', 'paciente', 'nombreArchivo', 'tipoDocumento', 'rutaArchivo', 'descripcion', 'fechaAdjunto']
