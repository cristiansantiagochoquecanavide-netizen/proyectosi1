from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal
from .models import (
    Factura, DetalleFactura, Pago, Recibo
)
from .serializers import (
    FacturaSerializer, DetalleFacturaSerializer, PagoSerializer, ReciboSerializer
)
from seguridad_y_personal.models import Usuario


class FacturaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Factura (CU14: Cerrar atención y emitir comprobante)
    """
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    
    def _generar_numero_factura(self):
        """Obtiene el siguiente correlativo de factura usando el prefijo FAC-."""
        ultima_factura = Factura.objects.order_by('-id_factura').first()
        if not ultima_factura:
            return "FAC-000001"
        try:
            ultimo_numero = int(str(ultima_factura.numero_factura).split('-')[1])
        except (IndexError, ValueError):
            ultimo_numero = ultima_factura.id_factura
        return f"FAC-{ultimo_numero + 1:06d}"

    def create(self, request, *args, **kwargs):
        """Crea facturas manuales generando número y permitiendo atenciones opcionales."""
        data = request.data.copy()
        data.setdefault('numero_factura', self._generar_numero_factura())
        data.setdefault('estado', 'emitida')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Asegurar totales coherentes incluso si viene sin detalles
        serializer.instance.calcular_total()
        serializer.instance.refresh_from_db()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'])
    def generar_desde_atencion(self, request):
        """Genera una factura automáticamente desde una atención"""
        atencion_id = request.data.get('atencion_id')
        
        if not atencion_id:
            return Response({'error': 'Se requiere atencion_id'}, status=400)
        
        try:
            from atencion.models import Atencion
            atencion = Atencion.objects.get(id_atencion=atencion_id)
            
            # Verificar si ya existe una factura para esta atención
            try:
                factura_existente = Factura.objects.get(id_atencion=atencion)
                serializer = self.get_serializer(factura_existente)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Factura.DoesNotExist:
                pass  # No existe, continuar con la creación
            
            # Crear factura
            factura = Factura.objects.create(
                numero_factura=self._generar_numero_factura(),
                id_atencion=atencion,
                id_paciente=atencion.id_paciente,
                estado='emitida',
                emitida_por_id=request.data.get('emitida_por_id')
            )
            
            # Agregar procedimientos como detalles
            for procedimiento in atencion.procedimientos.all():
                cantidad = Decimal('1')
                precio_unitario = Decimal(str(procedimiento.costo))
                subtotal = cantidad * precio_unitario
                
                DetalleFactura.objects.create(
                    id_factura=factura,
                    concepto=procedimiento.nombre,
                    cantidad=cantidad,
                    precio_unitario=precio_unitario,
                    subtotal=subtotal,
                    id_procedimiento=procedimiento
                )
            
            # Calcular total
            factura.calcular_total()
            
            # Refrescar factura desde la base de datos para obtener valores actualizados
            factura.refresh_from_db()
            
            serializer = self.get_serializer(factura)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def recalcular_total(self, request, pk=None):
        """Recalcula el total de una factura específica"""
        try:
            factura = self.get_object()
            factura.calcular_total()
            factura.refresh_from_db()
            serializer = self.get_serializer(factura)
            return Response({
                'message': 'Total recalculado correctamente',
                'factura': serializer.data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['post'])
    def recalcular_todos(self, request):
        """Recalcula el total de todas las facturas"""
        try:
            facturas = Factura.objects.all()
            count = 0
            for factura in facturas:
                factura.calcular_total()
                count += 1
            return Response({
                'message': f'{count} facturas recalculadas correctamente'
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['get'])
    def historial_comprobantes_pagos(self, request):
        """
        CU16 nuevo: Consultar comprobantes y pagos (backoffice)
        Filtros soportados:
        - fecha_desde, fecha_hasta (rango sobre fecha_emision)
        - paciente_id
        - estado (estado de la factura)

        Devuelve facturas filtradas y totales agregados.
        """
        qs = self.queryset.select_related('id_paciente')

        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        paciente_id = request.query_params.get('paciente_id')
        estado = request.query_params.get('estado')

        if fecha_desde:
            qs = qs.filter(fecha_emision__date__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha_emision__date__lte=fecha_hasta)
        if paciente_id:
            qs = qs.filter(id_paciente=paciente_id)
        if estado:
            qs = qs.filter(estado=estado)

        facturas_serializadas = self.get_serializer(qs, many=True).data

        # Totales agregados
        agregados = qs.aggregate(
            total_facturado=Coalesce(Sum('total'), Decimal('0.00')),
            total_saldo_pendiente=Coalesce(Sum('saldo_pendiente'), Decimal('0.00')),
        )

        # Total pagado = total_facturado - saldo_pendiente
        total_facturado = Decimal(str(agregados['total_facturado']))
        total_saldo_pendiente = Decimal(str(agregados['total_saldo_pendiente']))
        total_pagado = total_facturado - total_saldo_pendiente

        return Response({
            'resultados': facturas_serializadas,
            'totales': {
                'total_facturado': str(total_facturado),
                'total_pagado': str(total_pagado),
                'total_saldo_pendiente': str(total_saldo_pendiente),
                'cantidad_comprobantes': qs.count(),
            }
        })
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Lista facturas pendientes de pago"""
        facturas = self.queryset.filter(estado__in=['emitida', 'pagada_parcial'])
        serializer = self.get_serializer(facturas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_paciente(self, request):
        """Lista facturas de un paciente"""
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'error': 'Se requiere paciente_id'}, status=400)
        
        facturas = self.queryset.filter(id_paciente=paciente_id)
        serializer = self.get_serializer(facturas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def agregar_detalle(self, request, pk=None):
        """Agrega un detalle a la factura"""
        factura = self.get_object()
        
        if factura.estado not in ['borrador', 'emitida']:
            return Response({
                'error': 'No se pueden agregar detalles a esta factura'
            }, status=400)
        
        detalle = DetalleFactura.objects.create(
            id_factura=factura,
            concepto=request.data.get('concepto'),
            cantidad=request.data.get('cantidad', 1),
            precio_unitario=request.data.get('precio_unitario')
        )
        
        # Recalcular total
        factura.calcular_total()
        
        serializer = DetalleFacturaSerializer(detalle)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DetalleFacturaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para DetalleFactura
    """
    queryset = DetalleFactura.objects.all()
    serializer_class = DetalleFacturaSerializer


class PagoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Pago
    """
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer
    
    @action(detail=False, methods=['post'])
    def registrar(self, request):
        """Registra un pago para una factura"""
        factura_id = request.data.get('factura_id')
        monto = request.data.get('monto')
        metodo_pago = request.data.get('metodo_pago')
        
        if not all([factura_id, monto, metodo_pago]):
            return Response({
                'error': 'Se requiere factura_id, monto y metodo_pago'
            }, status=400)
        
        try:
            factura = Factura.objects.get(id_factura=factura_id)
            
            # Validar monto
            monto_decimal = Decimal(str(monto))
            if monto_decimal > factura.saldo_pendiente:
                return Response({
                    'error': 'El monto excede el saldo pendiente'
                }, status=400)
            
            # Crear pago
            pago = Pago.objects.create(
                id_factura=factura,
                monto=monto_decimal,
                metodo_pago=metodo_pago,
                numero_referencia=request.data.get('numero_referencia', ''),
                observaciones=request.data.get('observaciones', ''),
                recibido_por_id=request.data.get('recibido_por_id')
            )
            
            # Generar recibo
            ultima_recibo = Recibo.objects.order_by('-id_recibo').first()
            numero = 1 if not ultima_recibo else int(ultima_recibo.numero_recibo.split('-')[1]) + 1
            numero_recibo = f"REC-{numero:06d}"
            
            Recibo.objects.create(
                numero_recibo=numero_recibo,
                id_pago=pago,
                id_paciente=factura.id_paciente
            )
            
            serializer = self.get_serializer(pago)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Factura.DoesNotExist:
            return Response({'error': 'Factura no encontrada'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['get'])
    def por_factura(self, request):
        """Lista pagos de una factura"""
        factura_id = request.query_params.get('factura_id')
        if not factura_id:
            return Response({'error': 'Se requiere factura_id'}, status=400)
        
        pagos = self.queryset.filter(id_factura=factura_id)
        serializer = self.get_serializer(pagos, many=True)
        return Response(serializer.data)


class ReciboViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Recibo
    """
    queryset = Recibo.objects.all()
    serializer_class = ReciboSerializer
    
    @action(detail=False, methods=['get'])
    def por_paciente(self, request):
        """Lista recibos de un paciente"""
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'error': 'Se requiere paciente_id'}, status=400)
        
        recibos = self.queryset.filter(id_paciente=paciente_id)
        serializer = self.get_serializer(recibos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mis_comprobantes(self, request):
        """
        CU17: Mis comprobantes y pagos (paciente)
        Usa la sesión de seguridad_y_personal para obtener el usuario actual
        y devuelve todos los recibos asociados a su paciente, si existe.
        """
        user_id = request.session.get('usuario_id')
        if not user_id:
            return Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            usuario = Usuario.objects.get(pk=user_id)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado'}, status=status.HTTP_401_UNAUTHORIZED)

        # Buscamos paciente por correo (asumiendo que el correo coincide)
        from pacientes.models import Paciente
        paciente = Paciente.objects.filter(email__iexact=usuario.correo).first()
        if not paciente:
            # Si no hay paciente vinculado, devolver lista vacía (no es error de servidor)
            return Response([], status=status.HTTP_200_OK)

        recibos = self.queryset.filter(id_paciente=paciente)
        serializer = self.get_serializer(recibos, many=True)
        return Response(serializer.data)
