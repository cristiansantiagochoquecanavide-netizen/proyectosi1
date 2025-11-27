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
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  listarReportesFinancieros, 
  generarReporteFinanciero, 
  descargarReporte, 
  eliminarReporte 
} from '../../lib/reportes';

export default function ReportesFinanciero() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    titulo: 'Reporte Financiero',
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const response = await listarReportesFinancieros();
      setReportes(response);
      setError(null);
    } catch (err) {
      setError('Error al cargar reportes financieros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = async () => {
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      setError('Debe completar las fechas');
      return;
    }

    setLoading(true);
    try {
      const response = await generarReporteFinanciero({
        titulo: formData.titulo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
      });
      setReportes([response, ...reportes]);
      setOpenDialog(false);
      setFormData({
        titulo: 'Reporte Financiero',
        fecha_inicio: '',
        fecha_fin: '',
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al generar reporte financiero');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (reporte) => {
    try {
      const datos = await descargarReporte(reporte.id_reporte);
      const dataStr = JSON.stringify(datos, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_financiero_${reporte.id_reporte}.json`;
      link.click();
    } catch (err) {
      setError('Error al descargar reporte');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Desea eliminar este reporte?')) {
      try {
        await eliminarReporte(id);
        setReportes(reportes.filter(r => r.id_reporte !== id));
      } catch (err) {
        setError('Error al eliminar reporte');
      }
    }
  };

  const handleVerDetalle = (reporte) => {
    setReporteSeleccionado(reporte);
    setOpenDetalle(true);
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(valor);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Generar Nuevo Reporte
        </Button>
        <Button
          variant="outlined"
          onClick={cargarReportes}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Rango de Fechas</strong></TableCell>
                <TableCell align="right"><strong>Ingresos</strong></TableCell>
                <TableCell align="right"><strong>Egresos</strong></TableCell>
                <TableCell align="right"><strong>Balance</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay reportes financieros
                  </TableCell>
                </TableRow>
              ) : (
                reportes.map((reporte) => (
                  <TableRow key={reporte.id_reporte}>
                    <TableCell>{reporte.id_reporte}</TableCell>
                    <TableCell>{reporte.titulo}</TableCell>
                    <TableCell>
                      {reporte.fecha_inicio} a {reporte.fecha_fin}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'green', fontWeight: 'bold' }}>
                      {formatoMoneda(reporte.total_ingresos)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'red', fontWeight: 'bold' }}>
                      {formatoMoneda(reporte.total_egresos)}
                    </TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: reporte.balance_neto >= 0 ? 'green' : 'red'
                      }}
                    >
                      {formatoMoneda(reporte.balance_neto)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reporte.estado}
                        color={
                          reporte.estado === 'completado' ? 'success' :
                          reporte.estado === 'error' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleVerDetalle(reporte)}
                        sx={{ mr: 1 }}
                      >
                        Ver
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        color="success"
                        onClick={() => handleDescargar(reporte)}
                        sx={{ mr: 1 }}
                      >
                        Descargar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(reporte.id_reporte)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para generar reporte */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generar Nuevo Reporte Financiero</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Título"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              fullWidth
            />
            <TextField
              label="Fecha Inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fecha Fin"
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleGenerarReporte}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para detalle del reporte */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle del Reporte Financiero</DialogTitle>
        <DialogContent>
          {reporteSeleccionado && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <h3>Información General</h3>
                      <p><strong>Título:</strong> {reporteSeleccionado.titulo}</p>
                      <p><strong>Rango:</strong> {reporteSeleccionado.fecha_inicio} a {reporteSeleccionado.fecha_fin}</p>
                      <p><strong>Generado por:</strong> {reporteSeleccionado.generado_por_nombre}</p>
                      <p><strong>Estado:</strong> {reporteSeleccionado.estado}</p>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <h3>Totales Financieros</h3>
                      <p><strong>Total Ingresos:</strong> <span style={{ color: 'green' }}>{formatoMoneda(reporteSeleccionado.total_ingresos)}</span></p>
                      <p><strong>Total Egresos:</strong> <span style={{ color: 'red' }}>{formatoMoneda(reporteSeleccionado.total_egresos)}</span></p>
                      <p><strong>Balance Neto:</strong> <span style={{ color: reporteSeleccionado.balance_neto >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>{formatoMoneda(reporteSeleccionado.balance_neto)}</span></p>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <h3>Estadísticas de Facturas</h3>
                      <p><strong>Cantidad de Facturas:</strong> {reporteSeleccionado.cantidad_facturas}</p>
                      <p><strong>Promedio por Factura:</strong> {reporteSeleccionado.cantidad_facturas > 0 ? formatoMoneda(reporteSeleccionado.total_ingresos / reporteSeleccionado.cantidad_facturas) : '0'}</p>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <h3>Estadísticas de Compras</h3>
                      <p><strong>Cantidad de Compras:</strong> {reporteSeleccionado.cantidad_compras}</p>
                      <p><strong>Promedio por Compra:</strong> {reporteSeleccionado.cantidad_compras > 0 ? formatoMoneda(reporteSeleccionado.total_egresos / reporteSeleccionado.cantidad_compras) : '0'}</p>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
