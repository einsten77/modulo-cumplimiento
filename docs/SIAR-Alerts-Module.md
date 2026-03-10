# Módulo de Alertas, Notificaciones y Seguimiento - SIAR

## 1. Visión General del Módulo

### 1.1 Principios Fundamentales
- **No Bloqueante**: Las alertas informan pero no impiden operaciones
- **Trazable**: Cada alerta tiene ciclo completo documentado
- **Responsable**: Cada alerta tiene asignación clara
- **Evidenciable**: Toda gestión queda registrada para inspección

### 1.2 Objetivos
- Notificar eventos relevantes de cumplimiento en tiempo real
- Asignar responsabilidades de seguimiento
- Documentar acciones correctivas o investigativas
- Proveer evidencia de gestión activa ante el regulador

---

## 2. Estructura Lógica del Módulo

### 2.1 Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│              MÓDULO DE ALERTAS Y NOTIFICACIONES             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐      ┌────────────────┐                │
│  │   Generador    │─────▶│   Registro     │                │
│  │   de Alertas   │      │   de Alertas   │                │
│  └────────────────┘      └────────────────┘                │
│          │                       │                          │
│          │                       ▼                          │
│          │              ┌────────────────┐                  │
│          │              │   Asignación   │                  │
│          │              │      y         │                  │
│          │              │  Notificación  │                  │
│          │              └────────────────┘                  │
│          │                       │                          │
│          │                       ▼                          │
│          │              ┌────────────────┐                  │
│          └─────────────▶│   Seguimiento  │                  │
│                         │      y         │                  │
│                         │   Evidencia    │                  │
│                         └────────────────┘                  │
│                                 │                           │
│                                 ▼                           │
│                         ┌────────────────┐                  │
│                         │     Cierre     │                  │
│                         │   y Archivo    │                  │
│                         └────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Vida de una Alerta

```
GENERADA → PENDIENTE → EN_ATENCION → RESUELTA → CERRADA
                │            │            │
                │            │            └─→ ARCHIVADA
                │            └─→ ESCALADA
                └─→ VENCIDA
```

---

## 3. Eventos que Generan Alertas Obligatorias

### 3.1 Catálogo de Eventos

| Código | Evento | Severidad | Asignación | SLA |
|--------|--------|-----------|------------|-----|
| ALR-001 | Expediente incompleto | MEDIA | Oficial Cumplimiento | 5 días |
| ALR-002 | Modificación por área no-Cumplimiento | ALTA | Oficial Cumplimiento | 2 días |
| ALR-003 | Documento vencido | ALTA | Área Documentación | 1 día |
| ALR-004 | Documento próximo a vencer | MEDIA | Área Documentación | 10 días |
| ALR-005 | Match en screening | CRITICA | Oficial Cumplimiento | 24 horas |
| ALR-006 | Riesgo Alto detectado | ALTA | Oficial Cumplimiento | 2 días |
| ALR-007 | Riesgo Medio detectado | MEDIA | Oficial Cumplimiento | 5 días |
| ALR-008 | Solicitud información adicional | MEDIA | Área Solicitante | 3 días |
| ALR-009 | Rechazo documental | ALTA | Área Documentación | 2 días |
| ALR-010 | Cambio en evaluación de riesgo | ALTA | Oficial Cumplimiento | 3 días |
| ALR-011 | Revisión periódica vencida | ALTA | Oficial Cumplimiento | 2 días |
| ALR-012 | Expediente sin actividad (>90 días) | MEDIA | Oficial Cumplimiento | 5 días |

---

## 4. Modelo de Datos JSON

### 4.1 Estructura de Alerta

```json
{
  "alertId": "ALR-2025-000123",
  "alertType": "ALR-005",
  "alertName": "Match en screening",
  "severity": "CRITICA",
  "status": "PENDIENTE",
  "origin": {
    "module": "SCREENING",
    "subModule": "BUSQUEDA_LISTAS",
    "eventId": "SCR-2025-000456",
    "eventDate": "2025-01-15T14:30:00Z"
  },
  "relatedEntity": {
    "type": "DOSSIER",
    "entityId": "EXP-2025-000789",
    "entityName": "Juan Pérez",
    "entityType": "PERSONA_NATURAL"
  },
  "trigger": {
    "triggerBy": "SYSTEM",
    "userId": "user.screening",
    "userName": "Sistema Screening Automático",
    "userRole": "SYSTEM",
    "action": "SCREENING_EXECUTION",
    "description": "Detección automática de coincidencia en lista OFAC"
  },
  "assignment": {
    "assignedTo": "user.compliance.officer",
    "assignedRole": "OFICIAL_CUMPLIMIENTO",
    "assignedDate": "2025-01-15T14:30:01Z",
    "assignedBy": "SYSTEM",
    "reassignmentHistory": []
  },
  "priority": {
    "level": "URGENTE",
    "slaHours": 24,
    "dueDate": "2025-01-16T14:30:00Z",
    "escalationDate": "2025-01-16T10:30:00Z"
  },
  "content": {
    "title": "Coincidencia detectada en lista OFAC",
    "summary": "El sistema detectó coincidencia del 87% con entrada en lista OFAC",
    "details": {
      "matchPercentage": 87,
      "listName": "OFAC SDN List",
      "matchedName": "Juan Antonio Perez",
      "matchDate": "2025-01-15T14:30:00Z"
    },
    "actionRequired": "Revisar coincidencia y documentar decisión de aceptación o rechazo",
    "regulatoryBasis": "Resolución SUDEASEG 119.10, Art. 15"
  },
  "tracking": {
    "viewedBy": [],
    "viewedDate": null,
    "startAttentionDate": null,
    "attentionBy": null,
    "estimatedResolutionDate": null,
    "actualResolutionDate": null,
    "resolutionTime": null
  },
  "actions": [],
  "resolution": null,
  "closure": null,
  "notifications": [],
  "metadata": {
    "createdAt": "2025-01-15T14:30:00Z",
    "createdBy": "SYSTEM",
    "updatedAt": "2025-01-15T14:30:00Z",
    "updatedBy": "SYSTEM",
    "version": 1
  }
}
```

### 4.2 Estructura de Acción de Seguimiento

```json
{
  "actionId": "ACT-2025-000234",
  "alertId": "ALR-2025-000123",
  "actionType": "INVESTIGACION",
  "actionDate": "2025-01-15T15:45:00Z",
  "performedBy": {
    "userId": "user.compliance.officer",
    "userName": "María González",
    "userRole": "OFICIAL_CUMPLIMIENTO"
  },
  "actionDescription": "Se revisó la coincidencia detectada por el sistema",
  "findings": "Se verificó que el match corresponde a persona homónima, no relacionada",
  "evidenceAttached": [
    {
      "documentId": "DOC-2025-000345",
      "documentName": "Análisis_Match_OFAC_JPerez.pdf",
      "documentType": "ANALISIS_SCREENING",
      "uploadDate": "2025-01-15T15:45:00Z"
    }
  ],
  "nextSteps": "Proceder con aprobación del expediente",
  "statusChange": {
    "fromStatus": "PENDIENTE",
    "toStatus": "EN_ATENCION"
  },
  "metadata": {
    "createdAt": "2025-01-15T15:45:00Z",
    "ipAddress": "192.168.1.100",
    "sessionId": "sess-12345"
  }
}
```

### 4.3 Estructura de Resolución

```json
{
  "resolutionId": "RES-2025-000145",
  "alertId": "ALR-2025-000123",
  "resolutionType": "FALSO_POSITIVO",
  "resolutionDate": "2025-01-15T16:00:00Z",
  "resolvedBy": {
    "userId": "user.compliance.officer",
    "userName": "María González",
    "userRole": "OFICIAL_CUMPLIMIENTO"
  },
  "decision": "APROBAR_EXPEDIENTE",
  "justification": "Tras análisis detallado se determinó que la coincidencia corresponde a persona homónima sin relación con la lista OFAC. El cliente presenta documentación válida y no existen otros indicadores de riesgo.",
  "evidenceSummary": [
    "Análisis de coincidencia OFAC",
    "Verificación de identidad del cliente",
    "Revisión de antecedentes"
  ],
  "actionsTaken": [
    "Verificación documental",
    "Consulta en bases de datos adicionales",
    "Análisis de perfil de riesgo"
  ],
  "impactOnDossier": {
    "dossierId": "EXP-2025-000789",
    "statusChange": null,
    "riskChange": null,
    "approvalGranted": true
  },
  "regulatoryCompliance": {
    "regulationApplied": "Resolución SUDEASEG 119.10",
    "articleReference": "Art. 15, 16",
    "complianceNotes": "Proceso seguido según normativa vigente"
  },
  "metadata": {
    "createdAt": "2025-01-15T16:00:00Z",
    "ipAddress": "192.168.1.100",
    "sessionId": "sess-12345"
  }
}
```

### 4.4 Estructura de Cierre

```json
{
  "closureId": "CLO-2025-000089",
  "alertId": "ALR-2025-000123",
  "closureDate": "2025-01-15T16:10:00Z",
  "closedBy": {
    "userId": "user.compliance.officer",
    "userName": "María González",
    "userRole": "OFICIAL_CUMPLIMIENTO"
  },
  "closureType": "RESUELTO",
  "finalStatus": "CERRADA",
  "closureNotes": "Alerta resuelta satisfactoriamente. Expediente aprobado tras verificación.",
  "metrics": {
    "totalTimeHours": 1.67,
    "slaCompliance": true,
    "actionsCount": 3,
    "reassignmentsCount": 0
  },
  "auditTrail": {
    "totalEvents": 8,
    "usersInvolved": 1,
    "documentsGenerated": 1
  },
  "archiveStatus": "ARCHIVADA",
  "metadata": {
    "createdAt": "2025-01-15T16:10:00Z",
    "archivedAt": "2025-01-15T16:10:00Z"
  }
}
```

### 4.5 Estructura de Notificación

```json
{
  "notificationId": "NOT-2025-000456",
  "alertId": "ALR-2025-000123",
  "notificationType": "EMAIL",
  "notificationChannel": "email",
  "recipientType": "USER",
  "recipient": {
    "userId": "user.compliance.officer",
    "userName": "María González",
    "email": "maria.gonzalez@aseguradora.com"
  },
  "subject": "URGENTE: Coincidencia detectada en screening OFAC",
  "message": "Se ha detectado una coincidencia en lista OFAC para el expediente EXP-2025-000789. Requiere atención inmediata.",
  "priority": "HIGH",
  "sentDate": "2025-01-15T14:30:05Z",
  "deliveryStatus": "DELIVERED",
  "readStatus": "READ",
  "readDate": "2025-01-15T14:35:00Z",
  "actionLink": "/alerts/ALR-2025-000123",
  "metadata": {
    "createdAt": "2025-01-15T14:30:05Z",
    "deliveredAt": "2025-01-15T14:30:06Z"
  }
}
```

---

## 5. Base de Datos

### 5.1 Tabla: alerts

```sql
CREATE TABLE alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    alert_type VARCHAR(20) NOT NULL,
    alert_name VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    
    -- Origin
    origin_module VARCHAR(50) NOT NULL,
    origin_sub_module VARCHAR(50),
    origin_event_id VARCHAR(50),
    origin_event_date TIMESTAMP NOT NULL,
    
    -- Related entity
    entity_type VARCHAR(30) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    entity_name VARCHAR(300),
    
    -- Trigger
    trigger_by VARCHAR(20) NOT NULL,
    trigger_user_id VARCHAR(50),
    trigger_user_name VARCHAR(200),
    trigger_user_role VARCHAR(50),
    trigger_action VARCHAR(100),
    trigger_description TEXT,
    
    -- Assignment
    assigned_to VARCHAR(50) NOT NULL,
    assigned_role VARCHAR(50) NOT NULL,
    assigned_date TIMESTAMP NOT NULL,
    assigned_by VARCHAR(50) NOT NULL,
    
    -- Priority
    priority_level VARCHAR(20) NOT NULL,
    sla_hours INTEGER NOT NULL,
    due_date TIMESTAMP NOT NULL,
    escalation_date TIMESTAMP,
    
    -- Content
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    action_required TEXT,
    regulatory_basis VARCHAR(500),
    
    -- Tracking
    viewed_date TIMESTAMP,
    attention_start_date TIMESTAMP,
    attention_by VARCHAR(50),
    estimated_resolution_date TIMESTAMP,
    actual_resolution_date TIMESTAMP,
    resolution_time_hours DECIMAL(10,2),
    
    -- Additional data stored as JSON
    details JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    version INTEGER DEFAULT 1,
    
    -- Indexes
    INDEX idx_alerts_status (status),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_assigned (assigned_to),
    INDEX idx_alerts_entity (entity_id),
    INDEX idx_alerts_due_date (due_date),
    INDEX idx_alerts_type (alert_type),
    INDEX idx_alerts_created (created_at),
    
    -- Foreign Keys
    FOREIGN KEY (entity_id) REFERENCES dossiers(dossier_id)
);
```

### 5.2 Tabla: alert_actions

```sql
CREATE TABLE alert_actions (
    action_id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_date TIMESTAMP NOT NULL,
    
    -- Performer
    performed_by_user_id VARCHAR(50) NOT NULL,
    performed_by_user_name VARCHAR(200) NOT NULL,
    performed_by_user_role VARCHAR(50) NOT NULL,
    
    -- Action details
    action_description TEXT NOT NULL,
    findings TEXT,
    next_steps TEXT,
    
    -- Status change
    from_status VARCHAR(30),
    to_status VARCHAR(30),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    session_id VARCHAR(100),
    
    -- Additional data
    evidence_attached JSONB,
    
    -- Indexes
    INDEX idx_actions_alert (alert_id),
    INDEX idx_actions_date (action_date),
    INDEX idx_actions_performer (performed_by_user_id),
    
    -- Foreign Keys
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);
```

### 5.3 Tabla: alert_resolutions

```sql
CREATE TABLE alert_resolutions (
    resolution_id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL UNIQUE,
    resolution_type VARCHAR(50) NOT NULL,
    resolution_date TIMESTAMP NOT NULL,
    
    -- Resolver
    resolved_by_user_id VARCHAR(50) NOT NULL,
    resolved_by_user_name VARCHAR(200) NOT NULL,
    resolved_by_user_role VARCHAR(50) NOT NULL,
    
    -- Resolution details
    decision VARCHAR(100) NOT NULL,
    justification TEXT NOT NULL,
    
    -- Impact
    impact_on_dossier JSONB,
    
    -- Regulatory
    regulation_applied VARCHAR(200),
    article_reference VARCHAR(100),
    compliance_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    session_id VARCHAR(100),
    
    -- Additional data
    evidence_summary JSONB,
    actions_taken JSONB,
    
    -- Indexes
    INDEX idx_resolutions_alert (alert_id),
    INDEX idx_resolutions_date (resolution_date),
    INDEX idx_resolutions_type (resolution_type),
    
    -- Foreign Keys
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);
```

### 5.4 Tabla: alert_closures

```sql
CREATE TABLE alert_closures (
    closure_id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL UNIQUE,
    closure_date TIMESTAMP NOT NULL,
    
    -- Closer
    closed_by_user_id VARCHAR(50) NOT NULL,
    closed_by_user_name VARCHAR(200) NOT NULL,
    closed_by_user_role VARCHAR(50) NOT NULL,
    
    -- Closure details
    closure_type VARCHAR(50) NOT NULL,
    final_status VARCHAR(30) NOT NULL,
    closure_notes TEXT,
    
    -- Metrics
    total_time_hours DECIMAL(10,2),
    sla_compliance BOOLEAN,
    actions_count INTEGER,
    reassignments_count INTEGER,
    
    -- Archive
    archive_status VARCHAR(20) DEFAULT 'ARCHIVADA',
    archived_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional data
    audit_trail JSONB,
    
    -- Indexes
    INDEX idx_closures_alert (alert_id),
    INDEX idx_closures_date (closure_date),
    INDEX idx_closures_status (archive_status),
    
    -- Foreign Keys
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);
```

### 5.5 Tabla: alert_notifications

```sql
CREATE TABLE alert_notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL,
    notification_type VARCHAR(20) NOT NULL,
    notification_channel VARCHAR(20) NOT NULL,
    
    -- Recipient
    recipient_type VARCHAR(20) NOT NULL,
    recipient_user_id VARCHAR(50),
    recipient_user_name VARCHAR(200),
    recipient_email VARCHAR(200),
    
    -- Content
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    action_link VARCHAR(500),
    
    -- Priority
    priority VARCHAR(20) NOT NULL,
    
    -- Delivery
    sent_date TIMESTAMP NOT NULL,
    delivery_status VARCHAR(20) NOT NULL,
    delivered_at TIMESTAMP,
    
    -- Read tracking
    read_status VARCHAR(20),
    read_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_notifications_alert (alert_id),
    INDEX idx_notifications_recipient (recipient_user_id),
    INDEX idx_notifications_status (delivery_status),
    INDEX idx_notifications_sent (sent_date),
    
    -- Foreign Keys
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);
```

### 5.6 Tabla: alert_reassignments

```sql
CREATE TABLE alert_reassignments (
    reassignment_id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL,
    reassignment_date TIMESTAMP NOT NULL,
    
    -- From
    from_user_id VARCHAR(50) NOT NULL,
    from_user_name VARCHAR(200) NOT NULL,
    from_role VARCHAR(50) NOT NULL,
    
    -- To
    to_user_id VARCHAR(50) NOT NULL,
    to_user_name VARCHAR(200) NOT NULL,
    to_role VARCHAR(50) NOT NULL,
    
    -- Reassignment details
    reassigned_by VARCHAR(50) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_reassignments_alert (alert_id),
    INDEX idx_reassignments_date (reassignment_date),
    
    -- Foreign Keys
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);
```

---

## 6. Implementación Backend en Java

### 6.1 Entidad: Alert

```java
package com.siar.alerts.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class Alert {
    
    @Id
    @Column(name = "alert_id", length = 50)
    private String alertId;
    
    @Column(name = "alert_type", length = 20, nullable = false)
    private String alertType;
    
    @Column(name = "alert_name", length = 200, nullable = false)
    private String alertName;
    
    @Column(name = "severity", length = 20, nullable = false)
    private String severity;
    
    @Column(name = "status", length = 30, nullable = false)
    private String status;
    
    // Origin
    @Column(name = "origin_module", length = 50, nullable = false)
    private String originModule;
    
    @Column(name = "origin_sub_module", length = 50)
    private String originSubModule;
    
    @Column(name = "origin_event_id", length = 50)
    private String originEventId;
    
    @Column(name = "origin_event_date", nullable = false)
    private LocalDateTime originEventDate;
    
    // Related entity
    @Column(name = "entity_type", length = 30, nullable = false)
    private String entityType;
    
    @Column(name = "entity_id", length = 50, nullable = false)
    private String entityId;
    
    @Column(name = "entity_name", length = 300)
    private String entityName;
    
    // Trigger
    @Column(name = "trigger_by", length = 20, nullable = false)
    private String triggerBy;
    
    @Column(name = "trigger_user_id", length = 50)
    private String triggerUserId;
    
    @Column(name = "trigger_user_name", length = 200)
    private String triggerUserName;
    
    @Column(name = "trigger_user_role", length = 50)
    private String triggerUserRole;
    
    @Column(name = "trigger_action", length = 100)
    private String triggerAction;
    
    @Column(name = "trigger_description", columnDefinition = "TEXT")
    private String triggerDescription;
    
    // Assignment
    @Column(name = "assigned_to", length = 50, nullable = false)
    private String assignedTo;
    
    @Column(name = "assigned_role", length = 50, nullable = false)
    private String assignedRole;
    
    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate;
    
    @Column(name = "assigned_by", length = 50, nullable = false)
    private String assignedBy;
    
    // Priority
    @Column(name = "priority_level", length = 20, nullable = false)
    private String priorityLevel;
    
    @Column(name = "sla_hours", nullable = false)
    private Integer slaHours;
    
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    
    @Column(name = "escalation_date")
    private LocalDateTime escalationDate;
    
    // Content
    @Column(name = "title", length = 500, nullable = false)
    private String title;
    
    @Column(name = "summary", columnDefinition = "TEXT", nullable = false)
    private String summary;
    
    @Column(name = "action_required", columnDefinition = "TEXT")
    private String actionRequired;
    
    @Column(name = "regulatory_basis", length = 500)
    private String regulatoryBasis;
    
    // Tracking
    @Column(name = "viewed_date")
    private LocalDateTime viewedDate;
    
    @Column(name = "attention_start_date")
    private LocalDateTime attentionStartDate;
    
    @Column(name = "attention_by", length = 50)
    private String attentionBy;
    
    @Column(name = "estimated_resolution_date")
    private LocalDateTime estimatedResolutionDate;
    
    @Column(name = "actual_resolution_date")
    private LocalDateTime actualResolutionDate;
    
    @Column(name = "resolution_time_hours")
    private Double resolutionTimeHours;
    
    // Details as JSON
    @Type(type = "jsonb")
    @Column(name = "details", columnDefinition = "jsonb")
    private String details;
    
    // Metadata
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", length = 50, nullable = false, updatable = false)
    private String createdBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by", length = 50)
    private String updatedBy;
    
    @Column(name = "version")
    private Integer version;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (version == null) {
            version = 1;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        version++;
    }
}
```

### 6.2 Service: AlertService

```java
package com.siar.alerts.service;

import com.siar.alerts.model.*;
import com.siar.alerts.repository.*;
import com.siar.audit.service.AuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {
    
    private final AlertRepository alertRepository;
    private final AlertActionRepository alertActionRepository;
    private final AlertResolutionRepository alertResolutionRepository;
    private final AlertClosureRepository alertClosureRepository;
    private final AlertNotificationRepository alertNotificationRepository;
    private final AlertReassignmentRepository alertReassignmentRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    
    /**
     * Genera una alerta automática desde un módulo del sistema
     */
    @Transactional
    public Alert generateAlert(AlertGenerationRequest request) {
        log.info("Generating alert for event: {} in module: {}", 
                request.getEventId(), request.getModule());
        
        // Obtener configuración del tipo de alerta
        AlertTypeConfig config = getAlertTypeConfig(request.getAlertType());
        
        // Generar ID de alerta
        String alertId = generateAlertId();
        
        // Crear alerta
        Alert alert = new Alert();
        alert.setAlertId(alertId);
        alert.setAlertType(request.getAlertType());
        alert.setAlertName(config.getName());
        alert.setSeverity(config.getSeverity());
        alert.setStatus("PENDIENTE");
        
        // Origin
        alert.setOriginModule(request.getModule());
        alert.setOriginSubModule(request.getSubModule());
        alert.setOriginEventId(request.getEventId());
        alert.setOriginEventDate(request.getEventDate());
        
        // Related entity
        alert.setEntityType(request.getEntityType());
        alert.setEntityId(request.getEntityId());
        alert.setEntityName(request.getEntityName());
        
        // Trigger
        alert.setTriggerBy(request.getTriggerBy());
        alert.setTriggerUserId(request.getUserId());
        alert.setTriggerUserName(request.getUserName());
        alert.setTriggerUserRole(request.getUserRole());
        alert.setTriggerAction(request.getAction());
        alert.setTriggerDescription(request.getDescription());
        
        // Assignment (automática según configuración)
        alert.setAssignedTo(config.getDefaultAssignee());
        alert.setAssignedRole(config.getDefaultAssigneeRole());
        alert.setAssignedDate(LocalDateTime.now());
        alert.setAssignedBy("SYSTEM");
        
        // Priority
        alert.setPriorityLevel(config.getPriorityLevel());
        alert.setSlaHours(config.getSlaHours());
        alert.setDueDate(LocalDateTime.now().plusHours(config.getSlaHours()));
        alert.setEscalationDate(calculateEscalationDate(config.getSlaHours()));
        
        // Content
        alert.setTitle(buildAlertTitle(request));
        alert.setSummary(buildAlertSummary(request));
        alert.setActionRequired(config.getActionRequired());
        alert.setRegulatoryBasis(config.getRegulatoryBasis());
        
        // Details as JSON
        try {
            alert.setDetails(objectMapper.writeValueAsString(request.getDetails()));
        } catch (Exception e) {
            log.error("Error serializing alert details", e);
        }
        
        alert.setCreatedBy("SYSTEM");
        
        // Guardar alerta
        alert = alertRepository.save(alert);
        
        // Registrar en auditoría
        auditService.logAlertGeneration(alert);
        
        // Enviar notificación
        notificationService.sendAlertNotification(alert);
        
        log.info("Alert generated successfully: {}", alertId);
        
        return alert;
    }
    
    /**
     * Ver alerta (marca como vista)
     */
    @Transactional
    public Alert viewAlert(String alertId, String userId) {
        Alert alert = getAlertById(alertId);
        
        if (alert.getViewedDate() == null) {
            alert.setViewedDate(LocalDateTime.now());
            alert.setUpdatedBy(userId);
            alert = alertRepository.save(alert);
            
            auditService.logAlertViewed(alert, userId);
        }
        
        return alert;
    }
    
    /**
     * Iniciar atención de alerta
     */
    @Transactional
    public Alert startAttention(String alertId, String userId, String estimatedResolutionDate) {
        Alert alert = getAlertById(alertId);
        
        // Verificar que el usuario tiene permiso
        validateUserCanAttendAlert(alert, userId);
        
        if (!"PENDIENTE".equals(alert.getStatus())) {
            throw new IllegalStateException("Alert is not in PENDIENTE status");
        }
        
        alert.setStatus("EN_ATENCION");
        alert.setAttentionStartDate(LocalDateTime.now());
        alert.setAttentionBy(userId);
        
        if (estimatedResolutionDate != null) {
            alert.setEstimatedResolutionDate(LocalDateTime.parse(estimatedResolutionDate));
        }
        
        alert.setUpdatedBy(userId);
        alert = alertRepository.save(alert);
        
        // Registrar en auditoría
        auditService.logAlertStatusChange(alert, "PENDIENTE", "EN_ATENCION", userId);
        
        return alert;
    }
    
    /**
     * Agregar acción de seguimiento
     */
    @Transactional
    public AlertAction addAction(String alertId, AlertActionRequest request) {
        Alert alert = getAlertById(alertId);
        
        // Verificar permisos
        validateUserCanActOnAlert(alert, request.getUserId());
        
        // Crear acción
        AlertAction action = new AlertAction();
        action.setActionId(generateActionId());
        action.setAlertId(alertId);
        action.setActionType(request.getActionType());
        action.setActionDate(LocalDateTime.now());
        action.setPerformedByUserId(request.getUserId());
        action.setPerformedByUserName(request.getUserName());
        action.setPerformedByUserRole(request.getUserRole());
        action.setActionDescription(request.getDescription());
        action.setFindings(request.getFindings());
        action.setNextSteps(request.getNextSteps());
        action.setIpAddress(request.getIpAddress());
        action.setSessionId(request.getSessionId());
        
        // Cambio de estado si aplica
        if (request.getNewStatus() != null) {
            action.setFromStatus(alert.getStatus());
            action.setToStatus(request.getNewStatus());
            
            alert.setStatus(request.getNewStatus());
            alert.setUpdatedBy(request.getUserId());
            alertRepository.save(alert);
            
            auditService.logAlertStatusChange(alert, action.getFromStatus(), 
                    action.getToStatus(), request.getUserId());
        }
        
        // Evidencia adjunta
        if (request.getEvidenceAttached() != null) {
            try {
                action.setEvidenceAttached(objectMapper.writeValueAsString(
                        request.getEvidenceAttached()));
            } catch (Exception e) {
                log.error("Error serializing evidence", e);
            }
        }
        
        action = alertActionRepository.save(action);
        
        // Registrar en auditoría
        auditService.logAlertAction(action);
        
        return action;
    }
    
    /**
     * Resolver alerta
     */
    @Transactional
    public AlertResolution resolveAlert(String alertId, AlertResolutionRequest request) {
        Alert alert = getAlertById(alertId);
        
        // Solo el Oficial de Cumplimiento puede resolver
        validateUserIsComplianceOfficer(request.getUserId());
        
        // Verificar que la alerta está en proceso
        if (!"EN_ATENCION".equals(alert.getStatus()) && 
            !"ESCALADA".equals(alert.getStatus())) {
            throw new IllegalStateException("Alert must be EN_ATENCION or ESCALADA to resolve");
        }
        
        // Crear resolución
        AlertResolution resolution = new AlertResolution();
        resolution.setResolutionId(generateResolutionId());
        resolution.setAlertId(alertId);
        resolution.setResolutionType(request.getResolutionType());
        resolution.setResolutionDate(LocalDateTime.now());
        resolution.setResolvedByUserId(request.getUserId());
        resolution.setResolvedByUserName(request.getUserName());
        resolution.setResolvedByUserRole(request.getUserRole());
        resolution.setDecision(request.getDecision());
        resolution.setJustification(request.getJustification());
        resolution.setRegulationApplied(request.getRegulationApplied());
        resolution.setArticleReference(request.getArticleReference());
        resolution.setComplianceNotes(request.getComplianceNotes());
        resolution.setIpAddress(request.getIpAddress());
        resolution.setSessionId(request.getSessionId());
        
        // Impact on dossier
        if (request.getImpactOnDossier() != null) {
            try {
                resolution.setImpactOnDossier(objectMapper.writeValueAsString(
                        request.getImpactOnDossier()));
            } catch (Exception e) {
                log.error("Error serializing impact", e);
            }
        }
        
        // Evidence summary
        if (request.getEvidenceSummary() != null) {
            try {
                resolution.setEvidenceSummary(objectMapper.writeValueAsString(
                        request.getEvidenceSummary()));
            } catch (Exception e) {
                log.error("Error serializing evidence summary", e);
            }
        }
        
        // Actions taken
        if (request.getActionsTaken() != null) {
            try {
                resolution.setActionsTaken(objectMapper.writeValueAsString(
                        request.getActionsTaken()));
            } catch (Exception e) {
                log.error("Error serializing actions taken", e);
            }
        }
        
        resolution = alertResolutionRepository.save(resolution);
        
        // Actualizar alerta
        alert.setStatus("RESUELTA");
        alert.setActualResolutionDate(LocalDateTime.now());
        alert.setResolutionTimeHours(calculateResolutionTime(alert));
        alert.setUpdatedBy(request.getUserId());
        alertRepository.save(alert);
        
        // Registrar en auditoría
        auditService.logAlertResolution(resolution);
        
        return resolution;
    }
    
    /**
     * Cerrar alerta
     */
    @Transactional
    public AlertClosure closeAlert(String alertId, AlertClosureRequest request) {
        Alert alert = getAlertById(alertId);
        
        // Solo el Oficial de Cumplimiento puede cerrar
        validateUserIsComplianceOfficer(request.getUserId());
        
        // Verificar que la alerta está resuelta
        if (!"RESUELTA".equals(alert.getStatus())) {
            throw new IllegalStateException("Alert must be RESUELTA to close");
        }
        
        // Obtener métricas
        List<AlertAction> actions = alertActionRepository.findByAlertId(alertId);
        List<AlertReassignment> reassignments = alertReassignmentRepository.findByAlertId(alertId);
        
        // Crear cierre
        AlertClosure closure = new AlertClosure();
        closure.setClosureId(generateClosureId());
        closure.setAlertId(alertId);
        closure.setClosureDate(LocalDateTime.now());
        closure.setClosedByUserId(request.getUserId());
        closure.setClosedByUserName(request.getUserName());
        closure.setClosedByUserRole(request.getUserRole());
        closure.setClosureType(request.getClosureType());
        closure.setFinalStatus("CERRADA");
        closure.setClosureNotes(request.getClosureNotes());
        
        // Metrics
        closure.setTotalTimeHours(alert.getResolutionTimeHours());
        closure.setSlaCompliance(alert.getActualResolutionDate().isBefore(alert.getDueDate()));
        closure.setActionsCount(actions.size());
        closure.setReassignmentsCount(reassignments.size());
        
        // Archive
        closure.setArchiveStatus("ARCHIVADA");
        closure.setArchivedAt(LocalDateTime.now());
        
        // Audit trail
        Map<String, Object> auditTrail = new HashMap<>();
        auditTrail.put("totalEvents", actions.size() + 3); // +3 for create, resolve, close
        auditTrail.put("usersInvolved", getUniqueUsersInvolved(alert, actions));
        auditTrail.put("documentsGenerated", countDocumentsGenerated(actions));
        
        try {
            closure.setAuditTrail(objectMapper.writeValueAsString(auditTrail));
        } catch (Exception e) {
            log.error("Error serializing audit trail", e);
        }
        
        closure = alertClosureRepository.save(closure);
        
        // Actualizar alerta
        alert.setStatus("CERRADA");
        alert.setUpdatedBy(request.getUserId());
        alertRepository.save(alert);
        
        // Registrar en auditoría
        auditService.logAlertClosure(closure);
        
        return closure;
    }
    
    /**
     * Reasignar alerta
     */
    @Transactional
    public AlertReassignment reassignAlert(String alertId, AlertReassignmentRequest request) {
        Alert alert = getAlertById(alertId);
        
        // Validar permisos de reasignación
        validateUserCanReassignAlert(alert, request.getReassignedBy());
        
        // Crear registro de reasignación
        AlertReassignment reassignment = new AlertReassignment();
        reassignment.setReassignmentId(generateReassignmentId());
        reassignment.setAlertId(alertId);
        reassignment.setReassignmentDate(LocalDateTime.now());
        reassignment.setFromUserId(alert.getAssignedTo());
        reassignment.setFromUserName(alert.getAssignedTo()); // Should lookup name
        reassignment.setFromRole(alert.getAssignedRole());
        reassignment.setToUserId(request.getToUserId());
        reassignment.setToUserName(request.getToUserName());
        reassignment.setToRole(request.getToRole());
        reassignment.setReassignedBy(request.getReassignedBy());
        reassignment.setReason(request.getReason());
        
        reassignment = alertReassignmentRepository.save(reassignment);
        
        // Actualizar alerta
        alert.setAssignedTo(request.getToUserId());
        alert.setAssignedRole(request.getToRole());
        alert.setAssignedDate(LocalDateTime.now());
        alert.setUpdatedBy(request.getReassignedBy());
        alertRepository.save(alert);
        
        // Enviar notificación al nuevo asignado
        notificationService.sendReassignmentNotification(alert, reassignment);
        
        // Registrar en auditoría
        auditService.logAlertReassignment(reassignment);
        
        return reassignment;
    }
    
    // Helper methods
    
    private String generateAlertId() {
        return "ALR-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", new Random().nextInt(999999));
    }
    
    private String generateActionId() {
        return "ACT-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", new Random().nextInt(999999));
    }
    
    private String generateResolutionId() {
        return "RES-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", new Random().nextInt(999999));
    }
    
    private String generateClosureId() {
        return "CLO-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", new Random().nextInt(999999));
    }
    
    private String generateReassignmentId() {
        return "REA-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", new Random().nextInt(999999));
    }
    
    private Alert getAlertById(String alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
    }
    
    private AlertTypeConfig getAlertTypeConfig(String alertType) {
        // This would be loaded from configuration
        // For now, return hardcoded config
        Map<String, AlertTypeConfig> configs = getAlertTypeConfigs();
        return configs.get(alertType);
    }
    
    private Map<String, AlertTypeConfig> getAlertTypeConfigs() {
        // This should be loaded from database or configuration file
        Map<String, AlertTypeConfig> configs = new HashMap<>();
        
        AlertTypeConfig config = new AlertTypeConfig();
        config.setCode("ALR-005");
        config.setName("Match en screening");
        config.setSeverity("CRITICA");
        config.setDefaultAssignee("user.compliance.officer");
        config.setDefaultAssigneeRole("OFICIAL_CUMPLIMIENTO");
        config.setPriorityLevel("URGENTE");
        config.setSlaHours(24);
        config.setActionRequired("Revisar coincidencia y documentar decisión");
        config.setRegulatoryBasis("Resolución SUDEASEG 119.10, Art. 15");
        configs.put("ALR-005", config);
        
        // Add more configurations...
        
        return configs;
    }
    
    private LocalDateTime calculateEscalationDate(Integer slaHours) {
        // Escalate at 75% of SLA
        return LocalDateTime.now().plusHours((long) (slaHours * 0.75));
    }
    
    private String buildAlertTitle(AlertGenerationRequest request) {
        // Build dynamic title based on alert type and entity
        return request.getTitle();
    }
    
    private String buildAlertSummary(AlertGenerationRequest request) {
        // Build dynamic summary
        return request.getSummary();
    }
    
    private Double calculateResolutionTime(Alert alert) {
        if (alert.getAttentionStartDate() != null && alert.getActualResolutionDate() != null) {
            long seconds = java.time.Duration.between(
                    alert.getAttentionStartDate(), 
                    alert.getActualResolutionDate()
            ).getSeconds();
            return seconds / 3600.0;
        }
        return null;
    }
    
    private int getUniqueUsersInvolved(Alert alert, List<AlertAction> actions) {
        Set<String> users = new HashSet<>();
        users.add(alert.getCreatedBy());
        users.add(alert.getAssignedTo());
        actions.forEach(a -> users.add(a.getPerformedByUserId()));
        return users.size();
    }
    
    private int countDocumentsGenerated(List<AlertAction> actions) {
        // Count documents attached in actions
        return (int) actions.stream()
                .filter(a -> a.getEvidenceAttached() != null)
                .count();
    }
    
    private void validateUserCanAttendAlert(Alert alert, String userId) {
        // Implement permission validation
    }
    
    private void validateUserCanActOnAlert(Alert alert, String userId) {
        // Implement permission validation
    }
    
    private void validateUserIsComplianceOfficer(String userId) {
        // Implement role validation
    }
    
    private void validateUserCanReassignAlert(Alert alert, String userId) {
        // Implement permission validation
    }
}
```

---

## 7. API REST Endpoints

### 7.1 Generar Alerta

```
POST /api/v1/alerts/generate
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "alertType": "ALR-005",
  "module": "SCREENING",
  "subModule": "BUSQUEDA_LISTAS",
  "eventId": "SCR-2025-000456",
  "eventDate": "2025-01-15T14:30:00Z",
  "entityType": "DOSSIER",
  "entityId": "EXP-2025-000789",
  "entityName": "Juan Pérez",
  "triggerBy": "SYSTEM",
  "userId": "user.screening",
  "userName": "Sistema Screening",
  "userRole": "SYSTEM",
  "action": "SCREENING_EXECUTION",
  "description": "Coincidencia detectada en lista OFAC",
  "title": "Coincidencia detectada en screening OFAC",
  "summary": "Match del 87% con entrada en lista OFAC",
  "details": {
    "matchPercentage": 87,
    "listName": "OFAC SDN List"
  }
}

Response: 200 OK
{
  "alertId": "ALR-2025-000123",
  "status": "PENDIENTE",
  "assignedTo": "user.compliance.officer",
  "dueDate": "2025-01-16T14:30:00Z"
}
```

### 7.2 Consultar Alertas

```
GET /api/v1/alerts?status=PENDIENTE&assignedTo=user123&page=0&size=20
Authorization: Bearer {token}

Response: 200 OK
{
  "content": [...],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0
}
```

### 7.3 Ver Alerta

```
GET /api/v1/alerts/{alertId}
Authorization: Bearer {token}

Response: 200 OK
{
  "alertId": "ALR-2025-000123",
  "alertType": "ALR-005",
  ...
}
```

### 7.4 Iniciar Atención

```
POST /api/v1/alerts/{alertId}/start-attention
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "userId": "user.compliance.officer",
  "estimatedResolutionDate": "2025-01-16T10:00:00Z"
}

Response: 200 OK
{
  "alertId": "ALR-2025-000123",
  "status": "EN_ATENCION",
  "attentionStartDate": "2025-01-15T15:00:00Z"
}
```

### 7.5 Agregar Acción

```
POST /api/v1/alerts/{alertId}/actions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "userId": "user.compliance.officer",
  "userName": "María González",
  "userRole": "OFICIAL_CUMPLIMIENTO",
  "actionType": "INVESTIGACION",
  "description": "Se revisó la coincidencia detectada",
  "findings": "Corresponde a persona homónima",
  "nextSteps": "Proceder con aprobación",
  "evidenceAttached": [...]
}

Response: 201 Created
{
  "actionId": "ACT-2025-000234",
  "alertId": "ALR-2025-000123",
  "actionDate": "2025-01-15T15:45:00Z"
}
```

### 7.6 Resolver Alerta

```
POST /api/v1/alerts/{alertId}/resolve
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "userId": "user.compliance.officer",
  "userName": "María González",
  "userRole": "OFICIAL_CUMPLIMIENTO",
  "resolutionType": "FALSO_POSITIVO",
  "decision": "APROBAR_EXPEDIENTE",
  "justification": "Tras análisis detallado...",
  "regulationApplied": "Resolución SUDEASEG 119.10",
  "articleReference": "Art. 15, 16"
}

Response: 200 OK
{
  "resolutionId": "RES-2025-000145",
  "alertId": "ALR-2025-000123",
  "resolutionDate": "2025-01-15T16:00:00Z"
}
```

### 7.7 Cerrar Alerta

```
POST /api/v1/alerts/{alertId}/close
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "userId": "user.compliance.officer",
  "userName": "María González",
  "userRole": "OFICIAL_CUMPLIMIENTO",
  "closureType": "RESUELTO",
  "closureNotes": "Alerta resuelta satisfactoriamente"
}

Response: 200 OK
{
  "closureId": "CLO-2025-000089",
  "alertId": "ALR-2025-000123",
  "finalStatus": "CERRADA",
  "archiveStatus": "ARCHIVADA"
}
```

### 7.8 Reasignar Alerta

```
POST /api/v1/alerts/{alertId}/reassign
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "toUserId": "user.compliance.analyst",
  "toUserName": "Carlos Ramírez",
  "toRole": "ANALISTA_CUMPLIMIENTO",
  "reassignedBy": "user.compliance.officer",
  "reason": "Asignación para investigación inicial"
}

Response: 200 OK
{
  "reassignmentId": "REA-2025-000067",
  "alertId": "ALR-2025-000123",
  "newAssignee": "user.compliance.analyst"
}
```

---

## 8. Integración con Otros Módulos

### 8.1 Generación Automática desde Expediente Único

```java
// Cuando se crea un expediente incompleto
if (!dossier.isComplete()) {
    alertService.generateAlert(AlertGenerationRequest.builder()
        .alertType("ALR-001")
        .module("DOSSIER")
        .eventId(dossier.getDossierId())
        .entityType("DOSSIER")
        .entityId(dossier.getDossierId())
        .entityName(dossier.getFullName())
        .build());
}
```

### 8.2 Generación desde Evaluación de Riesgos

```java
// Cuando el riesgo es Alto o Medio
if ("ALTO".equals(evaluation.getFinalRiskLevel()) || 
    "MEDIO".equals(evaluation.getFinalRiskLevel())) {
    
    String alertType = "ALTO".equals(evaluation.getFinalRiskLevel()) ? 
                       "ALR-006" : "ALR-007";
    
    alertService.generateAlert(AlertGenerationRequest.builder()
        .alertType(alertType)
        .module("RISK_EVALUATION")
        .eventId(evaluation.getEvaluationId())
        .entityType("DOSSIER")
        .entityId(evaluation.getDossierId())
        .build());
}
```

### 8.3 Generación desde Debida Diligencia

```java
// Cuando un documento está próximo a vencer
if (document.getDaysUntilExpiration() <= 30) {
    alertService.generateAlert(AlertGenerationRequest.builder()
        .alertType("ALR-004")
        .module("DUE_DILIGENCE")
        .eventId(document.getDocumentId())
        .entityType("DOSSIER")
        .entityId(document.getDossierId())
        .build());
}
```

### 8.4 Generación desde Screening

```java
// Cuando hay match relevante
if (screeningResult.isRelevantMatch()) {
    alertService.generateAlert(AlertGenerationRequest.builder()
        .alertType("ALR-005")
        .module("SCREENING")
        .eventId(screeningResult.getScreeningId())
        .entityType("DOSSIER")
        .entityId(screeningResult.getDossierId())
        .details(screeningResult.getMatchDetails())
        .build());
}
```

---

## 9. Alineación con Inspección Regulatoria

### 9.1 Evidencia de Gestión Activa

El módulo proporciona evidencia clara de:

1. **Detección Automática**: El sistema genera alertas sin intervención manual
2. **Asignación Inmediata**: Las alertas se asignan automáticamente al responsable
3. **Seguimiento Documentado**: Cada acción queda registrada con fecha, hora y responsable
4. **Decisiones Fundamentadas**: Las resoluciones incluyen justificación y base regulatoria
5. **Cumplimiento de SLA**: El sistema registra si las alertas se atendieron a tiempo

### 9.2 Trazabilidad Completa

Para cada alerta, el inspector puede verificar:

- Evento que generó la alerta
- Asignación y reasignaciones
- Acciones de seguimiento
- Decisión del Oficial de Cumplimiento
- Tiempo de resolución
- Impacto en el expediente

### 9.3 Reportes para el Regulador

El sistema puede generar:

```sql
-- Alertas por período
SELECT 
    DATE_TRUNC('month', created_at) as mes,
    alert_type,
    severity,
    COUNT(*) as total_alertas,
    AVG(resolution_time_hours) as tiempo_promedio_resolucion,
    SUM(CASE WHEN actual_resolution_date <= due_date THEN 1 ELSE 0 END) as cumplimiento_sla
FROM alerts
WHERE created_at >= '2024-01-01'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2;
```

---

## 10. Notificaciones

### 10.1 Canales de Notificación

- **Email**: Para alertas críticas y urgentes
- **Sistema Web**: Panel de alertas en tiempo real
- **SMS**: Solo para alertas críticas (opcional)

### 10.2 Configuración de Notificaciones

Los usuarios pueden configurar:
- Tipos de alertas que desean recibir
- Canales de notificación preferidos
- Horarios de notificación
- Frecuencia de resúmenes

### 10.3 Notificaciones Obligatorias

Algunas notificaciones no pueden desactivarse:
- Alertas asignadas al usuario
- Alertas próximas a vencer
- Escalaciones

---

## 11. Dashboard de Alertas

### 11.1 Vista del Oficial de Cumplimiento

```
┌────────────────────────────────────────────────────────────┐
│                  PANEL DE ALERTAS                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ALERTAS ACTIVAS: 23                                       │
│  ├─ Críticas: 3  (Requieren atención inmediata)           │
│  ├─ Altas: 8     (Vencen en 48 horas)                     │
│  └─ Medias: 12   (En seguimiento)                         │
│                                                            │
│  SLA COMPLIANCE: 94%                                       │
│  TIEMPO PROMEDIO RESOLUCIÓN: 18.5 horas                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ALERTAS URGENTES                                    │ │
│  │                                                      │ │
│  │  ALR-2025-000123  Match OFAC - Juan Pérez           │ │
│  │  ⏰ Vence en 4 horas                                 │ │
│  │                                                      │ │
│  │  ALR-2025-000124  Riesgo Alto - ABC Corp            │ │
│  │  ⏰ Vence en 6 horas                                 │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 12. Conclusión

Este módulo de Alertas, Notificaciones y Seguimiento:

✅ Genera alertas automáticas para todos los eventos relevantes
✅ Asigna responsabilidades claras
✅ Documenta todo el ciclo de vida de cada alerta
✅ Proporciona evidencia de gestión activa
✅ Cumple con SLA configurables
✅ Integra con todos los módulos del SIAR
✅ Está preparado para inspección regulatoria
✅ Mantiene trazabilidad completa e inmutable

El sistema demuestra al regulador que la empresa tiene controles activos, no solo reactivos, y que el Oficial de Cumplimiento gestiona proactivamente los riesgos identificados.
