from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Rol, Usuario, UsuarioRol, Bitacora, UserProfile

admin.site.register(Rol)
admin.site.register(Usuario)
admin.site.register(UsuarioRol)
admin.site.register(Bitacora)

# Personalizar el admin de Django User para mostrar solo el username
try:
	admin.site.unregister(User)
except admin.sites.NotRegistered:
	pass

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = True
    extra = 0
    fields = ("telefono",)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
	# Listado simple
	list_display = ("username", "first_name", "email")
	list_display_links = ("username",)
	search_fields = ("username", "first_name", "email")
	list_filter = ()
	ordering = ("username",)

	# Formulario de edición: sólo los campos solicitados
	fieldsets = (
		(None, {"fields": ("username", "password", "first_name", "email")}),
	)

	# Formulario de creación: sólo los campos solicitados
	add_fieldsets = (
		(None, {
			"classes": ("wide",),
			"fields": ("username", "password1", "password2", "first_name", "email"),
		}),
	)

	# Inline para teléfono del perfil
	inlines = [UserProfileInline]
