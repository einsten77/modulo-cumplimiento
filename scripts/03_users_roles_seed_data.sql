-- ============================================================================
-- SIAR - Script de Datos Iniciales: Usuarios, Roles y Segregación
-- ============================================================================
-- Descripción: Inserta datos iniciales de roles, incompatibilidades y usuario admin
-- Versión: 1.0
-- Base de Datos: PostgreSQL 14+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. INSERTAR ROLES PREDEFINIDOS DEL SISTEMA
-- ----------------------------------------------------------------------------

INSERT INTO roles (role_code, role_name, role_type, description, is_supervisory, is_read_only, is_approver, requires_temporal_access, max_concurrent_roles, is_system_role, can_be_modified) VALUES
('ROL-001', 'Oficial de Cumplimiento', 'INTERNAL', 
 'Responsable principal del cumplimiento normativo. Aprueba usuarios, expedientes y operaciones críticas. Máxima autoridad en temas de AML/CFT.', 
 TRUE, FALSE, TRUE, FALSE, 2, TRUE, FALSE),

('ROL-002', 'Gerente de Cumplimiento', 'INTERNAL', 
 'Supervisa el área de cumplimiento. Coordina equipos de analistas y reporta al Oficial de Cumplimiento. Puede aprobar operaciones de nivel medio.', 
 TRUE, FALSE, TRUE, FALSE, 3, TRUE, FALSE),

('ROL-003', 'Analista de Cumplimiento', 'INTERNAL', 
 'Analiza expedientes de clientes, realiza evaluaciones de riesgo inicial, procesa solicitudes de debida diligencia. Rol operativo principal.', 
 FALSE, FALSE, FALSE, FALSE, 3, TRUE, FALSE),

('ROL-004', 'Oficial de Riesgo', 'INTERNAL', 
 'Gestiona el proceso de evaluación de riesgo. Configura parámetros, supervisa evaluaciones y aprueba clasificaciones de riesgo.', 
 FALSE, FALSE, TRUE, FALSE, 3, TRUE, FALSE),

('ROL-005', 'Analista de Riesgo', 'INTERNAL', 
 'Realiza análisis de riesgo detallados, ejecuta screening contra listas restrictivas, documenta hallazgos y factores de riesgo.', 
 FALSE, FALSE, FALSE, FALSE, 3, TRUE, FALSE),

('ROL-006', 'Supervisor de Unidad de Negocio', 'INTERNAL', 
 'Supervisa operaciones de la unidad de negocio. Aprueba solicitudes de clientes y coordina con el área de cumplimiento.', 
 TRUE, FALSE, TRUE, FALSE, 2, TRUE, FALSE),

('ROL-007', 'Oficial de Unidad de Negocio', 'INTERNAL', 
 'Gestiona la relación con clientes, captura información, genera solicitudes de evaluación. Primer punto de contacto con el cliente.', 
 FALSE, FALSE, FALSE, FALSE, 2, TRUE, FALSE),

('ROL-008', 'Auditor Interno', 'INTERNAL', 
 'Realiza auditorías internas del sistema y procesos de cumplimiento. Acceso de solo lectura para revisión independiente.', 
 FALSE, TRUE, FALSE, FALSE, 1, TRUE, FALSE),

('ROL-009', 'Administrador del Sistema', 'INTERNAL', 
 'Administra la plataforma SIAR, gestiona usuarios, configuraciones del sistema y permisos. Acceso técnico completo.', 
 TRUE, FALSE, TRUE, FALSE, 1, TRUE, FALSE),

('ROL-010', 'Auditor Externo', 'EXTERNAL', 
 'Auditor externo de la organización. Acceso temporal de solo lectura para revisiones y auditorías externas programadas.', 
 FALSE, TRUE, FALSE, TRUE, 1, TRUE, FALSE),

('ROL-011', 'Inspector SUDEASEG', 'EXTERNAL', 
 'Inspector de la Superintendencia de Seguros. Acceso temporal de solo lectura para inspecciones regulatorias oficiales.', 
 FALSE, TRUE, FALSE, TRUE, 1, TRUE, FALSE);

-- ----------------------------------------------------------------------------
-- 2. INSERTAR MATRIZ DE INCOMPATIBILIDAD DE ROLES
-- ----------------------------------------------------------------------------

INSERT INTO role_incompatibility (role_code_1, role_code_2, reason) VALUES
-- Conflictos de aprobación en la misma área
('ROL-001', 'ROL-003', 'Conflicto de aprobación: el Oficial de Cumplimiento no puede ser también Analista para garantizar segregación en aprobaciones'),
('ROL-004', 'ROL-005', 'Conflicto de aprobación: el Oficial de Riesgo no puede ser también Analista de Riesgo para garantizar independencia en evaluaciones'),

-- Conflictos jerárquicos
('ROL-002', 'ROL-003', 'Conflicto jerárquico: el Gerente de Cumplimiento no puede tener funciones operativas de analista'),
('ROL-006', 'ROL-007', 'Conflicto jerárquico: el Supervisor de Unidad de Negocio no puede ser también Oficial operativo'),

-- Conflictos de auditoría
('ROL-001', 'ROL-008', 'Conflicto de auditoría: el Oficial de Cumplimiento no puede auditar procesos que él mismo supervisa'),
('ROL-002', 'ROL-008', 'Conflicto de auditoría: el Gerente de Cumplimiento no puede auditar su propia área'),
('ROL-003', 'ROL-008', 'Conflicto de auditoría: el Analista de Cumplimiento no puede auditar procesos en los que participa'),
('ROL-004', 'ROL-008', 'Conflicto de auditoría: el Oficial de Riesgo no puede auditar evaluaciones de riesgo que supervisa'),
('ROL-006', 'ROL-008', 'Conflicto de auditoría: el Supervisor de UN no puede auditar operaciones de su unidad'),

-- Concentración excesiva de poder
('ROL-001', 'ROL-009', 'Concentración excesiva de poder: el Oficial de Cumplimiento no puede ser también Administrador del Sistema'),
('ROL-009', 'ROL-003', 'Conflicto técnico-operativo: el Administrador del Sistema no debe tener roles operativos'),
('ROL-009', 'ROL-008', 'Conflicto de auditoría: el Administrador del Sistema no puede ser también Auditor Interno');

-- ----------------------------------------------------------------------------
-- 3. CREAR USUARIO ADMINISTRADOR INICIAL
-- ----------------------------------------------------------------------------

-- Crear usuario admin inicial (contraseña temporal: Admin123!)
-- Hash bcrypt de "Admin123!" con costo 12
SELECT create_user(
    'admin',
    'admin@siar.local',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIujT1N3sW',
    'Administrador',
    'del Sistema',
    'V',
    '00000000',
    'INTERNAL',
    NULL
);

-- Aprobar automáticamente el usuario admin
UPDATE users 
SET status = 'ACTIVE', 
    approved_by = user_id, 
    approved_at = CURRENT_TIMESTAMP,
    must_change_password = TRUE
WHERE username = 'admin';

-- Asignar rol de Administrador del Sistema
SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'admin'),
    'ROL-009',
    (SELECT user_id FROM users WHERE username = 'admin'),
    NULL,
    'Usuario administrador inicial del sistema'
);

-- ----------------------------------------------------------------------------
-- 4. CREAR USUARIO OFICIAL DE CUMPLIMIENTO INICIAL
-- ----------------------------------------------------------------------------

-- Crear usuario oficial de cumplimiento (contraseña temporal: Cumplimiento123!)
-- Hash bcrypt de "Cumplimiento123!" con costo 12
SELECT create_user(
    'oficial.cumplimiento',
    'oficial.cumplimiento@aseguradora.com',
    '$2a$12$N9qo8uLOickgx2ZMRZoMye5IihX8Q1NvmVxaFZpQ3QbLbU9E0B/TC',
    'María',
    'González',
    'V',
    '11111111',
    'INTERNAL',
    (SELECT user_id FROM users WHERE username = 'admin')
);

-- Aprobar usuario
UPDATE users 
SET status = 'ACTIVE', 
    approved_by = (SELECT user_id FROM users WHERE username = 'admin'), 
    approved_at = CURRENT_TIMESTAMP,
    organization_area = 'Cumplimiento',
    position = 'Oficial de Cumplimiento',
    must_change_password = TRUE
WHERE username = 'oficial.cumplimiento';

-- Asignar rol de Oficial de Cumplimiento
SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'),
    'ROL-001',
    (SELECT user_id FROM users WHERE username = 'admin'),
    NULL,
    'Oficial de Cumplimiento principal de la organización'
);

-- ----------------------------------------------------------------------------
-- 5. CREAR USUARIOS DE EJEMPLO PARA PRUEBAS
-- ----------------------------------------------------------------------------

-- Analista de Cumplimiento 1
SELECT create_user(
    'analista.cumplimiento1',
    'analista1@aseguradora.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIujT1N3sW',
    'Juan',
    'Pérez',
    'V',
    '22222222',
    'INTERNAL',
    (SELECT user_id FROM users WHERE username = 'admin')
);

UPDATE users 
SET status = 'ACTIVE', 
    approved_by = (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'), 
    approved_at = CURRENT_TIMESTAMP,
    organization_area = 'Cumplimiento',
    position = 'Analista de Cumplimiento Senior'
WHERE username = 'analista.cumplimiento1';

SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'analista.cumplimiento1'),
    'ROL-003',
    (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'),
    NULL,
    'Analista principal del equipo de cumplimiento'
);

-- Oficial de Riesgo
SELECT create_user(
    'oficial.riesgo',
    'oficial.riesgo@aseguradora.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIujT1N3sW',
    'Carlos',
    'Martínez',
    'V',
    '33333333',
    'INTERNAL',
    (SELECT user_id FROM users WHERE username = 'admin')
);

UPDATE users 
SET status = 'ACTIVE', 
    approved_by = (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'), 
    approved_at = CURRENT_TIMESTAMP,
    organization_area = 'Gestión de Riesgo',
    position = 'Oficial de Riesgo'
WHERE username = 'oficial.riesgo';

SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'oficial.riesgo'),
    'ROL-004',
    (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'),
    NULL,
    'Responsable de evaluaciones de riesgo'
);

-- Auditor Interno
SELECT create_user(
    'auditor.interno',
    'auditor.interno@aseguradora.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIujT1N3sW',
    'Ana',
    'Rodríguez',
    'V',
    '44444444',
    'INTERNAL',
    (SELECT user_id FROM users WHERE username = 'admin')
);

UPDATE users 
SET status = 'ACTIVE', 
    approved_by = (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'), 
    approved_at = CURRENT_TIMESTAMP,
    organization_area = 'Auditoría Interna',
    position = 'Auditor Interno Senior'
WHERE username = 'auditor.interno';

SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'auditor.interno'),
    'ROL-008',
    (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'),
    NULL,
    'Auditor interno de procesos de cumplimiento'
);

-- Usuario Externo de Ejemplo (Auditor Externo temporal)
SELECT create_user(
    'auditor.externo',
    'auditor.externo@auditoria.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIujT1N3sW',
    'Pedro',
    'Sánchez',
    'E',
    '55555555',
    'EXTERNAL',
    (SELECT user_id FROM users WHERE username = 'admin')
);

UPDATE users 
SET status = 'ACTIVE', 
    approved_by = (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'), 
    approved_at = CURRENT_TIMESTAMP,
    external_organization = 'Auditoría y Consultoría S.A.',
    external_access_purpose = 'Auditoría anual de cumplimiento 2024',
    temporal_access_start = CURRENT_TIMESTAMP,
    temporal_access_end = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE username = 'auditor.externo';

SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'auditor.externo'),
    'ROL-010',
    (SELECT user_id FROM users WHERE username = 'oficial.cumplimiento'),
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'Acceso temporal para auditoría anual'
);

-- ============================================================================
-- RESUMEN DE USUARIOS CREADOS
-- ============================================================================

-- Mostrar resumen de usuarios creados
SELECT 
    u.username,
    u.first_name || ' ' || u.last_name AS nombre_completo,
    u.user_type AS tipo_usuario,
    u.status AS estado,
    STRING_AGG(r.role_name, ', ') AS roles_asignados,
    CASE 
        WHEN u.user_type = 'EXTERNAL' THEN u.temporal_access_end::TEXT
        ELSE 'N/A'
    END AS acceso_hasta
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_code = r.role_code
GROUP BY u.username, u.first_name, u.last_name, u.user_type, u.status, u.temporal_access_end
ORDER BY u.created_at;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
