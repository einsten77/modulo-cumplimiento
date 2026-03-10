-- ============================================================================
-- SIAR - Script de Creación del Esquema de Screening
-- Versión: 1.0
-- Fecha: 2024
-- Descripción: Creación de tablas, índices, constraints, triggers y funciones
--              para el módulo de Screening contra listas restrictivas
-- ============================================================================

-- ============================================================================
-- 1. TABLAS PRINCIPALES
-- ============================================================================

-- 1.1 Tabla: watchlist (Listas Restrictivas)
CREATE TABLE IF NOT EXISTS watchlist (
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
    total_entries INTEGER DEFAULT 0,
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

-- 1.2 Tabla: watchlist_entry (Entradas de Listas)
CREATE TABLE IF NOT EXISTS watchlist_entry (
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

-- 1.3 Tabla: screening (Ejecución de Screening)
CREATE TABLE IF NOT EXISTS screening (
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
    total_matches_found INTEGER DEFAULT 0,
    has_relevant_matches BOOLEAN DEFAULT false,
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

-- 1.4 Tabla: screening_result (Resultado por Lista)
CREATE TABLE IF NOT EXISTS screening_result (
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

-- 1.5 Tabla: match (Coincidencias)
CREATE TABLE IF NOT EXISTS match (
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

-- 1.6 Tabla: screening_decision (Decisión del Oficial)
CREATE TABLE IF NOT EXISTS screening_decision (
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

-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

-- Índices para watchlist
CREATE INDEX IF NOT EXISTS idx_watchlist_code ON watchlist(code);
CREATE INDEX IF NOT EXISTS idx_watchlist_active ON watchlist(is_active);
CREATE INDEX IF NOT EXISTS idx_watchlist_priority ON watchlist(priority);
CREATE INDEX IF NOT EXISTS idx_watchlist_list_type ON watchlist(list_type);
CREATE INDEX IF NOT EXISTS idx_watchlist_next_update ON watchlist(next_scheduled_update) WHERE is_active = true;

-- Índices para watchlist_entry
CREATE INDEX IF NOT EXISTS idx_entry_watchlist ON watchlist_entry(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_entry_entity_type ON watchlist_entry(entity_type);
CREATE INDEX IF NOT EXISTS idx_entry_active ON watchlist_entry(is_active);
CREATE INDEX IF NOT EXISTS idx_entry_name_trgm ON watchlist_entry USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entry_aliases ON watchlist_entry USING gin(aliases);

-- Índices para screening
CREATE INDEX IF NOT EXISTS idx_screening_dossier ON screening(dossier_id);
CREATE INDEX IF NOT EXISTS idx_screening_execution_date ON screening(execution_date DESC);
CREATE INDEX IF NOT EXISTS idx_screening_status ON screening(status);
CREATE INDEX IF NOT EXISTS idx_screening_has_matches ON screening(has_relevant_matches);
CREATE INDEX IF NOT EXISTS idx_screening_executed_by ON screening(executed_by);
CREATE INDEX IF NOT EXISTS idx_screening_type ON screening(screening_type);
CREATE INDEX IF NOT EXISTS idx_screening_dossier_date ON screening(dossier_id, execution_date DESC);

-- Índices para screening_result
CREATE INDEX IF NOT EXISTS idx_result_screening ON screening_result(screening_id);
CREATE INDEX IF NOT EXISTS idx_result_watchlist ON screening_result(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_result_matches ON screening_result(matches_found) WHERE matches_found > 0;

-- Índices para match
CREATE INDEX IF NOT EXISTS idx_match_screening_result ON match(screening_result_id);
CREATE INDEX IF NOT EXISTS idx_match_watchlist_entry ON match(watchlist_entry_id);
CREATE INDEX IF NOT EXISTS idx_match_similarity ON match(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_requires_review ON match(requires_review);
CREATE INDEX IF NOT EXISTS idx_match_relevant ON match(is_relevant);
CREATE INDEX IF NOT EXISTS idx_match_type ON match(match_type);
CREATE INDEX IF NOT EXISTS idx_match_pending_review ON match(screening_result_id, is_relevant, requires_review) 
    WHERE is_relevant = true AND requires_review = true;

-- Índices para screening_decision
CREATE INDEX IF NOT EXISTS idx_decision_match ON screening_decision(match_id);
CREATE INDEX IF NOT EXISTS idx_decision_screening ON screening_decision(screening_id);
CREATE INDEX IF NOT EXISTS idx_decision_decided_by ON screening_decision(decided_by);
CREATE INDEX IF NOT EXISTS idx_decision_decided_at ON screening_decision(decided_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_type ON screening_decision(decision);
CREATE INDEX IF NOT EXISTS idx_decision_escalation ON screening_decision(requires_escalation) WHERE requires_escalation = true;
CREATE INDEX IF NOT EXISTS idx_decision_enhanced_dd ON screening_decision(requires_enhanced_due_diligence) WHERE requires_enhanced_due_diligence = true;

-- ============================================================================
-- 3. FUNCIONES
-- ============================================================================

-- 3.1 Función: Actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Función: Calcular Match Type
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

-- 3.3 Función: Prevenir eliminación física
CREATE OR REPLACE FUNCTION prevent_physical_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Eliminación física no permitida. Use soft delete (is_active = false)';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3.4 Función: Actualizar contador de matches
CREATE OR REPLACE FUNCTION update_screening_matches_count()
RETURNS TRIGGER AS $$
DECLARE
    v_screening_id BIGINT;
BEGIN
    -- Obtener screening_id
    SELECT sr.screening_id INTO v_screening_id
    FROM screening_result sr
    WHERE sr.id = NEW.screening_result_id;
    
    -- Actualizar contadores
    UPDATE screening
    SET 
        total_matches_found = (
            SELECT COUNT(*)
            FROM match m
            JOIN screening_result sr ON m.screening_result_id = sr.id
            WHERE sr.screening_id = v_screening_id
        ),
        has_relevant_matches = EXISTS (
            SELECT 1
            FROM match m
            JOIN screening_result sr ON m.screening_result_id = sr.id
            WHERE sr.screening_id = v_screening_id AND m.is_relevant = true
        )
    WHERE id = v_screening_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- 4.1 Triggers para updated_at
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

-- 4.2 Triggers para prevenir eliminación física
CREATE TRIGGER trg_prevent_screening_delete
    BEFORE DELETE ON screening
    FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion();

CREATE TRIGGER trg_prevent_screening_decision_delete
    BEFORE DELETE ON screening_decision
    FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion();

CREATE TRIGGER trg_prevent_match_delete
    BEFORE DELETE ON match
    FOR EACH ROW EXECUTE FUNCTION prevent_physical_deletion();

-- 4.3 Trigger para actualizar contador de matches
CREATE TRIGGER trg_update_screening_matches
    AFTER INSERT ON match
    FOR EACH ROW EXECUTE FUNCTION update_screening_matches_count();

-- ============================================================================
-- 5. VISTAS
-- ============================================================================

-- 5.1 Vista: Resumen de screenings
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
    COUNT(sd.id) FILTER (WHERE sd.decision = 'TRUE_MATCH') AS true_matches,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'FALSE_POSITIVE') AS false_positives,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'ESCALATE') AS escalations,
    COUNT(sd.id) FILTER (WHERE sd.decision = 'PENDING_INFO') AS pending_decisions,
    COUNT(m.id) FILTER (WHERE m.is_relevant = true AND sd.id IS NULL) AS pending_review,
    s.created_at
FROM screening s
JOIN dossier d ON s.dossier_id = d.id
JOIN users u ON s.executed_by = u.id
LEFT JOIN screening_result sr ON s.id = sr.screening_id
LEFT JOIN match m ON sr.id = m.screening_result_id
LEFT JOIN screening_decision sd ON m.id = sd.match_id
GROUP BY s.id, d.entity_name, u.full_name;

-- 5.2 Vista: Matches pendientes de revisión
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

-- ============================================================================
-- 6. COMENTARIOS
-- ============================================================================

COMMENT ON TABLE watchlist IS 'Catálogo de listas restrictivas nacionales e internacionales';
COMMENT ON TABLE watchlist_entry IS 'Entradas individuales de cada lista restrictiva';
COMMENT ON TABLE screening IS 'Registro de cada ejecución de screening contra listas restrictivas';
COMMENT ON TABLE screening_result IS 'Resultado de consulta contra cada lista restrictiva individual';
COMMENT ON TABLE match IS 'Registro de cada coincidencia encontrada en el screening';
COMMENT ON TABLE screening_decision IS 'Decisión del Oficial de Cumplimiento sobre cada coincidencia';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
