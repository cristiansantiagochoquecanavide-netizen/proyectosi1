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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { listarOrdenesCompra, crearOrdenCompra, cambiarEstadoOrden } from '../../lib/inventario';

const ESTADOS = {
  borrador: { label: 'Borrador', color: 'default' },
  enviada: { label: 'Enviada', color: 'info' },
  confirmada: { label: 'Confirmada', color: 'primary' },
  recibida: { label: 'Recibida', color: 'success' },
  cancelada: { label: 'Cancelada', color: 'error' },
};

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNueva, setOpenNueva] = useState(false);
  const [nueva, setNueva] = useState({
    proveedor: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      const data = await listarOrdenesCompra();
      setOrdenes(data.results || data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearOrden = async () => {
    try {
      await crearOrdenCompra(nueva);
      setOpenNueva(false);
      cargarOrdenes();
    } catch (err) {
      alert('Error al crear orden');
    }
  };

  const handleCambiarEstado = async (ordenId, nuevoEstado) => {
    try {
      await cambiarEstadoOrden(ordenId, { estado: nuevoEstado });
      cargarOrdenes();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Órdenes de Compra</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNueva(true)}>
          Nueva Orden
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
                <TableCell>N° Orden</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenes.map((orden) => {
                const estadoConfig = ESTADOS[orden.estado] || ESTADOS.borrador;
                return (
                  <TableRow key={orden.id} hover>
                    <TableCell>{orden.numero_orden}</TableCell>
                    <TableCell>{new Date(orden.fecha_orden).toLocaleDateString('es-BO')}</TableCell>
                    <TableCell>{orden.proveedor}</TableCell>
                    <TableCell>
                      <Chip label={estadoConfig.label} color={estadoConfig.color} size="small" />
                    </TableCell>
                    <TableCell align="right">Bs. {parseFloat(orden.total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      {orden.estado !== 'recibida' && orden.estado !== 'cancelada' && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={orden.estado}
                            onChange={(e) => handleCambiarEstado(orden.id, e.target.value)}
                          >
                            {Object.keys(ESTADOS).map((est) => (
                              <MenuItem key={est} value={est}>
                                {ESTADOS[est].label}
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
      )}

      <Dialog open={openNueva} onClose={() => setOpenNueva(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Orden de Compra</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Proveedor"
                value={nueva.proveedor}
                onChange={(e) => setNueva({ ...nueva, proveedor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={nueva.observaciones}
                onChange={(e) => setNueva({ ...nueva, observaciones: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNueva(false)}>Cancelar</Button>
          <Button onClick={handleCrearOrden} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
