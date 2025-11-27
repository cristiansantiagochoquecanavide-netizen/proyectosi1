from django.contrib import admin
from .models import ReporteFinanciero, ReporteClinico, ReporteDefault, MetaReporte


@admin.register(ReporteFinanciero)
class ReporteFinancieroAdmin(admin.ModelAdmin):
    list_display = ['id_reporte', 'titulo', 'fecha_inicio', 'fecha_fin', 'balance_neto', 'estado']
    list_filter = ['estado', 'fecha_creacion']
    search_fields = ['titulo']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ReporteClinico)
class ReporteClinicoAdmin(admin.ModelAdmin):
    list_display = ['id_reporte', 'titulo', 'fecha_inicio', 'fecha_fin', 'total_atenciones', 'estado']
    list_filter = ['estado', 'tipo_cita', 'fecha_creacion']
    search_fields = ['titulo']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ReporteDefault)
class ReporteDefaultAdmin(admin.ModelAdmin):
    list_display = ['id_registro', 'usuario', 'tipo_accion', 'modulo', 'estado', 'fecha_hora']
    list_filter = ['tipo_accion', 'modulo', 'estado', 'fecha_hora']
    search_fields = ['usuario__username', 'descripcion', 'modulo']
    readonly_fields = ['fecha_hora', 'usuario', 'tipo_accion', 'modulo', 'descripcion', 'datos_anteriores', 'datos_nuevos']
    date_hierarchy = 'fecha_hora'


@admin.register(MetaReporte)
class MetaReporteAdmin(admin.ModelAdmin):
    list_display = ['id_meta', 'tipo_reporte', 'objeto_id', 'etiquetas', 'created_at']
    list_filter = ['tipo_reporte', 'created_at']
    search_fields = ['palabras_clave', 'etiquetas', 'descripcion_indexada']
    readonly_fields = ['created_at', 'updated_at']
