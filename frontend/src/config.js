// Configuración automática para desarrollo y producción
// En desarrollo: usa el proxy de Vite (localhost:8000)
// En producción: usa la URL de la API desde variable de entorno

const isDevelopment = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;

// En desarrollo, usamos rutas relativas (el proxy de Vite las maneja)
// En producción, usamos la URL completa de la API
if (!isDevelopment && !apiUrl) {
  console.error('⚠️ VITE_API_URL no está configurada en producción. Por favor, configúrala en Render.');
}
export const API_BASE_URL = isDevelopment ? '' : (apiUrl || '');

// Configuración de URLs
export const config = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment,
  isProduction: !isDevelopment,
};

export default config;
