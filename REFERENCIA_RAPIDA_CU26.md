# ⚡ REFERENCIA RÁPIDA - CU26 REPORTE FINANCIERO

## 🎯 En 30 Segundos

**CU26** permite que un administrador genere reportes financieros (ingresos - egresos = balance) para un rango de fechas específico.

---

## 📍 Ubicación del Código

```
proyecto de si1/reportes/
├── models.py      ← Lógica del reporte
├── views.py       ← Endpoints REST
├── serializers.py ← Formato JSON
└── urls.py        ← Rutas
```

---

## 🔌 5 Endpoints Principales

```bash
# 1. GENERAR REPORTE
POST /reportes/financieros/generar_reporte/
Body: {"fecha_inicio":"2025-01-01", "fecha_fin":"2025-12-31"}

# 2. LISTAR REPORTES
GET /reportes/financieros/

# 3. OBTENER UNO
GET /reportes/financieros/{id}/

# 4. DESCARGAR
GET /reportes/financieros/{id}/descargar/

# 5. FILTRAR
GET /reportes/financieros/por_rango/?fecha_inicio=...&fecha_fin=...
```

---

## 📊 Flujo Resumido

```
Cliente solicita reporte
         ↓
Valida fechas (fin ≥ inicio)
         ↓
Crea ReporteFinanciero en BD
         ↓
Consulta Facturas (ingresos)
Consulta Movimientos Inventario (egresos)
         ↓
¿Hay datos? 
  ├─ No → Error + Excepción
  └─ Sí → balance = ingresos - egresos
         ↓
Retorna JSON con reporte
```

---

## 📋 Campos del Reporte

| Campo | Descripción |
|-------|-------------|
| `id_reporte` | ID único |
| `titulo` | Nombre del reporte |
| `fecha_inicio`/`fecha_fin` | Período |
| `total_ingresos` | Suma de facturas |
| `total_egresos` | Suma de consumos |
| `balance_neto` | Ingresos - Egresos |
| `estado` | generando/completado/error |
| `generado_por` | Usuario administrador |

---

## 🚀 Ejecutar Pruebas

```bash
python test_reporte_financiero.py
```

---

## ✅ Validaciones

- ✅ Fecha fin ≥ fecha inicio
- ✅ No hay datos = Error manejado
- ✅ Cálculo correcto de balance
- ✅ Auditoría (quién generó)
- ✅ Timestamps automáticos

---

## 📁 Documentación

| Archivo | Propósito |
|---------|-----------|
| `CU26_REPORTE_FINANCIERO.md` | Endpoints + ejemplos |
| `IMPLEMENTACION_CU26.md` | Resumen técnico |
| `RESUMEN_EJECUTIVO_CU26.md` | Visión ejecutiva |
| `ESTADO_PROYECTO.md` | Estado general |
| `INDICE_ARCHIVOS_CU26.md` | Índice completo |

---

## 🔐 Integración

Consulta datos de:
- **CU14:** Factura (ingresos)
- **CU18-19:** MovimientoInventario (egresos)
- **Usuarios:** Auditoría

---

## 🎓 Ejemplo cURL

```bash
# Generar reporte
curl -X POST http://localhost:8000/reportes/financieros/generar_reporte/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-11-30",
    "titulo": "Reporte Noviembre"
  }'

# Respuesta exitosa (201)
{
  "id_reporte": 1,
  "titulo": "Reporte Noviembre",
  "total_ingresos": 5000.00,
  "total_egresos": 2000.00,
  "balance_neto": 3000.00,
  "estado": "completado",
  ...
}
```

---

## ⚠️ Errores Comunes

| Error | Solución |
|-------|----------|
| 400 No hay datos | Normal si período sin actividad |
| 400 Fecha inválida | fin debe ser ≥ inicio |
| 401 No autenticado | Usar Authorization header |
| 500 Error servidor | Ver logs del backend |

---

## 📈 Próximos Pasos

1. Frontend: Crear formulario de reportes
2. Frontend: Tabla de visualización
3. Frontend: Exportar a PDF/CSV
4. Frontend: Gráficos de ingresos/egresos

---

## 🎉 Status

**✅ IMPLEMENTADO Y PROBADO**
- Código: 100% completado
- Pruebas: 100% pasadas  
- Documentación: Completa
- Listo para producción

---

Última actualización: 26 de noviembre de 2025
