import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import RootLayout from './ui/RootLayout.jsx'
import Home from './pages/Home.jsx'
import Pacientes from './pages/pacientes/Index.jsx'
import Citas from './pages/citas/Index.jsx'
import Seguridad from './pages/seguridad/Index.jsx'
import Recepcionistas from './pages/seguridad/Recepcionistas.jsx'
import CambiarContrasena from './pages/seguridad/CambiarContrasena.jsx'
import Bitacora from './pages/seguridad/Bitacora.jsx'
import Login from './pages/seguridad/Login.jsx'
import Usuarios from './pages/seguridad/Usuarios.jsx'
import Roles from './pages/seguridad/Roles.jsx'
import Reportes from './pages/reportes/Index.jsx'
import Inventario from './pages/inventario/Index.jsx'
import Facturacion from './pages/facturacion/Index.jsx'
import HistorialPaciente from './pages/pacientes/Historial.jsx'
import AdjuntarArchivo from './pages/pacientes/Adjuntar.jsx'
import SolicitarCita from './pages/citas/Solicitar.jsx'
import Odontologos from './pages/citas/Odontologos.jsx'
// Nuevos módulos - Atención Clínica
import IniciarAtencion from './pages/atencion/IniciarAtencion.jsx'
import ListadoAtenciones from './pages/atencion/ListadoAtenciones.jsx'
import Odontograma from './pages/atencion/Odontograma.jsx'
import Tratamientos from './pages/atencion/Tratamientos.jsx'
import Procedimientos from './pages/atencion/Procedimientos.jsx'
import RegistrarConsumo from './pages/atencion/RegistrarConsumo.jsx'
import CerrarAtencion from './pages/atencion/CerrarAtencion.jsx'
// Nuevos módulos - Inventario
import NuevoInsumo from './pages/inventario/NuevoInsumo.jsx'
import AlertasStock from './pages/inventario/AlertasStock.jsx'
import Movimientos from './pages/inventario/Movimientos.jsx'
import OrdenesCompra from './pages/inventario/OrdenesCompra.jsx'
// Nuevos módulos - Facturación
import GenerarFactura from './pages/facturacion/GenerarFactura.jsx'
import RegistrarPago from './pages/facturacion/RegistrarPago.jsx'
import Recibos from './pages/facturacion/Recibos.jsx'
// Nuevos módulos - Disponibilidad
import Disponibilidad from './pages/citas/Disponibilidad.jsx'
import { AuthProvider } from './ui/AuthContext.jsx'
import RequireAuth from './ui/RequireAuth.jsx'

// Definición de rutas de la SPA.
// - Las rutas privadas se envuelven con <RequireAuth> para exigir sesión.
// - El layout raíz aporta AppBar/menús y contenedor de página.
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <RequireAuth><Home /></RequireAuth> },
      { path: 'pacientes', element: <RequireAuth><Pacientes /></RequireAuth> },
      { path: 'pacientes/historial', element: <RequireAuth><HistorialPaciente /></RequireAuth> },
      { path: 'pacientes/adjuntar', element: <RequireAuth><AdjuntarArchivo /></RequireAuth> },
      { path: 'citas', element: <RequireAuth><Citas /></RequireAuth> },
      { path: 'citas/solicitar', element: <RequireAuth><SolicitarCita /></RequireAuth> },
      { path: 'citas/odontologos', element: <RequireAuth><Odontologos /></RequireAuth> },
      { path: 'citas/disponibilidad', element: <RequireAuth><Disponibilidad /></RequireAuth> },
      // Rutas de Atención Clínica
      { path: 'atencion/iniciar', element: <RequireAuth><IniciarAtencion /></RequireAuth> },
      { path: 'atencion', element: <RequireAuth><ListadoAtenciones /></RequireAuth> },
      { path: 'atencion/odontograma', element: <RequireAuth><Odontograma /></RequireAuth> },
      { path: 'atencion/tratamientos', element: <RequireAuth><Tratamientos /></RequireAuth> },
      { path: 'atencion/procedimientos', element: <RequireAuth><Procedimientos /></RequireAuth> },
      { path: 'atencion/:id/consumo', element: <RequireAuth><RegistrarConsumo /></RequireAuth> },
      { path: 'atencion/:id/cerrar', element: <RequireAuth><CerrarAtencion /></RequireAuth> },
      { path: 'seguridad', element: <RequireAuth><Seguridad /></RequireAuth> },
  { path: 'seguridad/usuarios', element: <RequireAuth><Usuarios /></RequireAuth> },
  { path: 'seguridad/roles', element: <RequireAuth><Roles /></RequireAuth> },
      { path: 'seguridad/recepcionistas', element: <RequireAuth><Recepcionistas /></RequireAuth> },
      { path: 'seguridad/cambiar-contrasena', element: <RequireAuth><CambiarContrasena /></RequireAuth> },
      { path: 'seguridad/bitacora', element: <RequireAuth><Bitacora /></RequireAuth> },
      // públicas
      { path: 'seguridad/login', element: <Login /> },
      { path: 'reportes', element: <RequireAuth><Reportes /></RequireAuth> },
      // Rutas de Inventario
      { path: 'inventario', element: <RequireAuth><Inventario /></RequireAuth> },
      { path: 'inventario/nuevo', element: <RequireAuth><NuevoInsumo /></RequireAuth> },
      { path: 'inventario/alertas', element: <RequireAuth><AlertasStock /></RequireAuth> },
      { path: 'inventario/movimientos', element: <RequireAuth><Movimientos /></RequireAuth> },
      { path: 'inventario/ordenes', element: <RequireAuth><OrdenesCompra /></RequireAuth> },
      // Rutas de Facturación
      { path: 'facturacion', element: <RequireAuth><Facturacion /></RequireAuth> },
      { path: 'facturacion/nueva', element: <RequireAuth><GenerarFactura /></RequireAuth> },
      { path: 'facturacion/pago', element: <RequireAuth><RegistrarPago /></RequireAuth> },
      { path: 'facturacion/recibos', element: <RequireAuth><Recibos /></RequireAuth> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
