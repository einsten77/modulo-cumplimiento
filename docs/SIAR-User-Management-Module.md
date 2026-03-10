# Módulo de Gestión de Usuarios, Roles y Segregación de Funciones - SIAR

## 1. Introducción

Este documento define el módulo de Gestión de Usuarios, Roles y Segregación de Funciones para el Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR), diseñado para una empresa de seguros regulada en Venezuela.

### Propósito del Módulo

- Administrar el ciclo de vida completo de usuarios internos y externos
- Asignar roles conforme a principios estrictos de segregación de funciones
- Evitar conflictos de interés mediante validaciones de incompatibilidad de roles
- Garantizar trazabilidad total de todos los cambios
- Integrar con los módulos de Autenticación, Auditoría y Alertas

### Principios Fundamentales

1. **Segregación de Funciones**: Separación estricta entre roles operativos y de supervisión
2. **Trazabilidad Total**: Todo cambio de usuario o rol queda registrado permanentemente
3. **Control Centralizado**: Solo el Oficial de Cumplimiento puede administrar usuarios
4. **No Auto-Modificación**: Ningún usuario puede modificar sus propios permisos
5. **Inmutabilidad**: No se permite eliminación física de usuarios
6. **Alertas Automáticas**: Toda modificación genera alerta al Oficial de Cumplimiento
7. **Acceso Temporal para Externos**: Auditores e inspectores con acceso limitado en tiempo

---

## 2. Roles del Sistema

### 2.1 Roles Predefinidos (No Editables)

El sistema cuenta con 11 roles predefinidos que NO pueden ser creados, editados ni eliminados:

| Código | Nombre | Tipo | Descripción |
|--------|--------|------|-------------|
| ROL-001 | Oficial de Cumplimiento | Interno | Máxima autoridad en cumplimiento |
| ROL-002 | Área de Cumplimiento | Interno | Equipo operativo de cumplimiento |
| ROL-003 | Comercial | Interno | Gestión de clientes e intermediarios |
| ROL-004 | Operaciones | Interno | Operaciones diarias |
| ROL-005 | Administración | Interno | Gestión administrativa |
| ROL-006 | Técnico | Interno | Área técnica y reaseguros |
| ROL-007 | Recursos Humanos | Interno | Gestión de personal |
| ROL-008 | Auditoría | Interno | Auditoría interna (solo lectura) |
| ROL-009 | Contraloría | Interno | Contraloría interna (solo lectura) |
| ROL-010 | Auditores Externos | Externo | Auditores contratados (temporal) |
| ROL-011 | Inspectores SUDEASEG | Externo | Inspectores regulatorios (temporal) |

### 2.2 Características de los Roles

#### Roles Operativos
- Pueden crear y modificar expedientes
- Requieren aprobación del Oficial de Cumplimiento
- No pueden aprobar sus propias creaciones

#### Roles de Supervisión
- Auditoría y Contraloría: Solo lectura en todo el sistema
- No pueden modificar información operativa
- Acceso total al log de auditoría

#### Roles Externos
- Acceso temporal con fecha de inicio y fin
- Solo lectura (salvo excepciones autorizadas)
- Trazabilidad completa de todas sus acciones
- Requieren aprobación del Oficial de Cumplimiento

---

## 3. Modelo de Datos

### 3.1 Entidad: Usuario

```json
{
  "userId": "UUID único del usuario",
  "username": "Nombre de usuario (único, inmutable)",
  "email": "Email corporativo (único)",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "identification": {
    "type": "V|E|P|J",
    "number": "Número de identificación"
  },
  "userType": "INTERNAL|EXTERNAL",
  "status": "ACTIVE|INACTIVE|SUSPENDED|PENDING_APPROVAL",
  "organizationArea": "Área organizacional del usuario interno",
  "phoneNumber": "Teléfono de contacto",
  "position": "Cargo dentro de la organización",
  "createdBy": "ID del usuario que creó este usuario",
  "createdAt": "Fecha de creación ISO 8601",
  "approvedBy": "ID del Oficial que aprobó el usuario",
  "approvedAt": "Fecha de aprobación",
  "lastModifiedBy": "ID del último usuario que modificó",
  "lastModifiedAt": "Fecha de última modificación",
  "inactivatedBy": "ID del usuario que inactivó",
  "inactivatedAt": "Fecha de inactivación",
  "inactivationReason": "Razón de inactivación",
  "passwordLastChanged": "Fecha del último cambio de contraseña",
  "lastLoginAt": "Fecha del último inicio de sesión",
  "loginAttempts": "Intentos de login fallidos consecutivos",
  "lockedUntil": "Fecha hasta la cual está bloqueado (si aplica)",
  "temporalAccessStart": "Fecha inicio acceso temporal (externos)",
  "temporalAccessEnd": "Fecha fin acceso temporal (externos)",
  "externalOrganization": "Organización del usuario externo",
  "externalAccessPurpose": "Propósito del acceso externo",
  "metadata": {
    "additionalField1": "value",
    "additionalField2": "value"
  }
}
```

### 3.2 Entidad: UsuarioRol (Asignación de Roles)

```json
{
  "userRoleId": "UUID único de la asignación",
  "userId": "ID del usuario",
  "roleCode": "Código del rol (ROL-001 a ROL-011)",
  "assignedBy": "ID del usuario que asignó el rol",
  "assignedAt": "Fecha de asignación ISO 8601",
  "isActive": true,
  "validFrom": "Fecha desde la cual es válido",
  "validUntil": "Fecha hasta la cual es válido (null = indefinido)",
  "assignmentReason": "Razón de la asignación del rol",
  "approvedBy": "ID del Oficial que aprobó la asignación",
  "approvedAt": "Fecha de aprobación",
  "revokedBy": "ID del usuario que revocó el rol",
  "revokedAt": "Fecha de revocación",
  "revocationReason": "Razón de revocación del rol"
}
```

### 3.3 Entidad: Role (Catálogo de Roles)

```json
{
  "roleCode": "ROL-001",
  "roleName": "Oficial de Cumplimiento",
  "roleType": "INTERNAL|EXTERNAL",
  "description": "Máxima autoridad en materia de cumplimiento",
  "isSupervisory": false,
  "isReadOnly": false,
  "isApprover": true,
  "requiresTemporalAccess": false,
  "maxConcurrentRoles": 1,
  "permissions": [
    {
      "module": "DOSSIER_MANAGEMENT",
      "actions": ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"]
    },
    {
      "module": "RISK_ASSESSMENT",
      "actions": ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"]
    }
  ],
  "isSystemRole": true,
  "canBeModified": false
}
```

### 3.4 Entidad: RoleIncompatibility (Incompatibilidades de Roles)

```json
{
  "incompatibilityId": "UUID único",
  "roleCode1": "ROL-003",
  "roleCode2": "ROL-008",
  "reason": "Conflicto entre rol operativo y supervisión",
  "severity": "BLOCKING|WARNING",
  "isActive": true,
  "createdBy": "Sistema o ID de usuario",
  "createdAt": "Fecha de creación"
}
```

### 3.5 Entidad: UserChangeHistory (Historial de Cambios)

```json
{
  "historyId": "UUID único",
  "userId": "ID del usuario afectado",
  "changeType": "USER_CREATED|USER_MODIFIED|USER_ACTIVATED|USER_INACTIVATED|USER_SUSPENDED|ROLE_ASSIGNED|ROLE_REVOKED|PASSWORD_CHANGED|STATUS_CHANGED",
  "changedBy": "ID del usuario que realizó el cambio",
  "changedAt": "Fecha del cambio ISO 8601",
  "fieldChanged": "Campo específico modificado",
  "oldValue": "Valor anterior (JSON)",
  "newValue": "Valor nuevo (JSON)",
  "reason": "Justificación del cambio",
  "ipAddress": "IP desde donde se realizó el cambio",
  "sessionId": "ID de sesión",
  "isApprovalRequired": true,
  "approvedBy": "ID del aprobador",
  "approvedAt": "Fecha de aprobación",
  "approvalComment": "Comentario del aprobador"
}
```

### 3.6 Entidad: UserSession (Sesiones de Usuario)

```json
{
  "sessionId": "UUID único de sesión",
  "userId": "ID del usuario",
  "activeRole": "Rol activo en esta sesión",
  "loginAt": "Fecha de inicio de sesión",
  "logoutAt": "Fecha de cierre de sesión (null si activa)",
  "ipAddress": "Dirección IP del cliente",
  "userAgent": "User agent del navegador",
  "isActive": true,
  "lastActivityAt": "Última actividad registrada",
  "sessionDuration": "Duración en segundos",
  "loginMethod": "PASSWORD|SSO|API_KEY"
}
```

---

## 4. Reglas de Negocio

### 4.1 Segregación de Funciones

#### Incompatibilidades Obligatorias

Las siguientes combinaciones de roles están PROHIBIDAS:

| Rol 1 | Rol 2 | Razón |
|-------|-------|-------|
| Oficial de Cumplimiento | Cualquier otro rol | Independencia y autoridad única |
| Área de Cumplimiento | Auditoría | Conflicto supervisión vs operación |
| Área de Cumplimiento | Contraloría | Conflicto supervisión vs operación |
| Comercial | Auditoría | Conflicto operación vs supervisión |
| Comercial | Contraloría | Conflicto operación vs supervisión |
| Operaciones | Auditoría | Conflicto operación vs supervisión |
| Operaciones | Contraloría | Conflicto operación vs supervisión |
| Administración | Auditoría | Conflicto operación vs supervisión |
| Administración | Contraloría | Conflicto operación vs supervisión |
| Técnico | Auditoría | Conflicto operación vs supervisión |
| Técnico | Contraloría | Conflicto operación vs supervisión |
| Recursos Humanos | Auditoría | Conflicto operación vs supervisión |
| Recursos Humanos | Contraloría | Conflicto operación vs supervisión |
| Auditoría | Contraloría | Redundancia de supervisión |

#### Reglas de Validación

1. **Oficial de Cumplimiento Único**: Solo puede existir un usuario con rol ROL-001 activo
2. **No Auto-Asignación**: Un usuario no puede asignarse o revocarse roles a sí mismo
3. **No Auto-Modificación del Oficial**: El Oficial de Cumplimiento no puede modificar sus propios permisos sin aprobación externa documentada
4. **Roles Múltiples Permitidos**: Un usuario puede tener múltiples roles si son compatibles (ej: Comercial + Operaciones)
5. **Validación al Asignar**: El sistema valida incompatibilidades antes de asignar un nuevo rol
6. **Alertas en Asignación**: Toda asignación de rol genera alerta al Oficial de Cumplimiento

### 4.2 Estados del Usuario

#### Transiciones de Estado

```
[PENDING_APPROVAL] → [ACTIVE]: Aprobación del Oficial
[PENDING_APPROVAL] → [INACTIVE]: Rechazo del Oficial
[ACTIVE] → [INACTIVE]: Inactivación por Oficial
[ACTIVE] → [SUSPENDED]: Suspensión temporal por Oficial
[SUSPENDED] → [ACTIVE]: Reactivación por Oficial
[INACTIVE] → [ACTIVE]: Reactivación por Oficial
```

#### Reglas por Estado

- **PENDING_APPROVAL**: Usuario creado pero sin acceso al sistema
- **ACTIVE**: Usuario con acceso completo según sus roles
- **INACTIVE**: Sin acceso, no visible en listas activas (soft delete)
- **SUSPENDED**: Sin acceso temporal, requiere investigación o auditoría

### 4.3 Gestión de Contraseñas

1. **Cambio Obligatorio**: Primera vez que inicia sesión
2. **Cambio Periódico**: Cada 90 días para usuarios internos
3. **Bloqueo por Intentos**: 5 intentos fallidos = bloqueo temporal de 30 minutos
4. **Historial**: No puede repetir las últimas 5 contraseñas
5. **Complejidad**: Mínimo 12 caracteres, mayúsculas, minúsculas, números y símbolos

### 4.4 Acceso Temporal para Externos

1. **Fecha de Inicio y Fin**: Obligatorias para ROL-010 y ROL-011
2. **Aprobación del Oficial**: Requerida antes de otorgar acceso
3. **Propósito Documentado**: Razón del acceso debe quedar registrada
4. **Revocación Automática**: Al vencer el período, acceso se revoca automáticamente
5. **Extensión**: Requiere nueva aprobación del Oficial
6. **Trazabilidad Total**: Todas las acciones quedan en el log de auditoría

---

## 5. Flujos de Trabajo

### 5.1 Creación de Usuario Interno

```
1. Usuario con permiso (Oficial de Cumplimiento) accede al módulo
2. Completa formulario de nuevo usuario:
   - Datos personales
   - Área organizacional
   - Cargo
   - Email corporativo
3. Asigna uno o varios roles
4. Sistema valida:
   - Email único
   - Username único
   - Incompatibilidades de roles
5. Sistema crea usuario en estado PENDING_APPROVAL
6. Sistema genera alerta al Oficial de Cumplimiento (si no fue él quien lo creó)
7. Sistema registra evento en auditoría
8. Oficial de Cumplimiento revisa y aprueba/rechaza
9. Si aprueba:
   - Usuario pasa a ACTIVE
   - Se envía email con credenciales temporales
   - Usuario debe cambiar contraseña en primer login
10. Si rechaza:
    - Usuario pasa a INACTIVE
    - Se notifica al solicitante
```

### 5.2 Creación de Usuario Externo

```
1. Oficial de Cumplimiento accede al módulo
2. Completa formulario de usuario externo:
   - Datos personales
   - Organización externa
   - Propósito del acceso
   - Fecha de inicio de acceso
   - Fecha de fin de acceso
3. Asigna rol (ROL-010 o ROL-011)
4. Sistema valida:
   - Fechas válidas (inicio < fin)
   - Fecha de fin no mayor a 90 días
5. Sistema crea usuario en estado PENDING_APPROVAL
6. Sistema registra evento en auditoría
7. Oficial aprueba (mismo flujo interno)
8. Usuario recibe credenciales con vigencia limitada
9. Al vencer el período, acceso se revoca automáticamente
```

### 5.3 Asignación de Rol Adicional

```
1. Oficial de Cumplimiento selecciona usuario activo
2. Selecciona rol adicional a asignar
3. Sistema valida:
   - El rol no está ya asignado
   - No existe incompatibilidad con roles actuales
4. Si hay incompatibilidad:
   - Sistema muestra mensaje de error
   - No permite asignación
5. Si no hay incompatibilidad:
   - Sistema asigna rol
   - Genera alerta al Oficial
   - Registra en historial de cambios
   - Registra en auditoría
6. El usuario obtiene inmediatamente los permisos del nuevo rol
```

### 5.4 Revocación de Rol

```
1. Oficial de Cumplimiento selecciona usuario
2. Selecciona rol a revocar
3. Sistema valida:
   - El usuario tiene el rol asignado
   - El usuario quedará con al menos un rol activo
4. Solicita razón de revocación (obligatorio)
5. Sistema revoca el rol
6. Genera alerta al Oficial
7. Registra en historial de cambios
8. Registra en auditoría
9. El usuario pierde inmediatamente los permisos del rol revocado
```

### 5.5 Inactivación de Usuario

```
1. Oficial de Cumplimiento selecciona usuario activo
2. Sistema valida:
   - El usuario no es el propio Oficial
   - El usuario no es el único con un rol crítico
3. Solicita razón de inactivación (obligatorio)
4. Sistema:
   - Cambia estado a INACTIVE
   - Revoca todos los roles
   - Cierra todas las sesiones activas
   - Bloquea acceso inmediato
5. Genera alerta al Oficial
6. Registra en historial de cambios
7. Registra en auditoría de alta criticidad
```

### 5.6 Suspensión Temporal de Usuario

```
1. Oficial de Cumplimiento selecciona usuario activo
2. Solicita razón de suspensión (obligatorio)
3. Opcionalmente define fecha de reactivación automática
4. Sistema:
   - Cambia estado a SUSPENDED
   - Cierra todas las sesiones activas
   - Bloquea acceso temporal
   - Mantiene roles asignados
5. Genera alerta de alta criticidad
6. Registra en historial y auditoría
7. Si hay fecha de reactivación:
   - Sistema reactiva automáticamente en esa fecha
   - Genera nueva alerta al Oficial
```

---

## 6. Validaciones y Controles

### 6.1 Validaciones de Creación de Usuario

| Campo | Validación |
|-------|------------|
| Username | Único, alfanumérico, 5-50 caracteres, sin espacios |
| Email | Único, formato válido, dominio corporativo para internos |
| Identification | Único, formato según tipo (V/E/P/J) |
| First Name | Requerido, 2-100 caracteres |
| Last Name | Requerido, 2-100 caracteres |
| User Type | INTERNAL o EXTERNAL |
| Organization Area | Requerido para internos |
| Position | Requerido, 3-100 caracteres |
| Roles | Al menos un rol asignado |

### 6.2 Validaciones de Asignación de Rol

1. El rol existe en el catálogo
2. El usuario no tiene ya ese rol asignado
3. No existe incompatibilidad con roles actuales
4. Si es ROL-001, validar que no exista otro Oficial activo
5. Si es rol externo, validar fechas de acceso temporal

### 6.3 Validaciones de Modificación

1. El usuario existe y no está en estado INACTIVE
2. El usuario que modifica tiene permisos (Oficial de Cumplimiento)
3. El usuario que modifica no se está modificando a sí mismo
4. Si cambia roles, validar incompatibilidades
5. Si inactiva, no puede ser el único con un rol crítico

### 6.4 Validaciones de Segregación

**Algoritmo de Validación de Incompatibilidades**:

```java
boolean validateRoleCompatibility(String userId, String newRoleCode) {
    // 1. Obtener roles actuales del usuario
    List<String> currentRoles = userRoleRepository.findActiveRolesByUserId(userId);
    
    // 2. Verificar si el nuevo rol es Oficial de Cumplimiento
    if ("ROL-001".equals(newRoleCode)) {
        // Oficial no puede tener ningún otro rol
        return currentRoles.isEmpty();
    }
    
    // 3. Verificar si ya tiene Oficial de Cumplimiento
    if (currentRoles.contains("ROL-001")) {
        // No puede asignar ningún otro rol
        return false;
    }
    
    // 4. Obtener incompatibilidades del nuevo rol
    List<RoleIncompatibility> incompatibilities = 
        incompatibilityRepository.findByRoleCode(newRoleCode);
    
    // 5. Verificar cada incompatibilidad
    for (RoleIncompatibility incompat : incompatibilities) {
        String incompatibleRole = incompat.getRoleCode1().equals(newRoleCode) 
            ? incompat.getRoleCode2() 
            : incompat.getRoleCode1();
        
        if (currentRoles.contains(incompatibleRole)) {
            if ("BLOCKING".equals(incompat.getSeverity())) {
                return false; // Incompatibilidad bloqueante
            }
        }
    }
    
    return true; // Compatible
}
```

---

## 7. Integración con Otros Módulos

### 7.1 Integración con Módulo de Autenticación

**Flujo de Autenticación**:

```
1. Usuario ingresa username y password
2. Módulo de Autenticación valida credenciales
3. Si válido, consulta Módulo de Usuarios:
   - Estado del usuario (debe ser ACTIVE)
   - Roles activos del usuario
   - Acceso temporal (si es externo)
4. Si usuario ACTIVE y tiene roles válidos:
   - Genera token JWT con claims: userId, username, roles, sessionId
   - Registra sesión en UserSession
   - Registra login en auditoría
5. Si usuario no ACTIVE:
   - Rechaza login
   - Registra intento fallido en auditoría
```

**Estructura del Token JWT**:

```json
{
  "sub": "userId",
  "username": "juan.perez",
  "email": "juan.perez@empresa.com",
  "roles": ["ROL-003", "ROL-004"],
  "userType": "INTERNAL",
  "sessionId": "session-uuid",
  "iat": 1678901234,
  "exp": 1678987634
}
```

### 7.2 Integración con Módulo de Auditoría

**Eventos a Registrar**:

```json
{
  "eventType": "USER_CREATED|USER_MODIFIED|USER_ACTIVATED|USER_INACTIVATED|USER_SUSPENDED|ROLE_ASSIGNED|ROLE_REVOKED|LOGIN_SUCCESS|LOGIN_FAILED|LOGOUT|PASSWORD_CHANGED|ACCESS_DENIED",
  "userId": "ID del usuario afectado",
  "performedBy": "ID del usuario que ejecutó la acción",
  "timestamp": "ISO 8601",
  "module": "USER_MANAGEMENT",
  "severity": "LOW|NORMAL|HIGH|CRITICAL",
  "details": {
    "action": "Descripción detallada",
    "changes": {
      "field": "campo modificado",
      "oldValue": "valor anterior",
      "newValue": "valor nuevo"
    }
  },
  "ipAddress": "IP del cliente",
  "sessionId": "ID de sesión"
}
```

### 7.3 Integración con Módulo de Alertas

**Alertas Automáticas a Generar**:

| Evento | Tipo Alerta | Destinatario | Prioridad |
|--------|-------------|--------------|-----------|
| Usuario creado | USER_CREATED | Oficial de Cumplimiento | NORMAL |
| Usuario modificado | USER_MODIFIED | Oficial de Cumplimiento | NORMAL |
| Rol asignado | ROLE_ASSIGNED | Oficial de Cumplimiento | HIGH |
| Rol revocado | ROLE_REVOKED | Oficial de Cumplimiento | HIGH |
| Usuario inactivado | USER_INACTIVATED | Oficial de Cumplimiento | HIGH |
| Usuario suspendido | USER_SUSPENDED | Oficial de Cumplimiento | CRITICAL |
| Intento de incompatibilidad | ROLE_INCOMPATIBILITY_ATTEMPTED | Oficial de Cumplimiento | CRITICAL |
| 3+ logins fallidos | MULTIPLE_LOGIN_FAILURES | Oficial de Cumplimiento | HIGH |
| Usuario bloqueado | USER_LOCKED | Oficial de Cumplimiento | HIGH |
| Acceso externo vencido | EXTERNAL_ACCESS_EXPIRED | Oficial de Cumplimiento | NORMAL |
| Acceso externo próximo a vencer | EXTERNAL_ACCESS_EXPIRING | Oficial de Cumplimiento | NORMAL |

**Estructura de Alerta**:

```json
{
  "alertId": "UUID",
  "alertType": "USER_CREATED",
  "severity": "NORMAL|HIGH|CRITICAL",
  "userId": "ID del usuario afectado",
  "createdAt": "ISO 8601",
  "recipient": "oficial.cumplimiento@empresa.com",
  "title": "Nuevo usuario creado en el sistema",
  "message": "Se ha creado el usuario 'juan.perez' con rol Comercial",
  "metadata": {
    "username": "juan.perez",
    "roles": ["ROL-003"],
    "createdBy": "admin.sistema"
  },
  "isRead": false,
  "requiresAction": false
}
```

---

## 8. API REST - Endpoints

### 8.1 Gestión de Usuarios

#### 8.1.1 Crear Usuario

**POST** `/api/v1/users`

**Request Body**:
```json
{
  "username": "juan.perez",
  "email": "juan.perez@empresa.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "identification": {
    "type": "V",
    "number": "12345678"
  },
  "userType": "INTERNAL",
  "organizationArea": "Comercial",
  "phoneNumber": "+58 424 1234567",
  "position": "Ejecutivo de Ventas",
  "roles": ["ROL-003"]
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "username": "juan.perez",
    "status": "PENDING_APPROVAL",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Usuario creado exitosamente. Pendiente de aprobación."
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email ya está registrado en el sistema"
  }
}
```

---

#### 8.1.2 Obtener Lista de Usuarios

**GET** `/api/v1/users`

**Query Parameters**:
- `status` (optional): ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL
- `userType` (optional): INTERNAL, EXTERNAL
- `roleCode` (optional): Filtrar por rol específico
- `organizationArea` (optional): Filtrar por área
- `page` (optional): Número de página (default: 0)
- `size` (optional): Tamaño de página (default: 20)
- `sort` (optional): Campo de ordenamiento (default: createdAt,desc)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "userId": "uuid-1234",
        "username": "juan.perez",
        "email": "juan.perez@empresa.com",
        "firstName": "Juan",
        "lastName": "Pérez",
        "userType": "INTERNAL",
        "status": "ACTIVE",
        "organizationArea": "Comercial",
        "roles": [
          {
            "roleCode": "ROL-003",
            "roleName": "Comercial",
            "assignedAt": "2024-01-15T10:30:00Z"
          }
        ],
        "createdAt": "2024-01-15T10:00:00Z",
        "lastLoginAt": "2024-01-20T09:15:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3
  }
}
```

---

#### 8.1.3 Obtener Usuario por ID

**GET** `/api/v1/users/{userId}`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "username": "juan.perez",
    "email": "juan.perez@empresa.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "identification": {
      "type": "V",
      "number": "12345678"
    },
    "userType": "INTERNAL",
    "status": "ACTIVE",
    "organizationArea": "Comercial",
    "phoneNumber": "+58 424 1234567",
    "position": "Ejecutivo de Ventas",
    "roles": [
      {
        "userRoleId": "role-uuid-1",
        "roleCode": "ROL-003",
        "roleName": "Comercial",
        "assignedBy": "admin-uuid",
        "assignedAt": "2024-01-15T10:30:00Z",
        "isActive": true
      }
    ],
    "createdBy": "admin-uuid",
    "createdAt": "2024-01-15T10:00:00Z",
    "approvedBy": "oficial-uuid",
    "approvedAt": "2024-01-15T11:00:00Z",
    "lastModifiedBy": "oficial-uuid",
    "lastModifiedAt": "2024-01-18T14:30:00Z",
    "lastLoginAt": "2024-01-20T09:15:00Z",
    "passwordLastChanged": "2024-01-15T12:00:00Z"
  }
}
```

---

#### 8.1.4 Actualizar Usuario

**PUT** `/api/v1/users/{userId}`

**Request Body**:
```json
{
  "email": "juan.perez.nuevo@empresa.com",
  "phoneNumber": "+58 424 9999999",
  "organizationArea": "Operaciones",
  "position": "Gerente de Operaciones",
  "modificationReason": "Cambio de área por promoción"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "username": "juan.perez",
    "status": "ACTIVE",
    "updatedAt": "2024-01-20T10:30:00Z"
  },
  "message": "Usuario actualizado exitosamente"
}
```

---

#### 8.1.5 Cambiar Estado de Usuario

**PATCH** `/api/v1/users/{userId}/status`

**Request Body**:
```json
{
  "newStatus": "SUSPENDED",
  "reason": "Suspensión por auditoría interna en curso"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "oldStatus": "ACTIVE",
    "newStatus": "SUSPENDED",
    "changedAt": "2024-01-20T15:45:00Z"
  },
  "message": "Estado del usuario actualizado exitosamente"
}
```

---

#### 8.1.6 Obtener Historial de Cambios

**GET** `/api/v1/users/{userId}/history`

**Query Parameters**:
- `changeType` (optional): Tipo de cambio específico
- `startDate` (optional): Fecha inicio (ISO 8601)
- `endDate` (optional): Fecha fin (ISO 8601)
- `page` (optional): Número de página
- `size` (optional): Tamaño de página

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "historyId": "history-uuid-1",
        "changeType": "ROLE_ASSIGNED",
        "changedBy": "oficial-uuid",
        "changedByName": "María Rodríguez",
        "changedAt": "2024-01-15T10:30:00Z",
        "fieldChanged": "roles",
        "oldValue": "[]",
        "newValue": "[\"ROL-003\"]",
        "reason": "Asignación inicial de rol",
        "ipAddress": "192.168.1.100"
      },
      {
        "historyId": "history-uuid-2",
        "changeType": "USER_MODIFIED",
        "changedBy": "oficial-uuid",
        "changedByName": "María Rodríguez",
        "changedAt": "2024-01-18T14:30:00Z",
        "fieldChanged": "organizationArea",
        "oldValue": "Comercial",
        "newValue": "Operaciones",
        "reason": "Cambio de área por promoción",
        "ipAddress": "192.168.1.100"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1
  }
}
```

---

### 8.2 Gestión de Roles

#### 8.2.1 Asignar Rol a Usuario

**POST** `/api/v1/users/{userId}/roles`

**Request Body**:
```json
{
  "roleCode": "ROL-004",
  "assignmentReason": "Usuario requiere acceso a módulo de Operaciones",
  "validFrom": "2024-01-20T00:00:00Z",
  "validUntil": null
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "userRoleId": "role-assignment-uuid",
    "userId": "uuid-1234",
    "roleCode": "ROL-004",
    "roleName": "Operaciones",
    "assignedBy": "oficial-uuid",
    "assignedAt": "2024-01-20T10:00:00Z",
    "isActive": true
  },
  "message": "Rol asignado exitosamente"
}
```

**Response 409 Conflict**:
```json
{
  "success": false,
  "error": {
    "code": "ROLE_INCOMPATIBILITY",
    "message": "El rol ROL-008 (Auditoría) es incompatible con el rol actual ROL-003 (Comercial)",
    "details": {
      "incompatibleRoles": ["ROL-008"],
      "severity": "BLOCKING"
    }
  }
}
```

---

#### 8.2.2 Revocar Rol de Usuario

**DELETE** `/api/v1/users/{userId}/roles/{roleCode}`

**Request Body**:
```json
{
  "revocationReason": "Usuario ya no requiere acceso a este módulo"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "roleCode": "ROL-004",
    "revokedBy": "oficial-uuid",
    "revokedAt": "2024-01-20T11:00:00Z"
  },
  "message": "Rol revocado exitosamente"
}
```

---

#### 8.2.3 Obtener Lista de Roles

**GET** `/api/v1/roles`

**Query Parameters**:
- `roleType` (optional): INTERNAL, EXTERNAL
- `isSystemRole` (optional): true, false

**Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "roleCode": "ROL-001",
      "roleName": "Oficial de Cumplimiento",
      "roleType": "INTERNAL",
      "description": "Máxima autoridad en materia de cumplimiento",
      "isSupervisory": false,
      "isReadOnly": false,
      "isApprover": true,
      "isSystemRole": true,
      "canBeModified": false,
      "permissions": [
        {
          "module": "DOSSIER_MANAGEMENT",
          "actions": ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"]
        }
      ]
    }
  ]
}
```

---

#### 8.2.4 Validar Compatibilidad de Rol

**POST** `/api/v1/users/{userId}/roles/validate`

**Request Body**:
```json
{
  "roleCode": "ROL-008"
}
```

**Response 200 OK** (Compatible):
```json
{
  "success": true,
  "data": {
    "isCompatible": true,
    "message": "El rol es compatible con los roles actuales del usuario"
  }
}
```

**Response 200 OK** (Incompatible):
```json
{
  "success": true,
  "data": {
    "isCompatible": false,
    "message": "El rol ROL-008 (Auditoría) es incompatible con rol actual ROL-003 (Comercial)",
    "incompatibilities": [
      {
        "roleCode": "ROL-003",
        "roleName": "Comercial",
        "reason": "Conflicto entre rol operativo y supervisión",
        "severity": "BLOCKING"
      }
    ]
  }
}
```

---

### 8.3 Gestión de Sesiones

#### 8.3.1 Obtener Sesiones Activas

**GET** `/api/v1/users/{userId}/sessions`

**Query Parameters**:
- `isActive` (optional): true, false

**Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "session-uuid-1",
      "userId": "uuid-1234",
      "activeRole": "ROL-003",
      "loginAt": "2024-01-20T08:00:00Z",
      "ipAddress": "192.168.1.105",
      "userAgent": "Mozilla/5.0...",
      "isActive": true,
      "lastActivityAt": "2024-01-20T10:15:00Z"
    }
  ]
}
```

---

#### 8.3.2 Cerrar Sesión de Usuario

**DELETE** `/api/v1/users/{userId}/sessions/{sessionId}`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid-1",
    "userId": "uuid-1234",
    "closedAt": "2024-01-20T11:00:00Z"
  },
  "message": "Sesión cerrada exitosamente"
}
```

---

#### 8.3.3 Cerrar Todas las Sesiones de Usuario

**DELETE** `/api/v1/users/{userId}/sessions`

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "sessionsClosedCount": 3,
    "closedAt": "2024-01-20T11:00:00Z"
  },
  "message": "Todas las sesiones del usuario han sido cerradas"
}
```

---

### 8.4 Gestión de Incompatibilidades

#### 8.4.1 Obtener Lista de Incompatibilidades

**GET** `/api/v1/roles/incompatibilities`

**Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "incompatibilityId": "incompat-uuid-1",
      "roleCode1": "ROL-003",
      "roleName1": "Comercial",
      "roleCode2": "ROL-008",
      "roleName2": "Auditoría",
      "reason": "Conflicto entre rol operativo y supervisión",
      "severity": "BLOCKING",
      "isActive": true
    }
  ]
}
```

---

### 8.5 Reportes

#### 8.5.1 Reporte de Usuarios por Rol

**GET** `/api/v1/reports/users-by-role`

**Query Parameters**:
- `roleCode` (optional): Código de rol específico
- `status` (optional): Estado de usuario

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "reportDate": "2024-01-20T12:00:00Z",
    "rolesSummary": [
      {
        "roleCode": "ROL-003",
        "roleName": "Comercial",
        "activeUsers": 12,
        "inactiveUsers": 3,
        "totalUsers": 15
      }
    ]
  }
}
```

---

#### 8.5.2 Reporte de Actividad de Usuario

**GET** `/api/v1/reports/user-activity/{userId}`

**Query Parameters**:
- `startDate`: Fecha inicio (ISO 8601)
- `endDate`: Fecha fin (ISO 8601)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-1234",
    "username": "juan.perez",
    "reportPeriod": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-20T23:59:59Z"
    },
    "activitySummary": {
      "totalLogins": 45,
      "averageSessionDuration": 7200,
      "totalActionsPerformed": 320,
      "actionsByModule": {
        "DOSSIER_MANAGEMENT": 180,
        "RISK_ASSESSMENT": 85,
        "REPORTS": 55
      }
    },
    "lastActions": []
  }
}
```

---

## 9. Seguridad

### 9.1 Autenticación y Autorización

1. **Autenticación**: JWT con expiración de 8 horas
2. **Autorización**: Validación de permisos por rol en cada endpoint
3. **Refresh Token**: Token de refresco válido por 30 días
4. **IP Whitelisting**: Opcional para roles externos
5. **2FA**: Opcional para Oficial de Cumplimiento

### 9.2 Protección de Datos

1. **Contraseñas**: Hash con BCrypt (factor 12)
2. **Datos sensibles**: Cifrados en reposo (AES-256)
3. **Logs**: No registrar contraseñas ni tokens
4. **Enmascaramiento**: Datos personales enmascarados según rol
5. **HTTPS**: Obligatorio en toda comunicación

### 9.3 Prevención de Ataques

1. **Rate Limiting**: 100 requests por minuto por usuario
2. **SQL Injection**: Uso de PreparedStatements
3. **XSS**: Sanitización de inputs
4. **CSRF**: Token CSRF en formularios
5. **Brute Force**: Bloqueo temporal tras 5 intentos fallidos

---

## 10. Consideraciones para Inspecciones Regulatorias

### 10.1 Auditoría y Trazabilidad

1. **Log Inmutable**: Ningún registro de auditoría puede ser modificado o eliminado
2. **Retención**: Logs mantenidos por 10 años mínimo
3. **Exportación**: Capacidad de exportar logs en formato CSV/Excel
4. **Búsqueda Avanzada**: Filtros por usuario, rol, fecha, acción, módulo

### 10.2 Segregación Documentada

1. **Matriz de Incompatibilidades**: Documentada y disponible para inspectores
2. **Justificación de Roles**: Razón de asignación de cada rol registrada
3. **Aprobaciones**: Toda asignación aprobada por Oficial de Cumplimiento

### 10.3 Reportes Regulatorios

1. **Reporte de Usuarios Activos**: Con roles y fechas de asignación
2. **Reporte de Cambios de Rol**: Histórico completo
3. **Reporte de Accesos Externos**: Auditores e inspectores con fechas
4. **Reporte de Sesiones**: Historial de logins y logouts
5. **Reporte de Intentos de Acceso Denegado**: Violaciones de permisos

### 10.4 Cumplimiento Normativo

1. **Ley Orgánica del Sistema Financiero Nacional**
2. **Normas SUDEBAN/SUDEASEG sobre Prevención de Legitimación de Capitales**
3. **Resoluciones sobre Segregación de Funciones**
4. **Protección de Datos Personales (LOPD)**

---

## 11. Casos de Uso Especiales

### 11.1 Cambio de Oficial de Cumplimiento

```
Escenario: Se requiere cambiar la persona que ocupa el rol de Oficial de Cumplimiento

Proceso:
1. El actual Oficial crea un usuario nuevo con rol ROL-001
2. Sistema detecta que ya existe un Oficial activo
3. Sistema solicita confirmación y justificación documentada
4. Oficial actual aprueba el cambio
5. Sistema:
   - Asigna ROL-001 al nuevo usuario
   - Revoca ROL-001 del usuario anterior
   - Genera alerta crítica
   - Registra en auditoría con máxima criticidad
   - Notifica a toda la dirección
6. Cambio es inmediato pero requiere doble confirmación
```

### 11.2 Acceso de Emergencia

```
Escenario: Se requiere acceso urgente y el Oficial de Cumplimiento no está disponible

Proceso:
1. Sistema tiene definido un usuario de respaldo (backup)
2. Usuario de respaldo puede activar modo de emergencia
3. Modo de emergencia permite:
   - Crear usuarios temporales (máximo 24 horas)
   - Asignar permisos limitados
   - Solo lectura en expedientes críticos
4. Toda acción en modo de emergencia:
   - Registrada con máxima criticidad
   - Genera alerta inmediata al Oficial
   - Requiere revisión posterior obligatoria
5. Al vencer 24 horas, accesos se revocan automáticamente
```

### 11.3 Auditoría Externa

```
Escenario: Auditores externos requieren acceso al sistema

Proceso:
1. Oficial de Cumplimiento crea usuario con rol ROL-010
2. Define:
   - Fecha de inicio y fin (máximo 90 días)
   - Alcance del acceso (módulos específicos)
   - Propósito de la auditoría
3. Auditor recibe credenciales temporales
4. Durante el período:
   - Todas las acciones son registradas
   - Solo puede leer, no modificar
   - Puede exportar reportes
5. Al vencer el período:
   - Acceso se revoca automáticamente
   - Se genera reporte de su actividad
   - Se notifica al Oficial
```

### 11.4 Investigación de Empleado

```
Escenario: Se inicia investigación interna sobre un empleado

Proceso:
1. Oficial de Cumplimiento suspende al usuario investigado
2. Sistema:
   - Cambia estado a SUSPENDED
   - Cierra todas las sesiones activas
   - Mantiene los roles para análisis
   - Genera alerta crítica
3. Durante la investigación:
   - Usuario no puede acceder
   - Se pueden revisar sus acciones históricas
   - Se pueden generar reportes de actividad
4. Al concluir:
   - Si se confirma falta grave: INACTIVE permanente
   - Si se descarta: Reactivación a ACTIVE
```

---

## 12. Métricas y Monitoreo

### 12.1 KPIs del Módulo

| KPI | Descripción | Meta |
|-----|-------------|------|
| Usuarios Activos | Total de usuarios con estado ACTIVE | - |
| Roles por Usuario | Promedio de roles asignados por usuario | < 2 |
| Tiempo de Aprobación | Tiempo promedio entre creación y aprobación | < 24h |
| Intentos de Incompatibilidad | Intentos de asignar roles incompatibles | 0 |
| Usuarios Suspendidos | Total de usuarios en investigación | < 1% |
| Accesos Externos Activos | Auditores e inspectores con acceso | - |
| Cambios de Rol/Mes | Frecuencia de cambios de rol | < 5% |

### 12.2 Alertas de Monitoreo

1. Usuario bloqueado por múltiples intentos fallidos
2. Intento de asignar roles incompatibles
3. Usuario creado sin aprobación por > 48 horas
4. Acceso externo próximo a vencer (7 días)
5. Cambio masivo de roles (> 5 en 1 hora)
6. Sesión activa por > 12 horas

---

## 13. Glosario

| Término | Definición |
|---------|------------|
| Segregación de Funciones | Principio de control interno que separa responsabilidades para evitar conflictos de interés |
| Rol | Conjunto de permisos agrupados que define las acciones que puede realizar un usuario |
| Usuario Interno | Empleado de la organización con acceso permanente |
| Usuario Externo | Auditor o inspector con acceso temporal y limitado |
| Incompatibilidad de Roles | Combinación de roles que no puede ser asignada a un mismo usuario |
| Estado del Usuario | Condición actual del usuario: ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL |
| Trazabilidad | Capacidad de rastrear todas las acciones realizadas por un usuario |
| Soft Delete | Eliminación lógica que marca como inactivo sin borrar físicamente |
| JWT | JSON Web Token, mecanismo de autenticación basado en tokens |

---

## 14. Referencias

1. **SIAR-RBAC-Model.md**: Modelo completo de roles y permisos del sistema
2. **SIAR-Audit-Module.md**: Integración con módulo de auditoría
3. **SIAR-Alert-Module.md**: Integración con módulo de alertas
4. **SIAR-Architecture-Design.md**: Arquitectura general del sistema

---

**Última actualización**: 2024-01-20  
**Versión**: 1.0  
**Autor**: Equipo de Arquitectura SIAR
