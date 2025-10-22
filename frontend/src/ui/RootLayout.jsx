import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

const NavButton = ({ to, label }) => {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Button component={Link} to={to} color={active ? 'secondary' : 'inherit'} sx={{ mx: 0.5 }}>
      {label}
    </Button>
  )
}

export default function RootLayout() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
            Clínica Dental
          </Typography>
          <NavButton to="/pacientes" label="Pacientes" />
          <NavButton to="/citas" label="Citas" />
          <NavButton to="/seguridad" label="Seguridad" />
          <NavButton to="/reportes" label="Reportes" />
          <NavButton to="/inventario" label="Inventario" />
          <NavButton to="/facturacion" label="Facturación" />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>
        <Typography variant="body2">© {new Date().getFullYear()} Clínica Dental</Typography>
      </Box>
    </Box>
  )
}
