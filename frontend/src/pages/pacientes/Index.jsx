import React from 'react'
import { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'

// Listado de Pacientes con CRUD en la misma vista (Dialog para crear/editar)
export default function Pacientes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Carga la lista de pacientes desde la API
  const fetchPacientes = () => {
    setLoading(true)
    apiGet('/pacientes/api/pacientes/')
      .then(json => { setData(json); setError('') })
      .catch(err => { setError(err.message) })
      .finally(() => { setLoading(false) })
  }

  useEffect(() => {
    fetchPacientes()
  }, [])

  // Estado y handlers del Dialog (crear/editar paciente)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    fecha_nacimiento: '',
    genero: 'M',
    telefono: '',
    direccion: '',
    email: '',
  })

  const openCrear = () => { setEditing(false); setEditId(null); setOpen(true) }
  const openEditar = (row) => {
    setEditing(true)
    setEditId(row.id_paciente)
    setForm({
      nombre: row.nombre || '',
      fecha_nacimiento: row.fecha_nacimiento || '',
      genero: row.genero || 'M',
      telefono: row.telefono || '',
      direccion: row.direccion || '',
      email: row.email || '',
    })
    setOpen(true)
  }
  const closeCrear = () => { if (!saving) setOpen(false) }
  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  const guardarPaciente = async () => {
    // Validación mínima
    if (!form.nombre || !form.fecha_nacimiento || !form.telefono || !form.direccion || !form.email) {
      setError('Complete todos los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      if (editing && editId) {
        await apiPut(`/pacientes/api/pacientes/${editId}/`, form)
      } else {
        await apiPost('/pacientes/api/pacientes/', form)
      }
      // Refrescar lista y cerrar
      fetchPacientes()
      setOpen(false)
      // Limpiar formulario
      setForm({ nombre: '', fecha_nacimiento: '', genero: 'M', telefono: '', direccion: '', email: '' })
      setEditing(false)
      setEditId(null)
    } catch (e) {
      setError(e.message || 'Error al crear paciente')
    } finally {
      setSaving(false)
    }
  }

  const eliminarPaciente = async (row) => {
    const ok = window.confirm(`¿Eliminar paciente ${row.nombre}?`)
    if (!ok) return
    try {
      await apiDelete(`/pacientes/api/pacientes/${row.id_paciente}/`)
      fetchPacientes()
    } catch (e) {
      setError(e.message || 'Error al eliminar paciente')
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Pacientes - Casos de uso</Typography>
        <Button variant="contained" onClick={openCrear}>Crear paciente</Button>
      </Stack>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Género</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id_paciente} hover>
                  <TableCell>{p.id_paciente}</TableCell>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{p.genero}</TableCell>
                  <TableCell>{p.telefono}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => openEditar(p)}>Editar</Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => eliminarPaciente(p)}>Eliminar</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Crear Paciente */}
      <Dialog open={open} onClose={closeCrear} fullWidth maxWidth="sm">
  <DialogTitle>{editing ? 'Editar paciente' : 'Crear paciente'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre" name="nombre" value={form.nombre} onChange={onChange} fullWidth required />
            <TextField label="Fecha de nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={onChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="Género" name="genero" select value={form.genero} onChange={onChange} fullWidth>
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Femenino</MenuItem>
            </TextField>
            <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={onChange} fullWidth required />
            <TextField label="Dirección" name="direccion" value={form.direccion} onChange={onChange} fullWidth required />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} fullWidth required />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCrear} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={guardarPaciente} disabled={saving}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
