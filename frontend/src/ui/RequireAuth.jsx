import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { CircularProgress, Box } from '@mui/material'

// Envuelve rutas protegidas: muestra loader, redirige a login si no hay sesión
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/seguridad/login" state={{ from: location }} replace />
  }

  return children
}
