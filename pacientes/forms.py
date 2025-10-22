from django import forms  # Formularios de Django
from .models import Paciente  # Modelo Paciente

class PacienteForm(forms.ModelForm):  # Form ligado al modelo Paciente
    class Meta:  # Configuración del ModelForm
        model = Paciente  # Modelo objetivo
        fields = ['nombre', 'fecha_nacimiento', 'genero', 'telefono', 'direccion', 'email']  # Campos editables
        # Widget de fecha con selector de calendario nativo del navegador (sin hora)
        widgets = {
            'fecha_nacimiento': forms.DateInput(
                attrs={
                    'type': 'date',  # Muestra calendario nativo y restringe a día/mes/año
                }
            ),
        }
