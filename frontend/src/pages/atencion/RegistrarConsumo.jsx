import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { listarInsumos } from '../../lib/inventario';
import { registrarConsumo, listarMovimientosPorAtencion } from '../../lib/inventario';
import { obtenerAtencion } from '../../lib/atencion';
import { listarProcedimientos } from '../../lib/atencion';
import { useAuth } from '../../ui/AuthContext';

export default function RegistrarConsumo() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID de la atención
  const location = useLocation();
  const { user } = useAuth();

  const [atencion, setAtencion] = useState(null);
  const [procedimientos, setProcedimientos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [consumosRegistrados, setConsumosRegistrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el diálogo de agregar consumo
  const [openDialog, setOpenDialog] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoConsumo, setNuevoConsumo] = useState({
    id_insumo: '',
    cantidad: '',
    id_procedimiento: '',
    motivo: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar atención
      const atencionData = await obtenerAtencion(id);
      setAtencion(atencionData);

      // Verificar que la atención esté en curso
      if (atencionData.estado !== 'en_curso') {
        setError('Solo se pueden registrar consumos en atenciones en curso');
        return;
      }

      // Cargar procedimientos de esta atención
      const procsData = await listarProcedimientos();
      const procsAtencion = procsData.filter(p => p.id_atencion === parseInt(id));
      setProcedimientos(procsAtencion);

      // Cargar insumos disponibles
      const insumosData = await listarInsumos();
      setInsumos(insumosData.results || insumosData);

      // Cargar consumos ya registrados
      const consumosData = await listarMovimientosPorAtencion(id);
      setConsumosRegistrados(consumosData);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDialog = () => {
    setNuevoConsumo({
      id_insumo: '',
      cantidad: '',
      id_procedimiento: '',
      motivo: '',
    });
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };

  const handleCerrarDialog = () => {
    setOpenDialog(false);
    setNuevoConsumo({
      id_insumo: '',
      cantidad: '',
      id_procedimiento: '',
      motivo: '',
    });
  };

  const handleRegistrarConsumo = async () => {
    // Validaciones
    if (!nuevoConsumo.id_insumo) {
      setError('Debe seleccionar un insumo');
      return;
    }

    if (!nuevoConsumo.cantidad || parseFloat(nuevoConsumo.cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    // Verificar stock disponible
    const insumoSeleccionado = insumos.find(i => i.id_insumo === nuevoConsumo.id_insumo);
    if (insumoSeleccionado && parseFloat(nuevoConsumo.cantidad) > parseFloat(insumoSeleccionado.stock_actual)) {
      setError(`Stock insuficiente. Disponible: ${insumoSeleccionado.stock_actual} ${insumoSeleccionado.unidad_medida}`);
      return;
    }

    setGuardando(true);
    try {
      const data = {
        insumo_id: nuevoConsumo.id_insumo,
        cantidad: parseFloat(nuevoConsumo.cantidad),
        atencion_id: parseInt(id),
        procedimiento_id: nuevoConsumo.id_procedimiento || null,
        motivo: nuevoConsumo.motivo || 'Consumo en atención',
        responsable_id: user?.id_odontologo || null,
      };

      await registrarConsumo(data);
      setSuccess('Consumo registrado exitosamente');
      setError('');
      handleCerrarDialog();
      
      // Recargar datos
      await cargarDatos();

    } catch (err) {
      console.error('Error al registrar consumo:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error al registrar el consumo';
      setError(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  const getInsumoNombre = (idInsumo) => {
    const insumo = insumos.find(i => i.id_insumo === idInsumo);
    return insumo ? insumo.nombre : 'Desconocido';
  };

  const getProcedimientoNombre = (idProc) => {
    if (!idProc) return 'N/A';
    const proc = procedimientos.find(p => p.id_procedimiento === idProc);
    return proc ? proc.nombre : 'N/A';
  };

  const necesitaReposicion = (insumo) => {
    return insumo.stock_actual <= insumo.stock_minimo;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!atencion) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se encontró la atención</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/atencion/listado')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Registrar Consumo de Insumos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAbrirDialog}
          disabled={atencion.estado !== 'en_curso'}
        >
          Registrar Consumo
        </Button>
      </Box>

      {/* Información de la atención */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Paciente
              </Typography>
              <Typography variant="body1">
                {atencion.paciente_nombre || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Odontólogo
              </Typography>
              <Typography variant="body1">
                {atencion.odontologo_nombre || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Atención
              </Typography>
              <Typography variant="body1">
                {new Date(atencion.fecha_atencion).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Estado
              </Typography>
              <Chip
                label={atencion.estado === 'en_curso' ? 'En Curso' : 'Finalizada'}
                color={atencion.estado === 'en_curso' ? 'primary' : 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabla de consumos registrados */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Consumos Registrados ({consumosRegistrados.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Insumo</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Procedimiento</TableCell>
                  <TableCell>Stock Anterior</TableCell>
                  <TableCell>Stock Posterior</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumosRegistrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay consumos registrados en esta atención
                    </TableCell>
                  </TableRow>
                ) : (
                  consumosRegistrados.map((consumo) => (
                    <TableRow key={consumo.id_movimiento}>
                      <TableCell>
                        {new Date(consumo.fecha_movimiento).toLocaleString()}
                      </TableCell>
                      <TableCell>{consumo.insumo_nombre}</TableCell>
                      <TableCell>{consumo.cantidad}</TableCell>
                      <TableCell>{getProcedimientoNombre(consumo.id_procedimiento)}</TableCell>
                      <TableCell>{consumo.stock_anterior}</TableCell>
                      <TableCell>{consumo.stock_posterior}</TableCell>
                      <TableCell>{consumo.motivo || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Diálogo para registrar nuevo consumo */}
      <Dialog open={openDialog} onClose={handleCerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Consumo de Insumo</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Insumo</InputLabel>
                <Select
                  value={nuevoConsumo.id_insumo}
                  onChange={(e) => setNuevoConsumo({ ...nuevoConsumo, id_insumo: e.target.value })}
                  label="Insumo"
                >
                  <MenuItem value="">
                    <em>Seleccionar insumo</em>
                  </MenuItem>
                  {insumos
                    .filter(i => i.estado === 'activo')
                    .map((insumo) => (
                      <MenuItem key={insumo.id_insumo} value={insumo.id_insumo}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>
                            {insumo.nombre} - Stock: {insumo.stock_actual} {insumo.unidad_medida}
                          </span>
                          {necesitaReposicion(insumo) && (
                            <WarningIcon color="error" fontSize="small" />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="number"
                label="Cantidad"
                value={nuevoConsumo.cantidad}
                onChange={(e) => setNuevoConsumo({ ...nuevoConsumo, cantidad: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={
                  nuevoConsumo.id_insumo
                    ? `Disponible: ${insumos.find(i => i.id_insumo === nuevoConsumo.id_insumo)?.stock_actual || 0} ${insumos.find(i => i.id_insumo === nuevoConsumo.id_insumo)?.unidad_medida || ''}`
                    : ''
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Procedimiento Asociado (Opcional)</InputLabel>
                <Select
                  value={nuevoConsumo.id_procedimiento}
                  onChange={(e) => setNuevoConsumo({ ...nuevoConsumo, id_procedimiento: e.target.value })}
                  label="Procedimiento Asociado (Opcional)"
                >
                  <MenuItem value="">
                    <em>Sin procedimiento</em>
                  </MenuItem>
                  {procedimientos.map((proc) => (
                    <MenuItem key={proc.id_procedimiento} value={proc.id_procedimiento}>
                      {proc.nombre} - {proc.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Motivo (Opcional)"
                value={nuevoConsumo.motivo}
                onChange={(e) => setNuevoConsumo({ ...nuevoConsumo, motivo: e.target.value })}
                placeholder="Ej: Material utilizado en obturación"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarDialog} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleRegistrarConsumo}
            variant="contained"
            disabled={guardando}
            startIcon={guardando ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {guardando ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
