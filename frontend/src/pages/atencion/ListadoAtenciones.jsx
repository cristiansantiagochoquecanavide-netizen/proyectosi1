  const handleCancelar = async (atencion) => {
    if (!window.confirm('¿Está seguro de cancelar esta atención?')) return;
    try {
      await cancelarAtencion(atencion.id_atencion);
      cargarDatos();
    } catch (err) {
      alert('Error al cancelar la atención');
    }
  };
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { listarAtenciones, finalizarAtencion, cancelarAtencion, listarAtencionesPorPaciente } from '../../lib/atencion';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiGet } from '../../lib/api';

export default function ListadoAtenciones() {
  const navigate = useNavigate();
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [pacientes, setPacientes] = useState([]);
  
  // Modal de detalle
  const [openDetalle, setOpenDetalle] = useState(false);
  const [atencionSeleccionada, setAtencionSeleccionada] = useState(null);
  
  // Modal de finalizar
  const [openFinalizar, setOpenFinalizar] = useState(false);
  const [diagnostico, setDiagnostico] = useState('');
  const [observacionesFinal, setObservacionesFinal] = useState('');
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado, filtroPaciente]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      let datos;
      if (filtroPaciente) {
        datos = await listarAtencionesPorPaciente(filtroPaciente);
      } else {
        datos = await listarAtenciones();
      }

      let atencionesData = datos.results || datos;

      // Filtrar por estado si es necesario
      if (filtroEstado) {
        atencionesData = atencionesData.filter((a) => a.estado === filtroEstado);
      }

      setAtenciones(atencionesData);

      // Cargar pacientes para el filtro
      const pacientesData = await apiGet('/pacientes/api/pacientes/');
      setPacientes(pacientesData.results || pacientesData);
    } catch (err) {
      console.error('Error al cargar atenciones:', err);
      setError('Error al cargar las atenciones');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'en_curso':
        return 'primary';
      case 'finalizada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'en_curso':
        return 'En Curso';
      case 'finalizada':
        return 'Finalizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const handleVerDetalle = (atencion) => {
    setAtencionSeleccionada(atencion);
    setOpenDetalle(true);
  };

  const handleAbrirFinalizar = (atencion) => {
    setAtencionSeleccionada(atencion);
    setDiagnostico(atencion.diagnostico || '');
    setObservacionesFinal(atencion.observaciones || '');
    setOpenFinalizar(true);
  };

  const handleFinalizar = async () => {
    if (!diagnostico.trim()) {
      alert('Debe ingresar un diagnóstico');
      return;
    }

    setFinalizando(true);
    try {
      await finalizarAtencion(atencionSeleccionada.id);
      setOpenFinalizar(false);
      setAtencionSeleccionada(null);
      cargarDatos(); // Recargar la lista
    } catch (err) {
      console.error('Error al finalizar atención:', err);
      alert('Error al finalizar la atención');
    } finally {
      setFinalizando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Listado de Atenciones</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/atencion/iniciar')}
        >
          Iniciar Nueva Atención
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FilterListIcon color="action" />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                label="Estado"
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="en_curso">En Curso</MenuItem>
                <MenuItem value="finalizada">Finalizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Paciente</InputLabel>
              <Select
                value={filtroPaciente}
                label="Paciente"
                onChange={(e) => setFiltroPaciente(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {pacientes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre} {p.apellido_paterno}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setFiltroEstado('');
                setFiltroPaciente('');
              }}
            >
              Limpiar Filtros
            </Button>
          </Box>
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Odontólogo</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atenciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay atenciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                atenciones.map((atencion) => (
                  <TableRow key={atencion.id_atencion} hover>
                    <TableCell>{atencion.id_atencion}</TableCell>
                    <TableCell>{formatearFecha(atencion.fecha_inicio)}</TableCell>
                    <TableCell>{atencion.paciente_nombre || '-'}</TableCell>
                    <TableCell>{atencion.odontologo_nombre || '-'}</TableCell>
                    <TableCell>{atencion.observaciones_generales?.substring(0, 30)}...</TableCell>
                    <TableCell>
                      <Chip
                        label={getEstadoLabel(atencion.estado)}
                        color={getEstadoColor(atencion.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleVerDetalle(atencion)}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {atencion.estado === 'en_curso' && (
                        <>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleAbrirFinalizar(atencion)}
                            title="Finalizar atención"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleCancelar(atencion)}
                            title="Cancelar atención"
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Detalle */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="md" fullWidth>
  <DialogTitle>Detalle de Atención #{atencionSeleccionada?.id_atencion}</DialogTitle>
        <DialogContent>
          {atencionSeleccionada && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Fecha:</strong> {formatearFecha(atencionSeleccionada.fecha_inicio)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Paciente:</strong> {atencionSeleccionada.paciente_nombre}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Odontólogo:</strong> {atencionSeleccionada.odontologo_nombre}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Estado:</strong>{' '}
                <Chip
                  label={getEstadoLabel(atencionSeleccionada.estado)}
                  color={getEstadoColor(atencionSeleccionada.estado)}
                  size="small"
                />
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                <strong>Motivo de Consulta:</strong>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                {atencionSeleccionada.observaciones_generales}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                <strong>Diagnóstico:</strong>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                {atencionSeleccionada.diagnostico || 'Sin diagnóstico'}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                <strong>Observaciones:</strong>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                {atencionSeleccionada.observaciones || 'Sin observaciones'}
              </Typography>
              {atencionSeleccionada.procedimientos && atencionSeleccionada.procedimientos.length > 0 && (
                <>
                  <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                    <strong>Procedimientos realizados:</strong>
                  </Typography>
                  <ul>
                    {atencionSeleccionada.procedimientos.map((proc, idx) => (
                      <li key={idx}>
                        {proc.nombre} - Bs. {proc.costo}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Finalizar */}
      <Dialog open={openFinalizar} onClose={() => setOpenFinalizar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Finalizar Atención</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
            Esta acción cambiará el estado de la atención a "Finalizada"
          </Alert>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Diagnóstico Final"
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones Finales"
            value={observacionesFinal}
            onChange={(e) => setObservacionesFinal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalizar(false)} disabled={finalizando}>
            Cancelar
          </Button>
          <Button
            onClick={handleFinalizar}
            variant="contained"
            color="success"
            disabled={finalizando}
            startIcon={finalizando && <CircularProgress size={20} />}
          >
            {finalizando ? 'Finalizando...' : 'Finalizar Atención'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
