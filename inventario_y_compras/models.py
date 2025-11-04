from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal

# CU18: Gestionar insumos
# - Catálogo de insumos odontológicos (materiales, medicamentos, instrumentos)
class Insumo(models.Model):
    id_insumo = models.AutoField(primary_key=True)
    codigo = models.CharField(max_length=50, unique=True)  # Código interno del insumo
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    categoria = models.CharField(max_length=100, choices=[
        ('material', 'Material Dental'),
        ('medicamento', 'Medicamento'),
        ('instrumento', 'Instrumento'),
        ('consumible', 'Consumible'),
        ('equipo', 'Equipo'),
        ('otro', 'Otro')
    ])
    unidad_medida = models.CharField(max_length=50, choices=[
        ('unidad', 'Unidad'),
        ('caja', 'Caja'),
        ('paquete', 'Paquete'),
        ('frasco', 'Frasco'),
        ('ml', 'Mililitro'),
        ('gr', 'Gramo'),
        ('kit', 'Kit')
    ])
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    stock_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    stock_maximo = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    proveedor = models.CharField(max_length=255, blank=True)
    ubicacion = models.CharField(max_length=100, blank=True)  # Ubicación física en el consultorio
    fecha_vencimiento = models.DateField(null=True, blank=True)  # Para medicamentos y materiales perecederos
    estado = models.CharField(max_length=50, choices=[
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('descontinuado', 'Descontinuado')
    ], default='activo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Insumo'
        verbose_name_plural = 'Insumos'

    def __str__(self):
        return f"{self.codigo} - {self.nombre} (Stock: {self.stock_actual} {self.unidad_medida})"

    def necesita_reposicion(self):
        """Verifica si el stock actual está por debajo del mínimo"""
        return self.stock_actual <= self.stock_minimo

    def ajustar_stock(self, cantidad, tipo_movimiento):
        """Ajusta el stock según el tipo de movimiento"""
        # Convertir cantidad a Decimal si no lo es
        if not isinstance(cantidad, Decimal):
            cantidad = Decimal(str(cantidad))
        
        if tipo_movimiento in ['entrada', 'compra', 'devolucion']:
            self.stock_actual += cantidad
        elif tipo_movimiento in ['salida', 'consumo', 'ajuste_negativo']:
            self.stock_actual -= cantidad
        self.save()


# CU19: Registrar consumo en atención
# - Movimientos de inventario (entradas, salidas, consumos)
# - Trazabilidad completa de los insumos
class MovimientoInventario(models.Model):
    id_movimiento = models.AutoField(primary_key=True)
    id_insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE, related_name='movimientos')
    tipo_movimiento = models.CharField(max_length=50, choices=[
        ('entrada', 'Entrada (Compra)'),
        ('salida', 'Salida'),
        ('consumo', 'Consumo en Atención'),
        ('ajuste_positivo', 'Ajuste Positivo'),
        ('ajuste_negativo', 'Ajuste Negativo'),
        ('devolucion', 'Devolución'),
        ('vencimiento', 'Baja por Vencimiento')
    ])
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock_anterior = models.DecimalField(max_digits=10, decimal_places=2)  # Stock antes del movimiento
    stock_posterior = models.DecimalField(max_digits=10, decimal_places=2)  # Stock después del movimiento
    
    # Relación con atención clínica (solo para consumos en atención - CU19)
    id_atencion = models.ForeignKey('atencion.Atencion', on_delete=models.SET_NULL, null=True, blank=True, related_name='consumos')
    id_procedimiento = models.ForeignKey('atencion.Procedimiento', on_delete=models.SET_NULL, null=True, blank=True, related_name='insumos_utilizados')
    
    motivo = models.TextField(blank=True)  # Descripción del motivo del movimiento
    responsable = models.ForeignKey('seguridad_y_personal.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_movimiento = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_movimiento']
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.id_insumo.nombre} ({self.cantidad} {self.id_insumo.unidad_medida})"

    def save(self, *args, **kwargs):
        """Sobrescribe save para actualizar automáticamente el stock del insumo"""
        # Convertir cantidad a Decimal si no lo es
        if not isinstance(self.cantidad, Decimal):
            self.cantidad = Decimal(str(self.cantidad))
        
        # Guardar stock anterior
        if not self.pk:  # Solo en creación
            self.stock_anterior = self.id_insumo.stock_actual
            
            # Ajustar stock según tipo de movimiento
            if self.tipo_movimiento in ['entrada', 'compra', 'devolucion', 'ajuste_positivo']:
                self.id_insumo.stock_actual += self.cantidad
            elif self.tipo_movimiento in ['salida', 'consumo', 'ajuste_negativo', 'vencimiento']:
                self.id_insumo.stock_actual -= self.cantidad
            
            self.stock_posterior = self.id_insumo.stock_actual
            self.id_insumo.save()
        
        super().save(*args, **kwargs)


# Órdenes de compra para gestionar adquisiciones
class OrdenCompra(models.Model):
    id_orden = models.AutoField(primary_key=True)
    numero_orden = models.CharField(max_length=50, unique=True)
    proveedor = models.CharField(max_length=255)
    fecha_orden = models.DateField(default=timezone.now)
    fecha_entrega_estimada = models.DateField(null=True, blank=True)
    fecha_entrega_real = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, choices=[
        ('borrador', 'Borrador'),
        ('enviada', 'Enviada'),
        ('confirmada', 'Confirmada'),
        ('recibida', 'Recibida'),
        ('cancelada', 'Cancelada')
    ], default='borrador')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    impuestos = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    observaciones = models.TextField(blank=True)
    created_by = models.ForeignKey('seguridad_y_personal.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_orden']
        verbose_name = 'Orden de Compra'
        verbose_name_plural = 'Órdenes de Compra'

    def __str__(self):
        return f"OC-{self.numero_orden} - {self.proveedor} ({self.estado})"


# Detalles de la orden de compra (líneas de pedido)
class DetalleOrdenCompra(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    id_orden = models.ForeignKey(OrdenCompra, on_delete=models.CASCADE, related_name='detalles')
    id_insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_recibida = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'Detalle Orden de Compra'
        verbose_name_plural = 'Detalles Órdenes de Compra'

    def __str__(self):
        return f"{self.id_insumo.nombre} - {self.cantidad} {self.id_insumo.unidad_medida}"

    def save(self, *args, **kwargs):
        """Calcula automáticamente el subtotal"""
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)
