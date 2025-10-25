#!/usr/bin/env bash
# Script de build para Render.com
# Instala dependencias, genera archivos estáticos y aplica migraciones

# Salir si cualquier comando falla
set -o errexit

# Instalar dependencias de Python
pip install -r requirements.txt

# Recolectar archivos estáticos (CSS, JS, imágenes del admin, etc.)
python manage.py collectstatic --no-input

# Aplicar migraciones de base de datos
python manage.py migrate
