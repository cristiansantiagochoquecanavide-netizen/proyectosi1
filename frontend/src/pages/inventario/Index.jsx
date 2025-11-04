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
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { listarInsumos, eliminarInsumo, actualizarInsumo } from '../../lib/inventario';

export default function Inventario() {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para edición
  const [openEditar, setOpenEditar] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listarInsumos();
      setInsumos(data.results || data);
    } catch (err) {
      console.error('Error al cargar insumos:', err);
      setError('Error al cargar los insumos');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirEditar = (insumo) => {
    setInsumoEditando({ ...insumo });
    setError('');
    setOpenEditar(true);
  };

  const handleGuardarEdicion = async () => {
    if (!insumoEditando.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setGuardando(true);
    try {
      await actualizarInsumo(insumoEditando.id_insumo, {
        nombre: insumoEditando.nombre,
        codigo: insumoEditando.codigo,
        descripcion: insumoEditando.descripcion,
        categoria: insumoEditando.categoria,
        stock_actual: parseFloat(insumoEditando.stock_actual) || 0,
        stock_minimo: parseFloat(insumoEditando.stock_minimo) || 0,
        stock_maximo: parseFloat(insumoEditando.stock_maximo) || 0,
        unidad_medida: insumoEditando.unidad_medida,
        precio_unitario: parseFloat(insumoEditando.precio_unitario) || 0,
      });

      setOpenEditar(false);
      setError('');
      await cargarInsumos();
    } catch (err) {
      console.error('Error al actualizar insumo:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error al actualizar el insumo';
      setError(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este insumo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setError('');
      await eliminarInsumo(id);
      await cargarInsumos();
    } catch (err) {
      console.error('Error al eliminar insumo:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error al eliminar el insumo';
      setError(errorMsg);
    }
  };

  const insumosFiltrados = insumos.filter((insumo) =>
    insumo.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    insumo.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getCategoriaLabel = (categoria) => {
    const categorias = {
      material: 'Material',
      medicamento: 'Medicamento',
      instrumento: 'Instrumento',
    };
    return categorias[categoria] || categoria;
  };

  const necesitaReposicion = (insumo) => {
    return insumo.stock_actual <= insumo.stock_minimo;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Inventario de Insumos</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<WarningIcon />}
            onClick={() => navigate('/inventario/alertas')}
          >
            Ver Alertas
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/inventario/nuevo')}
          >
            Nuevo Insumo
          </Button>
        </Box>
      </Box>

      {/* Barra de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Stock Actual</TableCell>
                <TableCell>Stock Mínimo</TableCell>
                <TableCell>Stock Máximo</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell>Precio Unit.</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    {busqueda ? 'No se encontraron resultados' : 'No hay insumos registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                insumosFiltrados.map((insumo) => (
                  <TableRow
                    key={insumo.id_insumo}
                    hover
                    sx={{
                      bgcolor: necesitaReposicion(insumo) ? 'error.lighter' : 'inherit',
                    }}
                  >
                    <TableCell>{insumo.codigo}</TableCell>
                    <TableCell>{insumo.nombre}</TableCell>
                    <TableCell>
                      <Chip label={getCategoriaLabel(insumo.categoria)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {insumo.stock_actual}
                        {necesitaReposicion(insumo) && (
                          <WarningIcon color="error" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{insumo.stock_minimo}</TableCell>
                    <TableCell>{insumo.stock_maximo}</TableCell>
                    <TableCell>{insumo.unidad_medida}</TableCell>
                    <TableCell>Bs. {parseFloat(insumo.precio_unitario || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      {necesitaReposicion(insumo) ? (
                        <Chip label="Bajo Stock" color="error" size="small" />
                      ) : (
                        <Chip label="Normal" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAbrirEditar(insumo)}
                          title="Editar insumo"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminar(insumo.id_insumo)}
                          title="Eliminar insumo"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Editar Insumo */}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Insumo</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nombre"
                value={insumoEditando?.nombre || ''}
                onChange={(e) =>
                  setInsumoEditando({ ...insumoEditando, nombre: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled
                label="Código (Auto-generado)"
                value={insumoEditando?.codigo || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción"
                value={insumoEditando?.descripcion || ''}
                onChange={(e) =>
                  setInsumoEditando({ ...insumoEditando, descripcion: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={insumoEditando?.categoria || 'material'}
                  label="Categoría"
                  onChange={(e) =>
                    setInsumoEditando({ ...insumoEditando, categoria: e.target.value })
                  }
                >
                  <MenuItem value="material">Material</MenuItem>
                  <MenuItem value="medicamento">Medicamento</MenuItem>
                  <MenuItem value="instrumento">Instrumento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  value={insumoEditando?.unidad_medida || 'unidad'}
                  label="Unidad de Medida"
                  onChange={(e) =>
                    setInsumoEditando({ ...insumoEditando, unidad_medida: e.target.value })
                  }
                >
                  <MenuItem value="unidad">Unidad</MenuItem>
                  <MenuItem value="caja">Caja</MenuItem>
                  <MenuItem value="paquete">Paquete</MenuItem>
                  <MenuItem value="frasco">Frasco</MenuItem>
                  <MenuItem value="tubo">Tubo</MenuItem>
                  <MenuItem value="litro">Litro</MenuItem>
                  <MenuItem value="ml">Mililitro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Stock Actual"
                value={insumoEditando?.stock_actual || 0}
                onChange={(e) =>
                  setInsumoEditando({ ...insumoEditando, stock_actual: e.target.value })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Stock Mínimo"
                value={insumoEditando?.stock_minimo || 0}
                onChange={(e) =>
                  setInsumoEditando({ ...insumoEditando, stock_minimo: e.target.value })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Stock Máximo"
                value={insumoEditando?.stock_maximo || 0}
                onChange={(e) =>
                  setInsumoEditando({ ...insumoEditando, stock_maximo: e.target.value })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Precio Unitario (Bs.)"
                value={insumoEditando?.precio_unitario || 0}
                onChange={(e) =>
                  setInsumoEditando({ ...insumoEditando, precio_unitario: e.target.value })
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarEdicion}
            variant="contained"
            disabled={guardando}
            startIcon={guardando && <CircularProgress size={20} />}
          >
            {guardando ? 'Guardando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
