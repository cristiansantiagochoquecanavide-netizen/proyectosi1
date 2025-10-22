import React, { useState } from 'react'
import { Paper, Typography, TextField, Button, Alert, Stack, Box } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../ui/AuthContext'

// CU1 Front: Iniciar sesión (contra seguridad_y_personal.Usuario)
// Envía correo y contraseña a /seguridad/api/usuarios/login/ y guarda sesión en servidor
export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  async function submit() {
    setMsg(''); setError('')
    setLoading(true)
    try {
      const res = await login(correo, contrasena)
      setMsg(`Bienvenido ${res.usuario?.nombre || res.usuario?.username || res.usuario?.correo}`)
      setCorreo(''); setContrasena('')
      // Redirigir a la ruta previa o al inicio
      navigate(from, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 560 }}>
        <Typography variant="h4" gutterBottom textAlign="center">Iniciar sesión</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          Ingresa tus credenciales para acceder al sistema
        </Typography>
        <Stack spacing={2}>
          <TextField label="Correo" type="email" size="medium" value={correo} onChange={e => setCorreo(e.target.value)} fullWidth />
          <TextField label="Contraseña" type="password" size="medium" value={contrasena} onChange={e => setContrasena(e.target.value)} fullWidth />
          <Button variant="contained" size="large" onClick={submit} disabled={!correo || !contrasena || loading}>
            Entrar
          </Button>
          {msg && <Alert severity="success">{msg}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>
    </Box>
  )
}
