import React, { useEffect, useState } from 'react'
import { Paper, Typography, TextField, MenuItem, Button, Alert, Stack } from '@mui/material'
import { apiGet, apiPost } from '../../lib/api'

// CU24: Cambiar contraseña
// - Permite seleccionar un usuario y actualizar su contraseña en el módulo de seguridad
export default function CambiarContrasena() {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [nueva, setNueva] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/seguridad/api/usuarios/').then(setUsuarios).catch(() => {})
  }, [])

  async function cambiar() {
    setMsg(''); setError('')
    try {
      await apiPost(`/seguridad/api/usuarios/${usuarioId}/cambiar_contrasena/`, { nueva_contrasena: nueva })
      setMsg('Contraseña actualizada')
      setUsuarioId(''); setNueva('')
    } catch (e) { setError(e.message) }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Cambiar contraseña</Typography>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField select label="Usuario" size="small" value={usuarioId} onChange={e => setUsuarioId(e.target.value)}>
          {usuarios.map(u => <MenuItem key={u.id_usuario} value={u.id_usuario}>{u.username || u.nombre} ({u.correo})</MenuItem>)}
        </TextField>
        <TextField label="Nueva contraseña" type="password" size="small" value={nueva} onChange={e => setNueva(e.target.value)} />
        <Button variant="contained" onClick={cambiar} disabled={!usuarioId || !nueva}>Actualizar</Button>
        {msg && <Alert severity="success">{msg}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  )
}
