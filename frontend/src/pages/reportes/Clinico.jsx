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
} from '@mui/material';
import { apiGet } from '../../lib/api';
import EvaluacionSatisfaccionDialog from '../../components/citas/EvaluacionSatisfaccionDialog';

export default function ReportesClinico() {
  const [citas, setCitas] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openEvalDialog, setOpenEvalDialog] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

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
              <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Fecha y Hora</strong></TableCell>
                    <TableCell><strong>Paciente</strong></TableCell>
                    <TableCell><strong>Odontólogo</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setOpenEvalDialog(true);
                            }}
                          >
                            Evaluar
                          </Button>
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

      {/* Dialog de Evaluación de Satisfacción */}
      {citaSeleccionada && (
        <EvaluacionSatisfaccionDialog
          open={openEvalDialog}
          onClose={() => {
            setOpenEvalDialog(false);
            setCitaSeleccionada(null);
          }}
          citaId={citaSeleccionada.id_cita}
          pacienteNombre={citaSeleccionada.id_paciente?.nombre || citaSeleccionada.id_paciente || 'Paciente'}
          onSuccess={() => {
            cargarDatos();
            setOpenEvalDialog(false);
            setCitaSeleccionada(null);
          }}
        />
      )}
    </Container>
  );
}
