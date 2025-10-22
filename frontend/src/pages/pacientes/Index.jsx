import React from 'react'
import { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Stack, Button } from '@mui/material'
import { apiGet } from '../../lib/api'

export default function Pacientes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet('/pacientes/api/pacientes/')
      .then(json => { if (mounted) { setData(json); setError('') } })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Pacientes - Casos de uso</Typography>
        <Button variant="contained" href="/pacientes/crear/" target="_blank">Crear paciente</Button>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
