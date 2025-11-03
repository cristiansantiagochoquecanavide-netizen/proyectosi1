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
import { listarFacturasPendientes, registrarPago } from '../../lib/facturacion';

export default function RegistrarPago() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    metodo_pago: 'efectivo',
    observaciones: '',
  });

  useEffect(() => {
    cargarFacturasPendientes();
  }, []);

  const cargarFacturasPendientes = async () => {
    try {
      const data = await listarFacturasPendientes();
      setFacturas(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facturaSeleccionada) {
      alert('Seleccione una factura');
      return;
    }
    setLoading(true);
    try {
      await registrarPago({
        id_factura: facturaSeleccionada.id,
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        observaciones: formData.observaciones,
      });
      alert('Pago registrado. El recibo se generó automáticamente.');
      navigate('/facturacion');
    } catch (err) {
      alert('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Registrar Pago
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={facturas}
                  getOptionLabel={(f) => `Factura #${f.numero_factura} - ${f.nombre_paciente} - Bs. ${f.total}`}
                  value={facturaSeleccionada}
                  onChange={(e, v) => setFacturaSeleccionada(v)}
                  renderInput={(params) => <TextField {...params} label="Factura *" />}
                />
              </Grid>

              {facturaSeleccionada && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Total: Bs. {facturaSeleccionada.total}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Monto a Pagar (Bs.)"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={formData.metodo_pago}
                    label="Método de Pago"
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="tarjeta">Tarjeta</MenuItem>
                    <MenuItem value="transferencia">Transferencia</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={() => navigate('/facturacion')}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Registrar Pago'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Alert severity="success" sx={{ mt: 2 }}>
            Al registrar el pago, se generará automáticamente un recibo
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
