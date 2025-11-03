from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal

# CU14: Cerrar atención y emitir comprobante
# - Factura generada al finalizar una atención
# - Incluye todos los procedimientos y consumos realizados
class Factura(models.Model):
    id_factura = models.AutoField(primary_key=True)
    numero_factura = models.CharField(max_length=50, unique=True)  # Número correlativo de factura
    id_atencion = models.OneToOneField('atencion.Atencion', on_delete=models.CASCADE, related_name='factura')
    id_paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE, related_name='facturas')
    
    fecha_emision = models.DateTimeField(default=timezone.now)
    fecha_vencimiento = models.DateField(null=True, blank=True)  # Para pagos a crédito
    
    # Montos
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    impuestos = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    saldo_pendiente = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Para pagos parciales
    
    estado = models.CharField(max_length=50, choices=[
        ('borrador', 'Borrador'),
        ('emitida', 'Emitida'),
        ('pagada', 'Pagada'),
        ('pagada_parcial', 'Pagada Parcialmente'),
        ('vencida', 'Vencida'),
        ('anulada', 'Anulada')
    ], default='borrador')
    
    metodo_pago = models.CharField(max_length=50, choices=[
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia'),
        ('cheque', 'Cheque'),
        ('credito', 'Crédito'),
        ('mixto', 'Pago Mixto')
    ], blank=True)
    
    observaciones = models.TextField(blank=True)
    emitida_por = models.ForeignKey('seguridad_y_personal.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_emision']
        verbose_name = 'Factura'
        verbose_name_plural = 'Facturas'

    def __str__(self):
        return f"Factura #{self.numero_factura} - {self.id_paciente.nombre} - Bs. {self.total}"

    def calcular_total(self):
        """Calcula el total de la factura basado en los detalles"""
        detalles = self.detalles.all()
        self.subtotal = sum(detalle.subtotal for detalle in detalles)
        self.total = self.subtotal - self.descuento + self.impuestos
        self.saldo_pendiente = self.total
        self.save()

    def registrar_pago(self, monto):
        """Registra un pago y actualiza el saldo pendiente"""
        self.saldo_pendiente -= Decimal(str(monto))
        if self.saldo_pendiente <= 0:
            self.estado = 'pagada'
            self.saldo_pendiente = 0
        elif self.saldo_pendiente < self.total:
            self.estado = 'pagada_parcial'
        self.save()


# Detalles de la factura (líneas de facturación)
class DetalleFactura(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    id_factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='detalles')
    concepto = models.CharField(max_length=255)  # Descripción del servicio/procedimiento
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, default=1, validators=[MinValueValidator(0)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Opcional: Referencia al procedimiento de atención
    id_procedimiento = models.ForeignKey('atencion.Procedimiento', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['id_detalle']
        verbose_name = 'Detalle de Factura'
        verbose_name_plural = 'Detalles de Facturas'

    def __str__(self):
        return f"{self.concepto} - Bs. {self.subtotal}"

    def save(self, *args, **kwargs):
        """Calcula automáticamente el subtotal"""
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)


# Registro de pagos (para facturas con pagos parciales o múltiples métodos de pago)
class Pago(models.Model):
    id_pago = models.AutoField(primary_key=True)
    id_factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='pagos')
    fecha_pago = models.DateTimeField(default=timezone.now)
    monto = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    metodo_pago = models.CharField(max_length=50, choices=[
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia'),
        ('cheque', 'Cheque')
    ])
    numero_referencia = models.CharField(max_length=100, blank=True)  # Número de cheque, transacción, etc.
    observaciones = models.TextField(blank=True)
    recibido_por = models.ForeignKey('seguridad_y_personal.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_pago']
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

    def __str__(self):
        return f"Pago #{self.id_pago} - Factura {self.id_factura.numero_factura} - Bs. {self.monto}"

    def save(self, *args, **kwargs):
        """Al guardar el pago, actualiza el saldo de la factura"""
        super().save(*args, **kwargs)
        if not self.pk:  # Solo en creación
            self.id_factura.registrar_pago(self.monto)


# Comprobantes de pago (recibos)
class Recibo(models.Model):
    id_recibo = models.AutoField(primary_key=True)
    numero_recibo = models.CharField(max_length=50, unique=True)
    id_pago = models.OneToOneField(Pago, on_delete=models.CASCADE, related_name='recibo')
    id_paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE)
    fecha_emision = models.DateTimeField(default=timezone.now)
    observaciones = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha_emision']
        verbose_name = 'Recibo'
        verbose_name_plural = 'Recibos'

    def __str__(self):
        return f"Recibo #{self.numero_recibo} - Bs. {self.id_pago.monto}"
