import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from citas.models import Cita, Odontologo
from pacientes.models import Paciente

print("\n" + "="*60)
print("CREAR CITA DE PRUEBA CON ESTADO 'PROGRAMADA'")
print("="*60)

# Verificar si hay pacientes
pacientes = Paciente.objects.all()
print(f"\n✓ Pacientes disponibles: {pacientes.count()}")
if pacientes.count() == 0:
    print("⚠ No hay pacientes. Debe crear un paciente primero.")
    exit(1)

# Verificar si hay odontólogos
odontologos = Odontologo.objects.all()
print(f"✓ Odontólogos disponibles: {odontologos.count()}")
if odontologos.count() == 0:
    print("⚠ No hay odontólogos. Debe crear un odontólogo primero.")
    exit(1)

# Mostrar opciones
print("\n--- Pacientes ---")
for p in pacientes[:5]:
    print(f"  {p.id_paciente}: {p.nombre}")

print("\n--- Odontólogos ---")
for o in odontologos[:5]:
    print(f"  {o.id_odontologo}: {o.nombre} ({o.especialidad})")

# Crear cita de prueba
paciente = pacientes.first()
odontologo = odontologos.first()
fecha_cita = datetime.now() + timedelta(days=1, hours=10)  # Mañana a las 10:00

cita = Cita.objects.create(
    fecha=fecha_cita,
    id_paciente=paciente,
    id_odontologo=odontologo,
    estado='programada'
)

print(f"\n✅ Cita creada exitosamente!")
print(f"   ID: {cita.id_cita}")
print(f"   Paciente: {paciente.nombre}")
print(f"   Odontólogo: {odontologo.nombre}")
print(f"   Fecha: {fecha_cita.strftime('%d/%m/%Y %H:%M')}")
print(f"   Estado: {cita.estado}")
print("\n✓ Ahora puede usar 'Iniciar Atención' en el frontend.\n")
