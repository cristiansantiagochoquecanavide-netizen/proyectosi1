import React, { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert, Stack, TextField, Button } from '@mui/material'
import { apiGet, apiPost, apiPatch, apiDelete } from '../../lib/api'

// CU4: Gestionar Roles
// - CRUD completo contra /seguridad/api/roles/
// - Al crear: id_rol es automático; nombre_rol y descripcion se ingresan manualmente
export default function Roles() {
  const [lista, setLista] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({ nombre_rol: '', descripcion: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ nombre_rol: '', descripcion: '' })

  async function cargar() {
    try {
      const data = await apiGet('/seguridad/api/roles/')
      setLista(data)
      setError('')
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { cargar() }, [])

  async function crear() {
    setMsg(''); setError('')
    try {
      await apiPost('/seguridad/api/roles/', form)
      setMsg('Rol creado')
      setForm({ nombre_rol: '', descripcion: '' })
      cargar()
    } catch (e) { setError(e.message) }
  }

  function startEdit(r) {
    setEditId(r.id_rol)
    setEditForm({ nombre_rol: r.nombre_rol || '', descripcion: r.descripcion || '' })
  }

  async function guardarEdicion() {
    setMsg(''); setError('')
    try {
      await apiPatch(`/seguridad/api/roles/${editId}/`, editForm)
      setMsg('Rol actualizado')
      setEditId(null)
      cargar()
    } catch (e) { setError(e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este rol?')) return
    setMsg(''); setError('')
    try {
      await apiDelete(`/seguridad/api/roles/${id}/`)
      setMsg('Rol eliminado')
      cargar()
    } catch (e) { setError(e.message) }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Gestionar Roles</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {msg && <Alert severity="success">{msg}</Alert>}

      <Typography variant="h6" sx={{ mt: 2 }}>Crear rol</Typography>
      <Stack spacing={2} direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField label="Nombre del rol" size="small" value={form.nombre_rol} onChange={e => setForm({ ...form, nombre_rol: e.target.value })} />
        <TextField label="Descripción" size="small" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} sx={{ minWidth: 260 }} />
        <Button variant="contained" onClick={crear} disabled={!form.nombre_rol}>Crear</Button>
      </Stack>

      <Typography variant="h6">Listado</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lista.map(r => (
            <TableRow key={r.id_rol}>
              <TableCell>{r.id_rol}</TableCell>
              <TableCell>
                {editId === r.id_rol ? (
                  <TextField size="small" value={editForm.nombre_rol} onChange={e => setEditForm({ ...editForm, nombre_rol: e.target.value })} />
                ) : r.nombre_rol}
              </TableCell>
              <TableCell>
                {editId === r.id_rol ? (
                  <TextField size="small" value={editForm.descripcion} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} sx={{ minWidth: 260 }} />
                ) : r.descripcion}
              </TableCell>
              <TableCell>
                {editId === r.id_rol ? (
                  <>
                    <Button variant="contained" size="small" onClick={guardarEdicion} sx={{ mr: 1 }}>Guardar</Button>
                    <Button variant="text" size="small" onClick={() => setEditId(null)}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="text" size="small" onClick={() => startEdit(r)} sx={{ mr: 1 }}>Editar</Button>
                    <Button variant="text" color="error" size="small" onClick={() => eliminar(r.id_rol)}>Eliminar</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {lista.length === 0 && (
            <TableRow><TableCell colSpan={4} align="center">Sin roles</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
