# Módulo de Alertas, Notificaciones y Seguimiento - SIAR

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Sistema:** Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR)  
**Contexto:** Backend JAVA para empresa de seguros regulada en Venezuela

---

## 1. VISIÓN GENERAL DEL MÓDULO

### 1.1 Propósito

El Módulo de Alertas, Notificaciones y Seguimiento es un componente crítico del SIAR que detecta, registra y gestiona eventos relevantes de cumplimiento, proporcionando evidencia documentada de gestión activa ante el regulador (SUDEASEG).

### 1.2 Principios Fundamentales

1. **Detección Automática**: Generación automática de alertas basada en eventos del sistema
2. **Trazabilidad Completa**: Todo el ciclo de vida de una alerta queda registrado
3. **No Bloqueante**: El sistema alerta pero no bloquea operaciones
4. **Gestión Documentada**: Cada acción sobre una alerta debe justificarse
5. **Evidencia Regulatoria**: Diseñado para inspecciones de SUDEASEG

### 1.3 Alcance Funcional

- ✅ Detección automática de eventos relevantes
- ✅ Generación de alertas trazables
- ✅ Asignación inteligente según rol y contexto
- ✅ Seguimiento documentado con comentarios
- ✅ Estados de ciclo de vida completo
- ✅ Notificaciones a usuarios relevantes
- ✅ Integración obligatoria con Auditoría
- ✅ Reportes de gestión de alertas

---

## 2. ARQUITECTURA DEL MÓDULO

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                MÓDULO DE ALERTAS Y NOTIFICACIONES            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │         DETECCIÓN DE EVENTOS                 │          │
│  │  - Event Listeners                           │          │
│  │  - Evaluadores de Condiciones                │          │
│  │  - Generadores de Alertas                    │          │
│  └──────────────┬───────────────────────────────┘          │
│                 │                                           │
│                 ▼                                           │
│  ┌──────────────────────────────────────────────┐          │
│  │         GESTIÓN DE ALERTAS                   │          │
│  │  - Alert Service (Lógica de negocio)         │          │
│  │  - Alert Repository (Persistencia)           │          │
│  │  - Assignment Engine (Asignación)            │          │
│  └──────────────┬───────────────────────────────┘          │
│                 │                                           │
│         ┌───────┴───────┐                                   │
│         ▼               ▼                                   │
│  ┌──────────┐    ┌──────────────┐                          │
│  │ AUDITORÍA│    │ NOTIFICACIONES│                          │
│  │ SERVICE  │    │    SERVICE     │                          │
│  └──────────┘    └────────┬───────┘                          │
│                           │                                  │
│                           ▼                                  │
│                  ┌─────────────────┐                         │
│                  │  - Email        │                         │
│                  │  - Dashboard    │                         │
│                  │  - WebSocket    │                         │
│                  └─────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Procesamiento de Alertas

```
EVENTO → EVALUACIÓN → GENERACIÓN ALERTA → ASIGNACIÓN → NOTIFICACIÓN → SEGUIMIENTO → CIERRE → AUDITORÍA
```

**Descripción del Flujo:**

1. **EVENTO**: Ocurre un evento en el sistema (creación de expediente, cambio de riesgo, etc.)
2. **EVALUACIÓN**: El Event Listener evalúa si el evento requiere generar una alerta
3. **GENERACIÓN**: Se crea el registro de alerta con toda la información relevante
4. **ASIGNACIÓN**: El Assignment Engine determina quién debe atender la alerta
5. **NOTIFICACIÓN**: Se envían notificaciones a los usuarios asignados
6. **SEGUIMIENTO**: Los usuarios registran acciones y comentarios
7. **CIERRE**: La alerta se cierra con justificación documentada
8. **AUDITORÍA**: Todo el ciclo queda registrado en la bitácora inmutable

---

## 3. EVENTOS QUE GENERAN ALERTAS

### 3.1 Catálogo Completo de Eventos

| Código | Módulo Origen | Evento Generador | Nivel | Auto-Asignación |
|--------|---------------|------------------|-------|-----------------|
| ALT-001 | DOSSIER | Expediente creado incompleto | MEDIA | Analista Cumplimiento |
| ALT-002 | DOSSIER | Modificación sin aprobación | ALTA | Oficial Cumplimiento |
| ALT-003 | DOSSIER | Expediente rechazado | ALTA | Creador + Analista |
| ALT-004 | DOSSIER | Expediente observado | MEDIA | Creador |
| ALT-005 | DUE_DILIGENCE | Documento vencido | ALTA | Analista Cumplimiento |
| ALT-006 | DUE_DILIGENCE | Documento próximo a vencer (<30 días) | MEDIA | Analista Cumplimiento |
| ALT-007 | DUE_DILIGENCE | Documento rechazado | MEDIA | Creador |
| ALT-008 | DUE_DILIGENCE | Documento observado | BAJA | Creador |
| ALT-009 | RISK | Riesgo clasificado ALTO | ALTA | Oficial Cumplimiento |
| ALT-010 | RISK | Riesgo clasificado CRÍTICO | CRÍTICA | Oficial Cumplimiento |
| ALT-011 | RISK | Cambio de riesgo (↑) | ALTA | Oficial Cumplimiento |
| ALT-012 | RISK | Riesgo clasificado MEDIO | MEDIA | Analista Cumplimiento |
| ALT-013 | SCREENING | Match relevante detectado | CRÍTICA | Oficial Cumplimiento |
| ALT-014 | SCREENING | Match posible detectado | ALTA | Analista Cumplimiento |
| ALT-015 | SCREENING | Screening fallido (error técnico) | MEDIA | Administrador Sistema |
| ALT-016 | PEP | Condición PEP detectada | ALTA | Oficial Cumplimiento |
| ALT-017 | PEP | Cambio de condición PEP | ALTA | Oficial Cumplimiento |
| ALT-018 | PEP | Vinculación con PEP detectada | MEDIA | Analista Cumplimiento |
| ALT-019 | DOSSIER | Expediente sin actualización (>12 meses) | MEDIA | Analista Cumplimiento |
| ALT-020 | DOSSIER | Datos inconsistentes detectados | MEDIA | Analista Cumplimiento |
| ALT-021 | SYSTEM | Error de integración externa | ALTA | Administrador Sistema |
| ALT-022 | SYSTEM | Parámetro de riesgo modificado | CRÍTICA | Auditor Interno |

### 3.2 Lógica de Generación por Evento

#### 3.2.1 Expediente Incompleto (ALT-001)

**Condiciones:**
- Se crea un expediente nuevo
- `completenessPercentage < 100%`
- Estado inicial: `INCOMPLETE`

**Información Capturada:**
- ID del expediente
- Tipo de entidad
- Porcentaje de completitud
- Campos faltantes obligatorios
- Documentos faltantes obligatorios
- Usuario creador

**Asignación:** Analista de Cumplimiento del área correspondiente

---

#### 3.2.2 Documento Vencido (ALT-005)

**Condiciones:**
- `expirationDate < CURRENT_DATE`
- Estado del documento: `APPROVED` o `EXPIRED`

**Información Capturada:**
- ID del expediente asociado
- Tipo de documento
- Fecha de vencimiento
- Días transcurridos desde vencimiento

**Asignación:** Analista de Cumplimiento asignado al expediente

---

#### 3.2.3 Riesgo Alto/Crítico (ALT-009, ALT-010)

**Condiciones:**
- Nueva evaluación de riesgo
- `riskLevel == HIGH` o `riskLevel == CRITICAL`

**Información Capturada:**
- ID del expediente
- Nivel de riesgo
- Score calculado
- Factores de riesgo relevantes
- Fecha de evaluación

**Asignación:** Oficial de Cumplimiento

---

#### 3.2.4 Match en Screening (ALT-013, ALT-014)

**Condiciones:**
- Screening ejecutado
- `matchType == EXACT` → ALT-013 (CRÍTICA)
- `matchType == POSSIBLE` → ALT-014 (ALTA)

**Información Capturada:**
- ID del screening
- ID del expediente
- Datos del match encontrado
- Lista donde se encontró
- Similitud (%)

**Asignación:**
- Match exacto → Oficial de Cumplimiento (CRÍTICA)
- Match posible → Analista de Cumplimiento (ALTA)

---

## 4. MODELO DE DATOS

### 4.1 Entidad: Alert

**Tabla:** `alerts`

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| alert_id | UUID | Identificador único | Sí |
| alert_code | VARCHAR(20) | Código del tipo de alerta (ALT-001) | Sí |
| alert_type | VARCHAR(50) | Nombre del tipo | Sí |
| alert_level | ENUM | BAJA, MEDIA, ALTA, CRÍTICA | Sí |
| origin_module | VARCHAR(50) | Módulo que generó la alerta | Sí |
| dossier_id | UUID | Expediente asociado | Sí |
| entity_type | VARCHAR(50) | Tipo de entidad del expediente | Sí |
| entity_name | VARCHAR(200) | Nombre de la entidad | No |
| entity_identification | VARCHAR(50) | Documento de identificación | No |
| status | ENUM | NUEVA, EN_SEGUIMIENTO, ATENDIDA, CERRADA | Sí |
| description | TEXT | Descripción de la alerta | Sí |
| detected_at | TIMESTAMP | Fecha/hora de detección | Sí |
| detected_by | VARCHAR(50) | Usuario/Sistema que generó | Sí |
| assigned_to | VARCHAR(50) | Usuario asignado | No |
| assigned_at | TIMESTAMP | Fecha/hora de asignación | No |
| attended_by | VARCHAR(50) | Usuario que atendió | No |
| attended_at | TIMESTAMP | Fecha/hora de atención | No |
| closed_by | VARCHAR(50) | Usuario que cerró | No |
| closed_at | TIMESTAMP | Fecha/hora de cierre | No |
| closure_reason | TEXT | Justificación del cierre | No |
| requires_action | BOOLEAN | Requiere acción correctiva | Sí |
| action_deadline | DATE | Fecha límite para acción | No |
| priority_score | INTEGER | Score de prioridad (0-100) | Sí |
| metadata | JSONB | Información adicional contextual | No |
| related_entity_id | VARCHAR(50) | ID de entidad relacionada | No |
| related_entity_type | VARCHAR(50) | Tipo de entidad relacionada | No |
| notification_sent | BOOLEAN | Notificación enviada | Sí |
| notification_sent_at | TIMESTAMP | Fecha/hora envío notificación | No |
| escalated | BOOLEAN | Escalada a superior | No |
| escalated_at | TIMESTAMP | Fecha/hora de escalación | No |
| escalated_to | VARCHAR(50) | Usuario a quien se escaló | No |
| escalation_reason | TEXT | Razón de escalación | No |
| created_at | TIMESTAMP | Fecha de creación del registro | Sí |
| version | BIGINT | Control de concurrencia optimista | Sí |

---

### 4.2 Entidad: AlertType

**Tabla:** `alert_types`

Catálogo maestro de tipos de alerta configurables.

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| alert_type_id | UUID | Identificador único | Sí |
| alert_code | VARCHAR(20) | Código único (ALT-001) | Sí |
| alert_name | VARCHAR(100) | Nombre descriptivo | Sí |
| alert_level | ENUM | Nivel por defecto | Sí |
| origin_module | VARCHAR(50) | Módulo origen | Sí |
| description | TEXT | Descripción del tipo | Sí |
| active | BOOLEAN | Activo/Inactivo | Sí |
| requires_action | BOOLEAN | Requiere acción | Sí |
| default_deadline_days | INTEGER | Días para plazo por defecto | No |
| auto_assignment_rule | VARCHAR(50) | Regla de asignación automática | No |
| notification_template | VARCHAR(50) | Template de notificación | No |
| escalation_hours | INTEGER | Horas para escalación automática | No |
| created_by | VARCHAR(50) | Usuario creador | Sí |
| created_at | TIMESTAMP | Fecha de creación | Sí |
| modified_by | VARCHAR(50) | Usuario modificador | No |
| modified_at | TIMESTAMP | Fecha de modificación | No |

---

### 4.3 Entidad: AlertTracking

**Tabla:** `alert_tracking`

Registro de todas las acciones realizadas sobre una alerta (seguimiento).

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| tracking_id | UUID | Identificador único | Sí |
| alert_id | UUID | Alerta asociada | Sí |
| action_type | ENUM | ASIGNADA, COMENTARIO, ESTADO_CAMBIO, CERRADA, ESCALADA | Sí |
| action_description | TEXT | Descripción de la acción | Sí |
| previous_status | VARCHAR(50) | Estado anterior | No |
| new_status | VARCHAR(50) | Estado nuevo | No |
| previous_assigned_to | VARCHAR(50) | Asignado anterior | No |
| new_assigned_to | VARCHAR(50) | Nuevo asignado | No |
| comment | TEXT | Comentario del usuario | No |
| evidence_attached | BOOLEAN | Evidencia adjunta | No |
| evidence_reference | VARCHAR(200) | Referencia a evidencia | No |
| action_taken | TEXT | Acción correctiva tomada | No |
| performed_by | VARCHAR(50) | Usuario que realizó acción | Sí |
| performed_at | TIMESTAMP | Fecha/hora de la acción | Sí |
| ip_address | VARCHAR(45) | IP del usuario | No |
| user_agent | TEXT | Agente de usuario | No |

**Restricciones:**
- Una alerta NO puede eliminarse, solo cerrarse
- El tracking NO puede eliminarse ni modificarse (inmutable)
- Toda acción debe tener un usuario identificado

---

### 4.4 Entidad: Notification

**Tabla:** `notifications`

Notificaciones enviadas a usuarios.

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| notification_id | UUID | Identificador único | Sí |
| alert_id | UUID | Alerta relacionada | Sí |
| notification_type | ENUM | EMAIL, DASHBOARD, WEBSOCKET | Sí |
| recipient_user_id | VARCHAR(50) | Usuario destinatario | Sí |
| recipient_email | VARCHAR(100) | Email destinatario | No |
| subject | VARCHAR(200) | Asunto | Sí |
| message | TEXT | Mensaje | Sí |
| sent_at | TIMESTAMP | Fecha/hora de envío | Sí |
| delivery_status | ENUM | PENDIENTE, ENVIADA, ENTREGADA, FALLIDA | Sí |
| delivery_error | TEXT | Error de entrega | No |
| read_at | TIMESTAMP | Fecha/hora de lectura | No |
| read_by_user | BOOLEAN | Leída por usuario | No |
| retry_count | INTEGER | Intentos de reenvío | No |
| created_at | TIMESTAMP | Fecha de creación | Sí |

---

## 5. DTOs JSON

### 5.1 AlertDTO (Respuesta API)

```json
{
  "alertId": "550e8400-e29b-41d4-a716-446655440000",
  "alertCode": "ALT-009",
  "alertType": "Riesgo clasificado ALTO",
  "alertLevel": "ALTA",
  "originModule": "RISK",
  "dossier": {
    "dossierId": "DOSS-2025-00123",
    "entityType": "CLIENT",
    "entityName": "Juan Alberto Pérez González",
    "entityIdentification": "V-12345678"
  },
  "status": "NUEVA",
  "description": "El expediente ha sido evaluado con nivel de riesgo ALTO (Score: 72). Factores principales: País de residencia (Alto Riesgo GAFI), Actividad económica sensible.",
  "detectedAt": "2025-01-15T10:30:00Z",
  "detectedBy": "SYSTEM",
  "assignedTo": {
    "userId": "user.compliance.officer",
    "userName": "María González",
    "userRole": "OFICIAL_CUMPLIMIENTO"
  },
  "assignedAt": "2025-01-15T10:30:01Z",
  "requiresAction": true,
  "actionDeadline": "2025-01-20",
  "priorityScore": 85,
  "metadata": {
    "riskEvaluationId": "EVA-2025-00456",
    "riskScore": 72,
    "riskLevel": "HIGH",
    "mainRiskFactors": [
      {
        "factor": "País de Residencia",
        "value": "País de Alto Riesgo GAFI",
        "weight": 25
      },
      {
        "factor": "Actividad Económica",
        "value": "Comercio internacional",
        "weight": 20
      }
    ]
  },
  "relatedEntity": {
    "entityType": "RISK_EVALUATION",
    "entityId": "EVA-2025-00456"
  },
  "notificationSent": true,
  "notificationSentAt": "2025-01-15T10:30:05Z",
  "escalated": false,
  "trackingCount": 3,
  "lastActivity": {
    "actionType": "COMENTARIO",
    "performedBy": "María González",
    "performedAt": "2025-01-15T14:20:00Z",
    "comment": "Expediente en revisión. Se solicitó información adicional al cliente."
  },
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

### 5.2 CreateAlertRequest (Entrada API)

```json
{
  "alertCode": "ALT-009",
  "dossierId": "DOSS-2025-00123",
  "originModule": "RISK",
  "description": "El expediente ha sido evaluado con nivel de riesgo ALTO (Score: 72)",
  "detectedBy": "SYSTEM",
  "requiresAction": true,
  "actionDeadlineDays": 5,
  "metadata": {
    "riskEvaluationId": "EVA-2025-00456",
    "riskScore": 72,
    "riskLevel": "HIGH",
    "mainRiskFactors": [
      {
        "factor": "País de Residencia",
        "value": "País de Alto Riesgo GAFI",
        "weight": 25
      }
    ]
  },
  "relatedEntityType": "RISK_EVALUATION",
  "relatedEntityId": "EVA-2025-00456"
}
```

---

### 5.3 AlertTrackingDTO (Seguimiento)

```json
{
  "trackingId": "660f9511-f3ac-52e5-b827-557766551111",
  "alertId": "550e8400-e29b-41d4-a716-446655440000",
  "actionType": "COMENTARIO",
  "actionDescription": "Analista agregó comentario de seguimiento",
  "comment": "Se contactó al cliente para solicitar documentación adicional. Cliente comprometió envío en 48 horas. Se mantiene seguimiento activo.",
  "actionTaken": "Solicitud de información adicional enviada por email",
  "evidenceAttached": true,
  "evidenceReference": "DOC-2025-00789-email-solicitud.pdf",
  "performedBy": {
    "userId": "user.analyst.001",
    "userName": "Carlos Ramírez",
    "userRole": "ANALISTA_CUMPLIMIENTO"
  },
  "performedAt": "2025-01-16T09:45:00Z"
}
```

---

### 5.4 AddTrackingRequest (Agregar Seguimiento)

```json
{
  "actionType": "COMENTARIO",
  "comment": "Se verificó documentación recibida. Expediente completo. Se procede al cierre de la alerta.",
  "actionTaken": "Revisión documental completada",
  "evidenceAttached": false,
  "newStatus": "ATENDIDA"
}
```

---

### 5.5 CloseAlertRequest (Cerrar Alerta)

```json
{
  "closureReason": "La evaluación de riesgo fue validada por el Oficial de Cumplimiento. El nivel de riesgo ALTO es aceptable considerando los controles implementados. Expediente aprobado con debida diligencia reforzada.",
  "actionTaken": "Aprobación de expediente con DDR (Debida Diligencia Reforzada). Se estableció monitoreo trimestral.",
  "evidenceAttached": true,
  "evidenceReference": "MEMO-2025-001-Aprobacion-DDR.pdf"
}
```

---

### 5.6 AlertSummaryDTO (Resumen para Dashboard)

```json
{
  "totalAlerts": 247,
  "newAlerts": 18,
  "inProgressAlerts": 42,
  "attendedAlerts": 156,
  "closedAlerts": 31,
  "byLevel": {
    "CRÍTICA": 3,
    "ALTA": 28,
    "MEDIA": 186,
    "BAJA": 30
  },
  "byModule": {
    "DOSSIER": 98,
    "RISK": 67,
    "DUE_DILIGENCE": 45,
    "SCREENING": 22,
    "PEP": 15
  },
  "overdueAlerts": 8,
  "escalatedAlerts": 2,
  "myAlerts": {
    "total": 15,
    "pending": 6,
    "inProgress": 9
  },
  "averageResolutionDays": 3.5,
  "lastUpdated": "2025-01-17T10:00:00Z"
}
```

---

## 6. LÓGICA DE ASIGNACIÓN DE ALERTAS

### 6.1 Motor de Asignación (Assignment Engine)

El Assignment Engine determina automáticamente a quién asignar cada alerta basándose en:

1. **Tipo de alerta** (definido en `AlertType.autoAssignmentRule`)
2. **Nivel de alerta** (BAJA, MEDIA, ALTA, CRÍTICA)
3. **Módulo origen**
4. **Relación previa** (¿quién creó el expediente?)
5. **Carga de trabajo** (distribución equitativa)

### 6.2 Reglas de Asignación

| Nivel | Módulo | Tipo de Alerta | Asignación |
|-------|--------|----------------|------------|
| CRÍTICA | SCREENING | Match exacto | Oficial de Cumplimiento |
| CRÍTICA | RISK | Riesgo crítico | Oficial de Cumplimiento |
| ALTA | RISK | Riesgo alto | Oficial de Cumplimiento |
| ALTA | PEP | Condición PEP | Oficial de Cumplimiento |
| ALTA | DUE_DILIGENCE | Documento vencido | Analista asignado al expediente |
| MEDIA | DOSSIER | Expediente incompleto | Analista que creó el expediente |
| MEDIA | DUE_DILIGENCE | Documento próximo a vencer | Analista asignado al expediente |
| BAJA | * | * | Analista con menor carga |

### 6.3 Lógica de Escalación Automática

Una alerta se escala automáticamente si:

1. **Tiempo sin atender**: >24 horas (CRÍTICA), >48 horas (ALTA), >72 horas (MEDIA)
2. **Vencimiento cercano**: Deadline < 24 horas
3. **Múltiples re-aperturas**: >2 veces

**Escalación:**
- Analista → Oficial de Cumplimiento
- Oficial de Cumplimiento → Gerente de Cumplimiento

---

## 7. INTEGRACIÓN CON AUDITORÍA

### 7.1 Eventos Auditados

Toda operación sobre alertas genera un registro de auditoría:

| Código Auditoría | Evento | Nivel Auditoría |
|------------------|--------|-----------------|
| AUD-018 | Generación de alerta | INFO |
| AUD-019 | Asignación de alerta | INFO |
| AUD-020 | Atención de alerta (seguimiento) | INFO |
| AUD-021 | Cierre de alerta | CRITICAL |
| AUD-022 | Reasignación de alerta | INFO |
| AUD-023 | Escalación de alerta | WARNING |
| AUD-024 | Intento de eliminación de alerta | CRITICAL |

### 7.2 Información Auditada

Cada evento incluye:

- **Actor**: Usuario que realiza la acción
- **Target**: Alerta afectada + Expediente relacionado
- **Action**: Tipo de acción realizada
- **StateChange**: Estado anterior y nuevo
- **BusinessContext**: Justificación, notas, evidencias
- **Integrity**: Hash para inmutabilidad

---

## 8. NOTIFICACIONES

### 8.1 Canales de Notificación

1. **Dashboard en Tiempo Real**: WebSocket
2. **Email**: Para alertas ALTA y CRÍTICA
3. **Panel de Notificaciones**: Dentro de la aplicación

### 8.2 Configuración de Notificaciones

Los usuarios pueden configurar:

- Tipos de alerta que desean recibir
- Canales preferidos (email, dashboard, ambos)
- Horarios de notificación
- Agrupación de notificaciones (inmediata, diaria, semanal)

### 8.3 Templates de Notificación

**Template: Alerta Crítica**

```
Asunto: [CRÍTICA] Nueva alerta de cumplimiento: {alertType}

Estimado/a {userName},

Se ha generado una alerta de nivel CRÍTICO que requiere su atención inmediata:

Tipo: {alertType}
Expediente: {dossierNumber} - {entityName}
Descripción: {description}
Plazo: {actionDeadline}

Por favor ingrese al sistema para revisar y atender esta alerta.

Este es un mensaje automatizado del SIAR.
```

---

## 9. ENDPOINTS REST

### 9.1 Gestión de Alertas

**GET /api/v1/alerts**
- Listar todas las alertas (con filtros y paginación)
- Filtros: status, level, module, assignedTo, dossierId, dateRange
- Paginación: page, size, sort

**GET /api/v1/alerts/{alertId}**
- Obtener detalle de una alerta específica
- Incluye tracking history

**POST /api/v1/alerts**
- Crear una nueva alerta (generalmente automático)
- Requiere: alertCode, dossierId, description

**GET /api/v1/alerts/my-alerts**
- Alertas asignadas al usuario autenticado
- Filtros: status, level

**GET /api/v1/alerts/summary**
- Resumen de alertas para dashboard
- Métricas agregadas

### 9.2 Seguimiento de Alertas

**POST /api/v1/alerts/{alertId}/tracking**
- Agregar seguimiento/comentario a una alerta
- Requiere: comment, actionType, newStatus (opcional)

**GET /api/v1/alerts/{alertId}/tracking**
- Obtener historial completo de seguimiento
- Ordenado por fecha descendente

**PUT /api/v1/alerts/{alertId}/assign**
- Reasignar alerta a otro usuario
- Requiere: newAssignedTo, reason

### 9.3 Cierre de Alertas

**POST /api/v1/alerts/{alertId}/close**
- Cerrar una alerta
- Requiere: closureReason, actionTaken
- Genera auditoría CRITICAL

**POST /api/v1/alerts/{alertId}/reopen**
- Reabrir una alerta cerrada (casos excepcionales)
- Requiere: reason, approvedBy (Oficial de Cumplimiento)

### 9.4 Gestión de Tipos de Alerta

**GET /api/v1/alert-types**
- Listar tipos de alerta configurados
- Solo usuarios con rol OFICIAL_CUMPLIMIENTO o superior

**POST /api/v1/alert-types**
- Crear nuevo tipo de alerta
- Requiere: alertCode, alertName, level, originModule

**PUT /api/v1/alert-types/{alertTypeId}**
- Modificar configuración de tipo de alerta
- Auditoría CRITICAL

---

## 10. REPORTES DE ALERTAS

### 10.1 Reportes Disponibles

1. **Reporte de Alertas Abiertas**: Todas las alertas pendientes de cierre
2. **Reporte de Gestión de Alertas**: Estadísticas de atención y cierre
3. **Reporte por Usuario**: Alertas asignadas/atendidas por usuario
4. **Reporte por Expediente**: Historial de alertas de un expediente
5. **Reporte de Alertas Escaladas**: Alertas que requirieron escalación
6. **Reporte Regulatorio**: Para SUDEASEG con evidencia de gestión activa

### 10.2 Exportación

- **PDF**: Para presentación oficial
- **Excel**: Para análisis detallado
- **CSV**: Para procesamiento externo

---

## 11. CASOS DE USO DETALLADOS

### 11.1 Caso de Uso: Generación Automática de Alerta por Riesgo Alto

**Flujo:**

1. Usuario evalúa un expediente en el Módulo de Riesgo
2. El motor de riesgo calcula un score de 75 (ALTO)
3. `RiskEvaluationService` guarda la evaluación
4. Se dispara un evento: `RiskEvaluationCompletedEvent`
5. `AlertEventListener` captura el evento
6. `AlertService.generateAlert()` se ejecuta:
   - Verifica que riskLevel == HIGH
   - Crea alerta con código ALT-009
   - Asigna automáticamente al Oficial de Cumplimiento
   - Calcula priorityScore = 85
   - Establece deadline = hoy + 5 días
7. Se persiste la alerta en BD
8. `NotificationService` envía email al Oficial
9. `AuditService` registra evento AUD-018
10. WebSocket notifica al dashboard en tiempo real

---

### 11.2 Caso de Uso: Seguimiento y Cierre de Alerta

**Flujo:**

1. Oficial de Cumplimiento recibe notificación de alerta ALT-009
2. Ingresa al detalle de la alerta en el sistema
3. Revisa el expediente y la evaluación de riesgo
4. Agrega comentario: "Se revisó la evaluación. Se solicitó información adicional."
   - `POST /api/v1/alerts/{alertId}/tracking`
   - Se registra en `alert_tracking`
   - Se audita con AUD-020
5. Analista obtiene información del cliente
6. Oficial revisa la información adicional
7. Agrega nuevo comentario: "Información validada. Riesgo aceptable con controles."
8. Oficial cierra la alerta:
   - `POST /api/v1/alerts/{alertId}/close`
   - closureReason: "Riesgo validado. DDR implementada."
   - Se actualiza alert.status = CERRADA
   - Se registra en `alert_tracking` con action = CERRADA
   - Se audita con AUD-021 (CRITICAL)
9. Sistema envía notificación de cierre

---

## 12. MÉTRICAS Y KPIS

### 12.1 Métricas de Gestión de Alertas

1. **Tiempo Promedio de Atención**: Desde creación hasta primera respuesta
2. **Tiempo Promedio de Cierre**: Desde creación hasta cierre
3. **Tasa de Resolución**: Alertas cerradas / Alertas totales
4. **Alertas Vencidas**: Con deadline sobrepasado
5. **Tasa de Escalación**: Alertas escaladas / Alertas totales
6. **Alertas por Usuario**: Distribución de carga de trabajo
7. **Alertas por Módulo**: Origen de las alertas
8. **Alertas por Nivel**: Distribución de criticidad

### 12.2 Indicadores para el Regulador

1. **Evidencia de Gestión Activa**: % de alertas atendidas en tiempo
2. **Documentación de Decisiones**: 100% de cierres con justificación
3. **Trazabilidad Completa**: Auditoría de todas las acciones
4. **Tiempo de Respuesta**: Alertas críticas atendidas en <24 horas

---

## 13. CONSIDERACIONES DE SEGURIDAD

### 13.1 Control de Acceso

- Solo usuarios con rol ANALISTA_CUMPLIMIENTO o superior pueden gestionar alertas
- Solo el usuario asignado o el Oficial de Cumplimiento pueden cerrar alertas
- Solo el Oficial de Cumplimiento puede reasignar alertas críticas
- Los administradores NO pueden eliminar alertas

### 13.2 Protección de Datos

- Los datos sensibles en alertas se cifran en BD
- Las notificaciones por email no incluyen datos sensibles completos
- El acceso a alertas se registra en auditoría

---

## 14. MANTENIMIENTO Y EVOLUCIÓN

### 14.1 Parametrización de Tipos de Alerta

Los tipos de alerta están en base de datos, permitiendo:
- Agregar nuevos tipos sin código
- Modificar niveles de prioridad
- Ajustar reglas de asignación
- Configurar tiempos de escalación

### 14.2 Mejora Continua

- Revisión trimestral de umbrales de alertas
- Análisis de alertas frecuentes (optimización de procesos)
- Capacitación basada en alertas recurrentes

---

## 15. ANEXOS

### 15.1 Glosario

- **Alerta**: Evento relevante que requiere atención
- **Seguimiento**: Registro de acciones sobre una alerta
- **Escalación**: Reasignación a un superior por tiempo o criticidad
- **Cierre**: Finalización documentada de una alerta
- **Notificación**: Mensaje enviado a un usuario sobre una alerta

### 15.2 Referencias Regulatorias

- Resolución SUDEASEG 119.10: Enfoque Basado en Riesgo
- Normas GAFI: Recomendación 1 (Evaluación de Riesgos)
- Normas GAFI: Recomendación 10 (Debida Diligencia)

---

**FIN DEL DOCUMENTO**
