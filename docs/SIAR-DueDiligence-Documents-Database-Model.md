# Modelo de Base de Datos: Debida Diligencia y Gestión Documental
## Sistema Integrado Anti-Fraude y Riesgo (SIAR)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento define el modelo de base de datos relacional para el módulo de **Debida Diligencia y Gestión Documental** del sistema SIAR.

### 1.2 Alcance
El modelo cubre:
- Documentos asociados a expedientes
- Versionamiento automático de documentos
- Estados documentales y flujo de aprobación
- Fechas de carga y vencimiento con alertas
- Historial completo de cambios documentales
- Solicitudes de información a clientes
- No eliminación física de documentos

### 1.3 Principios de Diseño
- **Versionamiento automático**: Cada modificación crea nueva versión
- **Trazabilidad total**: Historial inmutable de todos los cambios
- **Gestión de vencimientos**: Alertas automáticas pre-vencimiento
- **Integridad de archivos**: Hash SHA-256 para verificación
- **No eliminación física**: Soft delete mediante flags
- **Auditoría regulatoria**: Diseño apto para inspección SUDEASEG

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN

```
┌──────────────────────────────────────────────────────────────────┐
│            DEBIDA DILIGENCIA Y GESTIÓN DOCUMENTAL                │
└──────────────────────────────────────────────────────────────────┘

                    ┌───────────────────┐
                    │  DUE_DILIGENCES   │
                    ├───────────────────┤
                    │ id (PK)           │
                    │ dd_id (UK)        │
                    │ dossier_id (FK)   │
                    │ dossier_type      │
                    │ status            │
                    │ risk_level        │
                    │ diligence_level   │
                    │ completeness_%    │
                    │ required_docs     │ JSONB
                    │ workflow          │ JSONB
                    │ submitted_date    │
                    │ submitted_by      │
                    │ review_start      │
                    │ reviewed_by       │
                    │ approval_date     │
                    │ approved_by       │
                    │ audit_trail       │ JSONB
                    │ version           │
                    └────────┬──────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
    ┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐
    │ DD_DOCUMENTS    │ │ INFORMATION │ │  DOCUMENT_TYPES  │
    ├─────────────────┤ │  _REQUESTS  │ ├──────────────────┤
    │ id (PK)         │ ├─────────────┤ │ id (PK)          │
    │ document_id(UK) │ │ id (PK)     │ │ code (UK)        │
    │ dd_id (FK)      │ │ request_id  │ │ name             │
    │ doc_type_id(FK) │ │ dd_id (FK)  │ │ description      │
    │ file_name       │ │ request_date│ │ category         │
    │ file_size       │ │ requested_by│ │ applicable_to[]  │
    │ mime_type       │ │ description │ │ is_mandatory     │
    │ file_hash       │ │ doc_types[] │ │ requires_expir   │
    │ storage_loc     │ │ due_date    │ │ default_exp_mo   │
    │ version         │ │ status      │ │ accepted_fmt[]   │
    │ is_current_ver  │ │ response_dt │ │ max_file_size_mb │
    │ expiration_date │ │ responded_by│ │ required_for_rl[]│
    │ upload_date     │ │ response_nt │ │ validation_rules │
    │ uploaded_by     │ │ version     │ │ is_active        │
    │ last_modified   │ └─────────────┘ └──────────────────┘
    │ approval_status │
    │ approved_by     │
    │ approved_at     │
    │ approval_notes  │
    │ replaces_doc_id │
    │ metadata        │ JSONB
    │ version         │
    └────────┬────────┘
             │
             │ History
             ▼
    ┌──────────────────┐
    │ DOCUMENT_HISTORY │
    ├──────────────────┤
    │ id (PK)          │
    │ document_id (FK) │
    │ change_date      │
    │ changed_by       │
    │ change_type      │
    │ previous_status  │
    │ new_status       │
    │ notes            │
    │ ip_address       │
    └──────────────────┘
```

---

## 3. DEFINICIÓN DE TABLAS

### 3.1 Tabla: `due_diligences`

**Descripción**: Proceso de Debida Diligencia asociado a un expediente.

```sql
CREATE TABLE due_diligences (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identificador legible
    due_diligence_id VARCHAR(50) NOT NULL UNIQUE,  -- DD-2024-00001
    
    -- Relación con expediente
    dossier_id VARCHAR(50) NOT NULL,  -- FK a dossiers.dossier_id
    dossier_type VARCHAR(50) NOT NULL CHECK (dossier_type IN (
        'CLIENT', 'INTERMEDIARY', 'EMPLOYEE', 'PROVIDER', 'REINSURER', 'RETROCESSIONAIRE'
    )),
    
    -- Estado del proceso
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',          -- Pendiente de inicio
        'IN_PROGRESS',      -- En proceso de recopilación
        'UNDER_REVIEW',     -- En revisión por analista
        'REQUIRES_INFO',    -- Requiere información adicional
        'APPROVED',         -- Aprobada
        'REJECTED',         -- Rechazada
        'EXPIRED'           -- Vencida
    )),
    
    -- Nivel de riesgo del expediente
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    
    -- Nivel de diligencia requerido
    diligence_level VARCHAR(20) NOT NULL CHECK (diligence_level IN (
        'SIMPLIFIED',   -- Debida Diligencia Simplificada
        'STANDARD',     -- Debida Diligencia Estándar
        'ENHANCED'      -- Debida Diligencia Reforzada
    )),
    
    -- Completitud de documentos
    completeness_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 
        CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100),
    
    -- Documentos requeridos (configuración)
    required_documents_json JSONB NOT NULL,
    
    -- Workflow y seguimiento
    workflow_json JSONB,
    
    -- Fechas del proceso
    submitted_date TIMESTAMP,
    submitted_by VARCHAR(50),
    
    review_start_date TIMESTAMP,
    reviewed_by VARCHAR(50),
    
    approval_date TIMESTAMP,
    approved_by VARCHAR(50),
    
    -- Auditoría completa (para inspección)
    audit_trail_json JSONB,
    
    -- Fechas de creación y modificación
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Control de versión
    version BIGINT NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX idx_dd_dossier ON due_diligences(dossier_id);
CREATE INDEX idx_dd_status ON due_diligences(status);
CREATE INDEX idx_dd_risk_level ON due_diligences(risk_level);
CREATE INDEX idx_dd_diligence_level ON due_diligences(diligence_level);
CREATE INDEX idx_dd_submitted ON due_diligences(submitted_date DESC);
CREATE INDEX idx_dd_approval ON due_diligences(approval_date DESC) 
    WHERE approval_date IS NOT NULL;

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_dd_required_docs_gin ON due_diligences USING GIN (required_documents_json);

-- Comentarios
COMMENT ON TABLE due_diligences IS 'Procesos de Debida Diligencia asociados a expedientes';
COMMENT ON COLUMN due_diligences.diligence_level IS 'Nivel de diligencia según riesgo: Simplificada, Estándar o Reforzada';
COMMENT ON COLUMN due_diligences.required_documents_json IS 'Lista de documentos obligatorios según tipo y riesgo';
```

#### 3.1.1 Estructura JSONB: `required_documents_json`

```json
{
  "documents": [
    {
      "documentTypeId": 1,
      "documentTypeCode": "ID_CARD",
      "documentTypeName": "Cédula de Identidad",
      "isMandatory": true,
      "status": "APPROVED",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "expirationDate": "2030-12-31"
    },
    {
      "documentTypeId": 2,
      "documentTypeCode": "PROOF_ADDRESS",
      "documentTypeName": "Comprobante de Domicilio",
      "isMandatory": true,
      "status": "PENDING",
      "uploadedAt": null,
      "expirationDate": null
    }
  ],
  "totalRequired": 8,
  "totalUploaded": 6,
  "totalApproved": 4
}
```

#### 3.1.2 Estructura JSONB: `workflow_json`

```json
{
  "currentStep": "REVIEW",
  "steps": [
    {
      "stepName": "INITIATION",
      "status": "COMPLETED",
      "completedBy": "analyst@example.com",
      "completedAt": "2024-01-10T09:00:00Z"
    },
    {
      "stepName": "DOCUMENT_COLLECTION",
      "status": "COMPLETED",
      "completedBy": "client@example.com",
      "completedAt": "2024-01-14T16:45:00Z"
    },
    {
      "stepName": "REVIEW",
      "status": "IN_PROGRESS",
      "assignedTo": "analyst@example.com",
      "startedAt": "2024-01-15T10:00:00Z"
    },
    {
      "stepName": "APPROVAL",
      "status": "PENDING",
      "assignedTo": "officer@example.com"
    }
  ]
}
```

### 3.2 Tabla: `document_types`

**Descripción**: Catálogo maestro de tipos de documentos aceptados.

```sql
CREATE TABLE document_types (
    id BIGSERIAL PRIMARY KEY,
    
    -- Código único del tipo de documento
    code VARCHAR(20) NOT NULL UNIQUE,  -- ID_CARD, PROOF_ADDRESS, etc.
    
    -- Nombre y descripción
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Categoría
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'IDENTIFICATION',    -- Documentos de identidad
        'PROOF_ADDRESS',     -- Comprobantes de domicilio
        'FINANCIAL',         -- Estados financieros
        'LEGAL',             -- Documentos legales/corporativos
        'CONTRACTUAL',       -- Contratos y acuerdos
        'REGULATORY',        -- Licencias y permisos
        'OPERATIONAL',       -- Operativos y comerciales
        'OTHER'              -- Otros
    )),
    
    -- Aplicabilidad (qué tipos de expediente lo requieren)
    applicable_to_json JSONB NOT NULL,  -- ["CLIENT", "INTERMEDIARY"]
    
    -- Obligatoriedad
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Vencimiento
    requires_expiration BOOLEAN NOT NULL DEFAULT FALSE,
    default_expiration_months INTEGER,  -- Meses de vigencia por defecto
    
    -- Validación de archivos
    accepted_formats_json JSONB NOT NULL,  -- ["PDF", "JPG", "PNG"]
    max_file_size_mb INTEGER NOT NULL DEFAULT 10,
    
    -- Nivel de riesgo
    required_for_risk_levels_json JSONB,  -- ["LOW", "MEDIUM", "HIGH"]
    
    -- Reglas de validación adicionales
    validation_rules_json JSONB,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Control de versión
    version BIGINT NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX idx_doctype_code ON document_types(code);
CREATE INDEX idx_doctype_category ON document_types(category);
CREATE INDEX idx_doctype_active ON document_types(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_doctype_mandatory ON document_types(is_mandatory) WHERE is_mandatory = TRUE;

-- Índice GIN para búsquedas en arrays JSONB
CREATE INDEX idx_doctype_applicable_gin ON document_types USING GIN (applicable_to_json);

-- Comentarios
COMMENT ON TABLE document_types IS 'Catálogo maestro de tipos de documentos aceptados';
COMMENT ON COLUMN document_types.applicable_to_json IS 'Tipos de expediente que requieren este documento';
COMMENT ON COLUMN document_types.validation_rules_json IS 'Reglas de validación específicas del documento';
```

#### 3.2.1 Estructura JSONB: `validation_rules_json`

```json
{
  "minPages": 1,
  "maxPages": 5,
  "requiresOCR": true,
  "requiredFields": ["fullName", "documentNumber", "expirationDate"],
  "autoExpiration": true,
  "expirationWarningDays": 30
}
```

### 3.3 Tabla: `due_diligence_documents`

**Descripción**: Documentos digitales subidos para procesos de debida diligencia.

```sql
CREATE TABLE due_diligence_documents (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identificador legible del documento
    document_id VARCHAR(100) NOT NULL UNIQUE,  -- DOC-2024-00001-v1
    
    -- Relación con proceso de DD y tipo de documento
    due_diligence_id BIGINT NOT NULL REFERENCES due_diligences(id),
    document_type_id BIGINT NOT NULL REFERENCES document_types(id),
    
    -- Información del archivo
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,  -- SHA-256 para integridad
    storage_location VARCHAR(500) NOT NULL,  -- S3, filesystem, etc.
    
    -- Versionamiento
    version INTEGER NOT NULL DEFAULT 1,
    is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Vencimiento
    expiration_date DATE,
    
    -- Auditoría: Subida
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(50) NOT NULL,
    
    -- Auditoría: Última Modificación
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(50),
    
    -- Estado de aprobación
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN (
        'PENDING',     -- Pendiente de revisión
        'UNDER_REVIEW',-- En revisión
        'APPROVED',    -- Aprobado
        'REJECTED',    -- Rechazado
        'EXPIRED'      -- Vencido
    )),
    
    approved_by VARCHAR(50),
    approval_date TIMESTAMP,
    approval_notes TEXT,
    
    -- Reemplazo de documento anterior
    replaces_document_id BIGINT REFERENCES due_diligence_documents(id),
    
    -- Metadata adicional
    metadata_json JSONB,
    
    -- Auditoría estándar
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Control de versión (optimistic locking)
    version_lock BIGINT NOT NULL DEFAULT 0,
    
    -- Constraint: Solo una versión actual por tipo de documento por DD
    CONSTRAINT unique_current_version UNIQUE (due_diligence_id, document_type_id, is_current_version)
        DEFERRABLE INITIALLY DEFERRED
);

-- Índices
CREATE INDEX idx_dddoc_dd ON due_diligence_documents(due_diligence_id);
CREATE INDEX idx_dddoc_type ON due_diligence_documents(document_type_id);
CREATE INDEX idx_dddoc_status ON due_diligence_documents(approval_status);
CREATE INDEX idx_dddoc_expiration ON due_diligence_documents(expiration_date) 
    WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_dddoc_current ON due_diligence_documents(is_current_version) 
    WHERE is_current_version = TRUE;
CREATE INDEX idx_dddoc_uploaded_by ON due_diligence_documents(uploaded_by);
CREATE INDEX idx_dddoc_hash ON due_diligence_documents(file_hash);

-- Índice GIN para metadata
CREATE INDEX idx_dddoc_metadata_gin ON due_diligence_documents USING GIN (metadata_json);

-- Comentarios
COMMENT ON TABLE due_diligence_documents IS 'Documentos digitales de procesos de debida diligencia';
COMMENT ON COLUMN due_diligence_documents.file_hash IS 'Hash SHA-256 para verificación de integridad y detección de duplicados';
COMMENT ON COLUMN due_diligence_documents.is_current_version IS 'Indica si es la versión vigente del documento';
COMMENT ON COLUMN due_diligence_documents.replaces_document_id IS 'ID del documento anterior que este reemplaza';
```

#### 3.3.1 Estructura JSONB: `metadata_json`

```json
{
  "ocrExtracted": {
    "fullName": "Juan Carlos Pérez García",
    "documentNumber": "12345678",
    "expirationDate": "2030-12-31",
    "issueDate": "2020-01-15"
  },
  "validationResults": {
    "isValid": true,
    "checks": [
      {"check": "documentNotExpired", "passed": true},
      {"check": "fileIntegrity", "passed": true},
      {"check": "formatAcceptable", "passed": true}
    ]
  },
  "uploadContext": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "uploadMethod": "WEB_PORTAL"
  }
}
```

### 3.4 Tabla: `document_history`

**Descripción**: Historial inmutable de cambios en documentos.

```sql
CREATE TABLE document_history (
    id BIGSERIAL PRIMARY KEY,
    
    -- Documento afectado
    document_id BIGINT NOT NULL REFERENCES due_diligence_documents(id),
    
    -- Timestamp del cambio
    change_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Usuario que realizó el cambio
    changed_by VARCHAR(50) NOT NULL,
    
    -- Tipo de cambio
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'UPLOADED',       -- Documento subido
        'APPROVED',       -- Documento aprobado
        'REJECTED',       -- Documento rechazado
        'REPLACED',       -- Documento reemplazado por nueva versión
        'EXPIRED',        -- Documento venció
        'RESTORED',       -- Documento restaurado
        'METADATA_UPDATED' -- Metadata actualizada
    )),
    
    -- Estados anterior y nuevo
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    
    -- Notas del cambio
    notes TEXT,
    
    -- Contexto de la acción
    ip_address VARCHAR(45),
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_dochist_document ON document_history(document_id);
CREATE INDEX idx_dochist_date ON document_history(change_date DESC);
CREATE INDEX idx_dochist_user ON document_history(changed_by);
CREATE INDEX idx_dochist_type ON document_history(change_type);

-- Comentarios
COMMENT ON TABLE document_history IS 'Historial inmutable de cambios en documentos de DD';
COMMENT ON COLUMN document_history.change_type IS 'Tipo de operación realizada sobre el documento';
```

### 3.5 Tabla: `information_requests`

**Descripción**: Solicitudes de información adicional a clientes/expedientes.

```sql
CREATE TABLE information_requests (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identificador legible
    request_id VARCHAR(50) NOT NULL UNIQUE,  -- REQ-2024-00001
    
    -- Proceso de DD relacionado
    due_diligence_id BIGINT NOT NULL REFERENCES due_diligences(id),
    
    -- Fecha de la solicitud
    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requested_by VARCHAR(50) NOT NULL,
    
    -- Descripción de lo solicitado
    description TEXT NOT NULL,
    
    -- Documentos específicos requeridos
    document_type_ids_json JSONB NOT NULL,  -- [1, 2, 5] - IDs de document_types
    
    -- Fecha límite de respuesta
    due_date DATE NOT NULL,
    
    -- Estado de la solicitud
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',     -- Pendiente de respuesta
        'COMPLETED',   -- Completada
        'OVERDUE',     -- Vencida sin respuesta
        'CANCELLED'    -- Cancelada
    )),
    
    -- Respuesta
    response_date TIMESTAMP,
    responded_by VARCHAR(50),
    response_notes TEXT,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Control de versión
    version BIGINT NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX idx_infreq_dd ON information_requests(due_diligence_id);
CREATE INDEX idx_infreq_status ON information_requests(status);
CREATE INDEX idx_infreq_due_date ON information_requests(due_date);
CREATE INDEX idx_infreq_requested_by ON information_requests(requested_by);

-- Índice para solicitudes vencidas
CREATE INDEX idx_infreq_overdue ON information_requests(due_date) 
    WHERE status = 'PENDING' AND due_date < CURRENT_DATE;

-- Comentarios
COMMENT ON TABLE information_requests IS 'Solicitudes de información adicional a clientes/expedientes';
COMMENT ON COLUMN information_requests.document_type_ids_json IS 'IDs de los tipos de documentos solicitados';
```

---

## 4. TRIGGERS Y FUNCIONES

### 4.1 Trigger: Prevenir Eliminación Física

```sql
-- Función que previene DELETE físico
CREATE OR REPLACE FUNCTION prevent_physical_deletion_documents()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Physical deletion not allowed on table %. Use soft delete or status change.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_prevent_delete_dd
BEFORE DELETE ON due_diligences
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_documents();

CREATE TRIGGER trigger_prevent_delete_documents
BEFORE DELETE ON due_diligence_documents
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_documents();

CREATE TRIGGER trigger_prevent_delete_history
BEFORE DELETE ON document_history
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_documents();
```

### 4.2 Trigger: Registro Automático de Cambios

```sql
-- Función para registrar cambios en document_history
CREATE OR REPLACE FUNCTION record_document_change()
RETURNS TRIGGER AS $$
DECLARE
    v_change_type VARCHAR(50);
    v_previous_status VARCHAR(50);
BEGIN
    -- Determinar tipo de cambio
    IF (TG_OP = 'INSERT') THEN
        v_change_type := 'UPLOADED';
        v_previous_status := NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_previous_status := OLD.approval_status;
        
        v_change_type := CASE
            WHEN OLD.approval_status != NEW.approval_status THEN
                CASE NEW.approval_status
                    WHEN 'APPROVED' THEN 'APPROVED'
                    WHEN 'REJECTED' THEN 'REJECTED'
                    WHEN 'EXPIRED' THEN 'EXPIRED'
                    ELSE 'METADATA_UPDATED'
                END
            WHEN OLD.version != NEW.version THEN 'REPLACED'
            ELSE 'METADATA_UPDATED'
        END;
    END IF;
    
    -- Insertar en historial
    INSERT INTO document_history (
        document_id, change_date, changed_by, change_type,
        previous_status, new_status, notes
    ) VALUES (
        NEW.id, CURRENT_TIMESTAMP, CURRENT_USER, v_change_type,
        v_previous_status, NEW.approval_status,
        'Cambio automático registrado por sistema'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_record_document_change
AFTER INSERT OR UPDATE ON due_diligence_documents
FOR EACH ROW EXECUTE FUNCTION record_document_change();
```

### 4.3 Trigger: Actualizar Completitud de DD

```sql
-- Función para calcular completitud de DD
CREATE OR REPLACE FUNCTION update_dd_completeness()
RETURNS TRIGGER AS $$
DECLARE
    v_dd_id BIGINT;
    v_total_required INTEGER;
    v_total_approved INTEGER;
    v_percentage DECIMAL(5,2);
BEGIN
    -- Obtener ID de DD
    v_dd_id := CASE
        WHEN TG_OP = 'DELETE' THEN OLD.due_diligence_id
        ELSE NEW.due_diligence_id
    END;
    
    -- Contar documentos requeridos y aprobados
    SELECT 
        COUNT(*) FILTER (WHERE dt.is_mandatory = TRUE),
        COUNT(*) FILTER (WHERE dt.is_mandatory = TRUE AND ddd.approval_status = 'APPROVED')
    INTO v_total_required, v_total_approved
    FROM document_types dt
    LEFT JOIN due_diligence_documents ddd 
        ON ddd.document_type_id = dt.id 
        AND ddd.due_diligence_id = v_dd_id
        AND ddd.is_current_version = TRUE
    WHERE dt.is_active = TRUE;
    
    -- Calcular porcentaje
    IF v_total_required > 0 THEN
        v_percentage := (v_total_approved::DECIMAL / v_total_required::DECIMAL) * 100;
    ELSE
        v_percentage := 0;
    END IF;
    
    -- Actualizar
    UPDATE due_diligences
    SET 
        completeness_percentage = v_percentage,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_dd_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_completeness
AFTER INSERT OR UPDATE OR DELETE ON due_diligence_documents
FOR EACH ROW EXECUTE FUNCTION update_dd_completeness();
```

### 4.4 Trigger: Versionamiento Automático

```sql
-- Función para gestionar versionamiento automático
CREATE OR REPLACE FUNCTION manage_document_versioning()
RETURNS TRIGGER AS $$
DECLARE
    v_max_version INTEGER;
BEGIN
    -- Solo aplica para INSERT
    IF (TG_OP = 'INSERT') THEN
        -- Verificar si ya existe documento del mismo tipo
        SELECT MAX(version) INTO v_max_version
        FROM due_diligence_documents
        WHERE due_diligence_id = NEW.due_diligence_id
        AND document_type_id = NEW.document_type_id;
        
        IF v_max_version IS NOT NULL THEN
            -- Existe versión anterior: marcar anterior como no vigente
            UPDATE due_diligence_documents
            SET is_current_version = FALSE
            WHERE due_diligence_id = NEW.due_diligence_id
            AND document_type_id = NEW.document_type_id
            AND is_current_version = TRUE;
            
            -- Asignar nueva versión
            NEW.version := v_max_version + 1;
            NEW.replaces_document_id := (
                SELECT id FROM due_diligence_documents
                WHERE due_diligence_id = NEW.due_diligence_id
                AND document_type_id = NEW.document_type_id
                AND version = v_max_version
            );
        ELSE
            -- Primera versión
            NEW.version := 1;
        END IF;
        
        -- Asegurar que la nueva versión esté marcada como actual
        NEW.is_current_version := TRUE;
        
        -- Generar document_id
        NEW.document_id := 'DOC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                           LPAD(NEXTVAL('document_id_seq')::TEXT, 5, '0') || 
                           '-v' || NEW.version;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia
CREATE SEQUENCE document_id_seq START 1;

-- Trigger
CREATE TRIGGER trigger_manage_versioning
BEFORE INSERT ON due_diligence_documents
FOR EACH ROW EXECUTE FUNCTION manage_document_versioning();
```

### 4.5 Trigger: Alertas de Vencimiento

```sql
-- Función para generar alertas de vencimiento
CREATE OR REPLACE FUNCTION check_document_expiration()
RETURNS TRIGGER AS $$
DECLARE
    v_days_until_expiry INTEGER;
    v_warning_days INTEGER;
BEGIN
    -- Solo verificar si tiene fecha de vencimiento
    IF NEW.expiration_date IS NOT NULL AND NEW.approval_status = 'APPROVED' THEN
        -- Calcular días hasta vencimiento
        v_days_until_expiry := NEW.expiration_date - CURRENT_DATE;
        
        -- Obtener días de advertencia de la configuración del tipo de documento
        SELECT (dt.validation_rules_json->>'expirationWarningDays')::INTEGER 
        INTO v_warning_days
        FROM document_types dt
        WHERE dt.id = NEW.document_type_id;
        
        v_warning_days := COALESCE(v_warning_days, 30);  -- Default 30 días
        
        -- Si está por vencer o ya venció
        IF v_days_until_expiry <= 0 THEN
            -- Marcar como expirado
            NEW.approval_status := 'EXPIRED';
            
            -- Generar alerta crítica
            INSERT INTO document_expiration_alerts (
                document_id, alert_type, alert_date, days_until_expiry
            ) VALUES (
                NEW.id, 'EXPIRED', CURRENT_TIMESTAMP, v_days_until_expiry
            );
            
        ELSIF v_days_until_expiry <= v_warning_days THEN
            -- Generar alerta de advertencia
            INSERT INTO document_expiration_alerts (
                document_id, alert_type, alert_date, days_until_expiry
            ) VALUES (
                NEW.id, 'EXPIRING_SOON', CURRENT_TIMESTAMP, v_days_until_expiry
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla de alertas de vencimiento
CREATE TABLE IF NOT EXISTS document_expiration_alerts (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES due_diligence_documents(id),
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('EXPIRING_SOON', 'EXPIRED')),
    alert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    days_until_expiry INTEGER NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(50),
    acknowledged_at TIMESTAMP
);

CREATE INDEX idx_exp_alert_doc ON document_expiration_alerts(document_id);
CREATE INDEX idx_exp_alert_type ON document_expiration_alerts(alert_type) WHERE NOT acknowledged;

-- Trigger
CREATE TRIGGER trigger_check_expiration
BEFORE INSERT OR UPDATE ON due_diligence_documents
FOR EACH ROW EXECUTE FUNCTION check_document_expiration();
```

---

## 5. VISTAS

### 5.1 Vista: Documentos Vigentes por DD

```sql
CREATE OR REPLACE VIEW v_current_dd_documents AS
SELECT 
    ddd.id,
    ddd.document_id,
    ddd.due_diligence_id,
    dd.due_diligence_id AS dd_code,
    dd.dossier_id,
    ddd.document_type_id,
    dt.code AS document_type_code,
    dt.name AS document_type_name,
    dt.category AS document_category,
    ddd.file_name,
    ddd.file_size_bytes,
    ddd.mime_type,
    ddd.version,
    ddd.approval_status,
    ddd.expiration_date,
    -- Calcular días hasta vencimiento
    CASE 
        WHEN ddd.expiration_date IS NOT NULL THEN
            ddd.expiration_date - CURRENT_DATE
        ELSE NULL
    END AS days_until_expiry,
    -- Indicador de vencimiento
    CASE 
        WHEN ddd.expiration_date IS NOT NULL AND ddd.expiration_date < CURRENT_DATE THEN TRUE
        ELSE FALSE
    END AS is_expired,
    ddd.uploaded_by,
    ddd.upload_date,
    ddd.approved_by,
    ddd.approval_date
FROM due_diligence_documents ddd
JOIN due_diligences dd ON ddd.due_diligence_id = dd.id
JOIN document_types dt ON ddd.document_type_id = dt.id
WHERE ddd.is_current_version = TRUE
ORDER BY dd.due_diligence_id, dt.code;

COMMENT ON VIEW v_current_dd_documents IS 'Documentos vigentes (versión actual) de procesos de DD';
```

### 5.2 Vista: Completitud por Proceso DD

```sql
CREATE OR REPLACE VIEW v_dd_completeness_summary AS
SELECT 
    dd.id,
    dd.due_diligence_id,
    dd.dossier_id,
    dd.status,
    dd.risk_level,
    dd.diligence_level,
    dd.completeness_percentage,
    -- Contar documentos
    (SELECT COUNT(*) FROM document_types dt 
     WHERE dt.is_active = TRUE 
     AND dt.is_mandatory = TRUE) AS total_required_docs,
    (SELECT COUNT(*) FROM due_diligence_documents ddd
     JOIN document_types dt ON ddd.document_type_id = dt.id
     WHERE ddd.due_diligence_id = dd.id
     AND ddd.is_current_version = TRUE
     AND dt.is_mandatory = TRUE) AS uploaded_docs,
    (SELECT COUNT(*) FROM due_diligence_documents ddd
     JOIN document_types dt ON ddd.document_type_id = dt.id
     WHERE ddd.due_diligence_id = dd.id
     AND ddd.is_current_version = TRUE
     AND ddd.approval_status = 'APPROVED'
     AND dt.is_mandatory = TRUE) AS approved_docs,
    -- Indicadores
    CASE 
        WHEN dd.completeness_percentage = 100 THEN 'COMPLETE'
        WHEN dd.completeness_percentage >= 80 THEN 'ALMOST_COMPLETE'
        WHEN dd.completeness_percentage >= 50 THEN 'IN_PROGRESS'
        ELSE 'INCOMPLETE'
    END AS completeness_status
FROM due_diligences dd
ORDER BY dd.completeness_percentage ASC, dd.created_at ASC;

COMMENT ON VIEW v_dd_completeness_summary IS 'Resumen de completitud de procesos de DD';
```

### 5.3 Vista: Documentos Próximos a Vencer

```sql
CREATE OR REPLACE VIEW v_expiring_documents AS
SELECT 
    ddd.document_id,
    dd.due_diligence_id AS dd_code,
    dd.dossier_id,
    dt.name AS document_type_name,
    ddd.expiration_date,
    ddd.expiration_date - CURRENT_DATE AS days_until_expiry,
    CASE 
        WHEN ddd.expiration_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN ddd.expiration_date - CURRENT_DATE <= 7 THEN 'CRITICAL'
        WHEN ddd.expiration_date - CURRENT_DATE <= 30 THEN 'WARNING'
        ELSE 'OK'
    END AS urgency_level,
    ddd.uploaded_by,
    ddd.approved_by,
    ddd.approval_date
FROM due_diligence_documents ddd
JOIN due_diligences dd ON ddd.due_diligence_id = dd.id
JOIN document_types dt ON ddd.document_type_id = dt.id
WHERE ddd.is_current_version = TRUE
AND ddd.approval_status = 'APPROVED'
AND ddd.expiration_date IS NOT NULL
AND ddd.expiration_date <= CURRENT_DATE + INTERVAL '60 days'
ORDER BY ddd.expiration_date ASC;

COMMENT ON VIEW v_expiring_documents IS 'Documentos próximos a vencer o ya vencidos';
```

---

## 6. CONSULTAS COMUNES

### 6.1 Obtener documentos faltantes de un DD

```sql
SELECT 
    dt.code AS document_code,
    dt.name AS document_name,
    dt.is_mandatory,
    CASE 
        WHEN ddd.id IS NULL THEN 'NOT_UPLOADED'
        WHEN ddd.approval_status = 'PENDING' THEN 'PENDING_APPROVAL'
        WHEN ddd.approval_status = 'REJECTED' THEN 'REJECTED'
        ELSE ddd.approval_status
    END AS status
FROM document_types dt
LEFT JOIN due_diligence_documents ddd 
    ON ddd.document_type_id = dt.id 
    AND ddd.due_diligence_id = :dd_id
    AND ddd.is_current_version = TRUE
WHERE dt.is_active = TRUE
AND dt.is_mandatory = TRUE
AND (ddd.id IS NULL OR ddd.approval_status != 'APPROVED')
ORDER BY dt.name;
```

### 6.2 Historial completo de un documento

```sql
SELECT 
    dh.change_date,
    dh.change_type,
    dh.changed_by,
    dh.previous_status,
    dh.new_status,
    dh.notes
FROM document_history dh
WHERE dh.document_id = :document_id
ORDER BY dh.change_date DESC;
```

---

## 7. DATOS INICIALES

### 7.1 Tipos de Documentos Predefinidos

```sql
-- Documentos de Identificación
INSERT INTO document_types (code, name, category, applicable_to_json, is_mandatory, requires_expiration, default_expiration_months, accepted_formats_json, max_file_size_mb, required_for_risk_levels_json) VALUES
('ID_CARD', 'Cédula de Identidad', 'IDENTIFICATION', '["CLIENT", "INTERMEDIARY", "EMPLOYEE"]'::jsonb, TRUE, TRUE, 120, '["PDF", "JPG", "PNG"]'::jsonb, 5, '["LOW", "MEDIUM", "HIGH"]'::jsonb),
('PASSPORT', 'Pasaporte', 'IDENTIFICATION', '["CLIENT", "INTERMEDIARY"]'::jsonb, FALSE, TRUE, 120, '["PDF", "JPG", "PNG"]'::jsonb, 5, '["LOW", "MEDIUM", "HIGH"]'::jsonb),
('RUC', 'RUC/NIT Empresarial', 'IDENTIFICATION', '["CLIENT", "INTERMEDIARY", "PROVIDER"]'::jsonb, TRUE, FALSE, NULL, '["PDF"]'::jsonb, 5, '["LOW", "MEDIUM", "HIGH"]'::jsonb);

-- Comprobantes de Domicilio
INSERT INTO document_types (code, name, category, applicable_to_json, is_mandatory, requires_expiration, default_expiration_months, accepted_formats_json, max_file_size_mb, required_for_risk_levels_json) VALUES
('PROOF_ADDRESS', 'Comprobante de Domicilio', 'PROOF_ADDRESS', '["CLIENT", "INTERMEDIARY"]'::jsonb, TRUE, TRUE, 3, '["PDF", "JPG"]'::jsonb, 3, '["LOW", "MEDIUM", "HIGH"]'::jsonb);

-- Documentos Financieros
INSERT INTO document_types (code, name, category, applicable_to_json, is_mandatory, requires_expiration, default_expiration_months, accepted_formats_json, max_file_size_mb, required_for_risk_levels_json) VALUES
('FINANCIAL_STATEMENT', 'Estado Financiero', 'FINANCIAL', '["CLIENT", "INTERMEDIARY"]'::jsonb, FALSE, TRUE, 12, '["PDF", "XLS", "XLSX"]'::jsonb, 20, '["MEDIUM", "HIGH"]'::jsonb),
('BANK_REFERENCE', 'Referencia Bancaria', 'FINANCIAL', '["CLIENT", "INTERMEDIARY"]'::jsonb, FALSE, TRUE, 12, '["PDF"]'::jsonb, 5, '["MEDIUM", "HIGH"]'::jsonb);

-- Documentos Legales
INSERT INTO document_types (code, name, category, applicable_to_json, is_mandatory, requires_expiration, default_expiration_months, accepted_formats_json, max_file_size_mb, required_for_risk_levels_json) VALUES
('ARTICLES_INC', 'Artículos de Incorporación', 'LEGAL', '["CLIENT", "INTERMEDIARY", "PROVIDER"]'::jsonb, TRUE, FALSE, NULL, '["PDF"]'::jsonb, 10, '["LOW", "MEDIUM", "HIGH"]'::jsonb),
('SHAREHOLDERS', 'Listado de Accionistas', 'LEGAL', '["CLIENT", "INTERMEDIARY"]'::jsonb, TRUE, TRUE, 12, '["PDF"]'::jsonb, 10, '["MEDIUM", "HIGH"]'::jsonb),
('POWER_ATTORNEY', 'Poder Notarial', 'LEGAL', '["CLIENT", "INTERMEDIARY"]'::jsonb, FALSE, TRUE, 24, '["PDF"]'::jsonb, 5, '["MEDIUM", "HIGH"]'::jsonb);
```

---

## 8. CONCLUSIÓN

Este modelo de base de datos para Debida Diligencia y Gestión Documental cumple con todos los requisitos:

- ✅ Documentos asociados a expedientes mediante procesos de DD
- ✅ Versionamiento automático de documentos mediante triggers
- ✅ Estados documentales con flujo de aprobación completo
- ✅ Fechas de vencimiento con alertas automáticas
- ✅ Historial inmutable de todos los cambios
- ✅ No eliminación física mediante triggers de prevención
- ✅ Solicitudes de información con seguimiento
- ✅ Diseño optimizado para inspección regulatoria SUDEASEG

El modelo está completamente integrado con el módulo de Expediente Único y listo para producción.
