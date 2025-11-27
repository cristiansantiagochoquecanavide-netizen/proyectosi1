# Caso de Uso: Evaluación de Satisfacción del Cliente

## 1. Descripción General
Este caso de uso permite que el odontólogo registre el nivel de satisfacción del cliente después de una cita, mediante una escala de 5 niveles. El cliente expresa su nivel de satisfacción dentro de la sesión del odontólogo, sin crear nuevos usuarios ni clases en el sistema.

---

## 2. Actores
- **Odontólogo**: Actor principal que gestiona la evaluación de satisfacción del cliente durante o después de la cita.
- **Cliente/Paciente**: Actor secundario que expresa su nivel de satisfacción seleccionando una opción en la escala proporcionada por el odontólogo.

---

## 3. Objetivo
Capturar y registrar el nivel de satisfacción del cliente respecto a la atención recibida en una cita odontológica, mediante una escala de 5 niveles, para mejorar la calidad del servicio y obtener retroalimentación del paciente.

---

## 4. Precondiciones
1. Una cita debe existir en el sistema y estar asociada a un paciente específico.
2. La cita debe estar finalizada o en estado "completada".
3. El odontólogo debe estar autenticado en el sistema.
4. El odontólogo debe tener permisos para registrar evaluaciones de satisfacción.
5. La cita debe tener una referencia al paciente.

---

## 5. Flujo Básico

### 5.1 Pasos principales:

1. **El odontólogo accede a la cita** desde el módulo de Citas o Reportes Clínicos.

2. **El odontólogo selecciona la opción "Registrar Satisfacción del Cliente"** (botón o acción en la interfaz de cita).

3. **Se muestra la escala de satisfacción** con 5 niveles:
   - **Nivel 1**: Muy Baja Satisfacción (insatisfecho)
   - **Nivel 2**: Baja Satisfacción 
   - **Nivel 3**: Satisfacción Media
   - **Nivel 4**: Alta Satisfacción
   - **Nivel 5**: Muy Alta Satisfacción (muy satisfecho)

4. **El odontólogo presenta las opciones al cliente** dentro de su sesión (verbalmente o mediante dispositivo compartido).

5. **El cliente selecciona el nivel de satisfacción** que considera apropiado (el odontólogo realiza la selección en nombre del cliente en la interfaz).

6. **El odontólogo confirma la selección** del cliente.

7. **El sistema registra** la evaluación de satisfacción asociada a la cita con:
   - ID de la Cita
   - Nivel de Satisfacción (1-5)
   - Fecha y hora de registro
   - Odontólogo que registró la evaluación

8. **El sistema muestra un mensaje de confirmación**: "Evaluación de satisfacción registrada exitosamente".

9. **El caso de uso finaliza**.

---

## 6. Flujos Alternos

### 6.1 Flujo Alterno A: Cita no finalizada
**Condición**: El odontólogo intenta registrar satisfacción en una cita que aún no está finalizada.

1. El sistema valida el estado de la cita.
2. El sistema muestra un mensaje de error: "La cita debe estar finalizada para registrar la satisfacción del cliente".
3. El sistema impide que se continúe con el registro.
4. El caso de uso finaliza sin registrar.

### 6.2 Flujo Alterno B: Cliente no desea evaluar
**Condición**: El cliente rechaza participar en la evaluación de satisfacción.

1. El odontólogo intenta registrar la satisfacción.
2. El cliente indica que no desea evaluar.
3. El odontólogo puede seleccionar una opción "Sin evaluación" o simplemente cancelar la operación.
4. El sistema registra que la cita no tiene evaluación de satisfacción.
5. El caso de uso finaliza sin registrar puntuación.

### 6.3 Flujo Alterno C: Error en la transmisión de datos
**Condición**: El sistema no puede guardar la evaluación debido a un error de conexión o base de datos.

1. El odontólogo selecciona el nivel de satisfacción y confirma.
2. El sistema intenta guardar la evaluación.
3. El sistema detecta un error de conexión o base de datos.
4. El sistema muestra el mensaje: "No se pudo registrar la evaluación. Por favor, intente nuevamente".
5. El odontólogo puede reintentar la operación.
6. El caso de uso finaliza sin registrar exitosamente.

### 6.4 Flujo Alterno D: Modificación de evaluación existente
**Condición**: La cita ya tiene una evaluación de satisfacción registrada.

1. El odontólogo accede a la opción de "Registrar Satisfacción" en una cita con evaluación previa.
2. El sistema detecta que ya existe una evaluación.
3. El sistema muestra un diálogo confirmando: "Esta cita ya tiene una evaluación. ¿Desea reemplazarla?".
4. Si el odontólogo confirma:
   - Se reemplaza la evaluación anterior con la nueva.
   - Se registra la fecha y hora de actualización.
   - Se muestra mensaje: "Evaluación actualizada exitosamente".
5. Si el odontólogo cancela:
   - La evaluación anterior se mantiene sin cambios.
   - El caso de uso finaliza.

---

## 7. Postcondiciones

### 7.1 Éxito
- La evaluación de satisfacción del cliente se registra correctamente en el sistema.
- La evaluación está asociada a la cita específica.
- El registro incluye: nivel (1-5), fecha, hora y odontólogo responsable.
- La información está disponible para consultas de reportes y análisis de satisfacción.
- Se muestra confirmación visual al odontólogo.

### 7.2 Fallo
- La evaluación no se registra.
- El sistema mantiene el estado anterior de la cita.
- Se muestra un mensaje de error al odontólogo.
- No hay cambios en la base de datos.

---

## 8. Requisitos No Funcionales

- **Seguridad**: Solo odontólogos autenticados pueden registrar evaluaciones.
- **Integridad**: Las evaluaciones no pueden ser duplicadas en la misma cita sin confirmación.
- **Usabilidad**: La interfaz debe ser simple e intuitiva para permitir rápido registro.
- **Performance**: El registro debe completarse en menos de 2 segundos.
- **Auditoria**: Todos los registros de satisfacción deben ser rastreables (fecha, hora, odontólogo).

---

## 9. Notas de Implementación

- **Ubicación del código**: Módulo `citas`
- **Datos a almacenar**: 
  - `id_cita` (FK a Cita)
  - `nivel_satisfaccion` (INT: 1-5)
  - `fecha_registro` (DateTime)
  - `id_odontologo` (FK a Odontólogo)
  - `observaciones_opcionales` (TextField, opcional)

- **Interfaz**: 
  - Botón "Registrar Satisfacción" en la vista de detalles de cita
  - Modal o panel con 5 opciones de selección (radio buttons o botones estilizados)
  - Iconos o colores que representen cada nivel (rojo para insatisfecho, verde para muy satisfecho)

- **Validaciones**:
  - Cita debe estar en estado finalizado
  - Nivel debe estar entre 1 y 5
  - Odontólogo debe tener permisos de escritura

- **Reportes**: Permitir análisis de satisfacción por:
  - Odontólogo
  - Rango de fechas
  - Nivel de satisfacción
  - Promedio de satisfacción

---

## 10. Diagrama de Actividades (Descripción Textual)

```
INICIO
  ↓
Odontólogo accede a cita
  ↓
¿Cita finalizada? → NO → Mostrar error → FIN
  ↓ SÍ
Mostrar escala de satisfacción (1-5)
  ↓
¿Cliente desea evaluar? → NO → Registrar sin evaluación → FIN
  ↓ SÍ
Cliente selecciona nivel (1-5)
  ↓
Odontólogo confirma selección
  ↓
¿Validación exitosa? → NO → Mostrar error → FIN
  ↓ SÍ
Registrar en base de datos
  ↓
¿Registro exitoso? → NO → Mostrar error → FIN
  ↓ SÍ
Mostrar mensaje de confirmación
  ↓
FIN
```

---

## 11. Ejemplo de Flujo de Pantalla

### Pantalla 1: Vista de Cita
```
┌─────────────────────────────────────┐
│ DETALLES DE CITA                    │
├─────────────────────────────────────┤
│ ID Cita: #1234                      │
│ Paciente: Juan Pérez                │
│ Odontólogo: Dr. López               │
│ Fecha: 27/11/2025                   │
│ Estado: Finalizada                  │
│                                     │
│ [Registrar Satisfacción del Cliente]│
└─────────────────────────────────────┘
```

### Pantalla 2: Modal de Evaluación de Satisfacción
```
┌─────────────────────────────────────────┐
│ EVALUACIÓN DE SATISFACCIÓN DEL CLIENTE  │
├─────────────────────────────────────────┤
│ ¿Cuál es su nivel de satisfacción?      │
│                                         │
│ ☐ Muy Baja Satisfacción      😞 (1)    │
│ ☐ Baja Satisfacción           😕 (2)    │
│ ☐ Satisfacción Media           😐 (3)    │
│ ☐ Alta Satisfacción            😊 (4)    │
│ ☐ Muy Alta Satisfacción        😄 (5)    │
│                                         │
│ [Confirmar]  [Cancelar]               │
└─────────────────────────────────────────┘
```

### Pantalla 3: Confirmación
```
┌─────────────────────────────────────┐
│ ✓ ÉXITO                             │
├─────────────────────────────────────┤
│ Evaluación de satisfacción          │
│ registrada exitosamente             │
│                                     │
│ Nivel: Alta Satisfacción (4)        │
│ Fecha: 27/11/2025 14:35             │
│                                     │
│ [Cerrar]                            │
└─────────────────────────────────────┘
```

---

## 12. Relación con el Módulo de Citas

Este caso de uso se integra con el módulo `citas` de la siguiente manera:

- **Extensión de la entidad Cita**: Se añade la capacidad de almacenar una evaluación de satisfacción sin crear nuevas entidades principales.
- **Nuevo campo en Cita**: Referencia a la evaluación de satisfacción (opcional).
- **Nuevo endpoint REST**: `POST /citas/api/citas/{id}/satisfaccion/` para registrar la evaluación.
- **Actualización de vistas**: Agregar botón y modal en la interfaz de detalles de cita.
- **Reportes**: Incluir análisis de satisfacción en reportes de citas.

---

**Documento generado**: 27 de Noviembre de 2025  
**Versión**: 1.0  
**Estado**: Aprobado para implementación
