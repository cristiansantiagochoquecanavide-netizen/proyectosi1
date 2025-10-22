import React from 'react'
import { Link } from 'react-router-dom'
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import SecurityIcon from '@mui/icons-material/Security'
import AssessmentIcon from '@mui/icons-material/Assessment'
import InventoryIcon from '@mui/icons-material/Inventory'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'

const packages = [
  { to: '/pacientes', title: 'Pacientes', icon: <LocalHospitalIcon fontSize="large" /> },
  { to: '/citas', title: 'Citas', icon: <EventAvailableIcon fontSize="large" /> },
  { to: '/seguridad', title: 'Seguridad y Personal', icon: <SecurityIcon fontSize="large" /> },
  { to: '/reportes', title: 'Reportes', icon: <AssessmentIcon fontSize="large" /> },
  { to: '/inventario', title: 'Inventario y Compras', icon: <InventoryIcon fontSize="large" /> },
  { to: '/facturacion', title: 'Facturación y Compras', icon: <RequestQuoteIcon fontSize="large" /> },
]

export default function Home() {
  return (
    <Box>
      <Box sx={{ textAlign: 'center', py: 6, background: 'linear-gradient(135deg, #2E7D32 0%, #1E88E5 100%)', color: '#fff', borderRadius: 2, mb: 4 }}>
        <Typography variant="h3" gutterBottom>Clínica Dental</Typography>
        <Typography variant="h6">Sistema de gestión: pacientes, citas, personal y más</Typography>
      </Box>
      <Grid container spacing={2}>
        {packages.map(p => (
          <Grid item xs={12} sm={6} md={4} key={p.to}>
            <Card>
              <CardActionArea component={Link} to={p.to}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 1 }}>{p.icon}</Box>
                  <Typography variant="h6">{p.title}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
