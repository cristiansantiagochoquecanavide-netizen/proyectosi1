from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from .models import (
    Factura, DetalleFactura, Pago, Recibo
)
from .serializers import (
    FacturaSerializer, DetalleFacturaSerializer, PagoSerializer, ReciboSerializer
)


class FacturaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Factura (CU14: Cerrar atención y emitir comprobante)
    """
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer
    
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
            
            # Generar número de factura
            ultima_factura = Factura.objects.order_by('-id_factura').first()
            numero = 1 if not ultima_factura else int(ultima_factura.numero_factura.split('-')[1]) + 1
            numero_factura = f"FAC-{numero:06d}"
            
            # Crear factura
            factura = Factura.objects.create(
                numero_factura=numero_factura,
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
