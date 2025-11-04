# Recalcular Totales de Facturas

## Problema
Las facturas creadas antes de la corrección de tipos Decimal pueden tener el total en 0.00 aunque tengan detalles.

## Soluciones

### 1. En desarrollo local (ya ejecutado)
```bash
python recalcular_totales_facturas.py
```

### 2. En producción (Render)

#### Opción A: Desde la API (Recomendado)
Hacer una petición POST al endpoint:
```
POST https://tu-backend.onrender.com/api/facturacion/facturas/recalcular_todos/
```

Headers:
```
Authorization: Token <tu-token-de-autenticacion>
Content-Type: application/json
```

Puedes hacerlo desde el navegador con fetch:
```javascript
fetch('https://tu-backend.onrender.com/api/facturacion/facturas/recalcular_todos/', {
  method: 'POST',
  headers: {
    'Authorization': 'Token ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

#### Opción B: Recalcular una factura específica
```
POST https://tu-backend.onrender.com/api/facturacion/facturas/{id_factura}/recalcular_total/
```

### 3. En producción (Render Shell)
```bash
python manage.py shell
```

Luego:
```python
from facturacion_y_compras.models import Factura

for factura in Factura.objects.all():
    factura.calcular_total()
    print(f"{factura.numero_factura}: Bs. {factura.total}")
```

## Verificación
Después de recalcular, verifica que:
1. Las facturas en la lista muestren el total correcto
2. El total coincida con la suma de los detalles
3. No haya facturas con total en 0.00 (a menos que no tengan detalles)

## Prevención
Los siguientes cambios ya previenen este problema en el futuro:
- ✅ Conversión explícita a Decimal en DetalleFactura
- ✅ Cálculo explícito del subtotal antes de guardar
- ✅ Conversión a Decimal en el método calcular_total()
- ✅ refresh_from_db() después de calcular el total
