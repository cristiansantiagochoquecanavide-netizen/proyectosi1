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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { listarAtenciones, registrarProcedimiento, listarProcedimientos, eliminarProcedimiento } from '../../lib/atencion';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Procedimientos() {
  const location = useLocation();
  const navigate = useNavigate();
  const atencionIdProp = location.state?.atencionId;
  
  const [procedimientos, setProcedimientos] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal para crear/editar procedimiento
  const [openDialog, setOpenDialog] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    id_atencion: atencionIdProp || '',
    nombre: '',
    descripcion: '',
    pieza_dental: '',
    duracion_minutos: 30,
    costo: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      const [procData, atencData] = await Promise.all([
        listarProcedimientos(),
        listarAtenciones(),
      ]);
      
      setProcedimientos(procData.results || procData);
      // Filtrar solo atenciones en curso
      const atencionesEnCurso = (atencData.results || atencData).filter(a => a.estado === 'en_curso');
      setAtenciones(atencionesEnCurso);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      id_atencion: atencionIdProp || '',
      nombre: '',
      descripcion: '',
      pieza_dental: '',
      duracion_minutos: 30,
      costo: 0,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (!guardando) {
      setOpenDialog(false);
      setError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardar = async () => {
    if (!formData.id_atencion || !formData.nombre || !formData.descripcion) {
      setError('Complete todos los campos obligatorios');
      return;
    }

    setGuardando(true);
    try {
      await registrarProcedimiento(formData);
      await cargarDatos();
      setOpenDialog(false);
      setError('');
    } catch (err) {
      console.error('Error al guardar procedimiento:', err);
      setError('Error al guardar el procedimiento');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este procedimiento?')) return;
    
    try {
      await eliminarProcedimiento(id);
      await cargarDatos();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el procedimiento');
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {atencionIdProp && (
            <IconButton onClick={() => navigate('/atencion')} color="primary">
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h4">
            {atencionIdProp ? `Procedimientos - Atención #${atencionIdProp}` : 'Registro de Procedimientos'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Registrar Procedimiento
        </Button>
      </Box>

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
                <TableCell>Atención</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Procedimiento</TableCell>
                <TableCell>Pieza Dental</TableCell>
                <TableCell>Duración (min)</TableCell>
                <TableCell>Costo (Bs.)</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {procedimientos.filter(p => !atencionIdProp || p.id_atencion === atencionIdProp).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay procedimientos registrados {atencionIdProp && 'para esta atención'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                procedimientos.filter(p => !atencionIdProp || p.id_atencion === atencionIdProp).map((proc) => (
                  <TableRow key={proc.id_procedimiento} hover>
                    <TableCell>{proc.id_procedimiento}</TableCell>
                    <TableCell>#{proc.id_atencion}</TableCell>
                    <TableCell>
                      {atenciones.find(a => a.id_atencion === proc.id_atencion)?.paciente_nombre || '-'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {proc.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proc.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {proc.pieza_dental ? (
                        <Chip label={proc.pieza_dental} size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{proc.duracion_minutos}</TableCell>
                    <TableCell>{proc.costo.toFixed(2)}</TableCell>
                    <TableCell>{formatearFecha(proc.created_at)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(proc.id_procedimiento)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para registrar procedimiento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Registrar Procedimiento</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                required
                label="Atención"
                name="id_atencion"
                value={formData.id_atencion}
                onChange={handleChange}
                helperText="Seleccione la atención en curso"
              >
                {atenciones.length === 0 ? (
                  <MenuItem disabled>No hay atenciones en curso</MenuItem>
                ) : (
                  atenciones.map((atencion) => (
                    <MenuItem key={atencion.id_atencion} value={atencion.id_atencion}>
                      Atención #{atencion.id_atencion} - {atencion.paciente_nombre} ({formatearFecha(atencion.fecha_inicio)})
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                label="Nombre del Procedimiento"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Extracción dental, Limpieza, Obturación"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pieza Dental"
                name="pieza_dental"
                value={formData.pieza_dental}
                onChange={handleChange}
                placeholder="Ej: 16, 31"
                helperText="Numeración FDI"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalle del procedimiento realizado..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Duración (minutos)"
                name="duracion_minutos"
                value={formData.duracion_minutos}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Costo (Bs.)"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={guardando || atenciones.length === 0}
          >
            {guardando ? 'Guardando...' : 'Guardar Procedimiento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
