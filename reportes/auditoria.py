"""
Servicio para registrar acciones en la bitácora
"""
from .models import ReporteDefault
from seguridad_y_personal.models import Usuario
import logging

logger = logging.getLogger(__name__)


def registrar_accion(usuario, tipo_accion, modulo, descripcion, 
                     objeto_tipo=None, objeto_id=None, 
                     datos_anteriores=None, datos_nuevos=None,
                     estado='exitosa', mensaje_error=None,
                     direccion_ip=None, user_agent=None):
    """
    Registra una acción en la bitácora
    
    Args:
        usuario: Instancia de Usuario o None
        tipo_accion: 'crear', 'actualizar', 'eliminar', 'ver', etc
        modulo: 'pacientes', 'citas', 'reportes', etc
        descripcion: Descripción de la acción
        objeto_tipo: Tipo de objeto afectado
        objeto_id: ID del objeto afectado
        datos_anteriores: Dict con datos antes de la acción
        datos_nuevos: Dict con datos después de la acción
        estado: 'exitosa', 'error', 'advertencia'
        mensaje_error: Mensaje de error si aplica
        direccion_ip: IP del cliente
        user_agent: User agent del cliente
    """
    try:
        ReporteDefault.objects.create(
            usuario=usuario,
            tipo_accion=tipo_accion,
            modulo=modulo,
            objeto_tipo=objeto_tipo or '',
            objeto_id=objeto_id,
            descripcion=descripcion,
            datos_anteriores=datos_anteriores or {},
            datos_nuevos=datos_nuevos or {},
            direccion_ip=direccion_ip,
            user_agent=user_agent,
            estado=estado,
            mensaje_error=mensaje_error,
        )
    except Exception as e:
        logger.error(f"Error registrando acción en bitácora: {str(e)}")
