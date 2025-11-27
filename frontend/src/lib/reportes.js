// API para módulo de Reportes
// CU26: Reportes Financieros
// CU27: Reportes Clínicos
import { apiGet, apiPost, apiDelete } from './api'

// ============================================
// REPORTES FINANCIEROS (CU26)
// ============================================

export async function listarReportesFinancieros() {
  return apiGet('/reportes/financieros/')
}

export async function obtenerReporteFinanciero(id) {
  return apiGet(`/reportes/financieros/${id}/`)
}

export async function generarReporteFinanciero(data) {
  return apiPost('/reportes/financieros/generar_reporte/', data)
}

export async function descargarReporte(id) {
  return apiGet(`/reportes/financieros/${id}/descargar/`)
}

export async function filtrarReportesPorRango(fechaInicio, fechaFin) {
  const params = new URLSearchParams({
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  })
  return apiGet(`/reportes/financieros/por_rango/?${params}`)
}

export async function eliminarReporte(id) {
  return apiDelete(`/reportes/financieros/${id}/`)
}

// ============================================
// REPORTES CLÍNICOS Y DE CITAS (CU27)
// ============================================

export async function listarReportesClinico() {
  return apiGet('/reportes/clinicos/')
}

export async function obtenerReporteClinico(id) {
  return apiGet(`/reportes/clinicos/${id}/`)
}

export async function generarReporteClinico(data) {
  return apiPost('/reportes/clinicos/generar_reporte/', data)
}

export async function descargarReporteClinico(id) {
  return apiGet(`/reportes/clinicos/${id}/exportar/`)
}

export async function filtrarReportesClinicoPorRango(fechaInicio, fechaFin, idOdontologo = null) {
  let url = `/reportes/clinicos/por_rango/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
  if (idOdontologo) {
    url += `&id_odontologo=${idOdontologo}`
  }
  return apiGet(url)
}

export async function eliminarReporteClinico(id) {
  return apiDelete(`/reportes/clinicos/${id}/`)
}

// ============================================
// BITÁCORA DE ACCIONES (REPORTE DEFAULT)
// ============================================

export async function listarBitacora() {
  return apiGet('/seguridad/api/bitacoras/')
}

export async function obtenerBitacoraUsuario(usuarioId) {
  return apiGet(`/seguridad/api/bitacoras/?id_usuario=${usuarioId}`)
}

export async function obtenerBitacoraModulo(modulo, tipoAccion = null) {
  let url = `/seguridad/api/bitacoras/?modulo=${modulo}`
  if (tipoAccion) {
    url += `&tipo_accion=${tipoAccion}`
  }
  return apiGet(url)
}

export async function obtenerBitacoraFecha(fechaInicio, fechaFin) {
  const params = new URLSearchParams({
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  })
  return apiGet(`/reportes/default/por_fecha/?${params}`)
}

// ============================================
// META REPORTES (BÚSQUEDA Y FILTRADO)
// ============================================

export async function listarMetaReportes() {
  return apiGet('/reportes/meta/')
}

export async function buscarReportesPorPalabra(palabra, tipoReporte = null) {
  let url = `/reportes/meta/buscar_por_palabra/?palabra=${encodeURIComponent(palabra)}`
  if (tipoReporte) {
    url += `&tipo_reporte=${tipoReporte}`
  }
  return apiGet(url)
}

export async function buscarReportesPorFecha(fechaInicio, fechaFin) {
  const params = new URLSearchParams({
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  })
  return apiGet(`/reportes/meta/buscar_por_fecha/?${params}`)
}

export async function buscarReportesPorEtiqueta(etiqueta) {
  const params = new URLSearchParams({
    etiqueta: etiqueta,
  })
  return apiGet(`/reportes/meta/buscar_por_etiqueta/?${params}`)
}

export async function crearMetaReporte(data) {
  return apiPost('/reportes/meta/', data)
}
