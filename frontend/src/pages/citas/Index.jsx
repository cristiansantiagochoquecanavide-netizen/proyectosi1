import React, { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Stack, Button, ButtonGroup } from '@mui/material'
import { apiGet, apiPost } from '../../lib/api'

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState({})
  const [odontologos, setOdontologos] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const [citasJson, pacientesJson, odontologosJson] = await Promise.all([
          apiGet('/citas/api/citas/'),
          apiGet('/pacientes/api/pacientes/'),
          apiGet('/citas/api/odontologos/'),
        ])
        if (!mounted) return
        setCitas(citasJson)
        setPacientes(Object.fromEntries(pacientesJson.map(p => [p.id_paciente, p.nombre])))
        setOdontologos(Object.fromEntries(odontologosJson.map(o => [o.id_odontologo, o.nombre])))
        setError('')
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Citas - Casos de uso</Typography>
        <Button variant="contained" href="/citas/crear/" target="_blank">Crear cita</Button>
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
                      <Button component="a" href={`/citas/api/citas/${c.id_cita}/`} target="_blank" rel="noreferrer">Ver</Button>
                      <Button component="a" href={`/citas/editar/${c.id_cita}/`} target="_blank" rel="noreferrer">Editar</Button>
                      <Button color="error" component="a" href={`/citas/eliminar/${c.id_cita}/`} target="_blank" rel="noreferrer">Eliminar</Button>
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
    </Paper>
  )
}
