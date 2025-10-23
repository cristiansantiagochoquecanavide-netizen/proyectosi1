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
      { path: 'seguridad', element: <RequireAuth><Seguridad /></RequireAuth> },
  { path: 'seguridad/usuarios', element: <RequireAuth><Usuarios /></RequireAuth> },
  { path: 'seguridad/roles', element: <RequireAuth><Roles /></RequireAuth> },
      { path: 'seguridad/recepcionistas', element: <RequireAuth><Recepcionistas /></RequireAuth> },
      { path: 'seguridad/cambiar-contrasena', element: <RequireAuth><CambiarContrasena /></RequireAuth> },
      { path: 'seguridad/bitacora', element: <RequireAuth><Bitacora /></RequireAuth> },
      // públicas
      { path: 'seguridad/login', element: <Login /> },
      { path: 'reportes', element: <RequireAuth><Reportes /></RequireAuth> },
      { path: 'inventario', element: <RequireAuth><Inventario /></RequireAuth> },
      { path: 'facturacion', element: <RequireAuth><Facturacion /></RequireAuth> },
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
