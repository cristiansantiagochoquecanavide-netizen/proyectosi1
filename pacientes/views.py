from django.shortcuts import render, redirect, get_object_or_404  # Helpers de vistas
from django.contrib import messages  # Mensajes flash
from .models import Paciente  # Modelo Paciente
from .forms import PacienteForm  # Formulario Paciente
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
try:
    from django_filters.rest_framework import DjangoFilterBackend
except Exception:  # django-filter puede no estar instalado
    DjangoFilterBackend = None
from .models import HistorialClinica, ArchivoClinico
from .serializers import PacienteSerializer, HistorialClinicaSerializer, ArchivoClinicoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from citas.models import Cita

def listado_pacientes(request):  # READ: lista todos los pacientes
    pacientes = Paciente.objects.all()  # QuerySet con todos los registros
    return render(request, 'pacientes/listado_pacientes.html', {'pacientes': pacientes})  # Renderiza la lista

def crear_paciente(request):  # CREATE: crea un paciente
    if request.method == 'POST':  # Si envían el formulario
        form = PacienteForm(request.POST)  # Pobla formulario con datos
        if form.is_valid():  # Valida que los datos sean correctos
            form.save()  # Inserta en la BD
            messages.success(request, 'Paciente creado correctamente')  # Mensaje éxito
            return redirect('listado_pacientes')  # Redirige a listado
    else:
        form = PacienteForm()  # Si GET, muestra form vacío
    return render(request, 'pacientes/crear_paciente.html', {'form': form})  # Renderiza template de creación

def editar_paciente(request, id_paciente):  # UPDATE: edita un paciente
    paciente = get_object_or_404(Paciente, pk=id_paciente)  # Obtiene el registro o 404
    if request.method == 'POST':  # Si envían cambios
        form = PacienteForm(request.POST, instance=paciente)  # Form en modo edición
        if form.is_valid():  # Valida
            form.save()  # Actualiza registro
            messages.success(request, 'Paciente actualizado correctamente')  # Mensaje éxito
            return redirect('listado_pacientes')  # Redirige
    else:
        form = PacienteForm(instance=paciente)  # Prellena form con datos actuales (GET)
    return render(request, 'pacientes/editar_paciente.html', {'form': form})  # Renderiza template

def eliminar_paciente(request, id_paciente):  # DELETE: elimina un paciente
    paciente = get_object_or_404(Paciente, pk=id_paciente)  # Obtiene o 404
    paciente.delete()  # Borra registro
    messages.success(request, 'Paciente eliminado correctamente')  # Mensaje éxito
    return redirect('listado_pacientes')  # Redirige al listado

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """
        CU6: Consultar historial del paciente
        - Devuelve información básica del paciente
        - Lista de citas (citas.Cita) asociadas
        - Lista de archivos clínicos (pacientes.ArchivoClinico) asociados
        """
        paciente = self.get_object()
        # Serializa el paciente
        paciente_data = PacienteSerializer(paciente).data
        # Obtiene y serializa citas del paciente
        citas = Cita.objects.filter(id_paciente=paciente)
        citas_data = [
            {
                'id_cita': c.id_cita,
                'fecha': c.fecha,
                'estado': c.estado,
                'odontologo': c.id_odontologo.nombre if c.id_odontologo else None,
            }
            for c in citas
        ]
        # Obtiene y serializa archivos clínicos del paciente
        archivos = ArchivoClinico.objects.filter(paciente=paciente)
        archivos_data = ArchivoClinicoSerializer(archivos, many=True).data
        return Response({
            'paciente': paciente_data,
            'citas': citas_data,
            'archivos': archivos_data,
        })

class HistorialClinicaViewSet(viewsets.ModelViewSet):
    queryset = HistorialClinica.objects.all()
    serializer_class = HistorialClinicaSerializer

class ArchivoClinicoViewSet(viewsets.ModelViewSet):
    queryset = ArchivoClinico.objects.all()   # pylint: disable=no-member
    serializer_class = ArchivoClinicoSerializer
    filter_backends = ([DjangoFilterBackend] if DjangoFilterBackend else []) + [SearchFilter, OrderingFilter]
    filterset_fields = ["paciente"]
    search_fields = ["nombreArchivo", "descripcion"]
    ordering_fields = ["fechaAdjunto"]
    ordering = ["-fechaAdjunto"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # Nota CU7: Para adjuntar documentos clínicos, hacer POST multipart a /pacientes/api/archivos/
    # con los campos: paciente, nombreArchivo (opcional), tipoDocumento (opcional), descripcion (opcional) y rutaArchivo (el file).
    # Este ViewSet ya acepta multipart y filtra por paciente.

# Create your views here.
