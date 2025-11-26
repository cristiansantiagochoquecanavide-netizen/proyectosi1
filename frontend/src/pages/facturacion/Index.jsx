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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { listarFacturas, eliminarFactura } from '../../lib/facturacion';

const ESTADOS = {
  borrador: { label: 'Borrador', color: 'default' },
  emitida: { label: 'Emitida', color: 'primary' },
  pagada_parcial: { label: 'Pago Parcial', color: 'warning' },
  pagada: { label: 'Pagada', color: 'success' },
  cancelada: { label: 'Cancelada', color: 'error' },
};

export default function Facturacion() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const data = await listarFacturas();
      setFacturas(data.results || data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const facturasFiltradas = filtroEstado
    ? facturas.filter((f) => f.estado === filtroEstado)
    : facturas;

  const handleEliminar = async (factura) => {
    const ok = window.confirm(`¿Eliminar la factura ${factura.numero_factura}?`);
    if (!ok) return;
    try {
      await eliminarFactura(factura.id_factura);
      await cargarFacturas();
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      alert('No se pudo eliminar la factura.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Facturas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/facturacion/nueva')}
        >
          Nueva Factura
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {Object.keys(ESTADOS).map((est) => (
                <MenuItem key={est} value={est}>
                  {ESTADOS[est].label}
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Factura</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturasFiltradas.map((factura) => {
                const estadoConfig = ESTADOS[factura.estado] || ESTADOS.borrador;
                return (
                  <TableRow key={factura.id_factura} hover>
                    <TableCell>{factura.numero_factura}</TableCell>
                    <TableCell>
                      {new Date(factura.fecha_emision).toLocaleDateString('es-BO')}
                    </TableCell>
                    <TableCell>{factura.paciente_nombre || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={estadoConfig.label} color={estadoConfig.color} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      Bs. {parseFloat(factura.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleEliminar(factura)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
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
