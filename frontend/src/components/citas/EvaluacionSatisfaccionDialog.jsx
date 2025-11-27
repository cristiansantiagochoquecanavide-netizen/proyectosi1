import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography,
  Rating,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiPost, apiGet, apiPut } from '../../lib/api';

export default function EvaluacionSatisfaccionDialog({ 
  open, 
  onClose, 
  citaId, 
  pacienteNombre,
  onSuccess 
}) {
  const [nivelSatisfaccion, setNivelSatisfaccion] = useState('5');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evaluacionExistente, setEvaluacionExistente] = useState(null);

  useEffect(() => {
    if (open && citaId) {
      cargarEvaluacionExistente();
    }
  }, [open, citaId]);

  const cargarEvaluacionExistente = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/citas/api/evaluaciones-satisfaccion/?id_cita=${citaId}`);
      if (response && response.results && response.results.length > 0) {
        const evaluacion = response.results[0];
        setEvaluacionExistente(evaluacion);
        setNivelSatisfaccion(String(evaluacion.nivel_satisfaccion));
        setObservaciones(evaluacion.observaciones || '');
      }
    } catch (err) {
      console.error('Error al cargar evaluación existente:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      setError(null);

      const datos = {
        id_cita: citaId,
        nivel_satisfaccion: parseInt(nivelSatisfaccion),
        observaciones: observaciones,
        id_odontologo: localStorage.getItem('odontologo_id') || null,
      };

      if (evaluacionExistente) {
        // Actualizar evaluación existente
        await apiPut(
          `/citas/api/evaluaciones-satisfaccion/${evaluacionExistente.id_evaluacion}/`,
          datos
        );
      } else {
        // Crear nueva evaluación
        await apiPost('/citas/api/evaluaciones-satisfaccion/', datos);
      }

      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError('Error al guardar la evaluación. Por favor, intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNivelDescripcion = (nivel) => {
    const descripciones = {
      1: '😞 Muy Baja Satisfacción',
      2: '😕 Baja Satisfacción',
      3: '😐 Satisfacción Media',
      4: '😊 Alta Satisfacción',
      5: '😄 Muy Alta Satisfacción',
    };
    return descripciones[nivel] || '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        Evaluación de Satisfacción del Cliente
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {loading && !evaluacionExistente ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
              Paciente: <strong>{pacienteNombre}</strong>
            </Typography>

            {evaluacionExistente && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta cita ya tiene una evaluación. Los cambios reemplazarán la anterior.
              </Alert>
            )}

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              ¿Cuál es su nivel de satisfacción?
            </Typography>

            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Rating
                value={parseInt(nivelSatisfaccion)}
                onChange={(e, newValue) => setNivelSatisfaccion(String(newValue))}
                size="large"
                sx={{ fontSize: '2.5rem' }}
              />
              <Typography variant="body1" sx={{ mt: 1, fontSize: '1.1rem' }}>
                {getNivelDescripcion(parseInt(nivelSatisfaccion))}
              </Typography>
            </Box>

            <RadioGroup
              row
              value={nivelSatisfaccion}
              onChange={(e) => setNivelSatisfaccion(e.target.value)}
              sx={{ 
                mb: 3,
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              {[1, 2, 3, 4, 5].map((nivel) => (
                <FormControlLabel
                  key={nivel}
                  value={String(nivel)}
                  control={<Radio />}
                  label={`${nivel}`}
                  sx={{
                    backgroundColor: nivel <= parseInt(nivelSatisfaccion) ? '#e3f2fd' : 'transparent',
                    padding: '8px 12px',
                    borderRadius: '4px',
                  }}
                />
              ))}
            </RadioGroup>

            <TextField
              label="Observaciones (opcional)"
              multiline
              rows={4}
              fullWidth
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escriba cualquier observación adicional sobre la satisfacción del cliente..."
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
              {observaciones.length}/500 caracteres
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={loading}
          variant="contained"
          color="primary"
        >
          {loading ? 'Guardando...' : evaluacionExistente ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
