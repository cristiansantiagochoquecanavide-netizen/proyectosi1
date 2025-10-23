
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import Usuario, UsuarioRol, Rol
from citas.models import Odontologo


# Señales para sincronizar roles de Seguridad con Odontólogos en Citas.
# Objetivo: cuando un usuario recibe el rol "odontologo", exista un registro
# Odontologo asociado; si pierde el rol (y no tiene otro vínculo con ese rol), eliminarlo.

def _es_odontologo(rol: Rol) -> bool:
    try:
        return bool(rol and getattr(rol, 'nombre_rol', None) and rol.nombre_rol.strip().lower() == 'odontologo')
    except Exception:
        return False


@receiver(pre_save, sender=UsuarioRol)
def detectar_cambio_de_rol(sender, instance: UsuarioRol, **kwargs):
    """Si un UsuarioRol existente cambia de 'odontologo' a otro rol, eliminar el Odontologo asociado.
    No hace nada cuando se guarda un rol distinto de odontologo (no elimina si existe otro UsuarioRol con odontologo).
    """
    try:
        if not instance.pk:
            return  # creación: lo maneja post_save
        anterior = UsuarioRol.objects.get(pk=instance.pk)
        if _es_odontologo(anterior.id_rol) and not _es_odontologo(instance.id_rol):
            # Rol dejó de ser odontologo en este vínculo concreto
            try:
                od = Odontologo.objects.get(usuario_seguridad=anterior.id_usuario)
                # Solo eliminar si el usuario YA NO tiene ningún otro UsuarioRol de odontologo
                tiene_otro = UsuarioRol.objects.filter(id_usuario=anterior.id_usuario, id_rol__nombre_rol__iexact='odontologo').exclude(pk=instance.pk).exists()
                if not tiene_otro:
                    od.delete()
            except Odontologo.DoesNotExist:
                pass
    except Exception:
        pass


@receiver(post_save, sender=UsuarioRol)
def crear_odontologo_por_rol(sender, instance: UsuarioRol, created, **kwargs):
    """Cuando se asigna el rol 'odontologo' a un Usuario, crear (o asegurar) el registro en citas.Odontologo.
    Evita duplicados usando usuario_seguridad. Si no es odontologo, no guarda nada.
    """
    try:
        if _es_odontologo(instance.id_rol):
            usuario = instance.id_usuario
            Odontologo.objects.get_or_create(
                usuario_seguridad=usuario,
                defaults={
                    'nombre': usuario.nombre or '',
                    'email': usuario.correo or '',
                    'telefono': '',
                    'especialidad': 'General',
                }
            )
    except Exception:
        # Evitar que un fallo en sincronización rompa la operación principal
        pass


@receiver(post_delete, sender=UsuarioRol)
def eliminar_odontologo_por_rol(sender, instance, **kwargs):
    """Si se quita el rol 'odontologo' de un Usuario, eliminar su registro de Odontologo (si existe)."""
    try:
        rol = instance.id_rol
        if rol and rol.nombre_rol and rol.nombre_rol.strip().lower() == 'odontologo':
            usuario = instance.id_usuario
            try:
                od = Odontologo.objects.get(usuario_seguridad=usuario)
                od.delete()
            except Odontologo.DoesNotExist:
                pass
    except Exception:
        pass


@receiver(post_save, sender=Usuario)
def sincronizar_datos_odontologo(sender, instance: Usuario, created, **kwargs):
    """Si existe un Odontologo enlazado a este Usuario (usuario_seguridad),
    sincroniza nombre y email al actualizar el Usuario.
    """
    try:
        od = Odontologo.objects.filter(usuario_seguridad=instance).first()
        if od:
            cambios = False
            if od.nombre != (instance.nombre or ''):
                od.nombre = instance.nombre or ''
                cambios = True
            if od.email != (instance.correo or ''):
                od.email = instance.correo or ''
                cambios = True
            if cambios:
                od.save(update_fields=['nombre', 'email'])
    except Exception:
        pass
