from django.contrib import admin
from django.utils.html import format_html
from django import forms
from datetime import date
from .models import Paciente, HistorialClinica, ArchivoClinico


class PacienteAdminForm(forms.ModelForm):
	class Meta:
		model = Paciente
		fields = '__all__'
		widgets = {
			'fecha_nacimiento': forms.SelectDateWidget(
				years=range(date.today().year, 1900 - 1, -1),
				months={
					1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
					7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
				},
				empty_label=("Día", "Mes", "Año")
			)
		}


class PacienteAdmin(admin.ModelAdmin):
	form = PacienteAdminForm


admin.site.register(Paciente, PacienteAdmin)
admin.site.register(HistorialClinica)

@admin.register(ArchivoClinico)
class ArchivoAdmin(admin.ModelAdmin):
	list_display = ('id', 'paciente', 'nombreArchivo', 'fechaAdjunto', 'ver_archivo')
	search_fields = ('nombreArchivo', 'descripcion', 'paciente__nombre')
	list_filter = ('fechaAdjunto',)

	def ver_archivo(self, obj):
		if obj.rutaArchivo and hasattr(obj.rutaArchivo, 'url'):
			archivo_url = obj.rutaArchivo.url
			if archivo_url.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
				return format_html('<img src="{}" style="max-height: 100px;" />', archivo_url)
			elif archivo_url.lower().endswith('.pdf'):
				return format_html('<a href="{}" target="_blank">Ver PDF</a>', archivo_url)
			else:
				return format_html('<a href="{}" target="_blank">Descargar</a>', archivo_url)
		return "No disponible"
	ver_archivo.short_description = "Archivo"
