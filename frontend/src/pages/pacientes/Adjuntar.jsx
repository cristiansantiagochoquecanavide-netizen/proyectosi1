import React, { useState } from 'react'
import { Paper, Typography, TextField, Button, Alert, Stack } from '@mui/material'
import { apiPostForm } from '../../lib/api'

// CU7: Adjuntar documentos clínicos
// - Permite subir un archivo clínico para un paciente usando multipart/form-data
export default function AdjuntarArchivo() {
  const [pacienteId, setPacienteId] = useState('')
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function adjuntar() {
    setMsg(''); setError('')
    try {
      const fd = new FormData()
      fd.append('paciente', pacienteId)
      if (nombre) fd.append('nombreArchivo', nombre)
      if (tipo) fd.append('tipoDocumento', tipo)
      if (descripcion) fd.append('descripcion', descripcion)
      if (file) fd.append('rutaArchivo', file)
      await apiPostForm('/pacientes/api/archivos/', fd)
      setMsg('Archivo adjuntado correctamente')
      setPacienteId(''); setNombre(''); setTipo(''); setDescripcion(''); setFile(null)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Adjuntar documento clínico</Typography>
      <Stack spacing={2} sx={{ maxWidth: 540 }}>
        <TextField label="ID Paciente" size="small" value={pacienteId} onChange={e => setPacienteId(e.target.value)} />
        <TextField label="Nombre del archivo" size="small" value={nombre} onChange={e => setNombre(e.target.value)} />
        <TextField label="Tipo de documento" size="small" value={tipo} onChange={e => setTipo(e.target.value)} />
        <TextField label="Descripción" size="small" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <Button variant="contained" onClick={adjuntar} disabled={!pacienteId || !file}>Subir</Button>
        {msg && <Alert severity="success">{msg}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  )
}
