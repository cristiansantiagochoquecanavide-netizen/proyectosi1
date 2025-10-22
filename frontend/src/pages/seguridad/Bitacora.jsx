import React, { useEffect, useState } from 'react'
import { Paper, Typography, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { apiGet } from '../../lib/api'

// CU25: Ver bitácora
// - Lista los registros de la bitácora provenientes de /seguridad/api/bitacoras/
// - Muestra usuario, acción y fecha y resuelve el nombre del usuario
export default function Bitacora() {
  const [registros, setRegistros] = useState([])
  const [usuariosMap, setUsuariosMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [bits, usuarios] = await Promise.all([
          apiGet('/seguridad/api/bitacoras/'),
          apiGet('/seguridad/api/usuarios/'),
        ])
        if (!mounted) return
        setRegistros(bits)
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
      <Typography variant="h5" gutterBottom>Bitácora</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.map(r => (
                <TableRow key={r.id_bitacora}>
                  <TableCell>{r.id_bitacora}</TableCell>
                  <TableCell>{usuariosMap[r.id_usuario] || r.id_usuario}</TableCell>
                  <TableCell>{r.accion}</TableCell>
                  <TableCell>{new Date(r.fecha_accion).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {registros.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">Sin registros</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
