import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import RootLayout from './ui/RootLayout.jsx'
import Home from './pages/Home.jsx'
import Pacientes from './pages/pacientes/Index.jsx'
import Citas from './pages/citas/Index.jsx'
import Seguridad from './pages/seguridad/Index.jsx'
import Reportes from './pages/reportes/Index.jsx'
import Inventario from './pages/inventario/Index.jsx'
import Facturacion from './pages/facturacion/Index.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pacientes', element: <Pacientes /> },
      { path: 'citas', element: <Citas /> },
      { path: 'seguridad', element: <Seguridad /> },
      { path: 'reportes', element: <Reportes /> },
      { path: 'inventario', element: <Inventario /> },
      { path: 'facturacion', element: <Facturacion /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
