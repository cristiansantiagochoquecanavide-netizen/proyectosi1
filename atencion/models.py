from django.db import models
from django.utils import timezone

# CU11: Iniciar atención desde cita
# - Se dispara desde el módulo de Citas
# - Crea un registro de atención vinculado a una cita específica
class Atencion(models.Model):
    id_atencion = models.AutoField(primary_key=True)
    id_cita = models.OneToOneField('citas.Cita', on_delete=models.CASCADE, related_name='atencion')  # Relación 1:1 con Cita
    id_paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE, related_name='atenciones')
    id_odontologo = models.ForeignKey('citas.Odontologo', on_delete=models.CASCADE, related_name='atenciones')
    fecha_inicio = models.DateTimeField(default=timezone.now)  # Inicio de la atención
    fecha_fin = models.DateTimeField(null=True, blank=True)  # Fin de la atención (null mientras está en curso)
    estado = models.CharField(max_length=50, choices=[
        ('en_curso', 'En Curso'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada')
    ], default='en_curso')
    observaciones_generales = models.TextField(blank=True)  # Notas generales de la atención
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_inicio']
        verbose_name = 'Atención'
        verbose_name_plural = 'Atenciones'

    def __str__(self):
        return f"Atención #{self.id_atencion} - {self.id_paciente.nombre} por {self.id_odontologo.nombre}"

    def finalizar_atencion(self):
        """Finaliza la atención registrando la fecha de fin"""
        self.fecha_fin = timezone.now()
        self.estado = 'finalizada'
        self.save()


# CU12: Registrar procedimientos en atención
# - Registra cada procedimiento realizado durante la atención
# - Puede vincular consumo de insumos
class Procedimiento(models.Model):
    id_procedimiento = models.AutoField(primary_key=True)
    id_atencion = models.ForeignKey(Atencion, on_delete=models.CASCADE, related_name='procedimientos')
    nombre = models.CharField(max_length=255)  # Nombre del procedimiento (ej: "Extracción", "Limpieza")
    descripcion = models.TextField()  # Detalles del procedimiento
    pieza_dental = models.CharField(max_length=10, blank=True, null=True)  # Pieza dental afectada (ej: "18", "31")
    duracion_minutos = models.PositiveIntegerField(default=30)  # Duración estimada/real
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Costo del procedimiento
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Procedimiento'
        verbose_name_plural = 'Procedimientos'

    def __str__(self):
        return f"{self.nombre} - Atención #{self.id_atencion.id_atencion}"


# CU13: Actualizar odontograma
# - Registra el estado de cada pieza dental del paciente
# - Sistema de numeración dental FDI (11-18, 21-28, 31-38, 41-48)
# - Permite subir imagen del odontograma
class Odontograma(models.Model):
    id_odontograma = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE, related_name='odontogramas')
    fecha_registro = models.DateTimeField(default=timezone.now)
    observaciones = models.TextField(blank=True)
    imagen = models.ImageField(upload_to='odontogramas/', null=True, blank=True)  # Imagen del odontograma
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_registro']
        verbose_name = 'Odontograma'
        verbose_name_plural = 'Odontogramas'

    def __str__(self):
        return f"Odontograma de {self.id_paciente.nombre} - {self.fecha_registro.date()}"
    
    def get_upload_path(self):
        """Retorna la ruta de la carpeta del odontograma del paciente"""
        nombre_paciente = self.id_paciente.nombre.replace(' ', '_')
        return f'odontogramas/odontograma-{nombre_paciente}/'


class PiezaDental(models.Model):
    id_pieza = models.AutoField(primary_key=True)
    id_odontograma = models.ForeignKey(Odontograma, on_delete=models.CASCADE, related_name='piezas')
    numero_pieza = models.CharField(max_length=2)  # Numeración FDI: 11-48
    estado = models.CharField(max_length=50, choices=[
        ('sano', 'Sano'),
        ('caries', 'Caries'),
        ('obturado', 'Obturado'),
        ('endodoncia', 'Endodoncia'),
        ('protesis', 'Prótesis'),
        ('extraccion', 'Extracción'),
        ('ausente', 'Ausente'),
        ('fractura', 'Fractura'),
        ('corona', 'Corona'),
    ], default='sano')
    observaciones = models.CharField(max_length=255, blank=True)
    
    # Detalles de las caras del diente (vestibular, lingual, mesial, distal, oclusal)
    cara_vestibular = models.BooleanField(default=False)  # Afectada
    cara_lingual = models.BooleanField(default=False)
    cara_mesial = models.BooleanField(default=False)
    cara_distal = models.BooleanField(default=False)
    cara_oclusal = models.BooleanField(default=False)

    class Meta:
        unique_together = ('id_odontograma', 'numero_pieza')
        ordering = ['numero_pieza']
        verbose_name = 'Pieza Dental'
        verbose_name_plural = 'Piezas Dentales'

    def __str__(self):
        return f"Pieza {self.numero_pieza} - {self.estado}"


# CU15: Gestionar tratamientos
# - Plan de tratamiento a largo plazo para el paciente
# - Puede abarcar múltiples atenciones
class Tratamiento(models.Model):
    id_tratamiento = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE, related_name='tratamientos')
    id_odontologo = models.ForeignKey('citas.Odontologo', on_delete=models.CASCADE, related_name='tratamientos')
    nombre = models.CharField(max_length=255)  # Nombre del tratamiento (ej: "Ortodoncia", "Rehabilitación oral")
    descripcion = models.TextField()  # Descripción detallada del tratamiento
    fecha_inicio = models.DateField(default=timezone.now)
    fecha_fin_estimada = models.DateField(null=True, blank=True)
    fecha_fin_real = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, choices=[
        ('planificado', 'Planificado'),
        ('en_curso', 'En Curso'),
        ('pausado', 'Pausado'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado')
    ], default='planificado')
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    costo_real = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    observaciones = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_inicio']
        verbose_name = 'Tratamiento'
        verbose_name_plural = 'Tratamientos'

    def __str__(self):
        return f"{self.nombre} - {self.id_paciente.nombre}"


# Relación entre Tratamiento y Atenciones (un tratamiento puede tener múltiples atenciones)
class TratamientoAtencion(models.Model):
    id_tratamiento = models.ForeignKey(Tratamiento, on_delete=models.CASCADE, related_name='atenciones_relacionadas')
    id_atencion = models.ForeignKey(Atencion, on_delete=models.CASCADE, related_name='tratamientos_relacionados')
    orden = models.PositiveIntegerField(default=1)  # Orden de la atención en el tratamiento
    observaciones = models.TextField(blank=True)

    class Meta:
        unique_together = ('id_tratamiento', 'id_atencion')
        ordering = ['orden']
        verbose_name = 'Tratamiento-Atención'
        verbose_name_plural = 'Tratamientos-Atenciones'

    def __str__(self):
        return f"{self.id_tratamiento.nombre} - Atención #{self.id_atencion.id_atencion}"
