import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { listarMisComprobantes } from '../../lib/facturacion';

export default function MisComprobantes() {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMisComprobantes();
  }, []);

  const cargarMisComprobantes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarMisComprobantes();
      setRecibos(data.results || data);
    } catch (err) {
      console.error('Error al cargar mis comprobantes:', err);
      setError('No se pudieron cargar tus comprobantes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (recibo) => {
    // Por ahora solo mostramos un alert con información básica.
    // Se podría reemplazar por un modal o descarga PDF.
    alert(
      `Recibo ${recibo.numero_recibo}\n` +
      `Fecha: ${new Date(recibo.fecha_emision).toLocaleString('es-BO')}\n` +
      `Paciente: ${recibo.paciente_nombre}\n` +
      `Método de pago: ${recibo.metodo_pago}\n` +
      `Monto: Bs. ${parseFloat(recibo.pago_monto || 0).toFixed(2)}`
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mis Comprobantes y Pagos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Recibo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Método de pago</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recibos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No tienes comprobantes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                recibos.map((recibo) => (
                  <TableRow key={recibo.id_recibo} hover>
                    <TableCell>{recibo.numero_recibo}</TableCell>
                    <TableCell>
                      {new Date(recibo.fecha_emision).toLocaleString('es-BO')}
                    </TableCell>
                    <TableCell>{recibo.metodo_pago}</TableCell>
                    <TableCell align="right">
                      Bs. {parseFloat(recibo.pago_monto || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleVerDetalle(recibo)}
                      >
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

