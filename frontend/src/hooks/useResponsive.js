import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Hook para detectar el tipo de dispositivo y obtener configuraciones responsive
 */
export default function useResponsive() {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-960px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 960px
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // >= 1280px
  
  // Configuraciones responsive comunes
  const config = {
    // Spacing
    spacing: isMobile ? 1 : isTablet ? 2 : 3,
    
    // Padding para containers
    containerPadding: isMobile ? 2 : 3,
    
    // Padding para cards
    cardPadding: isMobile ? 1.5 : 2,
    
    // Tamaño de botones
    buttonSize: isMobile ? 'small' : 'medium',
    
    // Tamaño de tablas
    tableSize: isMobile ? 'small' : 'medium',
    
    // Columnas de Grid
    gridSpacing: isMobile ? 1 : 2,
    
    // Ancho de diálogos
    dialogMaxWidth: isMobile ? 'xs' : isTablet ? 'sm' : 'md',
    
    // Si mostrar componentes compactos
    dense: isMobile,
  };
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    ...config,
  };
}
