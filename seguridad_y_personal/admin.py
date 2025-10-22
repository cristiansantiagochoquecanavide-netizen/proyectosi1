from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Rol, Usuario, UsuarioRol, Bitacora

admin.site.register(Rol)
admin.site.register(Usuario)
admin.site.register(UsuarioRol)
admin.site.register(Bitacora)

# Personalizar el admin de Django User para mostrar solo el username
try:
	admin.site.unregister(User)
except admin.sites.NotRegistered:
	pass

@admin.register(User)
class UserAdmin(BaseUserAdmin):
	list_display = ("username",)
	list_display_links = ("username",)
	# Opcional: simplificar también búsqueda y filtros
	search_fields = ("username",)
	list_filter = ()
	ordering = ("username",)
	# Evitar mostrar nombres en columnas del listado
	fieldsets = BaseUserAdmin.fieldsets
