from django.contrib import admin
from .models import (
    Atencion, Procedimiento, Odontograma, PiezaDental, 
    Tratamiento, TratamientoAtencion
)

@admin.register(Atencion)
class AtencionAdmin(admin.ModelAdmin):
    list_display = ('id_atencion', 'id_paciente', 'id_odontologo', 'fecha_inicio', 'estado')
    list_filter = ('estado', 'fecha_inicio')
    search_fields = ('id_paciente__nombre', 'id_odontologo__nombre')
    date_hierarchy = 'fecha_inicio'

@admin.register(Procedimiento)
class ProcedimientoAdmin(admin.ModelAdmin):
    list_display = ('id_procedimiento', 'nombre', 'id_atencion', 'pieza_dental', 'costo')
    list_filter = ('nombre', 'created_at')
    search_fields = ('nombre', 'descripcion')

@admin.register(Odontograma)
class OdontogramaAdmin(admin.ModelAdmin):
    list_display = ('id_odontograma', 'id_paciente', 'fecha_registro')
    list_filter = ('fecha_registro',)
    search_fields = ('id_paciente__nombre',)

@admin.register(PiezaDental)
class PiezaDentalAdmin(admin.ModelAdmin):
    list_display = ('id_pieza', 'numero_pieza', 'estado', 'id_odontograma')
    list_filter = ('estado',)
    search_fields = ('numero_pieza',)

@admin.register(Tratamiento)
class TratamientoAdmin(admin.ModelAdmin):
    list_display = ('id_tratamiento', 'nombre', 'id_paciente', 'estado', 'fecha_inicio')
    list_filter = ('estado', 'fecha_inicio')
    search_fields = ('nombre', 'id_paciente__nombre')

@admin.register(TratamientoAtencion)
class TratamientoAtencionAdmin(admin.ModelAdmin):
    list_display = ('id_tratamiento', 'id_atencion', 'orden')
    list_filter = ('id_tratamiento',)
