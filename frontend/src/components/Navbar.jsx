import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'Inicio', icon: <HomeIcon />, path: '/dashboard' },
  { text: 'Pacientes', icon: <PeopleIcon />, path: '/pacientes' },
  { text: 'Citas', icon: <CalendarTodayIcon />, path: '/citas' },
  { text: 'Odontólogos', icon: <MedicalServicesIcon />, path: '/odontologos' },
  { text: 'Seguridad', icon: <SecurityIcon />, path: '/seguridad' },
];

export default function Navbar({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 960px

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false); // Cerrar drawer después de navegar
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    if (onLogout) onLogout();
  };

  // Contenido del drawer (menú lateral)
  const drawerContent = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
    >
      {/* Header del drawer */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" noWrap>
          Consultorio Dental
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
          aria-label="cerrar menú"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Información del usuario */}
      {user && (
        <Box sx={{ p: 2, backgroundColor: 'grey.100' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Bienvenido
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {user.nombre || user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.correo || 'Usuario'}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Menú de navegación */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Botón de cerrar sesión */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={2}>
        <Toolbar>
          {/* Botón hamburguesa (solo móvil/tablet) */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="abrir menú"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo y título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              noWrap
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigation('/dashboard')}
            >
              🦷 Consultorio Dental
            </Typography>
          </Box>

          {/* Menú horizontal (solo desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ textTransform: 'none' }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Usuario y logout (solo desktop) */}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {user.nombre || user.username}
              </Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ textTransform: 'none' }}
              >
                Salir
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para móvil/tablet */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles
        }}
        sx={{
          display: { xs: 'block', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Espaciador para evitar que el contenido quede debajo del AppBar */}
      <Toolbar />
    </>
  );
}
