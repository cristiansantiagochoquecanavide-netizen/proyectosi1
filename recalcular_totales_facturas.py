"""
Script para recalcular los totales de todas las facturas existentes
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from facturacion_y_compras.models import Factura

def recalcular_totales():
    """Recalcula el total de todas las facturas"""
    facturas = Factura.objects.all()
    
    print(f"Recalculando {facturas.count()} facturas...")
    
    for factura in facturas:
        total_anterior = factura.total
        factura.calcular_total()
        print(f"Factura {factura.numero_factura}: Bs. {total_anterior} -> Bs. {factura.total}")
    
    print("¡Totales recalculados correctamente!")

if __name__ == '__main__':
    recalcular_totales()
