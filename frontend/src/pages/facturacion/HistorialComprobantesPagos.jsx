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
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import { apiGet } from '../../lib/api';
import { historialComprobantesPagos } from '../../lib/facturacion';

const ESTADOS = {
  borrador: { label: 'Borrador', color: 'default' },
  emitida: { label: 'Emitida', color: 'primary' },
  pagada_parcial: { label: 'Pago Parcial', color: 'warning' },
  pagada: { label: 'Pagada', color: 'success' },
  vencida: { label: 'Vencida', color: 'error' },
  anulada: { label: 'Anulada', color: 'error' },
};

export default function HistorialComprobantesPagos() {
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [totales, setTotales] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    paciente_id: '',
    estado: '',
  });

  useEffect(() => {
    cargarPacientes();
    cargarHistorial();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await apiGet('/pacientes/api/pacientes/');
      setPacientes(data.results || data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    }
  };

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const data = await historialComprobantesPagos(filtros);
      setResultados(data.resultados || []);
      setTotales(data.totales || null);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    cargarHistorial();
  };

  const handleLimpiar = () => {
    setFiltros({
      fecha_desde: '',
      fecha_hasta: '',
      paciente_id: '',
      estado: '',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Historial de Comprobantes y Pagos
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Fecha desde"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filtros.fecha_desde}
                  onChange={(e) => handleChangeFiltro('fecha_desde', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Fecha hasta"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filtros.fecha_hasta}
                  onChange={(e) => handleChangeFiltro('fecha_hasta', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Paciente</InputLabel>
                  <Select
                    label="Paciente"
                    value={filtros.paciente_id}
                    onChange={(e) => handleChangeFiltro('paciente_id', e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {pacientes.map((p) => (
                      <MenuItem key={p.id_paciente} value={p.id_paciente}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    label="Estado"
                    value={filtros.estado}
                    onChange={(e) => handleChangeFiltro('estado', e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {Object.keys(ESTADOS).map((est) => (
                      <MenuItem key={est} value={est}>
                        {ESTADOS[est].label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleLimpiar}>
                  Limpiar
                </Button>
                <Button type="submit" variant="contained">
                  Aplicar filtros
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {totales && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Totales del período
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Total facturado
                </Typography>
                <Typography variant="h6">
                  Bs. {parseFloat(totales.total_facturado || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Total pagado
                </Typography>
                <Typography variant="h6">
                  Bs. {parseFloat(totales.total_pagado || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Saldo pendiente
                </Typography>
                <Typography variant="h6">
                  Bs. {parseFloat(totales.total_saldo_pendiente || 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Comprobantes encontrados
                </Typography>
                <Typography variant="h6">
                  {totales.cantidad_comprobantes || 0}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
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
                <TableCell>Nº Factura</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Saldo pendiente</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultados.map((factura) => {
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
                    <TableCell align="right">
                      Bs. {parseFloat(factura.saldo_pendiente || 0).toFixed(2)}
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

