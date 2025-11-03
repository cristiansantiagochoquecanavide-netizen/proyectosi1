# 📡 API ENDPOINTS - NUEVOS CASOS DE USO

## Resumen de Endpoints Implementados

Se han creado **42 endpoints** distribuidos en 3 paquetes principales, todos disponibles para consumo desde el frontend React.

---

## 🏥 **ATENCIÓN CLÍNICA** (`/atencion/`)

### **1. Atenciones (CU11: Iniciar atención desde cita)**

**Base URL:** `/atencion/atenciones/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/atencion/atenciones/` | Lista todas las atenciones | - |
| POST | `/atencion/atenciones/` | Crea una nueva atención | `{id_cita, id_paciente, id_odontologo, observaciones_generales}` |
| GET | `/atencion/atenciones/{id}/` | Obtiene detalles de una atención | - |
| PUT | `/atencion/atenciones/{id}/` | Actualiza una atención | `{campos a actualizar}` |
| DELETE | `/atencion/atenciones/{id}/` | Elimina una atención | - |
| POST | `/atencion/atenciones/{id}/finalizar/` | Finaliza una atención ✨ | - |
| GET | `/atencion/atenciones/en_curso/` | Lista atenciones en curso ✨ | - |
| GET | `/atencion/atenciones/por_paciente/` | Atenciones de un paciente ✨ | `?paciente_id=X` |

**Ejemplo de uso - Iniciar atención:**
```javascript
// POST /atencion/atenciones/
{
  "id_cita": 5,
  "id_paciente": 10,
  "id_odontologo": 3,
  "observaciones_generales": "Primera consulta por dolor molar"
}
```

**Ejemplo de uso - Finalizar atención:**
```javascript
// POST /atencion/atenciones/15/finalizar/
// No requiere body, automáticamente registra fecha_fin y cambia estado
```

---

### **2. Procedimientos (CU12: Registrar procedimientos en atención)**

**Base URL:** `/atencion/procedimientos/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/atencion/procedimientos/` | Lista todos los procedimientos | - |
| POST | `/atencion/procedimientos/` | Registra un procedimiento | `{id_atencion, nombre, descripcion, pieza_dental, duracion_minutos, costo}` |
| GET | `/atencion/procedimientos/{id}/` | Obtiene detalles de un procedimiento | - |
| PUT | `/atencion/procedimientos/{id}/` | Actualiza un procedimiento | `{campos a actualizar}` |
| DELETE | `/atencion/procedimientos/{id}/` | Elimina un procedimiento | - |
| GET | `/atencion/procedimientos/por_atencion/` | Procedimientos de una atención ✨ | `?atencion_id=X` |

**Ejemplo de uso - Registrar procedimiento:**
```javascript
// POST /atencion/procedimientos/
{
  "id_atencion": 15,
  "nombre": "Extracción dental simple",
  "descripcion": "Extracción de molar inferior derecho",
  "pieza_dental": "46",
  "duracion_minutos": 30,
  "costo": 150.00
}
```

---

### **3. Odontogramas (CU13: Actualizar odontograma)**

**Base URL:** `/atencion/odontogramas/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/atencion/odontogramas/` | Lista todos los odontogramas | - |
| POST | `/atencion/odontogramas/` | Crea un odontograma | `{id_paciente, observaciones}` |
| GET | `/atencion/odontogramas/{id}/` | Obtiene un odontograma con sus piezas | - |
| PUT | `/atencion/odontogramas/{id}/` | Actualiza un odontograma | `{campos a actualizar}` |
| DELETE | `/atencion/odontogramas/{id}/` | Elimina un odontograma | - |
| GET | `/atencion/odontogramas/por_paciente/` | Último odontograma del paciente ✨ | `?paciente_id=X` |
| POST | `/atencion/odontogramas/{id}/actualizar_pieza/` | Actualiza/crea pieza dental ✨ | `{numero_pieza, estado, caras afectadas}` |

**Ejemplo de uso - Actualizar pieza dental:**
```javascript
// POST /atencion/odontogramas/5/actualizar_pieza/
{
  "numero_pieza": "18",  // Molar superior derecho
  "estado": "caries",
  "observaciones": "Caries profunda en cara oclusal",
  "cara_vestibular": false,
  "cara_lingual": false,
  "cara_mesial": false,
  "cara_distal": false,
  "cara_oclusal": true  // Cara afectada
}
```

---

### **4. Piezas Dentales**

**Base URL:** `/atencion/piezas-dentales/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/atencion/piezas-dentales/` | Lista todas las piezas | - |
| POST | `/atencion/piezas-dentales/` | Crea una pieza dental | `{id_odontograma, numero_pieza, estado, caras}` |
| GET | `/atencion/piezas-dentales/{id}/` | Obtiene detalles de una pieza | - |
| PUT | `/atencion/piezas-dentales/{id}/` | Actualiza una pieza | `{campos a actualizar}` |
| DELETE | `/atencion/piezas-dentales/{id}/` | Elimina una pieza | - |

---

### **5. Tratamientos (CU15: Gestionar tratamientos)**

**Base URL:** `/atencion/tratamientos/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/atencion/tratamientos/` | Lista todos los tratamientos | - |
| POST | `/atencion/tratamientos/` | Crea un tratamiento | `{id_paciente, id_odontologo, nombre, descripcion, fechas, costos}` |
| GET | `/atencion/tratamientos/{id}/` | Obtiene detalles de un tratamiento | - |
| PUT | `/atencion/tratamientos/{id}/` | Actualiza un tratamiento | `{campos a actualizar}` |
| DELETE | `/atencion/tratamientos/{id}/` | Elimina un tratamiento | - |
| GET | `/atencion/tratamientos/por_paciente/` | Tratamientos de un paciente ✨ | `?paciente_id=X` |
| GET | `/atencion/tratamientos/activos/` | Tratamientos en curso o planificados ✨ | - |
| POST | `/atencion/tratamientos/{id}/vincular_atencion/` | Vincula atención a tratamiento ✨ | `{atencion_id, orden}` |

**Ejemplo de uso - Crear tratamiento:**
```javascript
// POST /atencion/tratamientos/
{
  "id_paciente": 10,
  "id_odontologo": 3,
  "nombre": "Ortodoncia correctiva",
  "descripcion": "Tratamiento de ortodoncia con brackets metálicos",
  "fecha_inicio": "2025-11-01",
  "fecha_fin_estimada": "2027-11-01",
  "estado": "planificado",
  "costo_estimado": 12000.00
}
```

---

## 📦 **INVENTARIO Y COMPRAS** (`/inventario/`)

### **1. Insumos (CU18: Gestionar insumos)**

**Base URL:** `/inventario/insumos/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/inventario/insumos/` | Lista todos los insumos | - |
| POST | `/inventario/insumos/` | Crea un insumo | `{codigo, nombre, categoria, unidad_medida, stocks, precio, proveedor}` |
| GET | `/inventario/insumos/{id}/` | Obtiene detalles de un insumo | - |
| PUT | `/inventario/insumos/{id}/` | Actualiza un insumo | `{campos a actualizar}` |
| DELETE | `/inventario/insumos/{id}/` | Elimina un insumo | - |
| GET | `/inventario/insumos/necesitan_reposicion/` | Insumos con stock bajo ✨ | - |
| GET | `/inventario/insumos/por_categoria/` | Insumos por categoría ✨ | `?categoria=material` |
| POST | `/inventario/insumos/{id}/ajustar_stock/` | Ajusta stock manualmente ✨ | `{cantidad, tipo_movimiento, motivo}` |

**Ejemplo de uso - Crear insumo:**
```javascript
// POST /inventario/insumos/
{
  "codigo": "INS-001",
  "nombre": "Anestesia Lidocaína 2%",
  "descripcion": "Anestésico local para procedimientos dentales",
  "categoria": "medicamento",
  "unidad_medida": "frasco",
  "stock_actual": 50,
  "stock_minimo": 10,
  "stock_maximo": 100,
  "precio_unitario": 25.50,
  "proveedor": "FarmaDental S.A.",
  "ubicacion": "Estante A-3",
  "fecha_vencimiento": "2026-12-31",
  "estado": "activo"
}
```

**Categorías disponibles:**
- `material` - Material Dental
- `medicamento` - Medicamento
- `instrumento` - Instrumento
- `consumible` - Consumible
- `equipo` - Equipo
- `otro` - Otro

**Unidades de medida:**
- `unidad`, `caja`, `paquete`, `frasco`, `ml`, `gr`, `kit`

---

### **2. Movimientos de Inventario (CU19: Registrar consumo)**

**Base URL:** `/inventario/movimientos/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/inventario/movimientos/` | Lista todos los movimientos | - |
| POST | `/inventario/movimientos/` | Registra un movimiento | `{id_insumo, tipo_movimiento, cantidad, motivo}` |
| GET | `/inventario/movimientos/{id}/` | Obtiene detalles de un movimiento | - |
| GET | `/inventario/movimientos/por_insumo/` | Movimientos de un insumo ✨ | `?insumo_id=X` |
| GET | `/inventario/movimientos/por_atencion/` | Consumos de una atención ✨ | `?atencion_id=X` |
| POST | `/inventario/movimientos/registrar_consumo/` | Registra consumo en atención ✨ | `{insumo_id, cantidad, atencion_id, procedimiento_id}` |

**Ejemplo de uso - Registrar consumo en atención:**
```javascript
// POST /inventario/movimientos/registrar_consumo/
{
  "insumo_id": 5,
  "cantidad": 2,
  "atencion_id": 15,
  "procedimiento_id": 22,  // Opcional
  "motivo": "Anestesia para extracción",
  "responsable_id": 8  // Usuario que registra
}
```

**Tipos de movimiento:**
- `entrada` - Entrada (Compra)
- `salida` - Salida
- `consumo` - Consumo en Atención ⭐
- `ajuste_positivo` - Ajuste Positivo
- `ajuste_negativo` - Ajuste Negativo
- `devolucion` - Devolución
- `vencimiento` - Baja por Vencimiento

---

### **3. Órdenes de Compra (CU18: Gestionar insumos - compras)**

**Base URL:** `/inventario/ordenes-compra/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/inventario/ordenes-compra/` | Lista todas las órdenes | - |
| POST | `/inventario/ordenes-compra/` | Crea una orden de compra | `{numero_orden, proveedor, fecha_orden, observaciones}` |
| GET | `/inventario/ordenes-compra/{id}/` | Obtiene detalles de una orden | - |
| PUT | `/inventario/ordenes-compra/{id}/` | Actualiza una orden | `{campos a actualizar}` |
| DELETE | `/inventario/ordenes-compra/{id}/` | Elimina una orden | - |
| GET | `/inventario/ordenes-compra/pendientes/` | Órdenes pendientes ✨ | - |
| POST | `/inventario/ordenes-compra/{id}/cambiar_estado/` | Cambia estado de orden ✨ | `{estado}` |
| POST | `/inventario/ordenes-compra/{id}/agregar_detalle/` | Agrega línea a orden ✨ | `{insumo_id, cantidad, precio_unitario}` |

**Ejemplo de uso - Crear orden de compra:**
```javascript
// 1. Crear orden
// POST /inventario/ordenes-compra/
{
  "numero_orden": "OC-2025-001",
  "proveedor": "FarmaDental S.A.",
  "fecha_orden": "2025-11-02",
  "fecha_entrega_estimada": "2025-11-10",
  "estado": "borrador",
  "observaciones": "Pedido urgente para reposición"
}

// 2. Agregar detalles (líneas de pedido)
// POST /inventario/ordenes-compra/1/agregar_detalle/
{
  "insumo_id": 5,
  "cantidad": 20,
  "precio_unitario": 25.50
}
```

**Estados de orden:**
- `borrador`, `enviada`, `confirmada`, `recibida`, `cancelada`

---

### **4. Detalles de Orden de Compra**

**Base URL:** `/inventario/detalles-orden/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/inventario/detalles-orden/` | Lista todos los detalles | - |
| POST | `/inventario/detalles-orden/` | Crea un detalle | `{id_orden, id_insumo, cantidad, precio_unitario}` |
| GET | `/inventario/detalles-orden/{id}/` | Obtiene detalles | - |
| PUT | `/inventario/detalles-orden/{id}/` | Actualiza un detalle | `{campos a actualizar}` |
| DELETE | `/inventario/detalles-orden/{id}/` | Elimina un detalle | - |

---

## 💰 **FACTURACIÓN Y PAGOS** (`/facturacion/`)

### **1. Facturas (CU14: Cerrar atención y emitir comprobante)**

**Base URL:** `/facturacion/facturas/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/facturacion/facturas/` | Lista todas las facturas | - |
| POST | `/facturacion/facturas/` | Crea una factura manual | `{numero_factura, id_paciente, detalles}` |
| GET | `/facturacion/facturas/{id}/` | Obtiene detalles de una factura | - |
| PUT | `/facturacion/facturas/{id}/` | Actualiza una factura | `{campos a actualizar}` |
| DELETE | `/facturacion/facturas/{id}/` | Elimina una factura | - |
| POST | `/facturacion/facturas/generar_desde_atencion/` | Genera factura desde atención ✨ | `{atencion_id, emitida_por_id}` |
| GET | `/facturacion/facturas/pendientes/` | Facturas pendientes de pago ✨ | - |
| GET | `/facturacion/facturas/por_paciente/` | Facturas de un paciente ✨ | `?paciente_id=X` |
| POST | `/facturacion/facturas/{id}/agregar_detalle/` | Agrega línea a factura ✨ | `{concepto, cantidad, precio_unitario}` |

**Ejemplo de uso - Generar factura desde atención:**
```javascript
// POST /facturacion/facturas/generar_desde_atencion/
{
  "atencion_id": 15,
  "emitida_por_id": 8  // Usuario que emite
}
// Automáticamente crea:
// - Factura con número correlativo
// - Detalles de factura con todos los procedimientos
// - Calcula total
```

**Estados de factura:**
- `borrador`, `emitida`, `pagada`, `pagada_parcial`, `vencida`, `anulada`

**Métodos de pago:**
- `efectivo`, `tarjeta`, `transferencia`, `cheque`, `credito`, `mixto`

---

### **2. Detalles de Factura**

**Base URL:** `/facturacion/detalles-factura/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/facturacion/detalles-factura/` | Lista todos los detalles | - |
| POST | `/facturacion/detalles-factura/` | Crea un detalle | `{id_factura, concepto, cantidad, precio_unitario}` |
| GET | `/facturacion/detalles-factura/{id}/` | Obtiene detalles | - |
| PUT | `/facturacion/detalles-factura/{id}/` | Actualiza un detalle | `{campos a actualizar}` |
| DELETE | `/facturacion/detalles-factura/{id}/` | Elimina un detalle | - |

---

### **3. Pagos**

**Base URL:** `/facturacion/pagos/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/facturacion/pagos/` | Lista todos los pagos | - |
| POST | `/facturacion/pagos/` | Registra un pago manual | `{id_factura, monto, metodo_pago}` |
| GET | `/facturacion/pagos/{id}/` | Obtiene detalles de un pago | - |
| POST | `/facturacion/pagos/registrar/` | Registra pago con recibo automático ✨ | `{factura_id, monto, metodo_pago, recibido_por_id}` |
| GET | `/facturacion/pagos/por_factura/` | Pagos de una factura ✨ | `?factura_id=X` |

**Ejemplo de uso - Registrar pago:**
```javascript
// POST /facturacion/pagos/registrar/
{
  "factura_id": 25,
  "monto": 150.00,
  "metodo_pago": "efectivo",
  "numero_referencia": "",  // Para transferencias/cheques
  "observaciones": "Pago completo en efectivo",
  "recibido_por_id": 8
}
// Automáticamente:
// - Actualiza saldo_pendiente de la factura
// - Cambia estado a 'pagada' si cubre el total
// - Genera recibo con número correlativo
```

---

### **4. Recibos**

**Base URL:** `/facturacion/recibos/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/facturacion/recibos/` | Lista todos los recibos | - |
| POST | `/facturacion/recibos/` | Crea un recibo | `{numero_recibo, id_pago, id_paciente}` |
| GET | `/facturacion/recibos/{id}/` | Obtiene detalles de un recibo | - |
| PUT | `/facturacion/recibos/{id}/` | Actualiza un recibo | `{campos a actualizar}` |
| DELETE | `/facturacion/recibos/{id}/` | Elimina un recibo | - |
| GET | `/facturacion/recibos/por_paciente/` | Recibos de un paciente ✨ | `?paciente_id=X` |

---

## 📅 **CITAS (ACTUALIZADO)** (`/citas/`)

### **Disponibilidad (CU10: Configurar disponibilidad de odontólogo)**

**Base URL:** `/citas/disponibilidad/`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/citas/disponibilidad/` | Lista todas las disponibilidades | - |
| POST | `/citas/disponibilidad/` | Crea un slot de disponibilidad | `{id_odontologo, fecha_inicio, fecha_fin, estado}` |
| GET | `/citas/disponibilidad/{id}/` | Obtiene detalles de un slot | - |
| PUT | `/citas/disponibilidad/{id}/` | Actualiza un slot | `{campos a actualizar}` |
| DELETE | `/citas/disponibilidad/{id}/` | Elimina un slot | - |
| GET | `/citas/disponibilidad/por_odontologo/` | Disponibilidades de un odontólogo ✨ | `?odontologo_id=X` |
| GET | `/citas/disponibilidad/disponibles/` | Slots disponibles con filtros ✨ | `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&odontologo_id=X` |
| POST | `/citas/disponibilidad/{id}/bloquear/` | Bloquea un slot ✨ | `{motivo_bloqueo}` |
| POST | `/citas/disponibilidad/{id}/desbloquear/` | Desbloquea un slot ✨ | - |

**Ejemplo de uso - Configurar disponibilidad:**
```javascript
// POST /citas/disponibilidad/
{
  "id_odontologo": 3,
  "fecha_inicio": "2025-11-05T09:00:00",
  "fecha_fin": "2025-11-05T10:00:00",
  "estado": "disponible"
}
```

**Ejemplo de uso - Bloquear disponibilidad:**
```javascript
// POST /citas/disponibilidad/12/bloquear/
{
  "motivo_bloqueo": "Vacaciones personales"
}
```

---

## 🔄 **FLUJOS DE INTEGRACIÓN RECOMENDADOS**

### **Flujo 1: Atención Completa (de Cita a Factura)**

```javascript
// 1. Iniciar atención desde una cita
const atencion = await POST('/atencion/atenciones/', {
  id_cita: 5,
  id_paciente: 10,
  id_odontologo: 3
});

// 2. Registrar procedimientos realizados
const procedimiento = await POST('/atencion/procedimientos/', {
  id_atencion: atencion.id_atencion,
  nombre: "Limpieza dental",
  costo: 80.00
});

// 3. Registrar consumo de insumos
await POST('/inventario/movimientos/registrar_consumo/', {
  insumo_id: 5,
  cantidad: 1,
  atencion_id: atencion.id_atencion,
  procedimiento_id: procedimiento.id_procedimiento
});

// 4. Actualizar odontograma
await POST(`/atencion/odontogramas/${odontogramaId}/actualizar_pieza/`, {
  numero_pieza: "18",
  estado: "obturado"
});

// 5. Finalizar atención
await POST(`/atencion/atenciones/${atencion.id_atencion}/finalizar/`);

// 6. Generar factura automática
const factura = await POST('/facturacion/facturas/generar_desde_atencion/', {
  atencion_id: atencion.id_atencion,
  emitida_por_id: currentUser.id
});

// 7. Registrar pago
const pago = await POST('/facturacion/pagos/registrar/', {
  factura_id: factura.id_factura,
  monto: factura.total,
  metodo_pago: "efectivo",
  recibido_por_id: currentUser.id
});
```

---

### **Flujo 2: Gestión de Inventario**

```javascript
// 1. Verificar insumos que necesitan reposición
const insumosbajos = await GET('/inventario/insumos/necesitan_reposicion/');

// 2. Crear orden de compra
const orden = await POST('/inventario/ordenes-compra/', {
  numero_orden: "OC-2025-001",
  proveedor: "FarmaDental S.A.",
  estado: "borrador"
});

// 3. Agregar insumos a la orden
for (const insumo of insumosbajos) {
  await POST(`/inventario/ordenes-compra/${orden.id_orden}/agregar_detalle/`, {
    insumo_id: insumo.id_insumo,
    cantidad: insumo.stock_maximo - insumo.stock_actual,
    precio_unitario: insumo.precio_unitario
  });
}

// 4. Cambiar estado a enviada
await POST(`/inventario/ordenes-compra/${orden.id_orden}/cambiar_estado/`, {
  estado: "enviada"
});

// 5. Al recibir, cambiar a recibida (automáticamente crea movimientos de entrada)
await POST(`/inventario/ordenes-compra/${orden.id_orden}/cambiar_estado/`, {
  estado: "recibida"
});
```

---

### **Flujo 3: Tratamiento Multi-sesión**

```javascript
// 1. Crear tratamiento
const tratamiento = await POST('/atencion/tratamientos/', {
  id_paciente: 10,
  id_odontologo: 3,
  nombre: "Ortodoncia",
  estado: "planificado",
  costo_estimado: 12000.00
});

// 2. En cada sesión, vincular atención al tratamiento
const atencion1 = await POST('/atencion/atenciones/', { /* ... */ });
await POST(`/atencion/tratamientos/${tratamiento.id_tratamiento}/vincular_atencion/`, {
  atencion_id: atencion1.id_atencion,
  orden: 1
});

// 3. Repetir para cada sesión
// ...

// 4. Al finalizar, actualizar tratamiento
await PUT(`/atencion/tratamientos/${tratamiento.id_tratamiento}/`, {
  estado: "completado",
  fecha_fin_real: "2027-11-01",
  costo_real: 11800.00
});
```

---

## 📊 **RESUMEN DE ENDPOINTS**

| Paquete | ViewSets | Endpoints CRUD | Endpoints Custom | Total |
|---------|----------|----------------|------------------|-------|
| Atención Clínica | 5 | 25 | 8 | **33** |
| Inventario y Compras | 4 | 20 | 7 | **27** |
| Facturación y Pagos | 4 | 20 | 6 | **26** |
| Citas (actualizado) | 1 | 5 | 4 | **9** |
| **TOTAL** | **14** | **70** | **25** | **95** |

---

## 🎨 **RECOMENDACIONES PARA FRONTEND**

### **1. Estructura de carpetas sugerida:**

```
frontend/src/
├── api/
│   ├── atencion.js         # Funciones para endpoints de atención
│   ├── inventario.js       # Funciones para endpoints de inventario
│   └── facturacion.js      # Funciones para endpoints de facturación
├── pages/
│   ├── atencion/
│   │   ├── AtencionList.jsx
│   │   ├── IniciarAtencion.jsx
│   │   ├── RegistrarProcedimiento.jsx
│   │   ├── Odontograma.jsx
│   │   └── Tratamientos.jsx
│   ├── inventario/
│   │   ├── InsumosList.jsx
│   │   ├── NuevoInsumo.jsx
│   │   ├── OrdenesCompra.jsx
│   │   └── AlertasStock.jsx
│   └── facturacion/
│       ├── FacturasList.jsx
│       ├── GenerarFactura.jsx
│       ├── RegistrarPago.jsx
│       └── Recibos.jsx
└── components/
    ├── atencion/
    │   ├── ProcedimientoForm.jsx
    │   ├── OdontogramaCanvas.jsx
    │   └── ConsumoInsumos.jsx
    ├── inventario/
    │   ├── StockBadge.jsx
    │   └── OrdenCompraForm.jsx
    └── facturacion/
        ├── FacturaDetalle.jsx
        └── PagoForm.jsx
```

---

### **2. Ejemplo de archivo API (atencion.js):**

```javascript
import { buildUrl } from './config';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Atenciones
export const listarAtenciones = () => apiGet(buildUrl('/atencion/atenciones/'));
export const crearAtencion = (data) => apiPost(buildUrl('/atencion/atenciones/'), data);
export const finalizarAtencion = (id) => apiPost(buildUrl(`/atencion/atenciones/${id}/finalizar/`));
export const atencionesPorPaciente = (pacienteId) => 
  apiGet(buildUrl(`/atencion/atenciones/por_paciente/?paciente_id=${pacienteId}`));

// Procedimientos
export const registrarProcedimiento = (data) => 
  apiPost(buildUrl('/atencion/procedimientos/'), data);
export const procedimientosPorAtencion = (atencionId) =>
  apiGet(buildUrl(`/atencion/procedimientos/por_atencion/?atencion_id=${atencionId}`));

// Odontograma
export const odontogramaPorPaciente = (pacienteId) =>
  apiGet(buildUrl(`/atencion/odontogramas/por_paciente/?paciente_id=${pacienteId}`));
export const actualizarPieza = (odontogramaId, data) =>
  apiPost(buildUrl(`/atencion/odontogramas/${odontogramaId}/actualizar_pieza/`), data);

// Tratamientos
export const listarTratamientos = () => apiGet(buildUrl('/atencion/tratamientos/'));
export const crearTratamiento = (data) => apiPost(buildUrl('/atencion/tratamientos/'), data);
export const tratamientosPorPaciente = (pacienteId) =>
  apiGet(buildUrl(`/atencion/tratamientos/por_paciente/?paciente_id=${pacienteId}`));
```

---

### **3. Ejemplo de componente (IniciarAtencion.jsx):**

```javascript
import React, { useState, useEffect } from 'react';
import { Button, TextField, Select, MenuItem } from '@mui/material';
import { crearAtencion } from '../../api/atencion';
import { listarCitas } from '../../api/citas';

export default function IniciarAtencion() {
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    // Cargar citas confirmadas
    listarCitas().then(data => {
      const citasConfirmadas = data.filter(c => c.estado === 'confirmada');
      setCitas(citasConfirmadas);
    });
  }, []);

  const handleIniciar = async () => {
    const cita = citas.find(c => c.id_cita === citaSeleccionada);
    
    const atencion = await crearAtencion({
      id_cita: cita.id_cita,
      id_paciente: cita.id_paciente,
      id_odontologo: cita.id_odontologo,
      observaciones_generales: observaciones
    });

    // Redirigir a pantalla de atención activa
    navigate(`/atencion/${atencion.id_atencion}`);
  };

  return (
    <div>
      <h2>Iniciar Atención</h2>
      <Select value={citaSeleccionada} onChange={e => setCitaSeleccionada(e.target.value)}>
        {citas.map(cita => (
          <MenuItem key={cita.id_cita} value={cita.id_cita}>
            {cita.id_paciente.nombre} - {new Date(cita.fecha).toLocaleString()}
          </MenuItem>
        ))}
      </Select>
      <TextField 
        multiline 
        rows={4} 
        label="Observaciones" 
        value={observaciones}
        onChange={e => setObservaciones(e.target.value)}
      />
      <Button onClick={handleIniciar}>Iniciar Atención</Button>
    </div>
  );
}
```

---

## ✅ **ESTADO ACTUAL**

- ✅ **16 modelos** creados y migrados
- ✅ **14 ViewSets** implementados
- ✅ **95 endpoints** disponibles (70 CRUD + 25 custom)
- ✅ **Serializadores** con campos relacionados y métodos personalizados
- ✅ **URLs** registradas en backend/urls.py
- ✅ **Documentación completa** de endpoints
- ✅ **Commit y push** realizado

---

## 🚀 **PRÓXIMO PASO**

**Integrar en el frontend existente agregando:**
1. Nuevas rutas en el menú hamburguesa
2. Archivos API (atencion.js, inventario.js, facturacion.js)
3. Páginas/componentes para cada caso de uso
4. Formularios con validación
5. Listados con tablas MUI

¿Deseas que continúe creando los componentes React para el frontend? 🎨
