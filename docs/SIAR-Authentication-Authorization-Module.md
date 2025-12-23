# Módulo de Autenticación, Autorización y Control de Acceso (RBAC) - SIAR

## 1. Introducción

Este documento define el diseño técnico del módulo de Autenticación, Inicio de Sesión (Login) y Control de Acceso basado en Roles (RBAC) para el Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR).

### Objetivos del Módulo

1. **Autenticación segura** de usuarios mediante credenciales
2. **Autorización basada en roles** (RBAC) con permisos granulares
3. **Gestión de sesiones** con control de concurrencia y expiración
4. **Auditoría completa** de accesos y acciones
5. **Generación de alertas** ante eventos de seguridad
6. **Integración con módulos** de auditoría, alertas y gestión de usuarios

### Principios de Diseño

- **Seguridad por defecto**: Todo acceso debe ser autenticado y autorizado
- **Zero Trust**: Verificar permisos en cada operación
- **Trazabilidad total**: Registrar todos los eventos de seguridad
- **No bloqueo**: Alertar pero no bloquear operaciones de negocio
- **Separación de responsabilidades**: Autenticación ≠ Autorización
- **Preparado para auditoría**: Diseñado para inspección regulatoria

---

## 2. Arquitectura del Módulo

### 2.1 Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Web Client)                     │
│  - Login Form                                                │
│  - Session Management                                        │
│  - JWT Token Storage                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS + JWT
┌────────────────────────▼────────────────────────────────────┐
│              AUTHENTICATION CONTROLLER (REST)                │
│  POST /api/auth/login                                        │
│  POST /api/auth/logout                                       │
│  POST /api/auth/refresh                                      │
│  GET  /api/auth/session                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              AUTHENTICATION SERVICE (Core Logic)             │
│  - Credential Validation                                     │
│  - Password Hashing (BCrypt)                                 │
│  - JWT Token Generation                                      │
│  - Session Management                                        │
│  - Failed Login Tracking                                     │
└───────┬─────────────────────────────────────────┬───────────┘
        │                                         │
┌───────▼────────────┐              ┌────────────▼────────────┐
│  USER REPOSITORY   │              │  SESSION REPOSITORY     │
│  (Database Access) │              │  (Active Sessions)      │
└────────────────────┘              └─────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           AUTHORIZATION INTERCEPTOR (Filter/Aspect)          │
│  - JWT Validation                                            │
│  - User Context Extraction                                   │
│  - Permission Checking (RBAC)                                │
│  - Audit Logging                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              AUTHORIZATION SERVICE (RBAC Engine)             │
│  - Role-Permission Mapping                                   │
│  - Permission Evaluation                                     │
│  - Resource Ownership Validation                             │
│  - Context-aware Authorization                               │
└───────┬─────────────────────────────────────────┬───────────┘
        │                                         │
┌───────▼───────────┐              ┌─────────────▼────────────┐
│  ROLE REPOSITORY  │              │  PERMISSION REPOSITORY   │
│  (Roles & Users)  │              │  (Granular Permissions)  │
└───────────────────┘              └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  INTEGRATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AUDIT      │  │    ALERT     │  │   DOSSIER    │      │
│  │   SERVICE    │  │   SERVICE    │  │   SERVICE    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Autenticación

```
┌──────────┐                 ┌──────────┐                ┌──────────┐
│  Client  │                 │  Server  │                │ Database │
└────┬─────┘                 └────┬─────┘                └────┬─────┘
     │                            │                           │
     │ 1. POST /api/auth/login    │                           │
     ├───────────────────────────>│                           │
     │   {username, password}     │                           │
     │                            │                           │
     │                            │ 2. Query user by username │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │ 3. User data + hash       │
     │                            │<──────────────────────────┤
     │                            │                           │
     │                            │ 4. Verify password hash   │
     │                            │    (BCrypt comparison)    │
     │                            │                           │
     │                            │ 5. Create session record  │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │ 6. Record audit event     │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │ 7. Generate JWT token     │
     │                            │    (user + roles + perms) │
     │                            │                           │
     │ 8. Return JWT + user data  │                           │
     │<───────────────────────────┤                           │
     │                            │                           │
     │ 9. Store JWT in storage    │                           │
     │                            │                           │
     │ 10. Subsequent requests    │                           │
     │     with Authorization     │                           │
     │     Bearer {JWT}           │                           │
     ├───────────────────────────>│                           │
     │                            │                           │
     │                            │ 11. Validate JWT          │
     │                            │     Extract user context  │
     │                            │     Check permissions     │
     │                            │                           │
```

### 2.3 Flujo de Autorización (RBAC)

```
┌────────────────────────────────────────────────────────────┐
│  1. Request arrives with JWT token                          │
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│  2. Authorization Interceptor extracts token                │
│     - Validates JWT signature                               │
│     - Checks token expiration                               │
│     - Extracts user ID and roles                            │
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│  3. Load user permissions from cache or database            │
│     - Get all roles assigned to user                        │
│     - Get all permissions for those roles                   │
│     - Cache for performance                                 │
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│  4. Check specific permission for requested operation       │
│     Format: {module}:{entity}:{action}                      │
│     Example: "dossier:client:update"                        │
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│  5. Additional context validation (if needed)               │
│     - Resource ownership (user created the record?)         │
│     - Status validation (can modify APPROVED records?)      │
│     - Special restrictions (PEP, high-risk, etc.)           │
└────────────────────┬───────────────────────────────────────┘
                     ▼
        ┌────────────┴────────────┐
        │   AUTHORIZED?            │
        └───┬────────────────┬─────┘
            │ YES            │ NO
            ▼                ▼
┌───────────────────┐  ┌──────────────────────┐
│  6a. Allow access │  │  6b. Deny access     │
│  Log audit event  │  │  Log denied attempt  │
│  Proceed with     │  │  Generate alert      │
│  operation        │  │  Return 403 error    │
└───────────────────┘  └──────────────────────┘
```

---

## 3. Modelo de Datos

### 3.1 Entidad: Usuario (User)

```json
{
  "userId": "UUID",
  "username": "string (unique, lowercase)",
  "email": "string (unique)",
  "passwordHash": "string (BCrypt hash)",
  "firstName": "string",
  "lastName": "string",
  "documentType": "enum [CEDULA, PASSPORT, RIF]",
  "documentNumber": "string",
  "phoneNumber": "string",
  "status": "enum [ACTIVE, INACTIVE, LOCKED, SUSPENDED]",
  "failedLoginAttempts": "integer (default: 0)",
  "lastFailedLogin": "timestamp",
  "lastSuccessfulLogin": "timestamp",
  "passwordLastChanged": "timestamp",
  "passwordExpiresAt": "timestamp",
  "mustChangePassword": "boolean (default: false)",
  "emailVerified": "boolean (default: false)",
  "twoFactorEnabled": "boolean (default: false)",
  "roles": ["array of Role objects"],
  "metadata": {
    "employeeId": "string (if internal employee)",
    "department": "string",
    "externalEntity": "string (if auditor/inspector)",
    "temporaryAccessStart": "timestamp (for external users)",
    "temporaryAccessEnd": "timestamp (for external users)",
    "notes": "string"
  },
  "createdAt": "timestamp",
  "createdBy": "UUID (user who created)",
  "updatedAt": "timestamp",
  "updatedBy": "UUID (user who last updated)"
}
```

**Reglas de Negocio**:
- Username debe ser único e inmutable después de la creación
- Email debe ser único y verificado
- Password debe cumplir política de complejidad (min 8 caracteres, mayúsculas, minúsculas, números, símbolos)
- passwordHash se genera con BCrypt (factor de trabajo 12)
- failedLoginAttempts se incrementa en cada login fallido
- Después de 5 intentos fallidos, status cambia a LOCKED
- LOCKED requiere reset manual por Oficial de Cumplimiento
- Usuarios externos (auditores/inspectores) requieren temporaryAccessStart y temporaryAccessEnd

### 3.2 Entidad: Rol (Role)

```json
{
  "roleId": "UUID",
  "roleCode": "string (unique, uppercase with underscores)",
  "roleName": "string",
  "description": "string",
  "roleType": "enum [INTERNAL_OPERATIONAL, INTERNAL_CONTROL, EXTERNAL]",
  "isSystemRole": "boolean (true for predefined roles)",
  "permissions": ["array of Permission objects"],
  "metadata": {
    "requiresApproval": "boolean",
    "maxConcurrentSessions": "integer",
    "sessionTimeoutMinutes": "integer",
    "allowedIpRanges": ["array of IP ranges"],
    "allowedTimeWindows": [{
      "dayOfWeek": "enum [MON, TUE, WED, THU, FRI, SAT, SUN]",
      "startTime": "time (HH:mm)",
      "endTime": "time (HH:mm)"
    }]
  },
  "active": "boolean (default: true)",
  "createdAt": "timestamp",
  "createdBy": "UUID",
  "updatedAt": "timestamp",
  "updatedBy": "UUID"
}
```

**Roles Predefinidos del Sistema** (isSystemRole = true):

| roleCode | roleName | roleType |
|----------|----------|----------|
| COMPLIANCE_OFFICER | Oficial de Cumplimiento | INTERNAL_OPERATIONAL |
| COMPLIANCE_AREA | Área de Cumplimiento | INTERNAL_OPERATIONAL |
| COMMERCIAL_AREA | Área Comercial | INTERNAL_OPERATIONAL |
| OPERATIONS_AREA | Área de Operaciones | INTERNAL_OPERATIONAL |
| ADMINISTRATIVE_AREA | Área Administrativa | INTERNAL_OPERATIONAL |
| TECHNICAL_AREA | Área Técnica | INTERNAL_OPERATIONAL |
| HUMAN_RESOURCES | Recursos Humanos | INTERNAL_OPERATIONAL |
| INTERNAL_AUDIT | Auditoría Interna | INTERNAL_CONTROL |
| COMPTROLLER | Contraloría | INTERNAL_CONTROL |
| EXTERNAL_AUDITOR | Auditor Externo | EXTERNAL |
| SUDEASEG_INSPECTOR | Inspector SUDEASEG | EXTERNAL |

**Reglas de Negocio**:
- Roles del sistema (isSystemRole=true) no pueden ser eliminados
- roleCode debe ser inmutable
- Usuarios externos solo pueden tener roles de tipo EXTERNAL
- Modificación de permisos de roles requiere aprobación del Oficial de Cumplimiento

### 3.3 Entidad: Permiso (Permission)

```json
{
  "permissionId": "UUID",
  "permissionCode": "string (unique, format: module:entity:action)",
  "module": "string (e.g., DOSSIER, RISK_ASSESSMENT, ALERT)",
  "entity": "string (e.g., CLIENT, INTERMEDIARY, REINSURER)",
  "action": "enum [CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT]",
  "description": "string",
  "requiresOwnership": "boolean (default: false)",
  "allowedStatuses": ["array of entity statuses, empty = all allowed"],
  "metadata": {
    "criticalLevel": "enum [LOW, MEDIUM, HIGH, CRITICAL]",
    "requiresJustification": "boolean",
    "generateAlert": "boolean"
  },
  "active": "boolean (default: true)",
  "createdAt": "timestamp",
  "createdBy": "UUID",
  "updatedAt": "timestamp",
  "updatedBy": "UUID"
}
```

**Ejemplos de Permisos**:

| permissionCode | module | entity | action | requiresOwnership |
|----------------|--------|--------|--------|-------------------|
| dossier:client:create | DOSSIER | CLIENT | CREATE | false |
| dossier:client:read | DOSSIER | CLIENT | READ | false |
| dossier:client:update | DOSSIER | CLIENT | UPDATE | true |
| dossier:client:approve | DOSSIER | CLIENT | APPROVE | false |
| risk:assessment:create | RISK | ASSESSMENT | CREATE | false |
| alert:all:read | ALERT | ALL | READ | false |
| config:parameter:update | CONFIG | PARAMETER | UPDATE | false |
| report:all:export | REPORT | ALL | EXPORT | false |

**Reglas de Negocio**:
- permissionCode debe seguir formato: {module}:{entity}:{action}
- requiresOwnership=true significa que el usuario solo puede realizar la acción en recursos que él creó
- allowedStatuses define en qué estados de entidad aplica el permiso (ej: UPDATE solo en DRAFT o MODIFIED)
- Permisos con criticalLevel=CRITICAL generan alerta automática al usarse

### 3.4 Entidad: Sesión (Session)

```json
{
  "sessionId": "UUID",
  "userId": "UUID (foreign key to User)",
  "username": "string",
  "activeRoles": ["array of role codes"],
  "token": "string (JWT token, hashed)",
  "tokenExpiration": "timestamp",
  "refreshToken": "string (hashed)",
  "refreshTokenExpiration": "timestamp",
  "status": "enum [ACTIVE, EXPIRED, REVOKED, LOGGED_OUT]",
  "loginTimestamp": "timestamp",
  "lastActivityTimestamp": "timestamp",
  "logoutTimestamp": "timestamp",
  "ipAddress": "string",
  "userAgent": "string",
  "deviceInfo": {
    "browser": "string",
    "os": "string",
    "device": "string"
  },
  "metadata": {
    "loginMethod": "enum [PASSWORD, SSO, API_KEY]",
    "mfaVerified": "boolean",
    "riskScore": "integer (1-100)"
  },
  "createdAt": "timestamp"
}
```

**Reglas de Negocio**:
- Un usuario puede tener múltiples sesiones activas (configurado por rol)
- Token JWT expira en 2 horas por defecto
- Refresh token expira en 24 horas
- lastActivityTimestamp se actualiza en cada request autenticado
- Si inactividad > sessionTimeoutMinutes (del rol), sesión cambia a EXPIRED
- Sesiones EXPIRED se limpian automáticamente después de 7 días

### 3.5 Entidad: Evento de Auditoría de Seguridad (SecurityAuditEvent)

```json
{
  "eventId": "UUID",
  "eventCode": "string (e.g., AUTH-001, PERM-002)",
  "eventType": "enum [LOGIN, LOGOUT, ACCESS_DENIED, PERMISSION_CHANGE, PASSWORD_CHANGE]",
  "severity": "enum [INFO, WARNING, ERROR, CRITICAL]",
  "timestamp": "timestamp",
  "userId": "UUID",
  "username": "string",
  "sessionId": "UUID",
  "activeRoles": ["array of role codes"],
  "ipAddress": "string",
  "userAgent": "string",
  "action": "string (description of action attempted)",
  "resource": {
    "module": "string",
    "entity": "string",
    "entityId": "UUID",
    "action": "string"
  },
  "result": "enum [SUCCESS, FAILURE, DENIED]",
  "denialReason": "string (if result=DENIED)",
  "metadata": {
    "requestId": "UUID",
    "processingTimeMs": "integer",
    "additionalInfo": "object (flexible JSON)"
  },
  "alertGenerated": "boolean",
  "alertId": "UUID (if alert was created)"
}
```

**Tipos de Eventos Registrados**:

| eventCode | eventType | severity | Descripción |
|-----------|-----------|----------|-------------|
| AUTH-001 | LOGIN | INFO | Login exitoso |
| AUTH-002 | LOGIN | WARNING | Login fallido - contraseña incorrecta |
| AUTH-003 | LOGIN | ERROR | Login fallido - usuario bloqueado |
| AUTH-004 | LOGIN | CRITICAL | Login fallido - usuario inexistente |
| AUTH-005 | LOGOUT | INFO | Logout normal |
| AUTH-006 | LOGOUT | WARNING | Sesión expirada por inactividad |
| AUTH-007 | LOGOUT | WARNING | Sesión revocada administrativamente |
| PERM-001 | ACCESS_DENIED | WARNING | Acceso denegado - sin permiso |
| PERM-002 | ACCESS_DENIED | ERROR | Acceso denegado - fuera de horario |
| PERM-003 | ACCESS_DENIED | ERROR | Acceso denegado - IP no permitida |
| PERM-004 | PERMISSION_CHANGE | CRITICAL | Permisos de rol modificados |
| PERM-005 | PERMISSION_CHANGE | CRITICAL | Rol asignado a usuario |
| PWD-001 | PASSWORD_CHANGE | INFO | Cambio de contraseña por usuario |
| PWD-002 | PASSWORD_CHANGE | WARNING | Cambio de contraseña por admin |
| PWD-003 | PASSWORD_CHANGE | ERROR | Intento de cambio con contraseña débil |

**Reglas de Negocio**:
- Eventos con severity=CRITICAL generan alerta automática al Oficial de Cumplimiento
- Eventos DENIED se retienen durante 7 años para cumplimiento regulatorio
- Eventos se almacenan en tabla inmutable (append-only)

---

## 4. Lógica de Negocio

### 4.1 Proceso de Autenticación (Login)

```
1. Usuario envía credenciales: {username, password}

2. Sistema valida formato de entrada
   - Username no vacío
   - Password no vacío

3. Sistema busca usuario por username
   - Si no existe → Registrar AUTH-004, retornar error genérico
   - Si existe → Continuar

4. Sistema verifica estado del usuario
   - Si status = LOCKED → Registrar AUTH-003, retornar error "Cuenta bloqueada"
   - Si status = INACTIVE → Registrar AUTH-003, retornar error "Cuenta inactiva"
   - Si status = SUSPENDED → Registrar AUTH-003, retornar error "Cuenta suspendida"
   - Si status = ACTIVE → Continuar

5. Sistema verifica contraseña
   - Comparar password con passwordHash usando BCrypt
   - Si no coincide → 
     * Incrementar failedLoginAttempts
     * Actualizar lastFailedLogin
     * Si failedLoginAttempts >= 5 → Cambiar status a LOCKED, generar alerta
     * Registrar AUTH-002
     * Retornar error genérico
   - Si coincide → Continuar

6. Sistema verifica si requiere cambio de contraseña
   - Si mustChangePassword = true → Retornar respuesta especial indicando cambio obligatorio
   - Si passwordExpiresAt < ahora → Retornar respuesta especial indicando cambio obligatorio

7. Sistema verifica usuarios externos
   - Si usuario tiene temporaryAccessEnd:
     * Si temporaryAccessEnd < ahora → Registrar AUTH-003, retornar error "Acceso temporal expirado"

8. Sistema crea sesión
   - Generar JWT token con:
     * userId
     * username
     * roles (array de roleCodes)
     * permissions (array de permissionCodes)
     * expiración: ahora + 2 horas
   - Generar refresh token (UUID seguro)
   - Crear registro Session en base de datos

9. Sistema actualiza usuario
   - Resetear failedLoginAttempts a 0
   - Actualizar lastSuccessfulLogin a ahora

10. Sistema registra auditoría
    - Crear SecurityAuditEvent con código AUTH-001 (LOGIN exitoso)

11. Sistema retorna respuesta exitosa
    - Token JWT
    - Refresh token
    - Información del usuario (sin datos sensibles)
    - Permisos del usuario
```

### 4.2 Proceso de Autorización (Verificación de Permisos)

```
1. Request HTTP llega al servidor con header Authorization: Bearer {JWT}

2. Authorization Interceptor extrae y valida JWT
   - Verificar firma del token
   - Verificar que no haya expirado
   - Si inválido → Retornar 401 Unauthorized
   - Si válido → Extraer user context (userId, roles, permissions)

3. Identificar el recurso y acción solicitada
   - Extraer de la ruta y método HTTP
   - Construir permissionCode requerido
   - Ejemplo: PUT /api/dossiers/client/{id} → "dossier:client:update"

4. Verificar si usuario tiene el permiso
   - Buscar permissionCode en lista de permissions del JWT
   - Si NO tiene el permiso:
     * Registrar SecurityAuditEvent con código PERM-001
     * Generar alerta si acción es crítica
     * Retornar 403 Forbidden
   - Si tiene el permiso → Continuar

5. Verificar restricciones adicionales del permiso
   - Si permission.requiresOwnership = true:
     * Cargar recurso de la base de datos
     * Verificar que recurso.createdBy = userId
     * Si NO es el creador:
       - Verificar si usuario tiene rol COMPLIANCE_OFFICER o COMPLIANCE_AREA
       - Si NO → Registrar PERM-001, retornar 403
   - Si permission.allowedStatuses no está vacío:
     * Cargar recurso de la base de datos
     * Verificar que recurso.status está en allowedStatuses
     * Si NO → Registrar PERM-001, retornar 403

6. Verificar restricciones del rol
   - Si rol tiene allowedIpRanges definido:
     * Verificar que IP del request está en el rango
     * Si NO → Registrar PERM-002, generar alerta, retornar 403
   - Si rol tiene allowedTimeWindows definido:
     * Verificar que hora actual está en ventana permitida
     * Si NO → Registrar PERM-002, generar alerta, retornar 403

7. Actualizar actividad de sesión
   - Actualizar session.lastActivityTimestamp

8. Permitir acceso
   - Continuar con el procesamiento del request
   - El controlador puede acceder a UserContext desde el contexto de seguridad
```

### 4.3 Generación de Alertas de Seguridad

El módulo genera alertas automáticas ante los siguientes eventos:

| Evento | Condición | Severidad | Destinatario |
|--------|-----------|-----------|--------------|
| Múltiples intentos de login fallidos | 5 intentos en menos de 15 minutos | ALTA | Oficial de Cumplimiento |
| Cuenta bloqueada | failedLoginAttempts >= 5 | ALTA | Oficial de Cumplimiento |
| Acceso fuera de horario | Login fuera de allowedTimeWindows | MEDIA | Oficial de Cumplimiento |
| Acceso desde IP no autorizada | IP no en allowedIpRanges | ALTA | Oficial de Cumplimiento |
| Cambio de permisos de rol | Modificación de Role.permissions | CRÍTICA | Oficial de Cumplimiento |
| Asignación de rol crítico | Asignar COMPLIANCE_OFFICER u otro rol crítico | ALTA | Oficial de Cumplimiento |
| Acceso de usuario externo | Login de EXTERNAL_AUDITOR o SUDEASEG_INSPECTOR | MEDIA | Oficial de Cumplimiento |
| Múltiples accesos denegados | 10 eventos PERM-001 en 1 hora del mismo usuario | ALTA | Oficial de Cumplimiento |
| Cambio de contraseña administrativa | Admin cambia password de otro usuario | MEDIA | Oficial de Cumplimiento + Usuario afectado |

**Formato de Alerta**:

```json
{
  "alertId": "UUID",
  "alertCode": "SEC-AUTH-001",
  "alertType": "SECURITY",
  "severity": "enum [LOW, MEDIUM, HIGH, CRITICAL]",
  "title": "string",
  "description": "string",
  "timestamp": "timestamp",
  "relatedUser": "UUID",
  "relatedRole": "string",
  "relatedEvents": ["array of SecurityAuditEvent IDs"],
  "status": "enum [OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE]",
  "assignedTo": "UUID (Oficial de Cumplimiento)",
  "metadata": {
    "ipAddress": "string",
    "userAgent": "string",
    "attemptCount": "integer",
    "additionalInfo": "object"
  }
}
```

---

## 5. Integración con Otros Módulos

### 5.1 Integración con Módulo de Auditoría

El módulo de autenticación/autorización se integra con el módulo de auditoría para registrar todos los eventos de seguridad.

**Eventos Enviados al Módulo de Auditoría**:
- Todos los eventos de SecurityAuditEvent
- Cambios en usuarios, roles y permisos
- Creación y cierre de sesiones

**Información Compartida**:
```json
{
  "auditEventType": "SECURITY",
  "userId": "UUID",
  "username": "string",
  "roles": ["array of role codes"],
  "action": "string",
  "resource": "object",
  "result": "SUCCESS | FAILURE | DENIED",
  "timestamp": "timestamp",
  "metadata": "object"
}
```

### 5.2 Integración con Módulo de Alertas

El módulo genera alertas automáticas que se envían al sistema de alertas centralizado.

**Eventos que Generan Alertas**:
- Cuenta bloqueada por intentos fallidos
- Acceso fuera de horario o desde IP no autorizada
- Cambios críticos en roles/permisos
- Acceso de usuarios externos (auditores, inspectores)
- Múltiples accesos denegados

**Información Enviada**:
```json
{
  "alertType": "SECURITY",
  "severity": "enum",
  "title": "string",
  "description": "string",
  "relatedUser": "UUID",
  "relatedEvents": ["array of event IDs"],
  "assignedTo": "UUID (Oficial de Cumplimiento)",
  "requiresAction": "boolean"
}
```

### 5.3 Integración con Módulo de Expedientes (Dossier)

El módulo de autorización valida permisos antes de cualquier operación CRUD en expedientes.

**Validaciones Realizadas**:
- Usuario tiene permiso para la acción (CREATE, READ, UPDATE, DELETE, APPROVE)
- Usuario tiene acceso al tipo de expediente (CLIENT, INTERMEDIARY, etc.)
- Si requiresOwnership=true, validar que el usuario creó el expediente
- Validar que el estado del expediente permite la acción

**UserContext Proporcionado**:
```java
public class UserContext {
    private UUID userId;
    private String username;
    private List<String> roleCodes;
    private List<String> permissionCodes;
    private String ipAddress;
    private UUID sessionId;
    
    public boolean hasPermission(String permissionCode);
    public boolean hasRole(String roleCode);
    public boolean isComplianceOfficer();
    public boolean isExternalUser();
}
```

### 5.4 Integración con Módulo de Evaluación de Riesgo

El módulo proporciona información de contexto del usuario para la evaluación de riesgo.

**Información Proporcionada**:
- Rol del usuario que realiza la evaluación
- Si es Oficial de Cumplimiento o Área de Cumplimiento
- Timestamp de la evaluación para auditoría

### 5.5 Integración con Módulo de PEP

El módulo valida permisos especiales para gestión de información PEP, que es considerada sensible.

**Validaciones Adicionales**:
- Solo Oficial de Cumplimiento y Área de Cumplimiento pueden modificar clasificación PEP
- Acceso a información PEP genera evento de auditoría automático
- Cambios en condición PEP generan alerta al Oficial

---

## 6. APIs REST

### 6.1 Endpoints de Autenticación

#### POST /api/auth/login

**Descripción**: Autentica un usuario y crea una sesión.

**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "token": "string (JWT)",
    "refreshToken": "string",
    "tokenExpiration": "timestamp",
    "user": {
      "userId": "UUID",
      "username": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "roles": [{
        "roleCode": "string",
        "roleName": "string"
      }],
      "permissions": ["array of permission codes"]
    },
    "sessionId": "UUID"
  },
  "timestamp": "timestamp"
}
```

**Response 401 Unauthorized** (credenciales inválidas):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Credenciales inválidas",
    "details": null
  },
  "timestamp": "timestamp"
}
```

**Response 403 Forbidden** (cuenta bloqueada):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ACCOUNT_LOCKED",
    "message": "Cuenta bloqueada por múltiples intentos fallidos",
    "details": {
      "failedAttempts": 5,
      "lockTimestamp": "timestamp",
      "contactSupport": true
    }
  },
  "timestamp": "timestamp"
}
```

**Response 403 Forbidden** (requiere cambio de contraseña):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_PASSWORD_CHANGE_REQUIRED",
    "message": "Debe cambiar su contraseña antes de continuar",
    "details": {
      "reason": "PASSWORD_EXPIRED | FIRST_LOGIN",
      "changePasswordUrl": "/api/auth/change-password"
    }
  },
  "timestamp": "timestamp"
}
```

---

#### POST /api/auth/logout

**Descripción**: Cierra la sesión actual del usuario.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "timestamp": "timestamp"
}
```

---

#### POST /api/auth/refresh

**Descripción**: Renueva el JWT token usando el refresh token.

**Request**:
```json
{
  "refreshToken": "string"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "token": "string (new JWT)",
    "tokenExpiration": "timestamp"
  },
  "timestamp": "timestamp"
}
```

**Response 401 Unauthorized** (refresh token inválido o expirado):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_REFRESH_TOKEN",
    "message": "Token de refresco inválido o expirado",
    "details": null
  },
  "timestamp": "timestamp"
}
```

---

#### GET /api/auth/session

**Descripción**: Obtiene información de la sesión actual del usuario.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "sessionId": "UUID",
    "userId": "UUID",
    "username": "string",
    "roles": ["array of role codes"],
    "permissions": ["array of permission codes"],
    "loginTimestamp": "timestamp",
    "lastActivityTimestamp": "timestamp",
    "tokenExpiration": "timestamp",
    "sessionTimeoutMinutes": 30,
    "minutesUntilExpiration": 15
  },
  "timestamp": "timestamp"
}
```

---

#### POST /api/auth/change-password

**Descripción**: Cambia la contraseña del usuario autenticado.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Request**:
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "data": {
    "mustChangePassword": false,
    "passwordLastChanged": "timestamp",
    "passwordExpiresAt": "timestamp"
  },
  "timestamp": "timestamp"
}
```

**Response 400 Bad Request** (contraseña débil):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_WEAK_PASSWORD",
    "message": "La contraseña no cumple con los requisitos de seguridad",
    "details": {
      "requirements": [
        "Mínimo 8 caracteres",
        "Al menos una mayúscula",
        "Al menos una minúscula",
        "Al menos un número",
        "Al menos un símbolo especial"
      ],
      "failedRequirements": ["Al menos un símbolo especial"]
    }
  },
  "timestamp": "timestamp"
}
```

---

### 6.2 Endpoints de Gestión de Usuarios

#### POST /api/users

**Descripción**: Crea un nuevo usuario (requiere rol COMPLIANCE_OFFICER).

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Request**:
```json
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "documentType": "enum [CEDULA, PASSPORT, RIF]",
  "documentNumber": "string",
  "phoneNumber": "string",
  "roleCodes": ["array of role codes"],
  "temporaryAccessStart": "timestamp (optional, for external users)",
  "temporaryAccessEnd": "timestamp (optional, for external users)",
  "mustChangePassword": "boolean (default: true)",
  "metadata": {
    "employeeId": "string",
    "department": "string",
    "notes": "string"
  }
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "userId": "UUID",
    "username": "string",
    "email": "string",
    "temporaryPassword": "string (only returned on creation)",
    "status": "ACTIVE",
    "mustChangePassword": true,
    "roles": ["array of assigned roles"]
  },
  "timestamp": "timestamp"
}
```

---

#### GET /api/users

**Descripción**: Lista todos los usuarios (paginado).

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 20)
- `status`: filtrar por status (ACTIVE, INACTIVE, LOCKED, SUSPENDED)
- `roleCode`: filtrar por rol
- `search`: búsqueda por username, email o nombre

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "content": [{
      "userId": "UUID",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "status": "ACTIVE",
      "roles": ["array of role codes"],
      "lastSuccessfulLogin": "timestamp",
      "createdAt": "timestamp"
    }],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "timestamp": "timestamp"
}
```

---

#### GET /api/users/{userId}

**Descripción**: Obtiene detalles de un usuario específico.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "UUID",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "documentType": "CEDULA",
    "documentNumber": "string",
    "phoneNumber": "string",
    "status": "ACTIVE",
    "failedLoginAttempts": 0,
    "lastFailedLogin": null,
    "lastSuccessfulLogin": "timestamp",
    "passwordLastChanged": "timestamp",
    "passwordExpiresAt": "timestamp",
    "mustChangePassword": false,
    "emailVerified": true,
    "roles": [{
      "roleCode": "string",
      "roleName": "string",
      "assignedAt": "timestamp",
      "assignedBy": "string (username)"
    }],
    "activeSessions": [{
      "sessionId": "UUID",
      "loginTimestamp": "timestamp",
      "lastActivityTimestamp": "timestamp",
      "ipAddress": "string",
      "deviceInfo": "object"
    }],
    "metadata": "object",
    "createdAt": "timestamp",
    "createdBy": "string (username)",
    "updatedAt": "timestamp",
    "updatedBy": "string (username)"
  },
  "timestamp": "timestamp"
}
```

---

#### PUT /api/users/{userId}

**Descripción**: Actualiza un usuario existente.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Request**:
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "status": "enum [ACTIVE, INACTIVE, SUSPENDED]",
  "roleCodes": ["array of role codes"],
  "metadata": "object"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "UUID",
    "username": "string",
    "email": "string (updated)",
    "status": "ACTIVE",
    "roles": ["updated roles"],
    "updatedAt": "timestamp",
    "updatedBy": "string (username)"
  },
  "timestamp": "timestamp"
}
```

---

#### POST /api/users/{userId}/unlock

**Descripción**: Desbloquea un usuario que fue bloqueado por intentos fallidos.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Usuario desbloqueado exitosamente",
  "data": {
    "userId": "UUID",
    "status": "ACTIVE",
    "failedLoginAttempts": 0,
    "unlockedBy": "string (username)",
    "unlockedAt": "timestamp"
  },
  "timestamp": "timestamp"
}
```

---

#### POST /api/users/{userId}/reset-password

**Descripción**: Restablece la contraseña de un usuario (solo COMPLIANCE_OFFICER).

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "userId": "UUID",
    "temporaryPassword": "string (auto-generated)",
    "mustChangePassword": true,
    "resetBy": "string (username)",
    "resetAt": "timestamp"
  },
  "timestamp": "timestamp"
}
```

---

#### POST /api/users/{userId}/revoke-sessions

**Descripción**: Revoca todas las sesiones activas de un usuario.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Sesiones revocadas exitosamente",
  "data": {
    "userId": "UUID",
    "sessionsRevoked": 3,
    "revokedBy": "string (username)",
    "revokedAt": "timestamp"
  },
  "timestamp": "timestamp"
}
```

---

### 6.3 Endpoints de Gestión de Roles

#### GET /api/roles

**Descripción**: Lista todos los roles del sistema.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": [{
    "roleId": "UUID",
    "roleCode": "string",
    "roleName": "string",
    "description": "string",
    "roleType": "enum",
    "isSystemRole": "boolean",
    "permissionCount": 45,
    "userCount": 12,
    "active": true
  }],
  "timestamp": "timestamp"
}
```

---

#### GET /api/roles/{roleCode}

**Descripción**: Obtiene detalles completos de un rol incluyendo sus permisos.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "roleId": "UUID",
    "roleCode": "string",
    "roleName": "string",
    "description": "string",
    "roleType": "INTERNAL_OPERATIONAL",
    "isSystemRole": true,
    "permissions": [{
      "permissionCode": "string",
      "module": "string",
      "entity": "string",
      "action": "string",
      "description": "string"
    }],
    "metadata": {
      "requiresApproval": true,
      "maxConcurrentSessions": 3,
      "sessionTimeoutMinutes": 30
    },
    "active": true,
    "createdAt": "timestamp"
  },
  "timestamp": "timestamp"
}
```

---

#### PUT /api/roles/{roleCode}/permissions

**Descripción**: Actualiza los permisos de un rol (solo roles custom, no system roles). Requiere aprobación del Oficial de Cumplimiento.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Request**:
```json
{
  "permissionCodes": ["array of permission codes to assign"],
  "justification": "string (required)"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Permisos actualizados exitosamente",
  "data": {
    "roleCode": "string",
    "permissionsAdded": ["array of added permissions"],
    "permissionsRemoved": ["array of removed permissions"],
    "updatedBy": "string (username)",
    "updatedAt": "timestamp",
    "alertGenerated": true,
    "alertId": "UUID"
  },
  "timestamp": "timestamp"
}
```

---

### 6.4 Endpoints de Auditoría de Seguridad

#### GET /api/security-audit

**Descripción**: Consulta eventos de auditoría de seguridad (paginado).

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `page`: número de página (default: 0)
- `size`: tamaño de página (default: 50)
- `startDate`: fecha inicio (ISO 8601)
- `endDate`: fecha fin (ISO 8601)
- `userId`: filtrar por usuario
- `eventType`: filtrar por tipo de evento
- `severity`: filtrar por severidad
- `result`: filtrar por resultado (SUCCESS, FAILURE, DENIED)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "content": [{
      "eventId": "UUID",
      "eventCode": "string",
      "eventType": "string",
      "severity": "string",
      "timestamp": "timestamp",
      "username": "string",
      "activeRoles": ["array"],
      "action": "string",
      "result": "string",
      "ipAddress": "string",
      "alertGenerated": false
    }],
    "page": 0,
    "size": 50,
    "totalElements": 5420,
    "totalPages": 109
  },
  "timestamp": "timestamp"
}
```

---

#### GET /api/security-audit/user/{userId}

**Descripción**: Obtiene historial completo de auditoría de un usuario específico.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `startDate`: fecha inicio
- `endDate`: fecha fin
- `eventType`: filtrar por tipo

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "UUID",
    "username": "string",
    "period": {
      "start": "timestamp",
      "end": "timestamp"
    },
    "summary": {
      "totalEvents": 1250,
      "successfulLogins": 145,
      "failedLogins": 2,
      "accessDenied": 0,
      "actionsPerformed": 1103
    },
    "events": [{
      "eventId": "UUID",
      "eventCode": "string",
      "timestamp": "timestamp",
      "action": "string",
      "result": "string",
      "resource": "object",
      "ipAddress": "string"
    }]
  },
  "timestamp": "timestamp"
}
```

---

#### GET /api/security-audit/reports/login-activity

**Descripción**: Genera reporte consolidado de actividad de login.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `startDate`: fecha inicio (required)
- `endDate`: fecha fin (required)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "timestamp",
      "end": "timestamp"
    },
    "summary": {
      "totalLogins": 2450,
      "successfulLogins": 2398,
      "failedLogins": 52,
      "uniqueUsers": 87,
      "accountsLocked": 3,
      "suspiciousAttempts": 8
    },
    "topUsers": [{
      "username": "string",
      "loginCount": 145,
      "lastLogin": "timestamp"
    }],
    "failedLoginsByUser": [{
      "username": "string",
      "failedAttempts": 5,
      "locked": true
    }],
    "loginsByHour": [{
      "hour": 9,
      "count": 245
    }],
    "loginsByRole": [{
      "roleCode": "string",
      "count": 450
    }]
  },
  "timestamp": "timestamp"
}
```

---

#### GET /api/security-audit/reports/access-denied

**Descripción**: Genera reporte de intentos de acceso denegados.

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:
- `startDate`: fecha inicio (required)
- `endDate`: fecha fin (required)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "timestamp",
      "end": "timestamp"
    },
    "summary": {
      "totalDenied": 142,
      "byPermission": 98,
      "byTime": 12,
      "byIp": 32,
      "uniqueUsers": 23
    },
    "topDeniedUsers": [{
      "username": "string",
      "deniedCount": 15,
      "mostDeniedPermission": "string"
    }],
    "topDeniedPermissions": [{
      "permissionCode": "string",
      "deniedCount": 45,
      "affectedUsers": 12
    }],
    "events": [{
      "timestamp": "timestamp",
      "username": "string",
      "action": "string",
      "denialReason": "string",
      "resource": "object"
    }]
  },
  "timestamp": "timestamp"
}
```

---

## 7. Implementación Técnica en Java

### 7.1 Estructura de Paquetes

```
com.siar.security
├── config
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── PasswordEncoderConfig.java
├── model
│   ├── User.java
│   ├── Role.java
│   ├── Permission.java
│   ├── Session.java
│   └── SecurityAuditEvent.java
├── repository
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── PermissionRepository.java
│   ├── SessionRepository.java
│   └── SecurityAuditRepository.java
├── service
│   ├── AuthenticationService.java
│   ├── AuthorizationService.java
│   ├── UserManagementService.java
│   ├── RoleManagementService.java
│   ├── SessionManagementService.java
│   ├── SecurityAuditService.java
│   └── JwtTokenService.java
├── controller
│   ├── AuthenticationController.java
│   ├── UserManagementController.java
│   ├── RoleManagementController.java
│   └── SecurityAuditController.java
├── dto
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── UserDTO.java
│   ├── RoleDTO.java
│   └── SecurityAuditEventDTO.java
├── security
│   ├── JwtAuthenticationFilter.java
│   ├── JwtAuthorizationFilter.java
│   ├── UserContext.java
│   └── PermissionEvaluator.java
└── exception
    ├── AuthenticationException.java
    ├── AuthorizationException.java
    └── SecurityException.java
```

---

## 8. Consideraciones de Seguridad

### 8.1 Almacenamiento de Contraseñas

- **NUNCA** almacenar contraseñas en texto plano
- Usar BCrypt con factor de trabajo 12 (configurable)
- No usar MD5, SHA-1, o SHA-256 para passwords (son demasiado rápidos)
- Salt es manejado automáticamente por BCrypt

### 8.2 Tokens JWT

- Firmar con algoritmo HMAC-SHA256 o RS256
- Clave secreta almacenada en variable de entorno, nunca en código
- Incluir claims: `iss` (issuer), `sub` (userId), `exp` (expiration), `iat` (issued at)
- Token de acceso expira en 2 horas
- Refresh token expira en 24 horas
- No incluir información sensible en el payload (es decodificable)

### 8.3 Sesiones

- Almacenar sesiones en base de datos para permitir revocación
- Hashear tokens antes de almacenarlos en BD
- Limpiar sesiones expiradas periódicamente (job programado)
- Limitar sesiones concurrentes por rol

### 8.4 Protección contra Ataques

**Fuerza Bruta**:
- Limitar intentos de login (5 intentos en 15 minutos)
- Bloquear cuenta después del límite
- Incrementar tiempo de respuesta después de cada intento fallido (throttling)
- Rate limiting en endpoint de login (100 requests por minuto por IP)

**Session Hijacking**:
- Usar HTTPS obligatorio
- HttpOnly flag en cookies
- Secure flag en cookies (solo HTTPS)
- SameSite=Strict en cookies
- Regenerar session ID después de login exitoso

**XSS (Cross-Site Scripting)**:
- Sanitizar toda entrada de usuario
- Content Security Policy headers
- Escapar output en templates

**CSRF (Cross-Site Request Forgery)**:
- CSRF tokens en formularios
- Verificar header Origin/Referer
- SameSite cookies

**SQL Injection**:
- Usar siempre parámetros preparados (JPA hace esto automáticamente)
- NUNCA concatenar strings para queries
- Validar entrada de usuario

### 8.5 Compliance y Regulatorio

**Retención de Datos de Auditoría**:
- Eventos de seguridad se retienen por 7 años (requisito SUDEASEG)
- Usar tabla append-only (no permitir UPDATE ni DELETE)
- Backup diario de logs de auditoría

**Acceso de Inspectores**:
- Registrar TODO acceso de SUDEASEG_INSPECTOR
- Generar reporte automático de accesos externos
- Limitar acceso temporal con fecha de expiración

**Separación de Funciones**:
- Ningún usuario puede crear Y aprobar su propio expediente
- Cambios de configuración requieren aprobación
- Oficial de Cumplimiento no puede eliminar logs de auditoría

---

## 9. Configuración y Parametrización

### 9.1 Parámetros Configurables

| Parámetro | Descripción | Valor Default | Configurable por |
|-----------|-------------|---------------|------------------|
| jwt.secret | Clave secreta para firmar JWT | (variable de entorno) | Admin Sistema |
| jwt.expiration.access | Expiración token acceso (minutos) | 120 | Oficial Cumplimiento |
| jwt.expiration.refresh | Expiración refresh token (horas) | 24 | Oficial Cumplimiento |
| auth.max.failed.attempts | Intentos fallidos antes de bloqueo | 5 | Oficial Cumplimiento |
| auth.failed.attempts.window | Ventana de tiempo para contar intentos (minutos) | 15 | Oficial Cumplimiento |
| session.timeout.minutes | Timeout de sesión por inactividad | 30 | Por rol |
| session.max.concurrent | Sesiones concurrentes por usuario | 3 | Por rol |
| password.min.length | Longitud mínima de contraseña | 8 | Oficial Cumplimiento |
| password.require.uppercase | Requiere mayúsculas | true | Oficial Cumplimiento |
| password.require.lowercase | Requiere minúsculas | true | Oficial Cumplimiento |
| password.require.number | Requiere números | true | Oficial Cumplimiento |
| password.require.special | Requiere caracteres especiales | true | Oficial Cumplimiento |
| password.expiration.days | Días hasta expiración de contraseña | 90 | Oficial Cumplimiento |
| password.history.count | No reutilizar últimas N contraseñas | 5 | Oficial Cumplimiento |

### 9.2 Variables de Entorno

```properties
# JWT Configuration
JWT_SECRET=<secret_key_256_bits>
JWT_ISSUER=SIAR_SYSTEM
JWT_ACCESS_EXPIRATION_MINUTES=120
JWT_REFRESH_EXPIRATION_HOURS=24

# BCrypt Configuration
BCRYPT_WORK_FACTOR=12

# Database
DB_URL=jdbc:postgresql://localhost:5432/siar
DB_USERNAME=siar_user
DB_PASSWORD=<secure_password>

# Security
ENABLE_CSRF_PROTECTION=true
ALLOWED_ORIGINS=https://siar.empresa.com.ve

# Rate Limiting
RATE_LIMIT_LOGIN=100/minute
RATE_LIMIT_API=1000/minute
