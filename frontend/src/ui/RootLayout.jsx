import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import { useAuth } from './AuthContext'
import Navbar from '../components/Navbar'

// Layout raíz de la SPA: Navbar responsive + contenido + footer
export default function RootLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isLogin = location.pathname === '/seguridad/login'

  // Cerrar sesión directo desde el botón (sin ir a otra ruta)
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/seguridad/login', { replace: true })
    } catch (e) {
      // Silencioso, el AuthContext ya maneja errores
    }
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navbar responsive solo si hay usuario autenticado */}
        {user && !isLogin && (
          <Navbar user={user} onLogout={handleLogout} />
        )}

        {/* Contenido principal */}
        <Container
          maxWidth={isLogin ? 'md' : 'xl'}
          disableGutters={!isLogin}
          component="main"
          sx={{
            flexGrow: 1,
            py: 4,
            px: isLogin ? 0 : { xs: 2, sm: 3, md: 4 },
            ...(isLogin && {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
            }),
          }}
        >
          <Outlet />
        </Container>

        {/* Footer */}
        <Box component="footer" sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>
          <Typography variant="body2">© {new Date().getFullYear()} Clínica Dental</Typography>
        </Box>
      </Box>
    </>
  )
}
