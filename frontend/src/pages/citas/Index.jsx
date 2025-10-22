import React, { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Stack, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState({})
  const [odontologos, setOdontologos] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ fecha: '', id_paciente: '', id_odontologo: '', estado: 'pendiente' })

  const cargar = async () => {
    setLoading(true)
    try {
      const [citasJson, pacientesJson, odontologosJson] = await Promise.all([
        apiGet('/citas/api/citas/'),
        apiGet('/pacientes/api/pacientes/'),
        apiGet('/citas/api/odontologos/'),
      ])
      setCitas(citasJson)
      setPacientes(Object.fromEntries(pacientesJson.map(p => [p.id_paciente, p.nombre])))
      setOdontologos(Object.fromEntries(odontologosJson.map(o => [o.id_odontologo, o.nombre])))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const pad = (n) => String(n).padStart(2, '0')
  const toInputDateTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const openCrear = () => { setEditing(false); setEditId(null); setForm({ fecha: '', id_paciente: '', id_odontologo: '', estado: 'pendiente' }); setOpen(true) }
  const openEditar = (row) => {
    setEditing(true)
    setEditId(row.id_cita)
    setForm({
      fecha: toInputDateTime(row.fecha),
      id_paciente: row.id_paciente || '',
      id_odontologo: row.id_odontologo || '',
      estado: row.estado || 'pendiente'
    })
    setOpen(true)
  }
  const closeDialog = () => { if (!saving) setOpen(false) }
  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const guardar = async () => {
    if (!form.fecha || !form.id_paciente || !form.estado) {
      setError('Complete fecha, paciente y estado')
      return
    }
    setSaving(true)
    try {
      const payload = {
        fecha: form.fecha,
        id_paciente: form.id_paciente,
        estado: form.estado,
      }
      // id_odontologo puede ir vacío
      if (form.id_odontologo) payload.id_odontologo = form.id_odontologo

      if (editing && editId) {
        await apiPut(`/citas/api/citas/${editId}/`, payload)
      } else {
        await apiPost('/citas/api/citas/', payload)
      }
      await cargar()
      setOpen(false)
      setEditing(false)
      setEditId(null)
      setForm({ fecha: '', id_paciente: '', id_odontologo: '', estado: 'pendiente' })
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (row) => {
    if (!window.confirm(`¿Eliminar la cita #${row.id_cita}?`)) return
    try {
      await apiDelete(`/citas/api/citas/${row.id_cita}/`)
      cargar()
    } catch (e) { setError(e.message) }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Citas - Casos de uso</Typography>
        <Button variant="contained" onClick={openCrear}>Crear cita</Button>
      </Stack>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Odontólogo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citas.map((c) => (
                <TableRow key={c.id_cita} hover>
                  <TableCell>{c.id_cita}</TableCell>
                  <TableCell>{new Date(c.fecha).toLocaleString()}</TableCell>
                  <TableCell>{pacientes[c.id_paciente] || c.id_paciente}</TableCell>
                  <TableCell>{c.id_odontologo ? (odontologos[c.id_odontologo] || c.id_odontologo) : '-'}</TableCell>
                  <TableCell>{c.estado}</TableCell>
                  <TableCell>
                    <ButtonGroup size="small" variant="outlined">
                      <Button onClick={() => openEditar(c)}>Editar</Button>
                      <Button color="error" onClick={() => eliminar(c)}>Eliminar</Button>
                      <Button color="warning" disabled={c.estado === 'cancelada'} onClick={async () => {
                        try {
                          const updated = await apiPost(`/citas/api/citas/${c.id_cita}/cancelar/`, {})
                          setCitas(prev => prev.map(x => x.id_cita === c.id_cita ? { ...x, estado: updated.estado } : x))
                        } catch (e) {
                          setError(e.message)
                        }
                      }}>Cancelar</Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar cita' : 'Crear cita'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Fecha y hora" name="fecha" type="datetime-local" value={form.fecha} onChange={onChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="Paciente" name="id_paciente" select value={form.id_paciente} onChange={onChange} fullWidth required>
              {Object.entries(pacientes).map(([id, nombre]) => (
                <MenuItem key={id} value={id}>{nombre}</MenuItem>
              ))}
            </TextField>
            <TextField label="Odontólogo" name="id_odontologo" select value={form.id_odontologo} onChange={onChange} fullWidth>
              <MenuItem value="">(Sin asignar)</MenuItem>
              {Object.entries(odontologos).map(([id, nombre]) => (
                <MenuItem key={id} value={id}>{nombre}</MenuItem>
              ))}
            </TextField>
            <TextField label="Estado" name="estado" select value={form.estado} onChange={onChange} fullWidth required>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="confirmada">Confirmada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} disabled={saving}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
