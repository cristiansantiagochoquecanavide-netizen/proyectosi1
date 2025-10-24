from django.shortcuts import render, redirect, get_object_or_404  # Helpers de vistas
from django.contrib import messages  # Mensajes flash
from .models import Cita  # Modelo Cita
from .forms import CitaForm  # Formulario Cita
from datetime import timedelta  # Para validar rangos de 1 hora
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Odontologo, Cita, Disponibilidad
from .serializers import OdontologoSerializer, CitaSerializer, DisponibilidadSerializer
from seguridad_y_personal.models import Bitacora, Usuario, Rol, UsuarioRol
from seguridad_y_personal.permissions import RolesPermission

# Este módulo combina views HTML clásicas (para compatibilidad) y APIs DRF.
# El frontend moderno consume principalmente los ViewSets.

def listado_citas(request):  # READ: lista de citas
    citas = Cita.objects.all()  # Todas las citas
    return render(request, 'citas/listado_citas.html', {'citas': citas})  # Manda al template

def crear_cita(request):  # CREATE: crear cita
    if request.method == 'POST':  # Si envían form
        form = CitaForm(request.POST)  # Pobla con POST
        if form.is_valid():  # Valida datos
            form.save()  # Inserta
            messages.success(request, 'Cita creada correctamente')  # Éxito
            return redirect('listado_citas')  # Redirige
    else:
        form = CitaForm()  # Form vacío para GET
    return render(request, 'citas/crear_cita.html', {'form': form})  # Renderiza template

def editar_cita(request, id_cita):  # UPDATE: editar cita
    cita = get_object_or_404(Cita, pk=id_cita)  # Obtiene o 404
    if request.method == 'POST':  # Si envían cambios
        form = CitaForm(request.POST, instance=cita)  # Edición con instancia
        if form.is_valid():  # Valida
            form.save()  # Guarda cambios
            messages.success(request, 'Cita actualizada correctamente')  # Éxito
            return redirect('listado_citas')  # Redirige
    else:
        form = CitaForm(instance=cita)  # Prellena con datos (GET)
    return render(request, 'citas/editar_cita.html', {'form': form})  # Renderiza template

def eliminar_cita(request, id_cita):  # DELETE: eliminar cita
    cita = get_object_or_404(Cita, pk=id_cita)  # Obtiene o 404
    cita.delete()  # Borra
    messages.success(request, 'Cita eliminada correctamente')  # Éxito
    return redirect('listado_citas')  # Redirige

class OdontologoViewSet(viewsets.ModelViewSet):
    queryset = Odontologo.objects.all()
    serializer_class = OdontologoSerializer
    permission_classes = [RolesPermission]
    roles_per_action = {
        # CU22: solo administrador gestiona odontólogos
        'list': ['administrador'],
        'retrieve': ['administrador'],
        'create': ['administrador'],
        'update': ['administrador'],
        'partial_update': ['administrador'],
        'destroy': ['administrador'],
    }
    # CU22: Gestionar odontólogo - este ViewSet expone CRUD completo sobre Odontologo.
    # Puedes usar filtros básicos desde el frontend (e.g., ?search=nombre) si añades SearchFilter aquí.

    # Bitácora: registrar creación/edición/eliminación de odontólogos
    def _actor(self, request):
        try:
            user_id = request.session.get('usuario_id')
            if not user_id:
                return None
            return Usuario.objects.filter(pk=user_id).first()
        except Exception:
            return None

    def perform_create(self, serializer):
        # Guardar odontólogo
        odontologo = serializer.save()
        # Crear/actualizar usuario de seguridad si vienen username/contrasena
        try:
            username = self.request.data.get('username', '')
            contrasena = self.request.data.get('contrasena', '')
            email = odontologo.email or ''
            if email and (username or contrasena):
                usuario_sec, created = Usuario.objects.get_or_create(
                    correo=email,
                    defaults={
                        'username': username or email,
                        'nombre': odontologo.nombre or username or email,
                        'contrasena': contrasena or '',
                        'estado': 'activo',
                    }
                )
                # Si ya existía, actualizar datos si llegaron
                cambios = False
                if username and usuario_sec.username != username:
                    usuario_sec.username = username; cambios = True
                if contrasena and usuario_sec.contrasena != contrasena:
                    usuario_sec.contrasena = contrasena; cambios = True
                if (odontologo.nombre or '') and usuario_sec.nombre != odontologo.nombre:
                    usuario_sec.nombre = odontologo.nombre; cambios = True
                if cambios:
                    usuario_sec.save()
                # Asignar rol odontologo
                rol = Rol.objects.filter(nombre_rol__iexact='odontologo').first()
                if not rol:
                    rol = Rol.objects.create(nombre_rol='odontologo', descripcion='Odontólogo')
                UsuarioRol.objects.get_or_create(id_usuario=usuario_sec, id_rol=rol)
                # Vincular al odontólogo
                if odontologo.usuario_seguridad_id != usuario_sec.id_usuario:
                    odontologo.usuario_seguridad = usuario_sec
                    odontologo.save(update_fields=['usuario_seguridad'])
        except Exception:
            # No romper el flujo de creación por problemas de sincronización
            pass
        try:
            actor = self._actor(self.request)
            if actor:
                Bitacora.objects.create(
                    id_usuario=actor,
                    accion=f"Creación de odontólogo: {getattr(odontologo, 'nombre', '')} (id={getattr(odontologo, 'id_odontologo', '')})",
                )
        except Exception:
            pass

    def perform_update(self, serializer):
        odontologo = serializer.save()
        # Actualizar usuario de seguridad si se envían username/contrasena
        try:
            username = self.request.data.get('username', '')
            contrasena = self.request.data.get('contrasena', '')
            email = odontologo.email or ''
            if email and (username or contrasena):
                usuario_sec = Usuario.objects.filter(correo=email).first()
                if not usuario_sec:
                    # Crear si no existe
                    usuario_sec = Usuario.objects.create(
                        correo=email,
                        username=username or email,
                        nombre=odontologo.nombre or username or email,
                        contrasena=contrasena or '',
                        estado='activo',
                    )
                else:
                    cambios = False
                    if username and usuario_sec.username != username:
                        usuario_sec.username = username; cambios = True
                    if contrasena and usuario_sec.contrasena != contrasena:
                        usuario_sec.contrasena = contrasena; cambios = True
                    if (odontologo.nombre or '') and usuario_sec.nombre != odontologo.nombre:
                        usuario_sec.nombre = odontologo.nombre; cambios = True
                    if cambios:
                        usuario_sec.save()
                # Asignar rol odontologo si no lo tiene
                rol = Rol.objects.filter(nombre_rol__iexact='odontologo').first()
                if not rol:
                    rol = Rol.objects.create(nombre_rol='odontologo', descripcion='Odontólogo')
                UsuarioRol.objects.get_or_create(id_usuario=usuario_sec, id_rol=rol)
                # Vincular al odontólogo
                if odontologo.usuario_seguridad_id != usuario_sec.id_usuario:
                    odontologo.usuario_seguridad = usuario_sec
                    odontologo.save(update_fields=['usuario_seguridad'])
        except Exception:
            pass
        try:
            actor = self._actor(self.request)
            if actor:
                Bitacora.objects.create(
                    id_usuario=actor,
                    accion=f"Edición de odontólogo: {getattr(odontologo, 'nombre', '')} (id={getattr(odontologo, 'id_odontologo', '')})",
                )
        except Exception:
            pass

    def perform_destroy(self, instance):
        nombre = getattr(instance, 'nombre', '')
        oid = getattr(instance, 'id_odontologo', '')
        try:
            actor = self._actor(self.request)
            if actor:
                Bitacora.objects.create(
                    id_usuario=actor,
                    accion=f"Eliminación de odontólogo: {nombre} (id={oid})",
                )
        except Exception:
            pass
        instance.delete()

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [RolesPermission]
    roles_per_action = {
        # CU4/CU9: recepcionista gestiona y solicita citas
        'list': ['recepcionista'],
        'retrieve': ['recepcionista'],
        'create': ['recepcionista'],
        'update': ['recepcionista'],
        'partial_update': ['recepcionista'],
        'destroy': ['recepcionista'],
        'cancelar': ['recepcionista'],
        'solicitar': ['recepcionista'],
    }

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Marca la cita como cancelada sin eliminarla."""
        cita = self.get_object()
        if cita.estado != 'cancelada':
            cita.estado = 'cancelada'
            cita.save()
        serializer = self.get_serializer(cita)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def solicitar(self, request):
        """
        CU9: Solicitar cita
        Crea una cita en estado 'pendiente'.
        Body esperado (JSON): {"id_paciente": int, "fecha": ISO8601, "id_odontologo": int|null, "usuario_id": int opcional}
        """
        id_paciente = request.data.get('id_paciente')
        fecha = request.data.get('fecha')
        id_odontologo = request.data.get('id_odontologo')
        usuario_id = request.data.get('usuario_id')  # Para registrar en bitácora si viene

        if not id_paciente or not fecha:
            return Response({'detail': 'id_paciente y fecha son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Construimos el payload para el serializer
            payload = {
                'id_paciente': id_paciente,
                'fecha': fecha,
                'estado': 'pendiente',
            }
            if id_odontologo:
                payload['id_odontologo'] = id_odontologo
            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)

            # Validación de conflicto de horario antes de crear la cita
            # Usamos los datos validados para obtener instancias y fecha como datetime
            paciente_obj = serializer.validated_data['id_paciente']
            fecha_dt = serializer.validated_data['fecha']
            odontologo_obj = serializer.validated_data.get('id_odontologo')

            # Regla de conflictos:
            # - No permitir dos citas no canceladas en el mismo horario exacto (ya cubierto por el rango)
            # - Además, bloquear cualquier cita en un rango de ±1 hora del horario solicitado.
            inicio = fecha_dt - timedelta(hours=1)
            fin = fecha_dt + timedelta(hours=1)

            # Conflicto por paciente: el mismo paciente no puede tener otra cita dentro de ±1 hora
            conflicto_paciente = Cita.objects.filter(
                id_paciente=paciente_obj,
                fecha__gte=inicio,
                fecha__lt=fin,
            ).exclude(estado='cancelada').exists()
            if conflicto_paciente:
                return Response(
                    {'detail': 'Ya tienes una cita dentro de 1 hora de ese horario.'},
                    status=status.HTTP_409_CONFLICT,
                )

            # Conflicto por odontólogo (si se especifica): el odontólogo no puede tener otra cita dentro de ±1 hora
            if odontologo_obj is not None:
                conflicto_odontologo = Cita.objects.filter(
                    id_odontologo=odontologo_obj,
                    fecha__gte=inicio,
                    fecha__lt=fin,
                ).exclude(estado='cancelada').exists()
                if conflicto_odontologo:
                    return Response(
                        {'detail': 'Este horario (±1 hora) ya está ocupado para el odontólogo seleccionado.'},
                        status=status.HTTP_409_CONFLICT,
                    )

            # Si no hay conflicto, crear la cita
            cita = serializer.save()

            # Bitácora opcional
            try:
                if usuario_id:
                    usuario = Usuario.objects.get(pk=usuario_id)
                    Bitacora.objects.create(
                        id_usuario=usuario,
                        accion=f"Solicitud de cita creada (cita_id={cita.id_cita})",
                    )
            except Exception:
                pass

            return Response(self.get_serializer(cita).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DisponibilidadViewSet(viewsets.ModelViewSet):
    queryset = Disponibilidad.objects.all()
    serializer_class = DisponibilidadSerializer
    permission_classes = [RolesPermission]
    # No mapeamos explícito: por defecto permitido. Si se requiere, puede agregarse roles_per_action.
