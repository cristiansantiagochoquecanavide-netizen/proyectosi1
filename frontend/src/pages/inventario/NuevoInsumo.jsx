import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registrarInsumo } from '../../lib/inventario';

export default function NuevoInsumo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    categoria: 'material',
    stock_actual: '0',
    stock_minimo: '5',
    stock_maximo: '100',
    unidad_medida: 'unidad',
    precio_unitario: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!formData.codigo.trim()) {
      setError('El código es obligatorio');
      return;
    }
    if (parseFloat(formData.precio_unitario) <= 0) {
      setError('El precio unitario debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      await registrarInsumo({
        nombre: formData.nombre,
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        stock_maximo: parseInt(formData.stock_maximo) || 0,
        unidad_medida: formData.unidad_medida,
        precio_unitario: parseFloat(formData.precio_unitario),
      });

      setSuccess('Insumo registrado correctamente');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/inventario');
      }, 2000);
    } catch (err) {
      console.error('Error al registrar insumo:', err);
      setError(err.message || 'Error al registrar el insumo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Registrar Nuevo Insumo
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Código del Insumo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej: COMP-A2-001"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Composite A2"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select name="categoria" value={formData.categoria} label="Categoría" onChange={handleChange}>
                    <MenuItem value="material">Material</MenuItem>
                    <MenuItem value="medicamento">Medicamento</MenuItem>
                    <MenuItem value="instrumento">Instrumento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Unidad de Medida"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  placeholder="Ej: unidad, caja, litro"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock Actual"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  required
                  label="Stock Mínimo"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  required
                  label="Stock Máximo"
                  name="stock_maximo"
                  value={formData.stock_maximo}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  required
                  label="Precio Unitario (Bs.)"
                  name="precio_unitario"
                  value={formData.precio_unitario}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => navigate('/inventario')} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Guardando...' : 'Guardar Insumo'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
