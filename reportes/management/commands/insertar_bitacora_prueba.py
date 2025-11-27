from django.core.management.base import BaseCommand
from reportes.models import ReporteDefault
from seguridad_y_personal.models import Usuario
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Inserta datos de prueba en la bitácora de acciones'

    def handle(self, *args, **options):
        # Obtener o crear un usuario del sistema
        usuario_sistema = Usuario.objects.first()
        if not usuario_sistema:
            usuario_sistema = Usuario.objects.create(
                username='admin',
                nombre='Administrador',
                correo='admin@clinica.com',
                contrasena='hash_password',
                estado='activo'
            )
            self.stdout.write(self.style.SUCCESS('Usuario del sistema creado'))

        # Insertar registros de prueba
        acciones_prueba = [
            {
                'tipo_accion': 'crear',
                'modulo': 'pacientes',
                'objeto_tipo': 'Paciente',
                'objeto_id': 1,
                'descripcion': 'Se creó nuevo paciente Juan Pérez',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'actualizar',
                'modulo': 'pacientes',
                'objeto_tipo': 'Paciente',
                'objeto_id': 1,
                'descripcion': 'Se actualizó teléfono del paciente',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'crear',
                'modulo': 'citas',
                'objeto_tipo': 'Cita',
                'objeto_id': 5,
                'descripcion': 'Se programó cita para el 2025-12-10',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'crear',
                'modulo': 'facturas',
                'objeto_tipo': 'Factura',
                'objeto_id': 12,
                'descripcion': 'Se emitió factura por servicios dentales',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'crear',
                'modulo': 'reportes',
                'objeto_tipo': 'ReporteFinanciero',
                'objeto_id': 1,
                'descripcion': 'Se generó reporte financiero mensual',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'ver',
                'modulo': 'reportes',
                'objeto_tipo': 'ReporteFinanciero',
                'objeto_id': 1,
                'descripcion': 'Se consultó reporte financiero',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'descargar',
                'modulo': 'reportes',
                'objeto_tipo': 'ReporteFinanciero',
                'objeto_id': 1,
                'descripcion': 'Se descargó reporte financiero en JSON',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'eliminar',
                'modulo': 'pacientes',
                'objeto_tipo': 'Paciente',
                'objeto_id': 10,
                'descripcion': 'Se intentó eliminar paciente',
                'estado': 'error',
                'mensaje_error': 'Paciente tiene citas asociadas'
            },
            {
                'tipo_accion': 'crear',
                'modulo': 'atenciones',
                'objeto_tipo': 'Atencion',
                'objeto_id': 7,
                'descripcion': 'Se registró nueva atención clínica',
                'estado': 'exitosa'
            },
            {
                'tipo_accion': 'actualizar',
                'modulo': 'citas',
                'objeto_tipo': 'Cita',
                'objeto_id': 5,
                'descripcion': 'Se reprogramó cita para el 2025-12-12',
                'estado': 'exitosa'
            },
        ]

        # Insertar con timestamps distribuidos
        now = datetime.now()
        count = 0
        
        for i, accion in enumerate(acciones_prueba):
            # Distribuir en los últimos 7 días
            dias_atras = i % 7
            timestamp = now - timedelta(days=dias_atras, hours=i % 8)
            
            obj = ReporteDefault(
                usuario=usuario_sistema,
                tipo_accion=accion['tipo_accion'],
                modulo=accion['modulo'],
                objeto_tipo=accion['objeto_tipo'],
                objeto_id=accion['objeto_id'],
                descripcion=accion['descripcion'],
                estado=accion['estado'],
                mensaje_error=accion.get('mensaje_error', ''),
                direccion_ip='127.0.0.1',
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            )
            obj.fecha_hora = timestamp
            obj.save()
            count += 1

        self.stdout.write(self.style.SUCCESS(f'✅ {count} registros de prueba insertados en la bitácora'))

