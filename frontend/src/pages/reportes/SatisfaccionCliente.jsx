import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@mui/material';
import { apiGet } from '../../lib/api';

export default function ReporteSatisfaccion() {
  const [datos, setDatos] = useState(null);
  const [datosOdontologo, setDatosOdontologo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar promedio general
      const respPromedio = await apiGet('/citas/api/evaluaciones-satisfaccion/promedio_satisfaccion/');
      setDatos(respPromedio);

      // Cargar por odontólogo
      const respOdontologo = await apiGet('/citas/api/evaluaciones-satisfaccion/por_odontologo/');
      setDatosOdontologo(respOdontologo);
    } catch (err) {
      setError('Error al cargar los reportes de satisfacción');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNombreNivel = (nivel) => {
    const nombres = {
      1: 'Muy Baja',
      2: 'Baja',
      3: 'Media',
      4: 'Alta',
      5: 'Muy Alta',
    };
    return nombres[nivel] || 'Desconocida';
  };

  const getColorNivel = (nivel) => {
    const colores = {
      1: '#d32f2f',
      2: '#f57c00',
      3: '#fbc02d',
      4: '#388e3c',
      5: '#1976d2',
    };
    return colores[nivel] || '#999';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Reporte de Satisfacción del Cliente
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Análisis de las evaluaciones de satisfacción registradas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {datos && (
        <>
          {/* Tarjetas de resumen */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Promedio General
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {datos.promedio}/5
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(datos.promedio / 5) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Evaluaciones
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    {datos.total_evaluaciones}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Citas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {datos.total_citas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Tasa Respuesta
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {datos.total_citas > 0
                      ? Math.round(
                          (datos.total_evaluaciones / datos.total_citas) * 100
                        )
                      : 0}
                    %
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Distribución */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Distribución de Evaluaciones
            </Typography>
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5].map((nivel) => (
                <Grid item xs={12} sm={6} md={2.4} key={nivel}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: getColorNivel(nivel),
                      color: 'white',
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {datos.distribucion[nivel]}
                    </Typography>
                    <Typography variant="caption">
                      {getNombreNivel(nivel)}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      (
                      {datos.total_evaluaciones > 0
                        ? Math.round(
                            (datos.distribucion[nivel] / datos.total_evaluaciones) * 100
                          )
                        : 0}
                      %)
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Por Odontólogo */}
          {datosOdontologo && Object.keys(datosOdontologo).length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Satisfacción por Odontólogo
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(datosOdontologo).map(([nombre, datos]) => (
                  <Grid item xs={12} md={6} key={nombre}>
                    <Card sx={{ backgroundColor: '#f9f9f9' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {nombre}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            {datos.promedio}/5
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                          {datos.total} evaluaciones
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(datos.promedio / 5) * 100}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5].map((nivel) => (
                            <Typography
                              key={nivel}
                              variant="caption"
                              sx={{
                                px: 1,
                                py: 0.5,
                                backgroundColor: getColorNivel(nivel),
                                color: 'white',
                                borderRadius: '4px',
                              }}
                            >
                              {nivel}: {datos.niveles[nivel]}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}
