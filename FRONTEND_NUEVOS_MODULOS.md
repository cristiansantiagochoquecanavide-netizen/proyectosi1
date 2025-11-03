# Guía de Implementación Frontend - Nuevos Módulos

## 📋 Resumen de Cambios

Se han agregado **4 archivos API** y actualizado el **Navbar** para integrar los nuevos módulos de:
- ✅ Atención Clínica (CU11-CU15, CU19)
- ✅ Inventario y Compras (CU18-CU19)
- ✅ Facturación y Pagos (CU14)
- ✅ Disponibilidad de Odontólogos (CU10)

---

## 📁 Archivos API Creados

### 1. `frontend/src/lib/atencion.js` (33 funciones)

**Endpoints para Atenciones:**
- `listarAtenciones()` - GET /atencion/atenciones/
- `crearAtencion(data)` - POST /atencion/atenciones/
- `finalizarAtencion(id)` - POST /atencion/atenciones/{id}/finalizar/
- `listarAtencionesEnCurso()` - GET /atencion/atenciones/en_curso/
- `listarAtencionesPorPaciente(pacienteId)` - GET /atencion/atenciones/por_paciente/

**Endpoints para Procedimientos:**
- `registrarProcedimiento(data)` - POST /atencion/procedimientos/
- `listarProcedimientosPorAtencion(atencionId)` - GET /atencion/procedimientos/por_atencion/

**Endpoints para Odontogramas:**
- `obtenerOdontogramaPorPaciente(pacienteId)` - GET /atencion/odontogramas/por_paciente/
- `actualizarPiezaDental(odontogramaId, data)` - POST /atencion/odontogramas/{id}/actualizar_pieza/

**Endpoints para Tratamientos:**
- `listarTratamientosPorPaciente(pacienteId)` - GET /atencion/tratamientos/por_paciente/
- `listarTratamientosActivos()` - GET /atencion/tratamientos/activos/
- `vincularAtencionATratamiento(tratamientoId, data)` - POST /atencion/tratamientos/{id}/vincular_atencion/

### 2. `frontend/src/lib/inventario.js` (27 funciones)

**Endpoints para Insumos:**
- `listarInsumos()` - GET /inventario/insumos/
- `registrarInsumo(data)` - POST /inventario/insumos/
- `listarInsumosNecesitanReposicion()` - GET /inventario/insumos/necesitan_reposicion/
- `listarInsumosPorCategoria(categoria)` - GET /inventario/insumos/por_categoria/
- `ajustarStockInsumo(insumoId, data)` - POST /inventario/insumos/{id}/ajustar_stock/

**Endpoints para Movimientos:**
- `registrarMovimiento(data)` - POST /inventario/movimientos/
- `listarMovimientosPorInsumo(insumoId)` - GET /inventario/movimientos/por_insumo/
- `registrarConsumo(data)` - POST /inventario/movimientos/registrar_consumo/

**Endpoints para Órdenes de Compra:**
- `crearOrdenCompra(data)` - POST /inventario/ordenes-compra/
- `listarOrdenesPendientes()` - GET /inventario/ordenes-compra/pendientes/
- `cambiarEstadoOrden(ordenId, data)` - POST /inventario/ordenes-compra/{id}/cambiar_estado/

### 3. `frontend/src/lib/facturacion.js` (26 funciones)

**Endpoints para Facturas:**
- `listarFacturas()` - GET /facturacion/facturas/
- `crearFactura(data)` - POST /facturacion/facturas/
- `generarFacturaDesdeAtencion(data)` - POST /facturacion/facturas/generar_desde_atencion/
- `listarFacturasPendientes()` - GET /facturacion/facturas/pendientes/
- `listarFacturasPorPaciente(pacienteId)` - GET /facturacion/facturas/por_paciente/

**Endpoints para Pagos:**
- `registrarPago(data)` - POST /facturacion/pagos/registrar/
- `listarPagosPorFactura(facturaId)` - GET /facturacion/pagos/por_factura/

**Endpoints para Recibos:**
- `listarRecibosPorPaciente(pacienteId)` - GET /facturacion/recibos/por_paciente/
- `obtenerReciboPorPago(pagoId)` - GET /facturacion/recibos/por_pago/

### 4. `frontend/src/lib/disponibilidad.js` (9 funciones)

**Endpoints para Disponibilidad:**
- `listarDisponibilidad()` - GET /citas/disponibilidad/
- `crearDisponibilidad(data)` - POST /citas/disponibilidad/
- `listarDisponibilidadPorOdontologo(odontologoId)` - GET /citas/disponibilidad/por_odontologo/
- `listarDisponibilidadesDisponibles()` - GET /citas/disponibilidad/disponibles/
- `bloquearDisponibilidad(id, data)` - POST /citas/disponibilidad/{id}/bloquear/
- `desbloquearDisponibilidad(id)` - POST /citas/disponibilidad/{id}/desbloquear/

---

## 🎨 Actualización del Navbar

Se han agregado **3 nuevas secciones principales** con submenús:

### Atención (Nuevo)
- Iniciar Atención → `/atencion/iniciar`
- Listado Atenciones → `/atencion`
- Odontograma → `/atencion/odontograma`
- Tratamientos → `/atencion/tratamientos`

### Inventario (Expandido)
- Listado Insumos → `/inventario`
- Nuevo Insumo → `/inventario/nuevo`
- Alertas Stock → `/inventario/alertas`
- Movimientos → `/inventario/movimientos`
- Órdenes de Compra → `/inventario/ordenes`

### Facturación (Expandido)
- Listado Facturas → `/facturacion`
- Generar Factura → `/facturacion/nueva`
- Registrar Pago → `/facturacion/pago`
- Recibos → `/facturacion/recibos`

### Citas (Actualizado)
- Nuevo item: **Disponibilidad** → `/citas/disponibilidad`

---

## 🚀 Próximos Pasos

### 1. Crear Componentes React

Necesitas crear los componentes para cada ruta definida en el Navbar:

#### Atención Clínica (4 componentes)
```
frontend/src/components/atencion/
├── IniciarAtencion.jsx     (Formulario para crear atención desde cita)
├── ListadoAtenciones.jsx   (Tabla con filtros por paciente/estado)
├── Odontograma.jsx         (Interfaz gráfica de 32 piezas dentales)
└── Tratamientos.jsx        (Gestión de tratamientos planificados)
```

#### Inventario (5 componentes)
```
frontend/src/components/inventario/
├── ListadoInsumos.jsx      (Tabla con stock actual/mínimo/máximo)
├── NuevoInsumo.jsx         (Formulario de registro)
├── AlertasStock.jsx        (Insumos bajo stock mínimo)
├── Movimientos.jsx         (Historial de entradas/salidas/consumo)
└── OrdenesCompra.jsx       (Gestión de órdenes de compra)
```

#### Facturación (4 componentes)
```
frontend/src/components/facturacion/
├── ListadoFacturas.jsx     (Tabla con filtros por paciente/estado)
├── GenerarFactura.jsx      (Formulario manual o desde atención)
├── RegistrarPago.jsx       (Formulario de pago + generación de recibo)
└── Recibos.jsx             (Listado y visualización de recibos)
```

#### Disponibilidad (1 componente)
```
frontend/src/components/citas/
└── Disponibilidad.jsx      (Calendario de gestión de horarios)
```

### 2. Actualizar Rutas en App.jsx

Debes agregar las rutas en tu archivo de routing principal:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar componentes de atención
import IniciarAtencion from './components/atencion/IniciarAtencion';
import ListadoAtenciones from './components/atencion/ListadoAtenciones';
import Odontograma from './components/atencion/Odontograma';
import Tratamientos from './components/atencion/Tratamientos';

// Importar componentes de inventario
import ListadoInsumos from './components/inventario/ListadoInsumos';
import NuevoInsumo from './components/inventario/NuevoInsumo';
import AlertasStock from './components/inventario/AlertasStock';
import Movimientos from './components/inventario/Movimientos';
import OrdenesCompra from './components/inventario/OrdenesCompra';

// Importar componentes de facturación
import ListadoFacturas from './components/facturacion/ListadoFacturas';
import GenerarFactura from './components/facturacion/GenerarFactura';
import RegistrarPago from './components/facturacion/RegistrarPago';
import Recibos from './components/facturacion/Recibos';

// Importar componente de disponibilidad
import Disponibilidad from './components/citas/Disponibilidad';

// En el return de tu App:
<Routes>
  {/* Atención */}
  <Route path="/atencion/iniciar" element={<IniciarAtencion />} />
  <Route path="/atencion" element={<ListadoAtenciones />} />
  <Route path="/atencion/odontograma" element={<Odontograma />} />
  <Route path="/atencion/tratamientos" element={<Tratamientos />} />
  
  {/* Inventario */}
  <Route path="/inventario" element={<ListadoInsumos />} />
  <Route path="/inventario/nuevo" element={<NuevoInsumo />} />
  <Route path="/inventario/alertas" element={<AlertasStock />} />
  <Route path="/inventario/movimientos" element={<Movimientos />} />
  <Route path="/inventario/ordenes" element={<OrdenesCompra />} />
  
  {/* Facturación */}
  <Route path="/facturacion" element={<ListadoFacturas />} />
  <Route path="/facturacion/nueva" element={<GenerarFactura />} />
  <Route path="/facturacion/pago" element={<RegistrarPago />} />
  <Route path="/facturacion/recibos" element={<Recibos />} />
  
  {/* Disponibilidad */}
  <Route path="/citas/disponibilidad" element={<Disponibilidad />} />
</Routes>
```

### 3. Ejemplos de Uso de API

#### Ejemplo 1: Iniciar Atención desde Cita

```jsx
import { crearAtencion } from '../../lib/atencion';

const handleIniciarAtencion = async (citaId) => {
  try {
    const data = {
      id_cita: citaId,
      motivo_consulta: 'Control de rutina',
      observaciones: 'Paciente en buen estado general'
    };
    const response = await crearAtencion(data);
    console.log('Atención creada:', response);
    // Navegar a la página de atención
    navigate(`/atencion/${response.id}`);
  } catch (error) {
    console.error('Error al crear atención:', error);
  }
};
```

#### Ejemplo 2: Registrar Consumo de Insumo

```jsx
import { registrarConsumo } from '../../lib/inventario';

const handleRegistrarConsumo = async (atencionId, insumoId, cantidad) => {
  try {
    const data = {
      atencion_id: atencionId,
      insumo_id: insumoId,
      cantidad: cantidad,
      observaciones: 'Usado en procedimiento'
    };
    const response = await registrarConsumo(data);
    console.log('Consumo registrado:', response);
    // Stock se actualiza automáticamente en el backend
  } catch (error) {
    console.error('Error al registrar consumo:', error);
  }
};
```

#### Ejemplo 3: Generar Factura desde Atención

```jsx
import { generarFacturaDesdeAtencion } from '../../lib/facturacion';

const handleGenerarFactura = async (atencionId) => {
  try {
    const data = {
      atencion_id: atencionId,
      incluir_insumos: true // Incluir consumo de insumos
    };
    const response = await generarFacturaDesdeAtencion(data);
    console.log('Factura generada:', response);
    // Los procedimientos se agregan automáticamente
  } catch (error) {
    console.error('Error al generar factura:', error);
  }
};
```

#### Ejemplo 4: Registrar Pago y Generar Recibo

```jsx
import { registrarPago } from '../../lib/facturacion';

const handleRegistrarPago = async (facturaId, monto, metodoPago) => {
  try {
    const data = {
      id_factura: facturaId,
      monto: monto,
      metodo_pago: metodoPago, // 'efectivo', 'tarjeta', 'transferencia'
      observaciones: ''
    };
    const response = await registrarPago(data);
    console.log('Pago registrado:', response);
    console.log('Recibo generado:', response.recibo);
    // El recibo se genera automáticamente en el backend
  } catch (error) {
    console.error('Error al registrar pago:', error);
  }
};
```

---

## 📊 Estructura de Datos

### Atención
```json
{
  "id_cita": 1,
  "motivo_consulta": "Dolor en muela",
  "diagnostico": "Caries profunda",
  "observaciones": "Requiere endodoncia",
  "estado": "en_curso"
}
```

### Procedimiento
```json
{
  "id_atencion": 1,
  "nombre": "Obturación",
  "descripcion": "Obturación con composite",
  "pieza_dental": "16",
  "duracion_minutos": 45,
  "costo": 150.00
}
```

### Insumo
```json
{
  "nombre": "Composite A2",
  "codigo": "COMP-A2-001",
  "categoria": "material",
  "stock_actual": 10,
  "stock_minimo": 5,
  "stock_maximo": 50,
  "unidad_medida": "unidad",
  "precio_unitario": 45.00
}
```

### Factura
```json
{
  "id_paciente": 1,
  "fecha_emision": "2025-01-15",
  "estado": "emitida",
  "observaciones": "Pago en 2 cuotas"
}
```

---

## 🔐 Consideraciones de Seguridad

Todos los endpoints usan:
- ✅ CSRF Token (ensureCsrfCookie)
- ✅ Session Authentication (credentials: 'include')
- ✅ Manejo de errores 401/403

---

## 📝 Notas Importantes

1. **Actualización Automática de Stock**: Al registrar un movimiento de tipo 'consumo' o 'salida', el stock se actualiza automáticamente en el backend.

2. **Generación Automática de Recibos**: Al registrar un pago, el recibo se genera automáticamente.

3. **Cálculo Automático de Totales**: Las facturas calculan su total automáticamente sumando los detalles.

4. **Validaciones en Backend**: Todos los endpoints tienen validaciones de datos y permisos.

5. **Sistema FDI de Numeración Dental**: El odontograma usa numeración del 11 al 48 (estándar internacional).

---

## 🎯 Casos de Uso Implementados

- ✅ **CU10**: Configurar disponibilidad de odontólogos
- ✅ **CU11**: Iniciar atención desde cita programada
- ✅ **CU12**: Registrar procedimientos durante atención
- ✅ **CU13**: Actualizar odontograma del paciente
- ✅ **CU14**: Generar factura y registrar pagos
- ✅ **CU15**: Gestionar tratamientos planificados
- ✅ **CU18**: Registrar y gestionar insumos
- ✅ **CU19**: Registrar consumo y órdenes de compra

---

## 📚 Documentación Adicional

- Ver `API_ENDPOINTS.md` para detalles completos de los 95 endpoints
- Ver `NUEVOS_CASOS_DE_USO.md` para descripción de los 16 modelos
- Ver `ARQUITECTURA.md` para arquitectura general del sistema
