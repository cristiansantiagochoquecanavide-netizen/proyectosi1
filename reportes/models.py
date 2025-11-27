from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
import json


# CU26: Reporte financiero
# - Permite al administrador generar reportes de ingresos, egresos y balances económicos
# - Incluye datos de ventas y compras en rangos de fechas específicos
class ReporteFinanciero(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255, default="Reporte Financiero")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    # Rango de fechas del reporte
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    
    # Datos de ingresos (ventas)
    total_ingresos = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]
    )
    cantidad_facturas = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Datos de egresos (compras e insumos)
    total_egresos = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)]
    )
    cantidad_compras = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Balance general
    balance_neto = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Detalles adicionales
    detalles_por_procedimiento = models.JSONField(default=dict, blank=True)  # Ingresos por tipo de procedimiento
    detalles_por_insumo = models.JSONField(default=dict, blank=True)  # Egresos por insumo
    
    # Auditoría
    generado_por = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reportes_financieros'
    )
    estado = models.CharField(
        max_length=50,
        choices=[
            ('generando', 'Generando'),
            ('completado', 'Completado'),
            ('error', 'Error')
        ],
        default='generando'
    )
    mensaje_error = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Reporte Financiero'
        verbose_name_plural = 'Reportes Financieros'

    def __str__(self):
        return f"Reporte Financiero {self.fecha_inicio} a {self.fecha_fin} - Balance: Bs. {self.balance_neto}"

    def calcular_balance(self):
        """Calcula el balance neto como ingresos menos egresos"""
        self.balance_neto = Decimal(str(self.total_ingresos)) - Decimal(str(self.total_egresos))
        self.save()

    def generar_reporte(self):
        """
        Genera automáticamente los datos del reporte consultando facturas y movimientos de inventario
        Levanta excepción si no hay datos disponibles para el periodo
        """
        from facturacion_y_compras.models import Factura
        from inventario_y_compras.models import MovimientoInventario
        
        # Calcular ingresos desde facturas emitidas
        facturas = Factura.objects.filter(
            fecha_emision__date__range=[self.fecha_inicio, self.fecha_fin],
            estado__in=['emitida', 'pagada', 'pagada_parcial']
        )
        
        # Agregar total de ingresos
        ingresos_agg = facturas.aggregate(
            total=models.Sum('total', output_field=models.DecimalField())
        )
        self.total_ingresos = ingresos_agg['total'] if ingresos_agg['total'] is not None else Decimal('0')
        self.cantidad_facturas = facturas.count()
        
        # Calcular egresos desde movimientos de inventario (compras/consumo)
        movimientos_egreso = MovimientoInventario.objects.filter(
            fecha_movimiento__date__range=[self.fecha_inicio, self.fecha_fin],
            tipo_movimiento__in=['salida', 'consumo', 'devolucion']
        )
        
        # Agregar total de egresos
        egresos_agg = movimientos_egreso.aggregate(
            total=models.Sum(
                models.F('cantidad') * models.F('id_insumo__precio_unitario'),
                output_field=models.DecimalField()
            )
        )
        self.total_egresos = egresos_agg['total'] if egresos_agg['total'] is not None else Decimal('0')
        self.cantidad_compras = movimientos_egreso.count()
        
        # Verificar si hay datos disponibles
        if not facturas.exists() and not movimientos_egreso.exists():
            self.estado = 'error'
            self.mensaje_error = f'No hay datos disponibles para el periodo {self.fecha_inicio} a {self.fecha_fin}'
            raise ValueError(self.mensaje_error)
        
        # Calcular balance
        self.calcular_balance()
        self.estado = 'completado'
        self.save()


# CU27: Reporte Clínico y de Citas
# - Permite a administrador y odontólogo obtener estadísticas sobre atenciones y actividad clínica
class ReporteClinico(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255, default="Reporte Clínico")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    # Rango de fechas
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    
    # Filtros
    id_odontologo = models.ForeignKey(
        'citas.Odontologo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reportes_clinicos'
    )
    
    # Tipos de cita a filtrar
    tipo_cita = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('consulta', 'Consulta'),
            ('procedimiento', 'Procedimiento'),
            ('seguimiento', 'Seguimiento'),
            ('emergencia', 'Emergencia'),
            ('todas', 'Todas'),
        ],
        default='todas'
    )
    
    # Datos de citas
    total_citas = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    citas_completadas = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    citas_canceladas = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    citas_reprogramadas = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Datos de atenciones
    total_atenciones = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    tiempo_promedio_atencion = models.FloatField(default=0.0, validators=[MinValueValidator(0)])  # En minutos
    
    # Datos de procedimientos
    total_procedimientos = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    procedimientos_por_tipo = models.JSONField(default=dict, blank=True)  # {tipo_procedimiento: cantidad}
    
    # Datos de pacientes
    total_pacientes_atendidos = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    pacientes_nuevos = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    pacientes_recurrentes = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Auditoría
    generado_por = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reportes_clinicos'
    )
    estado = models.CharField(
        max_length=50,
        choices=[
            ('generando', 'Generando'),
            ('completado', 'Completado'),
            ('error', 'Error')
        ],
        default='generando'
    )
    mensaje_error = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Reporte Clínico'
        verbose_name_plural = 'Reportes Clínicos'

    def __str__(self):
        return f"Reporte Clínico {self.fecha_inicio} a {self.fecha_fin} - {self.total_atenciones} atenciones"

    def generar_reporte(self):
        """
        Genera automáticamente los datos del reporte consultando citas y atenciones
        Levanta excepción si no hay datos disponibles para los filtros
        """
        from citas.models import Cita
        from atencion.models import Atencion, Procedimiento
        
        # Construir filtros de citas
        filtro_citas = models.Q(
            fecha__date__range=[self.fecha_inicio, self.fecha_fin]
        )
        
        if self.id_odontologo:
            filtro_citas &= models.Q(id_odontologo=self.id_odontologo)
        
        if self.tipo_cita != 'todas':
            filtro_citas &= models.Q(tipo_cita=self.tipo_cita)
        
        # Consultar citas
        citas = Cita.objects.filter(filtro_citas)
        self.total_citas = citas.count()
        self.citas_completadas = citas.filter(estado='completada').count()
        self.citas_canceladas = citas.filter(estado='cancelada').count()
        self.citas_reprogramadas = citas.filter(estado='reprogramada').count()
        
        # Consultar atenciones
        atenciones = Atencion.objects.filter(
            fecha_inicio__date__range=[self.fecha_inicio, self.fecha_fin],
            estado='finalizada'
        )
        
        if self.id_odontologo:
            atenciones = atenciones.filter(id_odontologo=self.id_odontologo)
        
        self.total_atenciones = atenciones.count()
        
        # Calcular tiempo promedio de atención
        if self.total_atenciones > 0:
            tiempos = []
            for atencion in atenciones:
                if atencion.fecha_fin:
                    duracion = (atencion.fecha_fin - atencion.fecha_inicio).total_seconds() / 60
                    tiempos.append(duracion)
            self.tiempo_promedio_atencion = sum(tiempos) / len(tiempos) if tiempos else 0
        
        # Consultar procedimientos
        procedimientos = Procedimiento.objects.filter(
            id_atencion__in=atenciones
        )
        self.total_procedimientos = procedimientos.count()
        
        # Desglose de procedimientos por tipo
        desglose = {}
        for proc in procedimientos:
            proc_type = proc.nombre
            desglose[proc_type] = desglose.get(proc_type, 0) + 1
        self.procedimientos_por_tipo = desglose
        
        # Datos de pacientes
        pacientes_ids = atenciones.values_list('id_paciente', flat=True).distinct()
        self.total_pacientes_atendidos = len(set(pacientes_ids))
        
        # Verificar si hay datos
        if self.total_citas == 0 and self.total_atenciones == 0:
            self.estado = 'error'
            self.mensaje_error = 'No hay datos que coincidan con los filtros especificados'
            raise ValueError(self.mensaje_error)
        
        self.estado = 'completado'
        self.save()


# Reporte Default: Bitácora de acciones
class ReporteDefault(models.Model):
    id_registro = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        'seguridad_y_personal.Usuario',
        on_delete=models.CASCADE,
        related_name='acciones_bitacora'
    )
    
    # Información de la acción
    tipo_accion = models.CharField(
        max_length=50,
        choices=[
            ('crear', 'Crear'),
            ('actualizar', 'Actualizar'),
            ('eliminar', 'Eliminar'),
            ('ver', 'Ver'),
            ('descargar', 'Descargar'),
            ('login', 'Login'),
            ('logout', 'Logout'),
            ('exportar', 'Exportar'),
            ('importar', 'Importar'),
            ('otro', 'Otro'),
        ]
    )
    
    modulo = models.CharField(max_length=100)  # ej: 'citas', 'pacientes', 'facturas'
    objeto_tipo = models.CharField(max_length=100, blank=True)  # ej: 'Cita', 'Paciente'
    objeto_id = models.IntegerField(null=True, blank=True)
    
    # Descripción de la acción
    descripcion = models.TextField(blank=True)
    
    # Datos anteriores y nuevos (para auditoría)
    datos_anteriores = models.JSONField(default=dict, blank=True)
    datos_nuevos = models.JSONField(default=dict, blank=True)
    
    # Dirección IP y dispositivo
    direccion_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamp
    fecha_hora = models.DateTimeField(auto_now_add=True)
    
    # Resultado de la acción
    estado = models.CharField(
        max_length=50,
        choices=[
            ('exitosa', 'Exitosa'),
            ('error', 'Error'),
            ('advertencia', 'Advertencia'),
        ],
        default='exitosa'
    )
    mensaje_error = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Bitácora de Acciones'
        verbose_name_plural = 'Bitácoras de Acciones'
        indexes = [
            models.Index(fields=['usuario', '-fecha_hora']),
            models.Index(fields=['modulo', '-fecha_hora']),
            models.Index(fields=['-fecha_hora']),
        ]

    def __str__(self):
        return f"{self.usuario.username} - {self.tipo_accion} - {self.modulo} - {self.fecha_hora}"


# Meta reporte para búsquedas y filtrados
class MetaReporte(models.Model):
    """
    Almacena metadatos para búsqueda y filtrado de reportes
    Permite búsqueda por fecha, palabra clave, tipo, etc.
    """
    id_meta = models.AutoField(primary_key=True)
    
    # Referencia al reporte
    tipo_reporte = models.CharField(
        max_length=50,
        choices=[
            ('financiero', 'Reporte Financiero'),
            ('clinico', 'Reporte Clínico'),
            ('default', 'Reporte Default'),
        ]
    )
    objeto_id = models.IntegerField()  # ID del reporte (financiero, clínico, etc)
    
    # Palabras clave para búsqueda
    palabras_clave = models.TextField(blank=True, help_text="Separadas por comas")
    
    # Etiquetas
    etiquetas = models.CharField(max_length=255, blank=True)
    
    # Descripción para búsqueda
    descripcion_indexada = models.TextField(blank=True)
    
    # Campos dinámicos para filtro
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Meta Reporte'
        verbose_name_plural = 'Meta Reportes'
        indexes = [
            models.Index(fields=['tipo_reporte', '-created_at']),
            models.Index(fields=['fecha_inicio', 'fecha_fin']),
        ]

    def __str__(self):
        return f"Meta {self.tipo_reporte} - ID {self.objeto_id}"

        self.save()
