import React, { useEffect, useState } from 'react'
import { Paper, Typography, TextField, Button, Alert, Stack, MenuItem } from '@mui/material'
import { apiGet, apiPost } from '../../lib/api'

// CU9: Solicitar cita
// - Formulario para crear una cita en estado 'pendiente'
// - El backend valida conflictos de horario (±1 hora) para paciente y odontólogo
export default function SolicitarCita() {
  const [pacienteId, setPacienteId] = useState('')
  const [fecha, setFecha] = useState('')
  const [odontologoId, setOdontologoId] = useState('')
  const [odontologos, setOdontologos] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiGet('/citas/api/odontologos/').then(setOdontologos).catch(() => {})
  }, [])

  async function solicitar() {
    setMsg('')
    setError('')
    setLoading(true)
    try {
      const payload = {
        id_paciente: Number(pacienteId),
        fecha: new Date(fecha).toISOString(),
      }
      if (odontologoId) payload.id_odontologo = Number(odontologoId)
      const res = await apiPost('/citas/api/citas/solicitar/', payload)
      setMsg(`Cita creada con ID ${res.id_cita}`)
      setPacienteId('')
      setFecha('')
      setOdontologoId('')
    } catch (e) {
      // Extraer mensaje de validación si viene del backend Django
      let msg = e.message
      // Buscar mensaje de validación en el texto de error
      const match = msg.match(/El odontólogo ya tiene una cita en esa fecha y hora\.|El paciente ya tiene una cita en esa fecha y hora\./)
      if (match) {
        setError(match[0])
      } else if (msg.includes('ValidationError')) {
        // Si el backend retorna un JSON con ValidationError
        try {
          const json = JSON.parse(msg.split('ValidationError:')[1])
          setError(json[0] || 'Error de validación')
        } catch {
          setError('Error de validación')
        }
      } else {
        setError('Error: ' + msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Solicitar Cita</Typography>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField label="ID Paciente" value={pacienteId} onChange={e => setPacienteId(e.target.value)} size="small" />
        <TextField label="Fecha y hora" type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField select label="Odontólogo (opcional)" size="small" value={odontologoId} onChange={e => setOdontologoId(e.target.value)}>
          <MenuItem value="">(Cualquiera)</MenuItem>
          {odontologos.map(o => <MenuItem key={o.id_odontologo} value={o.id_odontologo}>{o.nombre}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={solicitar} disabled={loading || !pacienteId || !fecha}>Solicitar</Button>
        {msg && <Alert severity="success">{msg}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  )
}
