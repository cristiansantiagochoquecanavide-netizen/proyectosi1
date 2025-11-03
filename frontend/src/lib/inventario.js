// API para módulo de Inventario y Compras
// CU18-CU19: Gestión de Insumos, Movimientos, Órdenes de Compra
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ============================================
// INSUMOS (CU18: Registrar y gestionar insumos)
// ============================================

export async function listarInsumos() {
  return apiGet('/inventario/insumos/')
}

export async function obtenerInsumo(id) {
  return apiGet(`/inventario/insumos/${id}/`)
}

export async function registrarInsumo(data) {
  return apiPost('/inventario/insumos/', data)
}

export async function actualizarInsumo(id, data) {
  return apiPut(`/inventario/insumos/${id}/`, data)
}

export async function eliminarInsumo(id) {
  return apiDelete(`/inventario/insumos/${id}/`)
}

// Acciones custom
export async function listarInsumosNecesitanReposicion() {
  return apiGet('/inventario/insumos/necesitan_reposicion/')
}

export async function listarInsumosPorCategoria(categoria) {
  return apiGet(`/inventario/insumos/por_categoria/?categoria=${categoria}`)
}

export async function ajustarStockInsumo(insumoId, data) {
  return apiPost(`/inventario/insumos/${insumoId}/ajustar_stock/`, data)
}

// ============================================
// MOVIMIENTOS DE INVENTARIO (CU19: Registrar consumo y movimientos)
// ============================================

export async function listarMovimientos() {
  return apiGet('/inventario/movimientos/')
}

export async function obtenerMovimiento(id) {
  return apiGet(`/inventario/movimientos/${id}/`)
}

export async function registrarMovimiento(data) {
  return apiPost('/inventario/movimientos/', data)
}

export async function actualizarMovimiento(id, data) {
  return apiPut(`/inventario/movimientos/${id}/`, data)
}

export async function eliminarMovimiento(id) {
  return apiDelete(`/inventario/movimientos/${id}/`)
}

// Acciones custom
export async function listarMovimientosPorInsumo(insumoId) {
  return apiGet(`/inventario/movimientos/por_insumo/?insumo_id=${insumoId}`)
}

export async function listarMovimientosPorAtencion(atencionId) {
  return apiGet(`/inventario/movimientos/por_atencion/?atencion_id=${atencionId}`)
}

export async function registrarConsumo(data) {
  return apiPost('/inventario/movimientos/registrar_consumo/', data)
}

// ============================================
// ÓRDENES DE COMPRA (CU19: Gestionar órdenes de compra)
// ============================================

export async function listarOrdenesCompra() {
  return apiGet('/inventario/ordenes-compra/')
}

export async function obtenerOrdenCompra(id) {
  return apiGet(`/inventario/ordenes-compra/${id}/`)
}

export async function crearOrdenCompra(data) {
  return apiPost('/inventario/ordenes-compra/', data)
}

export async function actualizarOrdenCompra(id, data) {
  return apiPut(`/inventario/ordenes-compra/${id}/`, data)
}

export async function eliminarOrdenCompra(id) {
  return apiDelete(`/inventario/ordenes-compra/${id}/`)
}

// Acciones custom
export async function listarOrdenesPendientes() {
  return apiGet('/inventario/ordenes-compra/pendientes/')
}

export async function cambiarEstadoOrden(ordenId, data) {
  return apiPost(`/inventario/ordenes-compra/${ordenId}/cambiar_estado/`, data)
}

export async function agregarDetalleOrden(ordenId, data) {
  return apiPost(`/inventario/ordenes-compra/${ordenId}/agregar_detalle/`, data)
}

// ============================================
// DETALLES DE ORDEN DE COMPRA
// ============================================

export async function listarDetallesOrden() {
  return apiGet('/inventario/detalles-orden/')
}

export async function obtenerDetalleOrden(id) {
  return apiGet(`/inventario/detalles-orden/${id}/`)
}

export async function crearDetalleOrden(data) {
  return apiPost('/inventario/detalles-orden/', data)
}

export async function actualizarDetalleOrden(id, data) {
  return apiPut(`/inventario/detalles-orden/${id}/`, data)
}

export async function eliminarDetalleOrden(id) {
  return apiDelete(`/inventario/detalles-orden/${id}/`)
}
