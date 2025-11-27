# 📊 CU26 - Reporte Financiero - Guía de Endpoints

## Descripción General
El caso de uso CU26 permite al administrador generar reportes de ingresos, egresos y balances económicos en rangos de fechas específicos.

## Endpoints REST

### 1. Generar Nuevo Reporte Financiero
**POST** `/reportes/financieros/generar_reporte/`

**Body (JSON):**
```json
{
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-12-31",
  "titulo": "Reporte Financiero 2025"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id_reporte": 1,
  "titulo": "Reporte Financiero 2025",
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-12-31",
  "total_ingresos": 5000.00,
  "cantidad_facturas": 10,
  "total_egresos": 2000.00,
  "cantidad_compras": 5,
  "balance_neto": 3000.00,
  "detalles_por_procedimiento": {},
  "detalles_por_insumo": {},
  "generado_por": 1,
  "generado_por_nombre": "admin",
  "estado": "completado",
  "mensaje_error": null,
  "created_at": "2025-11-26T10:30:00Z",
  "updated_at": "2025-11-26T10:30:00Z"
}
```

**Error - Sin Datos Disponibles (400):**
```json
{
  "warning": "No hay datos disponibles para el periodo 2025-01-01 a 2025-12-31",
  "reporte": {
    "id_reporte": 2,
    "estado": "error",
    "mensaje_error": "No hay datos disponibles para el periodo 2025-01-01 a 2025-12-31",
    ...
  }
}
```

### 2. Listar Todos los Reportes
**GET** `/reportes/financieros/`

**Respuesta (200):**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id_reporte": 5,
      "titulo": "Reporte Financiero 2025",
      ...
    }
  ]
}
```

### 3. Obtener Reporte Específico
**GET** `/reportes/financieros/{id}/`

**Parámetro:** `id` (id_reporte)

**Respuesta (200):**
```json
{
  "id_reporte": 1,
  "titulo": "Reporte Financiero 2025",
  ...
}
```

### 4. Descargar Reporte
**GET** `/reportes/financieros/{id}/descargar/`

**Respuesta (200):**
```json
{
  "reporte": {
    "id_reporte": 1,
    "titulo": "Reporte Financiero 2025",
    ...
  },
  "formato": "json",
  "timestamp": "2025-11-26T10:35:00Z"
}
```

### 5. Filtrar Reportes por Rango de Fechas
**GET** `/reportes/financieros/por_rango/?fecha_inicio=2025-01-01&fecha_fin=2025-12-31`

**Parámetros Query:**
- `fecha_inicio` (opcional): YYYY-MM-DD
- `fecha_fin` (opcional): YYYY-MM-DD

**Respuesta (200):**
```json
[
  {
    "id_reporte": 1,
    ...
  },
  {
    "id_reporte": 2,
    ...
  }
]
```

## Campos del Modelo

| Campo | Tipo | Descripción | Editable |
|-------|------|-------------|----------|
| `id_reporte` | Integer | Identificador único | No |
| `titulo` | String(255) | Nombre del reporte | Sí |
| `fecha_inicio` | Date | Inicio del período | Sí |
| `fecha_fin` | Date | Fin del período | Sí |
| `total_ingresos` | Decimal(12,2) | Suma de facturas emitidas | No |
| `cantidad_facturas` | Integer | Número de facturas | No |
| `total_egresos` | Decimal(12,2) | Suma de movimientos de salida | No |
| `cantidad_compras` | Integer | Número de transacciones | No |
| `balance_neto` | Decimal(12,2) | Ingresos - Egresos | No |
| `detalles_por_procedimiento` | JSON | Desglose de ingresos | No |
| `detalles_por_insumo` | JSON | Desglose de egresos | No |
| `generado_por` | FK (Usuario) | Administrador que lo generó | No |
| `estado` | String | 'generando' / 'completado' / 'error' | No |
| `mensaje_error` | Text | Descripción de errores | No |
| `created_at` | DateTime | Fecha de creación | No |
| `updated_at` | DateTime | Última actualización | No |

## Ejemplo de Flujo Completo

### Paso 1: Generar Reporte
```bash
curl -X POST http://localhost:8000/reportes/financieros/generar_reporte/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-11-26",
    "titulo": "Reporte Noviembre 2025"
  }'
```

### Paso 2: Descargar Reporte
```bash
curl -X GET http://localhost:8000/reportes/financieros/1/descargar/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Paso 3: Exportar a CSV/PDF (Frontend)
El JSON retornado puede ser procesado en el frontend para exportar a CSV o PDF.

## Validaciones

1. **Rango de fechas:**
   - `fecha_fin` debe ser >= `fecha_inicio`
   - Se valida antes de generar el reporte

2. **Disponibilidad de datos:**
   - Si no hay facturas ni movimientos de inventario en el período
   - Se lanza excepción con mensaje descriptivo
   - El reporte se crea con estado 'error'

3. **Autenticación:**
   - Requiere usuario autenticado
   - Usuario registrado en campo `generado_por`

## Casos de Uso Relacionados

- **CU14:** Cerrar atención y emitir comprobante (genera facturas consultadas)
- **CU18:** Registrar entrada de insumo (genera movimientos de inventario)
- **CU19:** Registrar salida de insumo (genera movimientos de inventario)

## Notas de Implementación

- El modelo consulta datos en tiempo real desde `Factura` y `MovimientoInventario`
- Los reportes se almacenan en la BD para historial y auditoría
- El estado 'generando' se usa para futuras implementaciones asincrónicas
- Los detalles JSON permiten futura expansión de análisis
