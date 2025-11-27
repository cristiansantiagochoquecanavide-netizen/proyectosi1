import React, { useState } from 'react';
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
  Box,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  buscarReportesPorPalabra,
  buscarReportesPorFecha,
  buscarReportesPorEtiqueta,
} from '../../lib/reportes';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BusquedaReportes() {
  const [tabActivo, setTabActivo] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  // Formularios por tipo de búsqueda
  const [busquedaPalabra, setBusquedaPalabra] = useState({
    palabra: '',
    tipo_reporte: '',
  });

  const [busquedaFecha, setBusquedaFecha] = useState({
    fecha_inicio: '',
    fecha_fin: '',
  });

  const [busquedaEtiqueta, setBusquedaEtiqueta] = useState({
    etiqueta: '',
  });

  const handleBuscarPalabra = async () => {
    if (!busquedaPalabra.palabra.trim()) {
      setError('Ingrese una palabra clave');
      return;
    }

    setLoading(true);
    try {
      const response = await buscarReportesPorPalabra(
        busquedaPalabra.palabra,
        busquedaPalabra.tipo_reporte || null
      );
      setResultados(response.datos || []);
      setError(null);
    } catch (err) {
      setError('Error en la búsqueda');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarFecha = async () => {
    if (!busquedaFecha.fecha_inicio || !busquedaFecha.fecha_fin) {
      setError('Ingrese ambas fechas');
      return;
    }

    setLoading(true);
    try {
      const response = await buscarReportesPorFecha(
        busquedaFecha.fecha_inicio,
        busquedaFecha.fecha_fin
      );
      setResultados(response.datos || []);
      setError(null);
    } catch (err) {
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarEtiqueta = async () => {
    if (!busquedaEtiqueta.etiqueta.trim()) {
      setError('Ingrese una etiqueta');
      return;
    }

    setLoading(true);
    try {
      const response = await buscarReportesPorEtiqueta(busquedaEtiqueta.etiqueta);
      setResultados(response.datos || []);
      setError(null);
    } catch (err) {
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (reporte) => {
    setReporteSeleccionado(reporte);
    setOpenDetalle(true);
  };

  const handleLimpiar = () => {
    setResultados([]);
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <h1>Búsqueda Avanzada de Reportes</h1>
        <p>Busca y filtra reportes por palabra clave, fecha o etiqueta</p>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <Tabs value={tabActivo} onChange={(e, newValue) => setTabActivo(newValue)}>
          <Tab label="Búsqueda por Palabra" />
          <Tab label="Búsqueda por Fecha" />
          <Tab label="Búsqueda por Etiqueta" />
        </Tabs>

        {/* Tab 1: Búsqueda por palabra */}
        <TabPanel value={tabActivo} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Palabra clave"
                value={busquedaPalabra.palabra}
                onChange={(e) => setBusquedaPalabra({ ...busquedaPalabra, palabra: e.target.value })}
                placeholder="Buscar en reportes..."
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Tipo de reporte (opcional)"
                value={busquedaPalabra.tipo_reporte}
                onChange={(e) => setBusquedaPalabra({ ...busquedaPalabra, tipo_reporte: e.target.value })}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Todos</option>
                <option value="financiero">Financiero</option>
                <option value="clinico">Clínico</option>
                <option value="default">Bitácora</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleBuscarPalabra}
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
                <Button variant="outlined" onClick={handleLimpiar}>
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Búsqueda por fecha */}
        <TabPanel value={tabActivo} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha inicio"
                type="date"
                value={busquedaFecha.fecha_inicio}
                onChange={(e) => setBusquedaFecha({ ...busquedaFecha, fecha_inicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha fin"
                type="date"
                value={busquedaFecha.fecha_fin}
                onChange={(e) => setBusquedaFecha({ ...busquedaFecha, fecha_fin: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleBuscarFecha}
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
                <Button variant="outlined" onClick={handleLimpiar}>
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Búsqueda por etiqueta */}
        <TabPanel value={tabActivo} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Etiqueta"
                value={busquedaEtiqueta.etiqueta}
                onChange={(e) => setBusquedaEtiqueta({ ...busquedaEtiqueta, etiqueta: e.target.value })}
                placeholder="Ingrese una etiqueta..."
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleBuscarEtiqueta}
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
                <Button variant="outlined" onClick={handleLimpiar}>
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Resultados */}
      {loading ? (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : resultados.length > 0 ? (
        <Box sx={{ mt: 4 }}>
          <h2>Resultados de búsqueda ({resultados.length})</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Palabras Clave</strong></TableCell>
                  <TableCell><strong>Etiquetas</strong></TableCell>
                  <TableCell><strong>Rango de Fechas</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((reporte) => (
                  <TableRow key={reporte.id_meta}>
                    <TableCell>{reporte.objeto_id}</TableCell>
                    <TableCell>{reporte.tipo_reporte}</TableCell>
                    <TableCell>
                      {reporte.palabras_clave
                        ? reporte.palabras_clave.substring(0, 50) + '...'
                        : '-'}
                    </TableCell>
                    <TableCell>{reporte.etiquetas || '-'}</TableCell>
                    <TableCell>
                      {reporte.fecha_inicio} a {reporte.fecha_fin}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleVerDetalle(reporte)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}

      {/* Dialog de detalle */}
      <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del Reporte</DialogTitle>
        <DialogContent>
          {reporteSeleccionado && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <strong>ID:</strong> {reporteSeleccionado.objeto_id}
              </Box>
              <Box>
                <strong>Tipo:</strong> {reporteSeleccionado.tipo_reporte}
              </Box>
              <Box>
                <strong>Rango de Fechas:</strong> {reporteSeleccionado.fecha_inicio} a {reporteSeleccionado.fecha_fin}
              </Box>
              <Box>
                <strong>Etiquetas:</strong> {reporteSeleccionado.etiquetas || 'Sin etiquetas'}
              </Box>
              {reporteSeleccionado.palabras_clave && (
                <Box>
                  <strong>Palabras Clave:</strong>
                  <p>{reporteSeleccionado.palabras_clave}</p>
                </Box>
              )}
              {reporteSeleccionado.descripcion_indexada && (
                <Box>
                  <strong>Descripción:</strong>
                  <p>{reporteSeleccionado.descripcion_indexada}</p>
                </Box>
              )}
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
