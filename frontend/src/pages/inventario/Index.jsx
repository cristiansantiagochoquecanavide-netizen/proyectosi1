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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { listarInsumos } from '../../lib/inventario';

export default function Inventario() {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

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
                    key={insumo.id}
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
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
