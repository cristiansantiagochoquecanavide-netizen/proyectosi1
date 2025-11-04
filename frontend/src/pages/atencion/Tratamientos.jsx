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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../ui/AuthContext';
import {
  listarTratamientosPorPaciente,
  crearTratamiento,
  actualizarTratamiento,
  eliminarTratamiento,
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
  const [odontologoId, setOdontologoId] = useState(null);

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
    cargarOdontologo();
  }, [user]);

  const cargarPacientes = async () => {
    try {
      const data = await apiGet('/pacientes/api/pacientes/');
      setPacientes(data.results || data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    }
  };

  const cargarOdontologo = async () => {
    if (!user || !user.id_usuario) return;
    
    try {
      // Buscar el odontólogo vinculado al usuario autenticado
      const odontologos = await apiGet('/citas/api/odontologos/');
      const odontologosData = odontologos.results || odontologos;
      const odontologo = odontologosData.find(o => o.usuario_seguridad === user.id_usuario);
      
      if (odontologo) {
        setOdontologoId(odontologo.id_odontologo);
      } else {
        // Si no se encuentra, usar el primer odontólogo disponible como fallback
        console.warn('No se encontró odontólogo para este usuario, usando el primero disponible');
        if (odontologosData.length > 0) {
          setOdontologoId(odontologosData[0].id_odontologo);
        }
      }
    } catch (err) {
      console.error('Error al cargar odontólogo:', err);
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
    setError('');
    setOpenNuevo(true);
  };

  const handleGuardarNuevo = async () => {
    if (!pacienteSeleccionado) {
      setError('Debe seleccionar un paciente');
      return;
    }
    if (!nuevoTratamiento.nombre.trim()) {
      setError('Debe ingresar el nombre del tratamiento');
      return;
    }
    if (!odontologoId) {
      setError('No hay odontólogos disponibles en el sistema. Por favor, contacte al administrador.');
      return;
    }

    setGuardando(true);
    try {
      await crearTratamiento({
        id_paciente: pacienteSeleccionado.id_paciente,
        id_odontologo: odontologoId,
        nombre: nuevoTratamiento.nombre,
        descripcion: nuevoTratamiento.descripcion,
        costo_estimado: parseFloat(nuevoTratamiento.costo_estimado) || 0,
        estado: nuevoTratamiento.estado,
      });

      setOpenNuevo(false);
      setError('');
      cargarTratamientos(pacienteSeleccionado.id_paciente);
    } catch (err) {
      console.error('Error al crear tratamiento:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error al crear el tratamiento';
      setError(errorMsg);
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
      setError('Error al actualizar el estado del tratamiento');
    }
  };

  const handleEliminar = async (tratamientoId) => {
    if (!window.confirm('¿Está seguro de eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await eliminarTratamiento(tratamientoId);
      cargarTratamientos(pacienteSeleccionado.id_paciente);
    } catch (err) {
      console.error('Error al eliminar tratamiento:', err);
      setError('Error al eliminar el tratamiento');
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
                    <TableRow key={tratamiento.id_tratamiento} hover>
                      <TableCell>{tratamiento.id_tratamiento}</TableCell>
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                          {tratamiento.estado !== 'completado' && tratamiento.estado !== 'cancelado' && (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={tratamiento.estado}
                                onChange={(e) => handleCambiarEstado(tratamiento.id_tratamiento, e.target.value)}
                              >
                                {ESTADOS_TRATAMIENTO.map((estado) => (
                                  <MenuItem key={estado.value} value={estado.value}>
                                    {estado.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminar(tratamiento.id_tratamiento)}
                            title="Eliminar tratamiento"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
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
