// API para módulo de Facturación y Pagos
// CU14: Generar facturas, registrar pagos, emitir recibos
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ============================================
// FACTURAS (CU14: Generar y gestionar facturas)
// ============================================

export async function listarFacturas() {
  return apiGet('/facturacion/facturas/')
}

export async function obtenerFactura(id) {
  return apiGet(`/facturacion/facturas/${id}/`)
}

export async function crearFactura(data) {
  return apiPost('/facturacion/facturas/', data)
}

export async function actualizarFactura(id, data) {
  return apiPut(`/facturacion/facturas/${id}/`, data)
}

export async function eliminarFactura(id) {
  return apiDelete(`/facturacion/facturas/${id}/`)
}

// Acciones custom
export async function generarFacturaDesdeAtencion(data) {
  return apiPost('/facturacion/facturas/generar_desde_atencion/', data)
}

export async function listarFacturasPendientes() {
  return apiGet('/facturacion/facturas/pendientes/')
}

export async function listarFacturasPorPaciente(pacienteId) {
  return apiGet(`/facturacion/facturas/por_paciente/?paciente_id=${pacienteId}`)
}

export async function agregarDetalleFactura(facturaId, data) {
  return apiPost(`/facturacion/facturas/${facturaId}/agregar_detalle/`, data)
}

// ============================================
// DETALLES DE FACTURA
// ============================================

export async function listarDetallesFactura() {
  return apiGet('/facturacion/detalles-factura/')
}

export async function obtenerDetalleFactura(id) {
  return apiGet(`/facturacion/detalles-factura/${id}/`)
}

export async function crearDetalleFactura(data) {
  return apiPost('/facturacion/detalles-factura/', data)
}

export async function actualizarDetalleFactura(id, data) {
  return apiPut(`/facturacion/detalles-factura/${id}/`, data)
}

export async function eliminarDetalleFactura(id) {
  return apiDelete(`/facturacion/detalles-factura/${id}/`)
}

// ============================================
// PAGOS (CU14: Registrar pagos)
// ============================================

export async function listarPagos() {
  return apiGet('/facturacion/pagos/')
}

export async function obtenerPago(id) {
  return apiGet(`/facturacion/pagos/${id}/`)
}

export async function crearPago(data) {
  return apiPost('/facturacion/pagos/', data)
}

export async function actualizarPago(id, data) {
  return apiPut(`/facturacion/pagos/${id}/`, data)
}

export async function eliminarPago(id) {
  return apiDelete(`/facturacion/pagos/${id}/`)
}

// Acciones custom
export async function registrarPago(data) {
  return apiPost('/facturacion/pagos/registrar/', data)
}

export async function listarPagosPorFactura(facturaId) {
  return apiGet(`/facturacion/pagos/por_factura/?factura_id=${facturaId}`)
}

// ============================================
// RECIBOS (CU14: Emitir recibos)
// ============================================

export async function listarRecibos() {
  return apiGet('/facturacion/recibos/')
}

export async function obtenerRecibo(id) {
  return apiGet(`/facturacion/recibos/${id}/`)
}

export async function crearRecibo(data) {
  return apiPost('/facturacion/recibos/', data)
}

export async function actualizarRecibo(id, data) {
  return apiPut(`/facturacion/recibos/${id}/`, data)
}

export async function eliminarRecibo(id) {
  return apiDelete(`/facturacion/recibos/${id}/`)
}

// Acciones custom
export async function listarRecibosPorPaciente(pacienteId) {
  return apiGet(`/facturacion/recibos/por_paciente/?paciente_id=${pacienteId}`)
}

export async function obtenerReciboPorPago(pagoId) {
  return apiGet(`/facturacion/recibos/por_pago/?pago_id=${pagoId}`)
}
