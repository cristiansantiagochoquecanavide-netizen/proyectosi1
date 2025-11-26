import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { crearFactura, generarFacturaDesdeAtencion } from '../../lib/facturacion';

export default function GenerarFactura() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('manual'); // 'manual' o 'desde_atencion'
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [atencionSeleccionada, setAtencionSeleccionada] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await apiGet('/pacientes/api/pacientes/');
      setPacientes(data.results || data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const cargarAtenciones = async (pacienteId) => {
    try {
      const data = await apiGet(`/atencion/atenciones/por_paciente/?paciente_id=${pacienteId}`);
      setAtenciones(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handlePacienteChange = (event, newValue) => {
    setPacienteSeleccionado(newValue);
    if (newValue && modo === 'desde_atencion') {
      // En la API, el identificador del paciente es id_paciente
      cargarAtenciones(newValue.id_paciente);
    }
  };

  const handleGenerarManual = async () => {
    if (!pacienteSeleccionado) {
      alert('Seleccione un paciente');
      return;
    }
    setLoading(true);
    try {
      await crearFactura({
        // El backend espera el campo id_paciente (PK real del modelo)
        id_paciente: pacienteSeleccionado.id_paciente,
        observaciones: observaciones,
      });
      navigate('/facturacion');
    } catch (err) {
      alert('Error al crear factura');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarDesdeAtencion = async () => {
    if (!atencionSeleccionada) {
      alert('Seleccione una atención');
      return;
    }
    setLoading(true);
    try {
      await generarFacturaDesdeAtencion({
        // La atención usa id_atencion como PK en la API
        atencion_id: atencionSeleccionada.id_atencion,
        incluir_insumos: true,
      });
      navigate('/facturacion');
    } catch (err) {
      alert('Error al generar factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Generar Factura
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Modo de Generación</InputLabel>
            <Select value={modo} label="Modo de Generación" onChange={(e) => setModo(e.target.value)}>
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="desde_atencion">Desde Atención</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={pacientes}
                getOptionLabel={(p) => `${p.nombre} ${p.apellido_paterno}`}
                value={pacienteSeleccionado}
                onChange={handlePacienteChange}
                renderInput={(params) => <TextField {...params} label="Paciente *" />}
              />
            </Grid>

            {modo === 'desde_atencion' && (
              <Grid item xs={12}>
                <Autocomplete
                  options={atenciones}
                  getOptionLabel={(a) => `Atención #${a.id} - ${a.motivo_consulta}`}
                  value={atencionSeleccionada}
                  onChange={(e, v) => setAtencionSeleccionada(v)}
                  renderInput={(params) => <TextField {...params} label="Atención *" />}
                  disabled={!pacienteSeleccionado}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/facturacion')}>Cancelar</Button>
                <Button
                  variant="contained"
                  onClick={modo === 'manual' ? handleGenerarManual : handleGenerarDesdeAtencion}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generar Factura'}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {modo === 'desde_atencion' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Se generará la factura con los procedimientos e insumos de la atención seleccionada
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
