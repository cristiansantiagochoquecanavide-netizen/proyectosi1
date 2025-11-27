"""
Middleware para registrar acciones de usuarios en la bitácora (ReporteDefault)
"""
from django.utils.deprecation import MiddlewareMixin
from .models import ReporteDefault
import json
from django.contrib.auth.models import AnonymousUser


class AuditoriaMiddleware(MiddlewareMixin):
    """
    Middleware que registra todas las acciones importantes en la bitácora
    """
    
    # Acciones a registrar por defecto
    ACCIONES_REGISTRABLES = {
        'POST': 'crear',
        'PUT': 'actualizar',
        'PATCH': 'actualizar',
        'DELETE': 'eliminar',
        'GET': 'ver',
    }
    
    # Rutas a monitorear (sin incluir GET para evitar exceso de logs)
    RUTAS_MONITOREADAS = [
        'api/pacientes',
        'api/citas',
        'api/facturas',
        'api/reportes',
        'api/atenciones',
        'api/usuarios',
    ]
    
    def process_request(self, request):
        """Captura información de la solicitud"""
        request.inicio_tiempo = None
        request.datos_originales = None
        
        # Guardar datos de POST/PUT para comparación
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                request.datos_originales = json.loads(request.body) if request.body else {}
            except:
                request.datos_originales = {}
        
        return None
    
    def process_response(self, request, response):
        """Registra la acción completada en la bitácora"""
        
        # Solo registrar acciones en rutas monitoreadas
        if not any(ruta in request.path for ruta in self.RUTAS_MONITOREADAS):
            return response
        
        # No registrar GET requests (para evitar exceso de logs)
        if request.method == 'GET':
            return response
        
        # Skip requests sin usuario autenticado
        if isinstance(request.user, AnonymousUser):
            return response
        
        try:
            # Extraer información
            tipo_accion = self.ACCIONES_REGISTRABLES.get(request.method, 'otro')
            
            # Determinar módulo y tipo de objeto desde la ruta
            ruta_parts = request.path.split('/')
            modulo = self._extraer_modulo(ruta_parts)
            objeto_tipo = self._extraer_objeto_tipo(modulo)
            objeto_id = self._extraer_objeto_id(ruta_parts)
            
            # Determinar descripción
            descripcion = f"{tipo_accion.capitalize()} {objeto_tipo}"
            
            # Obtener datos nuevos
            datos_nuevos = {}
            if response.status_code in [200, 201]:
                try:
                    datos_nuevos = json.loads(response.content)
                except:
                    datos_nuevos = {}
            
            # Determinar estado
            if response.status_code >= 400:
                estado = 'error'
                mensaje_error = f"HTTP {response.status_code}"
            else:
                estado = 'exitosa'
                mensaje_error = ''
            
            # Registrar en la bitácora
            ReporteDefault.objects.create(
                usuario=request.user,
                tipo_accion=tipo_accion,
                modulo=modulo,
                objeto_tipo=objeto_tipo,
                objeto_id=objeto_id,
                descripcion=descripcion,
                datos_anteriores=request.datos_originales or {},
                datos_nuevos=datos_nuevos,
                direccion_ip=self._obtener_ip_cliente(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                estado=estado,
                mensaje_error=mensaje_error,
            )
        
        except Exception as e:
            # No interrumpir la respuesta si hay error en auditoría
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error en auditoría: {str(e)}")
        
        return response
    
    def _extraer_modulo(self, ruta_parts):
        """Extrae el módulo de la ruta"""
        for parte in ruta_parts:
            if parte in ['pacientes', 'citas', 'facturas', 'reportes', 'atenciones', 'usuarios', 'odontologos']:
                return parte
        return 'sistema'
    
    def _extraer_objeto_tipo(self, modulo):
        """Obtiene el tipo de objeto singularizado"""
        mapeo = {
            'pacientes': 'Paciente',
            'citas': 'Cita',
            'facturas': 'Factura',
            'reportes': 'Reporte',
            'atenciones': 'Atención',
            'usuarios': 'Usuario',
            'odontologos': 'Odontólogo',
        }
        return mapeo.get(modulo, 'Objeto')
    
    def _extraer_objeto_id(self, ruta_parts):
        """Intenta extraer el ID del objeto de la ruta"""
        try:
            # Buscar número en la ruta
            for parte in ruta_parts:
                if parte.isdigit():
                    return int(parte)
        except:
            pass
        return None
    
    def _obtener_ip_cliente(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
