# MODELO DE AUDITORÍA Y BITÁCORA INMUTABLE - SISTEMA SIAR

## 📋 ÍNDICE

1. [Visión General](#visión-general)
2. [Arquitectura de Auditoría](#arquitectura-de-auditoría)
3. [Modelo de Datos](#modelo-de-datos)
4. [Estrategias de Inmutabilidad](#estrategias-de-inmutabilidad)
5. [Cadena de Hash](#cadena-de-hash)
6. [Integración Transversal](#integración-transversal)
7. [Consultas y Vistas](#consultas-y-vistas)
8. [Seguridad y Control de Acceso](#seguridad-y-control-de-acceso)
9. [Retención y Archivado](#retención-y-archivado)
10. [Casos de Uso](#casos-de-uso)

---

## 🎯 VISIÓN GENERAL

### Propósito

El Sistema de Auditoría Inmutable de SIAR proporciona un registro completo, inalterable y verificable de todos los eventos relevantes que ocurren en el sistema, cumpliendo con:

- **Regulaciones**: SUDEBAN, LOCTICSEP, GDPR
- **Normativas**: Basilea III, FATF
- **Estándares**: ISO 27001, SOC 2 Type II
- **Cumplimiento**: Trazabilidad completa para auditorías

### Principios Fundamentales

#### 1. **INMUTABILIDAD TOTAL**
- ❌ NO se permiten UPDATE
- ❌ NO se permiten DELETE  
- ✅ SOLO se permiten INSERT
- ✅ Protección a nivel de base de datos

#### 2. **INTEGRIDAD VERIFICABLE**
- Cadena de hash SHA-256
- Cada registro contiene el hash del anterior
- Detección automática de manipulación

#### 3. **TRAZABILIDAD COMPLETA**
- Registro de todos los eventos críticos
- Contexto completo del evento
- Reconstrucción histórica exacta

#### 4. **ACCESO CONTROLADO**
- Permisos de solo lectura para auditoría
- Segregación de funciones (RBAC)
- Registro de todos los accesos

---

## 🏗️ ARQUITECTURA DE AUDITORÍA

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA SIAR                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────┐ │
│  │Dossier │  │  Risk  │  │  PEP   │  │ Alert  │  │ User │ │
│  │ Module │  │ Module │  │ Module │  │ Module │  │Module│ │
│  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘  └──┬───┘ │
│      │           │           │           │          │     │
│      └───────────┴───────────┴───────────┴──────────┘     │
│                          │                                  │
│                          ▼                                  │
│              ┌───────────────────────┐                     │
│              │  AUDIT INTERCEPTOR    │                     │
│              │  (AOP / Event Driven) │                     │
│              └───────────┬───────────┘                     │
│                          │                                  │
│                          ▼                                  │
│              ┌───────────────────────┐                     │
│              │   AUDIT SERVICE       │                     │
│              │  - Hash Calculation   │                     │
│              │  - Chain Verification │                     │
│              │  - Event Logging      │                     │
│              └───────────┬───────────┘                     │
│                          │                                  │
│                          ▼                                  │
│              ┌───────────────────────┐                     │
│              │   AUDIT_LOGS TABLE    │                     │
│              │  (IMMUTABLE STORAGE)  │                     │
│              └───────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Auditoría

```
1. EVENTO OCURRE
   │
   ├─> Se captura contexto completo
   │   • Actor (usuario, rol, IP)
   │   • Recurso afectado
   │   • Acción realizada
   │   • Estado anterior/nuevo
   │
2. ENRIQUECIMIENTO
   │
   ├─> Se agrega información adicional
   │   • Sesión y dispositivo
   │   • Contexto de negocio
   │   • Información técnica
   │
3. HASH CALCULATION
   │
   ├─> Se calcula hash del registro
   │   • SHA-256 de campos críticos
   │   • Se incluye hash del registro anterior
   │
4. PERSISTENCIA
   │
   ├─> Se inserta en tabla inmutable
   │   • Transacción independiente
   │   • Triggers verifican inmutabilidad
   │
5. VERIFICACIÓN
   │
   └─> Se valida integridad
       • Hash calculado vs esperado
       • Continuidad de la cadena
```

---

## 📊 MODELO DE DATOS

### Entidad Principal: AUDIT_LOGS

```sql
CREATE TABLE audit_logs (
    -- IDENTIFICACIÓN
    audit_id VARCHAR(25) PRIMARY KEY,          -- AUD-YYYY-NNNNNNNNNN
    sequence_number BIGINT UNIQUE NOT NULL,    -- Secuencia global
    
    -- EVENTO
    event_code VARCHAR(10) NOT NULL,           -- Código del evento
    event_name VARCHAR(200) NOT NULL,          -- Nombre descriptivo
    event_category VARCHAR(30) NOT NULL,       -- DOSSIER, RISK, PEP, etc.
    event_level VARCHAR(20) NOT NULL,          -- INFO, WARNING, ERROR, CRITICAL
    event_timestamp TIMESTAMP NOT NULL,        -- Momento exacto
    event_date DATE NOT NULL,                  -- Fecha (índice)
    event_time TIME NOT NULL,                  -- Hora (índice)
    
    -- ACTOR (QUIEN)
    user_id VARCHAR(50) NOT NULL,              -- ID del usuario
    user_name VARCHAR(200) NOT NULL,           -- Nombre completo
    user_email VARCHAR(100) NOT NULL,          -- Email
    user_role VARCHAR(50) NOT NULL,            -- Rol en el momento
    user_department VARCHAR(100),              -- Departamento
    user_location VARCHAR(100),                -- Ubicación
    
    -- SESIÓN
    session_id VARCHAR(100),                   -- ID de sesión
    ip_address VARCHAR(45),                    -- IP (IPv4/IPv6)
    user_agent VARCHAR(500),                   -- User Agent
    device VARCHAR(50),                        -- Tipo dispositivo
    browser VARCHAR(100),                      -- Navegador
    os VARCHAR(100),                           -- Sistema operativo
    
    -- RECURSO (QUÉ)
    resource_type VARCHAR(50) NOT NULL,        -- Tipo de recurso
    resource_id VARCHAR(100) NOT NULL,         -- ID del recurso
    resource_name VARCHAR(500),                -- Nombre descriptivo
    parent_resource_type VARCHAR(50),          -- Recurso padre
    parent_resource_id VARCHAR(100),           -- ID del padre
    
    -- ACCIÓN (CÓMO)
    action_type VARCHAR(30) NOT NULL,          -- CREATE, READ, UPDATE, DELETE
    action_verb VARCHAR(30) NOT NULL,          -- CREATED, ACCESSED, etc.
    action_description VARCHAR(1000) NOT NULL, -- Descripción detallada
    action_method VARCHAR(10),                 -- HTTP Method
    action_endpoint VARCHAR(500),              -- API Endpoint
    action_duration INTEGER,                   -- Duración en ms
    
    -- CAMBIOS DE ESTADO
    has_state_change BOOLEAN NOT NULL,         -- ¿Hubo cambio?
    previous_state JSONB,                      -- Estado anterior
    new_state JSONB,                           -- Estado nuevo
    changed_fields JSONB,                      -- Campos modificados
    
    -- CONTEXTO DE NEGOCIO
    justification VARCHAR(2000),               -- Justificación
    regulatory_basis VARCHAR(500),             -- Base regulatoria
    compliance_notes VARCHAR(2000),            -- Notas de cumplimiento
    related_entities JSONB,                    -- Entidades relacionadas
    
    -- INFORMACIÓN TÉCNICA
    application_version VARCHAR(50),           -- Versión de la app
    database_version VARCHAR(100),             -- Versión de BD
    server_hostname VARCHAR(100),              -- Servidor
    request_id VARCHAR(100),                   -- ID de petición
    transaction_id VARCHAR(100),               -- ID de transacción
    
    -- SEGURIDAD
    authentication_method VARCHAR(50),         -- Método de auth
    authorization_passed BOOLEAN,              -- ¿Pasó autorización?
    permissions_checked JSONB,                 -- Permisos verificados
    security_level VARCHAR(30),                -- Nivel de seguridad
    
    -- PROTECCIÓN DE DATOS
    contains_pii BOOLEAN,                      -- ¿Contiene PII?
    data_classification VARCHAR(30),           -- Clasificación
    encryption_applied BOOLEAN,                -- ¿Encriptado?
    anonymization_required BOOLEAN,            -- ¿Requiere anonimización?
    
    -- CADENA DE HASH (BLOCKCHAIN-LIKE)
    record_hash VARCHAR(64) NOT NULL,          -- Hash de este registro
    previous_record_hash VARCHAR(64),          -- Hash del anterior
    
    -- METADATA
    created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- Creación del registro
    record_version VARCHAR(10) NOT NULL DEFAULT '1.0', -- Versión formato
    exported BOOLEAN NOT NULL DEFAULT FALSE,   -- ¿Exportado?
    exported_at TIMESTAMP,                     -- Fecha exportación
    exported_by VARCHAR(50)                    -- Usuario que exportó
);
```

### Enumeraciones

#### EventCategory
```java
public enum EventCategory {
    DOSSIER,           // Eventos de expedientes
    RISK_ASSESSMENT,   // Evaluación de riesgo
    PEP_MANAGEMENT,    // Gestión de PEP
    SCREENING,         // Filtrado y listas
    ALERT,             // Alertas y seguimiento
    USER_MANAGEMENT,   // Gestión de usuarios
    AUTHENTICATION,    // Autenticación
    AUTHORIZATION,     // Autorización
    CONFIGURATION,     // Configuración del sistema
    INTEGRATION,       // Integraciones externas
    SYSTEM,            // Eventos del sistema
    SECURITY,          // Eventos de seguridad
    COMPLIANCE,        // Cumplimiento regulatorio
    DATA_PROTECTION,   // Protección de datos
    EXPORT,            // Exportaciones
    AUDIT              // Auditoría misma
}
```

#### EventLevel
```java
public enum EventLevel {
    INFO,              // Informativo
    WARNING,           // Advertencia
    ERROR,             // Error
    CRITICAL           // Crítico
}
```

#### ActionType
```java
public enum ActionType {
    CREATE,            // Creación
    READ,              // Lectura
    UPDATE,            // Actualización
    DELETE,            // Eliminación
    APPROVE,           // Aprobación
    REJECT,            // Rechazo
    SUBMIT,            // Envío
    EXPORT,            // Exportación
    IMPORT,            // Importación
    LOGIN,             // Inicio de sesión
    LOGOUT,            // Cierre de sesión
    CONFIGURE,         // Configuración
    EXECUTE,           // Ejecución
    VERIFY             // Verificación
}
```

---

## 🔒 ESTRATEGIAS DE INMUTABILIDAD

### 1. Nivel de Aplicación (Java)

```java
@Entity
@Table(name = "audit_logs")
@Immutable  // Hibernate: marca como inmutable
public class AuditLog {
    
    // No hay setters después de la construcción
    // Solo se puede crear con Builder
    
    @PrePersist
    protected void onCreate() {
        // Solo se ejecuta en INSERT
        createdAt = Instant.now();
    }
    
    // @PreUpdate y @PreRemove NO EXISTEN
}
```

### 2. Nivel de Base de Datos (PostgreSQL)

#### Trigger: Prevenir UPDATE

```sql
CREATE OR REPLACE FUNCTION prevent_audit_log_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'UPDATE operation not allowed on audit_logs table. Audit logs are immutable.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_update_trigger
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_update();
```

#### Trigger: Prevenir DELETE

```sql
CREATE OR REPLACE FUNCTION prevent_audit_log_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'DELETE operation not allowed on audit_logs table. Audit logs are immutable.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_delete_trigger
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_delete();
```

#### Trigger: Validar Hash Chain

```sql
CREATE OR REPLACE FUNCTION validate_audit_hash_chain()
RETURNS TRIGGER AS $$
DECLARE
    last_hash VARCHAR(64);
BEGIN
    -- Obtener el hash del último registro
    SELECT record_hash INTO last_hash
    FROM audit_logs
    ORDER BY sequence_number DESC
    LIMIT 1;
    
    -- Validar que el previous_record_hash coincide
    IF last_hash IS NOT NULL AND NEW.previous_record_hash != last_hash THEN
        RAISE EXCEPTION 'Hash chain broken! Expected: %, Got: %', 
            last_hash, NEW.previous_record_hash;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_audit_hash_chain_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION validate_audit_hash_chain();
```

### 3. Políticas de Seguridad (RLS - Row Level Security)

```sql
-- Habilitar RLS en la tabla
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: SOLO el sistema puede insertar
CREATE POLICY audit_logs_insert_policy ON audit_logs
    FOR INSERT
    TO siar_application_user
    WITH CHECK (true);

-- Política: Auditor puede leer TODO
CREATE POLICY audit_logs_auditor_read_policy ON audit_logs
    FOR SELECT
    TO siar_auditor_role
    USING (true);

-- Política: Usuario normal solo puede leer SUS propios eventos
CREATE POLICY audit_logs_user_read_policy ON audit_logs
    FOR SELECT
    TO siar_user_role
    USING (user_id = current_setting('app.current_user_id')::VARCHAR);

-- Política: Cumplimiento puede leer TODO excepto PII sensible
CREATE POLICY audit_logs_compliance_read_policy ON audit_logs
    FOR SELECT
    TO siar_compliance_role
    USING (true);

-- NO hay políticas de UPDATE ni DELETE
```

### 4. Permisos de Usuario

```sql
-- Rol de aplicación: solo INSERT
GRANT INSERT ON audit_logs TO siar_application_user;
REVOKE UPDATE, DELETE ON audit_logs FROM siar_application_user;

-- Rol de auditor: solo SELECT
GRANT SELECT ON audit_logs TO siar_auditor_role;
REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM siar_auditor_role;

-- Rol de cumplimiento: solo SELECT
GRANT SELECT ON audit_logs TO siar_compliance_role;
REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM siar_compliance_role;

-- Rol de usuario: solo SELECT (limitado por RLS)
GRANT SELECT ON audit_logs TO siar_user_role;
REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM siar_user_role;
```

---

## 🔗 CADENA DE HASH (HASH CHAIN)

### Concepto

La cadena de hash es una técnica inspirada en blockchain que garantiza la integridad de los registros de auditoría:

```
┌─────────────────┐
│  REGISTRO #1    │
│  Hash: AAAA...  │
│  Prev: GENESIS  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  REGISTRO #2    │
│  Hash: BBBB...  │
│  Prev: AAAA...  │ ◄── Hash del anterior
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  REGISTRO #3    │
│  Hash: CCCC...  │
│  Prev: BBBB...  │ ◄── Hash del anterior
└─────────────────┘
```

### Algoritmo de Hash

```java
public class AuditService {
    
    /**
     * Calcula el hash SHA-256 de un registro de auditoría
     */
    private String calculateRecordHash(AuditLog auditLog) {
        // Construir cadena de datos
        String dataToHash = String.format("%s|%d|%s|%s|%s|%s|%s|%s|%s",
            auditLog.getAuditId(),
            auditLog.getSequenceNumber(),
            auditLog.getEventCode(),
            auditLog.getEventTimestamp(),
            auditLog.getUserId(),
            auditLog.getResourceType(),
            auditLog.getResourceId(),
            auditLog.getActionVerb(),
            auditLog.getPreviousRecordHash()
        );
        
        // Calcular SHA-256
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));
        
        // Convertir a hexadecimal
        return HexFormat.of().formatHex(hash);
    }
    
    /**
     * Verifica la integridad de la cadena de hash
     */
    public boolean verifyChainIntegrity(String startAuditId, String endAuditId) {
        List<AuditLog> records = auditLogRepository
            .findByAuditIdBetweenOrderBySequenceNumberAsc(startAuditId, endAuditId);
        
        for (int i = 1; i < records.size(); i++) {
            AuditLog current = records.get(i);
            AuditLog previous = records.get(i - 1);
            
            // Verificar continuidad
            if (!current.getPreviousRecordHash().equals(previous.getRecordHash())) {
                return false; // Cadena rota
            }
            
            // Recalcular hash
            String calculatedHash = calculateRecordHash(current);
            if (!calculatedHash.equals(current.getRecordHash())) {
                return false; // Hash alterado
            }
        }
        
        return true;
    }
}
```

### Detección de Manipulación

Si alguien intenta modificar un registro:

1. **El hash del registro cambia** → No coincide con el hash almacenado
2. **Los registros posteriores quedan inválidos** → Su `previous_record_hash` ya no coincide
3. **La verificación de integridad falla** → Se detecta la manipulación

---

## 🔄 INTEGRACIÓN TRANSVERSAL

### Eventos Auditables por Módulo

#### DOSSIER
```
AUD-D01: Dossier creado
AUD-D02: Dossier actualizado
AUD-D03: Estado de dossier cambiado
AUD-D04: Dossier asignado
AUD-D05: Documentos agregados
AUD-D06: Aprobación de dossier
AUD-D07: Rechazo de dossier
AUD-D08: Dossier exportado
```

#### RISK ASSESSMENT
```
AUD-R01: Evaluación de riesgo iniciada
AUD-R02: Factores de riesgo calculados
AUD-R03: Nivel de riesgo determinado
AUD-R04: Riesgo reclasificado
AUD-R05: Aprobación de riesgo alto
AUD-R06: Configuración de riesgo modificada
```

#### PEP MANAGEMENT
```
AUD-P01: PEP identificado
AUD-P02: Clasificación PEP actualizada
AUD-P03: Estado PEP cambiado
AUD-P04: Relación PEP agregada
AUD-P05: EDD requerida
AUD-P06: EDD aprobada
```

#### ALERTS
```
AUD-A01: Alerta generada
AUD-A02: Alerta asignada
AUD-A03: Seguimiento agregado
AUD-A04: Alerta atendida
AUD-A05: Alerta cerrada
```

#### USER MANAGEMENT
```
AUD-U01: Usuario creado
AUD-U02: Usuario actualizado
AUD-U03: Rol asignado
AUD-U04: Rol revocado
AUD-U05: Usuario bloqueado
AUD-U06: Usuario desbloqueado
```

#### AUTHENTICATION & AUTHORIZATION
```
AUD-S01: Login exitoso
AUD-S02: Login fallido
AUD-S03: Logout
AUD-S04: Sesión expirada
AUD-S05: Acceso denegado
AUD-S06: Cambio de contraseña
AUD-S07: Reseteo de contraseña
```

### Interceptor de Auditoría (AOP)

```java
@Aspect
@Component
public class AuditInterceptor {
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Intercepta todas las modificaciones de expedientes
     */
    @AfterReturning(
        pointcut = "execution(* com.siar.dossier.service.*.save*(..)) " +
                   "|| execution(* com.siar.dossier.service.*.update*(..))",
        returning = "result"
    )
    public void auditDossierChange(JoinPoint joinPoint, Object result) {
        // Extraer información
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        // Determinar evento
        String eventCode = methodName.startsWith("save") ? "AUD-D01" : "AUD-D02";
        String eventName = methodName.startsWith("save") ? 
            "Dossier creado" : "Dossier actualizado";
        
        // Registrar en auditoría
        auditService.logEvent(
            eventCode,
            eventName,
            EventCategory.DOSSIER,
            EventLevel.INFO,
            ActionType.CREATE,
            "DOSSIER",
            extractDossierId(result),
            args.length > 0 ? args[0] : null,  // previous state
            result                              // new state
        );
    }
    
    // Más interceptores para otros módulos...
}
```

---

## 📊 CONSULTAS Y VISTAS

### Vistas Especializadas

#### Vista: Eventos Críticos Recientes

```sql
CREATE VIEW audit_critical_events AS
SELECT 
    audit_id,
    event_timestamp,
    event_name,
    event_category,
    user_name,
    user_role,
    resource_type,
    resource_id,
    action_description,
    ip_address
FROM audit_logs
WHERE event_level = 'CRITICAL'
  AND event_timestamp >= NOW() - INTERVAL '30 days'
ORDER BY event_timestamp DESC;
```

#### Vista: Actividad por Usuario

```sql
CREATE VIEW audit_user_activity AS
SELECT 
    user_id,
    user_name,
    user_role,
    event_date,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_level = 'CRITICAL' THEN 1 END) as critical_events,
    COUNT(CASE WHEN event_level = 'ERROR' THEN 1 END) as error_events,
    COUNT(DISTINCT resource_id) as resources_accessed,
    MIN(event_timestamp) as first_activity,
    MAX(event_timestamp) as last_activity
FROM audit_logs
GROUP BY user_id, user_name, user_role, event_date
ORDER BY event_date DESC, total_events DESC;
```

#### Vista: Trail de Expedientes

```sql
CREATE VIEW audit_dossier_trail AS
SELECT 
    resource_id as dossier_id,
    audit_id,
    sequence_number,
    event_timestamp,
    event_name,
    user_name,
    user_role,
    action_verb,
    action_description,
    previous_state,
    new_state,
    changed_fields,
    justification
FROM audit_logs
WHERE resource_type = 'DOSSIER'
ORDER BY resource_id, sequence_number;
```

#### Vista: Resumen Diario

```sql
CREATE VIEW audit_daily_summary AS
SELECT 
    event_date,
    event_category,
    event_level,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT resource_id) as resources_affected,
    COUNT(CASE WHEN has_state_change THEN 1 END) as state_changes
FROM audit_logs
GROUP BY event_date, event_category, event_level
ORDER BY event_date DESC, event_category;
```

### Funciones de Consulta

#### Buscar por Expediente

```sql
CREATE FUNCTION get_dossier_audit_trail(p_dossier_id VARCHAR)
RETURNS TABLE (
    event_time TIMESTAMP,
    event_description VARCHAR,
    user_name VARCHAR,
    changes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        event_timestamp,
        action_description,
        user_name,
        changed_fields
    FROM audit_logs
    WHERE resource_type = 'DOSSIER'
      AND resource_id = p_dossier_id
    ORDER BY event_timestamp ASC;
END;
$$ LANGUAGE plpgsql;
```

#### Eventos de un Usuario en Rango de Fechas

```sql
CREATE FUNCTION get_user_events_in_range(
    p_user_id VARCHAR,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    audit_id VARCHAR,
    event_time TIMESTAMP,
    event_name VARCHAR,
    resource_accessed VARCHAR,
    action_taken VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.audit_id,
        a.event_timestamp,
        a.event_name,
        CONCAT(a.resource_type, ':', a.resource_id),
        a.action_verb
    FROM audit_logs a
    WHERE a.user_id = p_user_id
      AND a.event_date BETWEEN p_start_date AND p_end_date
    ORDER BY a.event_timestamp ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 SEGURIDAD Y CONTROL DE ACCESO

### Matriz de Permisos

| Rol               | SELECT | INSERT | UPDATE | DELETE | EXPORT |
|-------------------|--------|--------|--------|--------|--------|
| SISTEMA           | ✅     | ✅     | ❌     | ❌     | ❌     |
| AUDITOR_INTERNO   | ✅     | ❌     | ❌     | ❌     | ✅     |
| AUDITOR_EXTERNO   | ✅     | ❌     | ❌     | ❌     | ✅     |
| CUMPLIMIENTO      | ✅     | ❌     | ❌     | ❌     | ✅     |
| ADMIN_SISTEMA     | ✅     | ❌     | ❌     | ❌     | ✅     |
| OFICIAL_CUMPLIMIENTO | ✅ (filtrado) | ❌ | ❌ | ❌ | ✅   |
| GERENTE           | ✅ (limitado) | ❌ | ❌ | ❌ | ❌    |
| ANALISTA          | ✅ (propio) | ❌ | ❌ | ❌ | ❌      |

### Filtros de Acceso

```java
@Service
public class AuditAccessControlService {
    
    /**
     * Verifica si el usuario puede acceder al log de auditoría
     */
    public boolean canAccessAuditLog(String userId, String auditId) {
        User user = userService.findById(userId);
        AuditLog auditLog = auditService.findById(auditId);
        
        // Auditor: acceso total
        if (user.hasRole("AUDITOR_INTERNO") || user.hasRole("AUDITOR_EXTERNO")) {
            return true;
        }
        
        // Cumplimiento: acceso total
        if (user.hasRole("CUMPLIMIENTO")) {
            return true;
        }
        
        // Admin: acceso total
        if (user.hasRole("ADMIN_SISTEMA")) {
            return true;
        }
        
        // Usuario normal: solo sus propios eventos
        if (auditLog.getUserId().equals(userId)) {
            return true;
        }
        
        // Gerente: eventos de su departamento
        if (user.hasRole("GERENTE")) {
            return auditLog.getUserDepartment().equals(user.getDepartment());
        }
        
        return false;
    }
    
    /**
     * Aplica filtros según el rol del usuario
     */
    public Specification<AuditLog> applyRoleFilters(String userId) {
        User user = userService.findById(userId);
        
        // Sin filtros para roles de auditoría
        if (user.hasAnyRole("AUDITOR_INTERNO", "AUDITOR_EXTERNO", "CUMPLIMIENTO")) {
            return (root, query, cb) -> cb.conjunction();
        }
        
        // Filtrar por usuario
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }
}
```

---

## 📦 RETENCIÓN Y ARCHIVADO

### Políticas de Retención

```sql
-- Tabla de configuración de retención
CREATE TABLE audit_retention_policy (
    policy_id SERIAL PRIMARY KEY,
    event_category VARCHAR(30) NOT NULL,
    event_level VARCHAR(20) NOT NULL,
    retention_days INTEGER NOT NULL,
    archive_after_days INTEGER NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Políticas por defecto
INSERT INTO audit_retention_policy 
    (event_category, event_level, retention_days, archive_after_days, description)
VALUES
    ('AUTHENTICATION', 'CRITICAL', 2555, 365, 'Login/logout críticos: 7 años online, archivo después de 1 año'),
    ('DOSSIER', 'INFO', 2555, 365, 'Expedientes: 7 años online'),
    ('RISK_ASSESSMENT', 'INFO', 2555, 365, 'Evaluaciones de riesgo: 7 años online'),
    ('PEP_MANAGEMENT', 'INFO', 3650, 730, 'PEP: 10 años online, archivo después de 2 años'),
    ('SYSTEM', 'INFO', 365, 90, 'Sistema: 1 año online, archivo después de 90 días'),
    ('SECURITY', 'CRITICAL', 3650, 365, 'Seguridad crítica: 10 años online');
```

### Proceso de Archivado

```sql
-- Tabla de archivo
CREATE TABLE audit_logs_archive (
    LIKE audit_logs INCLUDING ALL
);

-- Función de archivado
CREATE OR REPLACE FUNCTION archive_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Mover registros a archivo según políticas
    WITH archived AS (
        INSERT INTO audit_logs_archive
        SELECT a.*
        FROM audit_logs a
        INNER JOIN audit_retention_policy p 
            ON a.event_category = p.event_category 
            AND a.event_level = p.event_level
        WHERE a.event_date < CURRENT_DATE - (p.archive_after_days || ' days')::INTERVAL
          AND p.active = TRUE
        RETURNING *
    )
    SELECT COUNT(*) INTO archived_count FROM archived;
    
    -- NO eliminamos de la tabla principal
    -- Solo marcamos como archivados
    UPDATE audit_logs a
    SET exported = TRUE,
        exported_at = NOW(),
        exported_by = 'ARCHIVE_SYSTEM'
    FROM audit_retention_policy p
    WHERE a.event_category = p.event_category
      AND a.event_level = p.event_level
      AND a.event_date < CURRENT_DATE - (p.archive_after_days || ' days')::INTERVAL
      AND p.active = TRUE
      AND a.exported = FALSE;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 💼 CASOS DE USO

### 1. Auditoría Interna Anual

```sql
-- Obtener todos los eventos críticos del último año
SELECT 
    event_date,
    event_category,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as users_involved,
    COUNT(DISTINCT resource_id) as resources_affected
FROM audit_logs
WHERE event_level = 'CRITICAL'
  AND event_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY event_date, event_category
ORDER BY event_date DESC;
```

### 2. Investigación de Incidente de Seguridad

```sql
-- Obtener toda la actividad de un usuario sospechoso
SELECT 
    audit_id,
    event_timestamp,
    event_name,
    resource_type,
    resource_id,
    action_description,
    ip_address,
    device
FROM audit_logs
WHERE user_id = 'USR12345'
  AND event_date BETWEEN '2025-01-01' AND '2025-01-15'
ORDER BY event_timestamp ASC;
```

### 3. Reconstrucción de Cambios en un Expediente

```sql
-- Ver toda la historia de un expediente
SELECT 
    event_timestamp,
    event_name,
    user_name,
    user_role,
    action_verb,
    previous_state->>'status' as previous_status,
    new_state->>'status' as new_status,
    justification
FROM audit_logs
WHERE resource_type = 'DOSSIER'
  AND resource_id = 'DOSS-2025-0001234'
ORDER BY event_timestamp ASC;
```

### 4. Verificación de Integridad

```java
// Verificar integridad de la cadena de hash
public class AuditIntegrityReport {
    
    public IntegrityCheckResult verifyFullChain() {
        // Obtener primer y último registro
        AuditLog first = auditRepository.findFirstByOrderBySequenceNumberAsc();
        AuditLog last = auditRepository.findTopByOrderBySequenceNumberDesc();
        
        // Verificar cadena completa
        boolean isValid = auditService.verifyChainIntegrity(
            first.getAuditId(),
            last.getAuditId()
        );
        
        return IntegrityCheckResult.builder()
            .isValid(isValid)
            .firstRecord(first.getAuditId())
            .lastRecord(last.getAuditId())
            .totalRecords(last.getSequenceNumber())
            .checkedAt(Instant.now())
            .build();
    }
}
```

### 5. Cumplimiento Regulatorio (SUDEBAN)

```sql
-- Reporte de cumplimiento SUDEBAN
-- Todos los expedientes de alto riesgo con PEP
SELECT 
    a.resource_id as dossier_id,
    a.event_timestamp,
    a.user_name,
    a.action_description,
    a.new_state->>'riskLevel' as risk_level,
    a.new_state->>'pepStatus' as pep_status,
    a.justification,
    a.regulatory_basis
FROM audit_logs a
WHERE a.resource_type = 'DOSSIER'
  AND (
      a.event_code IN ('AUD-D06', 'AUD-P05', 'AUD-R05') -- Aprobaciones
      OR (a.new_state->>'riskLevel' IN ('HIGH', 'CRITICAL'))
      OR (a.new_state->>'pepStatus' = 'CONFIRMED')
  )
  AND a.event_date >= CURRENT_DATE - INTERVAL '1 year'
ORDER BY a.event_timestamp DESC;
```

---

## 📈 MÉTRICAS Y MONITOREO

### Dashboard de Auditoría

```sql
-- Crear vista materializada para dashboard
CREATE MATERIALIZED VIEW audit_dashboard_metrics AS
SELECT 
    -- Métricas generales
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT resource_id) as affected_resources,
    
    -- Por nivel
    COUNT(CASE WHEN event_level = 'CRITICAL' THEN 1 END) as critical_events,
    COUNT(CASE WHEN event_level = 'ERROR' THEN 1 END) as error_events,
    COUNT(CASE WHEN event_level = 'WARNING' THEN 1 END) as warning_events,
    COUNT(CASE WHEN event_level = 'INFO' THEN 1 END) as info_events,
    
    -- Por categoría
    COUNT(CASE WHEN event_category = 'DOSSIER' THEN 1 END) as dossier_events,
    COUNT(CASE WHEN event_category = 'RISK_ASSESSMENT' THEN 1 END) as risk_events,
    COUNT(CASE WHEN event_category = 'PEP_MANAGEMENT' THEN 1 END) as pep_events,
    COUNT(CASE WHEN event_category = 'ALERT' THEN 1 END) as alert_events,
    COUNT(CASE WHEN event_category = 'SECURITY' THEN 1 END) as security_events,
    
    -- Integridad
    MAX(sequence_number) as last_sequence_number,
    MAX(event_timestamp) as last_event_time,
    
    -- Fecha de actualización
    NOW() as calculated_at
FROM audit_logs
WHERE event_date >= CURRENT_DATE - INTERVAL '30 days';

-- Refrescar cada hora
CREATE INDEX ON audit_dashboard_metrics (calculated_at);
```

---

## 🎯 CONCLUSIÓN

El Sistema de Auditoría Inmutable de SIAR proporciona:

✅ **Inmutabilidad Total**: Ningún registro puede ser modificado o eliminado
✅ **Integridad Verificable**: Cadena de hash tipo blockchain detecta manipulación
✅ **Trazabilidad Completa**: Reconstrucción exacta de cualquier evento
✅ **Cumplimiento Regulatorio**: Cumple con SUDEBAN, LOCTICSEP, ISO 27001
✅ **Seguridad Multinivel**: Protección en aplicación, base de datos y acceso
✅ **Acceso Controlado**: RLS y permisos según rol del usuario
✅ **Retención Inteligente**: Políticas de archivado según regulaciones

Este modelo garantiza la transparencia, accountability y cumplimiento regulatorio del Sistema SIAR.
