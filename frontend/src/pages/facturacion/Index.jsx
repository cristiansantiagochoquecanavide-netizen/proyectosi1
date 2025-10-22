import React from 'react'
import { Paper, Typography } from '@mui/material'

export default function Facturacion() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Facturación y Compras - Casos de uso</Typography>
      <Typography variant="body1">Próximamente: facturas, pagos y conciliaciones.</Typography>
    </Paper>
  )
}
