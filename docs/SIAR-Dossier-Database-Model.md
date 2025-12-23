# Modelo de Base de Datos: Expediente Único (Dossier)
## Sistema Integrado Anti-Fraude y Riesgo (SIAR)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento define el modelo de base de datos relacional para el **Expediente Único** del sistema SIAR, diseñado para gestionar la información completa de los sujetos regulados bajo supervisión de SUDEASEG.

### 1.2 Alcance
El modelo cubre:
- Expedientes de diferentes tipos de sujetos
- Versionamiento y trazabilidad completa
- Historial inmutable de cambios
- Estados del expediente y flujo de aprobación
- Integración con otros módulos (Riesgo, Debida Diligencia, PEP)

### 1.3 Principios de Diseño
- **No eliminación física**: Todos los registros se marcan como eliminados mediante flags
- **Trazabilidad total**: Cada cambio se registra con usuario, timestamp y contexto
- **Versionamiento**: Control de concurrencia optimista mediante `@Version`
- **Auditoría integrada**: Campos de auditoría en todas las tablas
- **JSONB para flexibilidad**: Estructuras complejas en PostgreSQL JSONB

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXPEDIENTE ÚNICO                            │
└─────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │      DOSSIERS       │
                    ├─────────────────────┤
                    │ dossier_uuid (PK)   │
                    │ dossier_id (UK)     │
                    │ subject_type        │
                    │ status              │
                    │ completeness_%      │
                    │ document_type       │
                    │ document_number     │
                    │ identification      │ JSONB
                    │ economic_info       │ JSONB
                    │ insurer_relation    │ JSONB
                    │ geographic_loc      │ JSONB
                    │ internal_controls   │ JSONB
                    │ created_at          │
                    │ created_by          │
                    │ last_modified_at    │
                    │ last_modified_by    │
                    │ approved_at         │
                    │ approved_by         │
                    │ version             │
                    │ is_deleted          │
                    │ is_deletable        │
                    │ requires_approval   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │ DOSSIER_CHANGE_  │ │   DOSSIER_   │ │ DOSSIER_REVIEW_  │
    │    HISTORY       │ │  DOCUMENTS   │ │    COMMENTS      │
    ├──────────────────┤ ├──────────────┤ ├──────────────────┤
    │ change_uuid (PK) │ │ doc_uuid(PK) │ │ comment_uuid(PK) │
    │ change_id (UK)   │ │ dossier_uuid │ │ dossier_uuid (FK)│
    │ dossier_uuid(FK) │ │ doc_type     │ │ reviewer_id      │
    │ timestamp        │ │ file_name    │ │ comment          │
    │ change_type      │ │ file_path    │ │ created_at       │
    │ performed_by     │ │ status       │ └──────────────────┘
    │ performed_role   │ │ uploaded_at  │
    │ ip_address       │ │ uploaded_by  │
    │ user_agent       │ │ approved_at  │
    │ description      │ │ approved_by  │
    │ affected_sect[]  │ │ version      │
    │ affected_flds[]  │ └──────────────┘
    │ previous_vals    │ JSONB
    │ new_values       │ JSONB
    │ requires_appr    │
    │ approval_status  │
    │ approved_by      │
    │ approved_at      │
    └──────────────────┘

          │
          │ FK to Risk Module
          ▼
    ┌──────────────────────┐
    │ DOSSIER_RISK_        │
    │   ASSESSMENT         │
    ├──────────────────────┤
    │ assessment_uuid (PK) │
    │ dossier_uuid (FK,UK) │
    │ current_eval_id (FK) │
    │ risk_level           │
    │ assessed_at          │
    │ assessed_by          │
    └──────────────────────┘
```

---

## 3. DEFINICIÓN DE TABLAS

### 3.1 Tabla: `dossiers`

**Descripción**: Tabla principal que almacena los expedientes únicos de todos los sujetos regulados.

```sql
CREATE TABLE dossiers (
    -- Identificadores
    dossier_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id VARCHAR(50) NOT NULL UNIQUE,  -- DOSS-2024-00001
    
    -- Clasificación
    subject_type VARCHAR(50) NOT NULL CHECK (subject_type IN (
        'CLIENT', 'INTERMEDIARY', 'EMPLOYEE', 'PROVIDER', 'REINSURER', 'RETROCESSIONAIRE'
    )),
    
    status VARCHAR(50) NOT NULL DEFAULT 'INCOMPLETE' CHECK (status IN (
        'INCOMPLETE', 'UNDER_REVIEW', 'REQUIRES_INFO', 'OBSERVED', 'APPROVED'
    )),
    
    completeness_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (
        completeness_percentage >= 0 AND completeness_percentage <= 100
    ),
    
    -- Datos clave para búsquedas rápidas (desnormalizados)
    document_type VARCHAR(20),
    document_number VARCHAR(50),
    
    -- Secciones de la planilla en formato JSONB
    identification JSONB,  -- Sección 1: Identificación
    economic_information JSONB,  -- Sección 2: Información Económica
    insurer_relationship JSONB,  -- Sección 3: Relación con Aseguradora
    geographic_location JSONB,  -- Sección 4: Ubicación Geográfica
    internal_controls JSONB,  -- Sección 5: Controles Internos
    
    -- Auditoría: Creación
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    
    -- Auditoría: Última Modificación
    last_modified_at TIMESTAMP,
    last_modified_by VARCHAR(100),
    
    -- Auditoría: Aprobación
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    
    -- Control de versión y estado
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_deletable BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval_for_changes BOOLEAN NOT NULL DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_dossier_status ON dossiers(status) WHERE NOT is_deleted;
CREATE INDEX idx_dossier_subject_type ON dossiers(subject_type) WHERE NOT is_deleted;
CREATE INDEX idx_dossier_created_by ON dossiers(created_by);
CREATE INDEX idx_dossier_document_number ON dossiers(document_number) WHERE document_number IS NOT NULL;
CREATE INDEX idx_dossier_created_at ON dossiers(created_at);
CREATE INDEX idx_dossier_approved ON dossiers(approved_at) WHERE approved_at IS NOT NULL;

-- Índices GIN para búsquedas JSONB
CREATE INDEX idx_dossier_identification_gin ON dossiers USING GIN (identification);
CREATE INDEX idx_dossier_economic_gin ON dossiers USING GIN (economic_information);

-- Comentarios
COMMENT ON TABLE dossiers IS 'Expediente único de todos los sujetos regulados del sistema';
COMMENT ON COLUMN dossiers.dossier_uuid IS 'Identificador único inmutable del expediente';
COMMENT ON COLUMN dossiers.dossier_id IS 'Identificador legible del expediente (DOSS-YYYY-NNNNN)';
COMMENT ON COLUMN dossiers.completeness_percentage IS 'Porcentaje de completitud basado en campos obligatorios';
COMMENT ON COLUMN dossiers.is_deletable IS 'Indica si el expediente puede ser marcado como eliminado';
COMMENT ON COLUMN dossiers.requires_approval_for_changes IS 'Expedientes aprobados requieren proceso especial para cambios';
```

#### 3.1.1 Estructura JSONB: `identification`

```json
{
  "documentType": "DNI | PASSPORT | RUC | RIF | TAX_ID",
  "documentNumber": "12345678",
  "firstName": "Juan",
  "lastName": "Pérez",
  "fullLegalName": "Juan Carlos Pérez García",
  "dateOfBirth": "1985-05-15",
  "nationality": "PA",
  "countryOfResidence": "PA",
  "residenceAddress": {
    "street": "Calle 50",
    "city": "Panamá",
    "state": "Panamá",
    "postalCode": "00000",
    "country": "PA"
  },
  "contactInfo": {
    "phone": "+507-1234-5678",
    "email": "juan.perez@example.com",
    "alternatePhone": "+507-8765-4321"
  },
  "companyInfo": {  // Solo para entidades jurídicas
    "legalName": "ACME Corp S.A.",
    "tradeName": "ACME",
    "incorporationDate": "2010-01-01",
    "incorporationCountry": "PA",
    "taxId": "1234567890",
    "corporateStructure": "SA",
    "numberOfEmployees": 50
  }
}
```

#### 3.1.2 Estructura JSONB: `economic_information`

```json
{
  "monthlyIncome": 5000.00,
  "sourceOfIncome": "Salario",
  "occupation": "Ingeniero",
  "employerName": "Tech Company S.A.",
  "employmentYears": 5,
  "estimatedNetWorth": 100000.00,
  "bankAccounts": [
    {
      "bankName": "Banco Nacional",
      "accountType": "CHECKING",
      "accountNumber": "****1234",
      "country": "PA"
    }
  ],
  "expectedTransactionVolume": {
    "frequency": "MONTHLY",
    "averageAmount": 2000.00,
    "currency": "USD"
  }
}
```

#### 3.1.3 Estructura JSONB: `insurer_relationship`

```json
{
  "relationshipType": "POLICY_HOLDER | INTERMEDIARY | REINSURER",
  "relationshipStartDate": "2020-01-15",
  "policyNumbers": ["POL-2024-001", "POL-2024-002"],
  "totalPremiumVolume": 25000.00,
  "paymentHistory": "EXCELLENT | GOOD | REGULAR | POOR",
  "claimsHistory": [
    {
      "claimNumber": "CLM-2023-100",
      "claimDate": "2023-06-15",
      "claimAmount": 5000.00,
      "claimStatus": "PAID"
    }
  ]
}
```

### 3.2 Tabla: `dossier_change_history`

**Descripción**: Historial inmutable de todos los cambios realizados a un expediente.

```sql
CREATE TABLE dossier_change_history (
    -- Identificadores
    change_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_id VARCHAR(50) NOT NULL UNIQUE,  -- CHG-2024-00001
    
    -- Relación con expediente
    dossier_uuid UUID NOT NULL REFERENCES dossiers(dossier_uuid),
    
    -- Timestamp del cambio (inmutable)
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Tipo de cambio
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'CREATION', 'UPDATE', 'STATUS_CHANGE', 'DOCUMENT_UPLOAD',
        'DOCUMENT_REMOVAL', 'APPROVAL', 'REJECTION', 'DELETION'
    )),
    
    -- Usuario que realizó el cambio
    performed_by VARCHAR(100) NOT NULL,
    performed_by_role VARCHAR(50) NOT NULL,
    
    -- Contexto de la acción
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    -- Descripción del cambio
    description TEXT,
    
    -- Detalles del cambio
    affected_sections TEXT[],  -- ['identification', 'economic_information']
    affected_fields TEXT[],    -- ['identification.firstName', 'identification.email']
    
    previous_values JSONB,  -- Valores anteriores
    new_values JSONB,       -- Valores nuevos
    
    -- Aprobación (si aplica)
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    approval_status VARCHAR(50) CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    approval_notes TEXT
);

-- Índices
CREATE INDEX idx_change_dossier_id ON dossier_change_history(dossier_uuid);
CREATE INDEX idx_change_timestamp ON dossier_change_history(timestamp DESC);
CREATE INDEX idx_change_performed_by ON dossier_change_history(performed_by);
CREATE INDEX idx_change_type ON dossier_change_history(change_type);
CREATE INDEX idx_change_approval_status ON dossier_change_history(approval_status) 
    WHERE approval_status = 'PENDING';

-- Índice GIN para búsquedas en arrays
CREATE INDEX idx_change_affected_sections ON dossier_change_history USING GIN (affected_sections);

-- Comentarios
COMMENT ON TABLE dossier_change_history IS 'Historial inmutable de cambios en expedientes';
COMMENT ON COLUMN dossier_change_history.change_uuid IS 'Identificador único del registro de cambio';
COMMENT ON COLUMN dossier_change_history.timestamp IS 'Momento exacto del cambio (inmutable)';
```

### 3.3 Tabla: `dossier_documents`

**Descripción**: Documentos adjuntos al expediente (contratos, identificaciones, etc.).

```sql
CREATE TABLE dossier_documents (
    -- Identificadores
    document_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(50) NOT NULL UNIQUE,  -- DOC-2024-00001
    
    -- Relación con expediente
    dossier_uuid UUID NOT NULL REFERENCES dossiers(dossier_uuid),
    
    -- Información del documento
    document_type VARCHAR(100) NOT NULL,  -- 'ID_CARD', 'CONTRACT', 'FINANCIAL_STATEMENT'
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,  -- SHA-256
    storage_path VARCHAR(500) NOT NULL,
    
    -- Estado del documento
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'
    )),
    
    -- Versionamiento
    version INTEGER NOT NULL DEFAULT 1,
    is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
    replaces_document_uuid UUID REFERENCES dossier_documents(document_uuid),
    
    -- Fechas importantes
    expiration_date DATE,
    
    -- Auditoría: Subida
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100) NOT NULL,
    
    -- Auditoría: Aprobación/Rechazo
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(100),
    review_notes TEXT,
    
    -- Auditoría: Aprobación
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    
    -- Metadata adicional
    metadata JSONB,
    
    -- Control
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_doc_dossier ON dossier_documents(dossier_uuid) WHERE NOT is_deleted;
CREATE INDEX idx_doc_type ON dossier_documents(document_type);
CREATE INDEX idx_doc_status ON dossier_documents(status);
CREATE INDEX idx_doc_expiration ON dossier_documents(expiration_date) 
    WHERE expiration_date IS NOT NULL AND NOT is_deleted;
CREATE INDEX idx_doc_current_version ON dossier_documents(is_current_version) 
    WHERE is_current_version = TRUE;
CREATE INDEX idx_doc_uploaded_by ON dossier_documents(uploaded_by);
CREATE UNIQUE INDEX idx_doc_hash_unique ON dossier_documents(file_hash, dossier_uuid) 
    WHERE NOT is_deleted;

-- Comentarios
COMMENT ON TABLE dossier_documents IS 'Documentos digitales adjuntos a expedientes';
COMMENT ON COLUMN dossier_documents.file_hash IS 'Hash SHA-256 para integridad y detección de duplicados';
COMMENT ON COLUMN dossier_documents.is_current_version IS 'Indica si es la versión vigente del documento';
```

### 3.4 Tabla: `dossier_review_comments`

**Descripción**: Comentarios y observaciones de revisores sobre el expediente.

```sql
CREATE TABLE dossier_review_comments (
    -- Identificadores
    comment_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id VARCHAR(50) NOT NULL UNIQUE,  -- CMT-2024-00001
    
    -- Relación con expediente
    dossier_uuid UUID NOT NULL REFERENCES dossiers(dossier_uuid),
    
    -- Información del comentario
    section VARCHAR(100),  -- Sección específica del expediente
    field_path VARCHAR(200),  -- Path al campo: 'identification.firstName'
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(50) CHECK (comment_type IN (
        'OBSERVATION', 'CORRECTION_REQUEST', 'APPROVAL', 'REJECTION', 'QUESTION'
    )),
    
    -- Prioridad
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Estado del comentario
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'
    )),
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    created_by_role VARCHAR(50) NOT NULL,
    
    -- Resolución
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,
    
    -- Respuesta del propietario del expediente
    response TEXT,
    responded_at TIMESTAMP,
    responded_by VARCHAR(100),
    
    -- Control
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_comment_dossier ON dossier_review_comments(dossier_uuid) WHERE NOT is_deleted;
CREATE INDEX idx_comment_status ON dossier_review_comments(status) WHERE status != 'RESOLVED';
CREATE INDEX idx_comment_priority ON dossier_review_comments(priority) 
    WHERE priority IN ('HIGH', 'CRITICAL') AND status = 'OPEN';
CREATE INDEX idx_comment_created_by ON dossier_review_comments(created_by);
CREATE INDEX idx_comment_section ON dossier_review_comments(section);

-- Comentarios
COMMENT ON TABLE dossier_review_comments IS 'Comentarios y observaciones de revisores sobre expedientes';
COMMENT ON COLUMN dossier_review_comments.field_path IS 'Path JSONB al campo específico comentado';
```

### 3.5 Tabla: `dossier_risk_assessment`

**Descripción**: Vínculo entre expediente y evaluación de riesgo actual.

```sql
CREATE TABLE dossier_risk_assessment (
    -- Identificadores
    assessment_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación 1:1 con expediente
    dossier_uuid UUID NOT NULL UNIQUE REFERENCES dossiers(dossier_uuid),
    
    -- Referencia a la evaluación de riesgo actual
    current_evaluation_id VARCHAR(50) NOT NULL,  -- FK a risk_evaluations.evaluation_id
    
    -- Resultado actual
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    
    -- Auditoría
    assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assessed_by VARCHAR(100) NOT NULL,
    
    last_updated_at TIMESTAMP,
    
    -- Metadata adicional
    metadata JSONB
);

-- Índices
CREATE INDEX idx_risk_assessment_level ON dossier_risk_assessment(risk_level);
CREATE INDEX idx_risk_assessment_eval_id ON dossier_risk_assessment(current_evaluation_id);
CREATE INDEX idx_risk_assessment_date ON dossier_risk_assessment(assessed_at DESC);

-- Comentarios
COMMENT ON TABLE dossier_risk_assessment IS 'Evaluación de riesgo vigente de cada expediente';
COMMENT ON COLUMN dossier_risk_assessment.current_evaluation_id IS 'ID de la evaluación de riesgo activa';
```

---

## 4. TRIGGERS Y FUNCIONES

### 4.1 Trigger: Prevenir Eliminación Física

```sql
-- Función que previene DELETE físico
CREATE OR REPLACE FUNCTION prevent_physical_deletion_dossiers()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Physical deletion not allowed on table %. Use soft delete instead.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- Trigger en dossiers
CREATE TRIGGER trigger_prevent_delete_dossiers
BEFORE DELETE ON dossiers
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_dossiers();

-- Trigger en dossier_change_history
CREATE TRIGGER trigger_prevent_delete_history
BEFORE DELETE ON dossier_change_history
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_dossiers();
```

### 4.2 Trigger: Registro Automático de Cambios

```sql
-- Función para registrar cambios automáticamente
CREATE OR REPLACE FUNCTION record_dossier_change()
RETURNS TRIGGER AS $$
DECLARE
    v_change_id VARCHAR(50);
    v_change_type VARCHAR(50);
    v_affected_sections TEXT[];
    v_previous_vals JSONB;
    v_new_vals JSONB;
BEGIN
    -- Generar ID de cambio
    v_change_id := 'CHG-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                   LPAD(NEXTVAL('change_id_seq')::TEXT, 5, '0');
    
    -- Determinar tipo de cambio
    IF (TG_OP = 'INSERT') THEN
        v_change_type := 'CREATION';
        v_new_vals := to_jsonb(NEW);
        v_previous_vals := NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Detectar qué cambió
        v_change_type := CASE
            WHEN OLD.status != NEW.status THEN 'STATUS_CHANGE'
            ELSE 'UPDATE'
        END;
        
        -- Capturar valores anteriores y nuevos
        v_previous_vals := to_jsonb(OLD);
        v_new_vals := to_jsonb(NEW);
        
        -- Detectar secciones afectadas
        v_affected_sections := ARRAY[]::TEXT[];
        IF OLD.identification != NEW.identification THEN
            v_affected_sections := v_affected_sections || 'identification';
        END IF;
        IF OLD.economic_information != NEW.economic_information THEN
            v_affected_sections := v_affected_sections || 'economic_information';
        END IF;
        -- ... continuar para otras secciones
    END IF;
    
    -- Insertar en historial
    INSERT INTO dossier_change_history (
        change_uuid, change_id, dossier_uuid, timestamp,
        change_type, performed_by, performed_by_role,
        affected_sections, previous_values, new_values
    ) VALUES (
        gen_random_uuid(), v_change_id, NEW.dossier_uuid, CURRENT_TIMESTAMP,
        v_change_type, CURRENT_USER, 'SYSTEM',
        v_affected_sections, v_previous_vals, v_new_vals
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para IDs de cambio
CREATE SEQUENCE IF NOT EXISTS change_id_seq START 1;

-- Trigger
CREATE TRIGGER trigger_record_dossier_change
AFTER INSERT OR UPDATE ON dossiers
FOR EACH ROW EXECUTE FUNCTION record_dossier_change();
```

### 4.3 Trigger: Actualizar Porcentaje de Completitud

```sql
-- Función para calcular completitud
CREATE OR REPLACE FUNCTION calculate_dossier_completeness()
RETURNS TRIGGER AS $$
DECLARE
    v_total_fields INTEGER;
    v_completed_fields INTEGER;
    v_percentage DECIMAL(5,2);
BEGIN
    -- Lógica simplificada: contar campos no nulos en JSONB
    v_total_fields := 20;  -- Número de campos obligatorios según tipo de sujeto
    v_completed_fields := 0;
    
    -- Contar campos completados en identification
    IF NEW.identification IS NOT NULL THEN
        v_completed_fields := v_completed_fields + 
            (SELECT COUNT(*) FROM jsonb_object_keys(NEW.identification));
    END IF;
    
    -- Contar campos completados en economic_information
    IF NEW.economic_information IS NOT NULL THEN
        v_completed_fields := v_completed_fields + 
            (SELECT COUNT(*) FROM jsonb_object_keys(NEW.economic_information));
    END IF;
    
    -- Calcular porcentaje
    v_percentage := (v_completed_fields::DECIMAL / v_total_fields::DECIMAL) * 100;
    
    -- Limitar entre 0 y 100
    v_percentage := GREATEST(0, LEAST(100, v_percentage));
    
    -- Actualizar
    NEW.completeness_percentage := v_percentage;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_calculate_completeness
BEFORE INSERT OR UPDATE ON dossiers
FOR EACH ROW EXECUTE FUNCTION calculate_dossier_completeness();
```

### 4.4 Trigger: Validar Cambios en Expedientes Aprobados

```sql
-- Función para validar cambios en expedientes aprobados
CREATE OR REPLACE FUNCTION validate_approved_dossier_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el expediente está aprobado y requiere aprobación para cambios
    IF OLD.status = 'APPROVED' AND OLD.requires_approval_for_changes = TRUE THEN
        -- Solo permitir cambios de ciertos campos o con aprobación previa
        IF NEW.status != OLD.status OR 
           NEW.identification != OLD.identification OR
           NEW.economic_information != OLD.economic_information THEN
            RAISE EXCEPTION 'Changes to approved dossier require special approval process. Dossier: %', OLD.dossier_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_validate_approved_changes
BEFORE UPDATE ON dossiers
FOR EACH ROW
WHEN (OLD.status = 'APPROVED')
EXECUTE FUNCTION validate_approved_dossier_changes();
```

---

## 5. VISTAS

### 5.1 Vista: Expedientes Activos con Resumen

```sql
CREATE OR REPLACE VIEW v_active_dossiers_summary AS
SELECT 
    d.dossier_uuid,
    d.dossier_id,
    d.subject_type,
    d.status,
    d.completeness_percentage,
    d.document_type,
    d.document_number,
    -- Extraer nombre de la sección de identificación
    COALESCE(
        d.identification->>'fullLegalName',
        CONCAT(d.identification->>'firstName', ' ', d.identification->>'lastName')
    ) AS subject_name,
    d.identification->>'email' AS email,
    d.identification->>'phone' AS phone,
    d.created_at,
    d.created_by,
    d.last_modified_at,
    d.approved_at,
    -- Información de riesgo
    dra.risk_level,
    dra.assessed_at AS risk_assessed_at,
    -- Contadores
    (SELECT COUNT(*) FROM dossier_documents dd 
     WHERE dd.dossier_uuid = d.dossier_uuid AND NOT dd.is_deleted) AS document_count,
    (SELECT COUNT(*) FROM dossier_review_comments drc 
     WHERE drc.dossier_uuid = d.dossier_uuid AND drc.status = 'OPEN') AS open_comments_count
FROM dossiers d
LEFT JOIN dossier_risk_assessment dra ON d.dossier_uuid = dra.dossier_uuid
WHERE NOT d.is_deleted;

COMMENT ON VIEW v_active_dossiers_summary IS 'Vista resumen de expedientes activos con información clave';
```

### 5.2 Vista: Expedientes Pendientes de Revisión

```sql
CREATE OR REPLACE VIEW v_dossiers_pending_review AS
SELECT 
    d.dossier_uuid,
    d.dossier_id,
    d.subject_type,
    d.completeness_percentage,
    COALESCE(
        d.identification->>'fullLegalName',
        CONCAT(d.identification->>'firstName', ' ', d.identification->>'lastName')
    ) AS subject_name,
    d.created_at,
    d.created_by,
    d.last_modified_at,
    -- Días en este estado
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - COALESCE(d.last_modified_at, d.created_at)) AS days_in_status,
    -- Comentarios pendientes
    (SELECT COUNT(*) FROM dossier_review_comments drc 
     WHERE drc.dossier_uuid = d.dossier_uuid 
     AND drc.status IN ('OPEN', 'IN_PROGRESS')) AS pending_comments
FROM dossiers d
WHERE d.status IN ('UNDER_REVIEW', 'REQUIRES_INFO', 'OBSERVED')
AND NOT d.is_deleted
ORDER BY d.created_at ASC;

COMMENT ON VIEW v_dossiers_pending_review IS 'Expedientes que requieren atención de revisores';
```

### 5.3 Vista: Historial Completo de un Expediente

```sql
CREATE OR REPLACE VIEW v_dossier_full_history AS
SELECT 
    dch.change_uuid,
    dch.change_id,
    dch.dossier_uuid,
    d.dossier_id,
    dch.timestamp,
    dch.change_type,
    dch.performed_by,
    dch.performed_by_role,
    dch.description,
    dch.affected_sections,
    dch.affected_fields,
    dch.requires_approval,
    dch.approval_status,
    dch.approved_by,
    dch.approved_at,
    -- Extraer campos clave de previous_values y new_values
    dch.previous_values->>'status' AS previous_status,
    dch.new_values->>'status' AS new_status
FROM dossier_change_history dch
JOIN dossiers d ON dch.dossier_uuid = d.dossier_uuid
ORDER BY dch.timestamp DESC;

COMMENT ON VIEW v_dossier_full_history IS 'Historial completo de cambios de todos los expedientes';
```

---

## 6. FUNCIONES DE UTILIDAD

### 6.1 Función: Obtener Campos Obligatorios Faltantes

```sql
CREATE OR REPLACE FUNCTION get_missing_mandatory_fields(
    p_dossier_uuid UUID
) RETURNS TABLE(section VARCHAR, field_name VARCHAR) AS $$
BEGIN
    -- Implementación simplificada
    -- En producción, consultar tabla de configuración de campos obligatorios
    -- según el tipo de sujeto del expediente
    
    RETURN QUERY
    SELECT 
        'identification'::VARCHAR AS section,
        'firstName'::VARCHAR AS field_name
    WHERE NOT EXISTS (
        SELECT 1 FROM dossiers d 
        WHERE d.dossier_uuid = p_dossier_uuid 
        AND d.identification ? 'firstName'
    )
    UNION ALL
    SELECT 
        'identification'::VARCHAR,
        'documentNumber'::VARCHAR
    WHERE NOT EXISTS (
        SELECT 1 FROM dossiers d 
        WHERE d.dossier_uuid = p_dossier_uuid 
        AND d.identification ? 'documentNumber'
    );
    -- ... continuar para todos los campos obligatorios
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Función: Aprobar Expediente

```sql
CREATE OR REPLACE FUNCTION approve_dossier(
    p_dossier_uuid UUID,
    p_approved_by VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    v_completeness DECIMAL(5,2);
    v_missing_docs INTEGER;
BEGIN
    -- Validar que el expediente existe
    IF NOT EXISTS (SELECT 1 FROM dossiers WHERE dossier_uuid = p_dossier_uuid) THEN
        RAISE EXCEPTION 'Dossier not found: %', p_dossier_uuid;
    END IF;
    
    -- Validar completitud
    SELECT completeness_percentage INTO v_completeness
    FROM dossiers WHERE dossier_uuid = p_dossier_uuid;
    
    IF v_completeness < 100.0 THEN
        RAISE EXCEPTION 'Dossier is not complete (%%: %%). Cannot approve.', v_completeness, p_dossier_uuid;
    END IF;
    
    -- Validar documentos obligatorios
    SELECT COUNT(*) INTO v_missing_docs
    FROM get_missing_mandatory_documents(p_dossier_uuid);
    
    IF v_missing_docs > 0 THEN
        RAISE EXCEPTION 'Dossier has % missing mandatory documents. Cannot approve.', v_missing_docs;
    END IF;
    
    -- Aprobar
    UPDATE dossiers SET
        status = 'APPROVED',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = p_approved_by,
        is_deletable = FALSE,
        requires_approval_for_changes = TRUE
    WHERE dossier_uuid = p_dossier_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. CONSIDERACIONES DE SEGURIDAD

### 7.1 Row Level Security (RLS)

```sql
-- Habilitar RLS en dossiers
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven expedientes que crearon o están asignados
CREATE POLICY dossier_access_policy ON dossiers
FOR SELECT
USING (
    created_by = CURRENT_USER 
    OR 
    EXISTS (
        SELECT 1 FROM user_dossier_assignments uda
        WHERE uda.dossier_uuid = dossiers.dossier_uuid
        AND uda.user_id = CURRENT_USER
    )
    OR
    CURRENT_USER IN ('COMPLIANCE_OFFICER', 'ADMINISTRATOR')
);

-- Política: Solo ciertos roles pueden modificar
CREATE POLICY dossier_update_policy ON dossiers
FOR UPDATE
USING (
    (created_by = CURRENT_USER AND status IN ('INCOMPLETE', 'REQUIRES_INFO'))
    OR
    CURRENT_USER IN ('COMPLIANCE_OFFICER', 'COMPLIANCE_ANALYST')
);

-- Política: Solo administradores y oficiales pueden eliminar (soft delete)
CREATE POLICY dossier_delete_policy ON dossiers
FOR UPDATE
USING (
    CURRENT_USER IN ('COMPLIANCE_OFFICER', 'ADMINISTRATOR')
    AND is_deletable = TRUE
);
```

### 7.2 Auditoría de Acceso

```sql
-- Tabla de auditoría de acceso
CREATE TABLE dossier_access_log (
    access_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_uuid UUID NOT NULL REFERENCES dossiers(dossier_uuid),
    accessed_by VARCHAR(100) NOT NULL,
    accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('VIEW', 'EDIT', 'EXPORT')),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500)
);

CREATE INDEX idx_access_log_dossier ON dossier_access_log(dossier_uuid);
CREATE INDEX idx_access_log_user ON dossier_access_log(accessed_by);
CREATE INDEX idx_access_log_timestamp ON dossier_access_log(accessed_at DESC);
```

---

## 8. CONSULTAS COMUNES

### 8.1 Buscar Expediente por Documento

```sql
SELECT * FROM v_active_dossiers_summary
WHERE document_number = '12345678';
```

### 8.2 Expedientes Incompletos por Usuario

```sql
SELECT 
    dossier_id,
    subject_type,
    completeness_percentage,
    created_at,
    days_in_status
FROM v_dossiers_pending_review
WHERE created_by = 'user@example.com'
AND status = 'INCOMPLETE'
ORDER BY created_at ASC;
```

### 8.3 Historial de un Expediente

```sql
SELECT 
    timestamp,
    change_type,
    performed_by,
    description,
    affected_sections
FROM v_dossier_full_history
WHERE dossier_id = 'DOSS-2024-00001'
ORDER BY timestamp DESC
LIMIT 50;
```

### 8.4 Expedientes por Nivel de Riesgo

```sql
SELECT 
    risk_level,
    COUNT(*) AS count,
    AVG(completeness_percentage) AS avg_completeness
FROM v_active_dossiers_summary
GROUP BY risk_level
ORDER BY 
    CASE risk_level
        WHEN 'HIGH' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 3
    END;
```

### 8.5 Documentos Próximos a Vencer

```sql
SELECT 
    d.dossier_id,
    d.subject_name,
    dd.document_type,
    dd.expiration_date,
    dd.expiration_date - CURRENT_DATE AS days_until_expiration
FROM v_active_dossiers_summary d
JOIN dossier_documents dd ON d.dossier_uuid = dd.dossier_uuid
WHERE dd.expiration_date IS NOT NULL
AND dd.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
AND dd.is_current_version = TRUE
AND NOT dd.is_deleted
ORDER BY dd.expiration_date ASC;
```

---

## 9. ESTRATEGIA DE RESPALDO Y ARCHIVADO

### 9.1 Particionamiento por Año

```sql
-- Particionar dossier_change_history por año para mejor performance
CREATE TABLE dossier_change_history_2024 PARTITION OF dossier_change_history
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE dossier_change_history_2025 PARTITION OF dossier_change_history
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 9.2 Archivado de Expedientes Antiguos

```sql
-- Vista de expedientes archivables (más de 7 años sin actividad)
CREATE OR REPLACE VIEW v_dossiers_archivable AS
SELECT 
    dossier_uuid,
    dossier_id,
    subject_type,
    last_modified_at,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, COALESCE(last_modified_at, created_at))) AS years_inactive
FROM dossiers
WHERE COALESCE(last_modified_at, created_at) < CURRENT_DATE - INTERVAL '7 years'
AND status IN ('APPROVED', 'OBSERVED')
AND NOT is_deleted;
```

---

## 10. MIGRACIÓN Y DATOS INICIALES

### 10.1 Secuencias para IDs Legibles

```sql
-- Secuencia para dossier_id
CREATE SEQUENCE dossier_id_seq START 1;

-- Función para generar dossier_id
CREATE OR REPLACE FUNCTION generate_dossier_id()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'DOSS-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
           LPAD(NEXTVAL('dossier_id_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Establecer valor predeterminado
ALTER TABLE dossiers ALTER COLUMN dossier_id SET DEFAULT generate_dossier_id();
```

### 10.2 Datos de Ejemplo

```sql
-- Insertar expediente de ejemplo
INSERT INTO dossiers (
    dossier_id, subject_type, status, 
    identification, created_by
) VALUES (
    generate_dossier_id(),
    'CLIENT',
    'INCOMPLETE',
    '{"documentType": "DNI", "documentNumber": "12345678", "firstName": "Juan", "lastName": "Pérez"}'::jsonb,
    'admin@siar.com'
);
```

---

## 11. MANTENIMIENTO

### 11.1 Reindex Periódico

```sql
-- Script de mantenimiento mensual
REINDEX TABLE CONCURRENTLY dossiers;
REINDEX TABLE CONCURRENTLY dossier_change_history;
VACUUM ANALYZE dossiers;
VACUUM ANALYZE dossier_change_history;
```

### 11.2 Limpieza de Registros Antiguos

```sql
-- Limpiar logs de acceso mayores a 2 años
DELETE FROM dossier_access_log
WHERE accessed_at < CURRENT_DATE - INTERVAL '2 years';
```

---

## 12. CONCLUSIÓN

Este modelo de base de datos para el Expediente Único del SIAR cumple con todos los requisitos regulatorios de SUDEASEG:

- ✅ Trazabilidad completa mediante tabla de historial inmutable
- ✅ No eliminación física mediante triggers y soft delete
- ✅ Versionamiento con `@Version` para concurrencia
- ✅ Auditoría exhaustiva con campos de creación, modificación y aprobación
- ✅ Flexibilidad mediante JSONB para estructuras complejas
- ✅ Seguridad mediante RLS y políticas de acceso
- ✅ Performance mediante índices estratégicos y vistas materializadas

El modelo está listo para integración con los módulos de Evaluación de Riesgos, Debida Diligencia, PEP y Auditoría.
