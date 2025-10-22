import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'

// Contexto de autenticación simple basado en sesión de Django
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  async function login(correo, contrasena) {
    const res = await apiPost('/seguridad/api/usuarios/login/', { correo, contrasena })
    setUser(res.usuario)
    return res
  }

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
