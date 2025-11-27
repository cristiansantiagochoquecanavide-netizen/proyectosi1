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

export default function BitacoraAcciones() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo_accion: '',
    modulo: '',
    usuario_id: '',
  });

  useEffect(() => {
    cargarRegistros();
  }, []);

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
      } else if (filtros.modulo) {
        response = await obtenerBitacoraModulo(filtros.modulo, filtros.tipo_accion);
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
    setFiltros({ tipo_accion: '', modulo: '', usuario_id: '' });
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Acción</InputLabel>
              <Select
                value={filtros.tipo_accion}
                onChange={(e) => setFiltros({ ...filtros, tipo_accion: e.target.value })}
                label="Tipo de Acción"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="crear">Crear</MenuItem>
                <MenuItem value="actualizar">Actualizar</MenuItem>
                <MenuItem value="eliminar">Eliminar</MenuItem>
                <MenuItem value="ver">Ver</MenuItem>
                <MenuItem value="descargar">Descargar</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Módulo</InputLabel>
              <Select
                value={filtros.modulo}
                onChange={(e) => setFiltros({ ...filtros, modulo: e.target.value })}
                label="Módulo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pacientes">Pacientes</MenuItem>
                <MenuItem value="citas">Citas</MenuItem>
                <MenuItem value="facturas">Facturas</MenuItem>
                <MenuItem value="reportes">Reportes</MenuItem>
                <MenuItem value="atenciones">Atenciones</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="ID Usuario"
              type="number"
              value={filtros.usuario_id}
              onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                <TableCell><strong>Módulo</strong></TableCell>
                <TableCell><strong>Objeto</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Fecha/Hora</strong></TableCell>
                <TableCell><strong>IP</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No hay registros en la bitácora
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => (
                  <TableRow key={registro.id_registro}>
                    <TableCell>{registro.id_registro}</TableCell>
                    <TableCell>{registro.usuario_nombre}</TableCell>
                    <TableCell>
                      <Chip
                        label={registro.tipo_accion}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{registro.modulo}</TableCell>
                    <TableCell>
                      {registro.objeto_tipo} {registro.objeto_id ? `#${registro.objeto_id}` : ''}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={registro.estado}
                        size="small"
                        color={getColorEstado(registro.estado)}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(registro.fecha_hora).toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell>{registro.direccion_ip}</TableCell>
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
                <strong>Usuario:</strong> {registroSeleccionado.usuario_nombre}
              </Box>
              <Box>
                <strong>Tipo de Acción:</strong> {registroSeleccionado.tipo_accion}
              </Box>
              <Box>
                <strong>Módulo:</strong> {registroSeleccionado.modulo}
              </Box>
              <Box>
                <strong>Objeto:</strong> {registroSeleccionado.objeto_tipo} {registroSeleccionado.objeto_id}
              </Box>
              <Box>
                <strong>Descripción:</strong> {registroSeleccionado.descripcion}
              </Box>
              <Box>
                <strong>Estado:</strong> <Chip label={registroSeleccionado.estado} size="small" />
              </Box>
              <Box>
                <strong>Fecha/Hora:</strong> {new Date(registroSeleccionado.fecha_hora).toLocaleString('es-ES')}
              </Box>
              <Box>
                <strong>IP:</strong> {registroSeleccionado.direccion_ip}
              </Box>
              {registroSeleccionado.mensaje_error && (
                <Box>
                  <strong>Mensaje de Error:</strong> {registroSeleccionado.mensaje_error}
                </Box>
              )}
              {registroSeleccionado.datos_anteriores && Object.keys(registroSeleccionado.datos_anteriores).length > 0 && (
                <Box>
                  <strong>Datos Anteriores:</strong>
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    {JSON.stringify(registroSeleccionado.datos_anteriores, null, 2)}
                  </pre>
                </Box>
              )}
              {registroSeleccionado.datos_nuevos && Object.keys(registroSeleccionado.datos_nuevos).length > 0 && (
                <Box>
                  <strong>Datos Nuevos:</strong>
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    {JSON.stringify(registroSeleccionado.datos_nuevos, null, 2)}
                  </pre>
                </Box>
              )}
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
