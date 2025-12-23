# Modelo de Base de Datos Relacional - SIAR
## Sistema Integral de Administración de Riesgos y Cumplimiento

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Motor de BD:** PostgreSQL 15+  
**Enfoque:** Basado en Riesgo con Trazabilidad Total

---

## 1. PRINCIPIOS DEL MODELO DE DATOS

### 1.1 Principios Obligatorios

1. **No Eliminación Física**: No se permiten operaciones DELETE en tablas críticas
2. **Trazabilidad Total**: Todo cambio debe registrarse en tablas de historial
3. **Auditoría Transversal**: Tabla de auditoría inmutable que registra todas las operaciones
4. **Campos de Auditoría**: Todas las tablas críticas incluyen:
   - `created_at TIMESTAMP NOT NULL`
   - `created_by VARCHAR(100) NOT NULL`
   - `updated_at TIMESTAMP`
   - `updated_by VARCHAR(100)`
5. **Uso de Estados**: Eliminación lógica mediante campos de estado
6. **Versionado**: Tablas críticas mantienen historial de versiones
7. **Expediente como Eje Central**: El expediente (dossier) es el centro del modelo

### 1.2 Estrategias de Diseño

- **Normalización**: Modelo en 3FN con desnormalización estratégica
- **JSONB para Flexibilidad**: Uso de JSONB para estructuras complejas y variables
- **Índices Estratégicos**: Índices en campos de búsqueda frecuente
- **Constraints**: Validación a nivel de BD mediante CHECK constraints
- **Foreign Keys**: Integridad referencial con ON DELETE RESTRICT
- **UUIDs**: Identificadores universales únicos para registros críticos

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN COMPLETO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MÓDULO DE USUARIOS Y SEGURIDAD                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                                                                
    ┌──────────────┐            ┌──────────────┐         ┌─────────────────┐
    │    USERS     │────────────│  USER_ROLES  │─────────│     ROLES       │
    │              │  1      N  │              │  N   1  │                 │
    │ id (PK)      │            │ user_id (FK) │         │ id (PK)         │
    │ email        │            │ role_id (FK) │         │ role_code       │
    │ status       │            │              │         │ role_name       │
    └──────┬───────┘            └──────────────┘         └────────┬────────┘
           │                                                       │
           │ creates                                               │
           │                                                       │
           │                    ┌──────────────┐                  │
           └───────────────────>│ PERMISSIONS  │<─────────────────┘
                                │              │
                                │ id (PK)      │
                                │ resource     │
                                │ action       │
                                └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       MÓDULO DE EXPEDIENTES (CORE)                          │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │    DOSSIERS      │ ◄─── EJE CENTRAL DEL MODELO
    │                  │
    │ id (PK)          │
    │ dossier_number   │
    │ subject_type     │ (CLIENTE, INTERMEDIARIO, etc.)
    │ status           │
    │ risk_level       │
    │ structured_data  │ (JSONB - datos del formulario)
    │ created_at       │
    │ created_by       │
    │ updated_at       │
    │ updated_by       │
    │ approved_at      │
    │ approved_by      │
    │ active           │
    └────────┬─────────┘
             │
             │ 1:N
             │
     ┌───────┴────────┬──────────────┬──────────────┬─────────────┐
     │                │              │              │             │
     ▼                ▼              ▼              ▼             ▼
┌──────────┐  ┌────────────┐ ┌──────────┐  ┌────────────┐ ┌──────────┐
│DOSSIER   │  │DOSSIER     │ │DOSSIER   │  │ATTACHED    │ │REVIEW    │
│CHANGE    │  │DOCUMENTS   │ │COMMENTS  │  │DOCUMENTS   │ │COMMENTS  │
│HISTORY   │  │            │ │          │  │            │ │          │
│          │  │            │ │          │  │            │ │          │
│(Inmutable│  │            │ │          │  │            │ │          │
│Append    │  │            │ │          │  │            │ │          │
│Only)     │  │            │ │          │  │            │ │          │
└──────────┘  └────────────┘ └──────────┘  └────────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    MÓDULO DE EVALUACIÓN DE RIESGO                           │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ RISK_EVALUATIONS │
    │                  │
    │ id (PK)          │
    │ dossier_id (FK)  │────────> DOSSIERS
    │ evaluation_date  │
    │ total_score      │
    │ risk_level       │
    │ evaluation_data  │ (JSONB - criterios evaluados)
    │ evaluator        │
    │ version          │
    └────────┬─────────┘
             │
             │ 1:N
             │
     ┌───────┴────────┬──────────────┐
     │                │              │
     ▼                ▼              ▼
┌──────────┐  ┌────────────┐ ┌──────────────┐
│EVALUATION│  │RISK_FACTORS│ │RISK_FACTOR   │
│HISTORY   │  │            │ │VALUES        │
│          │  │ id (PK)    │ │              │
│          │  │ factor_code│ │ factor_id    │
│          │  │ name       │ │ entity_type  │
│          │  │ weight     │ │ value        │
│          │  │ active     │ │ risk_score   │
└──────────┘  └────────────┘ └──────────────┘

    ┌──────────────────┐
    │RISK_             │
    │CONFIGURATIONS    │
    │                  │
    │ id (PK)          │
    │ entity_type      │
    │ config_data      │ (JSONB - umbrales, ponderaciones)
    │ active           │
    │ version          │
    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        MÓDULO DE ALERTAS Y NOTIFICACIONES                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   ALERTS     │
    │              │
    │ id (PK)      │
    │ dossier_id   │────────> DOSSIERS
    │ alert_type   │
    │ level        │ (INFO, WARNING, CRITICAL)
    │ status       │ (PENDING, RESOLVED, DISMISSED)
    │ title        │
    │ message      │
    │ metadata     │ (JSONB)
    │ created_at   │
    │ resolved_at  │
    │ resolved_by  │
    └──────┬───────┘
           │
           │ 1:N
           │
           ▼
    ┌──────────────┐
    │ALERT_        │
    │TRACKING      │
    │              │
    │ id (PK)      │
    │ alert_id     │
    │ action_type  │ (VIEWED, ASSIGNED, COMMENTED, RESOLVED)
    │ action_by    │
    │ action_at    │
    │ comments     │
    └──────────────┘

    ┌──────────────┐
    │NOTIFICATIONS │
    │              │
    │ id (PK)      │
    │ user_id      │────────> USERS
    │ alert_id     │────────> ALERTS (nullable)
    │ type         │ (EMAIL, IN_APP, SMS)
    │ status       │ (PENDING, SENT, FAILED, READ)
    │ subject      │
    │ content      │
    │ sent_at      │
    │ read_at      │
    └──────────────┘

    ┌──────────────┐
    │ALERT_TYPES   │ (Catálogo)
    │              │
    │ id (PK)      │
    │ type_code    │
    │ type_name    │
    │ description  │
    │ default_level│
    │ active       │
    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           MÓDULO DE SCREENING                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  SCREENINGS  │
    │              │
    │ id (PK)      │
    │ dossier_id   │────────> DOSSIERS
    │ screening_at │
    │ initiated_by │
    │ status       │ (PENDING, IN_PROGRESS, COMPLETED)
    │ result       │ (CLEAR, MATCH, REVIEW_REQUIRED)
    │ completed_at │
    └──────┬───────┘
           │
           │ 1:N
           │
           ▼
    ┌──────────────┐         ┌──────────────┐
    │SCREENING     │         │SCREENING     │
    │RESULTS       │         │DECISIONS     │
    │              │         │              │
    │ id (PK)      │         │ id (PK)      │
    │ screening_id │         │ screening_id │
    │ list_type    │         │ decision     │ (APPROVE, REJECT, REQUEST_INFO)
    │ match_data   │(JSONB)  │ decided_by   │
    │ match_score  │         │ decided_at   │
    │ reviewed     │         │ justification│
    └──────────────┘         └──────────────┘

    ┌──────────────┐         ┌──────────────┐
    │ WATCHLISTS   │         │WATCHLIST_    │
    │              │1      N │ENTRIES       │
    │ id (PK)      │─────────│              │
    │ list_name    │         │ id (PK)      │
    │ list_type    │         │ watchlist_id │
    │ source       │         │ full_name    │
    │ last_updated │         │ entry_data   │(JSONB)
    │ active       │         │ risk_category│
    └──────────────┘         └──────────────┘

    ┌──────────────┐
    │   MATCHES    │
    │              │
    │ id (PK)      │
    │ screening_id │────────> SCREENINGS
    │ entry_id     │────────> WATCHLIST_ENTRIES
    │ match_score  │
    │ match_data   │ (JSONB - detalles del match)
    │ status       │ (PENDING, CONFIRMED, FALSE_POSITIVE)
    │ reviewed_by  │
    │ reviewed_at  │
    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         MÓDULO DE DEBIDA DILIGENCIA                         │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ DUE_DILIGENCES   │
    │                  │
    │ id (PK)          │
    │ dossier_id (FK)  │────────> DOSSIERS
    │ dd_type          │ (STANDARD, ENHANCED, SIMPLIFIED)
    │ status           │ (PENDING, IN_PROGRESS, COMPLETED)
    │ initiated_at     │
    │ initiated_by     │
    │ completed_at     │
    │ conclusion       │
    │ findings         │ (JSONB)
    └────────┬─────────┘
             │
             │ 1:N
             │
     ┌───────┴────────┬──────────────┐
     │                │              │
     ▼                ▼              ▼
┌──────────┐  ┌────────────┐ ┌──────────────┐
│DUE_DLG   │  │INFORMATION │ │DOCUMENT_TYPES│
│DOCUMENTS │  │REQUESTS    │ │              │
│          │  │            │ │ id (PK)      │
│ id (PK)  │  │ id (PK)    │ │ type_code    │
│ dd_id    │  │ dd_id      │ │ type_name    │
│ doc_type │  │ request_to │ │ required_by  │
│ file_path│  │ subject    │ │ entity_type  │
│ uploaded │  │ status     │ │ mandatory    │
└──────────┘  └────────────┘ └──────────────┘

    ┌──────────────┐
    │DOCUMENT_     │
    │HISTORY       │
    │              │
    │ id (PK)      │
    │ document_id  │
    │ action       │ (UPLOADED, MODIFIED, DELETED, REVIEWED)
    │ action_by    │
    │ action_at    │
    │ previous_hash│
    │ new_hash     │
    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           MÓDULO DE PEP                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ PEP_INFORMATION  │
    │                  │
    │ id (PK)          │
    │ dossier_id (FK)  │────────> DOSSIERS
    │ is_pep           │
    │ pep_type         │ (NATIONAL, FOREIGN, INTERNATIONAL_ORG)
    │ pep_category     │ (DIRECT, FAMILY_MEMBER, CLOSE_ASSOCIATE)
    │ position         │
    │ organization     │
    │ country          │
    │ start_date       │
    │ end_date         │
    │ still_active     │
    │ pep_details      │ (JSONB)
    │ risk_impact      │ (JSONB - análisis de impacto)
    │ evaluation_status│ (PENDING, APPROVED, REJECTED)
    │ evaluated_by     │
    │ evaluated_at     │
    │ source_info      │ (JSONB - fuentes de información)
    │ created_at       │
    │ updated_at       │
    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE AUDITORÍA (INMUTABLE)                        │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │   AUDIT_LOGS     │ ◄─── SOLO APPEND, NUNCA UPDATE/DELETE
    │                  │
    │ id (PK)          │
    │ event_id (UUID)  │
    │ event_timestamp  │
    │ event_category   │ (SECURITY, DATA, DECISION, SYSTEM, ACCESS)
    │ event_level      │ (INFO, WARNING, ERROR, CRITICAL)
    │ action_type      │ (CREATE, READ, UPDATE, DELETE, LOGIN, etc)
    │ user_id          │────────> USERS
    │ session_id       │
    │ ip_address       │
    │ user_agent       │
    │ resource_type    │ (DOSSIER, EVALUATION, ALERT, etc)
    │ resource_id      │
    │ previous_state   │ (JSONB - estado anterior)
    │ new_state        │ (JSONB - estado nuevo)
    │ operation_result │ (SUCCESS, FAILURE)
    │ error_details    │
    │ metadata         │ (JSONB - datos adicionales)
    │ previous_hash    │ (SHA-256 del registro anterior)
    │ current_hash     │ (SHA-256 de este registro)
    │ chain_valid      │ (verificación de integridad)
    └──────────────────┘

    ┌──────────────────┐
    │SECURITY_AUDIT    │
    │EVENTS            │
    │                  │
    │ id (PK)          │
    │ event_type       │ (LOGIN, LOGOUT, FAILED_LOGIN, etc)
    │ user_id          │
    │ timestamp        │
    │ ip_address       │
    │ details          │ (JSONB)
    │ risk_score       │
    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     MÓDULO DE SESIONES Y PERMISOS                           │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │USER_SESSIONS │
    │              │
    │ id (PK)      │
    │ user_id      │────────> USERS
    │ session_token│
    │ created_at   │
    │ last_activity│
    │ expires_at   │
    │ ip_address   │
    │ user_agent   │
    │ active       │
    └──────────────┘

    ┌──────────────┐
    │   SESSIONS   │
    │              │
    │ id (PK)      │
    │ user_id      │────────> USERS
    │ token        │
    │ created_at   │
    │ expires_at   │
    │ ip_address   │
    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      TABLAS DE CATÁLOGOS Y CONFIGURACIÓN                    │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  COUNTRIES   │  │  ACTIVITIES  │  │DOSSIER_STATES│
    │              │  │              │  │              │
    │ id (PK)      │  │ id (PK)      │  │ state_code   │
    │ country_code │  │ activity_code│  │ state_name   │
    │ country_name │  │ activity_name│  │ description  │
    │ risk_level   │  │ risk_category│  │ allows_edit  │
    │ active       │  │ active       │  │ active       │
    └──────────────┘  └──────────────┘  └──────────────┘

    ┌──────────────┐  ┌──────────────┐
    │RISK_LEVELS   │  │ENTITY_TYPES  │
    │              │  │              │
    │ level_code   │  │ type_code    │
    │ level_name   │  │ type_name    │
    │ description  │  │ description  │
    │ threshold_min│  │ active       │
    │ threshold_max│  │              │
    └──────────────┘  └──────────────┘
```

---

## 3. DEFINICIÓN DETALLADA DE ENTIDADES

### 3.1 Módulo de Usuarios y Seguridad

#### Tabla: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_type VARCHAR(20),
    document_number VARCHAR(50),
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    user_type VARCHAR(50) NOT NULL,
    requires_password_change BOOLEAN DEFAULT FALSE,
    password_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING')),
    CONSTRAINT chk_user_type CHECK (user_type IN ('INTERNAL', 'INTERMEDIARY', 'EXTERNAL')),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_active ON users(active) WHERE active = TRUE;
CREATE INDEX idx_users_document ON users(document_type, document_number);

COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON COLUMN users.password_hash IS 'Hash BCrypt de la contraseña';
COMMENT ON COLUMN users.two_factor_secret IS 'Secreto TOTP para autenticación de dos factores';
```

#### Tabla: roles

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL,
    can_approve_dossiers BOOLEAN DEFAULT FALSE,
    can_modify_parameters BOOLEAN DEFAULT FALSE,
    can_view_audit_logs BOOLEAN DEFAULT FALSE,
    max_risk_level_access VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_role_code CHECK (role_code IN (
        'SUPER_ADMIN', 
        'COMPLIANCE_OFFICER', 
        'RISK_ANALYST', 
        'AUDITOR', 
        'INTERMEDIARY_SUPERVISOR',
        'OPERATOR',
        'READONLY_USER'
    ))
);

CREATE INDEX idx_roles_code ON roles(role_code);
CREATE INDEX idx_roles_active ON roles(active) WHERE active = TRUE;

COMMENT ON TABLE roles IS 'Definición de roles del sistema con sus permisos';
```

#### Tabla: user_roles

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_by VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(active) WHERE active = TRUE;

COMMENT ON TABLE user_roles IS 'Relación muchos a muchos entre usuarios y roles';
```

#### Tabla: role_incompatibilities

```sql
CREATE TABLE role_incompatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role1_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    role2_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_different_roles CHECK (role1_id != role2_id),
    CONSTRAINT chk_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT uq_role_incompatibility UNIQUE (role1_id, role2_id)
);

CREATE INDEX idx_role_incompat_role1 ON role_incompatibilities(role1_id);
CREATE INDEX idx_role_incompat_role2 ON role_incompatibilities(role2_id);

COMMENT ON TABLE role_incompatibilities IS 'Define roles que no pueden ser asignados simultáneamente (segregación de funciones)';
```

#### Tabla: permissions

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    resource_type VARCHAR(100) NOT NULL,
    resource_action VARCHAR(50) NOT NULL,
    can_execute BOOLEAN DEFAULT TRUE,
    conditions JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_resource_type CHECK (resource_type IN (
        'DOSSIER', 'EVALUATION', 'ALERT', 'PARAMETER', 
        'USER', 'REPORT', 'AUDIT', 'SCREENING', 'DUE_DILIGENCE'
    )),
    CONSTRAINT chk_resource_action CHECK (resource_action IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 
        'REJECT', 'EXPORT', 'IMPORT', 'CONFIGURE'
    )),
    CONSTRAINT uq_role_resource_action UNIQUE (role_id, resource_type, resource_action)
);

CREATE INDEX idx_permissions_role ON permissions(role_id);
CREATE INDEX idx_permissions_resource ON permissions(resource_type, resource_action);

COMMENT ON TABLE permissions IS 'Permisos granulares por rol y recurso';
COMMENT ON COLUMN permissions.conditions IS 'Condiciones adicionales en formato JSON (ej: {"max_risk_level": "HIGH"})';
```

### 3.2 Módulo de Expedientes (Core)

#### Tabla: dossiers

```sql
CREATE TABLE dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_number VARCHAR(50) UNIQUE NOT NULL,
    subject_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'INCOMPLETE',
    risk_level VARCHAR(20),
    completeness_percentage NUMERIC(5,2) DEFAULT 0.00,
    structured_data JSONB NOT NULL,
    last_evaluation_id UUID,
    last_evaluation_date TIMESTAMP,
    requires_enhanced_dd BOOLEAN DEFAULT FALSE,
    approval_required BOOLEAN DEFAULT TRUE,
    is_deletable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_subject_type CHECK (subject_type IN (
        'CLIENT', 'INTERMEDIARY', 'EMPLOYEE', 
        'PROVIDER', 'REINSURER', 'RETROCESSIONAIRE'
    )),
    CONSTRAINT chk_status CHECK (status IN (
        'INCOMPLETE', 'UNDER_REVIEW', 'REQUIRES_INFO', 
        'OBSERVED', 'APPROVED', 'REJECTED', 'SUSPENDED'
    )),
    CONSTRAINT chk_risk_level CHECK (risk_level IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_completeness CHECK (
        completeness_percentage >= 0 AND completeness_percentage <= 100
    )
);

CREATE INDEX idx_dossiers_number ON dossiers(dossier_number);
CREATE INDEX idx_dossiers_subject_type ON dossiers(subject_type);
CREATE INDEX idx_dossiers_status ON dossiers(status);
CREATE INDEX idx_dossiers_risk_level ON dossiers(risk_level);
CREATE INDEX idx_dossiers_created_by ON dossiers(created_by);
CREATE INDEX idx_dossiers_active ON dossiers(active) WHERE active = TRUE;
CREATE INDEX idx_dossiers_structured_data ON dossiers USING GIN(structured_data);

COMMENT ON TABLE dossiers IS 'Expedientes únicos - Eje central del sistema SIAR';
COMMENT ON COLUMN dossiers.structured_data IS 'Datos del formulario estructurado en formato JSONB';
COMMENT ON COLUMN dossiers.completeness_percentage IS 'Porcentaje de completitud calculado automáticamente';
COMMENT ON COLUMN dossiers.is_deletable IS 'FALSE una vez aprobado, impide eliminación';
```

#### Tabla: dossier_change_history

```sql
CREATE TABLE dossier_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    change_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    changed_by VARCHAR(100) NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100),
    previous_value TEXT,
    new_value TEXT,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    version_number INTEGER NOT NULL,
    
    CONSTRAINT chk_change_type CHECK (change_type IN (
        'CREATED', 'FIELD_MODIFIED', 'STATUS_CHANGE', 
        'DOCUMENT_ADDED', 'DOCUMENT_REMOVED', 
        'RISK_LEVEL_CHANGE', 'APPROVED', 'REJECTED'
    ))
);

CREATE INDEX idx_dossier_history_dossier ON dossier_change_history(dossier_id);
CREATE INDEX idx_dossier_history_timestamp ON dossier_change_history(change_timestamp);
CREATE INDEX idx_dossier_history_changed_by ON dossier_change_history(changed_by);
CREATE INDEX idx_dossier_history_type ON dossier_change_history(change_type);

COMMENT ON TABLE dossier_change_history IS 'Historial inmutable de cambios en expedientes';
COMMENT ON COLUMN dossier_change_history.version_number IS 'Número de versión del expediente en el momento del cambio';
```

#### Tabla: attached_documents

```sql
CREATE TABLE attached_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    document_type_id UUID NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
    uploaded_by VARCHAR(100) NOT NULL,
    expiration_date DATE,
    is_expired BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_doc_status CHECK (status IN (
        'VALID', 'EXPIRED', 'REJECTED', 'PENDING_VERIFICATION'
    ))
);

CREATE INDEX idx_attached_docs_dossier ON attached_documents(dossier_id);
CREATE INDEX idx_attached_docs_type ON attached_documents(document_type_id);
CREATE INDEX idx_attached_docs_hash ON attached_documents(file_hash);
CREATE INDEX idx_attached_docs_expiration ON attached_documents(expiration_date) WHERE is_expired = FALSE;

COMMENT ON TABLE attached_documents IS 'Documentos adjuntos a expedientes';
COMMENT ON COLUMN attached_documents.file_hash IS 'SHA-256 hash del archivo para verificación de integridad';
```

#### Tabla: review_comments

```sql
CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    comment_type VARCHAR(50) NOT NULL,
    comment_text TEXT NOT NULL,
    commented_by VARCHAR(100) NOT NULL,
    commented_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT FALSE,
    requires_response BOOLEAN DEFAULT FALSE,
    response_text TEXT,
    responded_by VARCHAR(100),
    responded_at TIMESTAMP,
    section_reference VARCHAR(100),
    field_reference VARCHAR(100),
    
    CONSTRAINT chk_comment_type CHECK (comment_type IN (
        'OBSERVATION', 'INFORMATION_REQUEST', 
        'APPROVAL_NOTE', 'REJECTION_REASON', 
        'INTERNAL_NOTE'
    ))
);

CREATE INDEX idx_review_comments_dossier ON review_comments(dossier_id);
CREATE INDEX idx_review_comments_type ON review_comments(comment_type);
CREATE INDEX idx_review_comments_date ON review_comments(commented_at);

COMMENT ON TABLE review_comments IS 'Comentarios del proceso de revisión de expedientes';
```

### 3.3 Módulo de Evaluación de Riesgo

#### Tabla: risk_evaluations

```sql
CREATE TABLE risk_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    evaluation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    total_score NUMERIC(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    evaluation_type VARCHAR(50) NOT NULL DEFAULT 'AUTOMATIC',
    evaluation_data JSONB NOT NULL,
    alerts_generated JSONB,
    requires_review BOOLEAN DEFAULT FALSE,
    evaluated_by VARCHAR(100) NOT NULL,
    reviewed_by VARCHAR(100),
    review_date TIMESTAMP,
    review_comments TEXT,
    configuration_version VARCHAR(50) NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_risk_level CHECK (risk_level IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_eval_type CHECK (evaluation_type IN (
        'AUTOMATIC', 'MANUAL', 'RECALCULATED', 'SCHEDULED'
    )),
    CONSTRAINT chk_score_range CHECK (total_score >= 0 AND total_score <= 100)
);

CREATE INDEX idx_risk_eval_dossier ON risk_evaluations(dossier_id);
CREATE INDEX idx_risk_eval_date ON risk_evaluations(evaluation_date);
CREATE INDEX idx_risk_eval_level ON risk_evaluations(risk_level);
CREATE INDEX idx_risk_eval_current ON risk_evaluations(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_risk_eval_data ON risk_evaluations USING GIN(evaluation_data);

COMMENT ON TABLE risk_evaluations IS 'Evaluaciones de riesgo de expedientes';
COMMENT ON COLUMN risk_evaluations.evaluation_data IS 'Datos detallados de la evaluación incluyendo criterios y puntajes';
COMMENT ON COLUMN risk_evaluations.is_current IS 'Marca la evaluación actual vigente del expediente';
```

#### Tabla: evaluation_history

```sql
CREATE TABLE evaluation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    evaluation_id UUID NOT NULL REFERENCES risk_evaluations(id) ON DELETE RESTRICT,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    triggered_by VARCHAR(100) NOT NULL,
    previous_risk_level VARCHAR(20),
    new_risk_level VARCHAR(20),
    change_reason TEXT,
    metadata JSONB,
    
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'EVALUATION_CREATED', 'EVALUATION_REVIEWED', 
        'RISK_LEVEL_CHANGED', 'EVALUATION_RECALCULATED',
        'PARAMETERS_CHANGED'
    ))
);

CREATE INDEX idx_eval_history_dossier ON evaluation_history(dossier_id);
CREATE INDEX idx_eval_history_evaluation ON evaluation_history(evaluation_id);
CREATE INDEX idx_eval_history_timestamp ON evaluation_history(event_timestamp);

COMMENT ON TABLE evaluation_history IS 'Historial de eventos de evaluaciones de riesgo';
```

#### Tabla: risk_factors

```sql
CREATE TABLE risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factor_code VARCHAR(50) UNIQUE NOT NULL,
    factor_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    default_weight NUMERIC(5,4) NOT NULL,
    applies_to_entity_types VARCHAR(50)[] NOT NULL,
    calculation_method VARCHAR(50) NOT NULL,
    calculation_formula TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1,
    
    CONSTRAINT chk_factor_category CHECK (category IN (
        'GEOGRAPHIC', 'ECONOMIC_ACTIVITY', 'PRODUCT_TYPE', 
        'TRANSACTION_PATTERN', 'RELATIONSHIP', 'PEP', 'SCREENING'
    )),
    CONSTRAINT chk_data_type CHECK (data_type IN (
        'CATALOG', 'NUMERIC', 'BOOLEAN', 'DATE', 'CALCULATED'
    )),
    CONSTRAINT chk_calc_method CHECK (calculation_method IN (
        'MAP_VALUE', 'THRESHOLD', 'FORMULA', 'LOOKUP'
    )),
    CONSTRAINT chk_weight_range CHECK (default_weight >= 0 AND default_weight <= 1)
);

CREATE INDEX idx_risk_factors_code ON risk_factors(factor_code);
CREATE INDEX idx_risk_factors_category ON risk_factors(category);
CREATE INDEX idx_risk_factors_entity_types ON risk_factors USING GIN(applies_to_entity_types);
CREATE INDEX idx_risk_factors_active ON risk_factors(active) WHERE active = TRUE;

COMMENT ON TABLE risk_factors IS 'Factores de riesgo configurables del motor de evaluación';
COMMENT ON COLUMN risk_factors.default_weight IS 'Ponderación del factor (0.0 a 1.0)';
```

#### Tabla: risk_factor_values

```sql
CREATE TABLE risk_factor_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factor_id UUID NOT NULL REFERENCES risk_factors(id) ON DELETE RESTRICT,
    entity_type VARCHAR(50) NOT NULL,
    value_key VARCHAR(100) NOT NULL,
    value_label VARCHAR(200) NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT chk_entity_type CHECK (entity_type IN (
        'CLIENT', 'INTERMEDIARY', 'EMPLOYEE', 
        'PROVIDER', 'REINSURER', 'RETROCESSIONAIRE'
    )),
    CONSTRAINT chk_risk_score_range CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT uq_factor_entity_value UNIQUE (factor_id, entity_type, value_key)
);

CREATE INDEX idx_risk_factor_values_factor ON risk_factor_values(factor_id);
CREATE INDEX idx_risk_factor_values_entity ON risk_factor_values(entity_type);
CREATE INDEX idx_risk_factor_values_active ON risk_factor_values(active) WHERE active = TRUE;

COMMENT ON TABLE risk_factor_values IS 'Valores posibles y sus puntajes para cada factor de riesgo';
```

#### Tabla: risk_configurations

```sql
CREATE TABLE risk_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    config_name VARCHAR(200) NOT NULL,
    config_data JSONB NOT NULL,
    thresholds JSONB NOT NULL,
    weights JSONB NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_until DATE,
    approved_by VARCHAR(100) NOT NULL,
    approved_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    version INTEGER DEFAULT 1,
    
    CONSTRAINT chk_config_entity_type CHECK (entity_type IN (
        'CLIENT', 'INTERMEDIARY', 'EMPLOYEE', 
        'PROVIDER', 'REINSURER', 'RETROCESSIONAIRE'
    )),
    CONSTRAINT chk_dates CHECK (effective_from <= COALESCE(effective_until, '9999-12-31'))
);

CREATE INDEX idx_risk_config_entity ON risk_configurations(entity_type);
CREATE INDEX idx_risk_config_active ON risk_configurations(active) WHERE active = TRUE;
CREATE INDEX idx_risk_config_effective ON risk_configurations(effective_from, effective_until);
CREATE INDEX idx_risk_config_data ON risk_configurations USING GIN(config_data);

COMMENT ON TABLE risk_configurations IS 'Configuraciones de evaluación de riesgo versionadas';
COMMENT ON COLUMN risk_configurations.config_data IS 'Configuración completa en JSON';
COMMENT ON COLUMN risk_configurations.thresholds IS 'Umbrales de clasificación de riesgo';
COMMENT ON COLUMN risk_configurations.weights IS 'Ponderaciones de los factores';
```

#### Tabla: risk_alerts

```sql
CREATE TABLE risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES risk_evaluations(id) ON DELETE RESTRICT,
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    triggered_by_factor VARCHAR(100),
    alert_message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_alert_type CHECK (alert_type IN (
        'HIGH_RISK_COUNTRY', 'HIGH_RISK_ACTIVITY', 
        'PEP_DETECTED', 'SCREENING_MATCH', 
        'UNUSUAL_PATTERN', 'THRESHOLD_EXCEEDED'
    )),
    CONSTRAINT chk_severity CHECK (severity IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    ))
);

CREATE INDEX idx_risk_alerts_evaluation ON risk_alerts(evaluation_id);
CREATE INDEX idx_risk_alerts_dossier ON risk_alerts(dossier_id);
CREATE INDEX idx_risk_alerts_type ON risk_alerts(alert_type);
CREATE INDEX idx_risk_alerts_severity ON risk_alerts(severity);

COMMENT ON TABLE risk_alerts IS 'Alertas generadas durante evaluación de riesgo';
```

### 3.4 Módulo de Alertas y Notificaciones

#### Tabla: alerts

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID REFERENCES dossiers(id) ON DELETE RESTRICT,
    alert_type_id UUID NOT NULL,
    alert_level VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority INTEGER DEFAULT 3,
    source_module VARCHAR(50) NOT NULL,
    source_event_id UUID,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    assigned_to VARCHAR(100),
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    resolution_comments TEXT,
    escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP,
    escalated_to VARCHAR(100),
    
    CONSTRAINT chk_alert_level CHECK (alert_level IN (
        'INFO', 'WARNING', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_alert_status CHECK (status IN (
        'PENDING', 'ASSIGNED', 'IN_PROGRESS', 
        'RESOLVED', 'DISMISSED', 'ESCALATED'
    )),
    CONSTRAINT chk_source_module CHECK (source_module IN (
        'RISK_EVALUATION', 'SCREENING', 'DUE_DILIGENCE', 
        'PEP', 'DOCUMENT_EXPIRATION', 'SYSTEM'
    )),
    CONSTRAINT chk_priority_range CHECK (priority BETWEEN 1 AND 5)
);

CREATE INDEX idx_alerts_dossier ON alerts(dossier_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type_id);
CREATE INDEX idx_alerts_level ON alerts(alert_level);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_assigned ON alerts(assigned_to);
CREATE INDEX idx_alerts_created ON alerts(created_at);
CREATE INDEX idx_alerts_priority ON alerts(priority);

COMMENT ON TABLE alerts IS 'Sistema centralizado de alertas y notificaciones';
COMMENT ON COLUMN alerts.priority IS '1 = Más alta, 5 = Más baja';
```

#### Tabla: alert_tracking

```sql
CREATE TABLE alert_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE RESTRICT,
    action_type VARCHAR(50) NOT NULL,
    action_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    action_by VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    comments TEXT,
    time_spent_minutes INTEGER,
    metadata JSONB,
    
    CONSTRAINT chk_action_type CHECK (action_type IN (
        'CREATED', 'VIEWED', 'ASSIGNED', 'STATUS_CHANGED',
        'COMMENTED', 'ESCALATED', 'RESOLVED', 'DISMISSED'
    ))
);

CREATE INDEX idx_alert_tracking_alert ON alert_tracking(alert_id);
CREATE INDEX idx_alert_tracking_type ON alert_tracking(action_type);
CREATE INDEX idx_alert_tracking_timestamp ON alert_tracking(action_timestamp);
CREATE INDEX idx_alert_tracking_by ON alert_tracking(action_by);

COMMENT ON TABLE alert_tracking IS 'Seguimiento detallado de acciones sobre alertas';
```

#### Tabla: alert_types

```sql
CREATE TABLE alert_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(200) NOT NULL,
    description TEXT,
    default_level VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    requires_immediate_action BOOLEAN DEFAULT FALSE,
    auto_assign_to_role VARCHAR(50),
    notification_template TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT chk_default_level CHECK (default_level IN (
        'INFO', 'WARNING', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_category CHECK (category IN (
        'RISK', 'COMPLIANCE', 'OPERATIONAL', 
        'SYSTEM', 'SECURITY'
    ))
);

CREATE INDEX idx_alert_types_code ON alert_types(type_code);
CREATE INDEX idx_alert_types_category ON alert_types(category);
CREATE INDEX idx_alert_types_active ON alert_types(active) WHERE active = TRUE;

COMMENT ON TABLE alert_types IS 'Catálogo de tipos de alertas configurables';
```

#### Tabla: notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    alert_id UUID REFERENCES alerts(id) ON DELETE RESTRICT,
    notification_type VARCHAR(20) NOT NULL,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_notif_type CHECK (notification_type IN (
        'EMAIL', 'IN_APP', 'SMS', 'PUSH'
    )),
    CONSTRAINT chk_delivery_status CHECK (delivery_status IN (
        'PENDING', 'SENT', 'DELIVERED', 'READ', 
        'FAILED', 'CANCELLED'
    ))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_alert ON notifications(alert_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_status ON notifications(delivery_status);
CREATE INDEX idx_notifications_sent ON notifications(sent_at);

COMMENT ON TABLE notifications IS 'Notificaciones enviadas a usuarios';
```

### 3.5 Módulo de Screening

#### Tabla: screenings

```sql
CREATE TABLE screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    screening_date TIMESTAMP NOT NULL DEFAULT NOW(),
    initiated_by VARCHAR(100) NOT NULL,
    screening_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    result VARCHAR(50),
    match_count INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    review_decision VARCHAR(50),
    review_comments TEXT,
    metadata JSONB,
    
    CONSTRAINT chk_screening_type CHECK (screening_type IN (
        'INITIAL', 'PERIODIC', 'EVENT_DRIVEN', 'MANUAL'
    )),
    CONSTRAINT chk_screening_status CHECK (status IN (
        'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    )),
    CONSTRAINT chk_screening_result CHECK (result IN (
        'CLEAR', 'MATCH_FOUND', 'REVIEW_REQUIRED', 'FALSE_POSITIVE'
    )),
    CONSTRAINT chk_review_decision CHECK (review_decision IN (
        'APPROVE', 'REJECT', 'REQUEST_INFO', 'ESCALATE'
    ))
);

CREATE INDEX idx_screenings_dossier ON screenings(dossier_id);
CREATE INDEX idx_screenings_date ON screenings(screening_date);
CREATE INDEX idx_screenings_status ON screenings(status);
CREATE INDEX idx_screenings_result ON screenings(result);

COMMENT ON TABLE screenings IS 'Procesos de screening contra listas restrictivas';
```

#### Tabla: screening_results

```sql
CREATE TABLE screening_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE RESTRICT,
    list_type VARCHAR(50) NOT NULL,
    list_name VARCHAR(200) NOT NULL,
    match_data JSONB NOT NULL,
    match_score NUMERIC(5,2) NOT NULL,
    match_quality VARCHAR(20) NOT NULL,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    is_false_positive BOOLEAN DEFAULT FALSE,
    false_positive_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_list_type CHECK (list_type IN (
        'OFAC', 'UN', 'EU', 'PEP', 'SANCTIONS', 
        'ADVERSE_MEDIA', 'CUSTOM'
    )),
    CONSTRAINT chk_match_quality CHECK (match_quality IN (
        'EXACT', 'HIGH', 'MEDIUM', 'LOW'
    )),
    CONSTRAINT chk_match_score_range CHECK (match_score >= 0 AND match_score <= 100)
);

CREATE INDEX idx_screening_results_screening ON screening_results(screening_id);
CREATE INDEX idx_screening_results_list_type ON screening_results(list_type);
CREATE INDEX idx_screening_results_score ON screening_results(match_score);
CREATE INDEX idx_screening_results_reviewed ON screening_results(reviewed);

COMMENT ON TABLE screening_results IS 'Resultados detallados de procesos de screening';
```

#### Tabla: screening_decisions

```sql
CREATE TABLE screening_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE RESTRICT,
    decision VARCHAR(50) NOT NULL,
    decided_by VARCHAR(100) NOT NULL,
    decided_at TIMESTAMP NOT NULL DEFAULT NOW(),
    justification TEXT NOT NULL,
    requires_enhanced_dd BOOLEAN DEFAULT FALSE,
    risk_level_impact VARCHAR(20),
    additional_controls JSONB,
    approved_by_supervisor VARCHAR(100),
    approval_date TIMESTAMP,
    
    CONSTRAINT chk_decision CHECK (decision IN (
        'APPROVE', 'REJECT', 'REQUEST_INFO', 
        'REQUIRE_ENHANCED_DD', 'ESCALATE'
    )),
    CONSTRAINT chk_risk_impact CHECK (risk_level_impact IN (
        'NO_CHANGE', 'INCREASE_TO_MEDIUM', 
        'INCREASE_TO_HIGH', 'INCREASE_TO_CRITICAL'
    ))
);

CREATE INDEX idx_screening_decisions_screening ON screening_decisions(screening_id);
CREATE INDEX idx_screening_decisions_decision ON screening_decisions(decision);
CREATE INDEX idx_screening_decisions_by ON screening_decisions(decided_by);

COMMENT ON TABLE screening_decisions IS 'Decisiones tomadas sobre resultados de screening';
```

#### Tabla: watchlists

```sql
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_name VARCHAR(200) UNIQUE NOT NULL,
    list_type VARCHAR(50) NOT NULL,
    source VARCHAR(200) NOT NULL,
    description TEXT,
    last_updated TIMESTAMP NOT NULL,
    update_frequency VARCHAR(50),
    total_entries INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT chk_wl_type CHECK (list_type IN (
        'OFAC', 'UN', 'EU', 'PEP', 'SANCTIONS', 
        'ADVERSE_MEDIA', 'CUSTOM'
    )),
    CONSTRAINT chk_update_freq CHECK (update_frequency IN (
        'DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND'
    ))
);

CREATE INDEX idx_watchlists_type ON watchlists(list_type);
CREATE INDEX idx_watchlists_active ON watchlists(active) WHERE active = TRUE;

COMMENT ON TABLE watchlists IS 'Listas restrictivas para screening';
```

#### Tabla: watchlist_entries

```sql
CREATE TABLE watchlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE RESTRICT,
    entry_type VARCHAR(50) NOT NULL,
    full_name VARCHAR(500) NOT NULL,
    entry_data JSONB NOT NULL,
    risk_category VARCHAR(20) NOT NULL,
    country VARCHAR(3),
    date_of_birth DATE,
    identifiers JSONB,
    aliases JSONB,
    notes TEXT,
    added_date DATE NOT NULL,
    removed_date DATE,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_entry_type CHECK (entry_type IN (
        'INDIVIDUAL', 'ENTITY', 'VESSEL', 'AIRCRAFT'
    )),
    CONSTRAINT chk_risk_category CHECK (risk_category IN (
        'HIGH', 'MEDIUM', 'LOW'
    ))
);

CREATE INDEX idx_wl_entries_watchlist ON watchlist_entries(watchlist_id);
CREATE INDEX idx_wl_entries_name ON watchlist_entries(full_name);
CREATE INDEX idx_wl_entries_type ON watchlist_entries(entry_type);
CREATE INDEX idx_wl_entries_active ON watchlist_entries(active) WHERE active = TRUE;
CREATE INDEX idx_wl_entries_data ON watchlist_entries USING GIN(entry_data);

COMMENT ON TABLE watchlist_entries IS 'Entradas individuales de listas restrictivas';
```

#### Tabla: matches

```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE RESTRICT,
    entry_id UUID NOT NULL REFERENCES watchlist_entries(id) ON DELETE RESTRICT,
    match_score NUMERIC(5,2) NOT NULL,
    match_data JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    is_false_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_match_status CHECK (status IN (
        'PENDING', 'CONFIRMED', 'FALSE_POSITIVE', 'UNDER_REVIEW'
    )),
    CONSTRAINT chk_match_score_range CHECK (match_score >= 0 AND match_score <= 100)
);

CREATE INDEX idx_matches_screening ON matches(screening_id);
CREATE INDEX idx_matches_entry ON matches(entry_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(match_score);

COMMENT ON TABLE matches IS 'Coincidencias encontradas en procesos de screening';
```

### 3.6 Módulo de Debida Diligencia

#### Tabla: due_diligences

```sql
CREATE TABLE due_diligences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    dd_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    initiated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    initiated_by VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP,
    completed_by VARCHAR(100),
    conclusion VARCHAR(50),
    conclusion_details TEXT,
    findings JSONB,
    risk_factors_identified JSONB,
    recommended_controls JSONB,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_dd_type CHECK (dd_type IN (
        'STANDARD', 'ENHANCED', 'SIMPLIFIED', 'ONGOING'
    )),
    CONSTRAINT chk_dd_status CHECK (status IN (
        'PENDING', 'IN_PROGRESS', 'AWAITING_INFO', 
        'COMPLETED', 'CANCELLED'
    )),
    CONSTRAINT chk_conclusion CHECK (conclusion IN (
        'APPROVED', 'REJECTED', 'CONDITIONAL_APPROVAL', 
        'REQUIRES_ENHANCED_DD', 'REQUIRES_SENIOR_APPROVAL'
    ))
);

CREATE INDEX idx_dd_dossier ON due_diligences(dossier_id);
CREATE INDEX idx_dd_type ON due_diligences(dd_type);
CREATE INDEX idx_dd_status ON due_diligences(status);
CREATE INDEX idx_dd_initiated ON due_diligences(initiated_at);

COMMENT ON TABLE due_diligences IS 'Procesos de debida diligencia';
```

#### Tabla: due_diligence_documents

```sql
CREATE TABLE due_diligence_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dd_id UUID NOT NULL REFERENCES due_diligences(id) ON DELETE RESTRICT,
    document_type_id UUID NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    uploaded_by VARCHAR(100) NOT NULL,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    metadata JSONB,
    
    CONSTRAINT uq_dd_doc_hash UNIQUE (file_hash)
);

CREATE INDEX idx_dd_docs_dd ON due_diligence_documents(dd_id);
CREATE INDEX idx_dd_docs_type ON due_diligence_documents(document_type_id);
CREATE INDEX idx_dd_docs_reviewed ON due_diligence_documents(reviewed);

COMMENT ON TABLE due_diligence_documents IS 'Documentos asociados a procesos de debida diligencia';
```

#### Tabla: information_requests

```sql
CREATE TABLE information_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dd_id UUID NOT NULL REFERENCES due_diligences(id) ON DELETE RESTRICT,
    request_to VARCHAR(100) NOT NULL,
    request_subject VARCHAR(500) NOT NULL,
    request_details TEXT NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deadline_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    response_text TEXT,
    response_received_at TIMESTAMP,
    response_received_by VARCHAR(100),
    escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP,
    
    CONSTRAINT chk_ir_status CHECK (status IN (
        'PENDING', 'SENT', 'RESPONDED', 
        'OVERDUE', 'CANCELLED'
    ))
);

CREATE INDEX idx_info_requests_dd ON information_requests(dd_id);
CREATE INDEX idx_info_requests_status ON information_requests(status);
CREATE INDEX idx_info_requests_deadline ON information_requests(deadline_date);

COMMENT ON TABLE information_requests IS 'Solicitudes de información durante debida diligencia';
```

#### Tabla: document_types

```sql
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(200) NOT NULL,
    description TEXT,
    required_by_entity_type VARCHAR(50)[] NOT NULL,
    mandatory BOOLEAN DEFAULT FALSE,
    requires_periodic_update BOOLEAN DEFAULT FALSE,
    update_frequency_days INTEGER,
    expiration_warning_days INTEGER DEFAULT 30,
    document_category VARCHAR(50) NOT NULL,
    validation_rules JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT chk_doc_category CHECK (document_category IN (
        'IDENTIFICATION', 'ADDRESS_PROOF', 'FINANCIAL', 
        'LEGAL', 'OPERATIONAL', 'OTHER'
    ))
);

CREATE INDEX idx_doc_types_code ON document_types(type_code);
CREATE INDEX idx_doc_types_category ON document_types(document_category);
CREATE INDEX idx_doc_types_entity ON document_types USING GIN(required_by_entity_type);
CREATE INDEX idx_doc_types_active ON document_types(active) WHERE active = TRUE;

COMMENT ON TABLE document_types IS 'Catálogo de tipos de documentos requeridos';
```

#### Tabla: document_history

```sql
CREATE TABLE document_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    document_table VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    action_by VARCHAR(100) NOT NULL,
    action_at TIMESTAMP NOT NULL DEFAULT NOW(),
    previous_hash VARCHAR(64),
    new_hash VARCHAR(64),
    previous_data JSONB,
    new_data JSONB,
    reason TEXT,
    
    CONSTRAINT chk_doc_action CHECK (action IN (
        'UPLOADED', 'MODIFIED', 'DELETED', 
        'REVIEWED', 'APPROVED', 'REJECTED'
    )),
    CONSTRAINT chk_doc_table CHECK (document_table IN (
        'ATTACHED_DOCUMENTS', 'DUE_DILIGENCE_DOCUMENTS'
    ))
);

CREATE INDEX idx_doc_history_document ON document_history(document_id);
CREATE INDEX idx_doc_history_action ON document_history(action);
CREATE INDEX idx_doc_history_timestamp ON document_history(action_at);

COMMENT ON TABLE document_history IS 'Historial inmutable de acciones sobre documentos';
```

### 3.7 Módulo de PEP

#### Tabla: pep_information

```sql
CREATE TABLE pep_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE RESTRICT,
    is_pep BOOLEAN NOT NULL DEFAULT FALSE,
    pep_type VARCHAR(50),
    pep_category VARCHAR(50),
    position_title VARCHAR(500),
    organization_name VARCHAR(500),
    country VARCHAR(3),
    start_date DATE,
    end_date DATE,
    still_active BOOLEAN DEFAULT FALSE,
    pep_details JSONB,
    risk_impact JSONB,
    evaluation_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    evaluated_by VARCHAR(100),
    evaluated_at TIMESTAMP,
    evaluation_comments TEXT,
    source_information JSONB NOT NULL,
    verification_date DATE,
    verified_by VARCHAR(100),
    requires_enhanced_dd BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    
    CONSTRAINT chk_pep_type CHECK (pep_type IN (
        'NATIONAL', 'FOREIGN', 'INTERNATIONAL_ORG'
    )),
    CONSTRAINT chk_pep_category CHECK (pep_category IN (
        'DIRECT', 'FAMILY_MEMBER', 'CLOSE_ASSOCIATE'
    )),
    CONSTRAINT chk_pep_eval_status CHECK (evaluation_status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_ADDITIONAL_INFO'
    )),
    CONSTRAINT chk_dates CHECK (start_date <= COALESCE(end_date, CURRENT_DATE))
);

CREATE INDEX idx_pep_info_dossier ON pep_information(dossier_id);
CREATE INDEX idx_pep_info_is_pep ON pep_information(is_pep) WHERE is_pep = TRUE;
CREATE INDEX idx_pep_info_type ON pep_information(pep_type);
CREATE INDEX idx_pep_info_category ON pep_information(pep_category);
CREATE INDEX idx_pep_info_country ON pep_information(country);
CREATE INDEX idx_pep_info_details ON pep_information USING GIN(pep_details);

COMMENT ON TABLE pep_information IS 'Información de Personas Expuestas Políticamente (PEP)';
COMMENT ON COLUMN pep_information.pep_details IS 'Detalles extendidos del PEP en formato JSON';
COMMENT ON COLUMN pep_information.risk_impact IS 'Análisis de impacto en el riesgo del expediente';
COMMENT ON COLUMN pep_information.source_information IS 'Fuentes que confirman el estatus PEP';
```

### 3.8 Módulo de Auditoría (Inmutable)

#### Tabla: audit_logs

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    event_category VARCHAR(50) NOT NULL,
    event_level VARCHAR(20) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    resource_description VARCHAR(500),
    previous_state JSONB,
    new_state JSONB,
    operation_result VARCHAR(20) NOT NULL,
    error_code VARCHAR(50),
    error_details TEXT,
    metadata JSONB,
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64) NOT NULL,
    chain_valid BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_event_category CHECK (event_category IN (
        'SECURITY', 'DATA', 'DECISION', 'SYSTEM', 
        'ACCESS', 'CONFIGURATION', 'INTEGRATION'
    )),
    CONSTRAINT chk_event_level CHECK (event_level IN (
        'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    )),
    CONSTRAINT chk_action_type CHECK (action_type IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 
        'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 
        'APPROVE', 'REJECT', 'EXPORT', 'IMPORT'
    )),
    CONSTRAINT chk_operation_result CHECK (operation_result IN (
        'SUCCESS', 'FAILURE', 'PARTIAL'
    ))
);

-- Particionamiento por fecha para mejor performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(event_timestamp);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_category ON audit_logs(event_category);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_result ON audit_logs(operation_result);
CREATE INDEX idx_audit_logs_hash ON audit_logs(current_hash);

COMMENT ON TABLE audit_logs IS 'Registro inmutable de auditoría con cadena de hash criptográfica';
COMMENT ON COLUMN audit_logs.previous_hash IS 'SHA-256 hash del registro anterior para cadena de integridad';
COMMENT ON COLUMN audit_logs.current_hash IS 'SHA-256 hash de este registro';
COMMENT ON COLUMN audit_logs.chain_valid IS 'Validación de integridad de la cadena';

-- Trigger para impedir UPDATE y DELETE
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Los registros de auditoría son inmutables y no pueden modificarse o eliminarse';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_prevent_audit_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER tr_prevent_audit_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

#### Tabla: security_audit_events

```sql
CREATE TABLE security_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    username VARCHAR(255),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    session_id UUID,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    risk_score INTEGER,
    geo_location JSONB,
    device_fingerprint VARCHAR(255),
    details JSONB,
    
    CONSTRAINT chk_sec_event_type CHECK (event_type IN (
        'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE', 
        'PASSWORD_RESET', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED',
        'ROLE_CHANGE', 'PERMISSION_CHANGE', 'TWO_FACTOR_ENABLED',
        'TWO_FACTOR_DISABLED', 'SUSPICIOUS_ACTIVITY'
    )),
    CONSTRAINT chk_risk_score CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_sec_audit_type ON security_audit_events(event_type);
CREATE INDEX idx_sec_audit_user ON security_audit_events(user_id);
CREATE INDEX idx_sec_audit_timestamp ON security_audit_events(timestamp);
CREATE INDEX idx_sec_audit_ip ON security_audit_events(ip_address);
CREATE INDEX idx_sec_audit_success ON security_audit_events(success);

COMMENT ON TABLE security_audit_events IS 'Auditoría específica de eventos de seguridad';
```

### 3.9 Módulo de Sesiones

#### Tabla: user_sessions

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    terminated_at TIMESTAMP,
    termination_reason VARCHAR(100),
    
    CONSTRAINT chk_termination_reason CHECK (termination_reason IN (
        'USER_LOGOUT', 'EXPIRED', 'ADMIN_TERMINATED', 
        'SECURITY_VIOLATION', 'CONCURRENT_SESSION'
    ))
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios';
```

#### Tabla: sessions

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    token VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_accessed_at TIMESTAMP,
    
    CONSTRAINT chk_session_dates CHECK (created_at < expires_at)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

COMMENT ON TABLE sessions IS 'Gestión de tokens de sesión JWT';
```

### 3.10 Tablas de Catálogos y Configuración

#### Tabla: countries

```sql
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(3) UNIQUE NOT NULL,
    country_name VARCHAR(200) NOT NULL,
    region VARCHAR(100),
    risk_level VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL,
    is_high_risk BOOLEAN DEFAULT FALSE,
    is_sanctioned BOOLEAN DEFAULT FALSE,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    
    CONSTRAINT chk_country_risk CHECK (risk_level IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_country_score CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_countries_code ON countries(country_code);
CREATE INDEX idx_countries_risk ON countries(risk_level);
CREATE INDEX idx_countries_active ON countries(active) WHERE active = TRUE;

COMMENT ON TABLE countries IS 'Catálogo de países con clasificación de riesgo';
```

#### Tabla: economic_activities

```sql
CREATE TABLE economic_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_code VARCHAR(50) UNIQUE NOT NULL,
    activity_name VARCHAR(500) NOT NULL,
    description TEXT,
    industry_sector VARCHAR(200),
    risk_category VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL,
    requires_enhanced_dd BOOLEAN DEFAULT FALSE,
    prohibited BOOLEAN DEFAULT FALSE,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(100),
    
    CONSTRAINT chk_activity_risk CHECK (risk_category IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    CONSTRAINT chk_activity_score CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_activities_code ON economic_activities(activity_code);
CREATE INDEX idx_activities_risk ON economic_activities(risk_category);
CREATE INDEX idx_activities_sector ON economic_activities(industry_sector);
CREATE INDEX idx_activities_active ON economic_activities(active) WHERE active = TRUE;

COMMENT ON TABLE economic_activities IS 'Catálogo de actividades económicas con clasificación de riesgo';
```

#### Tabla: dossier_states

```sql
CREATE TABLE dossier_states (
    state_code VARCHAR(50) PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL,
    description TEXT,
    allows_modification BOOLEAN DEFAULT TRUE,
    requires_approval_to_change BOOLEAN DEFAULT FALSE,
    is_final_state BOOLEAN DEFAULT FALSE,
    display_order INTEGER NOT NULL,
    color_code VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_dossier_states_order ON dossier_states(display_order);

COMMENT ON TABLE dossier_states IS 'Catálogo de estados posibles de expedientes';
```

#### Tabla: risk_levels

```sql
CREATE TABLE risk_levels (
    level_code VARCHAR(20) PRIMARY KEY,
    level_name VARCHAR(100) NOT NULL,
    description TEXT,
    threshold_min NUMERIC(5,2) NOT NULL,
    threshold_max NUMERIC(5,2) NOT NULL,
    color_code VARCHAR(20),
    requires_enhanced_dd BOOLEAN DEFAULT FALSE,
    requires_senior_approval BOOLEAN DEFAULT FALSE,
    review_frequency_days INTEGER,
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_thresholds CHECK (threshold_min <= threshold_max),
    CONSTRAINT chk_threshold_range CHECK (
        threshold_min >= 0 AND threshold_max <= 100
    )
);

CREATE INDEX idx_risk_levels_thresholds ON risk_levels(threshold_min, threshold_max);

COMMENT ON TABLE risk_levels IS 'Definición de niveles de riesgo y sus umbrales';
```

#### Tabla: entity_types

```sql
CREATE TABLE entity_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(200) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE entity_types IS 'Catálogo de tipos de entidades del sistema';
```

---

## 4. RELACIONES Y CARDINALIDADES

### 4.1 Relaciones Principales

```
users (1) ──────< (N) user_roles (N) ──────> (1) roles
users (1) ──────< (N) user_sessions
users (1) ──────< (N) dossiers [created_by]
users (1) ──────< (N) audit_logs

dossiers (1) ──────< (N) dossier_change_history
dossiers (1) ──────< (N) attached_documents
dossiers (1) ──────< (N) review_comments
dossiers (1) ──────< (N) risk_evaluations
dossiers (1) ──────< (N) alerts
dossiers (1) ──────< (N) screenings
dossiers (1) ──────< (N) due_diligences
dossiers (1) ──────< (N) pep_information

risk_evaluations (1) ──────< (N) evaluation_history
risk_evaluations (1) ──────< (N) risk_alerts

alerts (1) ──────< (N) alert_tracking
alerts (1) ──────< (N) notifications

screenings (1) ──────< (N) screening_results
screenings (1) ──────< (N) screening_decisions
screenings (1) ──────< (N) matches

due_diligences (1) ──────< (N) due_diligence_documents
due_diligences (1) ──────< (N) information_requests

watchlists (1) ──────< (N) watchlist_entries
watchlist_entries (1) ──────< (N) matches

risk_factors (1) ──────< (N) risk_factor_values
```

### 4.2 Integridad Referencial

- Todas las relaciones utilizan `ON DELETE RESTRICT` para prevenir eliminaciones accidentales
- No se permiten operaciones DELETE en tablas críticas (implementado mediante triggers)
- Las eliminaciones lógicas se realizan mediante el campo `active = FALSE`

---

## 5. ÍNDICES Y OPTIMIZACIÓN

### 5.1 Estrategia de Indexación

```sql
-- Índices en campos de búsqueda frecuente
-- Índices en Foreign Keys
-- Índices GIN para campos JSONB
-- Índices parciales para registros activos
-- Índices compuestos para queries complejas
```

### 5.2 Particionamiento

```sql
-- Tabla audit_logs debe particionarse por fecha
CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Script de mantenimiento para crear particiones futuras
```

---

## 6. VISTAS MATERIALIZADAS

### Vista: active_dossiers_summary

```sql
CREATE MATERIALIZED VIEW active_dossiers_summary AS
SELECT 
    d.subject_type,
    d.status,
    d.risk_level,
    COUNT(*) as total_dossiers,
    AVG(d.completeness_percentage) as avg_completeness,
    COUNT(DISTINCT re.id) as total_evaluations,
    COUNT(DISTINCT a.id) as total_alerts
FROM dossiers d
LEFT JOIN risk_evaluations re ON d.id = re.dossier_id
LEFT JOIN alerts a ON d.id = a.dossier_id
WHERE d.active = TRUE
GROUP BY d.subject_type, d.status, d.risk_level;

CREATE UNIQUE INDEX ON active_dossiers_summary (subject_type, status, risk_level);
```

### Vista: high_risk_dossiers

```sql
CREATE MATERIALIZED VIEW high_risk_dossiers AS
SELECT 
    d.id,
    d.dossier_number,
    d.subject_type,
    d.risk_level,
    d.last_evaluation_date,
    d.structured_data->>'fullName' as subject_name,
    COUNT(DISTINCT a.id) as open_alerts,
    COUNT(DISTINCT s.id) as screenings_pending
FROM dossiers d
LEFT JOIN alerts a ON d.id = a.dossier_id AND a.status IN ('PENDING', 'IN_PROGRESS')
LEFT JOIN screenings s ON d.id = s.dossier_id AND s.status != 'COMPLETED'
WHERE d.risk_level IN ('HIGH', 'CRITICAL')
  AND d.active = TRUE
GROUP BY d.id, d.dossier_number, d.subject_type, d.risk_level, d.last_evaluation_date, d.structured_data;

CREATE UNIQUE INDEX ON high_risk_dossiers (id);
```

---

## 7. FUNCIONES Y PROCEDIMIENTOS ALMACENADOS

### Función: calculate_dossier_completeness

```sql
CREATE OR REPLACE FUNCTION calculate_dossier_completeness(
    p_dossier_id UUID
) RETURNS NUMERIC AS $$
DECLARE
    v_completeness NUMERIC;
    v_total_fields INTEGER;
    v_completed_fields INTEGER;
    v_required_docs INTEGER;
    v_uploaded_docs INTEGER;
BEGIN
    -- Lógica de cálculo de completitud
    -- Basado en campos obligatorios y documentos requeridos
    
    RETURN v_completeness;
END;
$$ LANGUAGE plpgsql;
```

### Función: generate_audit_hash

```sql
CREATE OR REPLACE FUNCTION generate_audit_hash(
    p_event_data JSONB,
    p_previous_hash VARCHAR
) RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(
        digest(
            COALESCE(p_previous_hash, '') || p_event_data::text,
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;
```

### Trigger: auto_update_modified_timestamp

```sql
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas críticas
CREATE TRIGGER tr_dossiers_update
BEFORE UPDATE ON dossiers
FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp();
```

### Trigger: audit_dossier_changes

```sql
CREATE OR REPLACE FUNCTION audit_dossier_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO dossier_change_history (
            dossier_id, change_type, changed_by, 
            new_state, version_number
        ) VALUES (
            NEW.id, 'CREATED', NEW.created_by, 
            row_to_json(NEW), NEW.version
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO dossier_change_history (
            dossier_id, change_type, changed_by,
            previous_state, new_state, version_number
        ) VALUES (
            NEW.id, 'FIELD_MODIFIED', NEW.updated_by,
            row_to_json(OLD), row_to_json(NEW), NEW.version
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_audit_dossiers
AFTER INSERT OR UPDATE ON dossiers
FOR EACH ROW EXECUTE FUNCTION audit_dossier_changes();
```

---

## 8. SCRIPTS DE INICIALIZACIÓN

### Script: insert_default_roles

```sql
INSERT INTO roles (role_code, role_name, description, priority, can_approve_dossiers, can_modify_parameters, can_view_audit_logs) VALUES
('SUPER_ADMIN', 'Super Administrador', 'Acceso total al sistema', 1, TRUE, TRUE, TRUE),
('COMPLIANCE_OFFICER', 'Oficial de Cumplimiento', 'Gestión de cumplimiento y aprobaciones', 2, TRUE, TRUE, TRUE),
('RISK_ANALYST', 'Analista de Riesgo', 'Evaluación y análisis de riesgos', 3, FALSE, FALSE, FALSE),
('AUDITOR', 'Auditor', 'Consulta de auditoría y reportes', 4, FALSE, FALSE, TRUE),
('INTERMEDIARY_SUPERVISOR', 'Supervisor de Intermediarios', 'Gestión de intermediarios', 5, FALSE, FALSE, FALSE),
('OPERATOR', 'Operador', 'Operaciones diarias', 6, FALSE, FALSE, FALSE),
('READONLY_USER', 'Usuario de Solo Lectura', 'Consulta únicamente', 7, FALSE, FALSE, FALSE);
```

### Script: insert_default_catalog_data

```sql
-- Insertar estados de expedientes
INSERT INTO dossier_states (state_code, state_name, allows_modification, display_order) VALUES
('INCOMPLETE', 'Incompleto', TRUE, 1),
('UNDER_REVIEW', 'En Revisión', FALSE, 2),
('REQUIRES_INFO', 'Requiere Información', TRUE, 3),
('OBSERVED', 'Observado', TRUE, 4),
('APPROVED', 'Aprobado', FALSE, 5),
('REJECTED', 'Rechazado', FALSE, 6),
('SUSPENDED', 'Suspendido', FALSE, 7);

-- Insertar niveles de riesgo
INSERT INTO risk_levels (level_code, level_name, threshold_min, threshold_max, requires_enhanced_dd) VALUES
('LOW', 'Bajo', 0, 30, FALSE),
('MEDIUM', 'Medio', 31, 60, FALSE),
('HIGH', 'Alto', 61, 85, TRUE),
('CRITICAL', 'Crítico', 86, 100, TRUE);

-- Insertar tipos de entidad
INSERT INTO entity_types (type_code, type_name, display_order) VALUES
('CLIENT', 'Cliente', 1),
('INTERMEDIARY', 'Intermediario', 2),
('EMPLOYEE', 'Empleado', 3),
('PROVIDER', 'Proveedor', 4),
('REINSURER', 'Reasegurador', 5),
('RETROCESSIONAIRE', 'Retrocesionario', 6);
```

---

## 9. CONSIDERACIONES DE SEGURIDAD

### 9.1 Row Level Security (RLS)

```sql
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY dossiers_select_policy ON dossiers
FOR SELECT
USING (
    current_setting('app.user_role') IN ('SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR')
    OR created_by = current_setting('app.current_user')
);

CREATE POLICY dossiers_update_policy ON dossiers
FOR UPDATE
USING (
    current_setting('app.user_role') IN ('SUPER_ADMIN', 'COMPLIANCE_OFFICER')
    AND (status != 'APPROVED' OR current_setting('app.user_role') = 'SUPER_ADMIN')
);
```

### 9.2 Encriptación de Datos Sensibles

```sql
-- Extensión para encriptación
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para encriptar datos sensibles
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(
    p_data TEXT,
    p_key TEXT
) RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(p_data, p_key);
END;
$$ LANGUAGE plpgsql;
```

---

## 10. MANTENIMIENTO Y BACKUP

### 10.1 Scripts de Mantenimiento

```sql
-- Vacuuming regular
VACUUM ANALYZE dossiers;
VACUUM ANALYZE risk_evaluations;
VACUUM ANALYZE audit_logs;

-- Reindex periódico
REINDEX TABLE dossiers;
REINDEX TABLE audit_logs;

-- Refresh de vistas materializadas
REFRESH MATERIALIZED VIEW CONCURRENTLY active_dossiers_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY high_risk_dossiers;
```

### 10.2 Estrategia de Backup

```bash
# Backup completo diario
pg_dump -U postgres -Fc siar_db > backup_siar_$(date +%Y%m%d).dump

# Backup incremental de tabla de auditoría
pg_dump -U postgres -Fc -t audit_logs siar_db > backup_audit_$(date +%Y%m%d).dump

# Retención: 30 días backups diarios, 12 meses backups mensuales
```

---

## 11. MÉTRICAS Y MONITOREO

### 11.1 Queries de Monitoreo

```sql
-- Total de expedientes por estado
SELECT status, COUNT(*) as total
FROM dossiers
WHERE active = TRUE
GROUP BY status;

-- Alertas pendientes por nivel
SELECT alert_level, COUNT(*) as total
FROM alerts
WHERE status IN ('PENDING', 'ASSIGNED')
GROUP BY alert_level
ORDER BY 
    CASE alert_level 
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'WARNING' THEN 3
        ELSE 4
    END;

-- Tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 12. DIAGRAMA FÍSICO SIMPLIFICADO

```
┌─────────────────────────────────────────────────────┐
│                   PostgreSQL 15+                     │
│                                                      │
│  Schema: public                                      │
│  ├── Tables (60+)                                    │
│  ├── Indexes (150+)                                  │
│  ├── Materialized Views (5)                          │
│  ├── Functions (20+)                                 │
│  ├── Triggers (30+)                                  │
│  └── Policies (RLS)                                  │
│                                                      │
│  Storage:                                            │
│  ├── TABLESPACE pg_default                          │
│  ├── Partitioned Tables (audit_logs)                │
│  └── TOAST Storage (JSONB columns)                  │
│                                                      │
│  Extensions:                                         │
│  ├── uuid-ossp (UUID generation)                    │
│  ├── pgcrypto (Encryption)                          │
│  └── pg_trgm (Text search)                          │
└─────────────────────────────────────────────────────┘
```

---

## 13. CONCLUSIONES

Este modelo de base de datos relacional para el SIAR cumple con:

1. ✅ **No eliminación física**: Triggers impiden DELETE en tablas críticas
2. ✅ **Trazabilidad total**: Tablas de historial para cada entidad principal
3. ✅ **Auditoría inmutable**: Tabla audit_logs con cadena criptográfica
4. ✅ **Campos de auditoría**: created_at, created_by, updated_at, updated_by
5. ✅ **Estados y versionado**: Control de ciclo de vida completo
6. ✅ **Expediente como eje**: Todas las entidades relacionadas con dossiers
7. ✅ **Preparado para inspección**: Estructura transparente y auditable

El modelo está diseñado para:
- Soportar inspecciones regulatorias permanentes
- Garantizar integridad y trazabilidad de datos
- Permitir consultas eficientes mediante índices estratégicos
- Escalar horizontalmente mediante particionamiento
- Mantener seguridad mediante RLS y encriptación

---

**Próximos Pasos:**
1. Ejecutar scripts de creación de tablas
2. Insertar datos de catálogos iniciales
3. Crear usuarios y roles en PostgreSQL
4. Configurar backups automáticos
5. Implementar monitoreo de performance
