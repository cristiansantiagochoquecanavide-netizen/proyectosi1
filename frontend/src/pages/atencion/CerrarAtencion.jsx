import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { obtenerAtencion, finalizarAtencion } from '../../lib/atencion';
import { generarFacturaDesdeAtencion, listarFacturasPorPaciente } from '../../lib/facturacion';
import { listarMovimientosPorAtencion } from '../../lib/inventario';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../ui/AuthContext';

export default function CerrarAtencion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [atencion, setAtencion] = useState(null);
  const [procedimientos, setProcedimientos] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [factura, setFactura] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar atención
      const atencionData = await obtenerAtencion(id);
      setAtencion(atencionData);

      // Verificar si ya existe una factura (la atención tiene relación OneToOne con factura)
      if (atencionData.factura) {
        try {
          const facturaData = await apiGet(`/facturacion/facturas/${atencionData.factura}/`);
          setFactura(facturaData);
        } catch (err) {
          console.log('Error al cargar factura:', err);
        }
      }

      // Cargar procedimientos de la atención
      const procedimientosData = await apiGet('/atencion/procedimientos/');
      const procsAtencion = procedimientosData.filter(
        p => p.id_atencion === parseInt(id)
      );
      setProcedimientos(procsAtencion);

      // Cargar consumos de la atención
      try {
        const consumosData = await listarMovimientosPorAtencion(id);
        setConsumos(consumosData || []);
      } catch (err) {
        console.log('No hay consumos registrados');
        setConsumos([]);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos de la atención');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    // Subtotal de procedimientos
    const subtotalProcedimientos = procedimientos.reduce((sum, proc) => {
      return sum + (parseFloat(proc.costo) || 0);
    }, 0);

    // Subtotal de insumos (si se desea cobrar)
    const subtotalInsumos = consumos.reduce((sum, cons) => {
      const precioUnitario = parseFloat(cons.insumo_nombre ? 0 : 0); // Por defecto no se cobran insumos
      const cantidad = parseFloat(cons.cantidad) || 0;
      return sum + (precioUnitario * cantidad);
    }, 0);

    const subtotal = subtotalProcedimientos + subtotalInsumos;
    const descuento = 0;
    const impuestos = 0; // Sin impuestos por defecto (ajustar según necesidad)
    const total = subtotal - descuento + impuestos;

    return { subtotalProcedimientos, subtotalInsumos, subtotal, descuento, impuestos, total };
  };

  const handleCerrarAtencion = async () => {
    try {
      setProcesando(true);
      setError('');

      const totales = calcularTotales();

      // 1. Finalizar la atención
      await finalizarAtencion(id);

      // 2. Generar la factura desde la atención
      const nuevaFactura = await generarFacturaDesdeAtencion({
        atencion_id: parseInt(id),
        emitida_por_id: user?.id_usuario || null
      });

      setFactura(nuevaFactura);
      setOpenConfirm(false);
      
      // Actualizar estado de la atención
      await cargarDatos();

    } catch (err) {
      console.error('Error al cerrar atención:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error al cerrar la atención';
      setError(errorMsg);
    } finally {
      setProcesando(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!atencion) {
    return (
      <Box p={3}>
        <Alert severity="error">No se encontró la atención</Alert>
      </Box>
    );
  }

  const totales = calcularTotales();

  return (
    <Box p={3} className="no-print">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/atencion/listado')}
          >
            Volver
          </Button>
          <Typography variant="h4">
            Cerrar Atención y Emitir Comprobante
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          {factura && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handleImprimir}
            >
              Imprimir
            </Button>
          )}
          {atencion.estado === 'en_curso' && !factura && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => setOpenConfirm(true)}
              disabled={procesando}
            >
              Cerrar Atención y Generar Factura
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {factura && (
        <Alert severity="success" sx={{ mb: 2 }} icon={<ReceiptIcon />}>
          Factura generada: #{factura.numero_factura} - Estado: {factura.estado}
        </Alert>
      )}

      {/* Información de la Atención */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información de la Atención
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Atención #: <strong>{atencion.id_atencion}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paciente: <strong>{atencion.paciente_nombre || 'N/A'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CI: <strong>{atencion.id_paciente?.ci || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Fecha: <strong>{new Date(atencion.fecha_atencion).toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Odontólogo: <strong>{atencion.odontologo_nombre || 'N/A'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estado: <Chip 
                  label={atencion.estado === 'en_curso' ? 'En Curso' : atencion.estado === 'finalizada' ? 'Finalizada' : 'Cancelada'} 
                  color={atencion.estado === 'finalizada' ? 'success' : atencion.estado === 'en_curso' ? 'primary' : 'default'} 
                  size="small" 
                />
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Procedimientos Realizados */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Procedimientos Realizados
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Procedimiento</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Pieza Dental</TableCell>
                  <TableCell align="right">Costo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {procedimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay procedimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  procedimientos.map((proc) => (
                    <TableRow key={proc.id_procedimiento}>
                      <TableCell>{proc.nombre}</TableCell>
                      <TableCell>{proc.descripcion || '-'}</TableCell>
                      <TableCell>{proc.pieza_dental || '-'}</TableCell>
                      <TableCell align="right">
                        Bs. {parseFloat(proc.costo || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <strong>Subtotal Procedimientos:</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Bs. {totales.subtotalProcedimientos.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Insumos Consumidos (Informativo) */}
      {consumos.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Insumos Consumidos (Informativo)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Insumo</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Motivo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consumos.map((cons) => (
                    <TableRow key={cons.id_movimiento}>
                      <TableCell>{cons.insumo_nombre}</TableCell>
                      <TableCell align="right">{parseFloat(cons.cantidad || 0).toFixed(2)}</TableCell>
                      <TableCell>{cons.motivo || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              * Los insumos son para registro interno y no se cobran en la factura
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Totales */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen de Facturación
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Subtotal:</Typography>
            <Typography>Bs. {totales.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Descuento:</Typography>
            <Typography>Bs. {totales.descuento.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Impuestos:</Typography>
            <Typography>Bs. {totales.impuestos.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">TOTAL A PAGAR:</Typography>
            <Typography variant="h6" color="primary">
              Bs. {totales.total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de Confirmación */}
      <Dialog open={openConfirm} onClose={() => !procesando && setOpenConfirm(false)}>
        <DialogTitle>Confirmar Cierre de Atención</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de cerrar esta atención y generar la factura por un total de{' '}
            <strong>Bs. {totales.total.toFixed(2)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. La atención cambiará a estado "Finalizada" 
            y se emitirá el comprobante.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCerrarAtencion} 
            variant="contained" 
            color="success"
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {procesando ? 'Procesando...' : 'Confirmar y Cerrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .no-print {
            display: block !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
