import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'

// Contexto de autenticación para toda la app (sesiones Django + cookies).
// - Al montar, llama a /seguridad/api/usuarios/me/ para conocer el estado de sesión.
// - Exponen login() y logout() para que las páginas puedan autenticarse/cerrar.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Revalida la sesión actual contra el backend y actualiza user/loading.
  async function refresh() {
    setLoading(true)
    try {
      const me = await apiGet('/seguridad/api/usuarios/me/')
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Inicia sesión contra la API y persiste el usuario en contexto.
  async function login(correo, contrasena) {
    const res = await apiPost('/seguridad/api/usuarios/login/', { correo, contrasena })
    setUser(res.usuario)
    return res
  }

  // Cierra sesión en el backend y limpia el usuario del contexto.
  async function logout() {
    await apiPost('/seguridad/api/usuarios/logout/', {})
    setUser(null)
  }

  useEffect(() => {
    refresh()
  }, [])

  const value = { user, loading, login, logout, refresh }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
