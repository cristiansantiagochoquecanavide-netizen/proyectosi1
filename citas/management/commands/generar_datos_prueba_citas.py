from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from citas.models import Cita, Odontologo
from pacientes.models import Paciente
from atencion.models import Atencion, Procedimiento, Odontograma
import random


class Command(BaseCommand):
    help = 'Genera datos de prueba para citas, atenciones y procedimientos'

    def handle(self, *args, **options):
        # Obtener odontólogo y pacientes
        try:
            odontologo = Odontologo.objects.first()
            if not odontologo:
                self.stdout.write(self.style.ERROR('No hay odontólogos en la base de datos'))
                return
            
            pacientes = list(Paciente.objects.all()[:5])
            if not pacientes:
                self.stdout.write(self.style.ERROR('No hay pacientes en la base de datos'))
                return
            
            # Generar citas para los últimos 7 días
            hoy = timezone.now()
            citas_creadas = 0
            
            for i in range(10):
                fecha_cita = hoy - timedelta(days=random.randint(0, 6), hours=random.randint(8, 17))
                estado = random.choice(['confirmada', 'programada', 'cancelada', 'pendiente'])
                
                cita = Cita.objects.create(
                    fecha=fecha_cita,
                    id_paciente=random.choice(pacientes),
                    id_odontologo=odontologo,
                    estado=estado
                )
                citas_creadas += 1
                
                # Si la cita está confirmada o programada, crear una atención
                if estado in ['confirmada', 'programada']:
                    fecha_inicio = fecha_cita
                    fecha_fin = fecha_inicio + timedelta(minutes=random.randint(30, 120))
                    estado_atencion = random.choice(['finalizada', 'en_curso', 'cancelada'])
                    
                    atencion = Atencion.objects.create(
                        id_cita=cita,
                        id_paciente=cita.id_paciente,
                        id_odontologo=odontologo,
                        fecha_inicio=fecha_inicio,
                        fecha_fin=fecha_fin if estado_atencion == 'finalizada' else None,
                        estado=estado_atencion,
                        observaciones_generales=f'Atención realizada el {fecha_inicio.date()}'
                    )
                    
                    # Generar procedimientos si la atención está finalizada
                    if estado_atencion == 'finalizada':
                        procedimientos = ['Limpieza', 'Extracción', 'Restauración', 'Sellado']
                        for j in range(random.randint(1, 3)):
                            Procedimiento.objects.create(
                                id_atencion=atencion,
                                nombre=random.choice(procedimientos),
                                descripcion=f'Procedimiento realizado en la atención {atencion.id_atencion}',
                                pieza_dental=f'{random.randint(11, 48)}',
                                duracion_minutos=random.randint(15, 60),
                                costo=random.uniform(50, 500)
                            )
            
            # Generar odontogramas
            odontogramas_creados = 0
            for paciente in pacientes[:3]:
                for j in range(2):
                    Odontograma.objects.create(
                        id_paciente=paciente,
                        fecha_registro=hoy - timedelta(days=random.randint(0, 6)),
                        observaciones=f'Odontograma de {paciente.nombre}',
                        imagen=None
                    )
                    odontogramas_creados += 1
            
            self.stdout.write(self.style.SUCCESS(f'✓ {citas_creadas} citas creadas'))
            self.stdout.write(self.style.SUCCESS(f'✓ {odontogramas_creados} odontogramas creados'))
            self.stdout.write(self.style.SUCCESS('Datos de prueba generados exitosamente'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
