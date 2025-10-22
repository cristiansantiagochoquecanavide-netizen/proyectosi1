import React, { useState } from 'react'
import { Paper, Typography, Button, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../ui/AuthContext'

// CU2 Front: Cerrar sesión
// Llama a /seguridad/api/usuarios/logout/ para limpiar la sesión en el servidor
export default function Logout() {
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function cerrar() {
    setMsg(''); setError(''); setLoading(true)
    try {
      await logout()
      setMsg('Sesión cerrada')
      navigate('/seguridad/login', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Cerrar sesión</Typography>
      <Button variant="contained" color="warning" onClick={cerrar} disabled={loading}>Cerrar sesión</Button>
      {msg && <Alert severity="success" sx={{ mt: 2 }}>{msg}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  )
}
