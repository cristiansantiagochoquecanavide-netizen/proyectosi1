from django.contrib import admin
from .models import Cita, Odontologo, Disponibilidad, EvaluacionSatisfaccion
from .forms import OdontologoForm

class OdontologoAdmin(admin.ModelAdmin):
    form = OdontologoForm
    list_display = ('nombre', 'especialidad', 'telefono', 'email', 'matricula_profesional')
    search_fields = ('nombre', 'especialidad', 'matricula_profesional', 'email')

class CitaAdmin(admin.ModelAdmin):
    pass  # Sin filtro, muestra todos los odontólogos

class EvaluacionSatisfaccionAdmin(admin.ModelAdmin):
    list_display = ('id_evaluacion', 'id_cita', 'get_nivel_display', 'fecha_registro', 'id_odontologo')
    list_filter = ('nivel_satisfaccion', 'fecha_registro', 'id_odontologo')
    search_fields = ('id_cita__id_paciente__nombre', 'id_odontologo__nombre')
    readonly_fields = ('fecha_registro', 'actualizado_en')
    
    def get_nivel_display(self, obj):
        return obj.get_nivel_satisfaccion_display()
    get_nivel_display.short_description = 'Nivel de Satisfacción'

admin.site.register(Cita, CitaAdmin)
admin.site.register(Odontologo, OdontologoAdmin)
admin.site.register(Disponibilidad)
admin.site.register(EvaluacionSatisfaccion, EvaluacionSatisfaccionAdmin)
