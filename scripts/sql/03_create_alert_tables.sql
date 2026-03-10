-- =====================================================
-- SIAR - Sistema de Gestión de Alertas y Seguimiento
-- =====================================================
-- Versión: 1.0
-- Fecha: 2024
-- Descripción: Creación de tablas para alertas con gestión activa
--              NO se permite eliminación de registros
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUMERADOS
-- =====================================================

-- Nivel de prioridad de alertas
CREATE TYPE alert_level AS ENUM (
    'BAJA',      -- Informativa, sin urgencia
    'MEDIA',     -- Requiere atención pero no urgente
    'ALTA',      -- Requiere atención pronta
    'CRÍTICA'    -- Requiere atención inmediata
);

-- Estado del ciclo de vida de una alerta
CREATE TYPE alert_status AS ENUM (
    'NUEVA',           -- Recién generada, no asignada o pendiente de atención
    'EN_SEGUIMIENTO',  -- En proceso de atención
    'ATENDIDA',        -- Atendida pero pendiente de cierre formal
    'CERRADA'          -- Cerrada con justificación documentada
);

-- Tipo de acción en el seguimiento
CREATE TYPE tracking_action_type AS ENUM (
    'CREADA',                -- Alerta creada
    'ASIGNADA',              -- Asignada a usuario
    'REASIGNADA',            -- Reasignada a otro usuario
    'COMENTARIO_AGREGADO',   -- Comentario añadido
    'EVIDENCIA_ADJUNTA',     -- Evidencia documentada
    'ESTADO_CAMBIADO',       -- Cambio de estado
    'ACCION_TOMADA',         -- Acción correctiva tomada
    'ESCALADA',              -- Escalada a superior
    'NOTIFICACION_ENVIADA',  -- Notificación enviada
    'CERRADA'                -- Alerta cerrada
);

-- Tipo de notificación
CREATE TYPE notification_type AS ENUM (
    'EMAIL',          -- Correo electrónico
    'SMS',            -- Mensaje de texto
    'IN_APP',         -- Notificación en aplicación
    'PUSH'            -- Push notification
);

-- Estado de entrega de notificación
CREATE TYPE delivery_status AS ENUM (
    'PENDIENTE',      -- Pendiente de envío
    'ENVIADA',        -- Enviada exitosamente
    'ENTREGADA',      -- Confirmación de entrega
    'LEIDA',          -- Leída por usuario
    'FALLIDA',        -- Falló el envío
    'RECHAZADA'       -- Rechazada por servidor
);

-- =====================================================
-- 2. TABLA: alert_types (Tipo_Alerta)
-- =====================================================
-- Catálogo maestro parametrizable de tipos de alertas

CREATE TABLE alert_types (
    -- Identificación
    alert_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_code VARCHAR(20) NOT NULL UNIQUE,
    alert_name VARCHAR(100) NOT NULL,
    
    -- Clasificación
    alert_level alert_level NOT NULL,
    origin_module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    
    -- Estado
    active BOOLEAN NOT NULL DEFAULT true,
    
    -- Comportamiento
    requires_action BOOLEAN NOT NULL DEFAULT true,
    default_deadline_days INTEGER,
    auto_assignment_rule VARCHAR(50), -- OFICIAL_CUMPLIMIENTO, ANALISTA_CUMPLIMIENTO
    notification_template VARCHAR(50),
    escalation_hours INTEGER, -- Horas para escalación automática
    
    -- Auditoría
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(50),
    modified_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX idx_alert_type_code ON alert_types(alert_code);
CREATE INDEX idx_alert_type_active ON alert_types(active);
CREATE INDEX idx_alert_type_module ON alert_types(origin_module);

-- Comentarios
COMMENT ON TABLE alert_types IS 'Catálogo maestro de tipos de alertas parametrizables';
COMMENT ON COLUMN alert_types.alert_code IS 'Código único del tipo de alerta (ALT-001, ALT-002, etc.)';
COMMENT ON COLUMN alert_types.escalation_hours IS 'Horas sin atención para escalación automática';

-- =====================================================
-- 3. TABLA: alerts (Alerta)
-- =====================================================
-- Registro principal de alertas
-- NO permite eliminación física

CREATE TABLE alerts (
    -- Identificación
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_code VARCHAR(20) NOT NULL, -- Referencia a alert_types.alert_code
    alert_type VARCHAR(50) NOT NULL,  -- Nombre descriptivo del tipo
    
    -- Clasificación
    alert_level alert_level NOT NULL,
    origin_module VARCHAR(50) NOT NULL, -- DOSSIER, RISK, DUE_DILIGENCE, SCREENING, PEP
    
    -- Expediente asociado (OBLIGATORIO)
    dossier_id UUID NOT NULL REFERENCES dossiers(dossier_uuid),
    
    -- Entidad afectada
    entity_type VARCHAR(50), -- CLIENT, INTERMEDIARY, EMPLOYEE, etc.
    entity_name VARCHAR(200),
    entity_identification VARCHAR(50),
    
    -- Estado
    status alert_status NOT NULL DEFAULT 'NUEVA',
    description TEXT NOT NULL,
    
    -- Detección
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detected_by VARCHAR(50) NOT NULL, -- Usuario o SYSTEM
    
    -- Asignación
    assigned_to VARCHAR(50), -- userId del usuario asignado
    assigned_at TIMESTAMP,
    
    -- Atención
    attended_by VARCHAR(50),
    attended_at TIMESTAMP,
    
    -- Cierre
    closed_by VARCHAR(50),
    closed_at TIMESTAMP,
    closure_reason TEXT,
    
    -- Acción requerida
    requires_action BOOLEAN NOT NULL DEFAULT false,
    action_deadline DATE,
    priority_score INTEGER NOT NULL DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    
    -- Metadata adicional (JSON)
    metadata JSONB,
    
    -- Entidad relacionada (opcional)
    related_entity_id VARCHAR(50),
    related_entity_type VARCHAR(50),
    
    -- Notificaciones
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    notification_sent_at TIMESTAMP,
    
    -- Escalación
    escalated BOOLEAN NOT NULL DEFAULT false,
    escalated_at TIMESTAMP,
    escalated_to VARCHAR(50),
    escalation_reason TEXT,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Constraints
    CONSTRAINT chk_alert_assigned CHECK (
        (assigned_to IS NULL AND assigned_at IS NULL) OR
        (assigned_to IS NOT NULL AND assigned_at IS NOT NULL)
    ),
    CONSTRAINT chk_alert_attended CHECK (
        (attended_by IS NULL AND attended_at IS NULL) OR
        (attended_by IS NOT NULL AND attended_at IS NOT NULL)
    ),
    CONSTRAINT chk_alert_closed CHECK (
        (closed_by IS NULL AND closed_at IS NULL AND closure_reason IS NULL) OR
        (closed_by IS NOT NULL AND closed_at IS NOT NULL AND closure_reason IS NOT NULL)
    ),
    CONSTRAINT chk_alert_escalated CHECK (
        (escalated = false) OR
        (escalated = true AND escalated_at IS NOT NULL AND escalated_to IS NOT NULL)
    )
);

-- Índices para rendimiento
CREATE INDEX idx_alert_code ON alerts(alert_code);
CREATE INDEX idx_alert_status ON alerts(status);
CREATE INDEX idx_alert_level ON alerts(alert_level);
CREATE INDEX idx_alert_dossier ON alerts(dossier_id);
CREATE INDEX idx_alert_assigned_to ON alerts(assigned_to);
CREATE INDEX idx_alert_detected_at ON alerts(detected_at DESC);
CREATE INDEX idx_alert_module ON alerts(origin_module);
CREATE INDEX idx_alert_deadline ON alerts(action_deadline) WHERE status != 'CERRADA';
CREATE INDEX idx_alert_escalated ON alerts(escalated, escalated_at) WHERE escalated = true;
CREATE INDEX idx_alert_entity ON alerts(entity_type, entity_identification);
CREATE INDEX idx_alert_metadata ON alerts USING gin(metadata);

-- Comentarios
COMMENT ON TABLE alerts IS 'Registro principal de alertas - NO permite eliminación física';
COMMENT ON COLUMN alerts.alert_code IS 'Código del tipo de alerta (referencia lógica a alert_types)';
COMMENT ON COLUMN alerts.priority_score IS 'Puntaje de prioridad calculado dinámicamente (0-100)';
COMMENT ON COLUMN alerts.metadata IS 'Datos adicionales en formato JSON según el módulo origen';

-- =====================================================
-- 4. TABLA: alert_tracking (Seguimiento_Alerta)
-- =====================================================
-- Historial inmutable de acciones sobre alertas
-- NO permite modificación ni eliminación

CREATE TABLE alert_tracking (
    -- Identificación
    tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(alert_id),
    
    -- Tipo de acción
    action_type tracking_action_type NOT NULL,
    action_description TEXT NOT NULL,
    
    -- Cambios de estado
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    
    -- Cambios de asignación
    previous_assigned_to VARCHAR(50),
    new_assigned_to VARCHAR(50),
    
    -- Comentarios del usuario
    comment TEXT,
    
    -- Evidencia
    evidence_attached BOOLEAN NOT NULL DEFAULT false,
    evidence_reference VARCHAR(200), -- Referencia al documento o archivo
    
    -- Acción tomada
    action_taken TEXT,
    
    -- Usuario que realiza la acción
    performed_by VARCHAR(50) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Información técnica para auditoría
    ip_address VARCHAR(45), -- Soporta IPv4 e IPv6
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT chk_tracking_status_change CHECK (
        (action_type != 'ESTADO_CAMBIADO') OR
        (previous_status IS NOT NULL AND new_status IS NOT NULL)
    ),
    CONSTRAINT chk_tracking_assignment_change CHECK (
        (action_type NOT IN ('ASIGNADA', 'REASIGNADA')) OR
        (new_assigned_to IS NOT NULL)
    )
);

-- Índices
CREATE INDEX idx_tracking_alert ON alert_tracking(alert_id);
CREATE INDEX idx_tracking_performed_at ON alert_tracking(performed_at DESC);
CREATE INDEX idx_tracking_performed_by ON alert_tracking(performed_by);
CREATE INDEX idx_tracking_action_type ON alert_tracking(action_type);

-- Comentarios
COMMENT ON TABLE alert_tracking IS 'Historial inmutable de acciones - NO permite modificación ni eliminación';
COMMENT ON COLUMN alert_tracking.evidence_reference IS 'Ruta o ID del documento de evidencia adjunto';

-- =====================================================
-- 5. TABLA: notifications (Notificaciones)
-- =====================================================
-- Registro de notificaciones enviadas

CREATE TABLE notifications (
    -- Identificación
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(alert_id),
    
    -- Tipo y destinatario
    notification_type notification_type NOT NULL,
    recipient VARCHAR(100) NOT NULL, -- Email, teléfono o userId
    
    -- Contenido
    subject VARCHAR(200),
    body TEXT,
    
    -- Estado de entrega
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_status delivery_status NOT NULL DEFAULT 'PENDIENTE',
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Error si falla
    error_message TEXT,
    
    -- Constraints
    CONSTRAINT chk_notification_delivered CHECK (
        (delivery_status != 'ENTREGADA') OR
        (delivered_at IS NOT NULL)
    ),
    CONSTRAINT chk_notification_read CHECK (
        (read_at IS NULL) OR
        (delivery_status = 'LEIDA' AND delivered_at IS NOT NULL)
    )
);

-- Índices
CREATE INDEX idx_notification_alert ON notifications(alert_id);
CREATE INDEX idx_notification_recipient ON notifications(recipient);
CREATE INDEX idx_notification_sent_at ON notifications(sent_at DESC);
CREATE INDEX idx_notification_status ON notifications(delivery_status);

-- Comentarios
COMMENT ON TABLE notifications IS 'Registro de notificaciones enviadas relacionadas con alertas';

-- =====================================================
-- 6. DATOS INICIALES - Catálogo de Tipos de Alertas
-- =====================================================

INSERT INTO alert_types (alert_code, alert_name, alert_level, origin_module, description, requires_action, default_deadline_days, auto_assignment_rule, escalation_hours, created_by) VALUES
    -- Alertas de PEP
    ('ALT-001', 'PEP Detectado', 'ALTA', 'PEP', 
     'Se ha detectado que la persona es una Persona Expuesta Políticamente (PEP)', 
     true, 3, 'OFICIAL_CUMPLIMIENTO', 48, 'SYSTEM'),
    
    ('ALT-011', 'PEP - Vinculado Detectado', 'MEDIA', 'PEP', 
     'Se ha detectado un vinculado a Persona Expuesta Políticamente', 
     true, 5, 'ANALISTA_CUMPLIMIENTO', 72, 'SYSTEM'),
    
    ('ALT-012', 'PEP - Cambio de Categoría', 'MEDIA', 'PEP', 
     'Cambio en la categoría PEP de la persona', 
     true, 5, 'OFICIAL_CUMPLIMIENTO', 72, 'SYSTEM'),
    
    -- Alertas de Riesgo
    ('ALT-002', 'Riesgo Alto Detectado', 'CRÍTICA', 'RISK', 
     'La evaluación de riesgo ha resultado en un nivel ALTO o superior', 
     true, 1, 'OFICIAL_CUMPLIMIENTO', 24, 'SYSTEM'),
    
    ('ALT-010', 'Incremento Significativo de Riesgo', 'ALTA', 'RISK', 
     'El nivel de riesgo ha incrementado significativamente en la reevaluación', 
     true, 3, 'OFICIAL_CUMPLIMIENTO', 48, 'SYSTEM'),
    
    ('ALT-013', 'Riesgo - Factores Críticos', 'ALTA', 'RISK', 
     'Se han identificado múltiples factores de riesgo críticos', 
     true, 2, 'OFICIAL_CUMPLIMIENTO', 36, 'SYSTEM'),
    
    -- Alertas de Expediente
    ('ALT-003', 'Documentación Vencida', 'MEDIA', 'DOSSIER', 
     'Documentos del expediente han vencido o están próximos a vencer', 
     true, 7, 'ANALISTA_CUMPLIMIENTO', 168, 'SYSTEM'),
    
    ('ALT-005', 'Cambio Sustancial de Perfil', 'MEDIA', 'DOSSIER', 
     'Se ha detectado un cambio significativo en el perfil del cliente', 
     true, 5, 'ANALISTA_CUMPLIMIENTO', 72, 'SYSTEM'),
    
    ('ALT-014', 'Expediente Incompleto', 'BAJA', 'DOSSIER', 
     'El expediente tiene información incompleta o faltan documentos obligatorios', 
     true, 15, 'ANALISTA_CUMPLIMIENTO', NULL, 'SYSTEM'),
    
    -- Alertas de Screening
    ('ALT-004', 'Screening Positivo', 'CRÍTICA', 'SCREENING', 
     'Match positivo en listas restrictivas o de sanciones', 
     true, 1, 'OFICIAL_CUMPLIMIENTO', 24, 'SYSTEM'),
    
    ('ALT-008', 'Lista Negra Internacional', 'CRÍTICA', 'SCREENING', 
     'Coincidencia en listas negras internacionales (OFAC, ONU, UE)', 
     true, 1, 'GERENTE_CUMPLIMIENTO', 12, 'SYSTEM'),
    
    ('ALT-015', 'Screening - Posible Match', 'MEDIA', 'SCREENING', 
     'Posible coincidencia que requiere revisión manual', 
     true, 3, 'ANALISTA_CUMPLIMIENTO', 48, 'SYSTEM'),
    
    -- Alertas de Diligencia Debida
    ('ALT-006', 'Operación Inusual Detectada', 'ALTA', 'DUE_DILIGENCE', 
     'Se ha detectado una operación que no corresponde al perfil del cliente', 
     true, 2, 'OFICIAL_CUMPLIMIENTO', 36, 'SYSTEM'),
    
    ('ALT-009', 'Diligencia Debida Vencida', 'MEDIA', 'DUE_DILIGENCE', 
     'La diligencia debida ha vencido y requiere actualización', 
     true, 7, 'ANALISTA_CUMPLIMIENTO', 120, 'SYSTEM'),
    
    ('ALT-016', 'Transacción Sospechosa', 'CRÍTICA', 'DUE_DILIGENCE', 
     'Transacción con características de lavado de activos', 
     true, 1, 'OFICIAL_CUMPLIMIENTO', 24, 'SYSTEM'),
    
    -- Alertas Geográficas
    ('ALT-007', 'País de Alto Riesgo', 'ALTA', 'RISK', 
     'Relación comercial con país de alto riesgo según GAFI', 
     true, 3, 'OFICIAL_CUMPLIMIENTO', 48, 'SYSTEM'),
    
    ('ALT-017', 'Jurisdicción No Cooperante', 'ALTA', 'RISK', 
     'Operación con jurisdicción no cooperante en materia fiscal', 
     true, 3, 'OFICIAL_CUMPLIMIENTO', 48, 'SYSTEM'),
    
    -- Alertas de Sistema
    ('ALT-018', 'Error en Validación Automática', 'BAJA', 'SYSTEM', 
     'Fallo en proceso de validación automática que requiere revisión manual', 
     true, 10, 'ANALISTA_CUMPLIMIENTO', NULL, 'SYSTEM'),
    
    ('ALT-019', 'Actualización Regulatoria', 'MEDIA', 'SYSTEM', 
     'Nueva regulación requiere revisión de expediente', 
     true, 30, 'OFICIAL_CUMPLIMIENTO', NULL, 'SYSTEM'),
    
    ('ALT-020', 'Vencimiento de Reevaluación', 'MEDIA', 'SYSTEM', 
     'El expediente requiere reevaluación periódica', 
     true, 7, 'ANALISTA_CUMPLIMIENTO', 168, 'SYSTEM');

-- =====================================================
-- 7. VISTAS ÚTILES
-- =====================================================

-- Vista de alertas activas con información del expediente
CREATE OR REPLACE VIEW v_active_alerts AS
SELECT 
    a.alert_id,
    a.alert_code,
    a.alert_type,
    a.alert_level,
    a.status,
    a.detected_at,
    a.assigned_to,
    a.action_deadline,
    a.priority_score,
    a.escalated,
    d.dossier_id,
    d.subject_type,
    d.document_number,
    CASE 
        WHEN a.action_deadline < CURRENT_DATE THEN true 
        ELSE false 
    END AS is_overdue,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - a.detected_at)) AS days_open,
    (SELECT COUNT(*) FROM alert_tracking WHERE alert_id = a.alert_id) AS tracking_count
FROM alerts a
INNER JOIN dossiers d ON a.dossier_id = d.dossier_uuid
WHERE a.status != 'CERRADA'
ORDER BY a.priority_score DESC, a.detected_at ASC;

COMMENT ON VIEW v_active_alerts IS 'Alertas activas con métricas calculadas';

-- Vista de alertas críticas vencidas
CREATE OR REPLACE VIEW v_critical_overdue_alerts AS
SELECT 
    a.alert_id,
    a.alert_code,
    a.alert_type,
    a.status,
    a.assigned_to,
    a.action_deadline,
    d.dossier_id,
    d.document_number,
    d.subject_type,
    (CURRENT_DATE - a.action_deadline) AS days_overdue,
    a.escalated
FROM alerts a
INNER JOIN dossiers d ON a.dossier_id = d.dossier_uuid
WHERE a.alert_level = 'CRÍTICA'
  AND a.status != 'CERRADA'
  AND a.action_deadline < CURRENT_DATE
ORDER BY days_overdue DESC, a.detected_at ASC;

COMMENT ON VIEW v_critical_overdue_alerts IS 'Alertas críticas vencidas que requieren atención urgente';

-- Vista de mis alertas (para usuario actual)
CREATE OR REPLACE VIEW v_my_alerts AS
SELECT 
    a.alert_id,
    a.alert_code,
    a.alert_type,
    a.alert_level,
    a.status,
    a.detected_at,
    a.action_deadline,
    a.priority_score,
    d.dossier_id,
    d.document_number,
    d.entity_name,
    (SELECT MAX(performed_at) FROM alert_tracking WHERE alert_id = a.alert_id) AS last_activity,
    (SELECT COUNT(*) FROM alert_tracking WHERE alert_id = a.alert_id) AS tracking_count
FROM alerts a
INNER JOIN dossiers d ON a.dossier_id = d.dossier_uuid
WHERE a.assigned_to = CURRENT_USER
  AND a.status != 'CERRADA'
ORDER BY a.priority_score DESC, a.detected_at ASC;

COMMENT ON VIEW v_my_alerts IS 'Alertas asignadas al usuario actual';

-- Vista de desempeño por usuario
CREATE OR REPLACE VIEW v_alert_performance_by_user AS
SELECT 
    a.assigned_to AS user_id,
    COUNT(*) FILTER (WHERE a.status = 'CERRADA') AS alerts_closed,
    COUNT(*) FILTER (WHERE a.status != 'CERRADA') AS alerts_open,
    COUNT(*) FILTER (WHERE a.action_deadline < CURRENT_DATE AND a.status != 'CERRADA') AS alerts_overdue,
    AVG(CASE 
        WHEN a.closed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (a.closed_at - a.detected_at)) / 3600 
    END) AS avg_resolution_hours,
    COUNT(*) FILTER (WHERE a.alert_level = 'CRÍTICA' AND a.status != 'CERRADA') AS critical_open,
    COUNT(*) FILTER (WHERE a.escalated = true) AS escalated_count
FROM alerts a
WHERE a.assigned_to IS NOT NULL
GROUP BY a.assigned_to;

COMMENT ON VIEW v_alert_performance_by_user IS 'Métricas de desempeño por usuario en gestión de alertas';

-- =====================================================
-- 8. FUNCIONES ÚTILES
-- =====================================================

-- Función para calcular el priority_score dinámicamente
CREATE OR REPLACE FUNCTION calculate_alert_priority_score(
    p_alert_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_level_weight INTEGER;
    v_days_open INTEGER;
    v_days_overdue INTEGER;
    v_dossier_risk VARCHAR(20);
    v_escalated BOOLEAN;
BEGIN
    SELECT 
        CASE a.alert_level
            WHEN 'CRÍTICA' THEN 40
            WHEN 'ALTA' THEN 30
            WHEN 'MEDIA' THEN 20
            WHEN 'BAJA' THEN 10
        END,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - a.detected_at))::INTEGER,
        CASE 
            WHEN a.action_deadline < CURRENT_DATE 
            THEN (CURRENT_DATE - a.action_deadline)::INTEGER 
            ELSE 0 
        END,
        a.escalated
    INTO v_level_weight, v_days_open, v_days_overdue, v_escalated
    FROM alerts a
    WHERE a.alert_id = p_alert_id;
    
    -- Puntuación base por nivel (40%)
    v_score := v_level_weight;
    
    -- Días vencido (5 puntos por día, máximo 30 puntos)
    v_score := v_score + LEAST(v_days_overdue * 5, 30);
    
    -- Escalada (+20 puntos)
    IF v_escalated THEN
        v_score := v_score + 20;
    END IF;
    
    -- Días abierta (1 punto por día, máximo 10 puntos)
    v_score := v_score + LEAST(v_days_open, 10);
    
    -- Limitar entre 0 y 100
    RETURN LEAST(GREATEST(v_score, 0), 100);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_alert_priority_score IS 'Calcula el puntaje de prioridad dinámico de una alerta';

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Trigger para crear registro de tracking al crear alerta
CREATE OR REPLACE FUNCTION trg_alert_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO alert_tracking (
        alert_id,
        action_type,
        action_description,
        new_status,
        performed_by,
        performed_at
    ) VALUES (
        NEW.alert_id,
        'CREADA',
        'Alerta creada: ' || NEW.alert_type,
        NEW.status::VARCHAR,
        NEW.detected_by,
        NEW.detected_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_created_trigger
AFTER INSERT ON alerts
FOR EACH ROW
EXECUTE FUNCTION trg_alert_created();

-- Trigger para registrar cambios de estado
CREATE OR REPLACE FUNCTION trg_alert_status_changed()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO alert_tracking (
            alert_id,
            action_type,
            action_description,
            previous_status,
            new_status,
            performed_by,
            performed_at
        ) VALUES (
            NEW.alert_id,
            'ESTADO_CAMBIADO',
            'Estado cambiado de ' || OLD.status::VARCHAR || ' a ' || NEW.status::VARCHAR,
            OLD.status::VARCHAR,
            NEW.status::VARCHAR,
            COALESCE(CURRENT_USER, 'SYSTEM'),
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_status_changed_trigger
AFTER UPDATE OF status ON alerts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION trg_alert_status_changed();

-- Trigger para registrar asignaciones
CREATE OR REPLACE FUNCTION trg_alert_assigned()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
        INSERT INTO alert_tracking (
            alert_id,
            action_type,
            action_description,
            previous_assigned_to,
            new_assigned_to,
            performed_by,
            performed_at
        ) VALUES (
            NEW.alert_id,
            CASE WHEN OLD.assigned_to IS NULL THEN 'ASIGNADA' ELSE 'REASIGNADA' END,
            'Asignada a: ' || COALESCE(NEW.assigned_to, 'sin asignar'),
            OLD.assigned_to,
            NEW.assigned_to,
            COALESCE(CURRENT_USER, 'SYSTEM'),
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_assigned_trigger
AFTER UPDATE OF assigned_to ON alerts
FOR EACH ROW
WHEN (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)
EXECUTE FUNCTION trg_alert_assigned();

-- =====================================================
-- 10. POLÍTICAS DE SEGURIDAD
-- =====================================================

-- NO se permite DELETE en alerts ni alert_tracking
CREATE RULE no_delete_alerts AS ON DELETE TO alerts DO INSTEAD NOTHING;
CREATE RULE no_delete_tracking AS ON DELETE TO alert_tracking DO INSTEAD NOTHING;

-- NO se permite UPDATE en alert_tracking (inmutable)
CREATE RULE no_update_tracking AS ON UPDATE TO alert_tracking DO INSTEAD NOTHING;

COMMENT ON RULE no_delete_alerts ON alerts IS 'Política: Las alertas NO pueden eliminarse';
COMMENT ON RULE no_delete_tracking ON alert_tracking IS 'Política: El tracking NO puede eliminarse';
COMMENT ON RULE no_update_tracking ON alert_tracking IS 'Política: El tracking NO puede modificarse';

-- =====================================================
-- 11. PERMISOS
-- =====================================================

-- Rol de analista (solo lectura y tracking)
-- GRANT SELECT ON alerts, alert_types, alert_tracking, notifications TO analista_cumplimiento;
-- GRANT INSERT ON alert_tracking TO analista_cumplimiento;

-- Rol de oficial (gestión completa de alertas)
-- GRANT SELECT, INSERT, UPDATE ON alerts, alert_types TO oficial_cumplimiento;
-- GRANT SELECT, INSERT ON alert_tracking, notifications TO oficial_cumplimiento;

-- Rol de gerente (acceso total incluyendo configuración)
-- GRANT ALL ON alerts, alert_types, alert_tracking, notifications TO gerente_cumplimiento;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
