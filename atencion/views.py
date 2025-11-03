from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import (
    Atencion, Procedimiento, Odontograma, PiezaDental,
    Tratamiento, TratamientoAtencion
)
from .serializers import (
    AtencionSerializer, ProcedimientoSerializer, OdontogramaSerializer,
    PiezaDentalSerializer, TratamientoSerializer, TratamientoAtencionSerializer
)


class AtencionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Atencion (CU11: Iniciar atención desde cita)
    """
    queryset = Atencion.objects.all()
    serializer_class = AtencionSerializer
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """Finaliza una atención (CU14: Cerrar atención)"""
        atencion = self.get_object()
        atencion.finalizar_atencion()
        return Response({
            'status': 'success',
            'message': 'Atención finalizada correctamente',
            'fecha_fin': atencion.fecha_fin
        })
    
    @action(detail=False, methods=['get'])
    def en_curso(self, request):
        """Lista atenciones en curso"""
        atenciones = self.queryset.filter(estado='en_curso')
        serializer = self.get_serializer(atenciones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_paciente(self, request):
        """Lista atenciones de un paciente específico"""
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'error': 'Se requiere paciente_id'}, status=400)
        
        atenciones = self.queryset.filter(id_paciente=paciente_id)
        serializer = self.get_serializer(atenciones, many=True)
        return Response(serializer.data)


class ProcedimientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Procedimiento (CU12: Registrar procedimientos en atención)
    """
    queryset = Procedimiento.objects.all()
    serializer_class = ProcedimientoSerializer
    
    @action(detail=False, methods=['get'])
    def por_atencion(self, request):
        """Lista procedimientos de una atención específica"""
        atencion_id = request.query_params.get('atencion_id')
        if not atencion_id:
            return Response({'error': 'Se requiere atencion_id'}, status=400)
        
        procedimientos = self.queryset.filter(id_atencion=atencion_id)
        serializer = self.get_serializer(procedimientos, many=True)
        return Response(serializer.data)


class OdontogramaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Odontograma (CU13: Actualizar odontograma)
    """
    queryset = Odontograma.objects.all()
    serializer_class = OdontogramaSerializer
    
    @action(detail=False, methods=['get'])
    def por_paciente(self, request):
        """Obtiene el odontograma más reciente de un paciente"""
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'error': 'Se requiere paciente_id'}, status=400)
        
        odontograma = self.queryset.filter(id_paciente=paciente_id).first()
        if not odontograma:
            return Response({'error': 'No se encontró odontograma para este paciente'}, status=404)
        
        serializer = self.get_serializer(odontograma)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def actualizar_pieza(self, request, pk=None):
        """Actualiza o crea una pieza dental en el odontograma"""
        odontograma = self.get_object()
        numero_pieza = request.data.get('numero_pieza')
        
        if not numero_pieza:
            return Response({'error': 'Se requiere numero_pieza'}, status=400)
        
        pieza, created = PiezaDental.objects.get_or_create(
            id_odontograma=odontograma,
            numero_pieza=numero_pieza,
            defaults={
                'estado': request.data.get('estado', 'sano'),
                'observaciones': request.data.get('observaciones', ''),
                'cara_vestibular': request.data.get('cara_vestibular', False),
                'cara_lingual': request.data.get('cara_lingual', False),
                'cara_mesial': request.data.get('cara_mesial', False),
                'cara_distal': request.data.get('cara_distal', False),
                'cara_oclusal': request.data.get('cara_oclusal', False),
            }
        )
        
        if not created:
            # Actualizar pieza existente
            for field in ['estado', 'observaciones', 'cara_vestibular', 'cara_lingual', 
                         'cara_mesial', 'cara_distal', 'cara_oclusal']:
                if field in request.data:
                    setattr(pieza, field, request.data[field])
            pieza.save()
        
        serializer = PiezaDentalSerializer(pieza)
        return Response(serializer.data)


class PiezaDentalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para PiezaDental
    """
    queryset = PiezaDental.objects.all()
    serializer_class = PiezaDentalSerializer


class TratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Tratamiento (CU15: Gestionar tratamientos)
    """
    queryset = Tratamiento.objects.all()
    serializer_class = TratamientoSerializer
    
    @action(detail=False, methods=['get'])
    def por_paciente(self, request):
        """Lista tratamientos de un paciente específico"""
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'error': 'Se requiere paciente_id'}, status=400)
        
        tratamientos = self.queryset.filter(id_paciente=paciente_id)
        serializer = self.get_serializer(tratamientos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Lista tratamientos en curso o planificados"""
        tratamientos = self.queryset.filter(estado__in=['planificado', 'en_curso'])
        serializer = self.get_serializer(tratamientos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def vincular_atencion(self, request, pk=None):
        """Vincula una atención a un tratamiento"""
        tratamiento = self.get_object()
        atencion_id = request.data.get('atencion_id')
        orden = request.data.get('orden', 1)
        
        if not atencion_id:
            return Response({'error': 'Se requiere atencion_id'}, status=400)
        
        vinculo, created = TratamientoAtencion.objects.get_or_create(
            id_tratamiento=tratamiento,
            id_atencion_id=atencion_id,
            defaults={'orden': orden, 'observaciones': request.data.get('observaciones', '')}
        )
        
        serializer = TratamientoAtencionSerializer(vinculo)
        return Response(serializer.data)
