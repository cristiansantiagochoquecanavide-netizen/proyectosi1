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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { listarReportesClinico, generarReporteClinico, descargarReporteClinico } from '../../lib/reportes';

export default function ReportesClinico() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    id_odontologo: '',
  });
  const [formData, setFormData] = useState({
    titulo: 'Reporte Clínico',
    fecha_inicio: '',
    fecha_fin: '',
    id_odontologo: '',
  });

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const response = await listarReportesClinico();
      setReportes(response);
      setError(null);
    } catch (err) {
      setError('Error al cargar reportes clínicos');
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
      const datos = {
        titulo: formData.titulo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        id_odontologo: formData.id_odontologo ? parseInt(formData.id_odontologo) : null,
      };

      const response = await generarReporteClinico(datos);
      setReportes([response, ...reportes]);
      setOpenDialog(false);
      setFormData({
        titulo: 'Reporte Clínico',
        fecha_inicio: '',
        fecha_fin: '',
        id_odontologo: '',
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al generar reporte clínico');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (reporte) => {
    try {
      const datos = await descargarReporteClinico(reporte.id_reporte);
      // Descargar como JSON
      const dataStr = JSON.stringify(datos, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_clinico_${reporte.id_reporte}.json`;
      link.click();
    } catch (err) {
      setError('Error al descargar reporte');
    }
  };

  const handleVerDetalle = (reporte) => {
    setReporteSeleccionado(reporte);
    setOpenDetalle(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <h1>Reportes Clínicos y de Citas</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ mr: 2 }}
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
                <TableCell><strong>Total Atenciones</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay reportes clínicos
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
                    <TableCell>{reporte.total_atenciones}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            reporte.estado === 'completado'
                              ? '#4caf50'
                              : reporte.estado === 'error'
                              ? '#f44336'
                              : '#ff9800',
                          color: 'white',
                        }}
                      >
                        {reporte.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleVerDetalle(reporte)}
                        sx={{ mr: 1 }}
                      >
                        Ver Detalle
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleDescargar(reporte)}
                      >
                        Descargar
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
        <DialogTitle>Generar Nuevo Reporte Clínico</DialogTitle>
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
            <TextField
              label="ID Odontólogo (opcional)"
              type="number"
              value={formData.id_odontologo}
              onChange={(e) => setFormData({ ...formData, id_odontologo: e.target.value })}
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
        <DialogTitle>Detalle del Reporte Clínico</DialogTitle>
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
                      <h3>Estadísticas de Citas</h3>
                      <p><strong>Total de Citas:</strong> {reporteSeleccionado.total_citas}</p>
                      <p><strong>Completadas:</strong> {reporteSeleccionado.citas_completadas}</p>
                      <p><strong>Canceladas:</strong> {reporteSeleccionado.citas_canceladas}</p>
                      <p><strong>Reprogramadas:</strong> {reporteSeleccionado.citas_reprogramadas}</p>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <h3>Estadísticas de Atenciones</h3>
                      <p><strong>Total Atenciones:</strong> {reporteSeleccionado.total_atenciones}</p>
                      <p><strong>Tiempo Promedio:</strong> {reporteSeleccionado.tiempo_promedio_atencion.toFixed(2)} minutos</p>
                      <p><strong>Total Procedimientos:</strong> {reporteSeleccionado.total_procedimientos}</p>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <h3>Estadísticas de Pacientes</h3>
                      <p><strong>Total Atendidos:</strong> {reporteSeleccionado.total_pacientes_atendidos}</p>
                      <p><strong>Nuevos:</strong> {reporteSeleccionado.pacientes_nuevos}</p>
                      <p><strong>Recurrentes:</strong> {reporteSeleccionado.pacientes_recurrentes}</p>
                    </CardContent>
                  </Card>
                </Grid>

                {Object.keys(reporteSeleccionado.procedimientos_por_tipo).length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <h3>Procedimientos por Tipo</h3>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Tipo</strong></TableCell>
                              <TableCell align="right"><strong>Cantidad</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(reporteSeleccionado.procedimientos_por_tipo).map(([tipo, cantidad]) => (
                              <TableRow key={tipo}>
                                <TableCell>{tipo}</TableCell>
                                <TableCell align="right">{cantidad}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
