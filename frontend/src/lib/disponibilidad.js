// API para Disponibilidad de Odontólogos (CU10)
// Calendario de disponibilidad y gestión de horarios
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ============================================
// DISPONIBILIDAD (CU10: Configurar disponibilidad)
// ============================================

export async function listarDisponibilidad() {
  return apiGet('/citas/api/disponibilidades/')
}

export async function obtenerDisponibilidad(id) {
  return apiGet(`/citas/api/disponibilidades/${id}/`)
}

export async function crearDisponibilidad(data) {
  return apiPost('/citas/api/disponibilidades/', data)
}

export async function actualizarDisponibilidad(id, data) {
  return apiPut(`/citas/api/disponibilidades/${id}/`, data)
}

export async function eliminarDisponibilidad(id) {
  return apiDelete(`/citas/api/disponibilidades/${id}/`)
}

// Acciones custom
export async function listarDisponibilidadPorOdontologo(odontologoId) {
  return apiGet(`/citas/api/disponibilidades/por_odontologo/?odontologo_id=${odontologoId}`)
}

export async function listarDisponibilidadesDisponibles() {
  return apiGet('/citas/api/disponibilidades/disponibles/')
}

export async function bloquearDisponibilidad(id, data) {
  return apiPost(`/citas/api/disponibilidades/${id}/bloquear/`, data)
}

export async function desbloquearDisponibilidad(id) {
  return apiPost(`/citas/api/disponibilidades/${id}/desbloquear/`)
}
