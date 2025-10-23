from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

# Create your models here.
# Clase para los odontólogos
# - Puede enlazarse a auth.User (Django) y a Usuario de Seguridad para sincronización.
class Odontologo(models.Model):
    id_odontologo = models.AutoField(primary_key=True)  # ID único del odontólogo
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    # Enlace opcional al usuario del módulo de seguridad para sincronización de roles
    usuario_seguridad = models.OneToOneField('seguridad_y_personal.Usuario', on_delete=models.SET_NULL, null=True, blank=True, unique=True)
    nombre = models.CharField(max_length=255)  # Nombre del odontólogo
    especialidad = models.CharField(max_length=100)  # Especialidad del odontólogo
    telefono = models.CharField(max_length=15)  # Teléfono de contacto
    email = models.EmailField(max_length=255)  # Correo electrónico
    matricula_profesional = models.CharField(max_length=100, blank=True, default='')  # Matrícula profesional

    def delete(self, *args, **kwargs):
        # Eliminar el usuario asociado si existe
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.id_odontologo} - {self.nombre}"


# Clase para las citas
# - Registra fecha/hora, paciente, odontólogo (opcional) y estado del proceso.
class Cita(models.Model):
    id_cita = models.AutoField(primary_key=True)  # ID único de la cita
    fecha = models.DateTimeField()  # Fecha y hora de la cita
    id_paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE)  # Relación con el paciente (FK)
    id_odontologo = models.ForeignKey(Odontologo, on_delete=models.SET_NULL, null=True, blank=True)  # Permite seleccionar cualquier odontólogo y dejar el campo vacío
    estado = models.CharField(max_length=50, choices=[('pendiente', 'Pendiente'), 
                                                     ('confirmada', 'Confirmada'), 
                                                     ('cancelada', 'Cancelada')])  # Estado de la cita

    def __str__(self):
        return f"Cita de {self.id_paciente.nombre} con {self.id_odontologo.nombre if self.id_odontologo else '-'} - {self.estado}"


# Clase para la disponibilidad de los odontólogos
class Disponibilidad(models.Model):
    id_odontologo = models.ForeignKey(Odontologo, on_delete=models.CASCADE)  # Relación con el odontólogo (FK)
    fecha = models.DateTimeField()  # Fecha y hora de disponibilidad
    estado = models.CharField(max_length=50, choices=[('disponible', 'Disponible'), 
                                                     ('ocupado', 'Ocupado')])  # Estado de la disponibilidad

    def __str__(self):
        return f"Disponibilidad de {self.id_odontologo.nombre} - {self.estado} en {self.fecha}"