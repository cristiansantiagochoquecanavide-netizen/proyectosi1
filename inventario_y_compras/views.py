from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import (
    Insumo, MovimientoInventario, OrdenCompra, DetalleOrdenCompra
)
from .serializers import (
    InsumoSerializer, MovimientoInventarioSerializer,
    OrdenCompraSerializer, DetalleOrdenCompraSerializer
)


class InsumoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Insumo (CU18: Gestionar insumos)
    """
    queryset = Insumo.objects.all()
    serializer_class = InsumoSerializer
    lookup_field = 'id_insumo'
    
    @action(detail=False, methods=['get'])
    def necesitan_reposicion(self, request):
        """Lista insumos que necesitan reposición (stock <= mínimo)"""
        insumos = [insumo for insumo in self.queryset.filter(estado='activo') 
                   if insumo.necesita_reposicion()]
        serializer = self.get_serializer(insumos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        """Lista insumos por categoría"""
        categoria = request.query_params.get('categoria')
        if not categoria:
            return Response({'error': 'Se requiere categoria'}, status=400)
        
        insumos = self.queryset.filter(categoria=categoria, estado='activo')
        serializer = self.get_serializer(insumos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        """Ajusta el stock de un insumo manualmente"""
        insumo = self.get_object()
        cantidad = request.data.get('cantidad')
        tipo_movimiento = request.data.get('tipo_movimiento', 'ajuste_positivo')
        motivo = request.data.get('motivo', '')
        
        if cantidad is None:
            return Response({'error': 'Se requiere cantidad'}, status=400)
        
        try:
            cantidad = float(cantidad)
            insumo.ajustar_stock(cantidad, tipo_movimiento)
            
            # Crear registro de movimiento
            MovimientoInventario.objects.create(
                id_insumo=insumo,
                tipo_movimiento=tipo_movimiento,
                cantidad=abs(cantidad),
                motivo=motivo,
                responsable_id=request.data.get('responsable_id')
            )
            
            return Response({
                'status': 'success',
                'message': f'Stock ajustado correctamente',
                'stock_actual': float(insumo.stock_actual)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para MovimientoInventario (CU19: Registrar consumo en atención)
    """
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    lookup_field = 'id_movimiento'
    
    @action(detail=False, methods=['get'])
    def por_insumo(self, request):
        """Lista movimientos de un insumo específico"""
        insumo_id = request.query_params.get('insumo_id')
        if not insumo_id:
            return Response({'error': 'Se requiere insumo_id'}, status=400)
        
        movimientos = self.queryset.filter(id_insumo=insumo_id)
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_atencion(self, request):
        """Lista consumos de insumos de una atención"""
        atencion_id = request.query_params.get('atencion_id')
        if not atencion_id:
            return Response({'error': 'Se requiere atencion_id'}, status=400)
        
        movimientos = self.queryset.filter(id_atencion=atencion_id, tipo_movimiento='consumo')
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def registrar_consumo(self, request):
        """Registra consumo de insumo en una atención (CU19)"""
        insumo_id = request.data.get('insumo_id')
        cantidad = request.data.get('cantidad')
        atencion_id = request.data.get('atencion_id')
        procedimiento_id = request.data.get('procedimiento_id')
        
        if not all([insumo_id, cantidad, atencion_id]):
            return Response({
                'error': 'Se requiere insumo_id, cantidad y atencion_id'
            }, status=400)
        
        try:
            movimiento = MovimientoInventario.objects.create(
                id_insumo_id=insumo_id,
                tipo_movimiento='consumo',
                cantidad=float(cantidad),
                id_atencion_id=atencion_id,
                id_procedimiento_id=procedimiento_id if procedimiento_id else None,
                motivo=request.data.get('motivo', 'Consumo en atención'),
                responsable_id=request.data.get('responsable_id')
            )
            
            serializer = self.get_serializer(movimiento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class OrdenCompraViewSet(viewsets.ModelViewSet):
    """
    ViewSet para OrdenCompra (CU18: Gestionar insumos - compras)
    """
    queryset = OrdenCompra.objects.all()
    serializer_class = OrdenCompraSerializer
    lookup_field = 'id_orden'
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Lista órdenes de compra pendientes"""
        ordenes = self.queryset.filter(estado__in=['borrador', 'enviada', 'confirmada'])
        serializer = self.get_serializer(ordenes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """Cambia el estado de una orden de compra"""
        orden = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if not nuevo_estado:
            return Response({'error': 'Se requiere estado'}, status=400)
        
        orden.estado = nuevo_estado
        
        if nuevo_estado == 'recibida' and not orden.fecha_entrega_real:
            orden.fecha_entrega_real = timezone.now().date()
        
        orden.save()
        
        serializer = self.get_serializer(orden)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def agregar_detalle(self, request, pk=None):
        """Agrega un detalle (línea) a la orden de compra"""
        orden = self.get_object()
        
        if orden.estado != 'borrador':
            return Response({
                'error': 'Solo se pueden agregar detalles a órdenes en borrador'
            }, status=400)
        
        detalle = DetalleOrdenCompra.objects.create(
            id_orden=orden,
            id_insumo_id=request.data.get('insumo_id'),
            cantidad=request.data.get('cantidad'),
            precio_unitario=request.data.get('precio_unitario')
        )
        
        # Recalcular totales
        detalles = orden.detalles.all()
        orden.subtotal = sum(d.subtotal for d in detalles)
        orden.total = orden.subtotal + orden.impuestos
        orden.save()
        
        serializer = DetalleOrdenCompraSerializer(detalle)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DetalleOrdenCompraViewSet(viewsets.ModelViewSet):
    """
    ViewSet para DetalleOrdenCompra
    """
    queryset = DetalleOrdenCompra.objects.all()
    serializer_class = DetalleOrdenCompraSerializer
    lookup_field = 'id_detalle'
