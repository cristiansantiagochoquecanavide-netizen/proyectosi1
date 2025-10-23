import React, { useEffect, useState } from 'react'
import { List, ListItem, ListItemText, Paper, Typography, Divider, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { apiGet } from '../../lib/api'

const useCases = [
  // Enlaces de administración
  { label: 'Usuarios (auth)', path: '/admin/auth/user/' },
  { label: 'Roles (app seguridad)', path: '/admin/seguridad_y_personal/rol/' },
  // Enlaces a pantallas frontend de seguridad
  { label: 'Gestionar Usuarios (FRONT)', path: '/seguridad/usuarios' },
  { label: 'Gestionar Roles (FRONT)', path: '/seguridad/roles' },
  { label: 'Recepcionistas (FRONT)', path: '/seguridad/recepcionistas' },
  { label: 'Cambiar contraseña (FRONT)', path: '/seguridad/cambiar-contrasena' },
  { label: 'Bitácora (FRONT)', path: '/seguridad/bitacora' },
]

export default function Seguridad() {
  const [odontologos, setOdontologos] = useState([])
  const [usuariosMap, setUsuariosMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [odonto, usuarios] = await Promise.all([
          apiGet('/citas/api/odontologos/'),
          apiGet('/seguridad/api/usuarios/'),
        ])
        if (!mounted) return
        setOdontologos(odonto)
        setUsuariosMap(Object.fromEntries(usuarios.map(u => [u.id_usuario, u.username || u.nombre || u.correo])))
        setError('')
      } catch (e) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Seguridad y Personal - Casos de uso</Typography>
      <List>
        {useCases.map(u => (
          <ListItem key={u.label} button component="a" href={u.path} target={u.path.startsWith('/admin') ? '_blank' : undefined} rel="noreferrer">
            <ListItemText primary={u.label} secondary={u.path} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        Al asignar el rol "Odontologo" a un usuario, se creará automáticamente su registro en Citas → Odontólogos.
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Usuario (seguridad)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {odontologos.map(o => (
                <TableRow key={o.id_odontologo}>
                  <TableCell>{o.id_odontologo}</TableCell>
                  <TableCell>{o.nombre}</TableCell>
                  <TableCell>{o.email}</TableCell>
                  <TableCell>{o.especialidad}</TableCell>
                  <TableCell>{o.usuario_seguridad ? (usuariosMap[o.usuario_seguridad] || o.usuario_seguridad) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
