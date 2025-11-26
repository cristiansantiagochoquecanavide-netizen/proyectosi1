import React, { useState, useEffect } from 'react';
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
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { listarRecibos, eliminarRecibo } from '../../lib/facturacion';

export default function Recibos() {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRecibos();
  }, []);

  const cargarRecibos = async () => {
    try {
      const data = await listarRecibos();
      setRecibos(data.results || data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (recibo) => {
    const ok = window.confirm(`¿Eliminar el recibo ${recibo.numero_recibo}?`);
    if (!ok) return;
    try {
      await eliminarRecibo(recibo.id_recibo);
      await cargarRecibos();
    } catch (err) {
      console.error('Error al eliminar recibo:', err);
      alert('No se pudo eliminar el recibo.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Recibos de Pago
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Recibo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Método de Pago</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recibos.map((recibo) => (
                <TableRow key={recibo.id_recibo} hover>
                  <TableCell>{recibo.numero_recibo}</TableCell>
                  <TableCell>
                    {new Date(recibo.fecha_emision).toLocaleDateString('es-BO')}
                  </TableCell>
                  <TableCell>{recibo.paciente_nombre}</TableCell>
                  <TableCell>{recibo.metodo_pago}</TableCell>
                  <TableCell align="right">
                    Bs. {parseFloat(recibo.pago_monto || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleEliminar(recibo)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
