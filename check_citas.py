import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from citas.models import Cita

citas = Cita.objects.filter(estado='programada')
print(f'\n✓ Total de citas programadas: {citas.count()}\n')

if citas.count() > 0:
    for cita in citas[:5]:
        paciente = cita.id_paciente.nombre if cita.id_paciente else 'Sin paciente'
        odontologo = cita.id_odontologo.nombre if cita.id_odontologo else 'Sin odontólogo'
        fecha_hora = cita.fecha.strftime('%d/%m/%Y %H:%M') if cita.fecha else 'Sin fecha'
        print(f'  - ID: {cita.id_cita}')
        print(f'    Paciente: {paciente}')
        print(f'    Odontólogo: {odontologo}')
        print(f'    Fecha y Hora: {fecha_hora}')
        print(f'    Estado: {cita.estado}')
        print()
else:
    print('⚠ No hay citas programadas en la base de datos.')
    print('  Debe crear una cita con estado "programada" desde el módulo de Citas.\n')
