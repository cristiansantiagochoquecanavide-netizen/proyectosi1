import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material';
import { apiGet, API_BASE_URL } from '../../lib/api';
import { obtenerOdontogramaPorPaciente, actualizarPiezaDental, subirImagenOdontograma } from '../../lib/atencion';

// Sistema FDI de numeración dental (estándar internacional)
const DIENTES_SUPERIOR_DERECHA = [18, 17, 16, 15, 14, 13, 12, 11];
const DIENTES_SUPERIOR_IZQUIERDA = [21, 22, 23, 24, 25, 26, 27, 28];
const DIENTES_INFERIOR_IZQUIERDA = [31, 32, 33, 34, 35, 36, 37, 38];
const DIENTES_INFERIOR_DERECHA = [48, 47, 46, 45, 44, 43, 42, 41];

const ESTADOS_PIEZA = [
  { value: 'sano', label: 'Sano', color: '#4caf50' },
  { value: 'caries', label: 'Caries', color: '#ff9800' },
  { value: 'obturado', label: 'Obturado', color: '#2196f3' },
  { value: 'endodoncia', label: 'Endodoncia', color: '#9c27b0' },
  { value: 'corona', label: 'Corona', color: '#ffc107' },
  { value: 'ausente', label: 'Ausente', color: '#f44336' },
  { value: 'extraccion', label: 'Para Extracción', color: '#e91e63' },
  { value: 'implante', label: 'Implante', color: '#00bcd4' },
  { value: 'fracturado', label: 'Fracturado', color: '#795548' },
];

export default function Odontograma() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [odontograma, setOdontograma] = useState(null);
  const [piezas, setPiezas] = useState({});
  
  // Modal de edición de pieza
  const [openEditar, setOpenEditar] = useState(false);
  const [piezaEditando, setPiezaEditando] = useState(null);
  const [estadoPieza, setEstadoPieza] = useState('sano');
  const [caras, setCaras] = useState({
    cara_vestibular: false,
    cara_lingual: false,
    cara_mesial: false,
    cara_distal: false,
    cara_oclusal: false,
  });
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  // Estado para subir imagen
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await apiGet('/pacientes/api/pacientes/');
      setPacientes(data.results || data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError('Error al cargar pacientes');
      setLoading(false);
    }
  };

  const cargarOdontograma = async (pacienteId) => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerOdontogramaPorPaciente(pacienteId);
      
      if (data && data.length > 0) {
        const odont = data[0];
        setOdontograma(odont);
        
        // Convertir array de piezas a objeto indexado por número
        const piezasMap = {};
        if (odont.piezas_dentales) {
          odont.piezas_dentales.forEach((pieza) => {
            piezasMap[pieza.numero_pieza] = pieza;
          });
        }
        setPiezas(piezasMap);
      } else {
        setError('El paciente no tiene odontograma registrado');
        setOdontograma(null);
        setPiezas({});
      }
    } catch (err) {
      console.error('Error al cargar odontograma:', err);
      setError('Error al cargar el odontograma');
    } finally {
      setLoading(false);
    }
  };

  const handlePacienteChange = (event, newValue) => {
    setPacienteSeleccionado(newValue);
    if (newValue) {
      cargarOdontograma(newValue.id);
    } else {
      setOdontograma(null);
      setPiezas({});
    }
  };

  const handleClickPieza = (numeroPieza) => {
    const pieza = piezas[numeroPieza];
    setPiezaEditando(numeroPieza);
    setEstadoPieza(pieza?.estado || 'sano');
    setCaras({
      cara_vestibular: pieza?.cara_vestibular || false,
      cara_lingual: pieza?.cara_lingual || false,
      cara_mesial: pieza?.cara_mesial || false,
      cara_distal: pieza?.cara_distal || false,
      cara_oclusal: pieza?.cara_oclusal || false,
    });
    setObservaciones(pieza?.observaciones || '');
    setOpenEditar(true);
  };

  const handleGuardarPieza = async () => {
    if (!odontograma) {
      alert('No se ha cargado el odontograma');
      return;
    }

    setGuardando(true);
    try {
      await actualizarPiezaDental(odontograma.id, {
        numero_pieza: piezaEditando,
        estado: estadoPieza,
        ...caras,
        observaciones: observaciones,
      });

      // Recargar odontograma
      await cargarOdontograma(pacienteSeleccionado.id);
      setOpenEditar(false);
    } catch (err) {
      console.error('Error al actualizar pieza:', err);
      alert('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleSubirImagen = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!odontograma) {
      alert('No se ha cargado el odontograma');
      return;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido');
      return;
    }

    setSubiendoImagen(true);
    try {
      await subirImagenOdontograma(odontograma.id_odontograma, file);
      // Recargar odontograma para obtener la nueva imagen
      await cargarOdontograma(pacienteSeleccionado.id_paciente);
      alert('Imagen del odontograma actualizada correctamente');
    } catch (err) {
      console.error('Error al subir imagen:', err);
      alert('Error al subir la imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const getColorPieza = (numeroPieza) => {
    const pieza = piezas[numeroPieza];
    if (!pieza) return '#f5f5f5';
    
    const estado = ESTADOS_PIEZA.find((e) => e.value === pieza.estado);
    return estado ? estado.color : '#f5f5f5';
  };

  const renderDiente = (numero) => {
    const color = getColorPieza(numero);
    const pieza = piezas[numero];
    
    return (
      <Box
        key={numero}
        onClick={() => handleClickPieza(numero)}
        sx={{
          width: 40,
          height: 50,
          bgcolor: color,
          border: '2px solid #333',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          position: 'relative',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 3,
          },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px #000' }}>
          {numero}
        </Typography>
        {pieza && pieza.estado !== 'sano' && (
          <Typography variant="caption" sx={{ fontSize: 8, color: '#fff', textShadow: '1px 1px 2px #000' }}>
            {ESTADOS_PIEZA.find(e => e.value === pieza.estado)?.label}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Odontograma
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sistema FDI de numeración dental (11-18, 21-28, 31-38, 41-48)
      </Typography>

      {/* Selector de Paciente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Autocomplete
            options={pacientes}
            getOptionLabel={(p) => `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`}
            value={pacienteSeleccionado}
            onChange={handlePacienteChange}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar Paciente" placeholder="Buscar paciente..." />
            )}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Botón para subir/actualizar imagen del odontograma */}
      {odontograma && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component="label"
                disabled={subiendoImagen}
              >
                {subiendoImagen ? 'Subiendo...' : 'Actualizar Odontograma'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleSubirImagen}
                />
              </Button>
              
              {odontograma.imagen && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Imagen actual del odontograma:
                  </Typography>
                  <Box
                    component="img"
                    src={`${API_BASE_URL || ''}${odontograma.imagen}`}
                    alt="Odontograma"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 400,
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(`${API_BASE_URL || ''}${odontograma.imagen}`, '_blank')}
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : odontograma ? (
        <>
          {/* Leyenda */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Leyenda de Estados:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ESTADOS_PIEZA.map((estado) => (
                  <Chip
                    key={estado.value}
                    label={estado.label}
                    sx={{ bgcolor: estado.color, color: '#fff' }}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Odontograma Visual */}
          <Card>
            <CardContent>
              <Grid container spacing={4}>
                {/* Arcada Superior */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    Arcada Superior
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {/* Derecha (18-11) */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {DIENTES_SUPERIOR_DERECHA.map((num) => renderDiente(num))}
                    </Box>
                    {/* Izquierda (21-28) */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {DIENTES_SUPERIOR_IZQUIERDA.map((num) => renderDiente(num))}
                    </Box>
                  </Box>
                </Grid>

                {/* Línea divisoria */}
                <Grid item xs={12}>
                  <Box sx={{ borderTop: '2px dashed #999', my: 2 }} />
                </Grid>

                {/* Arcada Inferior */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    Arcada Inferior
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {/* Derecha (48-41) */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {DIENTES_INFERIOR_DERECHA.map((num) => renderDiente(num))}
                    </Box>
                    {/* Izquierda (31-38) */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {DIENTES_INFERIOR_IZQUIERDA.map((num) => renderDiente(num))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                Haga clic en cualquier pieza dental para actualizar su estado
              </Alert>
            </CardContent>
          </Card>
        </>
      ) : (
        pacienteSeleccionado && (
          <Alert severity="warning">
            El paciente seleccionado no tiene odontograma registrado. Debe crearse desde el backend.
          </Alert>
        )
      )}

      {/* Modal de Edición */}
      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Pieza Dental #{piezaEditando}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={estadoPieza} label="Estado" onChange={(e) => setEstadoPieza(e.target.value)}>
                {ESTADOS_PIEZA.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, bgcolor: estado.color, borderRadius: 1 }} />
                      {estado.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom>
              Caras Afectadas:
            </Typography>
            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caras.cara_vestibular}
                    onChange={(e) => setCaras({ ...caras, cara_vestibular: e.target.checked })}
                  />
                }
                label="Cara Vestibular"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caras.cara_lingual}
                    onChange={(e) => setCaras({ ...caras, cara_lingual: e.target.checked })}
                  />
                }
                label="Cara Lingual"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caras.cara_mesial}
                    onChange={(e) => setCaras({ ...caras, cara_mesial: e.target.checked })}
                  />
                }
                label="Cara Mesial"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caras.cara_distal}
                    onChange={(e) => setCaras({ ...caras, cara_distal: e.target.checked })}
                  />
                }
                label="Cara Distal"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caras.cara_oclusal}
                    onChange={(e) => setCaras({ ...caras, cara_oclusal: e.target.checked })}
                  />
                }
                label="Cara Oclusal"
              />
            </FormGroup>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarPieza}
            variant="contained"
            disabled={guardando}
            startIcon={guardando && <CircularProgress size={20} />}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
