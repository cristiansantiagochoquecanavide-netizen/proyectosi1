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
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from '../../lib/inventario';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarProveedores();
      setProveedores(data.results || data);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      setError('Error al cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm({
      nombre: '',
      nit: '',
      telefono: '',
      email: '',
      direccion: '',
    });
    setError('');
    setDialogOpen(true);
  };

  const abrirEditar = (prov) => {
    setEditando(prov);
    setForm({
      nombre: prov.nombre || '',
      nit: prov.nit || '',
      telefono: prov.telefono || '',
      email: prov.email || '',
      direccion: prov.direccion || '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.nit.trim()) {
      setError('Nombre y NIT son obligatorios.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      if (editando) {
        await actualizarProveedor(editando.id_proveedor, form);
      } else {
        await crearProveedor(form);
      }
      setDialogOpen(false);
      await cargarProveedores();
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      setError('Error al guardar proveedor. Verifique los datos (NIT único).');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (prov) => {
    const ok = window.confirm(`¿Eliminar proveedor "${prov.nombre}"?`);
    if (!ok) return;
    try {
      await eliminarProveedor(prov.id_proveedor);
      await cargarProveedores();
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
      alert('No se pudo eliminar el proveedor.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Proveedores</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo Proveedor
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
                <TableCell>NIT</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proveedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay proveedores registrados.
                  </TableCell>
                </TableRow>
              ) : (
                proveedores.map((prov) => (
                  <TableRow key={prov.id_proveedor} hover>
                    <TableCell>{prov.id_proveedor}</TableCell>
                    <TableCell>{prov.nombre}</TableCell>
                    <TableCell>{prov.nit}</TableCell>
                    <TableCell>{prov.telefono}</TableCell>
                    <TableCell>{prov.email}</TableCell>
                    <TableCell>{prov.direccion}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirEditar(prov)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(prov)}
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
        <DialogTitle>{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
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
            required
            margin="dense"
            label="NIT"
            value={form.nit}
            onChange={(e) => handleChange('nit', e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Teléfono"
            value={form.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Dirección"
            value={form.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
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

