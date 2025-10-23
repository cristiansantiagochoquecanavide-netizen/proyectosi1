# Proyecto SI1 — Guía de funcionalidades y cambios

Este documento resume qué hace cada parte del backend (Django/DRF) y del frontend (React/Vite), y explica las modificaciones añadidas recientemente para que puedas orientarte al leer el código.

## Backend (Django + DRF)

Estructura principal:

- `backend/` (configuración del proyecto Django)
  - `settings.py`: configuración general (apps, DB, `MEDIA`, idioma/es-BO, `CSRF_TRUSTED_ORIGINS` incluyendo puertos 5173/5174 para Vite).
  - `urls.py`: enrutamiento raíz; incluye rutas de apps y endpoint `/csrf` para obtener la cookie CSRF desde el frontend.
  - `views.py`: vista `csrf_token` (sirve la cookie `csrftoken`).
- Apps de dominio:
  - `pacientes/`: Pacientes, Historial clínico, Archivos clínicos (subida de ficheros), endpoints de historial y adjuntos.
  - `citas/`: Citas y Odontólogos; validaciones de conflictos de horario; acciones de cancelar y solicitar cita.
  - `seguridad_y_personal/`: Usuarios, roles, bitácora; login/logout/me para frontend; señales para sincronizar Odontólogo con roles.
  - Otras apps scaffolding: `atencion/`, `facturacion_y_compras/`, `inventario_y_compras/`, `reportes/`.

### Pacientes (`pacientes/`)

- `models.py`
  - `Paciente`: datos personales; `genero` con choices `M/F`.
  - `HistorialClinica`: entradas de atención con fecha/diagnóstico.
  - `ArchivoClinico`: `FileField` para adjuntar documentos por paciente.
- `serializers.py`
  - Serializadores DRF para las entidades anteriores.
- `views.py`
  - `PacienteViewSet`: CRUD de pacientes + acción `historial` (CU6) que devuelve paciente, citas asociadas y archivos clínicos.
  - `ArchivoClinicoViewSet`: acepta multipart (CU7), permite filtrar por paciente, buscar/ordenar.
  - Importa filtros de `django_filters` si están disponibles (manejo seguro si falta la lib).
- Plantillas Django clásicas (HTML) para listado/crear/editar se mantienen, pero el frontend React usa mayormente los endpoints DRF.

### Citas (`citas/`)

- `models.py`
  - `Odontologo`: datos y relación opcional a `auth.User` y `seguridad_y_personal.Usuario`.
  - `Cita`: fecha/hora, paciente, odontólogo (opcional) y estado (`pendiente`, `confirmada`, `cancelada`).
- `serializers.py`: serializers DRF para `Odontologo` y `Cita`.
- `views.py`
  - `OdontologoViewSet`: CRUD completo (CU22).
  - `CitaViewSet`: CRUD + acciones:
    - `cancelar`: marca como cancelada (no borra).
    - `solicitar` (CU9): crea cita en `pendiente` validando conflictos:
      - El mismo paciente no puede tener otra cita ±1 hora del horario solicitado.
      - Si se especifica odontólogo, tampoco puede tener otra cita ±1 hora.
    - Registra en bitácora si se provee `usuario_id`.

### Seguridad y Personal (`seguridad_y_personal/`)

- `models.py`: `Usuario`, `Rol`, `UsuarioRol`, `Bitacora` (según tu modelo actual).
- `views.py`
  - Sesión para el frontend: `login`, `logout`, `me` (estado de sesión).
  - CU23 recepcionistas: `usuarios/recepcionistas`, `usuarios/crear_recepcionista` y CRUD de `Usuario` (PATCH/DELETE).
  - CU24: `cambiar_contrasena` (acción para actualizar contraseña del usuario actual).
  - CU25: `BitacoraViewSet` para listar la bitácora.
- `signals.py`
  - Mantiene sincronizado `citas.Odontologo` con `UsuarioRol` cuando el rol es “odontologo”.
    - Crea/elimina automáticamente el Odontólogo al asignar/remover el rol.

### Configuración extra

- `backend/settings.py`
  - `CSRF_TRUSTED_ORIGINS` incluye `http://localhost:5173` y `http://localhost:5174` para el dev server de Vite.
  - `MEDIA` configurado para subir archivos y servirlos en desarrollo.
  - Localización en español.
- `backend/urls.py`
  - Expo de rutas DRF (routers) para pacientes, citas, seguridad, etc.
  - `/csrf`: endpoint para setear cookie CSRF (usado por el frontend antes de POST/PUT/DELETE).

## Frontend (React + Vite + MUI)

Estructura principal en `frontend/src/`:

- `main.jsx`
  - Define las rutas de la SPA con React Router.
  - Protege rutas con `RequireAuth` (solo acceso autenticado) y deja pública `seguridad/login`.
  - Rutas principales: pacientes, citas, seguridad (panel, recepcionistas, cambiar contraseña, bitácora), reportes, inventario, facturación.
- `ui/`
  - `RootLayout.jsx`: barra superior con menús (Pacientes, Citas, Seguridad), contenedor principal y footer.
    - Botón rojo “Cerrar sesión” arriba a la derecha que cierra sesión directo (sin navegar a otra página) y redirige a login.
  - `AuthContext.jsx`: gestiona el estado de autenticación (me/login/logout), guarda usuario en estado y expone helpers.
  - `RequireAuth.jsx`: wrapper que redirige a `/seguridad/login` si no hay sesión.
- `lib/api.js`
  - Helpers `apiGet`, `apiPost`, `apiPostForm`, `apiPut`, `apiPatch`, `apiDelete`.
  - Incluyen cookies y cabecera `X-CSRFToken` (se obtiene con `/csrf` si hace falta).
- Páginas:
  - `pages/pacientes/Index.jsx`: listado con CRUD en la misma vista.
    - Dialog para crear/editar paciente; Delete con confirmación; refresca el listado tras guardar/eliminar.
  - `pages/pacientes/Historial.jsx`: CU6 — muestra historial (citas y archivos) de un paciente.
  - `pages/pacientes/Adjuntar.jsx`: CU7 — carga multipart para adjuntar archivos clínicos.
  - `pages/citas/Index.jsx`: listado con CRUD + cancelar en la misma vista.
    - Dialog para crear/editar; Delete con confirmación; botón “Cancelar” llama la acción backend.
  - `pages/citas/Solicitar.jsx`: CU9 — flujo de solicitud con validaciones de conflicto (maneja errores 409 del backend).
  - `pages/citas/Odontologos.jsx`: CU22 — CRUD de odontólogos.
  - `pages/seguridad/Recepcionistas.jsx`: CU23 — CRUD recepcionistas (crear con contraseña, editar inline, eliminar).
  - `pages/seguridad/CambiarContrasena.jsx`: CU24 — formulario para cambiar la contraseña del usuario.
  - `pages/seguridad/Bitacora.jsx`: CU25 — listado de acciones con nombres de usuario/rol cuando es posible.
  - `pages/seguridad/Login.jsx`: UI centrada y ampliada; usa `AuthContext` para iniciar sesión.

## Modificaciones recientes (qué y por qué)

- Autenticación frontend
  - Añadido `AuthContext` con `me/login/logout` y `RequireAuth` para proteger rutas.
  - Botón “Cerrar sesión” ahora ejecuta `logout()` directo y redirige a login (se eliminó la ruta/página de `seguridad/logout`).
  - Se ajustó la UI (login centrado, container XL, botón salir arriba a la derecha).
- CSRF end-to-end
  - Endpoint `/csrf` en backend y helpers en `api.js` para enviar `X-CSRFToken` con cookies.
  - `CSRF_TRUSTED_ORIGINS` actualizado para puertos 5173/5174.
- Citas: validaciones de conflicto (CU9)
  - Backend: en `CitaViewSet.solicitar`, bloqueo de citas para el mismo paciente dentro de ±1 hora y, si hay odontólogo, también bloqueo para ese odontólogo.
  - Frontend: manejo de errores HTTP 409 con mensajes claros.
- CRUD sin cambiar de pestaña
  - Pacientes: `pages/pacientes/Index.jsx` ahora incorpora crear/editar en un Dialog y elimina inline; refresca el listado tras cada operación.
  - Citas: `pages/citas/Index.jsx` migrado al mismo patrón (Dialog + refresco). Botón “Cancelar” mantiene acción dedicada.
- Sincronización de Odontólogos con Seguridad
  - Señales en `seguridad_y_personal/signals.py` crean/eliminen `citas.Odontologo` al asignar/remover rol de “odontologo” en `UsuarioRol`.
- CU6/7/22/23/24/25
  - CU6: `PacienteViewSet.historial` + `pages/pacientes/Historial.jsx`.
  - CU7: `ArchivoClinicoViewSet` acepta multipart + `Adjuntar.jsx`.
  - CU22: `OdontologoViewSet` + `Odontologos.jsx` CRUD.
  - CU23: Recepcionistas CRUD (`usuarios/recepcionistas`, `crear_recepcionista`, PATCH/DELETE) + página.
  - CU24: `cambiar_contrasena` + página.
  - CU25: Bitácora mejorada en frontend.

## Cómo se conectan backend y frontend

- El frontend usa los helpers de `api.js` para hablar con endpoints DRF.
- Se usan sesiones Django (con cookies) y CSRF para las operaciones de escritura.
- Las rutas protegidas consultan `AuthContext.me()` al cargar; si no hay sesión, redirige a login.

## Consejos para navegar el código

- Endpoints DRF principales:
  - Pacientes: `/pacientes/api/pacientes/` (CRUD) y `/pacientes/api/pacientes/{id}/historial/` (CU6).
  - Archivos clínicos: `/pacientes/api/archivos/` (POST multipart, GET por paciente con `?paciente={id}`).
  - Citas: `/citas/api/citas/` (CRUD) y acciones `/citas/api/citas/{id}/cancelar/`, `/citas/api/citas/solicitar/`.
  - Odontólogos: `/citas/api/odontologos/` (CRUD).
  - Seguridad: `/seguridad/api/usuarios/login/`, `/logout/`, `/me/`, `/usuarios/recepcionistas/`, `/usuarios/crear_recepcionista/`, `/usuarios/{id}/` (PATCH/DELETE), `/usuarios/cambiar_contrasena/`.
- Frontend
  - Para agregar un CRUD similar, copia el patrón de `Pacientes` o `Citas` (Dialog + `fetch` + refresco de tabla).
  - Autenticación está centralizada en `ui/AuthContext.jsx`; usa `useAuth()` donde necesites el usuario o `logout()`.

## Próximos pasos sugeridos

- Centralizar validaciones de conflictos también en el `create` genérico de Citas (no solo en `solicitar`).
- Mostrar el nombre de usuario en el AppBar cuando hay sesión.
- Añadir tests básicos para las acciones sensibles (`solicitar`, `cancelar`, `cambiar_contrasena`).
