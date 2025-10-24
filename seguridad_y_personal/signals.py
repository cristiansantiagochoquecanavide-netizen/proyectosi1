
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
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


# --- Sincronización con el sistema de autenticación nativo de Django (auth.User) ---

def _estado_es_activo(estado_val: str) -> bool:
    try:
        return (estado_val or '').strip().lower() == 'activo'
    except Exception:
        return False


def _obtener_o_crear_auth_user_desde_usuario(usuario: Usuario) -> User:
    """Asegura que exista un auth.User que refleje el Usuario de seguridad.
    - Usa correo como referencia principal si ya existe un User con el mismo email.
    - Si no existe, intenta usar username; si colisiona, agrega sufijo con el id del Usuario.
    - Sincroniza: first_name (desde nombre), email, is_active (desde estado) y password (hasheada).
    """
    # 1) Buscar por email primero (si ya existe uno, se reutiliza)
    auth_user = None
    if usuario.correo:
        try:
            auth_user = User.objects.get(email=usuario.correo)
        except User.DoesNotExist:
            auth_user = None
        except Exception:
            auth_user = None

    # 2) Si no hay por email, buscar por username
    if auth_user is None and usuario.username:
        try:
            auth_user = User.objects.get(username=usuario.username)
        except User.DoesNotExist:
            auth_user = None
        except Exception:
            auth_user = None

    # 3) Crear si no existe
    if auth_user is None:
        username_final = (usuario.username or '').strip() or (usuario.correo or '').split('@')[0]
        if not username_final:
            username_final = f"usuario_{usuario.id_usuario}"
        # Evitar colisiones de username
        if User.objects.filter(username=username_final).exists():
            username_final = f"{username_final}_{usuario.id_usuario}"

        auth_user = User(
            username=username_final,
            email=usuario.correo or '',
            first_name=(usuario.nombre or '')[:150],
            is_active=_estado_es_activo(usuario.estado),
        )
    else:
        # Si existe, sincronizamos atributos principales
        auth_user.email = usuario.correo or auth_user.email
        auth_user.first_name = (usuario.nombre or '')[:150]
        auth_user.is_active = _estado_es_activo(usuario.estado)

    # Sincronizar contraseña (hasheada) siempre para mantener consistencia
    try:
        raw_password = usuario.contrasena or ''
        # Usar set_password para generar hash seguro
        auth_user.set_password(raw_password)
    except Exception:
        # Si algo falla, no impide guardar el resto
        pass

    try:
        auth_user.save()
    except Exception:
        # No romper el flujo principal por un fallo de sincronización
        pass

    return auth_user


@receiver(post_save, sender=Usuario)
def sincronizar_usuario_a_auth(sender, instance: Usuario, created, **kwargs):
    """Cuando se crea o actualiza un Usuario del módulo de seguridad,
    asegurar que exista (o se sincronice) un usuario en django.contrib.auth.models.User
    para que sea visible en el panel de administración y utilizable por el sistema nativo.
    """
    try:
        _obtener_o_crear_auth_user_desde_usuario(instance)
    except Exception:
        # Evitar que errores en la sincronización afecten el guardado del modelo principal
        pass


@receiver(post_delete, sender=Usuario)
def eliminar_auth_user_relacionado(sender, instance: Usuario, **kwargs):
    """Al eliminar un Usuario del módulo de seguridad, intentar eliminar el auth.User correspondiente
    (buscando por email y/o username, incluyendo el patrón username_id si se usó para evitar colisiones).
    """
    try:
        candidatos = []
        if instance.correo:
            try:
                candidatos.append(User.objects.get(email=instance.correo))
            except User.DoesNotExist:
                pass
        if instance.username:
            try:
                candidatos.append(User.objects.get(username=instance.username))
            except User.DoesNotExist:
                pass
            # Variante con sufijo de id
            try:
                candidatos.append(User.objects.get(username=f"{instance.username}_{instance.id_usuario}"))
            except User.DoesNotExist:
                pass
        # Eliminar duplicados preservando orden
        vistos = set()
        unicos = []
        for u in candidatos:
            if u.pk not in vistos:
                vistos.add(u.pk)
                unicos.append(u)
        for u in unicos:
            try:
                u.delete()
            except Exception:
                pass
    except Exception:
        pass
