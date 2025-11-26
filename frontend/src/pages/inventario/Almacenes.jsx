import React, { useEffect, useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  listarAlmacenes,
  crearAlmacen,
  actualizarAlmacen,
  eliminarAlmacen,
} from '../../lib/inventario';

export default function Almacenes() {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    ubicacion: '',
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarAlmacenes();
  }, []);

  const cargarAlmacenes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarAlmacenes();
      setAlmacenes(data.results || data);
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
      setError('Error al cargar los almacenes.');
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ nombre: '', ubicacion: '' });
    setError('');
    setDialogOpen(true);
  };

  const abrirEditar = (almacen) => {
    setEditando(almacen);
    setForm({
      nombre: almacen.nombre || '',
      ubicacion: almacen.ubicacion || '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre del almacén es obligatorio.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      if (editando) {
        await actualizarAlmacen(editando.id_almacen, form);
      } else {
        await crearAlmacen(form);
      }
      setDialogOpen(false);
      await cargarAlmacenes();
    } catch (err) {
      console.error('Error al guardar almacén:', err);
      setError('Error al guardar almacén. Verifique los datos (nombre único).');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (almacen) => {
    const ok = window.confirm(`¿Eliminar almacén "${almacen.nombre}"?`);
    if (!ok) return;
    try {
      await eliminarAlmacen(almacen.id_almacen);
      await cargarAlmacenes();
    } catch (err) {
      console.error('Error al eliminar almacén:', err);
      alert('No se pudo eliminar el almacén.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Almacenes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo Almacén
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
                <TableCell>Nombre</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {almacenes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay almacenes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                almacenes.map((almacen) => (
                  <TableRow key={almacen.id_almacen} hover>
                    <TableCell>{almacen.id_almacen}</TableCell>
                    <TableCell>{almacen.nombre}</TableCell>
                    <TableCell>{almacen.ubicacion}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirEditar(almacen)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(almacen)}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Almacén' : 'Nuevo Almacén'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            required
            margin="dense"
            label="Nombre"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Ubicación"
            value={form.ubicacion}
            onChange={(e) => handleChange('ubicacion', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} variant="contained" disabled={guardando}>
            {guardando ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

