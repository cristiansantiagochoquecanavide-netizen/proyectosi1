import { Box } from '@mui/material';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api';

/**
 * Layout principal de la aplicación con Navbar responsive
 */
export default function Layout({ children, user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiPost('/seguridad/api/usuarios/logout/', {});
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar navegación al login incluso si falla
      navigate('/login');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={handleLogout} />
      
      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 }, // 16px en móvil, 24px en desktop
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
