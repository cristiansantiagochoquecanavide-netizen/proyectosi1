from django.db import models
from django.contrib.auth.models import User

# Create your models here.


# Clase para los roles de usuario
class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)  # ID único del rol
    nombre_rol = models.CharField(max_length=100)  # Nombre del rol (Ej. Admin, Recepcionista)
    descripcion = models.TextField()  # Descripción del rol

    def __str__(self):
        return self.nombre_rol

# Clase para los usuarios
class Usuario(models.Model):
    # Sin validación personalizada, solo el comportamiento por defecto de Django
    id_usuario = models.AutoField(primary_key=True)  # ID único del usuario
    username = models.CharField(max_length=255)  # Nombre de usuario
    nombre = models.CharField(max_length=255)  # Nombre del usuario
    correo = models.EmailField(max_length=255)  # Correo electrónico del usuario
    contrasena = models.CharField(max_length=255)  # Contraseña (hash)
    estado = models.CharField(max_length=50, choices=[('activo', 'Activo'), ('inactivo', 'Inactivo')])  # Estado del usuario (activo/inactivo)
    ultimo_login = models.DateTimeField(null=True, blank=True)  # Fecha del último inicio de sesión

    def __str__(self):
        return self.nombre

# Relación entre Usuario y Rol
class UsuarioRol(models.Model):
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)  # ID del usuario relacionado (FK)
    id_rol = models.ForeignKey(Rol, on_delete=models.CASCADE)  # ID del rol asignado al usuario (FK)

    def __str__(self):
        return f"{self.id_usuario.nombre} - {self.id_rol.nombre_rol}"

# Clase para las bitácoras de acciones
class Bitacora(models.Model):
    id_bitacora = models.AutoField(primary_key=True)  # ID único de la bitácora
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)  # ID del usuario que realizó la acción (FK)
    accion = models.TextField()  # Descripción de la acción realizada
    fecha_accion = models.DateTimeField(auto_now_add=True)  # Fecha y hora en que se realizó la acción

    def __str__(self):
        return f"Bitácora de {self.id_usuario.nombre} - {self.fecha_accion}"


# Perfil para usuarios de autenticación nativa (auth.User) para almacenar teléfono
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    telefono = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return f"Perfil de {self.user.username}"
