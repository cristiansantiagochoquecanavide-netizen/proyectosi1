import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../ui/AuthContext';
import {
  listarTratamientosPorPaciente,
  crearTratamiento,
  actualizarTratamiento,
} from '../../lib/atencion';

const ESTADOS_TRATAMIENTO = [
  { value: 'planificado', label: 'Planificado', color: 'info' },
  { value: 'en_curso', label: 'En Curso', color: 'primary' },
  { value: 'pausado', label: 'Pausado', color: 'warning' },
  { value: 'completado', label: 'Completado', color: 'success' },
  { value: 'cancelado', label: 'Cancelado', color: 'error' },
];

export default function Tratamientos() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);

  // Modal nuevo tratamiento
  const [openNuevo, setOpenNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoTratamiento, setNuevoTratamiento] = useState({
    nombre: '',
    descripcion: '',
    costo_estimado: '',
    estado: 'planificado',
  });

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await apiGet('/pacientes/api/pacientes/');
      setPacientes(data.results || data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    }
  };

  const cargarTratamientos = async (pacienteId) => {
    try {
      setLoading(true);
      setError('');
      const data = await listarTratamientosPorPaciente(pacienteId);
      setTratamientos(data || []);
    } catch (err) {
      console.error('Error al cargar tratamientos:', err);
      setError('Error al cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const handlePacienteChange = (event, newValue) => {
    setPacienteSeleccionado(newValue);
    if (newValue) {
      cargarTratamientos(newValue.id_paciente);
    } else {
      setTratamientos([]);
    }
  };

  const handleAbrirNuevo = () => {
    setNuevoTratamiento({
      nombre: '',
      descripcion: '',
      costo_estimado: '',
      estado: 'planificado',
    });
    setOpenNuevo(true);
  };

  const handleGuardarNuevo = async () => {
    if (!pacienteSeleccionado) {
      alert('Debe seleccionar un paciente');
      return;
    }
    if (!nuevoTratamiento.nombre.trim()) {
      alert('Debe ingresar el nombre del tratamiento');
      return;
    }
    if (!user || !user.id_odontologo) {
      alert('No se pudo identificar al odontólogo');
      return;
    }

    setGuardando(true);
    try {
      await crearTratamiento({
        id_paciente: pacienteSeleccionado.id_paciente,
        id_odontologo: user.id_odontologo,
        nombre: nuevoTratamiento.nombre,
        descripcion: nuevoTratamiento.descripcion,
        costo_estimado: parseFloat(nuevoTratamiento.costo_estimado) || 0,
        estado: nuevoTratamiento.estado,
      });

      setOpenNuevo(false);
      cargarTratamientos(pacienteSeleccionado.id_paciente);
    } catch (err) {
      console.error('Error al crear tratamiento:', err);
      alert('Error al crear el tratamiento');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (tratamientoId, nuevoEstado) => {
    try {
      await actualizarTratamiento(tratamientoId, { estado: nuevoEstado });
      cargarTratamientos(pacienteSeleccionado.id_paciente);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar el estado');
    }
  };

  const getEstadoConfig = (estado) => {
    return ESTADOS_TRATAMIENTO.find((e) => e.value === estado) || ESTADOS_TRATAMIENTO[0];
  };

  const formatearMoneda = (monto) => {
    return `Bs. ${parseFloat(monto || 0).toFixed(2)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Tratamientos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAbrirNuevo}
          disabled={!pacienteSeleccionado}
        >
          Nuevo Tratamiento
        </Button>
      </Box>

      {/* Selector de Paciente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Autocomplete
            options={pacientes}
            getOptionLabel={(p) => p.nombre || ''}
            value={pacienteSeleccionado}
            onChange={handlePacienteChange}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar Paciente" placeholder="Buscar paciente..." />
            )}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : pacienteSeleccionado ? (
        tratamientos.length === 0 ? (
          <Alert severity="info">
            El paciente no tiene tratamientos registrados. Haga clic en "Nuevo Tratamiento" para crear uno.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Costo Estimado</TableCell>
                  <TableCell>Costo Real</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tratamientos.map((tratamiento) => {
                  const estadoConfig = getEstadoConfig(tratamiento.estado);
                  return (
                    <TableRow key={tratamiento.id} hover>
                      <TableCell>{tratamiento.id}</TableCell>
                      <TableCell>{tratamiento.nombre}</TableCell>
                      <TableCell>{tratamiento.descripcion?.substring(0, 50) || '-'}</TableCell>
                      <TableCell>{formatearMoneda(tratamiento.costo_estimado)}</TableCell>
                      <TableCell>{formatearMoneda(tratamiento.costo_real)}</TableCell>
                      <TableCell>
                        <Chip label={estadoConfig.label} color={estadoConfig.color} size="small" />
                      </TableCell>
                      <TableCell>
                        {tratamiento.fecha_inicio
                          ? new Date(tratamiento.fecha_inicio).toLocaleDateString('es-BO')
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {tratamiento.estado !== 'completado' && tratamiento.estado !== 'cancelado' && (
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={tratamiento.estado}
                              onChange={(e) => handleCambiarEstado(tratamiento.id, e.target.value)}
                            >
                              {ESTADOS_TRATAMIENTO.map((estado) => (
                                <MenuItem key={estado.value} value={estado.value}>
                                  {estado.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        <Alert severity="info">Seleccione un paciente para ver sus tratamientos</Alert>
      )}

      {/* Modal Nuevo Tratamiento */}
      <Dialog open={openNuevo} onClose={() => setOpenNuevo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Tratamiento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nombre del Tratamiento"
                value={nuevoTratamiento.nombre}
                onChange={(e) =>
                  setNuevoTratamiento({ ...nuevoTratamiento, nombre: e.target.value })
                }
                placeholder="Ej: Ortodoncia, Implante dental, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={nuevoTratamiento.descripcion}
                onChange={(e) =>
                  setNuevoTratamiento({ ...nuevoTratamiento, descripcion: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Costo Estimado (Bs.)"
                value={nuevoTratamiento.costo_estimado}
                onChange={(e) =>
                  setNuevoTratamiento({ ...nuevoTratamiento, costo_estimado: e.target.value })
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Estado Inicial</InputLabel>
                <Select
                  value={nuevoTratamiento.estado}
                  label="Estado Inicial"
                  onChange={(e) =>
                    setNuevoTratamiento({ ...nuevoTratamiento, estado: e.target.value })
                  }
                >
                  <MenuItem value="planificado">Planificado</MenuItem>
                  <MenuItem value="en_curso">En Curso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNuevo(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarNuevo}
            variant="contained"
            disabled={guardando}
            startIcon={guardando && <CircularProgress size={20} />}
          >
            {guardando ? 'Guardando...' : 'Crear Tratamiento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
