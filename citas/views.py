from django.shortcuts import render, redirect, get_object_or_404  # Helpers de vistas
from django.contrib import messages  # Mensajes flash
from .models import Cita  # Modelo Cita
from .forms import CitaForm  # Formulario Cita
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Odontologo, Cita, Disponibilidad
from .serializers import OdontologoSerializer, CitaSerializer, DisponibilidadSerializer

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

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Marca la cita como cancelada sin eliminarla."""
        cita = self.get_object()
        if cita.estado != 'cancelada':
            cita.estado = 'cancelada'
            cita.save()
        serializer = self.get_serializer(cita)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DisponibilidadViewSet(viewsets.ModelViewSet):
    queryset = Disponibilidad.objects.all()
    serializer_class = DisponibilidadSerializer
