from django import forms  # Formularios de Django
from .models import Paciente  # Modelo Paciente

class PacienteForm(forms.ModelForm):  # Form ligado al modelo Paciente
    class Meta:  # Configuración del ModelForm
        model = Paciente  # Modelo objetivo
        fields = ['nombre', 'fecha_nacimiento', 'genero', 'telefono', 'direccion', 'email']  # Campos editables
