import os
from rest_framework.permissions import BasePermission
from .models import UsuarioRol


class RolesPermission(BasePermission):
    """Permiso basado en roles del módulo seguridad_y_personal.
    - Usa request.session['usuario_id'] para identificar al usuario.
    - El ViewSet puede definir:
        * roles_per_action: dict { action_name: [roles_permitidos] }
        * allow_unauthenticated_actions: lista de actions que no requieren sesión (p.ej. login, logout, me)
      Si la acción no está en roles_per_action, se permite por defecto.
    """

    message = 'No autorizado'

    def has_permission(self, request, view):
        # Bypass total (sin permisos) controlado por variable de entorno
        # Útil para ambientes donde no se desea filtrar por rol
        if os.getenv('DISABLE_ROLE_PERMS', '').lower() in ('1', 'true', 'yes', 'on'):
            return True

        action = getattr(view, 'action', None)

        # Acciones explícitamente permitidas sin sesión
        allow_unauth = getattr(view, 'allow_unauthenticated_actions', []) or []
        if action in allow_unauth:
            return True

        user_id = request.session.get('usuario_id')
        if not user_id:
            # 401 NotAuthenticated
            return False

        roles_map = getattr(view, 'roles_per_action', {}) or {}
        roles_needed = roles_map.get(action)
        if not roles_needed:
            # Si la acción no está mapeada, permitimos por defecto
            return True

        # Roles del usuario (normalizados a minúsculas)
        user_roles = set(
            r.strip().lower() for r in
            UsuarioRol.objects.filter(id_usuario_id=user_id).values_list('id_rol__nombre_rol', flat=True)
            if r
        )
        needed = set((r or '').strip().lower() for r in roles_needed)
        return bool(user_roles & needed)
