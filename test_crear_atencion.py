import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from citas.models import Cita
from atencion.models import Atencion
from atencion.serializers import AtencionSerializer

print("\n" + "="*70)
print("PRUEBA DE CREACIÓN DE ATENCIÓN DESDE CITA")
print("="*70)

# Obtener una cita programada
cita = Cita.objects.filter(estado='programada').first()

if not cita:
    print("\n⚠ No hay citas programadas. Ejecute primero: python crear_cita_programada.py")
    exit(1)

print(f"\n✓ Cita encontrada:")
print(f"  ID: {cita.id_cita}")
print(f"  Paciente: {cita.id_paciente.nombre}")
print(f"  Odontólogo: {cita.id_odontologo.nombre if cita.id_odontologo else 'Sin odontólogo'}")
print(f"  Estado: {cita.estado}")

# Simular request del frontend
data = {
    'id_cita': cita.id_cita,
    'observaciones_generales': 'Motivo de consulta: Dolor en muela\n\nObservaciones: Paciente refiere dolor desde hace 3 días'
}

print(f"\n📤 Datos que envía el frontend:")
print(json.dumps(data, indent=2, ensure_ascii=False))

# Crear atención usando el serializer
serializer = AtencionSerializer(data=data)

if serializer.is_valid():
    atencion = serializer.save()
    print(f"\n✅ Atención creada exitosamente!")
    print(f"  ID Atención: {atencion.id_atencion}")
    print(f"  Paciente (extraído): {atencion.id_paciente.nombre}")
    print(f"  Odontólogo (extraído): {atencion.id_odontologo.nombre}")
    print(f"  Estado: {atencion.estado}")
    print(f"  Observaciones: {atencion.observaciones_generales[:50]}...")
    print("\n✓ El serializer extrajo automáticamente paciente y odontólogo de la cita.")
else:
    print(f"\n❌ Error al crear atención:")
    print(json.dumps(serializer.errors, indent=2, ensure_ascii=False))

print("\n" + "="*70 + "\n")
