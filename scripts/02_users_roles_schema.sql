-- ============================================================================
-- SIAR - Script de Creación de Esquema: Usuarios, Roles y Segregación
-- ============================================================================
-- Descripción: Crea las tablas, índices, constraints, triggers y funciones
--              para el módulo de gestión de usuarios y roles
-- Versión: 1.0
-- Base de Datos: PostgreSQL 14+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: roles (Catálogo de Roles Predefinidos)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    -- Clave primaria
    role_code VARCHAR(10) PRIMARY KEY,
    
    -- Información básica
    role_name VARCHAR(100) NOT NULL,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('INTERNAL', 'EXTERNAL')),
    description TEXT,
    
    -- Características del rol
    is_supervisory BOOLEAN NOT NULL DEFAULT FALSE,
    is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
    is_approver BOOLEAN NOT NULL DEFAULT FALSE,
    requires_temporal_access BOOLEAN NOT NULL DEFAULT FALSE,
    max_concurrent_roles INTEGER NOT NULL DEFAULT 3,
    
    -- Metadatos del sistema
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    can_be_modified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Permisos en formato JSON
    permissions TEXT
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE roles IS 'Catálogo de roles predefinidos del sistema SIAR';
COMMENT ON COLUMN roles.role_code IS 'Código único del rol: ROL-001 a ROL-011';
COMMENT ON COLUMN roles.role_type IS 'Tipo de rol: INTERNAL para empleados, EXTERNAL para auditores/inspectores';
COMMENT ON COLUMN roles.is_supervisory IS 'Indica si el rol tiene funciones de supervisión';
COMMENT ON COLUMN roles.is_approver IS 'Indica si el rol puede aprobar operaciones críticas';
COMMENT ON COLUMN roles.requires_temporal_access IS 'Indica si el rol requiere acceso temporal definido';
COMMENT ON COLUMN roles.can_be_modified IS 'Siempre FALSE - Los roles del sistema no pueden ser modificados';

-- ----------------------------------------------------------------------------
-- 2. TABLA: users (Usuarios del Sistema)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    -- Clave primaria
    user_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    -- Credenciales
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Información personal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    identification_type CHAR(1) NOT NULL CHECK (identification_type IN ('V', 'E', 'P', 'J')),
    identification_number VARCHAR(20) NOT NULL,
    
    -- Clasificación
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('INTERNAL', 'EXTERNAL')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
    
    -- Información organizacional
    organization_area VARCHAR(100),
    phone_number VARCHAR(20),
    position VARCHAR(100),
    
    -- Auditoría de creación
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Auditoría de aprobación
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    
    -- Auditoría de modificación
    last_modified_by VARCHAR(36),
    last_modified_at TIMESTAMP,
    
    -- Auditoría de inactivación
    inactivated_by VARCHAR(36),
    inactivated_at TIMESTAMP,
    inactivation_reason TEXT,
    
    -- Seguridad de contraseña
    password_last_changed TIMESTAMP,
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Control de acceso
    last_login_at TIMESTAMP,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Acceso temporal (usuarios externos)
    temporal_access_start TIMESTAMP,
    temporal_access_end TIMESTAMP,
    external_organization VARCHAR(200),
    external_access_purpose TEXT,
    
    -- Metadatos adicionales
    metadata TEXT,
    
    -- Constraints
    CONSTRAINT chk_temporal_access CHECK (
        temporal_access_end IS NULL OR temporal_access_end > temporal_access_start
    ),
    CONSTRAINT chk_external_temporal CHECK (
        user_type = 'INTERNAL' OR (
            user_type = 'EXTERNAL' AND 
            temporal_access_start IS NOT NULL AND 
            temporal_access_end IS NOT NULL
        )
    )
);

-- Índices
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_identification ON users(identification_type, identification_number);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_temporal_access_end ON users(temporal_access_end) WHERE user_type = 'EXTERNAL';

-- Comentarios
COMMENT ON TABLE users IS 'Usuarios del sistema SIAR (internos y externos)';
COMMENT ON COLUMN users.user_type IS 'INTERNAL: empleados, EXTERNAL: auditores e inspectores';
COMMENT ON COLUMN users.status IS 'Estados: PENDING_APPROVAL, ACTIVE, INACTIVE, SUSPENDED';
COMMENT ON COLUMN users.identification_type IS 'V: venezolano, E: extranjero, P: pasaporte, J: jurídico';
COMMENT ON COLUMN users.locked_until IS 'Bloqueado hasta esta fecha por intentos fallidos de login';
COMMENT ON COLUMN users.temporal_access_start IS 'Fecha de inicio de acceso (usuarios externos)';
COMMENT ON COLUMN users.temporal_access_end IS 'Fecha de fin de acceso (usuarios externos)';

-- ----------------------------------------------------------------------------
-- 3. TABLA: user_roles (Asignación de Roles a Usuarios)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_roles (
    -- Clave primaria
    user_role_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    -- Relaciones
    user_id VARCHAR(36) NOT NULL,
    role_code VARCHAR(10) NOT NULL,
    
    -- Auditoría de asignación
    assigned_by VARCHAR(36),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Vigencia temporal
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    assignment_reason TEXT,
    
    -- Aprobación
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    
    -- Revocación
    revoked_by VARCHAR(36),
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    
    -- Foreign Keys
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_code) REFERENCES roles(role_code),
    
    -- Constraints
    CONSTRAINT chk_validity_period CHECK (
        valid_until IS NULL OR valid_until > valid_from
    )
);

-- Índices
CREATE UNIQUE INDEX idx_user_roles_active_unique ON user_roles(user_id, role_code) 
    WHERE is_active = TRUE;
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_code ON user_roles(role_code);
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX idx_user_roles_valid_until ON user_roles(valid_until);

-- Comentarios
COMMENT ON TABLE user_roles IS 'Asignación de roles a usuarios con vigencia temporal';
COMMENT ON COLUMN user_roles.is_active IS 'TRUE si la asignación está activa';
COMMENT ON COLUMN user_roles.valid_until IS 'NULL indica vigencia indefinida';

-- ----------------------------------------------------------------------------
-- 4. TABLA: user_sessions (Sesiones de Usuario)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_sessions (
    -- Clave primaria
    session_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    -- Relación con usuario
    user_id VARCHAR(36) NOT NULL,
    
    -- Información de sesión
    active_role VARCHAR(10),
    login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP,
    
    -- Información de conexión
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Método de autenticación
    login_method VARCHAR(20) CHECK (login_method IN ('USERNAME_PASSWORD', 'SSO', 'MFA')),
    
    -- Foreign Keys
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_sessions_role FOREIGN KEY (active_role) REFERENCES roles(role_code)
);

-- Índices
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_login_at ON user_sessions(login_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at);

-- Comentarios
COMMENT ON TABLE user_sessions IS 'Registro de sesiones activas e históricas de usuarios';
COMMENT ON COLUMN user_sessions.last_activity_at IS 'Última actividad registrada - sesión expira después de 8 horas';

-- ----------------------------------------------------------------------------
-- 5. TABLA: user_change_history (Historial de Cambios)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_change_history (
    -- Clave primaria
    history_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    
    -- Relación con usuario
    user_id VARCHAR(36) NOT NULL,
    
    -- Tipo de cambio
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'USER_CREATED', 'USER_APPROVED', 'USER_MODIFIED', 'USER_INACTIVATED',
        'USER_SUSPENDED', 'USER_REACTIVATED', 'ROLE_ASSIGNED', 'ROLE_REVOKED',
        'PASSWORD_CHANGED', 'PASSWORD_RESET', 'LOGIN_SUCCESS', 'LOGIN_FAILED',
        'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'
    )),
    
    -- Auditoría del cambio
    changed_by VARCHAR(36),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Detalles del cambio
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    
    -- Contexto de la sesión
    ip_address VARCHAR(45),
    session_id VARCHAR(36),
    
    -- Aprobación (para cambios críticos)
    is_approval_required BOOLEAN,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP,
    approval_comment TEXT,
    
    -- Foreign Keys
    CONSTRAINT fk_user_change_history_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_change_history_session FOREIGN KEY (session_id) REFERENCES user_sessions(session_id)
);

-- Índices
CREATE INDEX idx_user_change_history_user_id ON user_change_history(user_id);
CREATE INDEX idx_user_change_history_change_type ON user_change_history(change_type);
CREATE INDEX idx_user_change_history_changed_at ON user_change_history(changed_at);
CREATE INDEX idx_user_change_history_changed_by ON user_change_history(changed_by);

-- Comentarios
COMMENT ON TABLE user_change_history IS 'Historial inmutable de todos los cambios realizados a usuarios';
COMMENT ON COLUMN user_change_history.change_type IS 'Tipo de cambio realizado al usuario';

-- ----------------------------------------------------------------------------
-- 6. TABLA: role_incompatibility (Matriz de Incompatibilidad de Roles)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS role_incompatibility (
    incompatibility_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    role_code_1 VARCHAR(10) NOT NULL,
    role_code_2 VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_role_incompatibility_role1 FOREIGN KEY (role_code_1) REFERENCES roles(role_code),
    CONSTRAINT fk_role_incompatibility_role2 FOREIGN KEY (role_code_2) REFERENCES roles(role_code),
    
    -- Evitar duplicados
    CONSTRAINT chk_role_order CHECK (role_code_1 < role_code_2),
    CONSTRAINT uq_role_pair UNIQUE (role_code_1, role_code_2)
);

-- Comentarios
COMMENT ON TABLE role_incompatibility IS 'Matriz de incompatibilidad de roles para segregación de funciones';

-- ----------------------------------------------------------------------------
-- 7. FUNCIONES DE VALIDACIÓN
-- ----------------------------------------------------------------------------

-- Función: Validar compatibilidad de roles
CREATE OR REPLACE FUNCTION validate_role_compatibility(
    p_user_id VARCHAR,
    p_new_role_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_incompatible_count INTEGER;
BEGIN
    -- Verificar si el nuevo rol es incompatible con algún rol activo del usuario
    SELECT COUNT(*) INTO v_incompatible_count
    FROM user_roles ur
    JOIN role_incompatibility ri ON 
        (ur.role_code = ri.role_code_1 AND ri.role_code_2 = p_new_role_code)
        OR (ur.role_code = ri.role_code_2 AND ri.role_code_1 = p_new_role_code)
    WHERE ur.user_id = p_user_id
      AND ur.is_active = TRUE
      AND (ur.valid_until IS NULL OR ur.valid_until > CURRENT_TIMESTAMP);
    
    RETURN v_incompatible_count = 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_role_compatibility IS 'Valida que el nuevo rol no sea incompatible con roles activos del usuario';

-- ----------------------------------------------------------------------------
-- 8. TRIGGERS DE PROTECCIÓN Y AUDITORÍA
-- ----------------------------------------------------------------------------

-- Trigger: Prevenir eliminación física de usuarios
CREATE OR REPLACE FUNCTION prevent_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'SIAR-ERR-001: No se permite la eliminación física de usuarios. Use inactivación lógica (status = INACTIVE).';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_user_deletion
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_user_deletion();

COMMENT ON FUNCTION prevent_user_deletion IS 'Previene eliminación física de usuarios - cumplimiento regulatorio';

-- Trigger: Registrar cambios en historial automáticamente
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Cambio de estado
        IF OLD.status <> NEW.status THEN
            INSERT INTO user_change_history (
                user_id, change_type, changed_by, field_changed, 
                old_value, new_value, reason
            ) VALUES (
                NEW.user_id,
                CASE NEW.status
                    WHEN 'ACTIVE' THEN 
                        CASE WHEN OLD.status = 'SUSPENDED' THEN 'USER_REACTIVATED' ELSE 'USER_APPROVED' END
                    WHEN 'INACTIVE' THEN 'USER_INACTIVATED'
                    WHEN 'SUSPENDED' THEN 'USER_SUSPENDED'
                    ELSE 'USER_MODIFIED'
                END,
                NEW.last_modified_by,
                'status',
                OLD.status,
                NEW.status,
                NEW.inactivation_reason
            );
        END IF;
        
        -- Cambio de contraseña
        IF OLD.password_hash <> NEW.password_hash THEN
            INSERT INTO user_change_history (
                user_id, change_type, changed_by, field_changed
            ) VALUES (
                NEW.user_id, 
                'PASSWORD_CHANGED', 
                NEW.last_modified_by, 
                'password_hash'
            );
        END IF;
        
        -- Cambios en datos personales
        IF OLD.email <> NEW.email OR OLD.phone_number <> NEW.phone_number THEN
            INSERT INTO user_change_history (
                user_id, change_type, changed_by, field_changed,
                old_value, new_value
            ) VALUES (
                NEW.user_id,
                'USER_MODIFIED',
                NEW.last_modified_by,
                CASE 
                    WHEN OLD.email <> NEW.email THEN 'email'
                    WHEN OLD.phone_number <> NEW.phone_number THEN 'phone_number'
                END,
                CASE 
                    WHEN OLD.email <> NEW.email THEN OLD.email
                    WHEN OLD.phone_number <> NEW.phone_number THEN OLD.phone_number
                END,
                CASE 
                    WHEN OLD.email <> NEW.email THEN NEW.email
                    WHEN OLD.phone_number <> NEW.phone_number THEN NEW.phone_number
                END
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_user_changes
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION log_user_changes();

COMMENT ON FUNCTION log_user_changes IS 'Registra automáticamente cambios significativos en usuarios';

-- Trigger: Cerrar sesiones al cambiar estado del usuario
CREATE OR REPLACE FUNCTION expire_sessions_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('INACTIVE', 'SUSPENDED') AND OLD.status <> NEW.status THEN
        UPDATE user_sessions
        SET is_active = FALSE,
            logout_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id
          AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expire_sessions
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION expire_sessions_on_status_change();

COMMENT ON FUNCTION expire_sessions_on_status_change IS 'Cierra automáticamente todas las sesiones al inactivar o suspender usuario';

-- Trigger: Prevenir eliminación de historial
CREATE OR REPLACE FUNCTION prevent_history_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'SIAR-ERR-002: No se permite eliminar registros de historial';
    ELSIF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'SIAR-ERR-003: No se permite modificar registros de historial';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_history_deletion
BEFORE DELETE ON user_change_history
FOR EACH ROW
EXECUTE FUNCTION prevent_history_modification();

CREATE TRIGGER trg_prevent_history_update
BEFORE UPDATE ON user_change_history
FOR EACH ROW
EXECUTE FUNCTION prevent_history_modification();

COMMENT ON FUNCTION prevent_history_modification IS 'Garantiza inmutabilidad del historial de cambios';

-- ----------------------------------------------------------------------------
-- 9. VISTAS DE CONSULTA
-- ----------------------------------------------------------------------------

-- Vista: Usuarios activos con sus roles
CREATE OR REPLACE VIEW vw_active_users_with_roles AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.user_type,
    u.status,
    u.organization_area,
    STRING_AGG(DISTINCT r.role_name, ', ' ORDER BY r.role_name) AS roles,
    COUNT(DISTINCT ur.user_role_id) AS role_count,
    MAX(us.last_activity_at) AS last_activity
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
    AND ur.is_active = TRUE
    AND (ur.valid_until IS NULL OR ur.valid_until > CURRENT_TIMESTAMP)
LEFT JOIN roles r ON ur.role_code = r.role_code
LEFT JOIN user_sessions us ON u.user_id = us.user_id AND us.is_active = TRUE
WHERE u.status = 'ACTIVE'
GROUP BY u.user_id, u.username, u.email, u.first_name, u.last_name, 
         u.user_type, u.status, u.organization_area;

-- Vista: Accesos externos próximos a vencer
CREATE OR REPLACE VIEW vw_expiring_external_access AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.first_name || ' ' || u.last_name AS full_name,
    u.external_organization,
    u.temporal_access_end,
    EXTRACT(DAY FROM (u.temporal_access_end - CURRENT_TIMESTAMP))::INTEGER AS days_remaining
FROM users u
WHERE u.user_type = 'EXTERNAL'
  AND u.status = 'ACTIVE'
  AND u.temporal_access_end BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7 days'
ORDER BY u.temporal_access_end;

-- ----------------------------------------------------------------------------
-- 10. PROCEDIMIENTOS ALMACENADOS
-- ----------------------------------------------------------------------------

-- Procedimiento: Crear usuario con validaciones
CREATE OR REPLACE FUNCTION create_user(
    p_username VARCHAR,
    p_email VARCHAR,
    p_password_hash VARCHAR,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_identification_type CHAR,
    p_identification_number VARCHAR,
    p_user_type VARCHAR,
    p_created_by VARCHAR DEFAULT NULL
) RETURNS VARCHAR AS $$
DECLARE
    v_user_id VARCHAR;
BEGIN
    -- Validar unicidad de username
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        RAISE EXCEPTION 'SIAR-ERR-101: El nombre de usuario ya existe';
    END IF;
    
    -- Validar unicidad de email
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RAISE EXCEPTION 'SIAR-ERR-102: El correo electrónico ya existe';
    END IF;
    
    -- Validar unicidad de identificación
    IF EXISTS (SELECT 1 FROM users 
               WHERE identification_type = p_identification_type 
                 AND identification_number = p_identification_number) THEN
        RAISE EXCEPTION 'SIAR-ERR-103: La identificación ya está registrada';
    END IF;
    
    -- Insertar usuario
    INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        identification_type, identification_number, user_type,
        status, created_by, created_at, password_last_changed
    ) VALUES (
        p_username, p_email, p_password_hash, p_first_name, p_last_name,
        p_identification_type, p_identification_number, p_user_type,
        'PENDING_APPROVAL', p_created_by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING user_id INTO v_user_id;
    
    -- Registrar en historial
    INSERT INTO user_change_history (
        user_id, change_type, changed_by
    ) VALUES (
        v_user_id, 'USER_CREATED', p_created_by
    );
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_user IS 'Crea un nuevo usuario con validaciones de unicidad';

-- Procedimiento: Asignar rol a usuario con validaciones
CREATE OR REPLACE FUNCTION assign_role_to_user(
    p_user_id VARCHAR,
    p_role_code VARCHAR,
    p_assigned_by VARCHAR,
    p_valid_until TIMESTAMP DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
) RETURNS VARCHAR AS $$
DECLARE
    v_user_role_id VARCHAR;
    v_user_status VARCHAR;
    v_role_type VARCHAR;
    v_user_type VARCHAR;
BEGIN
    -- Validar que el usuario existe
    SELECT status, user_type INTO v_user_status, v_user_type
    FROM users WHERE user_id = p_user_id;
    
    IF v_user_status IS NULL THEN
        RAISE EXCEPTION 'SIAR-ERR-201: Usuario no encontrado';
    END IF;
    
    -- Validar que el rol existe
    SELECT role_type INTO v_role_type
    FROM roles WHERE role_code = p_role_code;
    
    IF v_role_type IS NULL THEN
        RAISE EXCEPTION 'SIAR-ERR-202: Rol no encontrado';
    END IF;
    
    -- Validar compatibilidad de tipo
    IF v_user_type = 'EXTERNAL' AND v_role_type = 'INTERNAL' THEN
        RAISE EXCEPTION 'SIAR-ERR-203: No se puede asignar un rol interno a un usuario externo';
    END IF;
    
    IF v_user_type = 'INTERNAL' AND v_role_type = 'EXTERNAL' THEN
        RAISE EXCEPTION 'SIAR-ERR-204: No se puede asignar un rol externo a un usuario interno';
    END IF;
    
    -- Validar que no tenga ya el rol activo
    IF EXISTS (SELECT 1 FROM user_roles 
               WHERE user_id = p_user_id 
                 AND role_code = p_role_code 
                 AND is_active = TRUE
                 AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)) THEN
        RAISE EXCEPTION 'SIAR-ERR-205: El usuario ya tiene este rol asignado activamente';
    END IF;
    
    -- Validar incompatibilidad con otros roles
    IF NOT validate_role_compatibility(p_user_id, p_role_code) THEN
        RAISE EXCEPTION 'SIAR-ERR-206: El rol es incompatible con otros roles asignados al usuario';
    END IF;
    
    -- Insertar asignación
    INSERT INTO user_roles (
        user_id, role_code, assigned_by, assigned_at, 
        valid_from, valid_until, assignment_reason, is_active
    ) VALUES (
        p_user_id, p_role_code, p_assigned_by, CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP, p_valid_until, p_reason, TRUE
    ) RETURNING user_role_id INTO v_user_role_id;
    
    -- Registrar en historial
    INSERT INTO user_change_history (
        user_id, change_type, changed_by, new_value, reason
    ) VALUES (
        p_user_id, 'ROLE_ASSIGNED', p_assigned_by, p_role_code, p_reason
    );
    
    RETURN v_user_role_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_role_to_user IS 'Asigna un rol a un usuario con validaciones de compatibilidad';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
