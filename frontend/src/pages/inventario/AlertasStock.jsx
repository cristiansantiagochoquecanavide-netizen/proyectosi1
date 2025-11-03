import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { listarInsumosNecesitanReposicion } from '../../lib/inventario';

export default function AlertasStock() {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAlertasStock();
  }, []);

  const cargarAlertasStock = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listarInsumosNecesitanReposicion();
      setInsumos(data || []);
    } catch (err) {
      console.error('Error al cargar alertas:', err);
      setError('Error al cargar las alertas de stock');
    } finally {
      setLoading(false);
    }
  };

  const getNivelCriticidad = (insumo) => {
    const porcentaje = (insumo.stock_actual / insumo.stock_minimo) * 100;
    if (porcentaje === 0) return { label: 'Agotado', color: 'error' };
    if (porcentaje <= 50) return { label: 'Crítico', color: 'error' };
    if (porcentaje <= 100) return { label: 'Bajo', color: 'warning' };
    return { label: 'Normal', color: 'success' };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4">Alertas de Stock</Typography>
            <Typography variant="body2" color="text.secondary">
              Insumos que requieren reposición
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => navigate('/inventario/ordenes')}
        >
          Crear Orden de Compra
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : insumos.length === 0 ? (
        <Alert severity="success" icon={<WarningIcon />}>
          ¡Excelente! No hay insumos con stock bajo en este momento.
        </Alert>
      ) : (
        <>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Se encontraron {insumos.length} insumo(s) que necesitan reposición
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell align="center">Stock Actual</TableCell>
                  <TableCell align="center">Stock Mínimo</TableCell>
                  <TableCell align="center">Necesita</TableCell>
                  <TableCell>Criticidad</TableCell>
                  <TableCell>Precio Unit.</TableCell>
                  <TableCell align="right">Costo Reposición</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {insumos.map((insumo) => {
                  const criticidad = getNivelCriticidad(insumo);
                  const cantidadNecesaria = insumo.stock_maximo - insumo.stock_actual;
                  const costoReposicion = cantidadNecesaria * parseFloat(insumo.precio_unitario || 0);

                  return (
                    <TableRow
                      key={insumo.id}
                      hover
                      sx={{
                        bgcolor: criticidad.color === 'error' ? 'error.lighter' : 'warning.lighter',
                      }}
                    >
                      <TableCell>{insumo.codigo}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color={criticidad.color} fontSize="small" />
                          {insumo.nombre}
                        </Box>
                      </TableCell>
                      <TableCell>{insumo.categoria}</TableCell>
                      <TableCell align="center">
                        <Typography color={criticidad.color} fontWeight="bold">
                          {insumo.stock_actual}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{insumo.stock_minimo}</TableCell>
                      <TableCell align="center">
                        <Chip label={cantidadNecesaria} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={criticidad.label} color={criticidad.color} size="small" />
                      </TableCell>
                      <TableCell>Bs. {parseFloat(insumo.precio_unitario || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">Bs. {costoReposicion.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Reposición
              </Typography>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Insumos:
                  </Typography>
                  <Typography variant="h5">{insumos.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Costo Total Estimado:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    Bs.{' '}
                    {insumos
                      .reduce((acc, ins) => {
                        const cant = ins.stock_maximo - ins.stock_actual;
                        return acc + cant * parseFloat(ins.precio_unitario || 0);
                      }, 0)
                      .toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
