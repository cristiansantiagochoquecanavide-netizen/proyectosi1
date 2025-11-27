from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from datetime import datetime
from decimal import Decimal
from .models import ReporteFinanciero, ReporteClinico, ReporteDefault, MetaReporte
from .serializers import (
    ReporteFinancieroSerializer,
    ReporteClinicoSerializer,
    ReporteDefaultSerializer,
    MetaReporteSerializer
)
from .auditoria import registrar_accion
from seguridad_y_personal.models import Usuario


class ReporteFinancieroViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ReporteFinanciero (CU26: Reporte financiero)
    
    Permite al administrador generar reportes de ingresos, egresos y balances económicos.
    """
    queryset = ReporteFinanciero.objects.all()
    serializer_class = ReporteFinancieroSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'estado']
    ordering_fields = ['fecha_creacion', 'fecha_inicio', 'fecha_fin', 'balance_neto']
    ordering = ['-fecha_creacion']
    
    def _get_client_ip(self, request):
        """Obtiene la IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=False, methods=['post'])
    def generar_reporte(self, request):
        """
        Genera un nuevo reporte financiero para un rango de fechas específico.
        
        Body esperado:
        {
            "fecha_inicio": "2025-01-01",
            "fecha_fin": "2025-12-31",
            "titulo": "Reporte 2025" (opcional)
        }
        """
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        titulo = request.data.get('titulo', "Reporte Financiero")
        
        # Validar que se proporcionen las fechas
        if not fecha_inicio or not fecha_fin:
            return Response(
                {'error': 'Se requieren fecha_inicio y fecha_fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convertir strings a datetime.date si es necesario
            if isinstance(fecha_inicio, str):
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            if isinstance(fecha_fin, str):
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            
            # Validar que fecha_fin sea mayor que fecha_inicio
            if fecha_fin < fecha_inicio:
                return Response(
                    {'error': 'fecha_fin debe ser mayor o igual a fecha_inicio'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear reporte
            reporte = ReporteFinanciero.objects.create(
                titulo=titulo,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                generado_por=request.user if request.user.is_authenticated else None
            )
            
            # Generar datos del reporte
            try:
                reporte.generar_reporte()
                serializer = self.get_serializer(reporte)
                
                # Registrar en bitácora
                try:
                    usuario = None
                    if request.user and request.user.is_authenticated:
                        usuario = Usuario.objects.filter(user=request.user).first()
                    
                    registrar_accion(
                        usuario=usuario,
                        tipo_accion='crear',
                        modulo='reportes',
                        objeto_tipo='ReporteFinanciero',
                        objeto_id=reporte.id_reporte,
                        descripcion=f'Se generó reporte financiero: {titulo}',
                        datos_nuevos={'titulo': titulo, 'fecha_inicio': str(fecha_inicio), 'fecha_fin': str(fecha_fin)},
                        estado='exitosa',
                        direccion_ip=self._get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                except Exception as audit_error:
                    pass  # No romper si falla la auditoría
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            except ValueError as e:
                # No hay datos disponibles para el periodo
                serializer = self.get_serializer(reporte)
                
                # Registrar error en bitácora
                try:
                    usuario = None
                    if request.user and request.user.is_authenticated:
                        usuario = Usuario.objects.filter(user=request.user).first()
                    
                    registrar_accion(
                        usuario=usuario,
                        tipo_accion='crear',
                        modulo='reportes',
                        objeto_tipo='ReporteFinanciero',
                        descripcion=f'Intento de generar reporte sin datos',
                        estado='advertencia',
                        mensaje_error=str(e),
                        direccion_ip=self._get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )
                except Exception as audit_error:
                    pass
                
                return Response(
                    {
                        'warning': str(e),
                        'reporte': serializer.data
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except Exception as e:
            return Response(
                {'error': f'Error al generar reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        """
        Endpoint para descargar el reporte en formato JSON.
        Util para posterior exportación a CSV o PDF.
        """
        reporte = self.get_object()
        serializer = self.get_serializer(reporte)
        
        return Response(
            {
                'reporte': serializer.data,
                'formato': 'json',
                'timestamp': timezone.now()
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def por_rango(self, request):
        """
        Filtra reportes por rango de fechas.
        
        Parámetros query:
        - fecha_inicio: YYYY-MM-DD
        - fecha_fin: YYYY-MM-DD
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.queryset
        
        if fecha_inicio:
            queryset = queryset.filter(fecha_inicio__gte=fecha_inicio)
        
        if fecha_fin:
            queryset = queryset.filter(fecha_fin__lte=fecha_fin)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReporteClinicoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ReporteClinico (CU27: Reporte clínico y de citas)
    
    Permite a administrador y odontólogo obtener estadísticas sobre atenciones y actividad clínica.
    """
    queryset = ReporteClinico.objects.all()
    serializer_class = ReporteClinicoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'estado', 'id_odontologo__nombre']
    ordering_fields = ['fecha_creacion', 'fecha_inicio', 'fecha_fin', 'total_atenciones']
    ordering = ['-fecha_creacion']
    
    @action(detail=False, methods=['post'])
    def generar_reporte(self, request):
        """
        Genera un nuevo reporte clínico para un rango de fechas y filtros específicos.
        
        Body esperado:
        {
            "fecha_inicio": "2025-01-01",
            "fecha_fin": "2025-12-31",
            "id_odontologo": 1 (opcional),
            "tipo_cita": "consulta" (opcional),
            "titulo": "Reporte Clínico 2025" (opcional)
        }
        """
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        id_odontologo = request.data.get('id_odontologo')
        tipo_cita = request.data.get('tipo_cita', 'todas')
        titulo = request.data.get('titulo', "Reporte Clínico")
        
        if not fecha_inicio or not fecha_fin:
            return Response(
                {'error': 'Se requieren fecha_inicio y fecha_fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if isinstance(fecha_inicio, str):
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            if isinstance(fecha_fin, str):
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            
            if fecha_fin < fecha_inicio:
                return Response(
                    {'error': 'fecha_fin debe ser mayor o igual a fecha_inicio'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            reporte = ReporteClinico.objects.create(
                titulo=titulo,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                id_odontologo_id=id_odontologo,
                tipo_cita=tipo_cita,
                generado_por=request.user if request.user.is_authenticated else None
            )
            
            try:
                reporte.generar_reporte()
                serializer = self.get_serializer(reporte)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            except ValueError as e:
                serializer = self.get_serializer(reporte)
                return Response(
                    {
                        'warning': str(e),
                        'reporte': serializer.data
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except Exception as e:
            return Response(
                {'error': f'Error al generar reporte clínico: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def exportar(self, request, pk=None):
        """
        Exporta el reporte clínico con todos sus datos.
        """
        reporte = self.get_object()
        serializer = self.get_serializer(reporte)
        
        return Response(
            {
                'reporte': serializer.data,
                'formato': 'json',
                'timestamp': timezone.now()
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def por_rango(self, request):
        """
        Filtra reportes clínicos por rango de fechas y filtros adicionales.
        
        Parámetros query:
        - fecha_inicio: YYYY-MM-DD
        - fecha_fin: YYYY-MM-DD
        - id_odontologo: integer (opcional)
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        id_odontologo = request.query_params.get('id_odontologo')
        
        queryset = self.queryset
        
        if fecha_inicio:
            queryset = queryset.filter(fecha_inicio__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_fin__lte=fecha_fin)
        if id_odontologo:
            queryset = queryset.filter(id_odontologo_id=id_odontologo)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReporteDefaultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ReporteDefault (Bitácora de acciones)
    
    Sistema de auditoría que registra todas las acciones de los usuarios en el sistema.
    Read-only: Los registros no se pueden modificar o eliminar, solo ver.
    """
    queryset = ReporteDefault.objects.all()
    serializer_class = ReporteDefaultSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['usuario__username', 'modulo', 'tipo_accion', 'descripcion']
    ordering_fields = ['fecha_hora', 'usuario', 'tipo_accion', 'modulo']
    ordering = ['-fecha_hora']
    
    @action(detail=False, methods=['get'])
    def por_usuario(self, request):
        """
        Filtra registros de auditoría por usuario.
        
        Parámetros query:
        - usuario_id: integer
        - dias: cantidad de días atrás (default: 30)
        """
        usuario_id = request.query_params.get('usuario_id')
        dias = request.query_params.get('dias', 30)
        
        queryset = self.queryset
        
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
        
        # Filtrar últimos N días
        from datetime import timedelta
        fecha_limite = timezone.now() - timedelta(days=int(dias))
        queryset = queryset.filter(fecha_hora__gte=fecha_limite)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def por_modulo(self, request):
        """
        Filtra registros por módulo.
        
        Parámetros query:
        - modulo: nombre del módulo
        - tipo_accion: tipo de acción (opcional)
        """
        modulo = request.query_params.get('modulo')
        tipo_accion = request.query_params.get('tipo_accion')
        
        queryset = self.queryset
        
        if modulo:
            queryset = queryset.filter(modulo=modulo)
        if tipo_accion:
            queryset = queryset.filter(tipo_accion=tipo_accion)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def por_fecha(self, request):
        """
        Filtra registros por rango de fechas.
        
        Parámetros query:
        - fecha_inicio: YYYY-MM-DD HH:MM:SS
        - fecha_fin: YYYY-MM-DD HH:MM:SS
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.queryset
        
        if fecha_inicio:
            queryset = queryset.filter(fecha_hora__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_hora__lte=fecha_fin)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MetaReporteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para MetaReporte (Búsqueda y filtrado de reportes)
    
    Permite búsqueda avanzada y filtrado de reportes por palabras clave, etiquetas, fechas, etc.
    """
    queryset = MetaReporte.objects.all()
    serializer_class = MetaReporteSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['palabras_clave', 'etiquetas', 'descripcion_indexada', 'tipo_reporte']
    ordering_fields = ['created_at', 'fecha_inicio', 'fecha_fin']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def buscar_por_palabra(self, request):
        """
        Búsqueda de reportes por palabras clave.
        
        Parámetros query:
        - palabra: término a buscar
        - tipo_reporte: filtro por tipo (opcional)
        """
        palabra = request.query_params.get('palabra', '').strip()
        tipo_reporte = request.query_params.get('tipo_reporte')
        
        if not palabra:
            return Response(
                {'error': 'Parámetro "palabra" es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.queryset.filter(
            Q(palabras_clave__icontains=palabra) |
            Q(descripcion_indexada__icontains=palabra) |
            Q(etiquetas__icontains=palabra)
        )
        
        if tipo_reporte:
            queryset = queryset.filter(tipo_reporte=tipo_reporte)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'resultados': len(queryset),
            'datos': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def buscar_por_fecha(self, request):
        """
        Búsqueda de reportes por rango de fechas.
        
        Parámetros query:
        - fecha_inicio: YYYY-MM-DD
        - fecha_fin: YYYY-MM-DD
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.queryset
        
        if fecha_inicio:
            queryset = queryset.filter(fecha_inicio__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_fin__lte=fecha_fin)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'resultados': len(queryset),
            'datos': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def buscar_por_etiqueta(self, request):
        """
        Búsqueda de reportes por etiquetas.
        
        Parámetros query:
        - etiqueta: etiqueta a buscar
        """
        etiqueta = request.query_params.get('etiqueta', '').strip()
        
        if not etiqueta:
            return Response(
                {'error': 'Parámetro "etiqueta" es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.queryset.filter(etiquetas__icontains=etiqueta)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'resultados': len(queryset),
            'datos': serializer.data
        }, status=status.HTTP_200_OK)


