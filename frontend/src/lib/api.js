// Helpers de red para consumir el backend con sesiones y CSRF.
// - Obtienen la cookie csrftoken con /csrf cuando es necesario.
// - Envían credenciales para mantener la sesión de Django.
// - En desarrollo: usa proxy de Vite (rutas relativas)
// - En producción: usa URL completa de la API

import { API_BASE_URL } from '../config'

// Helper para construir URL completa (producción) o relativa (desarrollo)
function buildUrl(path) {
  // Si path ya es absoluta (comienza con http), devolverla tal cual
  if (path.startsWith('http')) return path
  // Si tenemos API_BASE_URL (producción), concatenarla
  if (API_BASE_URL) return `${API_BASE_URL}${path}`
  // Sino (desarrollo), usar ruta relativa
  return path
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function ensureCsrfCookie() {
  if (!getCookie('csrftoken')) {
    try {
      const url = buildUrl('/csrf')
      await fetch(url, { credentials: 'include' })
    } catch (e) {
      // ignorar, reintentaremos en el POST
    }
  }
}

// GET JSON con cookies de sesión
function maybeAlertUnauthorized(status, text) {
  // No-op: desactivado para no mostrar ventanillas de advertencia de permisos
  return
}

export async function apiGet(path) {
  const url = buildUrl(path)
  const res = await fetch(url, {
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    maybeAlertUnauthorized(res.status, text)
    throw new Error(`GET ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

// POST JSON con CSRF
export async function apiPost(path, data) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const url = buildUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    maybeAlertUnauthorized(res.status, text)
    throw new Error(`POST ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

// POST multipart/form-data (subida de archivos) con CSRF
export async function apiPostForm(path, formData) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const url = buildUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': csrftoken || '' },
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    maybeAlertUnauthorized(res.status, text)
    throw new Error(`POST ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

// PUT JSON con CSRF
export async function apiPut(path, data) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const url = buildUrl(path)
  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    maybeAlertUnauthorized(res.status, text)
    throw new Error(`PUT ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

// PATCH JSON con CSRF
export async function apiPatch(path, data) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const url = buildUrl(path)
  const res = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    maybeAlertUnauthorized(res.status, text)
    throw new Error(`PATCH ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

// DELETE con CSRF
export async function apiDelete(path) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const url = buildUrl(path)
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRFToken': csrftoken || '' },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    maybeAlertUnauthorized(res.status, text)
    throw new Error(`DELETE ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return true
}
