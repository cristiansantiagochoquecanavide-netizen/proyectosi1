#!/usr/bin/env python
"""
Script de prueba para validar el CU26 - Reporte Financiero
Uso: python test_reporte_financiero.py
"""

import os
import sys
import django
from datetime import date, timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from reportes.models import ReporteFinanciero
from facturacion_y_compras.models import Factura
from inventario_y_compras.models import MovimientoInventario
from decimal import Decimal


def test_crear_reporte_sin_datos():
    """Prueba: Generar reporte sin datos disponibles"""
    print("\n🧪 TEST 1: Generar reporte sin datos disponibles")
    print("-" * 60)
    
    try:
        reporte = ReporteFinanciero.objects.create(
            titulo="Reporte Test Sin Datos",
            fecha_inicio=date(2025, 1, 1),
            fecha_fin=date(2025, 1, 31)
        )
        print(f"✅ Reporte creado con ID: {reporte.id_reporte}")
        
        try:
            reporte.generar_reporte()
            print("❌ ERROR: Debería haber levantado excepción")
        except ValueError as e:
            print(f"✅ Excepción capturada correctamente: {e}")
            print(f"✅ Estado del reporte: {reporte.estado}")
            print(f"✅ Mensaje error: {reporte.mensaje_error}")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")


def test_modelo_reporte_financiero():
    """Prueba: Estructura del modelo"""
    print("\n🧪 TEST 2: Validar estructura del modelo ReporteFinanciero")
    print("-" * 60)
    
    try:
        reporte = ReporteFinanciero.objects.create(
            titulo="Test Modelo",
            fecha_inicio=date(2025, 1, 1),
            fecha_fin=date(2025, 1, 31)
        )
        
        print(f"✅ ID: {reporte.id_reporte}")
        print(f"✅ Título: {reporte.titulo}")
        print(f"✅ Fecha inicio: {reporte.fecha_inicio}")
        print(f"✅ Fecha fin: {reporte.fecha_fin}")
        print(f"✅ Total ingresos: Bs. {reporte.total_ingresos}")
        print(f"✅ Total egresos: Bs. {reporte.total_egresos}")
        print(f"✅ Balance neto: Bs. {reporte.balance_neto}")
        print(f"✅ Estado: {reporte.estado}")
        print(f"✅ Creado en: {reporte.created_at}")
        
        reporte.delete()
        print("✅ Reporte eliminado")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")


def test_calcular_balance():
    """Prueba: Cálculo de balance"""
    print("\n🧪 TEST 3: Validar cálculo de balance")
    print("-" * 60)
    
    try:
        reporte = ReporteFinanciero.objects.create(
            titulo="Test Balance",
            fecha_inicio=date(2025, 1, 1),
            fecha_fin=date(2025, 1, 31),
            total_ingresos=Decimal('5000.00'),
            total_egresos=Decimal('2000.00')
        )
        
        reporte.calcular_balance()
        
        print(f"✅ Ingresos: Bs. {reporte.total_ingresos}")
        print(f"✅ Egresos: Bs. {reporte.total_egresos}")
        print(f"✅ Balance calculado: Bs. {reporte.balance_neto}")
        
        if reporte.balance_neto == Decimal('3000.00'):
            print("✅ Cálculo correcto!")
        else:
            print(f"❌ Cálculo incorrecto. Esperado: 3000.00, Obtenido: {reporte.balance_neto}")
        
        reporte.delete()
        
    except Exception as e:
        print(f"❌ ERROR: {e}")


def test_queryset():
    """Prueba: Queryset y filtros"""
    print("\n🧪 TEST 4: Validar queryset y filtros")
    print("-" * 60)
    
    try:
        # Limpiar reportes previos de prueba
        ReporteFinanciero.objects.filter(titulo__startswith="Test").delete()
        
        # Crear varios reportes
        r1 = ReporteFinanciero.objects.create(
            titulo="Test Reporte 1",
            fecha_inicio=date(2025, 1, 1),
            fecha_fin=date(2025, 1, 31)
        )
        r2 = ReporteFinanciero.objects.create(
            titulo="Test Reporte 2",
            fecha_inicio=date(2025, 2, 1),
            fecha_fin=date(2025, 2, 28)
        )
        
        print(f"✅ Reportes creados: {ReporteFinanciero.objects.count()}")
        
        # Filtrar por rango de fechas
        filtrados = ReporteFinanciero.objects.filter(fecha_inicio__gte=date(2025, 1, 1))
        print(f"✅ Reportes desde 2025-01-01: {filtrados.count()}")
        
        # Ordenamiento
        ordered = ReporteFinanciero.objects.all().order_by('-fecha_creacion')
        print(f"✅ Reportes ordenados por fecha: {ordered.count()}")
        
        # Limpieza
        r1.delete()
        r2.delete()
        print("✅ Reportes de prueba eliminados")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")


def main():
    """Ejecuta todas las pruebas"""
    print("\n" + "="*60)
    print("🧪 PRUEBAS DEL CASO DE USO CU26 - REPORTE FINANCIERO")
    print("="*60)
    
    test_modelo_reporte_financiero()
    test_calcular_balance()
    test_crear_reporte_sin_datos()
    test_queryset()
    
    print("\n" + "="*60)
    print("✅ TODAS LAS PRUEBAS COMPLETADAS")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
