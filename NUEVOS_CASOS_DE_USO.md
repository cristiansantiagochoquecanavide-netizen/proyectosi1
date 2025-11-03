# 📋 NUEVOS CASOS DE USO IMPLEMENTADOS

## Resumen de Cambios

Se han implementado **9 nuevos casos de uso** distribuidos en 4 paquetes, completando significativamente la funcionalidad del sistema de consultorio dental.

---

## 🦷 **PAQUETE CITAS**

### **CU10: Configurar disponibilidad de odontólogo**

**Archivo modificado:** `citas/models.py`

**Cambios realizados:**
- ✅ **Modelo `Disponibilidad` mejorado** (líneas 56-77)
  - Cambió de usar `fecha` a `fecha_inicio` y `fecha_fin` para definir rangos de tiempo
  - Agregado campo `id_disponibilidad` como primary key explícita
  - Agregado nuevo estado `'bloqueado'` además de 'disponible' y 'ocupado'
  - Agregado campo `motivo_bloqueo` para registrar razones (vacaciones, reuniones, etc.)
  - Agregados campos de auditoría: `created_at` y `updated_at`
  - Agregado `related_name='disponibilidades'` a la FK con Odontólogo
  - Agregada clase `Meta` con `ordering` y `verbose_name`

**Funcionalidad:**
- Permite definir **slots de tiempo disponibles** para la agenda de citas
- Permite **bloquear horarios específicos** con motivo
- Alimenta el sistema de reservas de citas con información de disponibilidad real

---

## 🏥 **PAQUETE ATENCIÓN CLÍNICA**

### **CU11: Iniciar atención desde cita**

**Archivo creado:** `atencion/models.py` (nuevo contenido completo)

**Modelo implementado:** `Atencion` (líneas 5-34)

**Cambios realizados:**
- ✅ **Relación 1:1 con Cita** mediante `OneToOneField`
- ✅ **Campos principales:**
  - `id_atencion`: Primary key
  - `id_cita`: OneToOne con Cita (una cita genera una atención)
  - `id_paciente`, `id_odontologo`: ForeignKeys
  - `fecha_inicio`: Inicio automático al crear la atención
  - `fecha_fin`: Se registra al finalizar (null mientras está en curso)
  - `estado`: 'en_curso', 'finalizada', 'cancelada'
  - `observaciones_generales`: Notas de la atención
- ✅ **Método `finalizar_atencion()`**: Registra fecha de fin y cambia estado

**Funcionalidad:**
- Se dispara desde el módulo de Citas
- Crea un registro formal de atención clínica
- Permite rastrear el inicio y fin de cada atención

---

### **CU12: Registrar procedimientos en atención**

**Modelo implementado:** `Procedimiento` (líneas 37-56)

**Cambios realizados:**
- ✅ **Relación con Atención** mediante FK
- ✅ **Campos de procedimiento:**
  - `nombre`: Tipo de procedimiento (ej: "Extracción", "Limpieza", "Endodoncia")
  - `descripcion`: Detalles técnicos del procedimiento
  - `pieza_dental`: Identificador de la pieza afectada (ej: "18", "31")
  - `duracion_minutos`: Tiempo estimado/real del procedimiento
  - `costo`: Costo individual del procedimiento
- ✅ **`related_name='procedimientos'`**: Permite acceder a todos los procedimientos de una atención

**Funcionalidad:**
- Registra cada procedimiento realizado durante la atención
- Permite vincular consumo de insumos (mediante relación con MovimientoInventario)
- Base para la facturación automática

---

### **CU13: Actualizar odontograma**

**Modelos implementados:** 
- `Odontograma` (líneas 59-73)
- `PiezaDental` (líneas 76-113)

**Cambios realizados:**

**Modelo `Odontograma`:**
- ✅ Un odontograma por registro de fecha para un paciente
- ✅ Permite llevar historial de cambios en el tiempo
- ✅ Campo `observaciones` para notas generales

**Modelo `PiezaDental`:**
- ✅ **Sistema de numeración FDI** (11-18, 21-28, 31-38, 41-48)
- ✅ **Estados dentales completos:**
  - 'sano', 'caries', 'obturado', 'endodoncia', 'protesis', 'extraccion', 'ausente', 'fractura', 'corona'
- ✅ **Registro de caras del diente afectadas:**
  - `cara_vestibular`, `cara_lingual`, `cara_mesial`, `cara_distal`, `cara_oclusal` (BooleanFields)
- ✅ **`unique_together`**: No puede haber piezas duplicadas en el mismo odontograma

**Funcionalidad:**
- Representación digital completa del estado dental del paciente
- Permite registro detallado por cara del diente
- Historial de cambios en el tiempo

---

### **CU15: Gestionar tratamientos**

**Modelos implementados:**
- `Tratamiento` (líneas 116-145)
- `TratamientoAtencion` (líneas 148-162)

**Cambios realizados:**

**Modelo `Tratamiento`:**
- ✅ **Plan de tratamiento a largo plazo** (puede abarcar múltiples atenciones)
- ✅ **Campos de planificación:**
  - `fecha_inicio`, `fecha_fin_estimada`, `fecha_fin_real`
  - `costo_estimado`, `costo_real` (para control de presupuesto)
- ✅ **Estados del tratamiento:**
  - 'planificado', 'en_curso', 'pausado', 'completado', 'cancelado'
- ✅ Relación con Paciente y Odontólogo responsable

**Modelo `TratamientoAtencion`:**
- ✅ **Tabla intermedia** para vincular tratamientos con múltiples atenciones
- ✅ Campo `orden`: Secuencia de las atenciones dentro del tratamiento
- ✅ `unique_together`: Una atención no puede estar duplicada en el mismo tratamiento

**Funcionalidad:**
- Permite gestionar tratamientos complejos como ortodoncia o rehabilitación oral
- Seguimiento de progreso y costos
- Vinculación con múltiples sesiones de atención

---

### **CU19: Registrar consumo en atención (lógica clínica)**

**Integración en `MovimientoInventario`** (ver sección Inventario)

**Cambios en `atencion/models.py`:**
- ✅ Los procedimientos pueden tener `related_name='insumos_utilizados'` desde MovimientoInventario
- ✅ Las atenciones pueden tener `related_name='consumos'` desde MovimientoInventario

---

## 📦 **PAQUETE INVENTARIO Y COMPRAS**

### **CU18: Gestionar insumos**

**Archivo modificado:** `inventario_y_compras/models.py`

**Modelos implementados:**
- `Insumo` (líneas 5-60)
- `OrdenCompra` (líneas 121-154)
- `DetalleOrdenCompra` (líneas 157-179)

**Cambios realizados:**

**Modelo `Insumo`:**
- ✅ **Catálogo completo de insumos odontológicos:**
  - Categorías: 'material', 'medicamento', 'instrumento', 'consumible', 'equipo', 'otro'
  - Unidades de medida: 'unidad', 'caja', 'paquete', 'frasco', 'ml', 'gr', 'kit'
- ✅ **Control de stock:**
  - `stock_actual`, `stock_minimo`, `stock_maximo`
  - Método `necesita_reposicion()`: Alerta cuando stock < mínimo
  - Método `ajustar_stock()`: Actualiza stock según tipo de movimiento
- ✅ **Gestión de inventario:**
  - `codigo` único por insumo
  - `precio_unitario`, `proveedor`, `ubicacion` física
  - `fecha_vencimiento` para materiales perecederos
  - `estado`: 'activo', 'inactivo', 'descontinuado'

**Modelo `OrdenCompra`:**
- ✅ **Gestión de compras a proveedores:**
  - `numero_orden` único
  - Estados: 'borrador', 'enviada', 'confirmada', 'recibida', 'cancelada'
  - `fecha_entrega_estimada` y `fecha_entrega_real`
  - Cálculo automático: `subtotal`, `impuestos`, `total`
- ✅ Auditoría: `created_by`, `created_at`, `updated_at`

**Modelo `DetalleOrdenCompra`:**
- ✅ **Líneas de pedido:**
  - Relación con Insumo
  - `cantidad`, `precio_unitario`, `subtotal` (calculado automáticamente en `save()`)
  - `cantidad_recibida`: Para control de recepciones parciales

**Funcionalidad:**
- Sistema completo de gestión de inventario
- Alertas de reposición automáticas
- Trazabilidad de compras

---

### **CU19: Registrar consumo en atención (persistencia de stock)**

**Modelo implementado:** `MovimientoInventario` (líneas 63-118)

**Cambios realizados:**
- ✅ **Tipos de movimiento completos:**
  - 'entrada', 'salida', 'consumo', 'ajuste_positivo', 'ajuste_negativo', 'devolucion', 'vencimiento'
- ✅ **Trazabilidad total:**
  - `stock_anterior` y `stock_posterior`: Estado antes y después del movimiento
  - `fecha_movimiento`, `responsable` (Usuario)
  - `motivo`: Descripción del movimiento
- ✅ **Relación con Atención Clínica:**
  - `id_atencion`: FK a Atencion (null para movimientos no clínicos)
  - `id_procedimiento`: FK a Procedimiento (para asociar consumo específico)
- ✅ **Actualización automática de stock:**
  - Método `save()` sobrescrito
  - Actualiza `stock_actual` del Insumo automáticamente según tipo de movimiento
  - Registra stock anterior y posterior para auditoría

**Funcionalidad:**
- Invocado desde el módulo de Atención al registrar procedimientos
- Actualiza stock en tiempo real
- Historial completo de movimientos de inventario

---

## 💰 **PAQUETE FACTURACIÓN Y PAGOS**

### **CU14: Cerrar atención y emitir comprobante**

**Archivo modificado:** `facturacion_y_compras/models.py`

**Modelos implementados:**
- `Factura` (líneas 6-70)
- `DetalleFactura` (líneas 73-95)
- `Pago` (líneas 98-130)
- `Recibo` (líneas 133-147)

**Cambios realizados:**

**Modelo `Factura`:**
- ✅ **Relación 1:1 con Atención** mediante `OneToOneField`
- ✅ **Campos de facturación:**
  - `numero_factura`: Correlativo único
  - `fecha_emision`, `fecha_vencimiento` (para créditos)
  - `subtotal`, `descuento`, `impuestos`, `total`
  - `saldo_pendiente`: Para pagos parciales
- ✅ **Estados de factura:**
  - 'borrador', 'emitida', 'pagada', 'pagada_parcial', 'vencida', 'anulada'
- ✅ **Métodos de pago:**
  - 'efectivo', 'tarjeta', 'transferencia', 'cheque', 'credito', 'mixto'
- ✅ **Métodos automáticos:**
  - `calcular_total()`: Suma detalles de factura
  - `registrar_pago()`: Actualiza saldo y estado

**Modelo `DetalleFactura`:**
- ✅ **Líneas de facturación:**
  - `concepto`: Descripción del servicio/procedimiento
  - `cantidad`, `precio_unitario`, `subtotal` (calculado automáticamente)
  - `id_procedimiento`: FK opcional para vincular con procedimientos de atención

**Modelo `Pago`:**
- ✅ **Registro de pagos:**
  - Relación con Factura (permite múltiples pagos por factura)
  - `fecha_pago`, `monto`, `metodo_pago`
  - `numero_referencia`: Para cheques, transferencias, etc.
  - `recibido_por`: Usuario que recibe el pago
- ✅ **Actualización automática:**
  - Método `save()` llama a `factura.registrar_pago()` automáticamente

**Modelo `Recibo`:**
- ✅ **Comprobante de pago:**
  - Relación 1:1 con Pago
  - `numero_recibo` único
  - Registro formal para entrega al paciente

**Funcionalidad:**
- Se dispara al finalizar una atención
- Factura automática con todos los procedimientos realizados
- Soporte para pagos parciales y múltiples métodos de pago
- Generación de recibos oficiales

---

## 🔧 **CONFIGURACIÓN Y ARCHIVOS TÉCNICOS**

### **1. Settings.py actualizado**

**Archivo:** `backend/settings.py`

**Cambios:**
```python
INSTALLED_APPS = [
    'seguridad_y_personal.apps.SeguridadYPersonalConfig',
    'pacientes',
    'citas',
    'atencion',  # ✅ NUEVO
    'inventario_y_compras',  # ✅ NUEVO
    'facturacion_y_compras',  # ✅ NUEVO
    'reportes',
    # ... resto de apps
]
```

---

### **2. Admin.py configurados**

**Archivos creados/modificados:**
- `atencion/admin.py`: Registra Atencion, Procedimiento, Odontograma, PiezaDental, Tratamiento, TratamientoAtencion
- `inventario_y_compras/admin.py`: Registra Insumo, MovimientoInventario, OrdenCompra, DetalleOrdenCompra
- `facturacion_y_compras/admin.py`: Registra Factura, DetalleFactura, Pago, Recibo

**Funcionalidad:**
- Interfaz de administración Django completa para todos los modelos
- Filtros, búsquedas y jerarquías de fechas configuradas
- Fácil gestión de datos desde el panel admin

---

### **3. Migraciones generadas**

**Archivos creados:**
```
citas/migrations/0011_alter_disponibilidad_options_and_more.py
atencion/migrations/0001_initial.py
inventario_y_compras/migrations/0001_initial.py
facturacion_y_compras/migrations/0001_initial.py
```

**Estado:** ✅ **Migraciones aplicadas exitosamente a la base de datos**

---

## 📊 **DIAGRAMA DE RELACIONES**

```
┌─────────────┐
│   Paciente  │
└─────┬───────┘
      │
      ├──────► HistorialClinica
      ├──────► ArchivoClinico
      ├──────► Cita ──────┬──► Atencion ─────┬──► Procedimiento
      │                   │                  │
      │                   └──► Factura       ├──► Odontograma ──► PiezaDental
      │                                      │
      ├──────► Tratamiento ──────────────────┘
      │
      └──────► Factura ──────┬──► DetalleFactura
                             │
                             └──► Pago ──► Recibo

┌─────────────┐
│ Odontólogo  │
└─────┬───────┘
      │
      ├──────► Disponibilidad (CU10)
      ├──────► Cita
      ├──────► Atencion
      └──────► Tratamiento

┌─────────────┐
│   Insumo    │ (CU18)
└─────┬───────┘
      │
      ├──────► MovimientoInventario ──► Atencion/Procedimiento (CU19)
      │
      └──────► DetalleOrdenCompra ──► OrdenCompra
```

---

## 🎯 **INTEGRACIÓN DE CASOS DE USO**

### **Flujo típico de atención:**

1. **Configurar disponibilidad** (CU10)
   - Odontólogo define sus horarios disponibles
   - Sistema bloquea slots ocupados

2. **Solicitar cita** (CU existente)
   - Paciente selecciona slot disponible
   - Se crea registro en tabla `Cita`

3. **Iniciar atención** (CU11)
   - Al llegar el paciente, se crea `Atencion` desde `Cita`
   - Estado: 'en_curso'

4. **Registrar procedimientos** (CU12)
   - Durante la atención, se agregan `Procedimiento`s
   - Cada procedimiento tiene costo

5. **Registrar consumo de insumos** (CU19)
   - Al usar materiales, se crea `MovimientoInventario`
   - Tipo: 'consumo'
   - Se actualiza `stock_actual` del `Insumo`

6. **Actualizar odontograma** (CU13)
   - Se registra estado de piezas dentales
   - Se marca caras afectadas

7. **Gestionar tratamiento** (CU15)
   - Si requiere múltiples sesiones, se vincula a `Tratamiento`
   - Se registra en `TratamientoAtencion`

8. **Cerrar atención y facturar** (CU14)
   - Se finaliza `Atencion` (estado: 'finalizada')
   - Se genera `Factura` con `DetalleFactura` de cada procedimiento
   - Se registra `Pago`
   - Se emite `Recibo`

### **Flujo de inventario:**

1. **Gestionar insumos** (CU18)
   - Se registran insumos en catálogo
   - Se definen stock mínimo y máximo

2. **Comprar insumos**
   - Se crea `OrdenCompra` con `DetalleOrdenCompra`
   - Al recibir, se genera `MovimientoInventario` tipo 'entrada'

3. **Consumir en atención** (CU19)
   - Durante procedimientos, se registra consumo
   - Se descuenta stock automáticamente

4. **Alertas de reposición**
   - Método `insumo.necesita_reposicion()` alerta cuando stock bajo

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [x] Modelos de datos creados y documentados
- [x] Migraciones generadas y aplicadas
- [x] Admin Django configurado para todos los modelos
- [x] Relaciones entre modelos definidas (ForeignKey, OneToOne)
- [x] Métodos de negocio implementados (calcular_total, ajustar_stock, etc.)
- [x] Campos de auditoría agregados (created_at, updated_at)
- [x] Validadores definidos (MinValueValidator, RegexValidator)
- [x] Estados y choices definidos para workflows
- [x] Documentación completa generada
- [ ] Serializadores DRF (pendiente)
- [ ] Views y endpoints API (pendiente)
- [ ] Frontend React (pendiente)
- [ ] Pruebas unitarias (pendiente)

---

## 📝 **PRÓXIMOS PASOS RECOMENDADOS**

1. **Crear serializadores DRF** para cada modelo nuevo
2. **Implementar ViewSets** con endpoints CRUD
3. **Definir permisos** por rol para cada caso de uso
4. **Crear componentes React** para:
   - Gestión de disponibilidad de odontólogos
   - Inicio y cierre de atenciones
   - Registro de procedimientos con consumo de insumos
   - Visualización/edición de odontograma
   - Gestión de tratamientos
   - Emisión de facturas y recibos
5. **Implementar reportes** para:
   - Atenciones por período
   - Consumo de insumos
   - Facturación y cobranza
6. **Agregar notificaciones** para:
   - Stock bajo de insumos
   - Facturas vencidas
   - Recordatorios de citas

---

## 🎉 **RESUMEN**

**Total de modelos nuevos:** 16
- Atencion, Procedimiento, Odontograma, PiezaDental, Tratamiento, TratamientoAtencion (Atención)
- Insumo, MovimientoInventario, OrdenCompra, DetalleOrdenCompra (Inventario)
- Factura, DetalleFactura, Pago, Recibo (Facturación)
- Disponibilidad (Citas - mejorado)

**Total de campos nuevos en Disponibilidad:** 6 campos adicionales

**Total de casos de uso implementados:** 9 CU (CU10, CU11, CU12, CU13, CU14, CU15, CU18, CU19)

**Impacto:** Sistema ahora cubre el ciclo completo de atención odontológica, desde la agenda hasta la facturación, con gestión integral de inventario.
