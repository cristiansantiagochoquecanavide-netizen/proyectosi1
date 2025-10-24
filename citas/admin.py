from django.contrib import admin
from .models import Cita, Odontologo, Disponibilidad
from .forms import OdontologoForm

class OdontologoAdmin(admin.ModelAdmin):
    form = OdontologoForm
    list_display = ('nombre', 'especialidad', 'telefono', 'email', 'matricula_profesional')
    search_fields = ('nombre', 'especialidad', 'matricula_profesional', 'email')

class CitaAdmin(admin.ModelAdmin):
    pass  # Sin filtro, muestra todos los odontólogos

admin.site.register(Cita, CitaAdmin)
admin.site.register(Odontologo, OdontologoAdmin)
admin.site.register(Disponibilidad)
