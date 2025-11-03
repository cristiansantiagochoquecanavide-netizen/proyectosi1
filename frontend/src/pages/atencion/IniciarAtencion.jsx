import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { crearAtencion } from '../../lib/atencion';
import { apiGet } from '../../lib/api';

export default function IniciarAtencion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    id_cita: '',
    motivo_consulta: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarCitasProgramadas();
  }, []);

  const cargarCitasProgramadas = async () => {
    try {
      setLoadingCitas(true);
      // Obtener citas programadas que aún no tienen atención
      const response = await apiGet('/citas/api/citas/?estado=programada');
      const citasData = response.results || response;
      setCitas(citasData);
      console.log('Citas cargadas:', citasData.length, citasData);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setError('Error al cargar las citas programadas. Verifique que el backend esté ejecutándose.');
    } finally {
      setLoadingCitas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCitaChange = (event, newValue) => {
    console.log('Cita seleccionada:', newValue);
    setCitaSeleccionada(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        id_cita: newValue.id,
      }));
      setError(''); // Limpiar error al seleccionar
    } else {
      setFormData((prev) => ({
        ...prev,
        id_cita: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    console.log('Datos del formulario al enviar:', formData);
    console.log('Cita seleccionada al enviar:', citaSeleccionada);
    
    if (!formData.id_cita) {
      setError('Debe seleccionar una cita');
      return;
    }
    if (!formData.motivo_consulta.trim()) {
      setError('Debe ingresar el motivo de la consulta');
      return;
    }

    setLoading(true);

    try {
      const response = await crearAtencion({
        id_cita: formData.id_cita,
        motivo_consulta: formData.motivo_consulta,
        observaciones: formData.observaciones,
      });

      setSuccess('Atención iniciada correctamente');
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/atencion');
      }, 2000);
    } catch (err) {
      console.error('Error al iniciar atención:', err);
      setError(err.message || 'Error al iniciar la atención. Verifique los datos.');
    } finally {
      setLoading(false);
    }
  };

  const getCitaLabel = (cita) => {
    if (!cita) return '';
    const fecha = new Date(cita.fecha).toLocaleDateString('es-BO');
    const hora = cita.hora?.substring(0, 5) || '';
    return `${fecha} ${hora} - ${cita.nombre_paciente || 'Paciente'} con ${cita.nombre_odontologo || 'Odontólogo'}`;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Iniciar Atención desde Cita
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Seleccione una cita programada para iniciar la atención clínica
      </Typography>

      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Selector de Cita */}
              <Grid item xs={12}>
                <Autocomplete
                  options={citas}
                  value={citaSeleccionada}
                  getOptionLabel={getCitaLabel}
                  loading={loadingCitas}
                  onChange={handleCitaChange}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cita Programada *"
                      placeholder="Buscar por fecha, paciente u odontólogo"
                      error={error === 'Debe seleccionar una cita'}
                      helperText={error === 'Debe seleccionar una cita' ? error : ''}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCitas ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="No hay citas programadas disponibles"
                />
                {citas.length === 0 && !loadingCitas && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    No hay citas programadas. Debe crear una cita primero desde el módulo de Citas.
                  </Typography>
                )}
              </Grid>

              {/* Motivo de Consulta */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label="Motivo de Consulta"
                  name="motivo_consulta"
                  value={formData.motivo_consulta}
                  onChange={handleChange}
                  placeholder="Ej: Dolor en muela inferior derecha, revisión de ortodoncia, etc."
                />
              </Grid>

              {/* Observaciones */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones Iniciales"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Observaciones generales del paciente al inicio de la atención (opcional)"
                />
              </Grid>

              {/* Botones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/citas')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Iniciando...' : 'Iniciar Atención'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
        <Typography variant="body2" color="info.main">
          <strong>Nota:</strong> Una vez iniciada la atención, podrá registrar procedimientos,
          actualizar el odontograma y vincular tratamientos desde el listado de atenciones.
        </Typography>
      </Box>
    </Box>
  );
}
