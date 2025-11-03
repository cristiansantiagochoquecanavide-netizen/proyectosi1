// API para Disponibilidad de Odontólogos (CU10)
// Calendario de disponibilidad y gestión de horarios
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ============================================
// DISPONIBILIDAD (CU10: Configurar disponibilidad)
// ============================================

export async function listarDisponibilidad() {
  return apiGet('/citas/disponibilidad/')
}

export async function obtenerDisponibilidad(id) {
  return apiGet(`/citas/disponibilidad/${id}/`)
}

export async function crearDisponibilidad(data) {
  return apiPost('/citas/disponibilidad/', data)
}

export async function actualizarDisponibilidad(id, data) {
  return apiPut(`/citas/disponibilidad/${id}/`, data)
}

export async function eliminarDisponibilidad(id) {
  return apiDelete(`/citas/disponibilidad/${id}/`)
}

// Acciones custom
export async function listarDisponibilidadPorOdontologo(odontologoId) {
  return apiGet(`/citas/disponibilidad/por_odontologo/?odontologo_id=${odontologoId}`)
}

export async function listarDisponibilidadesDisponibles() {
  return apiGet('/citas/disponibilidad/disponibles/')
}

export async function bloquearDisponibilidad(id, data) {
  return apiPost(`/citas/disponibilidad/${id}/bloquear/`, data)
}

export async function desbloquearDisponibilidad(id) {
  return apiPost(`/citas/disponibilidad/${id}/desbloquear/`)
}
