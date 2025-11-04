import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { listarMovimientos } from '../../lib/inventario';

const TIPOS_MOVIMIENTO = {
  entrada: { label: 'Entrada', color: 'success' },
  salida: { label: 'Salida', color: 'error' },
  consumo: { label: 'Consumo', color: 'warning' },
  devolucion: { label: 'Devolución', color: 'info' },
  ajuste_positivo: { label: 'Ajuste +', color: 'primary' },
  ajuste_negativo: { label: 'Ajuste -', color: 'secondary' },
  merma: { label: 'Merma', color: 'default' },
};

export default function Movimientos() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      const data = await listarMovimientos();
      setMovimientos(data.results || data);
    } catch (err) {
      setError('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  const movimientosFiltrados = filtroTipo
    ? movimientos.filter((m) => m.tipo_movimiento === filtroTipo)
    : movimientos;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Movimientos de Inventario
        </Typography>
      </Box>

      {/* Información sobre consumos */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Para registrar consumos de insumos durante una atención, vaya a{' '}
          <Button
            size="small"
            variant="text"
            onClick={() => navigate('/atencion/listado')}
            sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
          >
            Listado de Atenciones
          </Button>
          {' '}y seleccione el botón de inventario en la atención en curso.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Tipo</InputLabel>
            <Select value={filtroTipo} label="Filtrar por Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {Object.keys(TIPOS_MOVIMIENTO).map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {TIPOS_MOVIMIENTO[tipo].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Insumo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell align="center">Stock Anterior</TableCell>
                <TableCell align="center">Stock Posterior</TableCell>
                <TableCell>Observaciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientosFiltrados.map((mov) => {
                const tipoConfig = TIPOS_MOVIMIENTO[mov.tipo_movimiento] || { label: mov.tipo_movimiento, color: 'default' };
                return (
                  <TableRow key={mov.id} hover>
                    <TableCell>{new Date(mov.fecha).toLocaleString('es-BO')}</TableCell>
                    <TableCell>{mov.nombre_insumo}</TableCell>
                    <TableCell>
                      <Chip label={tipoConfig.label} color={tipoConfig.color} size="small" />
                    </TableCell>
                    <TableCell align="center">{mov.cantidad}</TableCell>
                    <TableCell align="center">{mov.stock_anterior}</TableCell>
                    <TableCell align="center">{mov.stock_posterior}</TableCell>
                    <TableCell>{mov.observaciones || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
