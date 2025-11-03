// Cancela una atención
export async function cancelarAtencion(id) {
  return apiPost(`/atencion/atenciones/${id}/cancelar/`, {});
}
// API para módulo de Atención Clínica
// CU11-CU15, CU19: Atenciones, Procedimientos, Odontogramas, Tratamientos
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ============================================
// ATENCIONES (CU11: Iniciar atención desde cita)
// ============================================

export async function listarAtenciones() {
  return apiGet('/atencion/atenciones/')
}

export async function obtenerAtencion(id) {
  return apiGet(`/atencion/atenciones/${id}/`)
}

export async function crearAtencion(data) {
  return apiPost('/atencion/atenciones/', data)
}

export async function actualizarAtencion(id, data) {
  return apiPut(`/atencion/atenciones/${id}/`, data)
}

export async function eliminarAtencion(id) {
  return apiDelete(`/atencion/atenciones/${id}/`)
}

// Acciones custom
export async function finalizarAtencion(id) {
  return apiPost(`/atencion/atenciones/${id}/finalizar/`)
}

export async function listarAtencionesEnCurso() {
  return apiGet('/atencion/atenciones/en_curso/')
}

export async function listarAtencionesPorPaciente(pacienteId) {
  return apiGet(`/atencion/atenciones/por_paciente/?paciente_id=${pacienteId}`)
}

// ============================================
// PROCEDIMIENTOS (CU12: Registrar procedimientos en atención)
// ============================================

export async function listarProcedimientos() {
  return apiGet('/atencion/procedimientos/')
}

export async function obtenerProcedimiento(id) {
  return apiGet(`/atencion/procedimientos/${id}/`)
}

export async function registrarProcedimiento(data) {
  return apiPost('/atencion/procedimientos/', data)
}

export async function actualizarProcedimiento(id, data) {
  return apiPut(`/atencion/procedimientos/${id}/`, data)
}

export async function eliminarProcedimiento(id) {
  return apiDelete(`/atencion/procedimientos/${id}/`)
}

// Acciones custom
export async function listarProcedimientosPorAtencion(atencionId) {
  return apiGet(`/atencion/procedimientos/por_atencion/?atencion_id=${atencionId}`)
}

// ============================================
// ODONTOGRAMAS (CU13: Actualizar odontograma)
// ============================================

export async function listarOdontogramas() {
  return apiGet('/atencion/odontogramas/')
}

export async function obtenerOdontograma(id) {
  return apiGet(`/atencion/odontogramas/${id}/`)
}

export async function crearOdontograma(data) {
  return apiPost('/atencion/odontogramas/', data)
}

export async function actualizarOdontograma(id, data) {
  return apiPut(`/atencion/odontogramas/${id}/`, data)
}

export async function eliminarOdontograma(id) {
  return apiDelete(`/atencion/odontogramas/${id}/`)
}

// Acciones custom
export async function obtenerOdontogramaPorPaciente(pacienteId) {
  return apiGet(`/atencion/odontogramas/por_paciente/?paciente_id=${pacienteId}`)
}

export async function actualizarPiezaDental(odontogramaId, data) {
  return apiPost(`/atencion/odontogramas/${odontogramaId}/actualizar_pieza/`, data)
}

// ============================================
// PIEZAS DENTALES
// ============================================

export async function listarPiezasDentales() {
  return apiGet('/atencion/piezas-dentales/')
}

export async function obtenerPiezaDental(id) {
  return apiGet(`/atencion/piezas-dentales/${id}/`)
}

export async function crearPiezaDental(data) {
  return apiPost('/atencion/piezas-dentales/', data)
}

export async function actualizarPiezaDentalDirecto(id, data) {
  return apiPut(`/atencion/piezas-dentales/${id}/`, data)
}

export async function eliminarPiezaDental(id) {
  return apiDelete(`/atencion/piezas-dentales/${id}/`)
}

// ============================================
// TRATAMIENTOS (CU15: Gestionar tratamientos)
// ============================================

export async function listarTratamientos() {
  return apiGet('/atencion/tratamientos/')
}

export async function obtenerTratamiento(id) {
  return apiGet(`/atencion/tratamientos/${id}/`)
}

export async function crearTratamiento(data) {
  return apiPost('/atencion/tratamientos/', data)
}

export async function actualizarTratamiento(id, data) {
  return apiPut(`/atencion/tratamientos/${id}/`, data)
}

export async function eliminarTratamiento(id) {
  return apiDelete(`/atencion/tratamientos/${id}/`)
}

// Acciones custom
export async function listarTratamientosPorPaciente(pacienteId) {
  return apiGet(`/atencion/tratamientos/por_paciente/?paciente_id=${pacienteId}`)
}

export async function listarTratamientosActivos() {
  return apiGet('/atencion/tratamientos/activos/')
}

export async function vincularAtencionATratamiento(tratamientoId, data) {
  return apiPost(`/atencion/tratamientos/${tratamientoId}/vincular_atencion/`, data)
}
