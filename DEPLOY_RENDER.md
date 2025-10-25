# 🚀 Guía de Despliegue en Render

## 📋 Archivos preparados para producción

- ✅ `build.sh` - Script de build automático
- ✅ `requirements.txt` - Dependencias actualizadas con whitenoise y CORS
- ✅ `.env.example` - Plantilla de variables de entorno
- ✅ `backend/settings.py` - Configurado para producción

## 🔧 Pasos para desplegar el BACKEND en Render

### 1. Preparar la Base de Datos

1. En Render, ve a **Dashboard** → **New** → **PostgreSQL**
2. Anota las credenciales que te proporciona:
   - Database Name
   - User
   - Password
   - Host
   - Port

### 2. Crear el Web Service (Backend)

1. Ve a **Dashboard** → **New** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura los siguientes campos:

**Build & Deploy:**
- **Name**: `proyectosi1-backend` (o el nombre que prefieras)
- **Environment**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn backend.wsgi:application`
- **Instance Type**: `Free` (para empezar)

**Environment Variables** (añade todas estas):

```
DJANGO_SECRET_KEY=<genera-una-nueva-con-el-comando-de-.env.example>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=tu-app.onrender.com
DB_ENGINE=django.db.backends.postgresql
DB_NAME=<tu-db-name-de-render>
DB_USER=<tu-db-user-de-render>
DB_PASSWORD=<tu-db-password-de-render>
DB_HOST=<tu-db-host-de-render>
DB_PORT=5432
DB_SSLMODE=require
CSRF_TRUSTED_ORIGINS=https://tu-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.onrender.com
DISABLE_ROLE_PERMS=0
```

4. Haz clic en **Create Web Service**
5. Espera a que termine el build (5-10 minutos la primera vez)

### 3. Verificar el Backend

Una vez desplegado:
- Accede a `https://tu-app.onrender.com/admin/`
- Deberías ver la página de login del admin de Django

## 🎨 Pasos para desplegar el FRONTEND en Render

### 1. Ajustar la configuración del Frontend

En `frontend/.env.production`:
```
VITE_API_URL=https://tu-backend.onrender.com
```

### 2. Crear el Static Site

1. Ve a **Dashboard** → **New** → **Static Site**
2. Conecta el mismo repositorio
3. Configura:

**Build & Deploy:**
- **Name**: `proyectosi1-frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

**Environment Variables:**
```
VITE_API_URL=https://tu-backend.onrender.com
```

4. Haz clic en **Create Static Site**

### 3. Actualizar CORS en el Backend

Una vez que tengas la URL del frontend:
1. Ve al panel del backend en Render
2. Actualiza estas variables de entorno:
```
CSRF_TRUSTED_ORIGINS=https://tu-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.onrender.com
DJANGO_ALLOWED_HOSTS=tu-backend.onrender.com
```
3. El servicio se reiniciará automáticamente

## 🔐 Crear el primer superusuario

Una vez desplegado el backend:

1. Ve al panel de tu Web Service en Render
2. Abre la pestaña **Shell**
3. Ejecuta:
```bash
python manage.py createsuperuser
```
4. Sigue las instrucciones para crear tu usuario admin

## ✅ Checklist de verificación

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Backend desplegado y accesible
- [ ] Admin de Django funciona (`/admin/`)
- [ ] Frontend desplegado y accesible
- [ ] CORS configurado correctamente
- [ ] Superusuario creado
- [ ] Login funciona desde el frontend
- [ ] API responde correctamente

## 🐛 Troubleshooting común

### Error de CORS
- Verifica que `CORS_ALLOWED_ORIGINS` incluya la URL exacta del frontend (con https://)
- No olvides incluir la URL en `CSRF_TRUSTED_ORIGINS` también

### Error 500 al acceder al admin
- Revisa los logs en Render (pestaña **Logs**)
- Verifica que `DJANGO_DEBUG=False` en producción
- Asegúrate de que `collectstatic` se ejecutó correctamente en el build

### Base de datos no conecta
- Verifica que todas las credenciales de DB sean correctas
- Asegúrate de que `DB_SSLMODE=require` esté configurado
- Comprueba que el host de la BD sea accesible

### Frontend no se comunica con backend
- Verifica que `VITE_API_URL` apunte al backend correcto
- Comprueba CORS en las DevTools del navegador
- Asegúrate de que ambos servicios usen HTTPS

## 📚 Recursos adicionales

- [Documentación de Render](https://render.com/docs)
- [Guía de Django en producción](https://docs.djangoproject.com/en/5.2/howto/deployment/)
- [Configuración de WhiteNoise](http://whitenoise.evans.io/)
