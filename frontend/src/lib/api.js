function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function ensureCsrfCookie() {
  if (!getCookie('csrftoken')) {
    try {
      await fetch('/csrf', { credentials: 'include' })
    } catch (e) {
      // ignorar, reintentaremos en el POST
    }
  }
}

export async function apiGet(path) {
  const res = await fetch(path, {
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GET ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

export async function apiPost(path, data) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(path, {
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
    throw new Error(`POST ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

export async function apiPostForm(path, formData) {
  await ensureCsrfCookie()
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': csrftoken || '' },
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`POST ${path} -> ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}
