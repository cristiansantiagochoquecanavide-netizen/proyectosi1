from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Odontologo

# Deshabilitado: la creación y eliminación del User asociado
# se maneja explícitamente en el formulario y en el método delete del modelo.

@receiver(post_save, sender=Odontologo)
def crear_user_auth_odontologo(sender, instance, created, **kwargs):
    # Evitar crear usuarios duplicados desde señales
    return

@receiver(post_delete, sender=Odontologo)
def eliminar_user_auth_odontologo(sender, instance, **kwargs):
    """Eliminar el usuario de auth asociado también en borrados masivos.

    Usamos user_id directamente para evitar fallos de acceso lazy tras el delete.
    """
    try:
        user_id = getattr(instance, 'user_id', None)
        if user_id:
            from django.contrib.auth.models import User
            User.objects.filter(pk=user_id).delete()
    except Exception:
        # Evitar romper el flujo de borrado si algo falla
        pass
