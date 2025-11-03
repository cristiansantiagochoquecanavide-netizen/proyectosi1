import React, { useState } from 'react';
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
  Collapse,
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'Inicio', icon: <HomeIcon />, path: '/' },
  { 
    text: 'Pacientes', 
    icon: <PeopleIcon />, 
    submenu: [
      { text: 'Listado', path: '/pacientes' },
      { text: 'Historial', path: '/pacientes/historial' },
      { text: 'Adjuntar documento', path: '/pacientes/adjuntar' },
    ]
  },
  { 
    text: 'Citas', 
    icon: <CalendarTodayIcon />, 
    submenu: [
      { text: 'Listado', path: '/citas' },
      { text: 'Solicitar cita', path: '/citas/solicitar' },
      { text: 'Odontólogos', path: '/citas/odontologos' },
      { text: 'Disponibilidad', path: '/citas/disponibilidad' },
    ]
  },
  { 
    text: 'Atención', 
    icon: <MedicalServicesIcon />, 
    submenu: [
      { text: 'Iniciar Atención', path: '/atencion/iniciar' },
      { text: 'Listado Atenciones', path: '/atencion' },
      { text: 'Odontograma', path: '/atencion/odontograma' },
      { text: 'Tratamientos', path: '/atencion/tratamientos' },
    ]
  },
  { 
    text: 'Inventario', 
    icon: <InventoryIcon />, 
    submenu: [
      { text: 'Listado Insumos', path: '/inventario' },
      { text: 'Nuevo Insumo', path: '/inventario/nuevo' },
      { text: 'Alertas Stock', path: '/inventario/alertas' },
      { text: 'Movimientos', path: '/inventario/movimientos' },
      { text: 'Órdenes de Compra', path: '/inventario/ordenes' },
    ]
  },
  { 
    text: 'Facturación', 
    icon: <ReceiptIcon />, 
    submenu: [
      { text: 'Listado Facturas', path: '/facturacion' },
      { text: 'Generar Factura', path: '/facturacion/nueva' },
      { text: 'Registrar Pago', path: '/facturacion/pago' },
      { text: 'Recibos', path: '/facturacion/recibos' },
    ]
  },
  { 
    text: 'Seguridad', 
    icon: <SecurityIcon />, 
    submenu: [
      { text: 'Panel', path: '/seguridad' },
      { text: 'Gestionar Usuarios', path: '/seguridad/usuarios' },
      { text: 'Gestionar Roles', path: '/seguridad/roles' },
      { text: 'Recepcionistas', path: '/seguridad/recepcionistas' },
      { text: 'Cambiar contraseña', path: '/seguridad/cambiar-contrasena' },
      { text: 'Bitácora', path: '/seguridad/bitacora' },
    ]
  },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
];

export default function Navbar({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({}); // Estado para controlar submenús abiertos
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = true; // Siempre mostrar menú hamburguesa en todos los dispositivos

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (menuText) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
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
          <React.Fragment key={item.text}>
            {item.submenu ? (
              // Item con submenú desplegable
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMenuClick(item.text)}>
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                {/* Submenú colapsable */}
                <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.path} disablePadding sx={{ pl: 4 }}>
                        <ListItemButton onClick={() => handleNavigation(subItem.path)}>
                          <ListItemText 
                            primary={subItem.text} 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // Item simple sin submenú
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation(item.path)}>
                  <ListItemIcon sx={{ color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
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
