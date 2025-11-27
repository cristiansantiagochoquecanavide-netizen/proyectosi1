import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { apiGet } from '../../lib/api';

export default function ReportesClinico() {
  const [citas, setCitas] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorCitasEl, setAnchorCitasEl] = useState(null);
  const [anchorAtencionesEl, setAnchorAtencionesEl] = useState(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar citas
      const citasResponse = await apiGet('/citas/api/citas/');
      setCitas(Array.isArray(citasResponse.results) ? citasResponse.results : citasResponse);

      // Cargar atenciones
      const atencionesResponse = await apiGet('/atencion/atenciones/');
      setAtenciones(Array.isArray(atencionesResponse.results) ? atencionesResponse.results : atencionesResponse);

      setError(null);
    } catch (err) {
      setError('Error al cargar datos clínicos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getColorEstado = (estado) => {
    const colores = {
      'pendiente': 'default',
      'confirmada': 'primary',
      'programada': 'info',
      'cancelada': 'error',
      'en_curso': 'warning',
      'finalizada': 'success',
    };
    return colores[estado] || 'default';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES');
  };

  const descargarArchivo = async (endpoint, nombreArchivo) => {
    setDescargando(true);
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar el archivo');
      console.error(err);
    } finally {
      setDescargando(false);
    }
  };

  const handleDescargarCitas = (formato) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (formato === 'excel') {
      descargarArchivo('/reportes/clinicos/descargar_citas_excel/', `citas_${fecha}.xlsx`);
    } else if (formato === 'word') {
      descargarArchivo('/reportes/clinicos/descargar_citas_word/', `citas_${fecha}.docx`);
    } else if (formato === 'pdf') {
      descargarArchivo('/reportes/clinicos/descargar_citas_pdf/', `citas_${fecha}.pdf`);
    }
    setAnchorCitasEl(null);
  };

  const handleDescargarAtenciones = (formato) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (formato === 'excel') {
      descargarArchivo('/reportes/clinicos/descargar_atenciones_excel/', `atenciones_${fecha}.xlsx`);
    } else if (formato === 'word') {
      descargarArchivo('/reportes/clinicos/descargar_atenciones_word/', `atenciones_${fecha}.docx`);
    } else if (formato === 'pdf') {
      descargarArchivo('/reportes/clinicos/descargar_atenciones_pdf/', `atenciones_${fecha}.pdf`);
    }
    setAnchorAtencionesEl(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <h1>Reportes Clínicos y de Citas</h1>
        <p>Vista de citas y atenciones del sistema</p>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              aria-label="Reportes clínicos"
            >
              <Tab label={`Citas (${citas.length})`} />
              <Tab label={`Atenciones (${atenciones.length})`} />
            </Tabs>
          </Paper>

          {/* Tab 0: Citas */}
          {tabValue === 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={(e) => setAnchorCitasEl(e.currentTarget)}
                  disabled={descargando || citas.length === 0}
                >
                  Descargar Citas
                </Button>
                <Menu
                  anchorEl={anchorCitasEl}
                  open={Boolean(anchorCitasEl)}
                  onClose={() => setAnchorCitasEl(null)}
                >
                  <MenuItem onClick={() => handleDescargarCitas('excel')}>
                    📊 Descargar como Excel
                  </MenuItem>
                  <MenuItem onClick={() => handleDescargarCitas('word')}>
                    📄 Descargar como Word
                  </MenuItem>
                  <MenuItem onClick={() => handleDescargarCitas('pdf')}>
                    📋 Descargar como PDF
                  </MenuItem>
                </Menu>
              </Box>
              <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Fecha y Hora</strong></TableCell>
                    <TableCell><strong>Paciente</strong></TableCell>
                    <TableCell><strong>Odontólogo</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay citas registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    citas.map((cita) => (
                      <TableRow key={cita.id_cita}>
                        <TableCell>{cita.id_cita}</TableCell>
                        <TableCell>{formatearFecha(cita.fecha)}</TableCell>
                        <TableCell>
                          {cita.id_paciente?.nombre || cita.id_paciente || '-'}
                        </TableCell>
                        <TableCell>
                          {cita.id_odontologo?.nombre || cita.id_odontologo || 'Sin asignar'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cita.estado}
                            size="small"
                            color={getColorEstado(cita.estado)}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}

          {/* Tab 1: Atenciones */}
          {tabValue === 1 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={(e) => setAnchorAtencionesEl(e.currentTarget)}
                  disabled={descargando || atenciones.length === 0}
                >
                  Descargar Atenciones
                </Button>
                <Menu
                  anchorEl={anchorAtencionesEl}
                  open={Boolean(anchorAtencionesEl)}
                  onClose={() => setAnchorAtencionesEl(null)}
                >
                  <MenuItem onClick={() => handleDescargarAtenciones('excel')}>
                    📊 Descargar como Excel
                  </MenuItem>
                  <MenuItem onClick={() => handleDescargarAtenciones('word')}>
                    📄 Descargar como Word
                  </MenuItem>
                  <MenuItem onClick={() => handleDescargarAtenciones('pdf')}>
                    📋 Descargar como PDF
                  </MenuItem>
                </Menu>
              </Box>
              <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Paciente</strong></TableCell>
                    <TableCell><strong>Odontólogo</strong></TableCell>
                    <TableCell><strong>Fecha Inicio</strong></TableCell>
                    <TableCell><strong>Fecha Fin</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Observaciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atenciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay atenciones registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    atenciones.map((atencion) => (
                      <TableRow key={atencion.id_atencion}>
                        <TableCell>{atencion.id_atencion}</TableCell>
                        <TableCell>
                          {atencion.id_paciente?.nombre || atencion.id_paciente || '-'}
                        </TableCell>
                        <TableCell>
                          {atencion.id_odontologo?.nombre || atencion.id_odontologo || '-'}
                        </TableCell>
                        <TableCell>{formatearFecha(atencion.fecha_inicio)}</TableCell>
                        <TableCell>{formatearFecha(atencion.fecha_fin)}</TableCell>
                        <TableCell>
                          <Chip
                            label={atencion.estado}
                            size="small"
                            color={getColorEstado(atencion.estado)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {atencion.observaciones_generales || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}

          {/* Resumen */}
          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Citas
                </Typography>
                <Typography variant="h5">
                  {citas.length}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Atenciones
                </Typography>
                <Typography variant="h5">
                  {atenciones.length}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Citas Confirmadas
                </Typography>
                <Typography variant="h5">
                  {citas.filter(c => c.estado === 'confirmada').length}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Atenciones Finalizadas
                </Typography>
                <Typography variant="h5">
                  {atenciones.filter(a => a.estado === 'finalizada').length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Container>
  );
}
