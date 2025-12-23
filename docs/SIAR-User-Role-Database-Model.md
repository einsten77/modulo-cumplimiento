# SIAR - Modelo de Base de Datos: Usuarios, Roles y Segregación de Funciones

## 1. Introducción

Este documento define el modelo de base de datos para la gestión de usuarios, roles y segregación de funciones del Sistema Integrado de Análisis de Riesgo (SIAR). El diseño cumple con los requisitos regulatorios de SUDEASEG y las mejores prácticas de seguridad.

### 1.1 Principios de Diseño

1. **No Eliminación Física**: Ningún registro de usuario puede ser eliminado físicamente
2. **Trazabilidad Total**: Todos los cambios deben ser registrados en tablas de historial
3. **Segregación de Funciones**: Control estricto de asignación de roles incompatibles
4. **Auditoría Completa**: Integración con el módulo de auditoría inmutable
5. **Roles Predefinidos**: Los roles son del sistema y no pueden ser modificados por usuarios

---

## 2. Arquitectura del Modelo

### 2.1 Diagrama de Relaciones

```
┌─────────────────────┐
│       users         │
│  (Usuario)          │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│    user_roles       │
│  (Asignación)       │
└──────────┬──────────┘
           │
           │ N:1
           │
┌──────────▼──────────┐
│       roles         │
│    (Catálogo)       │
└─────────────────────┘

Relaciones de Soporte:
- users → user_sessions (1:N)
- users → user_change_history (1:N)
```

### 2.2 Principios de Integridad

- **Usuarios Internos**: Empleados de la organización
- **Usuarios Externos**: Auditores e inspectores con acceso temporal
- **Un usuario puede tener múltiples roles activos simultáneamente**
- **Las asignaciones de roles tienen validez temporal**
- **Se valida incompatibilidad de roles (segregación de funciones)**

---

## 3. Entidades Principales

### 3.1 Tabla: `users`

Almacena información de todos los usuarios del sistema (internos y externos).

#### Estructura de la Tabla

| Campo                    | Tipo           | Restricciones                  | Descripción                                    |
|--------------------------|----------------|--------------------------------|------------------------------------------------|
| user_id                  | VARCHAR(36)    | PK, NOT NULL                   | Identificador único UUID                       |
| username                 | VARCHAR(50)    | UNIQUE, NOT NULL               | Nombre de usuario para login                   |
| email                    | VARCHAR(100)   | UNIQUE, NOT NULL               | Correo electrónico                             |
| password_hash            | VARCHAR(255)   | NOT NULL                       | Hash bcrypt de la contraseña                   |
| first_name               | VARCHAR(100)   | NOT NULL                       | Nombre(s)                                      |
| last_name                | VARCHAR(100)   | NOT NULL                       | Apellido(s)                                    |
| identification_type      | CHAR(1)        | NOT NULL, CHECK                | Tipo: V, E, P, J                               |
| identification_number    | VARCHAR(20)    | NOT NULL                       | Número de identificación                       |
| user_type                | VARCHAR(20)    | NOT NULL, CHECK                | INTERNAL, EXTERNAL                             |
| status                   | VARCHAR(20)    | NOT NULL, CHECK                | PENDING_APPROVAL, ACTIVE, INACTIVE, SUSPENDED  |
| organization_area        | VARCHAR(100)   |                                | Área organizacional (internos)                 |
| phone_number             | VARCHAR(20)    |                                | Teléfono de contacto                           |
| position                 | VARCHAR(100)   |                                | Cargo en la organización                       |
| created_by               | VARCHAR(36)    | FK → users                     | Usuario que creó el registro                   |
| created_at               | TIMESTAMP      | NOT NULL, DEFAULT NOW()        | Fecha de creación                              |
| approved_by              | VARCHAR(36)    | FK → users                     | Usuario que aprobó                             |
| approved_at              | TIMESTAMP      |                                | Fecha de aprobación                            |
| last_modified_by         | VARCHAR(36)    | FK → users                     | Último usuario que modificó                    |
| last_modified_at         | TIMESTAMP      |                                | Fecha de última modificación                   |
| inactivated_by           | VARCHAR(36)    | FK → users                     | Usuario que inactivó                           |
| inactivated_at           | TIMESTAMP      |                                | Fecha de inactivación                          |
| inactivation_reason      | TEXT           |                                | Motivo de inactivación                         |
| password_last_changed    | TIMESTAMP      |                                | Última vez que cambió contraseña               |
| must_change_password     | BOOLEAN        | NOT NULL, DEFAULT TRUE         | Requiere cambio de contraseña en próximo login |
| last_login_at            | TIMESTAMP      |                                | Último login exitoso                           |
| login_attempts           | INTEGER        | NOT NULL, DEFAULT 0            | Intentos fallidos de login                     |
| locked_until             | TIMESTAMP      |                                | Bloqueado hasta (por intentos fallidos)        |
| temporal_access_start    | TIMESTAMP      |                                | Inicio de acceso temporal (externos)           |
| temporal_access_end      | TIMESTAMP      |                                | Fin de acceso temporal (externos)              |
| external_organization    | VARCHAR(200)   |                                | Organización externa                           |
| external_access_purpose  | TEXT           |                                | Propósito del acceso externo                   |
| metadata                 | TEXT           |                                | Información adicional en JSON                  |

#### Índices

```sql
CREATE UNIQUE INDEX idx_username ON users(username);
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE UNIQUE INDEX idx_identification ON users(identification_type, identification_number);
CREATE INDEX idx_status ON users(status);
CREATE INDEX idx_user_type ON users(user_type);
CREATE INDEX idx_created_at ON users(created_at);
```

#### Restricciones CHECK

```sql
ALTER TABLE users ADD CONSTRAINT chk_identification_type 
  CHECK (identification_type IN ('V', 'E', 'P', 'J'));

ALTER TABLE users ADD CONSTRAINT chk_user_type 
  CHECK (user_type IN ('INTERNAL', 'EXTERNAL'));

ALTER TABLE users ADD CONSTRAINT chk_status 
  CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'));

ALTER TABLE users ADD CONSTRAINT chk_temporal_access 
  CHECK (temporal_access_end IS NULL OR temporal_access_end > temporal_access_start);
```

#### Reglas de Negocio

1. **Aprobación Obligatoria**: Todo usuario debe ser aprobado por el Oficial de Cumplimiento antes de activarse
2. **Acceso Temporal Externo**: Usuarios externos deben tener definido `temporal_access_start` y `temporal_access_end`
3. **Bloqueo Automático**: Después de 5 intentos fallidos, se bloquea por 30 minutos (`locked_until`)
4. **Cambio de Contraseña**: Primera vez y cada 90 días (`must_change_password`)

---

### 3.2 Tabla: `roles`

Catálogo predefinido de roles del sistema. **Los roles NO pueden ser creados, modificados ni eliminados por usuarios**.

#### Estructura de la Tabla

| Campo                    | Tipo           | Restricciones      | Descripción                                |
|--------------------------|----------------|--------------------|-------------------------------------------|
| role_code                | VARCHAR(10)    | PK, NOT NULL       | Código único: ROL-001 a ROL-011           |
| role_name                | VARCHAR(100)   | NOT NULL           | Nombre descriptivo del rol                |
| role_type                | VARCHAR(20)    | NOT NULL, CHECK    | INTERNAL, EXTERNAL                        |
| description              | TEXT           |                    | Descripción detallada                     |
| is_supervisory           | BOOLEAN        | NOT NULL, DEFAULT  | ¿Es un rol de supervisión?                |
| is_read_only             | BOOLEAN        | NOT NULL, DEFAULT  | ¿Solo lectura?                            |
| is_approver              | BOOLEAN        | NOT NULL, DEFAULT  | ¿Puede aprobar operaciones?               |
| requires_temporal_access | BOOLEAN        | NOT NULL, DEFAULT  | ¿Requiere acceso temporal?                |
| max_concurrent_roles     | INTEGER        | NOT NULL, DEFAULT  | Máximo de roles que puede tener un usuario|
| is_system_role           | BOOLEAN        | NOT NULL, DEFAULT  | ¿Es un rol del sistema?                   |
| can_be_modified          | BOOLEAN        | NOT NULL, DEFAULT  | Siempre FALSE para roles predefinidos     |
| permissions              | TEXT           |                    | Permisos en formato JSON                  |

#### Roles Predefinidos

| Código  | Nombre                           | Tipo     | Supervisión | Aprobador |
|---------|----------------------------------|----------|-------------|-----------|
| ROL-001 | Oficial de Cumplimiento          | INTERNAL | Sí          | Sí        |
| ROL-002 | Gerente de Cumplimiento          | INTERNAL | Sí          | Sí        |
| ROL-003 | Analista de Cumplimiento         | INTERNAL | No          | No        |
| ROL-004 | Oficial de Riesgo                | INTERNAL | No          | Sí        |
| ROL-005 | Analista de Riesgo               | INTERNAL | No          | No        |
| ROL-006 | Supervisor de Unidad de Negocio  | INTERNAL | Sí          | Sí        |
| ROL-007 | Oficial de Unidad de Negocio     | INTERNAL | No          | No        |
| ROL-008 | Auditor Interno                  | INTERNAL | No          | No        |
| ROL-009 | Administrador del Sistema        | INTERNAL | Sí          | Sí        |
| ROL-010 | Auditor Externo                  | EXTERNAL | No          | No        |
| ROL-011 | Inspector SUDEASEG               | EXTERNAL | No          | No        |

#### Restricciones CHECK

```sql
ALTER TABLE roles ADD CONSTRAINT chk_role_type 
  CHECK (role_type IN ('INTERNAL', 'EXTERNAL'));
```

#### Reglas de Negocio

1. **Inmutabilidad**: Los roles predefinidos no pueden ser modificados (`can_be_modified = FALSE`)
2. **Roles Externos**: ROL-010 y ROL-011 son exclusivos para usuarios externos
3. **Segregación de Funciones**: Se valida incompatibilidad entre roles al asignar

---

### 3.3 Tabla: `user_roles`

Tabla de relación muchos-a-muchos entre usuarios y roles, con atributos adicionales de validez temporal y auditoría.

#### Estructura de la Tabla

| Campo              | Tipo           | Restricciones                  | Descripción                                 |
|--------------------|----------------|--------------------------------|---------------------------------------------|
| user_role_id       | VARCHAR(36)    | PK, NOT NULL                   | Identificador único UUID                    |
| user_id            | VARCHAR(36)    | FK → users, NOT NULL           | Usuario al que se asigna el rol             |
| role_code          | VARCHAR(10)    | FK → roles, NOT NULL           | Código del rol asignado                     |
| assigned_by        | VARCHAR(36)    | FK → users                     | Usuario que asignó el rol                   |
| assigned_at        | TIMESTAMP      | NOT NULL, DEFAULT NOW()        | Fecha de asignación                         |
| is_active          | BOOLEAN        | NOT NULL, DEFAULT TRUE         | Estado de la asignación                     |
| valid_from         | TIMESTAMP      | NOT NULL                       | Inicio de vigencia                          |
| valid_until        | TIMESTAMP      |                                | Fin de vigencia (NULL = indefinido)         |
| assignment_reason  | TEXT           |                                | Justificación de la asignación              |
| approved_by        | VARCHAR(36)    | FK → users                     | Usuario que aprobó la asignación            |
| approved_at        | TIMESTAMP      |                                | Fecha de aprobación                         |
| revoked_by         | VARCHAR(36)    | FK → users                     | Usuario que revocó el rol                   |
| revoked_at         | TIMESTAMP      |                                | Fecha de revocación                         |
| revocation_reason  | TEXT           |                                | Motivo de la revocación                     |

#### Índices

```sql
CREATE UNIQUE INDEX idx_user_role ON user_roles(user_id, role_code) 
  WHERE is_active = TRUE;
CREATE INDEX idx_is_active ON user_roles(is_active);
CREATE INDEX idx_valid_until ON user_roles(valid_until);
CREATE INDEX idx_role_code ON user_roles(role_code);
```

#### Restricciones

```sql
ALTER TABLE user_roles ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE user_roles ADD CONSTRAINT fk_role 
  FOREIGN KEY (role_code) REFERENCES roles(role_code);

ALTER TABLE user_roles ADD CONSTRAINT chk_validity_period 
  CHECK (valid_until IS NULL OR valid_until > valid_from);
```

#### Reglas de Negocio

1. **Asignación Única Activa**: Un usuario solo puede tener una asignación activa del mismo rol
2. **Aprobación Requerida**: Asignaciones deben ser aprobadas por Oficial de Cumplimiento
3. **Validez Temporal**: Las asignaciones pueden tener fecha de expiración
4. **Revocación Trazable**: Al revocar un rol, se marca `is_active = FALSE` y se registra auditoría
5. **Mínimo de Roles**: Un usuario debe tener al menos 1 rol activo para poder operar
6. **Máximo de Roles**: Limitado por `max_concurrent_roles` del rol principal

---

## 4. Entidades de Soporte

### 4.1 Tabla: `user_sessions`

Registra las sesiones de usuario para control de acceso y auditoría.

#### Estructura de la Tabla

| Campo            | Tipo           | Restricciones           | Descripción                        |
|------------------|----------------|-------------------------|------------------------------------|
| session_id       | VARCHAR(36)    | PK, NOT NULL            | Identificador único UUID           |
| user_id          | VARCHAR(36)    | FK → users, NOT NULL    | Usuario propietario de la sesión   |
| active_role      | VARCHAR(10)    | FK → roles              | Rol activo en la sesión            |
| login_at         | TIMESTAMP      | NOT NULL                | Fecha y hora de inicio de sesión   |
| logout_at        | TIMESTAMP      |                         | Fecha y hora de cierre de sesión   |
| ip_address       | VARCHAR(45)    |                         | Dirección IP del cliente           |
| user_agent       | TEXT           |                         | Información del navegador/cliente  |
| is_active        | BOOLEAN        | NOT NULL, DEFAULT TRUE  | Sesión activa                      |
| last_activity_at | TIMESTAMP      |                         | Última actividad registrada        |
| login_method     | VARCHAR(20)    | CHECK                   | USERNAME_PASSWORD, SSO, MFA        |

#### Índices

```sql
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_login_at ON user_sessions(login_at);
```

#### Reglas de Negocio

1. **Expiración por Inactividad**: Sesiones expiran después de 8 horas de inactividad
2. **Cierre Automático**: Al cambiar estado de usuario a INACTIVE o SUSPENDED, se cierran todas sus sesiones
3. **Control de Concurrencia**: Un usuario puede tener múltiples sesiones activas simultáneamente

---

### 4.2 Tabla: `user_change_history`

Historial inmutable de todos los cambios realizados a usuarios.

#### Estructura de la Tabla

| Campo                | Tipo           | Restricciones           | Descripción                           |
|----------------------|----------------|-------------------------|---------------------------------------|
| history_id           | VARCHAR(36)    | PK, NOT NULL            | Identificador único UUID              |
| user_id              | VARCHAR(36)    | FK → users, NOT NULL    | Usuario modificado                    |
| change_type          | VARCHAR(50)    | NOT NULL, CHECK         | Tipo de cambio realizado              |
| changed_by           | VARCHAR(36)    | FK → users              | Usuario que realizó el cambio         |
| changed_at           | TIMESTAMP      | NOT NULL, DEFAULT NOW() | Fecha del cambio                      |
| field_changed        | VARCHAR(100)   |                         | Campo modificado                      |
| old_value            | TEXT           |                         | Valor anterior                        |
| new_value            | TEXT           |                         | Valor nuevo                           |
| reason               | TEXT           |                         | Justificación del cambio              |
| ip_address           | VARCHAR(45)    |                         | IP desde donde se realizó el cambio   |
| session_id           | VARCHAR(36)    | FK → user_sessions      | Sesión en la que se realizó el cambio |
| is_approval_required | BOOLEAN        |                         | ¿Requiere aprobación?                 |
| approved_by          | VARCHAR(36)    | FK → users              | Usuario que aprobó                    |
| approved_at          | TIMESTAMP      |                         | Fecha de aprobación                   |
| approval_comment     | TEXT           |                         | Comentario de aprobación              |

#### Tipos de Cambio (change_type)

- `USER_CREATED`: Creación de usuario
- `USER_APPROVED`: Aprobación de usuario
- `USER_MODIFIED`: Modificación de datos
- `USER_INACTIVATED`: Inactivación
- `USER_SUSPENDED`: Suspensión
- `USER_REACTIVATED`: Reactivación
- `ROLE_ASSIGNED`: Asignación de rol
- `ROLE_REVOKED`: Revocación de rol
- `PASSWORD_CHANGED`: Cambio de contraseña
- `PASSWORD_RESET`: Reseteo de contraseña
- `LOGIN_SUCCESS`: Login exitoso
- `LOGIN_FAILED`: Login fallido
- `ACCOUNT_LOCKED`: Cuenta bloqueada
- `ACCOUNT_UNLOCKED`: Cuenta desbloqueada

#### Índices

```sql
CREATE INDEX idx_user_change_history_user_id ON user_change_history(user_id);
CREATE INDEX idx_user_change_history_change_type ON user_change_history(change_type);
CREATE INDEX idx_user_change_history_changed_at ON user_change_history(changed_at);
```

#### Reglas de Negocio

1. **Inmutabilidad**: Los registros de historial NUNCA pueden ser modificados o eliminados
2. **Registro Automático**: Todos los cambios deben ser registrados automáticamente mediante triggers
3. **Aprobación Selectiva**: Ciertos cambios requieren aprobación del Oficial de Cumplimiento

---

## 5. Segregación de Funciones

### 5.1 Matriz de Incompatibilidad de Roles

Los siguientes pares de roles NO pueden ser asignados simultáneamente al mismo usuario:

| Rol 1                      | Rol 2                      | Motivo                                   |
|----------------------------|----------------------------|------------------------------------------|
| ROL-003 (Analista Cump.)   | ROL-001 (Oficial Cump.)    | Conflicto de aprobación                  |
| ROL-005 (Analista Riesgo)  | ROL-004 (Oficial Riesgo)   | Conflicto de aprobación                  |
| ROL-007 (Oficial UN)       | ROL-006 (Supervisor UN)    | Conflicto jerárquico                     |
| ROL-008 (Auditor Interno)  | ROL-003 (Analista Cump.)   | Conflicto de auditoría                   |
| ROL-008 (Auditor Interno)  | ROL-001 (Oficial Cump.)    | Conflicto de auditoría                   |
| ROL-009 (Admin Sistema)    | ROL-001 (Oficial Cump.)    | Concentración excesiva de poder          |

### 5.2 Validación de Incompatibilidad

La validación se realiza mediante una función de base de datos que verifica la matriz antes de asignar roles:

```sql
CREATE OR REPLACE FUNCTION validate_role_compatibility(
    p_user_id VARCHAR,
    p_new_role_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_incompatible_count INTEGER;
BEGIN
    -- Verificar incompatibilidades
    SELECT COUNT(*) INTO v_incompatible_count
    FROM user_roles ur
    JOIN role_incompatibility ri ON 
        (ur.role_code = ri.role_code_1 AND ri.role_code_2 = p_new_role_code)
        OR (ur.role_code = ri.role_code_2 AND ri.role_code_1 = p_new_role_code)
    WHERE ur.user_id = p_user_id
      AND ur.is_active = TRUE;
    
    RETURN v_incompatible_count = 0;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Triggers de Auditoría

### 6.1 Trigger: Prevenir Eliminación Física

```sql
CREATE OR REPLACE FUNCTION prevent_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'No se permite la eliminación física de usuarios. Use inactivación lógica.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_user_deletion
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_user_deletion();
```

### 6.2 Trigger: Registrar Cambios en Historial

```sql
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Registrar cambio de estado
        IF OLD.status <> NEW.status THEN
            INSERT INTO user_change_history (
                user_id, change_type, changed_by, field_changed, 
                old_value, new_value, reason
            ) VALUES (
                NEW.user_id,
                CASE NEW.status
                    WHEN 'ACTIVE' THEN 'USER_APPROVED'
                    WHEN 'INACTIVE' THEN 'USER_INACTIVATED'
                    WHEN 'SUSPENDED' THEN 'USER_SUSPENDED'
                END,
                NEW.last_modified_by,
                'status',
                OLD.status,
                NEW.status,
                NEW.inactivation_reason
            );
        END IF;
        
        -- Registrar cambio de contraseña
        IF OLD.password_hash <> NEW.password_hash THEN
            INSERT INTO user_change_history (
                user_id, change_type, changed_by, field_changed
            ) VALUES (
                NEW.user_id, 'PASSWORD_CHANGED', NEW.last_modified_by, 'password_hash'
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
```

### 6.3 Trigger: Expirar Sesiones al Cambiar Estado

```sql
CREATE OR REPLACE FUNCTION expire_sessions_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('INACTIVE', 'SUSPENDED') AND OLD.status <> NEW.status THEN
        UPDATE user_sessions
        SET is_active = FALSE,
            logout_at = NOW()
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
```

---

## 7. Vistas de Consulta

### 7.1 Vista: Usuarios Activos con Roles

```sql
CREATE VIEW vw_active_users_with_roles AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.user_type,
    u.status,
    u.organization_area,
    STRING_AGG(r.role_name, ', ') AS roles,
    COUNT(ur.user_role_id) AS role_count,
    MAX(us.last_activity_at) AS last_activity
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_code = r.role_code
LEFT JOIN user_sessions us ON u.user_id = us.user_id AND us.is_active = TRUE
WHERE u.status = 'ACTIVE'
GROUP BY u.user_id, u.username, u.email, u.first_name, u.last_name, 
         u.user_type, u.status, u.organization_area;
```

### 7.2 Vista: Roles por Usuario

```sql
CREATE VIEW vw_user_roles_detail AS
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    r.role_code,
    r.role_name,
    r.role_type,
    ur.assigned_at,
    ur.assigned_by,
    ur.valid_from,
    ur.valid_until,
    ur.is_active,
    CASE 
        WHEN ur.valid_until IS NULL THEN 'Indefinido'
        WHEN ur.valid_until > NOW() THEN 'Vigente'
        ELSE 'Expirado'
    END AS validity_status
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_code = r.role_code
WHERE u.status <> 'INACTIVE';
```

### 7.3 Vista: Accesos Temporales Próximos a Vencer

```sql
CREATE VIEW vw_expiring_access AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.external_organization,
    u.temporal_access_end,
    EXTRACT(DAY FROM (u.temporal_access_end - NOW())) AS days_remaining
FROM users u
WHERE u.user_type = 'EXTERNAL'
  AND u.status = 'ACTIVE'
  AND u.temporal_access_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY u.temporal_access_end;
```

---

## 8. Consideraciones de Seguridad

### 8.1 Contraseñas

1. **Hashing**: Utilizar bcrypt con factor de costo mínimo de 12
2. **Complejidad**: Mínimo 8 caracteres, combinación de mayúsculas, minúsculas, números y símbolos
3. **Caducidad**: Cambio obligatorio cada 90 días
4. **Historial**: Evitar reutilización de últimas 5 contraseñas

### 8.2 Control de Acceso

1. **Principio de Menor Privilegio**: Asignar solo los roles necesarios
2. **Aprobación Dual**: Cambios críticos requieren aprobación del Oficial de Cumplimiento
3. **Revisión Periódica**: Auditoría trimestral de asignación de roles
4. **Acceso Temporal**: Usuarios externos con fechas de inicio y fin obligatorias

### 8.3 Auditoría y Trazabilidad

1. **Registro Completo**: Todos los eventos de autenticación y autorización
2. **Inmutabilidad**: Registros de auditoría no pueden ser modificados
3. **Retención**: Conservar logs por mínimo 5 años según regulación SUDEASEG
4. **Integración**: Sincronización con tabla `audit_log` del módulo de auditoría

---

## 9. Procedimientos Almacenados

### 9.1 Crear Usuario con Validación

```sql
CREATE OR REPLACE FUNCTION create_user(
    p_username VARCHAR,
    p_email VARCHAR,
    p_password_hash VARCHAR,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_identification_type CHAR,
    p_identification_number VARCHAR,
    p_user_type VARCHAR,
    p_created_by VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
    v_user_id VARCHAR;
BEGIN
    -- Validar unicidad de username y email
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        RAISE EXCEPTION 'El nombre de usuario ya existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RAISE EXCEPTION 'El correo electrónico ya existe';
    END IF;
    
    -- Validar identificación única
    IF EXISTS (SELECT 1 FROM users 
               WHERE identification_type = p_identification_type 
                 AND identification_number = p_identification_number) THEN
        RAISE EXCEPTION 'La identificación ya está registrada';
    END IF;
    
    -- Insertar usuario
    INSERT INTO users (
        username, email, password_hash, first_name, last_name,
        identification_type, identification_number, user_type,
        status, created_by, created_at
    ) VALUES (
        p_username, p_email, p_password_hash, p_first_name, p_last_name,
        p_identification_type, p_identification_number, p_user_type,
        'PENDING_APPROVAL', p_created_by, NOW()
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
```

### 9.2 Asignar Rol con Validaciones

```sql
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
    -- Validar que el usuario existe y está activo
    SELECT status, user_type INTO v_user_status, v_user_type
    FROM users WHERE user_id = p_user_id;
    
    IF v_user_status IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;
    
    -- Validar que el rol existe
    SELECT role_type INTO v_role_type
    FROM roles WHERE role_code = p_role_code;
    
    IF v_role_type IS NULL THEN
        RAISE EXCEPTION 'Rol no encontrado';
    END IF;
    
    -- Validar compatibilidad de tipo (INTERNAL/EXTERNAL)
    IF v_user_type = 'EXTERNAL' AND v_role_type = 'INTERNAL' THEN
        RAISE EXCEPTION 'No se puede asignar un rol interno a un usuario externo';
    END IF;
    
    IF v_user_type = 'INTERNAL' AND v_role_type = 'EXTERNAL' THEN
        RAISE EXCEPTION 'No se puede asignar un rol externo a un usuario interno';
    END IF;
    
    -- Validar que no tenga ya el rol asignado activamente
    IF EXISTS (SELECT 1 FROM user_roles 
               WHERE user_id = p_user_id 
                 AND role_code = p_role_code 
                 AND is_active = TRUE) THEN
        RAISE EXCEPTION 'El usuario ya tiene este rol asignado';
    END IF;
    
    -- Validar incompatibilidad con otros roles
    IF NOT validate_role_compatibility(p_user_id, p_role_code) THEN
        RAISE EXCEPTION 'El rol es incompatible con otros roles asignados al usuario';
    END IF;
    
    -- Insertar asignación
    INSERT INTO user_roles (
        user_id, role_code, assigned_by, assigned_at, 
        valid_from, valid_until, assignment_reason, is_active
    ) VALUES (
        p_user_id, p_role_code, p_assigned_by, NOW(),
        NOW(), p_valid_until, p_reason, TRUE
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
```

---

## 10. Queries de Ejemplo

### 10.1 Listar Usuarios con Múltiples Roles

```sql
SELECT 
    u.user_id,
    u.username,
    u.first_name || ' ' || u.last_name AS full_name,
    COUNT(ur.user_role_id) AS role_count,
    STRING_AGG(r.role_name, ', ' ORDER BY r.role_code) AS roles
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = TRUE
JOIN roles r ON ur.role_code = r.role_code
WHERE u.status = 'ACTIVE'
GROUP BY u.user_id, u.username, u.first_name, u.last_name
HAVING COUNT(ur.user_role_id) > 1
ORDER BY role_count DESC;
```

### 10.2 Detectar Posibles Conflictos de Segregación

```sql
SELECT 
    u.user_id,
    u.username,
    u.first_name || ' ' || u.last_name AS full_name,
    ur1.role_code AS role1,
    r1.role_name AS role1_name,
    ur2.role_code AS role2,
    r2.role_name AS role2_name,
    'Conflicto potencial' AS warning
FROM users u
JOIN user_roles ur1 ON u.user_id = ur1.user_id AND ur1.is_active = TRUE
JOIN user_roles ur2 ON u.user_id = ur2.user_id AND ur2.is_active = TRUE
JOIN roles r1 ON ur1.role_code = r1.role_code
JOIN roles r2 ON ur2.role_code = r2.role_code
WHERE ur1.role_code < ur2.role_code
  AND u.status = 'ACTIVE'
  AND (
      (ur1.role_code IN ('ROL-001', 'ROL-003') AND ur2.role_code IN ('ROL-001', 'ROL-003'))
      OR (ur1.role_code IN ('ROL-004', 'ROL-005') AND ur2.role_code IN ('ROL-004', 'ROL-005'))
      OR (ur1.role_code = 'ROL-008' AND ur2.role_code IN ('ROL-001', 'ROL-003'))
  );
```

### 10.3 Historial de Cambios de un Usuario

```sql
SELECT 
    uch.changed_at,
    uch.change_type,
    u_changer.username AS changed_by_user,
    uch.field_changed,
    uch.old_value,
    uch.new_value,
    uch.reason,
    CASE 
        WHEN uch.is_approval_required AND uch.approved_at IS NULL THEN 'Pendiente Aprobación'
        WHEN uch.is_approval_required AND uch.approved_at IS NOT NULL THEN 'Aprobado'
        ELSE 'No Requiere Aprobación'
    END AS approval_status
FROM user_change_history uch
LEFT JOIN users u_changer ON uch.changed_by = u_changer.user_id
WHERE uch.user_id = :target_user_id
ORDER BY uch.changed_at DESC
LIMIT 50;
```

---

## 11. Datos de Prueba

### 11.1 Script de Inicialización de Roles

```sql
-- Insertar roles predefinidos del sistema
INSERT INTO roles (role_code, role_name, role_type, description, is_supervisory, is_approver, requires_temporal_access, is_system_role, can_be_modified) VALUES
('ROL-001', 'Oficial de Cumplimiento', 'INTERNAL', 'Responsable principal del cumplimiento normativo', TRUE, TRUE, FALSE, TRUE, FALSE),
('ROL-002', 'Gerente de Cumplimiento', 'INTERNAL', 'Supervisa área de cumplimiento', TRUE, TRUE, FALSE, TRUE, FALSE),
('ROL-003', 'Analista de Cumplimiento', 'INTERNAL', 'Analiza y procesa expedientes', FALSE, FALSE, FALSE, TRUE, FALSE),
('ROL-004', 'Oficial de Riesgo', 'INTERNAL', 'Gestiona evaluaciones de riesgo', FALSE, TRUE, FALSE, TRUE, FALSE),
('ROL-005', 'Analista de Riesgo', 'INTERNAL', 'Realiza análisis de riesgo', FALSE, FALSE, FALSE, TRUE, FALSE),
('ROL-006', 'Supervisor de Unidad de Negocio', 'INTERNAL', 'Supervisa unidad de negocio', TRUE, TRUE, FALSE, TRUE, FALSE),
('ROL-007', 'Oficial de Unidad de Negocio', 'INTERNAL', 'Gestiona relación con clientes', FALSE, FALSE, FALSE, TRUE, FALSE),
('ROL-008', 'Auditor Interno', 'INTERNAL', 'Realiza auditorías internas', FALSE, FALSE, FALSE, TRUE, FALSE),
('ROL-009', 'Administrador del Sistema', 'INTERNAL', 'Administra plataforma SIAR', TRUE, TRUE, FALSE, TRUE, FALSE),
('ROL-010', 'Auditor Externo', 'EXTERNAL', 'Auditor externo de la organización', FALSE, FALSE, TRUE, TRUE, FALSE),
('ROL-011', 'Inspector SUDEASEG', 'EXTERNAL', 'Inspector de la superintendencia', FALSE, FALSE, TRUE, TRUE, FALSE);
```

### 11.2 Crear Usuario de Prueba

```sql
-- Crear usuario de prueba (Oficial de Cumplimiento)
SELECT create_user(
    'jperez',
    'jperez@aseguradora.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIujT1N3sW', -- password: Test123!
    'Juan',
    'Pérez',
    'V',
    '12345678',
    'INTERNAL',
    NULL
);

-- Aprobar usuario
UPDATE users 
SET status = 'ACTIVE', 
    approved_by = user_id, 
    approved_at = NOW()
WHERE username = 'jperez';

-- Asignar rol de Oficial de Cumplimiento
SELECT assign_role_to_user(
    (SELECT user_id FROM users WHERE username = 'jperez'),
    'ROL-001',
    (SELECT user_id FROM users WHERE username = 'jperez'),
    NULL,
    'Usuario inicial del sistema'
);
```

---

## 12. Mantenimiento y Monitoreo

### 12.1 Tarea Programada: Expirar Sesiones Inactivas

```sql
-- Ejecutar diariamente
UPDATE user_sessions
SET is_active = FALSE,
    logout_at = NOW()
WHERE is_active = TRUE
  AND last_activity_at < NOW() - INTERVAL '8 hours';
```

### 12.2 Tarea Programada: Notificar Accesos Externos Próximos a Vencer

```sql
-- Ejecutar diariamente para enviar alertas
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.external_organization,
    u.temporal_access_end,
    EXTRACT(DAY FROM (u.temporal_access_end - NOW())) AS days_remaining
FROM users u
WHERE u.user_type = 'EXTERNAL'
  AND u.status = 'ACTIVE'
  AND u.temporal_access_end BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

### 12.3 Métricas de Monitoreo

```sql
-- Conteo de usuarios por estado
SELECT status, COUNT(*) AS total
FROM users
GROUP BY status;

-- Usuarios con roles pendientes de aprobación
SELECT COUNT(*) AS pending_role_approvals
FROM user_roles
WHERE is_active = TRUE
  AND approved_at IS NULL;

-- Sesiones activas concurrentes
SELECT COUNT(*) AS active_sessions
FROM user_sessions
WHERE is_active = TRUE;
```

---

## 13. Cumplimiento Regulatorio

### 13.1 Requisitos SUDEASEG

1. **Trazabilidad Completa**: ✅ Tabla `user_change_history` con inmutabilidad
2. **No Eliminación Física**: ✅ Trigger `prevent_user_deletion`
3. **Segregación de Funciones**: ✅ Función `validate_role_compatibility`
4. **Aprobación Dual**: ✅ Campos `approved_by` y `approved_at`
5. **Acceso Temporal para Externos**: ✅ Campos `temporal_access_start/end`
6. **Auditoría de Sesiones**: ✅ Tabla `user_sessions`

### 13.2 Documentación de Cumplimiento

- Todos los usuarios requieren aprobación del Oficial de Cumplimiento
- Asignación de roles registrada con justificación y aprobación
- Historial de cambios conservado por mínimo 5 años
- Revisión trimestral de asignación de roles
- Contraseñas con caducidad de 90 días

---

## 14. Conclusión

Este modelo de base de datos proporciona una base sólida para la gestión de usuarios, roles y segregación de funciones del sistema SIAR, cumpliendo con todos los requisitos regulatorios de SUDEASEG y las mejores prácticas de seguridad.

**Características Principales:**

- ✅ No eliminación física de registros
- ✅ Trazabilidad completa mediante historial inmutable
- ✅ Segregación de funciones con validación automática
- ✅ Roles predefinidos e inmutables
- ✅ Soporte para usuarios internos y externos
- ✅ Control de acceso temporal
- ✅ Auditoría exhaustiva de cambios y sesiones
- ✅ Integración con módulo de auditoría del sistema

---

**Versión**: 1.0  
**Fecha**: 2024  
**Autor**: Equipo de Arquitectura SIAR
