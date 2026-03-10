-- =====================================================
-- SISTEMA SIAR - AUDITORÍA Y BITÁCORA INMUTABLE
-- =====================================================
-- Descripción: Tablas y funciones para auditoría inmutable
-- Autor: Sistema SIAR
-- Fecha: 2025-01-15
-- Versión: 1.0
-- =====================================================

-- =====================================================
-- 1. TABLA PRINCIPAL: AUDIT_LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    
    -- ============================================
    -- IDENTIFICACIÓN DEL REGISTRO
    -- ============================================
    audit_id VARCHAR(25) PRIMARY KEY,
    sequence_number BIGINT UNIQUE NOT NULL,
    
    -- ============================================
    -- INFORMACIÓN DEL EVENTO
    -- ============================================
    event_code VARCHAR(10) NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_category VARCHAR(30) NOT NULL CHECK (event_category IN (
        'DOSSIER', 'RISK_ASSESSMENT', 'PEP_MANAGEMENT', 'SCREENING',
        'ALERT', 'USER_MANAGEMENT', 'AUTHENTICATION', 'AUTHORIZATION',
        'CONFIGURATION', 'INTEGRATION', 'SYSTEM', 'SECURITY',
        'COMPLIANCE', 'DATA_PROTECTION', 'EXPORT', 'AUDIT'
    )),
    event_level VARCHAR(20) NOT NULL CHECK (event_level IN (
        'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    )),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    
    -- ============================================
    -- INFORMACIÓN DEL ACTOR
    -- ============================================
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(200) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    user_department VARCHAR(100),
    user_location VARCHAR(100),
    
    -- ============================================
    -- INFORMACIÓN DE SESIÓN
    -- ============================================
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    device VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    
    -- ============================================
    -- INFORMACIÓN DEL RECURSO
    -- ============================================
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    resource_name VARCHAR(500),
    parent_resource_type VARCHAR(50),
    parent_resource_id VARCHAR(100),
    
    -- ============================================
    -- INFORMACIÓN DE LA ACCIÓN
    -- ============================================
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT',
        'SUBMIT', 'EXPORT', 'IMPORT', 'LOGIN', 'LOGOUT',
        'CONFIGURE', 'EXECUTE', 'VERIFY'
    )),
    action_verb VARCHAR(30) NOT NULL,
    action_description VARCHAR(1000) NOT NULL,
    action_method VARCHAR(10),
    action_endpoint VARCHAR(500),
    action_duration INTEGER,
    
    -- ============================================
    -- CAMBIOS DE ESTADO
    -- ============================================
    has_state_change BOOLEAN NOT NULL DEFAULT FALSE,
    previous_state JSONB,
    new_state JSONB,
    changed_fields JSONB,
    
    -- ============================================
    -- CONTEXTO DE NEGOCIO
    -- ============================================
    justification VARCHAR(2000),
    regulatory_basis VARCHAR(500),
    compliance_notes VARCHAR(2000),
    related_entities JSONB,
    
    -- ============================================
    -- INFORMACIÓN TÉCNICA
    -- ============================================
    application_version VARCHAR(50),
    database_version VARCHAR(100),
    server_hostname VARCHAR(100),
    request_id VARCHAR(100),
    transaction_id VARCHAR(100),
    
    -- ============================================
    -- INFORMACIÓN DE SEGURIDAD
    -- ============================================
    authentication_method VARCHAR(50),
    authorization_passed BOOLEAN,
    permissions_checked JSONB,
    security_level VARCHAR(30),
    
    -- ============================================
    -- PROTECCIÓN DE DATOS
    -- ============================================
    contains_pii BOOLEAN,
    data_classification VARCHAR(30),
    encryption_applied BOOLEAN,
    anonymization_required BOOLEAN,
    
    -- ============================================
    -- CADENA DE HASH
    -- ============================================
    record_hash VARCHAR(64) NOT NULL,
    previous_record_hash VARCHAR(64),
    
    -- ============================================
    -- METADATA
    -- ============================================
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    record_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    exported BOOLEAN NOT NULL DEFAULT FALSE,
    exported_at TIMESTAMP WITH TIME ZONE,
    exported_by VARCHAR(50)
);

-- =====================================================
-- 2. ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- =====================================================

CREATE INDEX idx_audit_sequence ON audit_logs(sequence_number);
CREATE INDEX idx_audit_event_code ON audit_logs(event_code);
CREATE INDEX idx_audit_event_category ON audit_logs(event_category);
CREATE INDEX idx_audit_event_level ON audit_logs(event_level);
CREATE INDEX idx_audit_timestamp ON audit_logs(event_timestamp DESC);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_user_role ON audit_logs(user_role);
CREATE INDEX idx_audit_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_event_date ON audit_logs(event_date DESC);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_audit_resource_lookup ON audit_logs(resource_type, resource_id, event_timestamp DESC);
CREATE INDEX idx_audit_user_activity ON audit_logs(user_id, event_date DESC, event_timestamp DESC);
CREATE INDEX idx_audit_category_level ON audit_logs(event_category, event_level, event_date DESC);

-- Índices para búsquedas JSON
CREATE INDEX idx_audit_changed_fields ON audit_logs USING GIN (changed_fields);
CREATE INDEX idx_audit_previous_state ON audit_logs USING GIN (previous_state);
CREATE INDEX idx_audit_new_state ON audit_logs USING GIN (new_state);

-- =====================================================
-- 3. SECUENCIA PARA NUMERACIÓN AUTOMÁTICA
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS audit_logs_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =====================================================
-- 4. TRIGGERS DE INMUTABILIDAD
-- =====================================================

-- 4.1. Trigger: Prevenir UPDATE
CREATE OR REPLACE FUNCTION prevent_audit_log_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'UPDATE operation not allowed on audit_logs table. Audit logs are IMMUTABLE.'
        USING HINT = 'Audit logs cannot be modified once created.',
              ERRCODE = '23502';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_update_trigger
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_update();

-- 4.2. Trigger: Prevenir DELETE
CREATE OR REPLACE FUNCTION prevent_audit_log_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'DELETE operation not allowed on audit_logs table. Audit logs are IMMUTABLE.'
        USING HINT = 'Audit logs cannot be deleted once created.',
              ERRCODE = '23502';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_delete_trigger
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_delete();

-- 4.3. Trigger: Validar Hash Chain
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
    
    -- Si es el primer registro, debe usar "GENESIS_BLOCK"
    IF last_hash IS NULL THEN
        IF NEW.previous_record_hash != 'GENESIS_BLOCK' THEN
            RAISE EXCEPTION 'First audit log must have previous_record_hash = GENESIS_BLOCK'
                USING HINT = 'This is the first record in the chain.',
                      ERRCODE = '23502';
        END IF;
    ELSE
        -- Validar que el previous_record_hash coincide con el último hash
        IF NEW.previous_record_hash != last_hash THEN
            RAISE EXCEPTION 'Hash chain broken! Expected: %, Got: %', last_hash, NEW.previous_record_hash
                USING HINT = 'The previous_record_hash must match the last record_hash.',
                      ERRCODE = '23502';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_audit_hash_chain_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION validate_audit_hash_chain();

-- 4.4. Trigger: Asignar Número de Secuencia
CREATE OR REPLACE FUNCTION assign_audit_sequence_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Asignar siguiente número de secuencia si no está definido
    IF NEW.sequence_number IS NULL THEN
        NEW.sequence_number := nextval('audit_logs_sequence');
    END IF;
    
    -- Generar audit_id si no está definido
    IF NEW.audit_id IS NULL THEN
        NEW.audit_id := 'AUD-' || EXTRACT(YEAR FROM NEW.event_timestamp)::TEXT || 
                        '-' || LPAD(NEW.sequence_number::TEXT, 10, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_audit_sequence_number_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION assign_audit_sequence_number();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Solo el sistema puede insertar
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
    USING (user_id = current_setting('app.current_user_id', true)::VARCHAR);

-- Política: Cumplimiento puede leer TODO
CREATE POLICY audit_logs_compliance_read_policy ON audit_logs
    FOR SELECT
    TO siar_compliance_role
    USING (true);

-- =====================================================
-- 6. VISTAS ESPECIALIZADAS
-- =====================================================

-- 6.1. Vista: Eventos Críticos Recientes
CREATE OR REPLACE VIEW audit_critical_events AS
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
    ip_address,
    justification
FROM audit_logs
WHERE event_level = 'CRITICAL'
  AND event_timestamp >= NOW() - INTERVAL '30 days'
ORDER BY event_timestamp DESC;

-- 6.2. Vista: Actividad por Usuario
CREATE OR REPLACE VIEW audit_user_activity AS
SELECT 
    user_id,
    user_name,
    user_role,
    event_date,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_level = 'CRITICAL' THEN 1 END) as critical_events,
    COUNT(CASE WHEN event_level = 'ERROR' THEN 1 END) as error_events,
    COUNT(CASE WHEN event_level = 'WARNING' THEN 1 END) as warning_events,
    COUNT(DISTINCT resource_id) as resources_accessed,
    MIN(event_timestamp) as first_activity,
    MAX(event_timestamp) as last_activity
FROM audit_logs
GROUP BY user_id, user_name, user_role, event_date
ORDER BY event_date DESC, total_events DESC;

-- 6.3. Vista: Trail de Expedientes
CREATE OR REPLACE VIEW audit_dossier_trail AS
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
    justification,
    regulatory_basis
FROM audit_logs
WHERE resource_type = 'DOSSIER'
ORDER BY resource_id, sequence_number;

-- 6.4. Vista: Resumen Diario
CREATE OR REPLACE VIEW audit_daily_summary AS
SELECT 
    event_date,
    event_category,
    event_level,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT resource_id) as resources_affected,
    COUNT(CASE WHEN has_state_change THEN 1 END) as state_changes,
    COUNT(CASE WHEN action_type = 'CREATE' THEN 1 END) as creates,
    COUNT(CASE WHEN action_type = 'UPDATE' THEN 1 END) as updates,
    COUNT(CASE WHEN action_type = 'DELETE' THEN 1 END) as deletes
FROM audit_logs
GROUP BY event_date, event_category, event_level
ORDER BY event_date DESC, event_category;

-- 6.5. Vista: Accesos No Autorizados
CREATE OR REPLACE VIEW audit_unauthorized_access AS
SELECT 
    audit_id,
    event_timestamp,
    user_id,
    user_name,
    user_role,
    resource_type,
    resource_id,
    action_description,
    ip_address,
    user_agent
FROM audit_logs
WHERE authorization_passed = FALSE
  OR event_code IN ('AUD-S05') -- Acceso denegado
ORDER BY event_timestamp DESC;

-- =====================================================
-- 7. FUNCIONES DE CONSULTA
-- =====================================================

-- 7.1. Obtener trail de auditoría de un expediente
CREATE OR REPLACE FUNCTION get_dossier_audit_trail(p_dossier_id VARCHAR)
RETURNS TABLE (
    audit_id VARCHAR,
    event_time TIMESTAMP WITH TIME ZONE,
    event_description VARCHAR,
    user_name VARCHAR,
    user_role VARCHAR,
    action_taken VARCHAR,
    changes JSONB,
    justification VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.audit_id,
        a.event_timestamp,
        a.action_description,
        a.user_name,
        a.user_role,
        a.action_verb,
        a.changed_fields,
        a.justification
    FROM audit_logs a
    WHERE a.resource_type = 'DOSSIER'
      AND a.resource_id = p_dossier_id
    ORDER BY a.event_timestamp ASC;
END;
$$ LANGUAGE plpgsql;

-- 7.2. Obtener eventos de un usuario en rango de fechas
CREATE OR REPLACE FUNCTION get_user_events_in_range(
    p_user_id VARCHAR,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    audit_id VARCHAR,
    event_time TIMESTAMP WITH TIME ZONE,
    event_name VARCHAR,
    event_level VARCHAR,
    resource_accessed VARCHAR,
    action_taken VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.audit_id,
        a.event_timestamp,
        a.event_name,
        a.event_level,
        CONCAT(a.resource_type, ':', a.resource_id),
        a.action_verb
    FROM audit_logs a
    WHERE a.user_id = p_user_id
      AND a.event_date BETWEEN p_start_date AND p_end_date
    ORDER BY a.event_timestamp ASC;
END;
$$ LANGUAGE plpgsql;

-- 7.3. Verificar integridad de la cadena
CREATE OR REPLACE FUNCTION verify_audit_chain_integrity(
    p_start_audit_id VARCHAR,
    p_end_audit_id VARCHAR
)
RETURNS TABLE (
    is_valid BOOLEAN,
    total_records BIGINT,
    first_sequence BIGINT,
    last_sequence BIGINT,
    broken_at VARCHAR
) AS $$
DECLARE
    v_current RECORD;
    v_previous_hash VARCHAR(64);
    v_first_seq BIGINT;
    v_last_seq BIGINT;
    v_count BIGINT := 0;
BEGIN
    -- Inicializar
    v_previous_hash := NULL;
    v_first_seq := NULL;
    v_last_seq := NULL;
    
    -- Iterar registros en orden
    FOR v_current IN
        SELECT audit_id, sequence_number, record_hash, previous_record_hash
        FROM audit_logs
        WHERE audit_id BETWEEN p_start_audit_id AND p_end_audit_id
        ORDER BY sequence_number ASC
    LOOP
        v_count := v_count + 1;
        
        -- Guardar primera secuencia
        IF v_first_seq IS NULL THEN
            v_first_seq := v_current.sequence_number;
        END IF;
        
        -- Verificar continuidad
        IF v_previous_hash IS NOT NULL THEN
            IF v_current.previous_record_hash != v_previous_hash THEN
                -- Cadena rota
                RETURN QUERY SELECT 
                    FALSE,
                    v_count,
                    v_first_seq,
                    v_current.sequence_number,
                    v_current.audit_id;
                RETURN;
            END IF;
        END IF;
        
        -- Actualizar para siguiente iteración
        v_previous_hash := v_current.record_hash;
        v_last_seq := v_current.sequence_number;
    END LOOP;
    
    -- Cadena válida
    RETURN QUERY SELECT 
        TRUE,
        v_count,
        v_first_seq,
        v_last_seq,
        NULL::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- 7.4. Obtener estadísticas de auditoría
CREATE OR REPLACE FUNCTION get_audit_statistics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_events BIGINT,
    critical_events BIGINT,
    error_events BIGINT,
    warning_events BIGINT,
    info_events BIGINT,
    unique_users BIGINT,
    unique_resources BIGINT,
    events_with_state_change BIGINT,
    avg_events_per_day NUMERIC,
    period_start DATE,
    period_end DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COUNT(CASE WHEN event_level = 'CRITICAL' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN event_level = 'ERROR' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN event_level = 'WARNING' THEN 1 END)::BIGINT,
        COUNT(CASE WHEN event_level = 'INFO' THEN 1 END)::BIGINT,
        COUNT(DISTINCT user_id)::BIGINT,
        COUNT(DISTINCT resource_id)::BIGINT,
        COUNT(CASE WHEN has_state_change THEN 1 END)::BIGINT,
        ROUND(COUNT(*)::NUMERIC / p_days, 2),
        MIN(event_date),
        MAX(event_date)
    FROM audit_logs
    WHERE event_date >= CURRENT_DATE - p_days;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TABLA DE RETENCIÓN Y ARCHIVADO
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_retention_policy (
    policy_id SERIAL PRIMARY KEY,
    event_category VARCHAR(30) NOT NULL,
    event_level VARCHAR(20) NOT NULL,
    retention_days INTEGER NOT NULL CHECK (retention_days > 0),
    archive_after_days INTEGER NOT NULL CHECK (archive_after_days > 0),
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_retention_policy UNIQUE (event_category, event_level)
);

-- Políticas de retención por defecto (según regulaciones)
INSERT INTO audit_retention_policy 
    (event_category, event_level, retention_days, archive_after_days, description)
VALUES
    ('AUTHENTICATION', 'CRITICAL', 2555, 365, 'Login/logout críticos: 7 años online, archivo después de 1 año'),
    ('AUTHENTICATION', 'ERROR', 1095, 180, 'Errores de autenticación: 3 años online, archivo después de 6 meses'),
    ('DOSSIER', 'INFO', 2555, 365, 'Expedientes: 7 años online, archivo después de 1 año'),
    ('DOSSIER', 'CRITICAL', 3650, 730, 'Expedientes críticos: 10 años online, archivo después de 2 años'),
    ('RISK_ASSESSMENT', 'INFO', 2555, 365, 'Evaluaciones de riesgo: 7 años online'),
    ('RISK_ASSESSMENT', 'CRITICAL', 3650, 730, 'Riesgo crítico: 10 años online, archivo después de 2 años'),
    ('PEP_MANAGEMENT', 'INFO', 3650, 730, 'PEP: 10 años online, archivo después de 2 años'),
    ('PEP_MANAGEMENT', 'CRITICAL', 3650, 730, 'PEP crítico: 10 años online, archivo después de 2 años'),
    ('SYSTEM', 'INFO', 365, 90, 'Sistema: 1 año online, archivo después de 90 días'),
    ('SYSTEM', 'ERROR', 1095, 180, 'Errores sistema: 3 años online, archivo después de 6 meses'),
    ('SECURITY', 'CRITICAL', 3650, 365, 'Seguridad crítica: 10 años online, archivo después de 1 año'),
    ('SECURITY', 'WARNING', 1095, 180, 'Advertencias seguridad: 3 años online'),
    ('COMPLIANCE', 'INFO', 2555, 365, 'Cumplimiento: 7 años online'),
    ('COMPLIANCE', 'CRITICAL', 3650, 730, 'Cumplimiento crítico: 10 años online');

-- Tabla de archivo (misma estructura que audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs_archive (
    LIKE audit_logs INCLUDING ALL
);

-- =====================================================
-- 9. VISTA MATERIALIZADA PARA DASHBOARD
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS audit_dashboard_metrics AS
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
    COUNT(CASE WHEN event_category = 'AUTHENTICATION' THEN 1 END) as auth_events,
    
    -- Integridad
    MAX(sequence_number) as last_sequence_number,
    MAX(event_timestamp) as last_event_time,
    
    -- Fecha de cálculo
    NOW() as calculated_at
FROM audit_logs
WHERE event_date >= CURRENT_DATE - INTERVAL '30 days';

-- Índice en la vista materializada
CREATE UNIQUE INDEX idx_audit_dashboard_calculated ON audit_dashboard_metrics (calculated_at);

-- =====================================================
-- 10. COMENTARIOS EN TABLAS Y COLUMNAS
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Registro inmutable de auditoría del Sistema SIAR. NO permite UPDATE ni DELETE.';
COMMENT ON COLUMN audit_logs.audit_id IS 'Identificador único del registro de auditoría (formato: AUD-YYYY-NNNNNNNNNN)';
COMMENT ON COLUMN audit_logs.sequence_number IS 'Número de secuencia global autoincremental';
COMMENT ON COLUMN audit_logs.record_hash IS 'Hash SHA-256 de este registro para garantizar integridad';
COMMENT ON COLUMN audit_logs.previous_record_hash IS 'Hash del registro anterior (cadena de hash tipo blockchain)';

COMMENT ON TABLE audit_retention_policy IS 'Políticas de retención y archivado de registros de auditoría';
COMMENT ON TABLE audit_logs_archive IS 'Archivo de registros de auditoría antiguos (réplica de audit_logs)';

-- =====================================================
-- 11. PERMISOS Y ROLES
-- =====================================================

-- Nota: Los roles deben ser creados previamente en el sistema

-- Permisos para rol de aplicación (solo INSERT)
-- GRANT INSERT ON audit_logs TO siar_application_user;
-- REVOKE UPDATE, DELETE ON audit_logs FROM siar_application_user;

-- Permisos para rol de auditor (solo SELECT)
-- GRANT SELECT ON audit_logs TO siar_auditor_role;
-- GRANT SELECT ON audit_logs_archive TO siar_auditor_role;
-- REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM siar_auditor_role;

-- Permisos para rol de cumplimiento (solo SELECT)
-- GRANT SELECT ON audit_logs TO siar_compliance_role;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO siar_compliance_role;
-- REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM siar_compliance_role;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✓ Tablas de auditoría inmutable creadas exitosamente';
    RAISE NOTICE '✓ Triggers de inmutabilidad activados (previene UPDATE/DELETE)';
    RAISE NOTICE '✓ Hash chain configurado para verificación de integridad';
    RAISE NOTICE '✓ Row Level Security (RLS) habilitado';
    RAISE NOTICE '✓ Vistas y funciones de consulta creadas';
    RAISE NOTICE '✓ Políticas de retención configuradas';
    RAISE NOTICE 'Sistema de Auditoría Inmutable SIAR listo para usar';
END $$;
