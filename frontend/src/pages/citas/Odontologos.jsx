import React, { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert, Stack, TextField, Button } from '@mui/material'
import { apiGet, apiPost, apiPatch, apiDelete } from '../../lib/api'

// CU22: Gestionar odontólogo
// - CRUD completo contra /citas/api/odontologos/
//  el vínculo con 'usuario_seguridad' se realiza automáticamente si asignas el rol 'odontologo' en Seguridad.
// - Esta vista usa edición en línea por fila para cambios rápidos.
export default function Odontologos() {
  const [lista, setLista] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', especialidad: 'General', telefono: '', matriculaProfesional: '', username: '', contrasena: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '', email: '', especialidad: '', telefono: '', matriculaProfesional: '' })

  async function cargar() {
    try {
      const data = await apiGet('/citas/api/odontologos/')
      setLista(data)
      setError('')
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { cargar() }, [])

  async function crear() {
    setMsg(''); setError('')
    try {
      await apiPost('/citas/api/odontologos/', form)
      setMsg('Odontólogo creado')
      setForm({ nombre: '', email: '', especialidad: 'General', telefono: '', matriculaProfesional: '', username: '', contrasena: '' })
      cargar()
    } catch (e) { setError(e.message) }
  }

  function startEdit(o) {
    setEditId(o.id_odontologo)
  setEditForm({ nombre: o.nombre || '', email: o.email || '', especialidad: o.especialidad || '', telefono: o.telefono || '', matriculaProfesional: o.matriculaProfesional || '' })
  }

  async function guardarEdicion() {
    setMsg(''); setError('')
    try {
      await apiPatch(`/citas/api/odontologos/${editId}/`, editForm)
      setMsg('Odontólogo actualizado')
      setEditId(null)
      cargar()
    } catch (e) { setError(e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este odontólogo?')) return
    setMsg(''); setError('')
    try {
      await apiDelete(`/citas/api/odontologos/${id}/`)
      setMsg('Odontólogo eliminado')
      cargar()
    } catch (e) { setError(e.message) }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Odontólogos</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {msg && <Alert severity="success">{msg}</Alert>}

      <Typography variant="h6" sx={{ mt: 2 }}>Crear odontólogo</Typography>
      <Stack spacing={2} direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField label="Nombre" size="small" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <TextField label="Email" size="small" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <TextField label="Especialidad" size="small" value={form.especialidad} onChange={e => setForm({ ...form, especialidad: e.target.value })} />
        <TextField label="Teléfono" size="small" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
        <TextField label="Matrícula Profesional" size="small" value={form.matriculaProfesional} onChange={e => setForm({ ...form, matriculaProfesional: e.target.value })} />
        <TextField label="Username (usuario)" size="small" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <TextField label="Contraseña" type="password" size="small" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} />
  <Button variant="contained" onClick={crear} disabled={!form.nombre || !form.email || !form.telefono}>Crear</Button>
      </Stack>

      <Typography variant="h6">Listado</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Especialidad</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lista.map(o => (
            <TableRow key={o.id_odontologo}>
              <TableCell>{o.id_odontologo}</TableCell>
              <TableCell>
                {editId === o.id_odontologo ? (
                  <TextField size="small" value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} />
                ) : o.nombre}
              </TableCell>
              <TableCell>
                {editId === o.id_odontologo ? (
                  <TextField size="small" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                ) : o.email}
              </TableCell>
              <TableCell>
                {editId === o.id_odontologo ? (
                  <TextField size="small" value={editForm.especialidad} onChange={e => setEditForm({ ...editForm, especialidad: e.target.value })} />
                ) : o.especialidad}
              </TableCell>
              <TableCell>
                {editId === o.id_odontologo ? (
                  <TextField size="small" value={editForm.telefono} onChange={e => setEditForm({ ...editForm, telefono: e.target.value })} />
                ) : o.telefono}
              </TableCell>
              <TableCell>
                {editId === o.id_odontologo ? (
                  <TextField size="small" value={editForm.matriculaProfesional} onChange={e => setEditForm({ ...editForm, matriculaProfesional: e.target.value })} />
                ) : (o.matriculaProfesional || '')}
              </TableCell>
              <TableCell>
                {editId === o.id_odontologo ? (
                  <>
                    <Button variant="contained" size="small" onClick={guardarEdicion} sx={{ mr: 1 }}>Guardar</Button>
                    <Button variant="text" size="small" onClick={() => setEditId(null)}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="text" size="small" onClick={() => startEdit(o)} sx={{ mr: 1 }}>Editar</Button>
                    <Button variant="text" color="error" size="small" onClick={() => eliminar(o.id_odontologo)}>Eliminar</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {lista.length === 0 && (
            <TableRow><TableCell colSpan={6} align="center">Sin odontólogos</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
