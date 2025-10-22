import React from 'react'
import { Paper, Typography } from '@mui/material'

export default function Reportes() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Reportes - Casos de uso</Typography>
      <Typography variant="body1">Próximamente: reportes de citas, pacientes y facturación.</Typography>
    </Paper>
  )
}
