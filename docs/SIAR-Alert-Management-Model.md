# SIAR - Modelo de Gestión de Alertas y Seguimiento

## 1. Introducción

Este documento describe el modelo de base de datos para la gestión de alertas y seguimiento en el Sistema Integrado de Análisis de Riesgos (SIAR). Las alertas son notificaciones automatizadas o manuales que requieren atención del área de cumplimiento.

### 1.1 Principios Fundamentales

- **Inmutabilidad**: Las alertas NO pueden eliminarse, solo cerrarse
- **Trazabilidad completa**: Todo cambio queda registrado en el historial
- **Gestión activa**: Workflow definido con estados y transiciones
- **Integración total**: Vinculación con expedientes, riesgos y diligencias
- **Automatización**: Generación automática desde múltiples módulos

---

## 2. Arquitectura del Modelo

### 2.1 Diagrama Entidad-Relación

```
┌─────────────────────┐
│   alert_types       │ Catálogo maestro de tipos de alertas
│ (Tipo_Alerta)       │
├─────────────────────┤
│ PK alert_type_id    │
│    alert_code       │ ALT-001, ALT-002, etc.
│    alert_name       │
│    alert_level      │ BAJA, MEDIA, ALTA, CRÍTICA
│    origin_module    │ DOSSIER, RISK, DUE_DILIGENCE
│    description      │
│    active           │
│    requires_action  │
│    default_deadline │
└─────────────────────┘
           │
           │ referencia
           ▼
┌─────────────────────┐        ┌──────────────────┐
│      alerts         │        │    dossiers      │
│     (Alerta)        │◄───────┤                  │
├─────────────────────┤        └──────────────────┘
│ PK alert_id         │
│    alert_code       │ Tipo de alerta (FK lógico)
│    alert_type       │ Nombre descriptivo
│    alert_level      │ Nivel de prioridad
│    origin_module    │ Módulo origen
│ FK dossier_id       │ Expediente asociado ✓
│    entity_type      │
│    entity_name      │
│    entity_id        │
│    status           │ NUEVA, EN_SEGUIMIENTO, ATENDIDA, CERRADA
│    description      │
│    detected_at      │ Fecha detección
│    detected_by      │
│    assigned_to      │ Usuario asignado
│    assigned_at      │
│    attended_by      │
│    attended_at      │
│    closed_by        │
│    closed_at        │
│    closure_reason   │
│    requires_action  │
│    action_deadline  │ Fecha límite
│    priority_score   │ 0-100
│    metadata         │ JSONB
│    escalated        │
│    escalated_at     │
│    notification_sent│
│    version          │ Control optimista
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│  alert_tracking     │ Historial inmutable
│(Seguimiento_Alerta) │
├─────────────────────┤
│ PK tracking_id      │
│ FK alert_id         │
│    action_type      │ CREADA, ASIGNADA, COMENTARIO, etc.
│    action_description│
│    previous_status  │ Cambio de estado
│    new_status       │
│    previous_assigned│ Cambio de asignación
│    new_assigned_to  │
│    comment          │ Observaciones del usuario
│    evidence_attached│
│    evidence_ref     │
│    action_taken     │ Acción realizada
│    performed_by     │ Usuario que realizó
│    performed_at     │ Timestamp
│    ip_address       │ Auditoría técnica
│    user_agent       │
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│   notifications     │ Notificaciones enviadas
├─────────────────────┤
│ PK notification_id  │
│ FK alert_id         │
│    notification_type│ EMAIL, SMS, IN_APP
│    recipient        │
│    sent_at          │
│    delivery_status  │
│    read_at          │
└─────────────────────┘
```

### 2.2 Integración con Otros Módulos

```
┌──────────────┐
│  Dossiers    │ Expediente base
└──────┬───────┘
       │
       ├──► alerts (dossier_id)
       │
       ├──► risk_assessments ──► alerts (module: RISK)
       │
       ├──► due_diligence ──────► alerts (module: DUE_DILIGENCE)
       │
       ├──► pep_information ────► alerts (module: PEP)
       │
       └──► screening_results ──► alerts (module: SCREENING)
```

---

## 3. Entidades del Modelo

### 3.1 alert_types (Tipo_Alerta)

Catálogo maestro parametrizable de tipos de alertas.

#### Estructura

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| alert_type_id | UUID | ID único | PK, NOT NULL |
| alert_code | VARCHAR(20) | Código único | UNIQUE, NOT NULL |
| alert_name | VARCHAR(100) | Nombre descriptivo | NOT NULL |
| alert_level | ENUM | Nivel de prioridad | NOT NULL |
| origin_module | VARCHAR(50) | Módulo de origen | NOT NULL |
| description | TEXT | Descripción detallada | NOT NULL |
| active | BOOLEAN | Tipo activo | DEFAULT true |
| requires_action | BOOLEAN | Requiere acción | DEFAULT true |
| default_deadline_days | INTEGER | Plazo predeterminado | NULL |
| auto_assignment_rule | VARCHAR(50) | Regla de asignación | NULL |
| notification_template | VARCHAR(50) | Template de notificación | NULL |
| escalation_hours | INTEGER | Horas para escalación | NULL |
| created_by | VARCHAR(50) | Usuario creador | NOT NULL |
| created_at | TIMESTAMP | Fecha creación | NOT NULL |
| modified_by | VARCHAR(50) | Último modificador | NULL |
| modified_at | TIMESTAMP | Última modificación | NULL |
| version | BIGINT | Control optimista | DEFAULT 0 |

#### Valores de alert_level

```sql
CREATE TYPE alert_level AS ENUM (
    'BAJA',      -- Informativa, sin urgencia
    'MEDIA',     -- Requiere atención pero no urgente
    'ALTA',      -- Requiere atención pronta
    'CRÍTICA'    -- Requiere atención inmediata
);
```

#### Tipos de Alertas Predefinidos

| Código | Nombre | Nivel | Módulo | Días Plazo |
|--------|--------|-------|--------|------------|
| ALT-001 | PEP Detectado | ALTA | PEP | 3 |
| ALT-002 | Riesgo Alto | CRÍTICA | RISK | 1 |
| ALT-003 | Documentación Vencida | MEDIA | DOSSIER | 7 |
| ALT-004 | Screening Positivo | CRÍTICA | SCREENING | 1 |
| ALT-005 | Cambio de Perfil | MEDIA | DOSSIER | 5 |
| ALT-006 | Operación Inusual | ALTA | DUE_DILIGENCE | 2 |
| ALT-007 | País Alto Riesgo | ALTA | RISK | 3 |
| ALT-008 | Lista Negra | CRÍTICA | SCREENING | 1 |
| ALT-009 | Diligencia Vencida | MEDIA | DUE_DILIGENCE | 7 |
| ALT-010 | Incremento de Riesgo | ALTA | RISK | 3 |

### 3.2 alerts (Alerta)

Registro principal de alertas. NO permite eliminación física.

#### Estructura

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| alert_id | UUID | ID único | PK, NOT NULL |
| alert_code | VARCHAR(20) | Código de tipo | NOT NULL, FK lógico |
| alert_type | VARCHAR(50) | Nombre del tipo | NOT NULL |
| alert_level | ENUM | Nivel de prioridad | NOT NULL |
| origin_module | VARCHAR(50) | Módulo origen | NOT NULL |
| dossier_id | UUID | Expediente asociado | FK NOT NULL |
| entity_type | VARCHAR(50) | Tipo de entidad | NULL |
| entity_name | VARCHAR(200) | Nombre entidad | NULL |
| entity_identification | VARCHAR(50) | Identificación | NULL |
| status | ENUM | Estado actual | NOT NULL, DEFAULT 'NUEVA' |
| description | TEXT | Descripción detallada | NOT NULL |
| detected_at | TIMESTAMP | Fecha detección | NOT NULL |
| detected_by | VARCHAR(50) | Detectado por | NOT NULL |
| assigned_to | VARCHAR(50) | Asignado a | NULL |
| assigned_at | TIMESTAMP | Fecha asignación | NULL |
| attended_by | VARCHAR(50) | Atendido por | NULL |
| attended_at | TIMESTAMP | Fecha atención | NULL |
| closed_by | VARCHAR(50) | Cerrado por | NULL |
| closed_at | TIMESTAMP | Fecha cierre | NULL |
| closure_reason | TEXT | Razón de cierre | NULL |
| requires_action | BOOLEAN | Requiere acción | DEFAULT false |
| action_deadline | DATE | Fecha límite | NULL |
| priority_score | INTEGER | Puntaje prioridad | DEFAULT 50, 0-100 |
| metadata | JSONB | Datos adicionales | NULL |
| related_entity_id | VARCHAR(50) | Entidad relacionada | NULL |
| related_entity_type | VARCHAR(50) | Tipo entidad relac. | NULL |
| notification_sent | BOOLEAN | Notificación enviada | DEFAULT false |
| notification_sent_at | TIMESTAMP | Fecha notificación | NULL |
| escalated | BOOLEAN | Escalada | DEFAULT false |
| escalated_at | TIMESTAMP | Fecha escalación | NULL |
| escalated_to | VARCHAR(50) | Escalado a | NULL |
| escalation_reason | TEXT | Razón escalación | NULL |
| created_at | TIMESTAMP | Fecha creación | NOT NULL |
| version | BIGINT | Control optimista | DEFAULT 0 |

#### Estados (status)

```sql
CREATE TYPE alert_status AS ENUM (
    'NUEVA',           -- Recién generada, no asignada
    'EN_SEGUIMIENTO',  -- En proceso de atención
    'ATENDIDA',        -- Atendida, pendiente cierre formal
    'CERRADA'          -- Cerrada con documentación
);
```

#### Transiciones de Estado Permitidas

```
NUEVA ──────────► EN_SEGUIMIENTO ──────────► ATENDIDA ──────────► CERRADA
  │                                              │                    │
  └──────────────────────────────────────────────┴────────────────────┘
                     (Solo con justificación)
```

#### Índices

```sql
CREATE INDEX idx_alert_code ON alerts(alert_code);
CREATE INDEX idx_alert_status ON alerts(status);
CREATE INDEX idx_alert_level ON alerts(alert_level);
CREATE INDEX idx_alert_dossier ON alerts(dossier_id);
CREATE INDEX idx_alert_assigned_to ON alerts(assigned_to);
CREATE INDEX idx_alert_detected_at ON alerts(detected_at);
CREATE INDEX idx_alert_module ON alerts(origin_module);
CREATE INDEX idx_alert_deadline ON alerts(action_deadline) WHERE status != 'CERRADA';
```

### 3.3 alert_tracking (Seguimiento_Alerta)

Historial inmutable de acciones sobre alertas. NO permite modificación ni eliminación.

#### Estructura

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| tracking_id | UUID | ID único | PK, NOT NULL |
| alert_id | UUID | Alerta asociada | FK NOT NULL |
| action_type | ENUM | Tipo de acción | NOT NULL |
| action_description | TEXT | Descripción acción | NOT NULL |
| previous_status | VARCHAR(20) | Estado anterior | NULL |
| new_status | VARCHAR(20) | Nuevo estado | NULL |
| previous_assigned_to | VARCHAR(50) | Asignación anterior | NULL |
| new_assigned_to | VARCHAR(50) | Nueva asignación | NULL |
| comment | TEXT | Comentario usuario | NULL |
| evidence_attached | BOOLEAN | Evidencia adjunta | DEFAULT false |
| evidence_reference | VARCHAR(200) | Referencia evidencia | NULL |
| action_taken | TEXT | Acción realizada | NULL |
| performed_by | VARCHAR(50) | Realizado por | NOT NULL |
| performed_at | TIMESTAMP | Fecha acción | NOT NULL |
| ip_address | VARCHAR(45) | IP del usuario | NULL |
| user_agent | TEXT | Navegador | NULL |

#### Tipos de Acción (action_type)

```sql
CREATE TYPE tracking_action_type AS ENUM (
    'CREADA',                -- Alerta creada
    'ASIGNADA',              -- Asignada a usuario
    'REASIGNADA',            -- Reasignada a otro usuario
    'COMENTARIO_AGREGADO',   -- Comentario añadido
    'EVIDENCIA_ADJUNTA',     -- Evidencia documentada
    'ESTADO_CAMBIADO',       -- Cambio de estado
    'ACCION_TOMADA',         -- Acción correctiva
    'ESCALADA',              -- Escalada a superior
    'NOTIFICACION_ENVIADA',  -- Notificación enviada
    'CERRADA'                -- Alerta cerrada
);
```

#### Índices

```sql
CREATE INDEX idx_tracking_alert ON alert_tracking(alert_id);
CREATE INDEX idx_tracking_performed_at ON alert_tracking(performed_at);
CREATE INDEX idx_tracking_performed_by ON alert_tracking(performed_by);
CREATE INDEX idx_tracking_action_type ON alert_tracking(action_type);
```

### 3.4 notifications (Notificaciones)

Registro de notificaciones enviadas relacionadas con alertas.

#### Estructura

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| notification_id | UUID | ID único | PK, NOT NULL |
| alert_id | UUID | Alerta asociada | FK NOT NULL |
| notification_type | ENUM | Tipo notificación | NOT NULL |
| recipient | VARCHAR(100) | Destinatario | NOT NULL |
| subject | VARCHAR(200) | Asunto | NULL |
| body | TEXT | Cuerpo mensaje | NULL |
| sent_at | TIMESTAMP | Fecha envío | NOT NULL |
| delivery_status | ENUM | Estado entrega | NOT NULL |
| delivered_at | TIMESTAMP | Fecha entrega | NULL |
| read_at | TIMESTAMP | Fecha lectura | NULL |
| error_message | TEXT | Error si falla | NULL |

#### Tipos de Notificación

```sql
CREATE TYPE notification_type AS ENUM (
    'EMAIL',          -- Correo electrónico
    'SMS',            -- Mensaje de texto
    'IN_APP',         -- Notificación en app
    'PUSH'            -- Push notification
);

CREATE TYPE delivery_status AS ENUM (
    'PENDIENTE',      -- Pendiente de envío
    'ENVIADA',        -- Enviada exitosamente
    'ENTREGADA',      -- Confirmación de entrega
    'LEIDA',          -- Leída por usuario
    'FALLIDA',        -- Falló el envío
    'RECHAZADA'       -- Rechazada por servidor
);
```

---

## 4. Reglas de Negocio

### 4.1 Gestión de Alertas

#### Creación
- Las alertas se generan automáticamente desde módulos (RISK, PEP, etc.)
- También pueden crearse manualmente por oficiales de cumplimiento
- Toda alerta DEBE estar asociada a un expediente
- Al crear, se genera automáticamente un registro en `alert_tracking`

#### Asignación
- Las alertas CRÍTICAS se asignan automáticamente al Oficial de Cumplimiento
- Las alertas ALTAS se asignan al pool de analistas
- La asignación genera un registro de tracking
- Se envía notificación al asignado

#### Seguimiento
- Cada cambio de estado genera un tracking inmutable
- Los comentarios son obligatorios para ciertos cambios de estado
- Las acciones tomadas deben documentarse
- La evidencia debe referenciarse

#### Cierre
- Solo puede cerrar: asignado, Oficial de Cumplimiento, Gerente
- Requiere razón de cierre obligatoria
- No se puede reabrir una alerta cerrada (se crea nueva)
- Genera tracking de cierre

### 4.2 No Eliminación

```sql
-- NO existe DELETE en alerts ni alert_tracking
-- Solo se permite cerrar con documentación

-- Política de retención: 7 años mínimo
-- Auditoría completa de todos los cambios
```

### 4.3 Escalación Automática

```sql
-- Reglas de escalación según nivel y tiempo sin atención

CRÍTICA: > 24 horas sin atención → Escalar a Gerente
ALTA:    > 48 horas sin atención → Escalar a Oficial
MEDIA:   > 72 horas sin atención → Escalar a Oficial
BAJA:    No se escala automáticamente
```

### 4.4 Notificaciones

```sql
-- Eventos que disparan notificaciones:

1. Creación de alerta CRÍTICA o ALTA
2. Asignación a usuario
3. Vencimiento de deadline (recordatorio 24h antes)
4. Escalación
5. Alerta vencida (deadline sobrepasado)
```

### 4.5 Priorización

El `priority_score` (0-100) se calcula dinámicamente:

```
priority_score = 
    (alert_level_weight * 40) +        // 40% por nivel
    (days_overdue * 5) +                // 5 puntos por día vencido
    (dossier_risk_level * 30) +        // 30% por riesgo expediente
    (escalated ? 20 : 0)                // 20 puntos si escalada
```

---

## 5. Vistas y Consultas Útiles

### 5.1 Vista de Alertas Activas

```sql
CREATE VIEW v_active_alerts AS
SELECT 
    a.alert_id,
    a.alert_code,
    a.alert_type,
    a.alert_level,
    a.status,
    a.detected_at,
    a.assigned_to,
    a.action_deadline,
    a.priority_score,
    d.dossier_id,
    d.subject_type,
    d.document_number,
    CASE 
        WHEN a.action_deadline < CURRENT_DATE 
        THEN true ELSE false 
    END AS is_overdue,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - a.detected_at)) AS days_open
FROM alerts a
INNER JOIN dossiers d ON a.dossier_id = d.dossier_uuid
WHERE a.status != 'CERRADA'
ORDER BY a.priority_score DESC, a.detected_at ASC;
```

### 5.2 Vista de Alertas por Usuario

```sql
CREATE VIEW v_my_alerts AS
SELECT 
    a.*,
    COUNT(at.tracking_id) AS tracking_count,
    MAX(at.performed_at) AS last_activity
FROM alerts a
LEFT JOIN alert_tracking at ON a.alert_id = at.alert_id
WHERE a.assigned_to = CURRENT_USER
  AND a.status != 'CERRADA'
GROUP BY a.alert_id
ORDER BY a.priority_score DESC;
```

### 5.3 Vista de Alertas Críticas Vencidas

```sql
CREATE VIEW v_critical_overdue_alerts AS
SELECT 
    a.*,
    d.dossier_id,
    d.document_number,
    (CURRENT_DATE - a.action_deadline) AS days_overdue
FROM alerts a
INNER JOIN dossiers d ON a.dossier_id = d.dossier_uuid
WHERE a.alert_level = 'CRÍTICA'
  AND a.status != 'CERRADA'
  AND a.action_deadline < CURRENT_DATE
ORDER BY days_overdue DESC;
```

### 5.4 Reporte de Desempeño por Usuario

```sql
CREATE VIEW v_alert_performance_by_user AS
SELECT 
    a.assigned_to,
    COUNT(*) FILTER (WHERE a.status = 'CERRADA') AS closed_count,
    COUNT(*) FILTER (WHERE a.status != 'CERRADA') AS open_count,
    AVG(EXTRACT(EPOCH FROM (a.closed_at - a.detected_at)) / 3600) 
        AS avg_resolution_hours,
    COUNT(*) FILTER (
        WHERE a.action_deadline < CURRENT_DATE 
          AND a.status != 'CERRADA'
    ) AS overdue_count
FROM alerts a
WHERE a.assigned_to IS NOT NULL
GROUP BY a.assigned_to;
```

---

## 6. Integración con Otros Módulos

### 6.1 Generación desde Módulo de Riesgo

```java
// Cuando se calcula un riesgo ALTO o CRÍTICO
if (riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL) {
    Alert alert = Alert.builder()
        .alertCode("ALT-002")
        .alertType("Riesgo Alto Detectado")
        .alertLevel(AlertLevel.CRÍTICA)
        .originModule("RISK")
        .dossierId(dossier.getDossierUuid())
        .description("Riesgo " + riskLevel + " detectado en evaluación")
        .detectedBy("SYSTEM")
        .requiresAction(true)
        .actionDeadline(LocalDate.now().plusDays(1))
        .build();
    
    alertService.createAlert(alert);
}
```

### 6.2 Generación desde Módulo PEP

```java
// Cuando se detecta un PEP
if (pepStatus == PepStatus.CONFIRMED) {
    Alert alert = Alert.builder()
        .alertCode("ALT-001")
        .alertType("PEP Detectado")
        .alertLevel(AlertLevel.ALTA)
        .originModule("PEP")
        .dossierId(dossier.getDossierUuid())
        .description("PEP confirmado: " + pepType)
        .detectedBy("SYSTEM")
        .requiresAction(true)
        .actionDeadline(LocalDate.now().plusDays(3))
        .build();
    
    alertService.createAlert(alert);
}
```

### 6.3 Generación desde Screening

```java
// Cuando hay match en listas restrictivas
if (screeningResult.hasMatch()) {
    Alert alert = Alert.builder()
        .alertCode("ALT-004")
        .alertType("Screening Positivo")
        .alertLevel(AlertLevel.CRÍTICA)
        .originModule("SCREENING")
        .dossierId(dossier.getDossierUuid())
        .description("Match en lista: " + screeningResult.getListName())
        .detectedBy("SYSTEM")
        .requiresAction(true)
        .actionDeadline(LocalDate.now().plusDays(1))
        .build();
    
    alertService.createAlert(alert);
}
```

---

## 7. Servicios y Operaciones

### 7.1 AlertManagementService

```java
@Service
public class AlertManagementService {
    
    // Crear alerta
    Alert createAlert(CreateAlertRequest request);
    
    // Asignar alerta
    void assignAlert(UUID alertId, String userId);
    
    // Agregar seguimiento
    AlertTracking addTracking(UUID alertId, TrackingRequest request);
    
    // Cambiar estado
    void changeStatus(UUID alertId, AlertStatus newStatus, String reason);
    
    // Cerrar alerta
    void closeAlert(UUID alertId, CloseAlertRequest request);
    
    // Escalar alerta
    void escalateAlert(UUID alertId, String escalateTo, String reason);
    
    // Consultas
    List<Alert> getMyAlerts(String userId);
    List<Alert> getAlertsByDossier(UUID dossierId);
    List<Alert> getCriticalAlerts();
    List<Alert> getOverdueAlerts();
    
    // Automatización
    void processAutoEscalation();
    void sendDeadlineReminders();
}
```

---

## 8. Reportes y Métricas

### 8.1 Métricas Clave (KPIs)

```sql
-- 1. Tiempo promedio de resolución por nivel
SELECT 
    alert_level,
    AVG(EXTRACT(EPOCH FROM (closed_at - detected_at)) / 3600) AS avg_hours
FROM alerts
WHERE closed_at IS NOT NULL
GROUP BY alert_level;

-- 2. Alertas vencidas por módulo
SELECT 
    origin_module,
    COUNT(*) AS overdue_count
FROM alerts
WHERE status != 'CERRADA'
  AND action_deadline < CURRENT_DATE
GROUP BY origin_module;

-- 3. Tasa de cierre mensual
SELECT 
    DATE_TRUNC('month', closed_at) AS month,
    COUNT(*) AS closed_count,
    AVG(EXTRACT(EPOCH FROM (closed_at - detected_at)) / 86400) AS avg_days
FROM alerts
WHERE closed_at IS NOT NULL
GROUP BY DATE_TRUNC('month', closed_at)
ORDER BY month DESC;

-- 4. Alertas por estado
SELECT 
    status,
    alert_level,
    COUNT(*) AS count
FROM alerts
WHERE status != 'CERRADA'
GROUP BY status, alert_level
ORDER BY status, alert_level;
```

### 8.2 Dashboard de Cumplimiento

```sql
-- Resumen ejecutivo de alertas
SELECT 
    COUNT(*) FILTER (WHERE status = 'NUEVA') AS nuevas,
    COUNT(*) FILTER (WHERE status = 'EN_SEGUIMIENTO') AS en_seguimiento,
    COUNT(*) FILTER (WHERE status = 'ATENDIDA') AS atendidas,
    COUNT(*) FILTER (WHERE alert_level = 'CRÍTICA' AND status != 'CERRADA') AS criticas_abiertas,
    COUNT(*) FILTER (WHERE action_deadline < CURRENT_DATE AND status != 'CERRADA') AS vencidas,
    AVG(priority_score) AS avg_priority
FROM alerts
WHERE status != 'CERRADA';
```

---

## 9. Seguridad y Auditoría

### 9.1 Control de Acceso

```java
// Permisos por rol
ANALISTA_CUMPLIMIENTO:
    - Ver alertas asignadas
    - Agregar seguimiento
    - Cambiar estado (excepto CERRADA)
    
OFICIAL_CUMPLIMIENTO:
    - Ver todas las alertas
    - Asignar/Reasignar
    - Cerrar alertas
    - Escalar
    
GERENTE_CUMPLIMIENTO:
    - Acceso total
    - Reportes ejecutivos
    - Configuración de tipos
```

### 9.2 Auditoría

Todos los cambios quedan registrados:
- Qué se cambió (tracking.action_type)
- Quién lo cambió (tracking.performed_by)
- Cuándo (tracking.performed_at)
- Desde dónde (tracking.ip_address)
- Estado anterior y nuevo (previous/new_status)

### 9.3 Retención de Datos

```sql
-- Política: Retener alertas cerradas por 7 años mínimo
-- NO se permite eliminación bajo ninguna circunstancia
-- Backup incremental diario
-- Backup completo mensual
```

---

## 10. Migraciones y Mantenimiento

### 10.1 Migración Inicial

Ver archivo: `scripts/sql/03_create_alert_tables.sql`

### 10.2 Tareas de Mantenimiento

```sql
-- 1. Reindexación mensual
REINDEX TABLE alerts;
REINDEX TABLE alert_tracking;

-- 2. VACUUM para limpiar espacio
VACUUM ANALYZE alerts;
VACUUM ANALYZE alert_tracking;

-- 3. Actualizar estadísticas
ANALYZE alerts;
ANALYZE alert_tracking;
```

### 10.3 Monitoreo

```sql
-- Alertas sin asignar por más de 24 horas
SELECT * FROM alerts
WHERE assigned_to IS NULL
  AND detected_at < NOW() - INTERVAL '24 hours'
  AND status != 'CERRADA';

-- Crecimiento de tracking (debe ser lineal)
SELECT 
    DATE(performed_at) AS date,
    COUNT(*) AS tracking_count
FROM alert_tracking
WHERE performed_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(performed_at)
ORDER BY date;
```

---

## 11. Casos de Uso

### 11.1 Flujo: Alerta de Riesgo Alto

```
1. Sistema detecta riesgo ALTO en evaluación
2. Genera alerta ALT-002 automáticamente
3. Asigna a Oficial de Cumplimiento
4. Envía notificación EMAIL + IN_APP
5. Oficial revisa expediente
6. Agrega comentario con hallazgos
7. Cambia estado a EN_SEGUIMIENTO
8. Toma acción correctiva
9. Documenta evidencia
10. Cambia estado a ATENDIDA
11. Gerente revisa y aprueba cierre
12. Cierra alerta con razón documentada
```

### 11.2 Flujo: Escalación Automática

```
1. Alerta CRÍTICA creada a las 09:00 del día 1
2. Sistema verifica cada hora
3. A las 09:00 del día 2 (24h después):
   - Detecta que sigue en estado NUEVA
   - Genera escalación automática
   - Notifica a Gerente de Cumplimiento
   - Actualiza alerta (escalated = true)
   - Registra tracking de escalación
   - Aumenta priority_score
```

### 11.3 Flujo: Seguimiento Documentado

```
Usuario: "Agregar comentario a alerta"

1. Validar permisos (¿es el asignado?)
2. Validar estado (¿no está cerrada?)
3. Crear tracking:
   - action_type = COMENTARIO_AGREGADO
   - comment = "texto del usuario"
   - performed_by = userId
   - performed_at = ahora
   - ip_address = request.ip
4. Guardar tracking (inmutable)
5. Notificar a interesados
6. Retornar confirmación
```

---

## 12. Conclusiones

El modelo de alertas del SIAR proporciona:

1. **Gestión activa**: Workflow completo con estados y transiciones controladas
2. **Trazabilidad total**: Historial inmutable de todas las acciones
3. **Integración completa**: Vinculación con todos los módulos del sistema
4. **No eliminación**: Cumplimiento regulatorio con retención permanente
5. **Automatización**: Generación, asignación y escalación automáticas
6. **Priorización inteligente**: Scoring dinámico basado en múltiples factores
7. **Notificaciones multi-canal**: Email, SMS, In-App, Push
8. **Auditoría completa**: Registro técnico de todas las operaciones

Este modelo asegura el cumplimiento de las regulaciones de AML/CFT y proporciona una herramienta eficaz para la gestión proactiva de riesgos.
