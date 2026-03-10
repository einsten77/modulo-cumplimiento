-- ============================================================================
-- Script de Creación de Tablas del Módulo PEP
-- Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR)
-- ============================================================================

-- Catálogo de Tipos de PEP
CREATE TABLE pep_type_catalog (
    type_id BIGSERIAL PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(200) NOT NULL,
    type_category VARCHAR(50) NOT NULL,  -- DIRECT, FAMILY, ASSOCIATE
    description TEXT,
    risk_weight INTEGER NOT NULL,  -- 1-5
    requires_edd BOOLEAN NOT NULL DEFAULT FALSE,
    monitoring_frequency VARCHAR(50) NOT NULL,  -- MONTHLY, QUARTERLY, BIANNUAL, ANNUAL
    regulatory_reference VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL
);

-- Tabla principal de estatus PEP
CREATE TABLE pep_status (
    pep_id BIGSERIAL PRIMARY KEY,
    pep_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    dossier_id BIGINT NOT NULL,
    
    -- Estado PEP
    is_pep BOOLEAN NOT NULL DEFAULT FALSE,
    pep_type VARCHAR(50),  -- DIRECT, FAMILY, ASSOCIATE, NONE
    pep_classification VARCHAR(50),  -- NATIONAL, FOREIGN, INTERNATIONAL_ORG, EX_PEP
    current_status VARCHAR(50) NOT NULL,  -- ACTIVE, INACTIVE, UNDER_REVIEW, VERIFIED
    
    -- Fechas de gestión
    effective_date DATE NOT NULL,
    end_date DATE,
    declaration_date DATE NOT NULL,
    verification_date DATE,
    last_review_date DATE,
    next_review_date DATE,
    
    -- Fuente de información
    information_source VARCHAR(100) NOT NULL,  -- SELF_DECLARATION, PUBLIC_DATABASE, THIRD_PARTY
    verification_source VARCHAR(200),
    verification_method VARCHAR(100),  -- DOCUMENTARY, DATABASE_MATCH, OFFICIAL_REGISTRY
    external_reference VARCHAR(200),
    
    -- Evaluación de riesgo
    risk_level VARCHAR(20) NOT NULL,  -- LOW, MEDIUM, HIGH, CRITICAL
    risk_score DECIMAL(5,2),
    requires_edd BOOLEAN NOT NULL DEFAULT FALSE,
    edd_status VARCHAR(50),  -- NOT_REQUIRED, PENDING, IN_PROGRESS, COMPLETED
    monitoring_frequency VARCHAR(50),  -- MONTHLY, QUARTERLY, BIANNUAL, ANNUAL
    
    -- Control
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    approval_status VARCHAR(50),  -- PENDING, APPROVED, REJECTED
    
    -- Observaciones
    notes TEXT,
    internal_comments TEXT,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    
    -- Relaciones y constraints
    CONSTRAINT fk_pep_dossier FOREIGN KEY (dossier_id) 
        REFERENCES dossiers(dossier_id) ON DELETE RESTRICT,
    CONSTRAINT idx_pep_dossier_unique UNIQUE (dossier_id, effective_date)
);

-- Tabla de cargos/posiciones de PEP
CREATE TABLE pep_position (
    position_id BIGSERIAL PRIMARY KEY,
    position_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    pep_id BIGINT NOT NULL,
    
    -- Tipo de posición
    position_type VARCHAR(50) NOT NULL,
    position_title VARCHAR(300) NOT NULL,
    position_level VARCHAR(50),  -- NATIONAL, STATE, MUNICIPAL, INTERNATIONAL
    
    -- Institución
    institution_name VARCHAR(300) NOT NULL,
    institution_type VARCHAR(100),  -- EXECUTIVE, LEGISLATIVE, JUDICIAL, MILITARY, SOE
    institution_sector VARCHAR(100),  -- PUBLIC, MIXED, INTERNATIONAL
    jurisdiction VARCHAR(100) NOT NULL,  -- País o jurisdicción
    
    -- Fechas
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Verificación
    verification_source VARCHAR(200),
    verification_method VARCHAR(100),
    document_reference VARCHAR(200),
    verification_date DATE,
    last_verification_date DATE,
    
    -- Control
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    requires_update BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Observaciones
    responsibilities TEXT,
    notes TEXT,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_position_pep FOREIGN KEY (pep_id) 
        REFERENCES pep_status(pep_id) ON DELETE CASCADE
);

-- Tabla de relaciones PEP (familiares y asociados)
CREATE TABLE pep_relationship (
    relationship_id BIGSERIAL PRIMARY KEY,
    relationship_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    
    -- PEP principal y relacionado
    pep_id BIGINT NOT NULL,
    related_pep_id BIGINT,
    related_person_name VARCHAR(300),
    related_person_document VARCHAR(100),
    related_person_position VARCHAR(300),
    
    -- Tipo de relación
    relationship_type VARCHAR(50) NOT NULL,  -- FAMILY, ASSOCIATE
    relationship_nature VARCHAR(100) NOT NULL,  -- SPOUSE, CHILD, BUSINESS_PARTNER
    relationship_degree VARCHAR(50),  -- FIRST_DEGREE, SECOND_DEGREE
    
    -- Fechas
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Verificación
    verification_source VARCHAR(200),
    verification_method VARCHAR(100),
    document_reference VARCHAR(200),
    verification_date DATE,
    
    -- Detalles adicionales
    business_relationship_description TEXT,
    financial_links_description TEXT,
    
    -- Observaciones
    notes TEXT,
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_relationship_pep FOREIGN KEY (pep_id) 
        REFERENCES pep_status(pep_id) ON DELETE CASCADE,
    CONSTRAINT fk_relationship_related_pep FOREIGN KEY (related_pep_id) 
        REFERENCES pep_status(pep_id) ON DELETE SET NULL
);

-- Tabla de historial de cambios PEP
CREATE TABLE pep_history (
    history_id BIGSERIAL PRIMARY KEY,
    history_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    pep_id BIGINT NOT NULL,
    
    -- Tipo de cambio
    change_type VARCHAR(50) NOT NULL,  -- STATUS_CHANGE, POSITION_CHANGE, VERIFICATION
    change_category VARCHAR(50),  -- PROMOTION, TERMINATION, NEW_POSITION
    change_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Valores
    previous_value JSONB,
    new_value JSONB,
    
    -- Contexto del cambio
    change_reason VARCHAR(500),
    change_justification TEXT,
    document_reference VARCHAR(200),
    
    -- Fuente
    information_source VARCHAR(100) NOT NULL,
    verification_source VARCHAR(200),
    external_reference VARCHAR(200),
    
    -- Impacto
    impact_on_risk BOOLEAN NOT NULL DEFAULT FALSE,
    previous_risk_level VARCHAR(20),
    new_risk_level VARCHAR(20),
    
    -- Control regulatorio
    is_regulatory_event BOOLEAN NOT NULL DEFAULT FALSE,
    requires_notification BOOLEAN NOT NULL DEFAULT FALSE,
    notification_date TIMESTAMP,
    
    -- Usuario
    changed_by VARCHAR(100) NOT NULL,
    changed_by_role VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    
    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_history_pep FOREIGN KEY (pep_id) 
        REFERENCES pep_status(pep_id) ON DELETE CASCADE
);

-- Índices para optimización
CREATE INDEX idx_pep_status_is_pep ON pep_status(is_pep) WHERE is_pep = TRUE;
CREATE INDEX idx_pep_status_type ON pep_status(pep_type);
CREATE INDEX idx_pep_status_risk ON pep_status(risk_level);
CREATE INDEX idx_pep_status_review ON pep_status(next_review_date) WHERE is_active = TRUE;
CREATE INDEX idx_pep_status_verification ON pep_status(verification_date);

CREATE INDEX idx_position_pep ON pep_position(pep_id);
CREATE INDEX idx_position_current ON pep_position(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_position_type ON pep_position(position_type);
CREATE INDEX idx_position_institution ON pep_position(institution_name);
CREATE INDEX idx_position_dates ON pep_position(start_date, end_date);

CREATE INDEX idx_relationship_pep ON pep_relationship(pep_id);
CREATE INDEX idx_relationship_related ON pep_relationship(related_pep_id);
CREATE INDEX idx_relationship_type ON pep_relationship(relationship_type);
CREATE INDEX idx_relationship_active ON pep_relationship(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_history_pep ON pep_history(pep_id);
CREATE INDEX idx_history_date ON pep_history(change_date DESC);
CREATE INDEX idx_history_type ON pep_history(change_type);
CREATE INDEX idx_history_regulatory ON pep_history(is_regulatory_event) WHERE is_regulatory_event = TRUE;

-- Datos iniciales del catálogo de tipos PEP
INSERT INTO pep_type_catalog (type_code, type_name, type_category, risk_weight, requires_edd, monitoring_frequency, regulatory_reference, created_by, updated_by) VALUES
-- PEP Directo
('PEP_DIRECT_EXECUTIVE', 'Jefe de Estado o Gobierno', 'DIRECT', 5, TRUE, 'MONTHLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_MINISTER', 'Ministro o equivalente', 'DIRECT', 5, TRUE, 'MONTHLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_LEGISLATOR', 'Legislador (Diputado/Senador)', 'DIRECT', 5, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_JUDGE', 'Magistrado de Alto Tribunal', 'DIRECT', 5, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_MILITARY', 'Oficial de Alto Rango Militar', 'DIRECT', 5, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_DIPLOMAT', 'Embajador o Alto Funcionario Diplomático', 'DIRECT', 5, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_SOE', 'Directivo de Empresa Estatal', 'DIRECT', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_PARTY', 'Dirigente de Partido Político', 'DIRECT', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_DIRECT_REGULATOR', 'Funcionario de Ente Regulador', 'DIRECT', 5, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),

-- PEP Familiar
('PEP_FAMILY_SPOUSE', 'Cónyuge o Pareja', 'FAMILY', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_FAMILY_CHILD', 'Hijo/a', 'FAMILY', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_FAMILY_PARENT', 'Padre/Madre', 'FAMILY', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_FAMILY_SIBLING', 'Hermano/a', 'FAMILY', 3, TRUE, 'BIANNUAL', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_FAMILY_GRANDPARENT', 'Abuelo/a', 'FAMILY', 3, FALSE, 'BIANNUAL', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_FAMILY_GRANDCHILD', 'Nieto/a', 'FAMILY', 3, FALSE, 'BIANNUAL', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_FAMILY_INLAW', 'Suegro/a o Cuñado/a', 'FAMILY', 3, FALSE, 'BIANNUAL', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),

-- PEP Asociado
('PEP_ASSOCIATE_BUSINESS', 'Socio Comercial Conocido', 'ASSOCIATE', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_ASSOCIATE_FINANCIAL', 'Asociado Financiero', 'ASSOCIATE', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_ASSOCIATE_LEGAL', 'Beneficiario Final Conjunto', 'ASSOCIATE', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('PEP_ASSOCIATE_PROXY', 'Representante o Apoderado', 'ASSOCIATE', 3, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),

-- Ex-PEP
('EX_PEP_RECENT', 'Ex-PEP (menos de 2 años)', 'DIRECT', 4, TRUE, 'QUARTERLY', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM'),
('EX_PEP_PAST', 'Ex-PEP (más de 2 años)', 'DIRECT', 2, FALSE, 'ANNUAL', 'Providencia 083.18 Art. 8', 'SYSTEM', 'SYSTEM');

-- Comentarios de documentación
COMMENT ON TABLE pep_status IS 'Tabla principal que almacena el estatus PEP de expedientes';
COMMENT ON TABLE pep_position IS 'Cargos y posiciones ocupadas por PEPs';
COMMENT ON TABLE pep_relationship IS 'Relaciones de familiares y asociados con PEPs directos';
COMMENT ON TABLE pep_history IS 'Historial inmutable de cambios en información PEP';
COMMENT ON TABLE pep_type_catalog IS 'Catálogo de tipos de PEP con sus características';
