import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Paciente


@receiver(post_save, sender=Paciente)
def crear_odontograma_paciente(sender, instance, created, **kwargs):
    """
    Señal que se ejecuta automáticamente al crear un nuevo paciente.
    Crea:
    1. Un registro de odontograma en la base de datos
    2. Una carpeta específica para el paciente en media/odontogramas/
    """
    if created:
        from atencion.models import Odontograma
        
        # Crear el odontograma en la base de datos
        odontograma = Odontograma.objects.create(
            id_paciente=instance,
            observaciones=f'Odontograma inicial de {instance.nombre}'
        )
        
        # Crear la carpeta del paciente
        nombre_paciente = instance.nombre.replace(' ', '_')
        carpeta_odontograma = os.path.join(
            settings.MEDIA_ROOT,
            'odontogramas',
            f'odontograma-{nombre_paciente}'
        )
        
        # Crear la carpeta si no existe
        os.makedirs(carpeta_odontograma, exist_ok=True)
        
        print(f"✓ Odontograma creado para {instance.nombre}")
        print(f"✓ Carpeta creada: {carpeta_odontograma}")
