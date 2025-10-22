import React, { useState } from 'react'
import { Paper, Typography, TextField, Button, Alert, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material'
import { apiGet } from '../../lib/api'

// CU6: Consultar historial del paciente
// - Permite ingresar el ID del paciente y consultar su info, citas y archivos clínicos
export default function HistorialPaciente() {
  const [pacienteId, setPacienteId] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function consultar() {
    if (!pacienteId) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await apiGet(`/pacientes/api/pacientes/${pacienteId}/historial/`)
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Historial de Paciente</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField label="ID Paciente" value={pacienteId} onChange={e => setPacienteId(e.target.value)} size="small" />
        <Button variant="contained" onClick={consultar} disabled={loading || !pacienteId}>Consultar</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {data && (
        <>
          <Typography variant="h6">Datos del paciente</Typography>
          <pre style={{ background: '#f7f7f7', padding: 12, borderRadius: 6, overflowX: 'auto' }}>{JSON.stringify(data.paciente, null, 2)}</pre>

          <Typography variant="h6">Citas</Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Odontólogo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.citas.map(c => (
                <TableRow key={c.id_cita}>
                  <TableCell>{c.id_cita}</TableCell>
                  <TableCell>{new Date(c.fecha).toLocaleString()}</TableCell>
                  <TableCell>{c.estado}</TableCell>
                  <TableCell>{c.odontologo || '-'}</TableCell>
                </TableRow>
              ))}
              {data.citas.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">Sin citas</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          <Typography variant="h6">Archivos clínicos</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Descargar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.archivos.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.nombreArchivo || '-'}</TableCell>
                  <TableCell>{a.tipoDocumento || '-'}</TableCell>
                  <TableCell>{a.fechaAdjunto ? new Date(a.fechaAdjunto).toLocaleString() : '-'}</TableCell>
                  <TableCell>{a.rutaArchivo ? (<a href={a.rutaArchivo} target="_blank" rel="noreferrer">Ver</a>) : '-'}</TableCell>
                </TableRow>
              ))}
              {data.archivos.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">Sin archivos</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  )
}
