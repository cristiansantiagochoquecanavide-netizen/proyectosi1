from django.db import models

# Modelos del dominio de Pacientes: datos básicos, historial clínico y archivos adjuntos.
class Paciente(models.Model):
    id_paciente = models.AutoField(primary_key=True)  # ID único del paciente
    nombre = models.CharField(max_length=255)  # Nombre del paciente
    fecha_nacimiento = models.DateField()  # Fecha de nacimiento
    GENERO_OPCIONES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    ]
    genero = models.CharField(
        max_length=1,
        choices=GENERO_OPCIONES,
        default='M',
    )  # Género del paciente
    telefono = models.CharField(max_length=15)  # Teléfono de contacto
    direccion = models.CharField(max_length=255)  # Dirección del paciente
    email = models.EmailField(max_length=255)  # Correo electrónico del paciente

    def __str__(self):
        return self.nombre


# Clase para el historial clínico del paciente
class HistorialClinica(models.Model):
    id_historial = models.AutoField(primary_key=True)  # ID único del historial clínico
    id_paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)  # Relación con el paciente
    fecha_atencion = models.DateTimeField()  # Fecha de la atención
    descripcion = models.TextField()  # Descripción del tratamiento realizado
    diagnostico = models.TextField()  # Diagnóstico del paciente

    def __str__(self):
        return f"Historial de {self.id_paciente.nombre} - {self.fecha_atencion}"


# Clase para los archivos clínicos del paciente (radiografías, recetas, etc.)
class ArchivoClinico(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='archivos', null=True, blank=True)
    nombreArchivo = models.CharField(max_length=255, null=True, blank=True)
    tipoDocumento = models.CharField(max_length=100, blank=True)
    rutaArchivo = models.FileField(upload_to='archivos_clinicos/', null=True, blank=True)
    descripcion = models.TextField(blank=True)
    fechaAdjunto = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def adjuntarArchivo(self, **kwargs):
        for k, v in kwargs.items():
            if hasattr(self, k):
                setattr(self, k, v)
        self.save()
        return self

    def eliminarArchivo(self):
        self.delete()

    @staticmethod
    def listarArchivos(paciente_id):
        return ArchivoClinico.objects.filter(paciente_id=paciente_id)  # pylint: disable=no-member

    @staticmethod
    def consultarArchivo(pk):
        return ArchivoClinico.objects.filter(pk=pk).first()

    def __str__(self):
        return f"Archivo de {self.paciente.nombre} - {self.nombreArchivo}"