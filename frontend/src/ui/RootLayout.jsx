import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useAuth } from './AuthContext'

// Botón de navegación simple que resalta si la ruta está activa
const NavButton = ({ to, label }) => {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Button component={Link} to={to} color={active ? 'secondary' : 'inherit'} sx={{ mx: 0.5 }}>
      {label}
    </Button>
  )
}

// Componente de menú desplegable para agrupar accesos por módulo
function DropdownNav({ label, items }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // Determina si alguna ruta del grupo está activa, para resaltar el botón
  const location = useLocation()
  const isActive = items.some(i => i.to === location.pathname)

  return (
    <>
      <Button
        color={isActive ? 'secondary' : 'inherit'}
        onClick={handleOpen}
        sx={{ mx: 0.5 }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
     >
        {items.map(item => (
          <MenuItem key={item.to} component={Link} to={item.to} onClick={handleClose}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

// Layout raíz de la SPA: AppBar + contenido + footer
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
            Clínica Dental
          </Typography>
          {/* Mostrar menús protegidos solo si hay sesión (o si no estamos cargando) */}
          {user && (
            <>
              {/* Menú desplegable: Pacientes */}
              <DropdownNav
                label="Pacientes"
                items={[
                  { to: '/pacientes', label: 'Listado' },
                  { to: '/pacientes/historial', label: 'Historial' },
                  { to: '/pacientes/adjuntar', label: 'Adjuntar documento' },
                ]}
              />
              {/* Menú desplegable: Citas */}
              <DropdownNav
                label="Citas"
                items={[
                  { to: '/citas', label: 'Listado' },
                  { to: '/citas/solicitar', label: 'Solicitar cita' },
                  { to: '/citas/odontologos', label: 'Odontólogos' },
                ]}
              />
              {/* Menú desplegable: Seguridad (opciones autenticadas) */}
              <DropdownNav
                label="Seguridad"
                items={[
                  { to: '/seguridad', label: 'Panel' },
                  { to: '/seguridad/usuarios', label: 'Gestionar Usuarios' },
                  { to: '/seguridad/roles', label: 'Gestionar Roles' },
                  { to: '/seguridad/recepcionistas', label: 'Recepcionistas' },
                  { to: '/seguridad/cambiar-contrasena', label: 'Cambiar contraseña' },
                  { to: '/seguridad/bitacora', label: 'Bitácora' },
                ]}
              />
              <NavButton to="/reportes" label="Reportes" />
              <NavButton to="/inventario" label="Inventario" />
              <NavButton to="/facturacion" label="Facturación" />
              {/* Botón de Cerrar sesión (CU2) al extremo derecho */}
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ ml: 2 }}
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </>
          )}
          {!user && !loading && (
            <DropdownNav
              label="Seguridad"
              items={[{ to: '/seguridad/login', label: 'Iniciar sesión' }]}
            />
          )}
        </Toolbar>
      </AppBar>
      <Container
        maxWidth={isLogin ? 'md' : 'xl'}
        disableGutters={!isLogin}
        sx={{
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
      <Box component="footer" sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>
        <Typography variant="body2">© {new Date().getFullYear()} Clínica Dental</Typography>
      </Box>
    </Box>
  )
}
