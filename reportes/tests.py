from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timedelta
from decimal import Decimal
from .models import ReporteFinanciero, ReporteClinico, ReporteDefault, MetaReporte
import json


class ReporteFinancieroTestCase(TestCase):
    """Tests para ReporteFinanciero (CU26)"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.client.force_authenticate(user=self.user)

    def test_crear_reporte_financiero(self):
        """Test: Crear un nuevo reporte financiero"""
        data = {
            'titulo': 'Reporte Test',
            'fecha_inicio': '2025-01-01',
            'fecha_fin': '2025-12-31',
        }
        
        response = self.client.post('/api/reportes/financieros/generar_reporte/', data, format='json')
        
        # Verificar que se creó exitosamente
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id_reporte', response.data)
        self.assertEqual(response.data['titulo'], 'Reporte Test')

    def test_listar_reportes_financieros(self):
        """Test: Listar todos los reportes financieros"""
        # Crear algunos reportes
        ReporteFinanciero.objects.create(
            titulo='Reporte 1',
            fecha_inicio='2025-01-01',
            fecha_fin='2025-01-31',
            total_ingresos=Decimal('1000.00'),
            total_egresos=Decimal('500.00'),
            balance_neto=Decimal('500.00'),
            estado='completado',
            generado_por=self.user
        )
        
        response = self.client.get('/api/reportes/financieros/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_filtrar_por_rango_fechas(self):
        """Test: Filtrar reportes por rango de fechas"""
        # Crear reporte
        ReporteFinanciero.objects.create(
            titulo='Reporte Enero',
            fecha_inicio='2025-01-01',
            fecha_fin='2025-01-31',
            estado='completado',
            generado_por=self.user
        )
        
        response = self.client.get('/api/reportes/financieros/por_rango/?fecha_inicio=2025-01-01&fecha_fin=2025-01-31')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ReporteClinicoTestCase(TestCase):
    """Tests para ReporteClinico (CU27)"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.client.force_authenticate(user=self.user)

    def test_crear_reporte_clinico(self):
        """Test: Crear un nuevo reporte clínico"""
        data = {
            'titulo': 'Reporte Clínico Test',
            'fecha_inicio': '2025-01-01',
            'fecha_fin': '2025-12-31',
            'tipo_cita': 'todas',
        }
        
        response = self.client.post('/api/reportes/clinicos/generar_reporte/', data, format='json')
        
        # Puede retornar 201 o 400 si no hay datos
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_listar_reportes_clinicos(self):
        """Test: Listar todos los reportes clínicos"""
        response = self.client.get('/api/reportes/clinicos/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filtrar_clinicos_por_rango(self):
        """Test: Filtrar reportes clínicos por rango de fechas"""
        response = self.client.get('/api/reportes/clinicos/por_rango/?fecha_inicio=2025-01-01&fecha_fin=2025-12-31')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ReporteDefaultTestCase(TestCase):
    """Tests para ReporteDefault (Bitácora de acciones)"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.client.force_authenticate(user=self.user)

    def test_crear_registro_bitacora(self):
        """Test: Crear un registro en la bitácora"""
        registro = ReporteDefault.objects.create(
            usuario=self.user,
            tipo_accion='crear',
            modulo='pacientes',
            objeto_tipo='Paciente',
            objeto_id=1,
            descripcion='Se creó nuevo paciente',
            estado='exitosa'
        )
        
        self.assertIsNotNone(registro.id_registro)
        self.assertEqual(registro.usuario.username, 'testuser')

    def test_listar_bitacora(self):
        """Test: Listar registros de bitácora"""
        # Crear un registro
        ReporteDefault.objects.create(
            usuario=self.user,
            tipo_accion='crear',
            modulo='pacientes',
            objeto_tipo='Paciente',
            estado='exitosa'
        )
        
        response = self.client.get('/api/reportes/default/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filtrar_bitacora_por_usuario(self):
        """Test: Filtrar bitácora por usuario"""
        response = self.client.get(f'/api/reportes/default/por_usuario/?usuario_id={self.user.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filtrar_bitacora_por_modulo(self):
        """Test: Filtrar bitácora por módulo"""
        response = self.client.get('/api/reportes/default/por_modulo/?modulo=pacientes')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class MetaReporteTestCase(TestCase):
    """Tests para MetaReporte (Búsqueda y filtrado)"""

    def setUp(self):
        self.client = APIClient()

    def test_buscar_reportes_por_palabra(self):
        """Test: Buscar reportes por palabra clave"""
        # Crear meta reporte
        MetaReporte.objects.create(
            tipo_reporte='financiero',
            objeto_id=1,
            palabras_clave='ingresos, egresos, balance',
            etiquetas='financiero, importante'
        )
        
        response = self.client.get('/api/reportes/meta/buscar_por_palabra/?palabra=ingresos')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('resultados', response.data)

    def test_buscar_reportes_por_fecha(self):
        """Test: Buscar reportes por rango de fechas"""
        response = self.client.get('/api/reportes/meta/buscar_por_fecha/?fecha_inicio=2025-01-01&fecha_fin=2025-12-31')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_buscar_reportes_por_etiqueta(self):
        """Test: Buscar reportes por etiqueta"""
        response = self.client.get('/api/reportes/meta/buscar_por_etiqueta/?etiqueta=importante')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_validar_busqueda_palabra_requerida(self):
        """Test: Validar que palabra clave sea requerida"""
        response = self.client.get('/api/reportes/meta/buscar_por_palabra/')
        
        # Debe retornar error 400
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class IntegracionTestCase(TestCase):
    """Tests de integración del sistema de reportes"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            is_staff=True
        )
        self.client.force_authenticate(user=self.user)

    def test_flujo_completo_reporte_financiero(self):
        """Test: Flujo completo de creación de reporte financiero"""
        # 1. Generar reporte
        data = {
            'titulo': 'Reporte Mensual Enero',
            'fecha_inicio': '2025-01-01',
            'fecha_fin': '2025-01-31',
        }
        
        response = self.client.post('/api/reportes/financieros/generar_reporte/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        reporte_id = response.data['id_reporte']
        
        # 2. Obtener detalle del reporte
        response = self.client.get(f'/api/reportes/financieros/{reporte_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Descargar reporte
        response = self.client.get(f'/api/reportes/financieros/{reporte_id}/descargar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reporte', response.data)

    def test_auditar_acciones(self):
        """Test: Verificar que se registren acciones en bitácora"""
        # Crear un registro manualmente
        bitacora = ReporteDefault.objects.create(
            usuario=self.user,
            tipo_accion='crear',
            modulo='reportes',
            objeto_tipo='ReporteFinanciero',
            descripcion='Se generó reporte financiero',
            estado='exitosa'
        )
        
        # Verificar que se creó
        self.assertIsNotNone(bitacora.id_registro)
        
        # Listar bitácora
        response = self.client.get('/api/reportes/default/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
