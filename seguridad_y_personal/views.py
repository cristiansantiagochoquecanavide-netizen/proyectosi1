from django.shortcuts import render, redirect, get_object_or_404  # Helpers para renderizar, redirigir y obtener objetos o 404
from django.contrib import messages  # Sistema de mensajes flash (éxito/error/info)
from django.contrib.auth import logout  # Usamos logout para limpiar sesión de auth
from .models import Usuario, Rol  # Modelos locales
from .forms import LoginForm, UsuarioForm, RolForm  # Formularios locales
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Rol, Usuario, UsuarioRol, Bitacora
from .serializers import RolSerializer, UsuarioSerializer, UsuarioRolSerializer, BitacoraSerializer

# ========== CU1: Iniciar sesión ==========
def iniciar_sesion(request):  # Vista que maneja login básico contra el modelo Usuario
    if request.method == 'POST':  # Si el usuario envió el formulario
        form = LoginForm(request.POST)  # Pobla el form con los datos del POST
        if form.is_valid():  # Valida tipos/formato (e.g., email válido)
            correo = form.cleaned_data['correo']  # Extrae email validado
            contrasena = form.cleaned_data['contrasena']  # Extrae contraseña
            try:
                # OJO: esto valida en texto plano. En un proyecto real, usa hashing (pbkdf2, bcrypt) y no guardes texto plano.
                usuario = Usuario.objects.get(correo=correo, contrasena=contrasena)  # Busca coincidencia exacta
                request.session['usuario_id'] = usuario.id_usuario  # Guarda el id en la sesión para identificar al usuario
                messages.success(request, f'Bienvenido, {usuario.nombre}')  # Mensaje de éxito
                return redirect('listado_pacientes')  # Redirige a alguna pantalla interna (puede ser tu dashboard)
            except Usuario.DoesNotExist:  # Si no encuentra el usuario o contraseña no coincide
                messages.error(request, 'Credenciales incorrectas')  # Muestra error
    else:
        form = LoginForm()  # Si es GET, renderiza formulario vacío
    return render(request, 'seguridad/login.html', {'form': form})  # Renderiza template con el form en contexto

# ========== CU2: Cerrar sesión ==========
def cerrar_sesion(request):  # Vista para cerrar sesión
    logout(request)  # Limpia la sesión de Django (si estuvieras usando auth)
    request.session.flush()  # Asegura limpiar cualquier dato en la sesión
    messages.info(request, 'Sesión cerrada correctamente')  # Mensaje informativo
    return redirect('login')  # Redirige al login

# ========== CU3: CRUD de Usuarios ==========
def listado_usuarios(request):  # Vista para Read (listar)
    usuarios = Usuario.objects.all()  # Consulta todos los usuarios
    return render(request, 'seguridad/listado_usuarios.html', {'usuarios': usuarios})  # Envía lista al template

def crear_usuario(request):  # Vista para Create
    if request.method == 'POST':  # Si envían el form
        form = UsuarioForm(request.POST)  # Pobla form con POST
        if form.is_valid():  # Valida datos
            form.save()  # Crea registro Usuario
            messages.success(request, 'Usuario creado correctamente')  # Mensaje éxito
            return redirect('listado_usuarios')  # Redirige a listado
    else:
        form = UsuarioForm()  # Form vacío para GET
    return render(request, 'seguridad/crear_usuario.html', {'form': form})  # Renderiza template de creación

def editar_usuario(request, id_usuario):  # Vista para Update
    usuario = get_object_or_404(Usuario, pk=id_usuario)  # Obtiene usuario o 404 si no existe
    if request.method == 'POST':  # Si envían cambios
        form = UsuarioForm(request.POST, instance=usuario)  # Pone el form en modo edición con instancia
        if form.is_valid():  # Valida
            form.save()  # Guarda cambios
            messages.success(request, 'Usuario actualizado correctamente')  # Mensaje éxito
            return redirect('listado_usuarios')  # Redirige al listado
    else:
        form = UsuarioForm(instance=usuario)  # Prellena el form con datos actuales (GET)
    return render(request, 'seguridad/editar_usuario.html', {'form': form})  # Renderiza template de edición

def eliminar_usuario(request, id_usuario):  # Vista para Delete
    usuario = get_object_or_404(Usuario, pk=id_usuario)  # Obtiene o 404
    usuario.delete()  # Elimina registro
    messages.success(request, 'Usuario eliminado correctamente')  # Mensaje éxito
    return redirect('listado_usuarios')  # Redirige al listado

# ========== CU4: CRUD de Roles ==========
def listado_roles(request):  # Read (listar roles)
    roles = Rol.objects.all()  # Trae todos los roles
    return render(request, 'seguridad/listado_roles.html', {'roles': roles})  # Renderiza listado

def crear_rol(request):  # Create (rol)
    if request.method == 'POST':  # Form enviado
        form = RolForm(request.POST)  # Pobla form
        if form.is_valid():  # Valida
            form.save()  # Crea rol
            messages.success(request, 'Rol creado correctamente')  # Mensaje éxito
            return redirect('listado_roles')  # Redirige al listado
    else:
        form = RolForm()  # Form vacío
    return render(request, 'seguridad/crear_rol.html', {'form': form})  # Renderiza template

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        CU1 (FRONT): Iniciar sesión vía API
        Body: { correo, contrasena }
        Efecto: guarda id del usuario en la sesión y devuelve datos básicos del usuario.
        """
        correo = request.data.get('correo')
        contrasena = request.data.get('contrasena')
        if not correo or not contrasena:
            return Response({'detail': 'Correo y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            usuario = Usuario.objects.get(correo=correo, contrasena=contrasena)
            request.session['usuario_id'] = usuario.id_usuario
            data = UsuarioSerializer(usuario).data
            return Response({'message': 'Inicio de sesión correcto', 'usuario': data})
        except Usuario.DoesNotExist:
            return Response({'detail': 'Credenciales incorrectas'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        CU2 (FRONT): Cerrar sesión vía API
        """
        logout(request)
        request.session.flush()
        return Response({'message': 'Sesión cerrada correctamente'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Devuelve el usuario autenticado en la sesión, si existe.
        Responde 401 si no hay sesión.
        """
        user_id = request.session.get('usuario_id')
        if not user_id:
            return Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            usuario = Usuario.objects.get(pk=user_id)
            return Response(UsuarioSerializer(usuario).data)
        except Usuario.DoesNotExist:
            return Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['get'])
    def recepcionistas(self, request):
        """
        CU23: Gestionar recepcionista - Listar usuarios con rol 'recepcionista'.
        """
        recep_role = Rol.objects.filter(nombre_rol__iexact='recepcionista').first()
        if not recep_role:
            return Response([], status=status.HTTP_200_OK)
        user_ids = UsuarioRol.objects.filter(id_rol=recep_role).values_list('id_usuario', flat=True)
        usuarios = Usuario.objects.filter(pk__in=user_ids)
        return Response(UsuarioSerializer(usuarios, many=True).data)

    @action(detail=False, methods=['post'])
    def crear_recepcionista(self, request):
        """
        CU23: Crear recepcionista - Crea un Usuario y le asigna el rol 'recepcionista'.
        Body: { username, nombre, correo, contrasena, estado }
        """
        data = request.data
        serializer = UsuarioSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        # Asigna rol recepcionista
        rol = Rol.objects.filter(nombre_rol__iexact='recepcionista').first()
        if not rol:
            rol = Rol.objects.create(nombre_rol='recepcionista', descripcion='Recepcionista')
        UsuarioRol.objects.create(id_usuario=usuario, id_rol=rol)
        # Bitácora
        try:
            Bitacora.objects.create(id_usuario=usuario, accion='Creación de recepcionista')
        except Exception:
            pass
        return Response(UsuarioSerializer(usuario).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cambiar_contrasena(self, request, pk=None):
        """
        CU24: Cambiar contraseña para un Usuario del módulo de seguridad.
        Body: { nueva_contrasena }
        NOTA: Aquí se almacena en texto plano para ser consistente con el modelo existente.
        """
        usuario = self.get_object()
        nueva = request.data.get('nueva_contrasena')
        if not nueva or len(nueva) < 4:
            return Response({'detail': 'La nueva contraseña es obligatoria y debe tener al menos 4 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)
        usuario.contrasena = nueva
        usuario.save()
        # Bitácora
        try:
            Bitacora.objects.create(id_usuario=usuario, accion='Cambio de contraseña')
        except Exception:
            pass
        return Response({'detail': 'Contraseña actualizada correctamente'})

class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer

class BitacoraViewSet(viewsets.ModelViewSet):
    queryset = Bitacora.objects.all()
    serializer_class = BitacoraSerializer
    # CU25: Ver bitácora - este ViewSet expone la bitácora completa.
    # Se podrían agregar filtros y ordenamientos desde el frontend o con DRF FilterBackend si se instala django-filter.

