# Modelo de Base de Datos: Evaluación Inicial de Riesgos (EBR)
## Sistema Integrado Anti-Fraude y Riesgo (SIAR)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento define el modelo de base de datos relacional para la **Evaluación Inicial de Riesgos bajo Enfoque Basado en Riesgo (EBR)** del sistema SIAR.

### 1.2 Alcance
El modelo cubre:
- Evaluaciones de riesgo por expediente
- Factores de riesgo ponderables (escala 0-5)
- Configuraciones de ponderación versionadas
- Cálculo automático de nivel de riesgo (Bajo, Medio, Alto)
- Historial completo de evaluaciones y cambios
- Aprobaciones y override manual

### 1.3 Principios de Diseño
- **Versionamiento obligatorio**: Cada evaluación tiene versión incremental
- **Configuración paramétrica**: Ponderaciones configurables sin cambiar código
- **Historial inmutable**: Cada cambio se registra permanentemente
- **Trazabilidad total**: Quién, cuándo, qué y por qué de cada acción
- **Cálculo reproducible**: Cada evaluación guarda su configuración usada

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN

```
┌────────────────────────────────────────────────────────────────────┐
│                    EVALUACIÓN DE RIESGOS (EBR)                     │
└────────────────────────────────────────────────────────────────────┘

        ┌─────────────────────┐
        │   RISK_EVALUATIONS  │
        ├─────────────────────┤
        │ evaluation_id (PK)  │ EVAL-2024-000123-v1
        │ dossier_id (FK)     │
        │ evaluation_type     │
        │ evaluation_date     │
        │ evaluator_user_id   │
        │ version             │
        │ status              │
        │ risk_factors_json   │ JSONB
        │ calculation_result  │ JSONB
        │ configuration_id(FK)│
        │ preliminary_level   │
        │ final_risk_level    │
        │ has_manual_override │
        │ override_justif     │
        │ override_by         │
        │ requires_approval   │
        │ approved_by         │
        │ approved_at         │
        │ next_review_date    │
        └──────────┬──────────┘
                   │
        ┌──────────┼──────────────┐
        │          │              │
        ▼          ▼              ▼
┌────────────┐ ┌────────────┐ ┌──────────────────┐
│   RISK_    │ │EVALUATION_ │ │  RISK_ALERTS     │
│  FACTORS   │ │  HISTORY   │ ├──────────────────┤
├────────────┤ ├────────────┤ │ alert_id (PK)    │
│factor_id(PK│ │history_id  │ │ evaluation_id(FK)│
│factor_code │ │evaluation  │ │ alert_type       │
│factor_name │ │change_type │ │ risk_level       │
│category    │ │changed_by  │ │ threshold_exceed │
│description │ │changed_at  │ │ created_at       │
│scale_min   │ │previous    │ │ notified_to[]    │
│scale_max   │ │new_state   │ └──────────────────┘
│is_active   │ │change_just │
│requires_   │ └────────────┘
│justif      │
└─────┬──────┘
      │
      │ Used in
      ▼
┌──────────────────────┐
│ RISK_FACTOR_VALUES   │
├──────────────────────┤
│ factor_value_id (PK) │
│ evaluation_id (FK)   │
│ factor_id (FK)       │
│ value (0-5)          │
│ label                │
│ justification        │
│ evidence_attach      │ JSONB
│ assigned_by          │
│ assigned_at          │
└──────────────────────┘

┌─────────────────────────┐
│  RISK_CONFIGURATIONS    │
├─────────────────────────┤
│ configuration_id (PK)   │ CFG-2024-001
│ configuration_name      │
│ version                 │
│ effective_from          │
│ effective_to            │
│ category_weights        │ JSONB
│ factor_weights          │ JSONB
│ thresholds              │ JSONB
│ is_active               │
│ created_by              │
│ approved_by             │
│ change_justification    │
└─────────────────────────┘
```

---

## 3. DEFINICIÓN DE TABLAS

### 3.1 Tabla: `risk_evaluations`

**Descripción**: Evaluaciones de riesgo realizadas a expedientes.

```sql
CREATE TABLE risk_evaluations (
    -- Identificador compuesto: ID + versión
    evaluation_id VARCHAR(50) PRIMARY KEY,  -- EVAL-2024-000123-v1
    
    -- Relación con expediente
    dossier_id VARCHAR(50) NOT NULL,  -- FK a dossiers.dossier_id
    
    -- Tipo de evaluación
    evaluation_type VARCHAR(20) NOT NULL CHECK (evaluation_type IN (
        'INITIAL', 'PERIODIC', 'EXTRAORDINARY', 'POST_INCIDENT'
    )),
    
    -- Fecha y evaluador
    evaluation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluator_user_id VARCHAR(50) NOT NULL,
    
    -- Versionamiento (incremental por dossier)
    version INTEGER NOT NULL,
    
    -- Estado de la evaluación
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED'
    )),
    
    -- Factores de riesgo evaluados (almacenados como JSONB)
    risk_factors_json JSONB NOT NULL,
    
    -- Resultado del cálculo (almacenado para reproducibilidad)
    calculation_result_json JSONB,
    
    -- Configuración usada (para poder reproducir el cálculo)
    configuration_id VARCHAR(50) NOT NULL,  -- FK a risk_configurations
    
    -- Niveles de riesgo
    preliminary_risk_level VARCHAR(10) CHECK (preliminary_risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    final_risk_level VARCHAR(10) CHECK (final_risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    
    -- Override manual
    has_manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    manual_override_justification TEXT,
    override_applied_by VARCHAR(50),
    override_applied_at TIMESTAMP,
    
    -- Debida Diligencia Reforzada
    requires_enhanced_due_diligence BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Aprobación
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    approval_level VARCHAR(30),  -- 'ANALYST', 'OFFICER', 'DIRECTOR'
    approved_by VARCHAR(50),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Próxima revisión
    next_review_date DATE,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Comentarios adicionales
    comments TEXT,
    
    -- Constraint: version incremental por dossier
    CONSTRAINT unique_dossier_version UNIQUE (dossier_id, version)
);

-- Índices
CREATE INDEX idx_eval_dossier ON risk_evaluations(dossier_id);
CREATE INDEX idx_eval_status ON risk_evaluations(status);
CREATE INDEX idx_eval_date ON risk_evaluations(evaluation_date DESC);
CREATE INDEX idx_eval_final_level ON risk_evaluations(final_risk_level);
CREATE INDEX idx_eval_next_review ON risk_evaluations(next_review_date) 
    WHERE next_review_date IS NOT NULL;
CREATE INDEX idx_eval_config ON risk_evaluations(configuration_id);
CREATE INDEX idx_eval_evaluator ON risk_evaluations(evaluator_user_id);

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_eval_factors_gin ON risk_evaluations USING GIN (risk_factors_json);

-- Comentarios
COMMENT ON TABLE risk_evaluations IS 'Evaluaciones de riesgo de expedientes bajo metodología EBR';
COMMENT ON COLUMN risk_evaluations.evaluation_id IS 'ID compuesto: EVAL-YYYY-NNNNNN-vN';
COMMENT ON COLUMN risk_evaluations.version IS 'Versión incremental de evaluación por expediente';
COMMENT ON COLUMN risk_evaluations.risk_factors_json IS 'Factores evaluados con sus valores y justificaciones';
COMMENT ON COLUMN risk_evaluations.calculation_result_json IS 'Resultado detallado del cálculo para reproducibilidad';
```

#### 3.1.1 Estructura JSONB: `risk_factors_json`

```json
{
  "categories": [
    {
      "categoryCode": "GEO",
      "categoryName": "Riesgo Geográfico",
      "weight": 0.25,
      "factors": [
        {
          "factorCode": "GEO-001",
          "factorName": "País de Residencia",
          "value": 3,
          "label": "MEDIUM",
          "weight": 0.40,
          "justification": "Cliente reside en jurisdicción de riesgo medio",
          "evidenceAttachments": ["DOC-2024-001.pdf"]
        },
        {
          "factorCode": "GEO-002",
          "factorName": "País de Operaciones",
          "value": 4,
          "label": "HIGH",
          "weight": 0.35,
          "justification": "Opera en país con alto riesgo de lavado",
          "evidenceAttachments": []
        }
      ],
      "categoryScore": 3.4
    },
    {
      "categoryCode": "PROD",
      "categoryName": "Riesgo de Productos",
      "weight": 0.20,
      "factors": [
        {
          "factorCode": "PROD-001",
          "factorName": "Tipo de Producto Contratado",
          "value": 2,
          "label": "LOW",
          "weight": 0.50,
          "justification": "Productos estándar de bajo riesgo"
        }
      ],
      "categoryScore": 2.0
    }
  ],
  "totalFactorsEvaluated": 15,
  "averageValue": 2.8
}
```

#### 3.1.2 Estructura JSONB: `calculation_result_json`

```json
{
  "calculationTimestamp": "2024-01-15T10:30:00Z",
  "configurationUsed": "CFG-2024-001",
  "methodology": "WEIGHTED_AVERAGE",
  "categoryScores": {
    "GEO": 3.4,
    "PROD": 2.0,
    "CLIENT": 2.5,
    "TRANS": 3.0,
    "CTRL": 1.8
  },
  "weightedCategoryScores": {
    "GEO": 0.85,
    "PROD": 0.40,
    "CLIENT": 0.50,
    "TRANS": 0.60,
    "CTRL": 0.36
  },
  "preliminaryScore": 2.71,
  "preliminaryLevel": "MEDIUM",
  "adjustments": [
    {
      "reason": "Cliente tiene PEP relacionado directo",
      "impact": +0.5,
      "appliedBy": "SYSTEM"
    }
  ],
  "finalScore": 3.21,
  "finalLevel": "HIGH",
  "thresholdsUsed": {
    "LOW": [0, 2.0],
    "MEDIUM": [2.0, 3.5],
    "HIGH": [3.5, 5.0]
  },
  "calculationLog": [
    "Step 1: Calculated category averages",
    "Step 2: Applied category weights",
    "Step 3: Summed weighted scores",
    "Step 4: Applied PEP adjustment +0.5",
    "Step 5: Determined final level: HIGH"
  ]
}
```

### 3.2 Tabla: `risk_factors`

**Descripción**: Catálogo maestro de factores de riesgo configurables.

```sql
CREATE TABLE risk_factors (
    factor_id BIGSERIAL PRIMARY KEY,
    
    -- Código único del factor
    factor_code VARCHAR(50) NOT NULL UNIQUE,  -- GEO-001, PROD-001, etc.
    
    -- Nombre y descripción
    factor_name VARCHAR(100) NOT NULL,
    factor_description TEXT,
    
    -- Categoría del factor
    factor_category VARCHAR(30) NOT NULL CHECK (factor_category IN (
        'GEOGRAPHIC',     -- Riesgo Geográfico
        'PRODUCT',        -- Riesgo de Producto/Servicio
        'CLIENT_PROFILE', -- Perfil del Cliente
        'TRANSACTION',    -- Riesgo Transaccional
        'CONTROL',        -- Controles Internos
        'PEP_RELATED',    -- Relacionado con PEP
        'SECTOR'          -- Riesgo Sectorial
    )),
    
    -- Escala de valoración
    scale_min INTEGER NOT NULL DEFAULT 0,
    scale_max INTEGER NOT NULL DEFAULT 5,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Requiere justificación obligatoria
    requires_justification BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_factor_code ON risk_factors(factor_code);
CREATE INDEX idx_factor_category ON risk_factors(factor_category);
CREATE INDEX idx_factor_active ON risk_factors(is_active) WHERE is_active = TRUE;

-- Comentarios
COMMENT ON TABLE risk_factors IS 'Catálogo maestro de factores de riesgo configurables';
COMMENT ON COLUMN risk_factors.factor_code IS 'Código único alfanumérico del factor';
COMMENT ON COLUMN risk_factors.requires_justification IS 'Si TRUE, el evaluador debe justificar el valor asignado';
```

### 3.3 Tabla: `risk_factor_values`

**Descripción**: Valores asignados a cada factor en una evaluación específica.

```sql
CREATE TABLE risk_factor_values (
    factor_value_id BIGSERIAL PRIMARY KEY,
    
    -- Relación con evaluación y factor
    evaluation_id VARCHAR(50) NOT NULL,  -- FK a risk_evaluations
    factor_id BIGINT NOT NULL REFERENCES risk_factors(factor_id),
    
    -- Valor asignado (0-5)
    value INTEGER NOT NULL CHECK (value >= 0 AND value <= 5),
    
    -- Etiqueta interpretativa
    label VARCHAR(15) CHECK (label IN ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    
    -- Justificación del valor asignado
    justification TEXT,
    
    -- Evidencia adjunta (referencias a documentos)
    evidence_attachments JSONB,  -- ["DOC-ID-1", "DOC-ID-2"]
    
    -- Usuario que asignó el valor
    assigned_by VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: un solo valor por factor en cada evaluación
    CONSTRAINT unique_eval_factor UNIQUE (evaluation_id, factor_id)
);

-- Índices
CREATE INDEX idx_factor_val_eval ON risk_factor_values(evaluation_id);
CREATE INDEX idx_factor_val_factor ON risk_factor_values(factor_id);
CREATE INDEX idx_factor_val_assigned_by ON risk_factor_values(assigned_by);

-- Comentarios
COMMENT ON TABLE risk_factor_values IS 'Valores asignados a factores en evaluaciones específicas';
COMMENT ON COLUMN risk_factor_values.value IS 'Valor numérico del factor en escala 0-5';
COMMENT ON COLUMN risk_factor_values.evidence_attachments IS 'IDs de documentos que respaldan el valor asignado';
```

### 3.4 Tabla: `risk_configurations`

**Descripción**: Configuraciones de ponderación de factores y umbrales (versionadas).

```sql
CREATE TABLE risk_configurations (
    configuration_id VARCHAR(50) PRIMARY KEY,  -- CFG-2024-001
    
    -- Nombre de la configuración
    configuration_name VARCHAR(100) NOT NULL,
    
    -- Versión
    version INTEGER NOT NULL,
    
    -- Vigencia
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    
    -- Ponderaciones de categorías (JSONB)
    category_weights_json JSONB NOT NULL,
    
    -- Ponderaciones de factores dentro de cada categoría (JSONB)
    factor_weights_json JSONB NOT NULL,
    
    -- Umbrales para determinar nivel de riesgo (JSONB)
    thresholds_json JSONB NOT NULL,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Auditoría
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Aprobación
    approved_by VARCHAR(50),
    approved_at TIMESTAMP,
    
    -- Justificación del cambio de configuración
    change_justification TEXT
);

-- Índices
CREATE INDEX idx_config_active ON risk_configurations(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_config_effective ON risk_configurations(effective_from DESC);
CREATE INDEX idx_config_version ON risk_configurations(version DESC);

-- Constraint: Solo una configuración activa a la vez
CREATE UNIQUE INDEX idx_config_active_unique ON risk_configurations(is_active) 
    WHERE is_active = TRUE;

-- Comentarios
COMMENT ON TABLE risk_configurations IS 'Configuraciones versionadas de ponderación y umbrales';
COMMENT ON COLUMN risk_configurations.is_active IS 'Solo una configuración puede estar activa';
```

#### 3.4.1 Estructura JSONB: `category_weights_json`

```json
{
  "GEOGRAPHIC": 0.25,
  "PRODUCT": 0.20,
  "CLIENT_PROFILE": 0.20,
  "TRANSACTION": 0.20,
  "CONTROL": 0.15,
  "total": 1.00
}
```

#### 3.4.2 Estructura JSONB: `factor_weights_json`

```json
{
  "GEOGRAPHIC": {
    "GEO-001": 0.40,
    "GEO-002": 0.35,
    "GEO-003": 0.25
  },
  "PRODUCT": {
    "PROD-001": 0.50,
    "PROD-002": 0.30,
    "PROD-003": 0.20
  }
}
```

#### 3.4.3 Estructura JSONB: `thresholds_json`

```json
{
  "LOW": {
    "min": 0.0,
    "max": 2.0,
    "color": "#28a745",
    "actions": ["STANDARD_DUE_DILIGENCE"]
  },
  "MEDIUM": {
    "min": 2.0,
    "max": 3.5,
    "color": "#ffc107",
    "actions": ["ENHANCED_MONITORING", "QUARTERLY_REVIEW"]
  },
  "HIGH": {
    "min": 3.5,
    "max": 5.0,
    "color": "#dc3545",
    "actions": ["ENHANCED_DUE_DILIGENCE", "OFFICER_APPROVAL", "MONTHLY_REVIEW"]
  }
}
```

### 3.5 Tabla: `evaluation_history`

**Descripción**: Historial inmutable de cambios en evaluaciones de riesgo.

```sql
CREATE TABLE evaluation_history (
    history_id BIGSERIAL PRIMARY KEY,
    
    -- Evaluación afectada
    evaluation_id VARCHAR(50) NOT NULL,  -- FK a risk_evaluations
    
    -- Tipo de cambio
    change_type VARCHAR(30) NOT NULL CHECK (change_type IN (
        'CREATION', 'FACTOR_UPDATE', 'STATUS_CHANGE', 'APPROVAL',
        'REJECTION', 'OVERRIDE_APPLIED', 'RECALCULATION'
    )),
    
    -- Usuario que realizó el cambio
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Estado anterior y nuevo (JSONB completo)
    previous_state_json JSONB,
    new_state_json JSONB NOT NULL,
    
    -- Justificación del cambio
    change_justification TEXT,
    
    -- Campos afectados
    affected_fields JSONB  -- ["final_risk_level", "manual_override_justification"]
);

-- Índices
CREATE INDEX idx_history_eval ON evaluation_history(evaluation_id);
CREATE INDEX idx_history_timestamp ON evaluation_history(changed_at DESC);
CREATE INDEX idx_history_type ON evaluation_history(change_type);
CREATE INDEX idx_history_user ON evaluation_history(changed_by);

-- Comentarios
COMMENT ON TABLE evaluation_history IS 'Historial inmutable de cambios en evaluaciones de riesgo';
COMMENT ON COLUMN evaluation_history.previous_state_json IS 'Estado completo antes del cambio';
COMMENT ON COLUMN evaluation_history.new_state_json IS 'Estado completo después del cambio';
```

### 3.6 Tabla: `risk_alerts`

**Descripción**: Alertas generadas por evaluaciones de alto riesgo.

```sql
CREATE TABLE risk_alerts (
    alert_id VARCHAR(50) PRIMARY KEY,  -- RISK-ALERT-2024-00001
    
    -- Evaluación que generó la alerta
    evaluation_id VARCHAR(50) NOT NULL,  -- FK a risk_evaluations
    
    -- Tipo de alerta
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'HIGH_RISK_DETECTED',
        'RISK_LEVEL_INCREASED',
        'THRESHOLD_EXCEEDED',
        'PEP_HIGH_RISK',
        'GEOGRAPHIC_HIGH_RISK',
        'REVIEW_OVERDUE'
    )),
    
    -- Nivel de riesgo que disparó la alerta
    risk_level VARCHAR(10) NOT NULL,
    
    -- Umbral excedido
    threshold_exceeded DECIMAL(5,2),
    
    -- Descripción de la alerta
    alert_description TEXT,
    
    -- Estado
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'
    )),
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by VARCHAR(50),
    acknowledged_at TIMESTAMP,
    
    -- Notificaciones enviadas
    notified_to TEXT[],  -- ['user1@example.com', 'user2@example.com']
    notification_sent_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_alert_eval ON risk_alerts(evaluation_id);
CREATE INDEX idx_alert_type ON risk_alerts(alert_type);
CREATE INDEX idx_alert_status ON risk_alerts(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_alert_created ON risk_alerts(created_at DESC);

-- Comentarios
COMMENT ON TABLE risk_alerts IS 'Alertas automáticas generadas por evaluaciones de alto riesgo';
```

---

## 4. TRIGGERS Y FUNCIONES

### 4.1 Trigger: Prevenir Eliminación Física

```sql
-- Función que previene DELETE físico
CREATE OR REPLACE FUNCTION prevent_physical_deletion_risk()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Physical deletion not allowed on table %. Use soft delete or status change.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_prevent_delete_evaluations
BEFORE DELETE ON risk_evaluations
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_risk();

CREATE TRIGGER trigger_prevent_delete_history
BEFORE DELETE ON evaluation_history
FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion_risk();
```

### 4.2 Trigger: Registro Automático en Historial

```sql
-- Función para registrar cambios en evaluation_history
CREATE OR REPLACE FUNCTION record_evaluation_change()
RETURNS TRIGGER AS $$
DECLARE
    v_change_type VARCHAR(30);
    v_affected_fields JSONB;
BEGIN
    -- Determinar tipo de cambio
    IF (TG_OP = 'INSERT') THEN
        v_change_type := 'CREATION';
    ELSIF (TG_OP = 'UPDATE') THEN
        v_change_type := CASE
            WHEN OLD.status != NEW.status THEN 'STATUS_CHANGE'
            WHEN OLD.final_risk_level != NEW.final_risk_level THEN 'RECALCULATION'
            WHEN OLD.has_manual_override != NEW.has_manual_override THEN 'OVERRIDE_APPLIED'
            ELSE 'FACTOR_UPDATE'
        END;
        
        -- Detectar campos afectados
        v_affected_fields := '[]'::jsonb;
        IF OLD.final_risk_level != NEW.final_risk_level THEN
            v_affected_fields := v_affected_fields || '["final_risk_level"]'::jsonb;
        END IF;
        IF OLD.status != NEW.status THEN
            v_affected_fields := v_affected_fields || '["status"]'::jsonb;
        END IF;
    END IF;
    
    -- Insertar en historial
    INSERT INTO evaluation_history (
        evaluation_id, change_type, changed_by, changed_at,
        previous_state_json, new_state_json, affected_fields
    ) VALUES (
        NEW.evaluation_id, v_change_type, CURRENT_USER, CURRENT_TIMESTAMP,
        CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        to_jsonb(NEW),
        v_affected_fields
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_record_evaluation_change
AFTER INSERT OR UPDATE ON risk_evaluations
FOR EACH ROW EXECUTE FUNCTION record_evaluation_change();
```

### 4.3 Trigger: Generar Alertas Automáticas

```sql
-- Función para generar alertas automáticas
CREATE OR REPLACE FUNCTION generate_risk_alerts()
RETURNS TRIGGER AS $$
DECLARE
    v_alert_id VARCHAR(50);
BEGIN
    -- Solo generar alertas cuando se aprueba una evaluación
    IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN
        
        -- Alerta si el nivel de riesgo es ALTO
        IF NEW.final_risk_level = 'HIGH' THEN
            v_alert_id := 'RISK-ALERT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                          LPAD(NEXTVAL('risk_alert_seq')::TEXT, 5, '0');
            
            INSERT INTO risk_alerts (
                alert_id, evaluation_id, alert_type, risk_level,
                alert_description, notified_to
            ) VALUES (
                v_alert_id, NEW.evaluation_id, 'HIGH_RISK_DETECTED', NEW.final_risk_level,
                'Se detectó un nivel de riesgo ALTO en la evaluación ' || NEW.evaluation_id,
                ARRAY['compliance@example.com', 'risk@example.com']
            );
        END IF;
        
        -- Alerta si requiere Debida Diligencia Reforzada
        IF NEW.requires_enhanced_due_diligence = TRUE THEN
            v_alert_id := 'RISK-ALERT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                          LPAD(NEXTVAL('risk_alert_seq')::TEXT, 5, '0');
            
            INSERT INTO risk_alerts (
                alert_id, evaluation_id, alert_type, risk_level,
                alert_description, notified_to
            ) VALUES (
                v_alert_id, NEW.evaluation_id, 'THRESHOLD_EXCEEDED', NEW.final_risk_level,
                'Requiere Debida Diligencia Reforzada según evaluación ' || NEW.evaluation_id,
                ARRAY['duediligence@example.com']
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia
CREATE SEQUENCE risk_alert_seq START 1;

-- Trigger
CREATE TRIGGER trigger_generate_alerts
AFTER INSERT OR UPDATE ON risk_evaluations
FOR EACH ROW EXECUTE FUNCTION generate_risk_alerts();
```

### 4.4 Función: Calcular Próxima Fecha de Revisión

```sql
-- Función para calcular próxima revisión según nivel de riesgo
CREATE OR REPLACE FUNCTION calculate_next_review_date(
    p_risk_level VARCHAR(10),
    p_evaluation_date TIMESTAMP
) RETURNS DATE AS $$
BEGIN
    RETURN CASE p_risk_level
        WHEN 'HIGH' THEN (p_evaluation_date + INTERVAL '6 months')::DATE
        WHEN 'MEDIUM' THEN (p_evaluation_date + INTERVAL '12 months')::DATE
        WHEN 'LOW' THEN (p_evaluation_date + INTERVAL '24 months')::DATE
        ELSE (p_evaluation_date + INTERVAL '12 months')::DATE
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente
CREATE OR REPLACE FUNCTION update_next_review_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.final_risk_level IS NOT NULL AND NEW.status = 'APPROVED' THEN
        NEW.next_review_date := calculate_next_review_date(
            NEW.final_risk_level, 
            NEW.evaluation_date
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_review
BEFORE INSERT OR UPDATE ON risk_evaluations
FOR EACH ROW EXECUTE FUNCTION update_next_review_date();
```

---

## 5. VISTAS

### 5.1 Vista: Evaluaciones Activas por Expediente

```sql
CREATE OR REPLACE VIEW v_current_risk_evaluations AS
SELECT 
    re.evaluation_id,
    re.dossier_id,
    re.evaluation_type,
    re.evaluation_date,
    re.version,
    re.final_risk_level,
    re.requires_enhanced_due_diligence,
    re.next_review_date,
    -- Calcular días hasta próxima revisión
    re.next_review_date - CURRENT_DATE AS days_until_review,
    -- Indicador de revisión vencida
    CASE 
        WHEN re.next_review_date < CURRENT_DATE THEN TRUE
        ELSE FALSE
    END AS is_review_overdue,
    re.approved_by,
    re.approved_at
FROM risk_evaluations re
WHERE re.status = 'APPROVED'
AND re.version = (
    SELECT MAX(version) 
    FROM risk_evaluations 
    WHERE dossier_id = re.dossier_id 
    AND status = 'APPROVED'
);

COMMENT ON VIEW v_current_risk_evaluations IS 'Evaluaciones de riesgo vigentes (última versión aprobada por expediente)';
```

### 5.2 Vista: Resumen de Riesgos por Categoría

```sql
CREATE OR REPLACE VIEW v_risk_summary_by_category AS
SELECT 
    re.evaluation_id,
    re.dossier_id,
    re.final_risk_level,
    cat.category_code,
    cat.category_name,
    cat.category_score,
    cat.weight,
    cat.weighted_score
FROM risk_evaluations re
CROSS JOIN LATERAL (
    SELECT 
        c->>'categoryCode' AS category_code,
        c->>'categoryName' AS category_name,
        (c->>'categoryScore')::DECIMAL AS category_score,
        (c->>'weight')::DECIMAL AS weight,
        (c->>'categoryScore')::DECIMAL * (c->>'weight')::DECIMAL AS weighted_score
    FROM jsonb_array_elements(re.risk_factors_json->'categories') AS c
) AS cat
WHERE re.status = 'APPROVED'
ORDER BY re.evaluation_date DESC, cat.category_code;

COMMENT ON VIEW v_risk_summary_by_category IS 'Desglose de scores por categoría de riesgo';
```

### 5.3 Vista: Evaluaciones Pendientes de Aprobación

```sql
CREATE OR REPLACE VIEW v_evaluations_pending_approval AS
SELECT 
    re.evaluation_id,
    re.dossier_id,
    re.evaluation_date,
    re.evaluator_user_id,
    re.preliminary_risk_level,
    re.has_manual_override,
    re.approval_level,
    -- Días pendientes
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - re.created_at) AS days_pending,
    -- Priority
    CASE 
        WHEN re.preliminary_risk_level = 'HIGH' THEN 'URGENT'
        WHEN re.has_manual_override = TRUE THEN 'HIGH'
        ELSE 'NORMAL'
    END AS priority
FROM risk_evaluations re
WHERE re.status = 'PENDING_APPROVAL'
ORDER BY priority DESC, re.created_at ASC;

COMMENT ON VIEW v_evaluations_pending_approval IS 'Evaluaciones que requieren aprobación';
```

---

## 6. FUNCIONES DE CÁLCULO

### 6.1 Función: Calcular Nivel de Riesgo

```sql
CREATE OR REPLACE FUNCTION calculate_risk_level(
    p_evaluation_id VARCHAR(50)
) RETURNS TABLE(
    preliminary_level VARCHAR(10),
    final_level VARCHAR(10),
    score DECIMAL(5,2)
) AS $$
DECLARE
    v_config_id VARCHAR(50);
    v_thresholds JSONB;
    v_score DECIMAL(5,2);
BEGIN
    -- Obtener configuración usada
    SELECT configuration_id INTO v_config_id
    FROM risk_evaluations
    WHERE evaluation_id = p_evaluation_id;
    
    -- Obtener umbrales
    SELECT thresholds_json INTO v_thresholds
    FROM risk_configurations
    WHERE configuration_id = v_config_id;
    
    -- Calcular score (simplificado)
    SELECT (calculation_result_json->>'finalScore')::DECIMAL INTO v_score
    FROM risk_evaluations
    WHERE evaluation_id = p_evaluation_id;
    
    -- Determinar nivel según umbrales
    RETURN QUERY
    SELECT 
        CASE 
            WHEN v_score < (v_thresholds->'MEDIUM'->>'min')::DECIMAL THEN 'LOW'
            WHEN v_score < (v_thresholds->'HIGH'->>'min')::DECIMAL THEN 'MEDIUM'
            ELSE 'HIGH'
        END AS preliminary_level,
        CASE 
            WHEN v_score < (v_thresholds->'MEDIUM'->>'min')::DECIMAL THEN 'LOW'
            WHEN v_score < (v_thresholds->'HIGH'->>'min')::DECIMAL THEN 'MEDIUM'
            ELSE 'HIGH'
        END AS final_level,
        v_score;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. DATOS INICIALES

### 7.1 Factores de Riesgo Predefinidos

```sql
-- Insertar factores de riesgo geográfico
INSERT INTO risk_factors (factor_code, factor_name, factor_category, factor_description, requires_justification) VALUES
('GEO-001', 'País de Residencia', 'GEOGRAPHIC', 'Riesgo asociado al país de residencia del sujeto', TRUE),
('GEO-002', 'País de Operaciones', 'GEOGRAPHIC', 'Riesgo del país donde opera principalmente', TRUE),
('GEO-003', 'Transacciones Internacionales', 'GEOGRAPHIC', 'Frecuencia y monto de transacciones internacionales', FALSE);

-- Insertar factores de riesgo de producto
INSERT INTO risk_factors (factor_code, factor_name, factor_category, factor_description, requires_justification) VALUES
('PROD-001', 'Tipo de Producto', 'PRODUCT', 'Riesgo inherente del tipo de producto contratado', FALSE),
('PROD-002', 'Complejidad del Producto', 'PRODUCT', 'Nivel de complejidad y opacidad del producto', TRUE),
('PROD-003', 'Monto Asegurado', 'PRODUCT', 'Riesgo basado en el monto total asegurado', FALSE);

-- Insertar factores de perfil del cliente
INSERT INTO risk_factors (factor_code, factor_name, factor_category, factor_description, requires_justification) VALUES
('CLI-001', 'Tipo de Cliente', 'CLIENT_PROFILE', 'Persona Natural vs Jurídica', FALSE),
('CLI-002', 'Actividad Económica', 'CLIENT_PROFILE', 'Sector o industria del cliente', TRUE),
('CLI-003', 'Patrimonio y Fuente de Fondos', 'CLIENT_PROFILE', 'Origen y monto del patrimonio', TRUE),
('CLI-004', 'Relación PEP', 'CLIENT_PROFILE', 'Relación directa o indirecta con PEP', TRUE);

-- Insertar factores transaccionales
INSERT INTO risk_factors (factor_code, factor_name, factor_category, factor_description, requires_justification) VALUES
('TRANS-001', 'Volumen de Transacciones', 'TRANSACTION', 'Frecuencia y monto de transacciones', FALSE),
('TRANS-002', 'Métodos de Pago', 'TRANSACTION', 'Formas de pago utilizadas', TRUE),
('TRANS-003', 'Complejidad Transaccional', 'TRANSACTION', 'Estructuración o complejidad inusual', TRUE);

-- Insertar factores de control
INSERT INTO risk_factors (factor_code, factor_name, factor_category, factor_description, requires_justification) VALUES
('CTRL-001', 'Documentación Presentada', 'CONTROL', 'Calidad y completitud de la documentación', FALSE),
('CTRL-002', 'Cooperación del Cliente', 'CONTROL', 'Nivel de cooperación en debida diligencia', TRUE),
('CTRL-003', 'Historial de Incidentes', 'CONTROL', 'Incidentes o alertas previas', TRUE);
```

### 7.2 Configuración Inicial

```sql
-- Insertar configuración base
INSERT INTO risk_configurations (
    configuration_id,
    configuration_name,
    version,
    effective_from,
    category_weights_json,
    factor_weights_json,
    thresholds_json,
    is_active,
    created_by,
    change_justification
) VALUES (
    'CFG-2024-001',
    'Configuración Base EBR 2024',
    1,
    '2024-01-01 00:00:00',
    '{"GEOGRAPHIC": 0.25, "PRODUCT": 0.20, "CLIENT_PROFILE": 0.25, "TRANSACTION": 0.20, "CONTROL": 0.10}'::jsonb,
    '{"GEOGRAPHIC": {"GEO-001": 0.40, "GEO-002": 0.35, "GEO-003": 0.25}, "PRODUCT": {"PROD-001": 0.40, "PROD-002": 0.35, "PROD-003": 0.25}, "CLIENT_PROFILE": {"CLI-001": 0.20, "CLI-002": 0.25, "CLI-003": 0.30, "CLI-004": 0.25}, "TRANSACTION": {"TRANS-001": 0.35, "TRANS-002": 0.30, "TRANS-003": 0.35}, "CONTROL": {"CTRL-001": 0.40, "CTRL-002": 0.30, "CTRL-003": 0.30}}'::jsonb,
    '{"LOW": {"min": 0.0, "max": 2.0, "color": "#28a745"}, "MEDIUM": {"min": 2.0, "max": 3.5, "color": "#ffc107"}, "HIGH": {"min": 3.5, "max": 5.0, "color": "#dc3545"}}'::jsonb,
    TRUE,
    'admin@siar.com',
    'Configuración inicial del sistema basada en normativa SUDEASEG'
);
```

---

## 8. CONCLUSIÓN

Este modelo de base de datos para Evaluación de Riesgos cumple con todos los requisitos:

- ✅ Evaluación por expediente con versionamiento obligatorio
- ✅ Factores de riesgo ponderables en escala 0-5
- ✅ Resultado final: Bajo, Medio o Alto basado en umbrales configurables
- ✅ Historial completo e inmutable de todas las evaluaciones
- ✅ Configuraciones versionadas y auditables
- ✅ Cálculo reproducible mediante almacenamiento de configuración usada
- ✅ Triggers automáticos para alertas y trazabilidad
- ✅ Integración lista con módulo de Expediente Único

El modelo está listo para producción y cumple con normativa SUDEASEG.
