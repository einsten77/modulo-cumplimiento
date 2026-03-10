# SIAR - Modelo de Base de Datos: Módulo de Screening

## 1. Descripción General

Este documento define el modelo de base de datos relacional para el **Módulo de Screening** del Sistema Integrado Antilavado de Activos y Riesgos (SIAR). El módulo permite la consulta automatizada contra listas restrictivas nacionales e internacionales (sanciones, PEP, terroristas, etc.), con registro completo de ejecuciones, resultados y decisiones del Oficial de Cumplimiento.

### 1.1 Principios de Diseño

- **Trazabilidad total**: Historial completo de todas las ejecuciones de screening
- **No eliminación física**: Soft deletes mediante campos `is_active` o `deleted_at`
- **Inmutabilidad de resultados**: Los resultados de screening no se modifican una vez creados
- **Auditoría exhaustiva**: Integración con el módulo de auditoría
- **Evidencia regulatoria**: Toda decisión debe estar justificada y documentada
- **Asociación a expediente**: Todo screening está vinculado a un expediente

### 1.2 Alcance del Modelo

El modelo cubre:
- Gestión de listas restrictivas (watchlists)
- Ejecución de screenings automáticos, manuales y periódicos
- Registro de coincidencias (matches) con porcentajes de similitud
- Decisiones del Oficial de Cumplimiento sobre cada coincidencia
- Historial completo de screenings por expediente
- Métricas y reportes de compliance

---

## 2. Diagrama Entidad-Relación

```
┌─────────────────┐
│    DOSSIER      │
│  (Expediente)   │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│   SCREENING     │◄────────────┐
│  (Ejecución)    │             │
└────────┬────────┘             │
         │                      │
         │ 1:N                  │
         │                      │
┌────────▼────────────┐         │
│  SCREENING_RESULT   │         │ N:1
│  (Resultado x Lista)│         │
└────────┬────────────┘         │
         │                      │
         │ N:1                  │
         │                 ┌────┴────────┐
┌────────▼────────┐        │  WATCHLIST  │
│     MATCH       │        │   (Lista)   │
│ (Coincidencia)  │        └────┬────────┘
└────────┬────────┘             │
         │                      │ 1:N
         │ 1:1                  │
         │                 ┌────▼────────────┐
┌────────▼─────────────┐   │ WATCHLIST_ENTRY │
│ SCREENING_DECISION   │   │   (Entrada)     │
│    (Decisión)        │   └─────────────────┘
└──────────────────────┘
```

---

## 3. Definición de Tablas

### 3.1 Tabla: `watchlist` (Listas Restrictivas)

Catálogo de listas restrictivas nacionales e internacionales.

```sql
CREATE TABLE watchlist (
    -- Identificación
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    source VARCHAR(100) NOT NULL,
    
    -- Clasificación
    list_type VARCHAR(50) NOT NULL,
    jurisdiction VARCHAR(100),
    description TEXT,
    source_url VARCHAR(500),
    
    -- Control de actualizaciones
    update_frequency VARCHAR(20) NOT NULL,
    last_update_date TIMESTAMPTZ,
    next_scheduled_update TIMESTAMPTZ,
    
    -- Estado y prioridad
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority VARCHAR(20) NOT NULL,
    
    -- Metadatos
    total_entries INTEGER,
    version VARCHAR(50),
    checksum_md5 VARCHAR(32),
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_watchlist_list_type CHECK (
        list_type IN ('SANCTIONS', 'PEP', 'TERRORIST', 'CRIMINAL', 'ADVERSE_MEDIA', 'OTHER')
    ),
    CONSTRAINT chk_watchlist_update_frequency CHECK (
        update_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'MANUAL')
    ),
    CONSTRAINT chk_watchlist_priority CHECK (
        priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
    )
);

-- Índices
CREATE INDEX idx_watchlist_code ON watchlist(code);
CREATE INDEX idx_watchlist_active ON watchlist(is_active);
CREATE INDEX idx_watchlist_priority ON watchlist(priority);
CREATE INDEX idx_watchlist_list_type ON watchlist(list_type);
CREATE INDEX idx_watchlist_next_update ON watchlist(next_scheduled_update) WHERE is_active = true;

-- Comentarios
COMMENT ON TABLE watchlist IS 'Catálogo de listas restrictivas nacionales e internacionales';
COMMENT ON COLUMN watchlist.list_type IS 'Tipo de lista: SANCTIONS, PEP, TERRORIST, CRIMINAL, ADVERSE_MEDIA, OTHER';
COMMENT ON COLUMN watchlist.priority IS 'Prioridad de consulta: CRITICAL, HIGH, MEDIUM, LOW';
COMMENT ON COLUMN watchlist.checksum_md5 IS 'Hash MD5 para verificar integridad de la lista';
```

### 3.2 Tabla: `watchlist_entry` (Entradas de Listas)

Registros individuales dentro de cada lista restrictiva.

```sql
CREATE TABLE watchlist_entry (
    -- Identificación
    id BIGSERIAL PRIMARY KEY,
    watchlist_id BIGINT NOT NULL REFERENCES watchlist(id),
    
    -- Datos de la entidad
    entity_type VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    aliases JSONB,
    document VARCHAR(100),
    
    -- Datos adicionales persona
    date_of_birth DATE,
    nationality VARCHAR(3),
    country VARCHAR(100),
    address TEXT,
    
    -- Información de sanción
    sanction_program VARCHAR(100),
    sanction_date DATE,
    remarks TEXT,
    additional_info JSONB,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_entry_entity_type CHECK (
        entity_type IN ('PERSON', 'COMPANY', 'VESSEL', 'AIRCRAFT', 'OTHER')
    )
);

-- Índices
CREATE INDEX idx_entry_watchlist ON watchlist_entry(watchlist_id);
CREATE INDEX idx_entry_entity_type ON watchlist_entry(entity_type);
CREATE INDEX idx_entry_name ON watchlist_entry USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_entry_active ON watchlist_entry(is_active);
CREATE INDEX idx_entry_aliases ON watchlist_entry USING gin(aliases);

-- Comentarios
COMMENT ON TABLE watchlist_entry IS 'Entradas individuales de cada lista restrictiva';
COMMENT ON COLUMN watchlist_entry.entity_type IS 'Tipo de entidad: PERSON, COMPANY, VESSEL, AIRCRAFT, OTHER';
COMMENT ON COLUMN watchlist_entry.aliases IS 'Array JSON de nombres alternativos o alias';
COMMENT ON COLUMN watchlist_entry.additional_info IS 'Información adicional en formato JSON';
```

### 3.3 Tabla: `screening` (Ejecución de Screening)

Registro de cada ejecución de screening contra listas restrictivas.

```sql
CREATE TABLE screening (
    -- Identificación
    id BIGSERIAL PRIMARY KEY,
    dossier_id BIGINT NOT NULL REFERENCES dossier(id),
    
    -- Tipo de screening
    screening_type VARCHAR(20) NOT NULL,
    execution_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos de la entidad consultada
    screened_entity_name VARCHAR(500) NOT NULL,
    screened_entity_type VARCHAR(50) NOT NULL,
    screened_entity_document VARCHAR(100),
    
    -- Estado y resultados
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_lists_checked INTEGER,
    total_matches_found INTEGER,
    has_relevant_matches BOOLEAN,
    overall_result VARCHAR(30),
    
    -- Ejecución
    executed_by BIGINT NOT NULL REFERENCES users(id),
    execution_duration_ms BIGINT,
    error_message TEXT,
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_screening_type CHECK (
        screening_type IN ('AUTO', 'MANUAL', 'PERIODIC')
    ),
    CONSTRAINT chk_screening_status CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR', 'CANCELLED')
    ),
    CONSTRAINT chk_screening_entity_type CHECK (
        screened_entity_type IN ('PERSON', 'COMPANY', 'VESSEL', 'AIRCRAFT', 'OTHER')
    ),
    CONSTRAINT chk_screening_overall_result CHECK (
        overall_result IN ('CLEAR', 'REVIEW_REQUIRED', 'HIGH_RISK', 'BLOCKED')
    )
);

-- Índices
CREATE INDEX idx_screening_dossier ON screening(dossier_id);
CREATE INDEX idx_screening_execution_date ON screening(execution_date DESC);
CREATE INDEX idx_screening_status ON screening(status);
CREATE INDEX idx_screening_has_matches ON screening(has_relevant_matches);
CREATE INDEX idx_screening_executed_by ON screening(executed_by);
CREATE INDEX idx_screening_type ON screening(screening_type);
CREATE INDEX idx_screening_dossier_date ON screening(dossier_id, execution_date DESC);

-- Comentarios
COMMENT ON TABLE screening IS 'Registro de cada ejecución de screening contra listas restrictivas';
COMMENT ON COLUMN screening.screening_type IS 'AUTO: automático al crear expediente, MANUAL: bajo demanda, PERIODIC: programado';
COMMENT ON COLUMN screening.status IS 'Estado de la ejecución: PENDING, IN_PROGRESS, COMPLETED, ERROR, CANCELLED';
COMMENT ON COLUMN screening.has_relevant_matches IS 'True si tiene coincidencias que requieren revisión';
COMMENT ON COLUMN screening.overall_result IS 'CLEAR, REVIEW_REQUIRED, HIGH_RISK, BLOCKED';
```

### 3.4 Tabla: `screening_result` (Resultado por Lista)

Resultado de consulta contra cada lista individual.

```sql
CREATE TABLE screening_result (
    -- Identificación
    id BIGSERIAL PRIMARY KEY,
    screening_id BIGINT NOT NULL REFERENCES screening(id),
    watchlist_id BIGINT NOT NULL REFERENCES watchlist(id),
    
    -- Datos de la lista
    watchlist_name VARCHAR(200) NOT NULL,
    
    -- Resultados
    total_entries_checked INTEGER NOT NULL,
    matches_found INTEGER NOT NULL DEFAULT 0,
    execution_time_ms BIGINT,
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_result_screening ON screening_result(screening_id);
CREATE INDEX idx_result_watchlist ON screening_result(watchlist_id);
CREATE INDEX idx_result_matches ON screening_result(matches_found) WHERE matches_found > 0;

-- Comentarios
COMMENT ON TABLE screening_result IS 'Resultado de consulta contra cada lista restrictiva individual';
COMMENT ON COLUMN screening_result.matches_found IS 'Número de coincidencias encontradas en esta lista';
```

### 3.5 Tabla: `match` (Coincidencias)

Registro de cada coincidencia encontrada con porcentaje de similitud.

```sql
CREATE TABLE match (
    -- Identificación
    id BIGSERIAL PRIMARY KEY,
    screening_result_id BIGINT NOT NULL REFERENCES screening_result(id),
    watchlist_entry_id BIGINT NOT NULL REFERENCES watchlist_entry(id),
    
    -- Datos comparados
    screened_name VARCHAR(500) NOT NULL,
    matched_name VARCHAR(500) NOT NULL,
    
    -- Análisis de similitud
    similarity_score NUMERIC(5,2) NOT NULL,
    is_relevant BOOLEAN NOT NULL DEFAULT false,
    match_type VARCHAR(20) NOT NULL,
    
    -- Detalles de la coincidencia
    matched_fields JSONB,
    additional_info JSONB,
    
    -- Estado
    requires_review BOOLEAN NOT NULL DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_match_similarity CHECK (similarity_score BETWEEN 0 AND 100),
    CONSTRAINT chk_match_type CHECK (
        match_type IN ('EXACT', 'HIGH', 'MEDIUM', 'LOW')
    )
);

-- Índices
CREATE INDEX idx_match_screening_result ON match(screening_result_id);
CREATE INDEX idx_match_watchlist_entry ON match(watchlist_entry_id);
CREATE INDEX idx_match_similarity ON match(similarity_score DESC);
CREATE INDEX idx_match_requires_review ON match(requires_review);
CREATE INDEX idx_match_relevant ON match(is_relevant);
CREATE INDEX idx_match_type ON match(match_type);

-- Comentarios
COMMENT ON TABLE match IS 'Registro de cada coincidencia encontrada en el screening';
COMMENT ON COLUMN match.similarity_score IS 'Porcentaje de similitud (0-100) calculado con Jaro-Winkler';
COMMENT ON COLUMN match.is_relevant IS 'True si el porcentaje supera el umbral de relevancia';
COMMENT ON COLUMN match.match_type IS 'EXACT: 100%, HIGH: 95-99%, MEDIUM: 75-94%, LOW: <75%';
COMMENT ON COLUMN match.matched_fields IS 'JSON con campos que coincidieron (nombre, documento, fecha nacimiento, etc.)';
COMMENT ON COLUMN match.requires_review IS 'True si requiere revisión por Oficial de Cumplimiento';
```

### 3.6 Tabla: `screening_decision` (Decisión del Oficial)

Decisión del Oficial de Cumplimiento sobre cada coincidencia relevante.

```sql
CREATE TABLE screening_decision (
    -- Identificación
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL UNIQUE REFERENCES match(id),
    screening_id BIGINT NOT NULL REFERENCES screening(id),
    
    -- Decisión
    decision VARCHAR(30) NOT NULL,
    justification TEXT NOT NULL,
    
    -- Quién y cuándo
    decided_by BIGINT NOT NULL REFERENCES users(id),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Escalamiento
    requires_escalation BOOLEAN DEFAULT false,
    escalated_to BIGINT REFERENCES users(id),
    escalation_reason TEXT,
    
    -- Impacto
    impact_on_risk BOOLEAN DEFAULT false,
    requires_enhanced_due_diligence BOOLEAN DEFAULT false,
    
    -- Adjuntos
    attachments JSONB,
    
    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_decision_type CHECK (
        decision IN ('FALSE_POSITIVE', 'TRUE_MATCH', 'ESCALATE', 'PENDING_INFO')
    ),
    CONSTRAINT chk_decision_escalation CHECK (
        (requires_escalation = false) OR 
        (requires_escalation = true AND escalated_to IS NOT NULL AND escalation_reason IS NOT NULL)
    )
);

-- Índices
CREATE INDEX idx_decision_match ON screening_decision(match_id);
CREATE INDEX idx_decision_screening ON screening_decision(screening_id);
CREATE INDEX idx_decision_decided_by ON screening_decision(decided_by);
CREATE INDEX idx_decision_decided_at ON screening_decision(decided_at DESC);
CREATE INDEX idx_decision_type ON screening_decision(decision);
CREATE INDEX idx_decision_escalation ON screening_decision(requires_escalation) WHERE requires_escalation = true;
CREATE INDEX idx_decision_enhanced_dd ON screening_decision(requires_enhanced_due_diligence) WHERE requires_enhanced_due_diligence = true;

-- Comentarios
COMMENT ON TABLE screening_decision IS 'Decisión del Oficial de Cumplimiento sobre cada coincidencia';
COMMENT ON COLUMN screening_decision.decision IS 'FALSE_POSITIVE: no es la misma entidad, TRUE_MATCH: confirmado, ESCALATE: requiere escalamiento, PENDING_INFO: pendiente información';
COMMENT ON COLUMN screening_decision.justification IS 'Justificación obligatoria de la decisión tomada';
COMMENT ON COLUMN screening_decision.impact_on_risk IS 'True si la decisión afecta la evaluación de riesgo';
COMMENT ON COLUMN screening_decision.attachments IS 'JSON con evidencias adjuntas (documentos, capturas, URLs)';
```

---

## 4. Restricciones de Integridad

### 4.1 Claves Foráneas

```sql
-- Relaciones principales
ALTER TABLE watchlist_entry ADD CONSTRAINT fk_entry_watchlist 
    FOREIGN KEY (watchlist_id) REFERENCES watchlist(id);

ALTER TABLE screening ADD CONSTRAINT fk_screening_dossier 
    FOREIGN KEY (dossier_id) REFERENCES dossier(id);

ALTER TABLE screening ADD CONSTRAINT fk_screening_executed_by 
    FOREIGN KEY (executed_by) REFERENCES users(id);

ALTER TABLE screening_result ADD CONSTRAINT fk_result_screening 
    FOREIGN KEY (screening_id) REFERENCES screening(id);

ALTER TABLE screening_result ADD CONSTRAINT fk_result_watchlist 
    FOREIGN KEY (watchlist_id) REFERENCES watchlist(id);

ALTER TABLE match ADD CONSTRAINT fk_match_screening_result 
    FOREIGN KEY (screening_result_id) REFERENCES screening_result(id);

ALTER TABLE match ADD CONSTRAINT fk_match_watchlist_entry 
    FOREIGN KEY (watchlist_entry_id) REFERENCES watchlist_entry(id);

ALTER TABLE screening_decision ADD CONSTRAINT fk_decision_match 
    FOREIGN KEY (match_id) REFERENCES match(id);

ALTER TABLE screening_decision ADD CONSTRAINT fk_decision_screening 
    FOREIGN KEY (screening_id) REFERENCES screening(id);

ALTER TABLE screening_decision ADD CONSTRAINT fk_decision_decided_by 
    FOREIGN KEY (decided_by) REFERENCES users(id);

ALTER TABLE screening_decision ADD CONSTRAINT fk_decision_escalated_to 
    FOREIGN KEY (escalated_to) REFERENCES users(id);
```

### 4.2 Reglas de Negocio (Constraints)

```sql
-- Una coincidencia solo puede tener una decisión
CREATE UNIQUE INDEX idx_decision_match_unique ON screening_decision(match_id);

-- Watchlist code debe ser único
CREATE UNIQUE INDEX idx_watchlist_code_unique ON watchlist(code);

-- No puede haber screening sin expediente
ALTER TABLE screening ALTER COLUMN dossier_id SET NOT NULL;

-- Decisión solo para matches relevantes
ALTER TABLE screening_decision ADD CONSTRAINT chk_decision_relevant_match
    CHECK EXISTS (SELECT 1 FROM match WHERE id = match_id AND is_relevant = true);
```

---

## 5. Triggers y Funciones

### 5.1 Trigger: Actualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas relevantes
CREATE TRIGGER trg_watchlist_updated_at
    BEFORE UPDATE ON watchlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_watchlist_entry_updated_at
    BEFORE UPDATE ON watchlist_entry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_screening_updated_at
    BEFORE UPDATE ON screening
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_screening_decision_updated_at
    BEFORE UPDATE ON screening_decision
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Trigger: Registrar Auditoría de Decisiones

```sql
CREATE OR REPLACE FUNCTION audit_screening_decision()
RETURNS TRIGGER AS $$
DECLARE
    v_screening_data JSONB;
    v_match_data JSONB;
BEGIN
    -- Obtener datos del screening y match
    SELECT jsonb_build_object(
        'screening_id', s.id,
        'dossier_id', s.dossier_id,
        'screening_type', s.screening_type
    ) INTO v_screening_data
    FROM screening s WHERE s.id = NEW.screening_id;
    
    SELECT jsonb_build_object(
        'match_id', m.id,
        'similarity_score', m.similarity_score,
        'matched_name', m.matched_name
    ) INTO v_match_data
    FROM match m WHERE m.id = NEW.match_id;
    
    -- Registrar en auditoría
    INSERT INTO audit_log (
        event_category,
        action_type,
        user_id,
        user_role,
        resource_type,
        resource_id,
        dossier_id,
        action_description,
        before_state,
        after_state,
        ip_address,
        user_agent
    ) VALUES (
        'SCREENING',
        'SCREENING_DECISION',
        NEW.decided_by,
        (SELECT role_type FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = NEW.decided_by LIMIT 1),
        'SCREENING_DECISION',
        NEW.id,
        (SELECT dossier_id FROM screening WHERE id = NEW.screening_id),
        format('Decisión de screening: %s', NEW.decision),
        v_screening_data || v_match_data,
        jsonb_build_object(
            'decision', NEW.decision,
            'justification', NEW.justification,
            'requires_escalation', NEW.requires_escalation,
            'impact_on_risk', NEW.impact_on_risk,
            'requires_enhanced_due_diligence', NEW.requires_enhanced_due_diligence
        ),
        inet_client_addr(),
        current_setting('application.user_agent', true)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_screening_decision
    AFTER INSERT ON screening_decision
    FOR EACH ROW EXECUTE FUNCTION audit_screening_decision();
```

### 5.3 Trigger: Actualizar Contador de Matches en Screening

```sql
CREATE OR REPLACE FUNCTION update_screening_matches_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar total_matches_found y has_relevant_matches
    UPDATE screening
    SET 
        total_matches_found = (
            SELECT COUNT(*)
            FROM match m
            JOIN screening_result sr ON m.screening_result_id = sr.id
            WHERE sr.screening_id = NEW.screening_id
        ),
        has_relevant_matches = EXISTS (
            SELECT 1
            FROM match m
            JOIN screening_result sr ON m.screening_result_id = sr.id
            WHERE sr.screening_id = NEW.screening_id AND m.is_relevant = true
        )
    WHERE id = NEW.screening_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_screening_matches
    AFTER INSERT ON match
    FOR EACH ROW EXECUTE FUNCTION update_screening_matches_count();
```

### 5.4 Función: Calcular Match Type por Similarity Score

```sql
CREATE OR REPLACE FUNCTION calculate_match_type(p_similarity_score NUMERIC)
RETURNS VARCHAR AS $$
BEGIN
    IF p_similarity_score = 100 THEN
        RETURN 'EXACT';
    ELSIF p_similarity_score >= 95 THEN
        RETURN 'HIGH';
    ELSIF p_similarity_score >= 75 THEN
        RETURN 'MEDIUM';
    ELSE
        RETURN 'LOW';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 5.5 Prevención de Eliminación Física

```sql
-- No se permite DELETE en tablas críticas
CREATE OR REPLACE FUNCTION prevent_physical_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Eliminación física no permitida. Use soft delete (is_active = false)';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_screening_delete
    BEFORE DELETE ON screening
    FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion();

CREATE TRIGGER trg_prevent_screening_decision_delete
    BEFORE DELETE ON screening_decision
    FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion();

CREATE TRIGGER trg_prevent_match_delete
    BEFORE DELETE ON match
    FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion();
```

---

## 6. Vistas

### 6.1 Vista: Screenings con Resumen

```sql
CREATE OR REPLACE VIEW v_screening_summary AS
SELECT 
    s.id AS screening_id,
    s.dossier_id,
    d.entity_name AS dossier_entity_name,
    s.screening_type,
    s.screened_entity_name,
    s.execution_date,
    s.status,
    s.total_lists_checked,
    s.total_matches_found,
    s.has_relevant_matches,
    s.overall_result,
    u.full_name AS executed_by_name,
    s.execution_duration_ms,
    
    -- Contadores de decisiones
    COUNT(sd.id) FILTER (WHERE sd.decision = 'TRUE_MATCH') AS true_matches,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'FALSE_POSITIVE') AS false_positives,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'ESCALATE') AS escalations,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'PENDING_INFO') AS pending_decisions,
    
    -- Matches sin decisión
    COUNT(m.id) FILTER (WHERE m.is_relevant = true AND sd.id IS NULL) AS pending_review,
    
    s.created_at
FROM screening s
JOIN dossier d ON s.dossier_id = d.id
JOIN users u ON s.executed_by = u.id
LEFT JOIN screening_result sr ON s.id = sr.screening_id
LEFT JOIN match m ON sr.id = m.screening_result_id
LEFT JOIN screening_decision sd ON m.id = sd.match_id
GROUP BY s.id, d.entity_name, u.full_name;

COMMENT ON VIEW v_screening_summary IS 'Vista con resumen completo de cada screening';
```

### 6.2 Vista: Matches Pendientes de Revisión

```sql
CREATE OR REPLACE VIEW v_pending_screening_matches AS
SELECT 
    m.id AS match_id,
    s.id AS screening_id,
    s.dossier_id,
    d.entity_name AS dossier_entity_name,
    s.execution_date,
    m.screened_name,
    m.matched_name,
    m.similarity_score,
    m.match_type,
    we.entity_type AS watchlist_entity_type,
    w.name AS watchlist_name,
    w.list_type,
    w.priority AS watchlist_priority,
    m.matched_fields,
    m.created_at AS match_created_at
FROM match m
JOIN screening_result sr ON m.screening_result_id = sr.id
JOIN screening s ON sr.screening_id = s.id
JOIN dossier d ON s.dossier_id = d.id
JOIN watchlist_entry we ON m.watchlist_entry_id = we.id
JOIN watchlist w ON we.watchlist_id = w.id
WHERE m.is_relevant = true
  AND m.requires_review = true
  AND NOT EXISTS (
      SELECT 1 FROM screening_decision sd WHERE sd.match_id = m.id
  )
ORDER BY w.priority, m.similarity_score DESC;

COMMENT ON VIEW v_pending_screening_matches IS 'Coincidencias relevantes pendientes de decisión';
```

### 6.3 Vista: Dashboard de Compliance

```sql
CREATE OR REPLACE VIEW v_screening_compliance_dashboard AS
SELECT 
    COUNT(DISTINCT s.id) AS total_screenings,
    COUNT(DISTINCT s.dossier_id) AS unique_dossiers_screened,
    COUNT(DISTINCT s.id) FILTER (WHERE s.screening_type = 'AUTO') AS auto_screenings,
    COUNT(DISTINCT s.id) FILTER (WHERE s.screening_type = 'MANUAL') AS manual_screenings,
    COUNT(DISTINCT s.id) FILTER (WHERE s.screening_type = 'PERIODIC') AS periodic_screenings,
    
    -- Resultados
    COUNT(DISTINCT s.id) FILTER (WHERE s.has_relevant_matches = true) AS screenings_with_matches,
    COUNT(DISTINCT s.id) FILTER (WHERE s.overall_result = 'HIGH_RISK') AS high_risk_screenings,
    COUNT(DISTINCT s.id) FILTER (WHERE s.overall_result = 'BLOCKED') AS blocked_screenings,
    
    -- Matches
    COUNT(m.id) AS total_matches,
    COUNT(m.id) FILTER (WHERE m.is_relevant = true) AS relevant_matches,
    COUNT(m.id) FILTER (WHERE m.match_type = 'EXACT') AS exact_matches,
    COUNT(m.id) FILTER (WHERE m.match_type = 'HIGH') AS high_similarity_matches,
    
    -- Decisiones
    COUNT(sd.id) AS total_decisions,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'TRUE_MATCH') AS confirmed_matches,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'FALSE_POSITIVE') AS false_positives,
    COUNT(sd.id) FILTER (WHERE sd.requires_escalation = true) AS escalated_cases,
    COUNT(sd.id) FILTER (WHERE sd.requires_enhanced_due_diligence = true) AS enhanced_dd_required,
    
    -- Pendientes
    COUNT(m.id) FILTER (
        WHERE m.is_relevant = true 
        AND NOT EXISTS (SELECT 1 FROM screening_decision WHERE match_id = m.id)
    ) AS pending_review,
    
    -- Últimos 30 días
    COUNT(DISTINCT s.id) FILTER (
        WHERE s.execution_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    ) AS screenings_last_30_days,
    
    COUNT(sd.id) FILTER (
        WHERE sd.decided_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    ) AS decisions_last_30_days
    
FROM screening s
LEFT JOIN screening_result sr ON s.id = sr.screening_id
LEFT JOIN match m ON sr.id = m.screening_result_id
LEFT JOIN screening_decision sd ON m.id = sd.match_id;

COMMENT ON VIEW v_screening_compliance_dashboard IS 'Dashboard con métricas de compliance de screening';
```

---

## 7. Consideraciones de Seguridad

### 7.1 Row Level Security (RLS)

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE screening ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE match ENABLE ROW LEVEL SECURITY;

-- Política: Solo Compliance Officers pueden ver decisiones
CREATE POLICY screening_decision_compliance_only ON screening_decision
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.current_user_id')::BIGINT
            AND r.role_type IN ('COMPLIANCE_OFFICER', 'COMPLIANCE_MANAGER', 'ADMIN')
        )
    );

-- Política: Usuarios pueden ver screenings de sus expedientes
CREATE POLICY screening_by_dossier ON screening
    FOR SELECT
    USING (
        dossier_id IN (
            SELECT id FROM dossier 
            WHERE assigned_to = current_setting('app.current_user_id')::BIGINT
        )
        OR EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = current_setting('app.current_user_id')::BIGINT
            AND r.role_type IN ('COMPLIANCE_OFFICER', 'COMPLIANCE_MANAGER', 'ADMIN')
        )
    );
```

### 7.2 Permisos por Rol

```sql
-- Analista Riesgo: puede ejecutar screenings
GRANT SELECT, INSERT ON screening TO analista_riesgo;
GRANT SELECT ON screening_result, match, watchlist, watchlist_entry TO analista_riesgo;

-- Oficial Cumplimiento: puede tomar decisiones
GRANT SELECT, INSERT, UPDATE ON screening_decision TO oficial_cumplimiento;
GRANT SELECT ON screening, match, screening_result TO oficial_cumplimiento;

-- Auditor: solo lectura
GRANT SELECT ON ALL TABLES IN SCHEMA public TO auditor;

-- Admin: acceso completo
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
```

---

## 8. Datos de Ejemplo

### 8.1 Listas Restrictivas

```sql
-- OFAC SDN List
INSERT INTO watchlist (name, code, source, list_type, jurisdiction, description, update_frequency, is_active, priority, source_url) VALUES
('OFAC Specially Designated Nationals', 'OFAC-SDN', 'US Office of Foreign Assets Control', 'SANCTIONS', 'USA', 'Lista de personas y entidades sancionadas por Estados Unidos', 'WEEKLY', true, 'CRITICAL', 'https://www.treasury.gov/ofac/downloads/sdnlist.pdf'),
('EU Consolidated Sanctions List', 'EU-CONS', 'European Union', 'SANCTIONS', 'EU', 'Lista consolidada de sanciones de la Unión Europea', 'DAILY', true, 'CRITICAL', 'https://webgate.ec.europa.eu/fsd/fsf'),
('UN Consolidated Sanctions List', 'UN-CONS', 'United Nations', 'SANCTIONS', 'GLOBAL', 'Lista consolidada de sanciones de Naciones Unidas', 'MONTHLY', true, 'HIGH', 'https://www.un.org/securitycouncil/content/un-sc-consolidated-list'),
('Interpol Red Notices', 'INTERPOL-RED', 'Interpol', 'CRIMINAL', 'GLOBAL', 'Personas buscadas internacionalmente', 'DAILY', true, 'HIGH', 'https://www.interpol.int/en/How-we-work/Notices/Red-Notices'),
('PEP Panama Database', 'PEP-PA', 'SUDEASEG', 'PEP', 'PANAMA', 'Base de datos de PEP de Panamá', 'MONTHLY', true, 'MEDIUM', null);
```

### 8.2 Ejecución de Screening

```sql
-- Screening automático al crear expediente
INSERT INTO screening (dossier_id, screening_type, screened_entity_name, screened_entity_type, status, executed_by) VALUES
(1, 'AUTO', 'ACME Corporation S.A.', 'COMPANY', 'COMPLETED', 1);

-- Screening manual bajo demanda
INSERT INTO screening (dossier_id, screening_type, screened_entity_name, screened_entity_type, status, executed_by) VALUES
(2, 'MANUAL', 'John Doe', 'PERSON', 'COMPLETED', 2);
```

---

## 9. Mantenimiento y Performance

### 9.1 Particionamiento (Recomendado)

Para alto volumen, considerar particionar por fecha:

```sql
-- Particionar screening por año
CREATE TABLE screening (
    -- ... columnas ...
) PARTITION BY RANGE (execution_date);

CREATE TABLE screening_2024 PARTITION OF screening
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE screening_2025 PARTITION OF screening
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 9.2 Limpieza de Datos Antiguos

```sql
-- Archivar screenings antiguos sin matches relevantes
CREATE TABLE screening_archive (LIKE screening INCLUDING ALL);

-- Procedimiento de archivado
CREATE OR REPLACE FUNCTION archive_old_screenings()
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    WITH archived AS (
        DELETE FROM screening
        WHERE execution_date < CURRENT_DATE - INTERVAL '2 years'
          AND has_relevant_matches = false
        RETURNING *
    )
    INSERT INTO screening_archive SELECT * FROM archived;
    
    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;
```

### 9.3 Índices de Performance

```sql
-- Índice compuesto para búsqueda de pendientes
CREATE INDEX idx_match_pending_review 
ON match(screening_result_id, is_relevant, requires_review)
WHERE is_relevant = true AND requires_review = true;

-- Índice para búsqueda full-text en nombres
CREATE INDEX idx_entry_name_trgm ON watchlist_entry USING gin(name gin_trgm_ops);

-- Índice para búsqueda por similitud
CREATE INDEX idx_match_high_similarity ON match(similarity_score DESC)
WHERE similarity_score >= 75;
```

---

## 10. Integraciones

### 10.1 Integración con Módulo de Riesgo

```sql
-- Trigger: Notificar al módulo de riesgo cuando hay TRUE_MATCH
CREATE OR REPLACE FUNCTION notify_risk_on_true_match()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.decision = 'TRUE_MATCH' THEN
        -- Crear alerta de riesgo
        INSERT INTO risk_alert (
            dossier_id,
            alert_type,
            severity,
            description,
            source_module,
            source_reference_id
        )
        SELECT 
            s.dossier_id,
            'SCREENING_TRUE_MATCH',
            'CRITICAL',
            format('Match confirmado en screening: %s', m.matched_name),
            'SCREENING',
            NEW.screening_id
        FROM screening s
        JOIN screening_result sr ON s.id = sr.screening_id
        JOIN match m ON sr.id = m.screening_result_id
        WHERE m.id = NEW.match_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_risk_on_true_match
    AFTER INSERT OR UPDATE ON screening_decision
    FOR EACH ROW 
    WHEN (NEW.decision = 'TRUE_MATCH')
    EXECUTE FUNCTION notify_risk_on_true_match();
```

### 10.2 Integración con Módulo de Alertas

```sql
-- Trigger: Crear alerta cuando hay matches relevantes
CREATE OR REPLACE FUNCTION create_alert_on_relevant_match()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_relevant = true THEN
        INSERT INTO alert (
            origin_module,
            alert_level,
            title,
            description,
            dossier_id,
            assigned_to,
            reference_id
        )
        SELECT 
            'SCREENING',
            CASE 
                WHEN NEW.match_type = 'EXACT' THEN 'CRITICAL'
                WHEN NEW.match_type = 'HIGH' THEN 'HIGH'
                ELSE 'MEDIUM'
            END,
            'Match en Screening Requiere Revisión',
            format('Coincidencia %s (%.2f%%) con %s', 
                NEW.match_type, NEW.similarity_score, NEW.matched_name),
            s.dossier_id,
            (SELECT id FROM users u JOIN user_roles ur ON u.id = ur.user_id 
             JOIN roles r ON ur.role_id = r.id 
             WHERE r.role_type = 'COMPLIANCE_OFFICER' LIMIT 1),
            NEW.id
        FROM screening s
        JOIN screening_result sr ON s.id = sr.screening_id
        WHERE sr.id = NEW.screening_result_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_alert_on_relevant_match
    AFTER INSERT ON match
    FOR EACH ROW 
    WHEN (NEW.is_relevant = true)
    EXECUTE FUNCTION create_alert_on_relevant_match();
```

---

## 11. Estrategia de Testing

### 11.1 Datos de Prueba

```sql
-- Script para crear datos de prueba
CREATE OR REPLACE FUNCTION generate_test_screening_data()
RETURNS VOID AS $$
BEGIN
    -- Crear listas de prueba
    INSERT INTO watchlist (name, code, source, list_type, update_frequency, is_active, priority)
    VALUES ('Test Sanctions List', 'TEST-SANCTIONS', 'Test Source', 'SANCTIONS', 'MANUAL', true, 'LOW');
    
    -- Crear entradas de prueba
    INSERT INTO watchlist_entry (watchlist_id, entity_type, name, is_active)
    SELECT id, 'PERSON', 'Test Person ' || generate_series(1, 100), true
    FROM watchlist WHERE code = 'TEST-SANCTIONS';
    
    -- Crear screening de prueba
    -- ... más datos de prueba ...
END;
$$ LANGUAGE plpgsql;
```

---

## 12. Resumen

Este modelo de base de datos para el módulo de Screening del SIAR proporciona:

1. **Trazabilidad completa**: Historial inmutable de todas las ejecuciones y decisiones
2. **Flexibilidad**: Soporta múltiples listas y tipos de entidades
3. **Performance**: Índices optimizados para consultas frecuentes
4. **Cumplimiento regulatorio**: Evidencia documentada de todas las decisiones
5. **Integración**: Conecta con módulos de Riesgo, Alertas y Auditoría
6. **Escalabilidad**: Diseñado para alto volumen mediante particionamiento

El diseño cumple estrictamente con requisitos de SUDEASEG y best practices internacionales para sistemas AML/CFT.
