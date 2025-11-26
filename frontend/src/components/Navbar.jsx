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
  Divider,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
    ],
  },
  {
    text: 'Citas',
    icon: <CalendarTodayIcon />,
    submenu: [
      { text: 'Listado', path: '/citas' },
      { text: 'Solicitar cita', path: '/citas/solicitar' },
      { text: 'Odontólogos', path: '/citas/odontologos' },
      { text: 'Disponibilidad', path: '/citas/disponibilidad' },
    ],
  },
  {
    text: 'Atención',
    icon: <MedicalServicesIcon />,
    submenu: [
      { text: 'Iniciar Atención', path: '/atencion/iniciar' },
      { text: 'Listado Atenciones', path: '/atencion' },
      { text: 'Odontograma', path: '/atencion/odontograma' },
      { text: 'Tratamientos', path: '/atencion/tratamientos' },
      { text: 'Procedimientos', path: '/atencion/procedimientos' },
    ],
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
      { text: 'Almacenes', path: '/inventario/almacenes' },
      { text: 'Proveedores', path: '/inventario/proveedores' },
    ],
  },
  {
    text: 'Facturación',
    icon: <ReceiptIcon />,
    submenu: [
      { text: 'Listado Facturas', path: '/facturacion' },
      { text: 'Generar Factura', path: '/facturacion/nueva' },
      { text: 'Registrar Pago', path: '/facturacion/pago' },
      { text: 'Mis comprobantes', path: '/facturacion/mis-comprobantes' },
      { text: 'Historial Comprobantes y Pagos', path: '/facturacion/historial' },
      { text: 'Recibos', path: '/facturacion/recibos' },
    ],
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
    ],
  },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
];

export default function Navbar({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (menuText) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    if (onLogout) onLogout();
  };

  const drawerContent = (
    <Box sx={{ width: 280 }} role="presentation">
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

      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.submenu ? (
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
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigation('/')}
            >
              Consultorio Dental
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
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

      <Toolbar />
    </>
  );
}

