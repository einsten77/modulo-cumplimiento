# Módulo de Auditoría, Bitácora Inmutable y Trazabilidad - SIAR

## 1. Visión General del Módulo

### 1.1 Principios Fundamentales de Auditoría

1. **Inmutabilidad**: Los registros no pueden ser modificados ni eliminados
2. **Completitud**: Todo evento relevante debe quedar registrado
3. **Reconstrucción**: Debe ser posible reconstruir cualquier evento del sistema
4. **Comprensibilidad**: Los registros deben ser entendibles por terceros (auditores, inspectores)
5. **No Repudio**: Cada acción debe estar vinculada inequívocamente a un usuario

### 1.2 Objetivos del Módulo

- Registrar todas las acciones realizadas en el sistema
- Proporcionar evidencia irrefutable de las operaciones
- Permitir auditorías internas y externas
- Facilitar investigaciones de incidentes
- Demostrar cumplimiento regulatorio ante SUDEASEG

---

## 2. Arquitectura de la Bitácora Inmutable

### 2.1 Diseño Técnico de Inmutabilidad

```
┌─────────────────────────────────────────────────────────────┐
│           ARQUITECTURA DE BITÁCORA INMUTABLE                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐                                         │
│  │   Aplicación   │                                         │
│  │      SIAR      │                                         │
│  └───────┬────────┘                                         │
│          │                                                  │
│          │ (Solo INSERT)                                    │
│          ▼                                                  │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │  Audit Service │─────▶│  Audit Log DB    │              │
│  │                │      │  (Write-Only)    │              │
│  └────────────────┘      └──────────────────┘              │
│          │                        │                         │
│          │                        │                         │
│          │                        ▼                         │
│          │               ┌──────────────────┐               │
│          │               │  Hash Chain      │               │
│          │               │  Verification    │               │
│          │               └──────────────────┘               │
│          │                                                  │
│          │ (Solo SELECT)                                    │
│          ▼                                                  │
│  ┌────────────────┐                                         │
│  │  Query Service │                                         │
│  │  (Read-Only)   │                                         │
│  └────────────────┘                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Técnicas de Inmutabilidad

1. **Permisos de Base de Datos**
   - Usuario `audit_writer`: Solo INSERT
   - Usuario `audit_reader`: Solo SELECT
   - Sin permisos de UPDATE o DELETE

2. **Hash Chain (Cadena de Hash)**
   - Cada registro incluye el hash del registro anterior
   - Cualquier modificación rompe la cadena
   - Verificación criptográfica de integridad

3. **Triggers de Protección**
   - Triggers que rechazan UPDATE y DELETE
   - Log de intentos de modificación no autorizados

4. **Particionamiento por Fecha**
   - Particiones mensuales de solo lectura
   - Previene modificaciones accidentales

---

## 3. Eventos Obligatorios a Auditar

### 3.1 Catálogo Completo de Eventos Auditables

| Código | Módulo | Evento | Nivel |
|--------|--------|--------|-------|
| AUD-001 | DOSSIER | Creación de expediente | INFO |
| AUD-002 | DOSSIER | Modificación de expediente | INFO |
| AUD-003 | DOSSIER | Aprobación de expediente | CRITICAL |
| AUD-004 | DOSSIER | Rechazo de expediente | CRITICAL |
| AUD-005 | DOSSIER | Cambio de estado de expediente | INFO |
| AUD-006 | DUE_DILIGENCE | Carga de documento | INFO |
| AUD-007 | DUE_DILIGENCE | Modificación de documento | INFO |
| AUD-008 | DUE_DILIGENCE | Aprobación de documento | INFO |
| AUD-009 | DUE_DILIGENCE | Rechazo de documento | WARNING |
| AUD-010 | DUE_DILIGENCE | Vencimiento de documento | WARNING |
| AUD-011 | RISK_EVALUATION | Creación de evaluación | INFO |
| AUD-012 | RISK_EVALUATION | Modificación de evaluación | INFO |
| AUD-013 | RISK_EVALUATION | Aprobación de evaluación | CRITICAL |
| AUD-014 | RISK_EVALUATION | Cambio de nivel de riesgo | CRITICAL |
| AUD-015 | SCREENING | Ejecución de screening | INFO |
| AUD-016 | SCREENING | Match detectado | CRITICAL |
| AUD-017 | SCREENING | Decisión sobre match | CRITICAL |
| AUD-018 | ALERTS | Generación de alerta | INFO |
| AUD-019 | ALERTS | Atención de alerta | INFO |
| AUD-020 | ALERTS | Resolución de alerta | INFO |
| AUD-021 | ALERTS | Cierre de alerta | INFO |
| AUD-022 | ALERTS | Reasignación de alerta | INFO |
| AUD-023 | AUTH | Login exitoso | INFO |
| AUD-024 | AUTH | Login fallido | WARNING |
| AUD-025 | AUTH | Logout | INFO |
| AUD-026 | AUTH | Cambio de contraseña | INFO |
| AUD-027 | RBAC | Creación de usuario | CRITICAL |
| AUD-028 | RBAC | Modificación de usuario | CRITICAL |
| AUD-029 | RBAC | Asignación de rol | CRITICAL |
| AUD-030 | RBAC | Revocación de rol | CRITICAL |
| AUD-031 | RBAC | Cambio de permisos | CRITICAL |
| AUD-032 | SYSTEM | Acceso denegado | WARNING |
| AUD-033 | SYSTEM | Intento de modificación de auditoría | CRITICAL |
| AUD-034 | SYSTEM | Backup realizado | INFO |
| AUD-035 | SYSTEM | Restauración realizada | CRITICAL |
| AUD-036 | REPORTS | Generación de reporte | INFO |
| AUD-037 | REPORTS | Exportación de datos | WARNING |
| AUD-038 | CONFIG | Cambio de configuración | CRITICAL |
| AUD-039 | CONFIG | Cambio de parámetros de riesgo | CRITICAL |
| AUD-040 | CONFIG | Cambio de lista de screening | CRITICAL |

---

## 4. Modelo de Datos JSON

### 4.1 Estructura Completa de Registro de Auditoría

```json
{
  "auditId": "AUD-2025-0001234567",
  "sequenceNumber": 1234567,
  "eventCode": "AUD-003",
  "eventName": "Aprobación de expediente",
  "eventCategory": "DOSSIER",
  "eventLevel": "CRITICAL",
  "eventTimestamp": "2025-01-15T14:30:00.123456Z",
  "eventDate": "2025-01-15",
  "eventTime": "14:30:00.123456",
  
  "actor": {
    "userId": "user.compliance.officer",
    "userName": "María González",
    "userEmail": "maria.gonzalez@aseguradora.com",
    "userRole": "OFICIAL_CUMPLIMIENTO",
    "userDepartment": "CUMPLIMIENTO",
    "userLocation": "Caracas"
  },
  
  "session": {
    "sessionId": "sess-abc123def456",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "device": "Desktop",
    "browser": "Chrome 120.0",
    "os": "Windows 10"
  },
  
  "target": {
    "resourceType": "DOSSIER",
    "resourceId": "EXP-2025-000789",
    "resourceName": "Juan Pérez",
    "parentResourceType": null,
    "parentResourceId": null
  },
  
  "action": {
    "actionType": "APPROVE",
    "actionVerb": "APPROVED",
    "actionDescription": "El Oficial de Cumplimiento aprobó el expediente tras verificación completa",
    "actionMethod": "POST",
    "actionEndpoint": "/api/v1/dossiers/EXP-2025-000789/approve",
    "actionDuration": 125
  },
  
  "stateChange": {
    "hasStateChange": true,
    "previousState": {
      "status": "PENDIENTE_APROBACION",
      "riskLevel": "MEDIO",
      "approvedBy": null,
      "approvedAt": null
    },
    "newState": {
      "status": "APROBADO",
      "riskLevel": "MEDIO",
      "approvedBy": "user.compliance.officer",
      "approvedAt": "2025-01-15T14:30:00Z"
    },
    "changedFields": [
      {
        "fieldName": "status",
        "oldValue": "PENDIENTE_APROBACION",
        "newValue": "APROBADO"
      },
      {
        "fieldName": "approvedBy",
        "oldValue": null,
        "newValue": "user.compliance.officer"
      },
      {
        "fieldName": "approvedAt",
        "oldValue": null,
        "newValue": "2025-01-15T14:30:00Z"
      }
    ]
  },
  
  "businessContext": {
    "justification": "Expediente completo, riesgo medio aceptable, sin alertas pendientes",
    "regulatoryBasis": "Resolución SUDEASEG 119.10, Art. 8",
    "complianceNotes": "Se verificaron todos los documentos requeridos",
    "relatedEntities": [
      {
        "type": "RISK_EVALUATION",
        "id": "EVA-2025-000456",
        "relationship": "ASSOCIATED"
      },
      {
        "type": "DUE_DILIGENCE",
        "id": "DDL-2025-000123",
        "relationship": "ASSOCIATED"
      }
    ]
  },
  
  "technical": {
    "applicationVersion": "SIAR-v2.5.0",
    "databaseVersion": "PostgreSQL 15.3",
    "serverHostname": "siar-prod-01",
    "requestId": "req-xyz789abc123",
    "transactionId": "txn-456def789ghi"
  },
  
  "security": {
    "authenticationMethod": "JWT_TOKEN",
    "authorizationPassed": true,
    "permissionsChecked": [
      "DOSSIER_APPROVE",
      "DOSSIER_UPDATE"
    ],
    "securityLevel": "STANDARD"
  },
  
  "dataProtection": {
    "containsPII": true,
    "dataClassification": "CONFIDENCIAL",
    "encryptionApplied": true,
    "anonymizationRequired": false
  },
  
  "integrity": {
    "recordHash": "sha256:a1b2c3d4e5f6g7h8i9j0...",
    "previousRecordHash": "sha256:z9y8x7w6v5u4t3s2r1q0...",
    "chainValidation": "VALID",
    "digitalSignature": "RSA:k1l2m3n4o5p6q7r8s9t0..."
  },
  
  "compliance": {
    "retentionYears": 10,
    "retentionUntil": "2035-01-15",
    "legalHold": false,
    "exportable": true,
    "redactable": false
  },
  
  "metadata": {
    "recordVersion": 1,
    "recordCreatedAt": "2025-01-15T14:30:00.123456Z",
    "recordCreatedBy": "SYSTEM_AUDIT_SERVICE",
    "recordPartition": "2025_01",
    "recordArchived": false,
    "recordIndexed": true
  }
}
```

### 4.2 Registro Simplificado (Eventos de Menor Criticidad)

```json
{
  "auditId": "AUD-2025-0001234568",
  "sequenceNumber": 1234568,
  "eventCode": "AUD-023",
  "eventName": "Login exitoso",
  "eventCategory": "AUTH",
  "eventLevel": "INFO",
  "eventTimestamp": "2025-01-15T14:35:00.789Z",
  
  "actor": {
    "userId": "user.analyst",
    "userName": "Carlos Ramírez",
    "userRole": "ANALISTA_CUMPLIMIENTO"
  },
  
  "session": {
    "sessionId": "sess-new123",
    "ipAddress": "192.168.1.105"
  },
  
  "action": {
    "actionType": "LOGIN",
    "actionDescription": "Usuario ingresó al sistema"
  },
  
  "integrity": {
    "recordHash": "sha256:b2c3d4e5f6g7h8i9j0k1...",
    "previousRecordHash": "sha256:a1b2c3d4e5f6g7h8i9j0..."
  },
  
  "metadata": {
    "recordCreatedAt": "2025-01-15T14:35:00.789Z"
  }
}
```

---

## 5. Base de Datos

### 5.1 Tabla Principal: audit_log

```sql
CREATE TABLE audit_log (
    audit_id VARCHAR(50) PRIMARY KEY,
    sequence_number BIGSERIAL UNIQUE NOT NULL,
    
    -- Event identification
    event_code VARCHAR(20) NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_level VARCHAR(20) NOT NULL,
    event_timestamp TIMESTAMP(6) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME(6) NOT NULL,
    
    -- Actor (Who)
    actor_user_id VARCHAR(50) NOT NULL,
    actor_user_name VARCHAR(200) NOT NULL,
    actor_user_email VARCHAR(200),
    actor_user_role VARCHAR(50) NOT NULL,
    actor_user_department VARCHAR(100),
    actor_user_location VARCHAR(100),
    
    -- Session
    session_id VARCHAR(100) NOT NULL,
    session_ip_address VARCHAR(45) NOT NULL,
    session_user_agent TEXT,
    session_device VARCHAR(50),
    session_browser VARCHAR(100),
    session_os VARCHAR(100),
    
    -- Target (What)
    target_resource_type VARCHAR(50) NOT NULL,
    target_resource_id VARCHAR(50) NOT NULL,
    target_resource_name VARCHAR(300),
    target_parent_resource_type VARCHAR(50),
    target_parent_resource_id VARCHAR(50),
    
    -- Action (How)
    action_type VARCHAR(50) NOT NULL,
    action_verb VARCHAR(50) NOT NULL,
    action_description TEXT NOT NULL,
    action_method VARCHAR(10),
    action_endpoint VARCHAR(500),
    action_duration INTEGER,
    
    -- State change
    has_state_change BOOLEAN DEFAULT FALSE,
    previous_state JSONB,
    new_state JSONB,
    changed_fields JSONB,
    
    -- Business context
    justification TEXT,
    regulatory_basis VARCHAR(500),
    compliance_notes TEXT,
    related_entities JSONB,
    
    -- Technical details
    application_version VARCHAR(50),
    database_version VARCHAR(50),
    server_hostname VARCHAR(100),
    request_id VARCHAR(100),
    transaction_id VARCHAR(100),
    
    -- Security
    authentication_method VARCHAR(50),
    authorization_passed BOOLEAN,
    permissions_checked JSONB,
    security_level VARCHAR(20),
    
    -- Data protection
    contains_pii BOOLEAN DEFAULT FALSE,
    data_classification VARCHAR(30),
    encryption_applied BOOLEAN DEFAULT TRUE,
    anonymization_required BOOLEAN DEFAULT FALSE,
    
    -- Integrity (Hash chain)
    record_hash VARCHAR(100) NOT NULL,
    previous_record_hash VARCHAR(100),
    chain_validation VARCHAR(20) DEFAULT 'VALID',
    digital_signature TEXT,
    
    -- Compliance
    retention_years INTEGER DEFAULT 10,
    retention_until DATE,
    legal_hold BOOLEAN DEFAULT FALSE,
    exportable BOOLEAN DEFAULT TRUE,
    redactable BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    record_version INTEGER DEFAULT 1,
    record_created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    record_created_by VARCHAR(50) DEFAULT 'SYSTEM_AUDIT_SERVICE',
    record_partition VARCHAR(20),
    record_archived BOOLEAN DEFAULT FALSE,
    record_indexed BOOLEAN DEFAULT TRUE,
    
    -- Indexes
    INDEX idx_audit_timestamp (event_timestamp),
    INDEX idx_audit_date (event_date),
    INDEX idx_audit_user (actor_user_id),
    INDEX idx_audit_category (event_category),
    INDEX idx_audit_level (event_level),
    INDEX idx_audit_resource (target_resource_type, target_resource_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_session (session_id),
    INDEX idx_audit_sequence (sequence_number)
) PARTITION BY RANGE (event_date);

-- Particiones mensuales (ejemplo 2025)
CREATE TABLE audit_log_2025_01 PARTITION OF audit_log
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_log_2025_02 PARTITION OF audit_log
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- ... crear particiones para cada mes
```

### 5.2 Triggers de Protección contra Modificación

```sql
-- Trigger que impide UPDATE
CREATE OR REPLACE FUNCTION prevent_audit_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar intento de modificación
    INSERT INTO audit_violation_attempts (
        attempted_at,
        attempted_by,
        attempted_action,
        target_audit_id,
        ip_address
    ) VALUES (
        NOW(),
        current_user,
        'UPDATE',
        OLD.audit_id,
        inet_client_addr()
    );
    
    RAISE EXCEPTION 'AUDIT LOG VIOLATION: Updates are not allowed on audit_log table';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_update
    BEFORE UPDATE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_update();

-- Trigger que impide DELETE
CREATE OR REPLACE FUNCTION prevent_audit_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar intento de eliminación
    INSERT INTO audit_violation_attempts (
        attempted_at,
        attempted_by,
        attempted_action,
        target_audit_id,
        ip_address
    ) VALUES (
        NOW(),
        current_user,
        'DELETE',
        OLD.audit_id,
        inet_client_addr()
    );
    
    RAISE EXCEPTION 'AUDIT LOG VIOLATION: Deletes are not allowed on audit_log table';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_delete
    BEFORE DELETE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_delete();
```

### 5.3 Tabla de Intentos de Violación

```sql
CREATE TABLE audit_violation_attempts (
    violation_id SERIAL PRIMARY KEY,
    attempted_at TIMESTAMP(6) NOT NULL,
    attempted_by VARCHAR(50) NOT NULL,
    attempted_action VARCHAR(20) NOT NULL,
    target_audit_id VARCHAR(50),
    ip_address VARCHAR(45),
    alert_generated BOOLEAN DEFAULT FALSE,
    investigated BOOLEAN DEFAULT FALSE,
    investigation_notes TEXT,
    
    INDEX idx_violation_date (attempted_at),
    INDEX idx_violation_user (attempted_by)
);
```

### 5.4 Usuarios de Base de Datos con Permisos Restringidos

```sql
-- Usuario para escribir auditoría (solo INSERT)
CREATE USER audit_writer WITH PASSWORD 'secure_password_here';
GRANT CONNECT ON DATABASE siar TO audit_writer;
GRANT USAGE ON SCHEMA public TO audit_writer;
GRANT INSERT ON audit_log TO audit_writer;
GRANT USAGE, SELECT ON SEQUENCE audit_log_sequence_number_seq TO audit_writer;

-- Usuario para leer auditoría (solo SELECT)
CREATE USER audit_reader WITH PASSWORD 'secure_password_here';
GRANT CONNECT ON DATABASE siar TO audit_reader;
GRANT USAGE ON SCHEMA public TO audit_reader;
GRANT SELECT ON audit_log TO audit_reader;
GRANT SELECT ON audit_violation_attempts TO audit_reader;

-- Revocar explícitamente UPDATE y DELETE
REVOKE UPDATE, DELETE ON audit_log FROM audit_writer;
REVOKE INSERT, UPDATE, DELETE ON audit_log FROM audit_reader;
```

---

## 6. Implementación Backend en Java

### 6.1 Service: AuditService

```java
package com.siar.audit.service;

import com.siar.audit.model.AuditLog;
import com.siar.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;
    
    /**
     * Registra un evento en la bitácora de auditoría
     * Este es el método principal que todos los módulos deben usar
     */
    @Transactional
    public AuditLog logEvent(AuditEventRequest eventRequest) {
        try {
            // Obtener el hash del registro anterior para la cadena
            String previousHash = getLatestRecordHash();
            
            // Crear registro de auditoría
            AuditLog auditLog = new AuditLog();
            
            // Event identification
            auditLog.setAuditId(generateAuditId());
            auditLog.setEventCode(eventRequest.getEventCode());
            auditLog.setEventName(eventRequest.getEventName());
            auditLog.setEventCategory(eventRequest.getEventCategory());
            auditLog.setEventLevel(eventRequest.getEventLevel());
            
            LocalDateTime now = LocalDateTime.now();
            auditLog.setEventTimestamp(now);
            auditLog.setEventDate(now.toLocalDate());
            auditLog.setEventTime(now.toLocalTime());
            
            // Actor
            auditLog.setActorUserId(eventRequest.getUserId());
            auditLog.setActorUserName(eventRequest.getUserName());
            auditLog.setActorUserEmail(eventRequest.getUserEmail());
            auditLog.setActorUserRole(eventRequest.getUserRole());
            auditLog.setActorUserDepartment(eventRequest.getUserDepartment());
            auditLog.setActorUserLocation(eventRequest.getUserLocation());
            
            // Session
            auditLog.setSessionId(eventRequest.getSessionId());
            auditLog.setSessionIpAddress(getClientIpAddress());
            auditLog.setSessionUserAgent(request.getHeader("User-Agent"));
            auditLog.setSessionDevice(detectDevice());
            auditLog.setSessionBrowser(detectBrowser());
            auditLog.setSessionOs(detectOS());
            
            // Target
            auditLog.setTargetResourceType(eventRequest.getResourceType());
            auditLog.setTargetResourceId(eventRequest.getResourceId());
            auditLog.setTargetResourceName(eventRequest.getResourceName());
            auditLog.setTargetParentResourceType(eventRequest.getParentResourceType());
            auditLog.setTargetParentResourceId(eventRequest.getParentResourceId());
            
            // Action
            auditLog.setActionType(eventRequest.getActionType());
            auditLog.setActionVerb(eventRequest.getActionVerb());
            auditLog.setActionDescription(eventRequest.getActionDescription());
            auditLog.setActionMethod(request.getMethod());
            auditLog.setActionEndpoint(request.getRequestURI());
            auditLog.setActionDuration(eventRequest.getActionDuration());
            
            // State change
            if (eventRequest.getPreviousState() != null || eventRequest.getNewState() != null) {
                auditLog.setHasStateChange(true);
                auditLog.setPreviousState(serializeToJson(eventRequest.getPreviousState()));
                auditLog.setNewState(serializeToJson(eventRequest.getNewState()));
                auditLog.setChangedFields(serializeToJson(
                        calculateChangedFields(eventRequest.getPreviousState(), 
                                              eventRequest.getNewState())));
            }
            
            // Business context
            auditLog.setJustification(eventRequest.getJustification());
            auditLog.setRegulatoryBasis(eventRequest.getRegulatoryBasis());
            auditLog.setComplianceNotes(eventRequest.getComplianceNotes());
            auditLog.setRelatedEntities(serializeToJson(eventRequest.getRelatedEntities()));
            
            // Technical
            auditLog.setApplicationVersion(getApplicationVersion());
            auditLog.setDatabaseVersion(getDatabaseVersion());
            auditLog.setServerHostname(getServerHostname());
            auditLog.setRequestId(eventRequest.getRequestId());
            auditLog.setTransactionId(eventRequest.getTransactionId());
            
            // Security
            auditLog.setAuthenticationMethod(eventRequest.getAuthenticationMethod());
            auditLog.setAuthorizationPassed(true);
            auditLog.setPermissionsChecked(serializeToJson(eventRequest.getPermissionsChecked()));
            auditLog.setSecurityLevel(eventRequest.getSecurityLevel());
            
            // Data protection
            auditLog.setContainsPii(eventRequest.isContainsPII());
            auditLog.setDataClassification(eventRequest.getDataClassification());
            auditLog.setEncryptionApplied(true);
            auditLog.setAnonymizationRequired(false);
            
            // Integrity - Hash chain
            auditLog.setPreviousRecordHash(previousHash);
            String recordData = buildRecordDataForHashing(auditLog);
            String currentHash = calculateSHA256(recordData);
            auditLog.setRecordHash(currentHash);
            auditLog.setChainValidation("VALID");
            
            // Compliance
            auditLog.setRetentionYears(10);
            auditLog.setRetentionUntil(LocalDate.now().plusYears(10));
            auditLog.setLegalHold(false);
            auditLog.setExportable(true);
            auditLog.setRedactable(false);
            
            // Metadata
            auditLog.setRecordPartition(now.getYear() + "_" + 
                    String.format("%02d", now.getMonthValue()));
            
            // Guardar en base de datos (solo INSERT permitido)
            auditLog = auditLogRepository.save(auditLog);
            
            log.debug("Audit event logged: {} - {}", auditLog.getAuditId(), 
                    auditLog.getEventName());
            
            return auditLog;
            
        } catch (Exception e) {
            log.error("CRITICAL: Failed to log audit event", e);
            // No lanzar excepción para no interrumpir el flujo principal
            // Pero registrar en sistema de monitoreo
            alertCriticalAuditFailure(eventRequest, e);
            return null;
        }
    }
    
    /**
     * Métodos especializados para eventos comunes
     */
    
    public void logDossierCreation(Dossier dossier, String userId, String userName) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-001")
                .eventName("Creación de expediente")
                .eventCategory("DOSSIER")
                .eventLevel("INFO")
                .userId(userId)
                .userName(userName)
                .resourceType("DOSSIER")
                .resourceId(dossier.getDossierId())
                .resourceName(dossier.getFullName())
                .actionType("CREATE")
                .actionVerb("CREATED")
                .actionDescription("Nuevo expediente creado en el sistema")
                .newState(dossier)
                .build());
    }
    
    public void logDossierApproval(Dossier dossier, Dossier previousState, 
                                   String userId, String userName, String justification) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-003")
                .eventName("Aprobación de expediente")
                .eventCategory("DOSSIER")
                .eventLevel("CRITICAL")
                .userId(userId)
                .userName(userName)
                .resourceType("DOSSIER")
                .resourceId(dossier.getDossierId())
                .resourceName(dossier.getFullName())
                .actionType("APPROVE")
                .actionVerb("APPROVED")
                .actionDescription("Expediente aprobado por el Oficial de Cumplimiento")
                .previousState(previousState)
                .newState(dossier)
                .justification(justification)
                .regulatoryBasis("Resolución SUDEASEG 119.10, Art. 8")
                .build());
    }
    
    public void logRiskEvaluationApproval(RiskEvaluation evaluation, 
                                         RiskEvaluation previousState,
                                         String userId, String userName) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-013")
                .eventName("Aprobación de evaluación de riesgo")
                .eventCategory("RISK_EVALUATION")
                .eventLevel("CRITICAL")
                .userId(userId)
                .userName(userName)
                .resourceType("RISK_EVALUATION")
                .resourceId(evaluation.getEvaluationId())
                .actionType("APPROVE")
                .actionVerb("APPROVED")
                .actionDescription("Evaluación de riesgo aprobada")
                .previousState(previousState)
                .newState(evaluation)
                .build());
    }
    
    public void logScreeningMatch(ScreeningResult result, String userId, String userName) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-016")
                .eventName("Match detectado en screening")
                .eventCategory("SCREENING")
                .eventLevel("CRITICAL")
                .userId(userId)
                .userName(userName)
                .resourceType("SCREENING")
                .resourceId(result.getScreeningId())
                .actionType("DETECT")
                .actionVerb("DETECTED")
                .actionDescription("Coincidencia detectada en lista de sanciones")
                .newState(result)
                .build());
    }
    
    public void logAlertGeneration(Alert alert) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-018")
                .eventName("Generación de alerta")
                .eventCategory("ALERTS")
                .eventLevel("INFO")
                .userId("SYSTEM")
                .userName("Sistema Automático")
                .resourceType("ALERT")
                .resourceId(alert.getAlertId())
                .actionType("GENERATE")
                .actionVerb("GENERATED")
                .actionDescription("Alerta generada automáticamente")
                .newState(alert)
                .build());
    }
    
    public void logLogin(String userId, String userName, boolean success) {
        logEvent(AuditEventRequest.builder()
                .eventCode(success ? "AUD-023" : "AUD-024")
                .eventName(success ? "Login exitoso" : "Login fallido")
                .eventCategory("AUTH")
                .eventLevel(success ? "INFO" : "WARNING")
                .userId(userId)
                .userName(userName)
                .resourceType("SESSION")
                .resourceId("N/A")
                .actionType("LOGIN")
                .actionVerb(success ? "LOGGED_IN" : "LOGIN_FAILED")
                .actionDescription(success ? 
                        "Usuario ingresó al sistema exitosamente" : 
                        "Intento de login fallido")
                .build());
    }
    
    public void logUnauthorizedAccess(String userId, String userName, 
                                      String resourceType, String resourceId) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-032")
                .eventName("Acceso denegado")
                .eventCategory("SYSTEM")
                .eventLevel("WARNING")
                .userId(userId)
                .userName(userName)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .actionType("ACCESS_DENIED")
                .actionVerb("DENIED")
                .actionDescription("Intento de acceso no autorizado a recurso")
                .build());
    }
    
    public void logConfigurationChange(String configKey, Object oldValue, 
                                       Object newValue, String userId, String userName) {
        logEvent(AuditEventRequest.builder()
                .eventCode("AUD-038")
                .eventName("Cambio de configuración")
                .eventCategory("CONFIG")
                .eventLevel("CRITICAL")
                .userId(userId)
                .userName(userName)
                .resourceType("CONFIG")
                .resourceId(configKey)
                .actionType("UPDATE")
                .actionVerb("UPDATED")
                .actionDescription("Configuración del sistema modificada")
                .previousState(Map.of(configKey, oldValue))
                .newState(Map.of(configKey, newValue))
                .build());
    }
    
    // Helper methods
    
    private String generateAuditId() {
        return "AUD-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%010d", new Random().nextInt(1000000000));
    }
    
    private String getLatestRecordHash() {
        Optional<AuditLog> latest = auditLogRepository.findTopByOrderBySequenceNumberDesc();
        return latest.map(AuditLog::getRecordHash).orElse("GENESIS_BLOCK");
    }
    
    private String buildRecordDataForHashing(AuditLog audit) {
        // Construir string con datos clave para el hash
        StringBuilder sb = new StringBuilder();
        sb.append(audit.getSequenceNumber());
        sb.append(audit.getEventTimestamp());
        sb.append(audit.getEventCode());
        sb.append(audit.getActorUserId());
        sb.append(audit.getTargetResourceType());
        sb.append(audit.getTargetResourceId());
        sb.append(audit.getActionType());
        sb.append(audit.getPreviousRecordHash());
        return sb.toString();
    }
    
    private String calculateSHA256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return "sha256:" + hexString.toString();
        } catch (Exception e) {
            log.error("Error calculating SHA-256", e);
            return "ERROR";
        }
    }
    
    private String serializeToJson(Object object) {
        if (object == null) return null;
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            log.error("Error serializing object to JSON", e);
            return null;
        }
    }
    
    private List<Map<String, Object>> calculateChangedFields(Object oldObj, Object newObj) {
        // Implementar comparación de objetos y retornar lista de campos cambiados
        List<Map<String, Object>> changes = new ArrayList<>();
        // ... lógica de comparación ...
        return changes;
    }
    
    private String getClientIpAddress() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }
    
    private String detectDevice() {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Mobile")) return "Mobile";
        if (userAgent.contains("Tablet")) return "Tablet";
        return "Desktop";
    }
    
    private String detectBrowser() {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        return "Other";
    }
    
    private String detectOS() {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iOS")) return "iOS";
        return "Other";
    }
    
    private String getApplicationVersion() {
        return "SIAR-v2.5.0"; // Should be loaded from config
    }
    
    private String getDatabaseVersion() {
        return "PostgreSQL 15.3"; // Should be queried from DB
    }
    
    private String getServerHostname() {
        try {
            return java.net.InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "Unknown";
        }
    }
    
    private void alertCriticalAuditFailure(AuditEventRequest request, Exception e) {
        // Implementar alerta crítica al equipo de TI
        log.error("CRITICAL AUDIT FAILURE - Event: {} - Error: {}", 
                request.getEventCode(), e.getMessage());
    }
}
```

### 6.2 Aspect para Auditoría Automática

```java
package com.siar.audit.aspect;

import com.siar.audit.annotation.Auditable;
import com.siar.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {
    
    private final AuditService auditService;
    
    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;
        
        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Log audit event after method execution
            try {
                auditService.logEvent(buildAuditRequest(
                        joinPoint, auditable, result, exception, duration));
            } catch (Exception e) {
                // No interrumpir el flujo si falla la auditoría
                log.error("Failed to log audit event", e);
            }
        }
    }
    
    private AuditEventRequest buildAuditRequest(ProceedingJoinPoint joinPoint,
                                               Auditable auditable,
                                               Object result,
                                               Exception exception,
                                               long duration) {
        // Construir request de auditoría desde anotación y contexto
        return AuditEventRequest.builder()
                .eventCode(auditable.eventCode())
                .eventName(auditable.eventName())
                .eventCategory(auditable.category())
                .eventLevel(exception != null ? "ERROR" : auditable.level())
                .actionDuration((int) duration)
                .build();
    }
}
```

---

## 7. API REST Endpoints

### 7.1 Consultar Registros de Auditoría

```
GET /api/v1/audit/logs?startDate=2025-01-01&endDate=2025-01-31&userId=user123&category=DOSSIER&page=0&size=50
Authorization: Bearer {token}
Requiere: Rol OFICIAL_CUMPLIMIENTO, AUDITORIA_INTERNA, o CONTRALORIA

Response: 200 OK
{
  "content": [...],
  "totalElements": 1523,
  "totalPages": 31
}
```

### 7.2 Ver Detalles de un Registro

```
GET /api/v1/audit/logs/{auditId}
Authorization: Bearer {token}

Response: 200 OK
{
  "auditId": "AUD-2025-0001234567",
  ...
}
```

### 7.3 Buscar por Expediente

```
GET /api/v1/audit/logs/by-dossier/{dossierId}
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "auditId": "AUD-2025-0001234567",
    "eventName": "Creación de expediente",
    ...
  },
  ...
]
```

### 7.4 Verificar Integridad de la Cadena

```
GET /api/v1/audit/verify-chain?startId=AUD-2025-0001234567&endId=AUD-2025-0001234600
Authorization: Bearer {token}
Requiere: Rol OFICIAL_CUMPLIMIENTO o AUDITORIA_INTERNA

Response: 200 OK
{
  "valid": true,
  "recordsChecked": 34,
  "startAuditId": "AUD-2025-0001234567",
  "endAuditId": "AUD-2025-0001234600",
  "verificationDate": "2025-01-15T16:00:00Z"
}
```

### 7.5 Exportar Registros

```
POST /api/v1/audit/export
Authorization: Bearer {token}
Requiere: Rol OFICIAL_CUMPLIMIENTO
Content-Type: application/json

Request Body:
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "category": "DOSSIER",
  "format": "PDF"
}

Response: 200 OK
{
  "exportId": "EXP-2025-000123",
  "status": "PROCESSING",
  "downloadUrl": "/api/v1/audit/downloads/EXP-2025-000123"
}
```

---

## 8. Reportes de Auditoría para el Regulador

### 8.1 Reporte de Actividad por Período

```sql
-- Resumen de eventos de auditoría por mes
SELECT 
    DATE_TRUNC('month', event_timestamp) as mes,
    event_category as categoria,
    event_level as nivel,
    COUNT(*) as total_eventos,
    COUNT(DISTINCT actor_user_id) as usuarios_unicos,
    COUNT(DISTINCT target_resource_id) as recursos_afectados
FROM audit_log
WHERE event_timestamp >= '2024-01-01'
AND event_timestamp < '2025-01-01'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;
```

### 8.2 Reporte de Acciones Críticas

```sql
-- Todas las acciones críticas (aprobaciones, rechazos, cambios de configuración)
SELECT 
    event_timestamp,
    event_code,
    event_name,
    actor_user_name,
    actor_user_role,
    target_resource_type,
    target_resource_id,
    action_description,
    justification
FROM audit_log
WHERE event_level = 'CRITICAL'
AND event_timestamp >= '2024-01-01'
ORDER BY event_timestamp DESC;
```

### 8.3 Reporte de Auditoría por Usuario

```sql
-- Actividad detallada de un usuario específico
SELECT 
    event_timestamp,
    event_category,
    event_name,
    target_resource_type,
    target_resource_id,
    action_verb,
    action_description,
    has_state_change,
    changed_fields
FROM audit_log
WHERE actor_user_id = 'user.compliance.officer'
AND event_timestamp >= NOW() - INTERVAL '30 days'
ORDER BY event_timestamp DESC;
```

### 8.4 Reporte de Historial Completo de un Expediente

```sql
-- Todo el ciclo de vida de un expediente
SELECT 
    al.event_timestamp,
    al.event_name,
    al.actor_user_name,
    al.actor_user_role,
    al.action_verb,
    al.action_description,
    al.previous_state,
    al.new_state,
    al.justification,
    al.regulatory_basis
FROM audit_log al
WHERE al.target_resource_type = 'DOSSIER'
AND al.target_resource_id = 'EXP-2025-000789'
ORDER BY al.event_timestamp ASC;
```

---

## 9. Accesos a la Auditoría (RBAC)

### 9.1 Matriz de Permisos

| Rol | Consultar | Exportar | Verificar Cadena | Ver Todo |
|-----|-----------|----------|------------------|----------|
| Oficial Cumplimiento | ✓ | ✓ | ✓ | ✓ |
| Auditoría Interna | ✓ | ✓ | ✓ | ✓ |
| Contraloría | ✓ | ✓ | ✗ | ✓ |
| Auditor Externo | ✓ | ✗ | ✗ | Solo asignado |
| Inspector SUDEASEG | ✓ | ✓ | ✓ | ✓ |
| Otros roles | ✗ | ✗ | ✗ | Solo sus acciones |

---

## 10. Garantías de Inmutabilidad

### 10.1 Niveles de Protección

1. **Nivel de Aplicación**
   - Service solo permite INSERT
   - No existen métodos UPDATE o DELETE
   
2. **Nivel de Base de Datos**
   - Usuarios con permisos restringidos
   - Triggers que rechazan modificaciones
   - Registro de intentos de violación

3. **Nivel Criptográfico**
   - Hash chain para detectar modificaciones
   - Firma digital opcional
   
4. **Nivel de Almacenamiento**
   - Particiones de solo lectura
   - Backups inmutables

### 10.2 Proceso de Verificación de Integridad

```java
public boolean verifyChainIntegrity(String startAuditId, String endAuditId) {
    List<AuditLog> records = auditLogRepository
            .findByAuditIdBetweenOrderBySequenceNumber(startAuditId, endAuditId);
    
    for (int i = 1; i < records.size(); i++) {
        AuditLog current = records.get(i);
        AuditLog previous = records.get(i - 1);
        
        // Verificar que el hash anterior coincide
        if (!current.getPreviousRecordHash().equals(previous.getRecordHash())) {
            log.error("Chain integrity broken between {} and {}", 
                    previous.getAuditId(), current.getAuditId());
            return false;
        }
        
        // Recalcular hash del registro actual
        String calculatedHash = calculateSHA256(buildRecordDataForHashing(current));
        if (!calculatedHash.equals(current.getRecordHash())) {
            log.error("Record hash mismatch for {}", current.getAuditId());
            return false;
        }
    }
    
    return true;
}
```

---

## 11. Dashboard de Auditoría

### 11.1 Vista del Oficial de Cumplimiento

```
┌────────────────────────────────────────────────────────────┐
│               PANEL DE AUDITORÍA Y TRAZABILIDAD            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  REGISTROS HOY: 1,247                                      │
│  EVENTOS CRÍTICOS: 34                                      │
│  USUARIOS ACTIVOS: 18                                      │
│  INTEGRIDAD CADENA: ✓ VÁLIDA                               │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ÚLTIMOS EVENTOS CRÍTICOS                            │ │
│  │                                                      │ │
│  │  14:30 - Aprobación expediente EXP-2025-000789      │ │
│  │          María González (Of. Cumplimiento)          │ │
│  │                                                      │ │
│  │  14:25 - Match OFAC detectado - Juan Pérez          │ │
│  │          Sistema Automático                         │ │
│  │                                                      │ │
│  │  14:20 - Cambio configuración parámetros riesgo     │ │
│  │          María González (Of. Cumplimiento)          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  INTENTOS DE VIOLACIÓN: 0                            │ │
│  │  Última verificación: Hoy 14:00                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 12. Conclusión

Este módulo de Auditoría, Bitácora Inmutable y Trazabilidad:

✅ Registra todos los eventos relevantes del sistema
✅ Garantiza inmutabilidad mediante múltiples capas de protección
✅ Implementa hash chain para verificación criptográfica
✅ Previene modificaciones mediante triggers y permisos
✅ Proporciona acceso según roles autorizados
✅ Permite reconstrucción completa de cualquier evento
✅ Genera reportes comprensibles para auditores e inspectores
✅ Detecta y registra intentos de violación
✅ Cumple con máximos estándares regulatorios

El sistema proporciona evidencia irrefutable de todas las operaciones, permitiendo a la empresa demostrar ante SUDEASEG y auditores externos que mantiene controles efectivos y trazabilidad completa de todas las acciones de cumplimiento.
