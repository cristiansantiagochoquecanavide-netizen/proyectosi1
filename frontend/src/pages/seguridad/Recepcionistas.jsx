import React, { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert, Stack, TextField, Button } from '@mui/material'
import { apiGet, apiPost, apiPatch, apiDelete } from '../../lib/api'

// CU23: Gestionar recepcionista
// - Lista los usuarios con rol "recepcionista"
// - Permite crear un nuevo recepcionista (crea Usuario y asigna el rol)
export default function Recepcionistas() {
  const [lista, setLista] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ username: '', nombre: '', correo: '', contrasena: '', estado: 'activo' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ username: '', nombre: '', correo: '', estado: 'activo' })

  async function cargar() {
    try {
      const data = await apiGet('/seguridad/api/usuarios/recepcionistas/')
      setLista(data)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { cargar() }, [])

  async function crear() {
    setMsg(''); setError('')
    try {
      await apiPost('/seguridad/api/usuarios/crear_recepcionista/', form)
      setMsg('Recepcionista creado')
      setForm({ username: '', nombre: '', correo: '', contrasena: '', estado: 'activo' })
      cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  function startEdit(u) {
    setEditId(u.id_usuario)
    setEditForm({ username: u.username || '', nombre: u.nombre || '', correo: u.correo || '', estado: u.estado || 'activo' })
  }

  async function guardarEdicion() {
    setMsg(''); setError('')
    try {
      await apiPatch(`/seguridad/api/usuarios/${editId}/`, editForm)
      setMsg('Usuario actualizado')
      setEditId(null)
      cargar()
    } catch (e) { setError(e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este recepcionista?')) return
    setMsg(''); setError('')
    try {
      await apiDelete(`/seguridad/api/usuarios/${id}/`)
      setMsg('Usuario eliminado')
      cargar()
    } catch (e) { setError(e.message) }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Recepcionistas</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {msg && <Alert severity="success">{msg}</Alert>}

      <Typography variant="h6" sx={{ mt: 2 }}>Crear recepcionista</Typography>
      <Stack spacing={2} sx={{ maxWidth: 540, mb: 3 }}>
        <TextField label="Username" size="small" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <TextField label="Nombre" size="small" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <TextField label="Correo" size="small" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
        <TextField label="Contraseña" type="password" size="small" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} />
        <Button variant="contained" onClick={crear} disabled={!form.username || !form.nombre || !form.correo || !form.contrasena}>Crear</Button>
      </Stack>

      <Typography variant="h6">Listado</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lista.map(u => (
            <TableRow key={u.id_usuario}>
              <TableCell>{u.id_usuario}</TableCell>
              <TableCell>
                {editId === u.id_usuario ? (
                  <TextField size="small" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                ) : u.username}
              </TableCell>
              <TableCell>
                {editId === u.id_usuario ? (
                  <TextField size="small" value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} />
                ) : u.nombre}
              </TableCell>
              <TableCell>
                {editId === u.id_usuario ? (
                  <TextField size="small" value={editForm.correo} onChange={e => setEditForm({ ...editForm, correo: e.target.value })} />
                ) : u.correo}
              </TableCell>
              <TableCell>
                {editId === u.id_usuario ? (
                  <TextField size="small" value={editForm.estado} onChange={e => setEditForm({ ...editForm, estado: e.target.value })} />
                ) : u.estado}
              </TableCell>
              <TableCell>
                {editId === u.id_usuario ? (
                  <>
                    <Button variant="contained" size="small" onClick={guardarEdicion} sx={{ mr: 1 }}>Guardar</Button>
                    <Button variant="text" size="small" onClick={() => setEditId(null)}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="text" size="small" onClick={() => startEdit(u)} sx={{ mr: 1 }}>Editar</Button>
                    <Button variant="text" color="error" size="small" onClick={() => eliminar(u.id_usuario)}>Eliminar</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {lista.length === 0 && <TableRow><TableCell colSpan={6} align="center">Sin recepcionistas</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  )
}
