import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Grid,
} from '@mui/material';
import { listarBitacora, obtenerBitacoraUsuario, obtenerBitacoraModulo } from '../../lib/reportes';
import { apiGet } from '../../lib/api';

export default function BitacoraAcciones() {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    usuario_id: '',
  });

  useEffect(() => {
    cargarUsuarios();
    cargarRegistros();
  }, []);

  const cargarUsuarios = async () => {
    try {
      console.log('Intentando cargar usuarios de: /seguridad/api/usuarios/listar_usuarios/');
      const response = await apiGet('/seguridad/api/usuarios/listar_usuarios/');
      console.log('Respuesta del servidor:', response);
      // Si la respuesta es un objeto con results (paginación), usar results, sino usar directamente
      const usuariosData = response.results || response || [];
      console.log('Usuarios a usar:', usuariosData);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsuarios([]);
    }
  };

  const cargarRegistros = async () => {
    setLoading(true);
    try {
      const response = await listarBitacora();
      setRegistros(response);
      setError(null);
    } catch (err) {
      setError('Error al cargar bitácora');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = async () => {
    setLoading(true);
    try {
      let response;

      if (filtros.usuario_id) {
        response = await obtenerBitacoraUsuario(filtros.usuario_id);
      } else {
        response = await listarBitacora();
      }

      setRegistros(response);
      setError(null);
    } catch (err) {
      setError('Error al filtrar bitácora');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ usuario_id: '' });
    cargarRegistros();
  };

  const handleVerDetalle = (registro) => {
    setRegistroSeleccionado(registro);
    setOpenDetalle(true);
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'exitosa':
        return 'success';
      case 'error':
        return 'error';
      case 'advertencia':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <h1>Bitácora de Acciones del Sistema</h1>
        <p>Registro de todas las acciones realizadas por los usuarios en el sistema</p>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Usuario</InputLabel>
              <Select
                value={filtros.usuario_id}
                onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
                label="Usuario"
              >
                <MenuItem value="">Todos</MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.username || usuario.email || usuario.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleFiltrar}
                disabled={loading}
                fullWidth
              >
                Filtrar
              </Button>
              <Button
                variant="outlined"
                onClick={handleLimpiarFiltros}
                disabled={loading}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de registros */}
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Usuario</strong></TableCell>
                <TableCell><strong>Acción</strong></TableCell>
                <TableCell><strong>Fecha/Hora</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay registros en la bitácora
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => (
                  <TableRow key={registro.id_bitacora}>
                    <TableCell>{registro.id_bitacora}</TableCell>
                    <TableCell>{registro.id_usuario.username || registro.id_usuario.nombre}</TableCell>
                    <TableCell>
                      <Chip
                        label={registro.accion}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(registro.fecha_accion).toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleVerDetalle(registro)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de detalle */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del Registro</DialogTitle>
        <DialogContent>
          {registroSeleccionado && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <strong>ID:</strong> {registroSeleccionado.id_bitacora}
              </Box>
              <Box>
                <strong>Usuario:</strong> {registroSeleccionado.id_usuario.username || registroSeleccionado.id_usuario.nombre}
              </Box>
              <Box>
                <strong>Acción:</strong> {registroSeleccionado.accion}
              </Box>
              <Box>
                <strong>Fecha/Hora:</strong> {new Date(registroSeleccionado.fecha_accion).toLocaleString('es-ES')}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
