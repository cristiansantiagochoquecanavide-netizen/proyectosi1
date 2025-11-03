import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiGet } from '../../lib/api';
import {
  listarDisponibilidad,
  crearDisponibilidad,
  bloquearDisponibilidad,
  desbloquearDisponibilidad,
} from '../../lib/disponibilidad';

const ESTADOS = {
  disponible: { label: 'Disponible', color: 'success' },
  ocupado: { label: 'Ocupado', color: 'warning' },
  bloqueado: { label: 'Bloqueado', color: 'error' },
};

export default function Disponibilidad() {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [odontologos, setOdontologos] = useState([]);
  const [openNueva, setOpenNueva] = useState(false);
  const [nueva, setNueva] = useState({
    id_odontologo: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [disp, odont] = await Promise.all([
        listarDisponibilidad(),
        apiGet('/citas/odontologos/'),
      ]);
      setDisponibilidades(disp.results || disp);
      setOdontologos(odont.results || odont);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async () => {
    try {
      await crearDisponibilidad(nueva);
      setOpenNueva(false);
      cargarDatos();
    } catch (err) {
      alert('Error al crear disponibilidad');
    }
  };

  const handleBloquear = async (id) => {
    try {
      const motivo = prompt('Motivo del bloqueo:');
      if (motivo) {
        await bloquearDisponibilidad(id, { motivo_bloqueo: motivo });
        cargarDatos();
      }
    } catch (err) {
      alert('Error al bloquear');
    }
  };

  const handleDesbloquear = async (id) => {
    try {
      await desbloquearDisponibilidad(id);
      cargarDatos();
    } catch (err) {
      alert('Error al desbloquear');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Disponibilidad de Odontólogos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNueva(true)}>
          Nueva Disponibilidad
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Odontólogo</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Motivo Bloqueo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disponibilidades.map((disp) => {
                const estadoConfig = ESTADOS[disp.estado] || ESTADOS.disponible;
                return (
                  <TableRow key={disp.id} hover>
                    <TableCell>{disp.odontologo_nombre}</TableCell>
                    <TableCell>
                      {new Date(disp.fecha_inicio).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell>
                      {new Date(disp.fecha_fin).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell>
                      <Chip label={estadoConfig.label} color={estadoConfig.color} size="small" />
                    </TableCell>
                    <TableCell>{disp.motivo_bloqueo || '-'}</TableCell>
                    <TableCell align="center">
                      {disp.estado === 'disponible' && (
                        <Button size="small" color="error" onClick={() => handleBloquear(disp.id)}>
                          Bloquear
                        </Button>
                      )}
                      {disp.estado === 'bloqueado' && (
                        <Button size="small" color="success" onClick={() => handleDesbloquear(disp.id)}>
                          Desbloquear
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openNueva} onClose={() => setOpenNueva(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Disponibilidad</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={odontologos}
                getOptionLabel={(o) => o.nombre}
                onChange={(e, v) => setNueva({ ...nueva, id_odontologo: v?.id || '' })}
                renderInput={(params) => <TextField {...params} label="Odontólogo *" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Fecha y Hora Inicio"
                InputLabelProps={{ shrink: true }}
                value={nueva.fecha_inicio}
                onChange={(e) => setNueva({ ...nueva, fecha_inicio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Fecha y Hora Fin"
                InputLabelProps={{ shrink: true }}
                value={nueva.fecha_fin}
                onChange={(e) => setNueva({ ...nueva, fecha_fin: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNueva(false)}>Cancelar</Button>
          <Button onClick={handleCrear} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
