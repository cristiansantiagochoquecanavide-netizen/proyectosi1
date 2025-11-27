from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.validators import RegexValidator

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
    matricula_profesional = models.CharField(
        max_length=100,
        blank=True,
        default='',
        validators=[
            RegexValidator(r'^[0-9A-Za-z]*$', 'Solo letras y números están permitidos.')
        ]
    )  # Matrícula profesional (solo letras y números)

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
    estado = models.CharField(max_length=50, choices=[
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('programada', 'Programada'),
        ('cancelada', 'Cancelada')
    ])  # Estado de la cita

    def __str__(self):
        return f"Cita de {self.id_paciente.nombre} con {self.id_odontologo.nombre if self.id_odontologo else '-'} - {self.estado}"


# Clase para la Evaluación de Satisfacción del Cliente
# CU: Evaluación de Satisfacción del Cliente
# - Permite registrar el nivel de satisfacción del cliente después de una cita
# - Escala de 1-5: 1=Muy Baja Satisfacción, 5=Muy Alta Satisfacción
class EvaluacionSatisfaccion(models.Model):
    NIVEL_SATISFACCION_CHOICES = [
        (1, 'Muy Baja Satisfacción'),
        (2, 'Baja Satisfacción'),
        (3, 'Satisfacción Media'),
        (4, 'Alta Satisfacción'),
        (5, 'Muy Alta Satisfacción'),
    ]
    
    id_evaluacion = models.AutoField(primary_key=True)
    id_cita = models.OneToOneField(Cita, on_delete=models.CASCADE, related_name='evaluacion_satisfaccion')
    nivel_satisfaccion = models.IntegerField(choices=NIVEL_SATISFACCION_CHOICES)  # Escala 1-5
    observaciones = models.TextField(blank=True, null=True)  # Observaciones opcionales
    id_odontologo = models.ForeignKey(Odontologo, on_delete=models.SET_NULL, null=True, blank=True)  # Odontólogo que registró
    fecha_registro = models.DateTimeField(auto_now_add=True)  # Fecha y hora de registro
    actualizado_en = models.DateTimeField(auto_now=True)  # Fecha y hora de última actualización
    
    class Meta:
        ordering = ['-fecha_registro']
        verbose_name = 'Evaluación de Satisfacción'
        verbose_name_plural = 'Evaluaciones de Satisfacción'
    
    def __str__(self):
        return f"Satisfacción de {self.id_cita.id_paciente.nombre} - Nivel {self.nivel_satisfaccion}/5"


# Clase para la disponibilidad de los odontólogos
# CU10: Configurar disponibilidad de odontólogo
# - Define slots de tiempo disponibles para agenda de citas
# - Permite bloquear horarios específicos
class Disponibilidad(models.Model):
    id_disponibilidad = models.AutoField(primary_key=True)
    id_odontologo = models.ForeignKey(Odontologo, on_delete=models.CASCADE, related_name='disponibilidades')  # Relación con el odontólogo (FK)
    fecha_inicio = models.DateTimeField(null=True, blank=True)  # Fecha y hora de inicio del slot
    fecha_fin = models.DateTimeField(null=True, blank=True)  # Fecha y hora de fin del slot
    estado = models.CharField(max_length=50, choices=[
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('bloqueado', 'Bloqueado')
    ], default='disponible')  # Estado de la disponibilidad
    motivo_bloqueo = models.CharField(max_length=255, blank=True, null=True)  # Razón del bloqueo (vacaciones, reunión, etc.)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['fecha_inicio']
        verbose_name = 'Disponibilidad'
        verbose_name_plural = 'Disponibilidades'

    def __str__(self):
        return f"Disponibilidad de {self.id_odontologo.nombre} - {self.estado} ({self.fecha_inicio} - {self.fecha_fin})"