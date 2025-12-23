# Flujo de Autenticación - Pantalla de Login SIAR

## 1. Descripción General

La pantalla de inicio de sesión del Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR) es el punto de entrada único y seguro al sistema, diseñado para cumplir con los requisitos regulatorios de SUDEASEG y las mejores prácticas de seguridad en sistemas financieros.

---

## 2. Diseño Visual

### 2.1 Elementos de la Interfaz

#### Header (Cabecera)
- **Logo institucional**: Ícono de escudo con check (ShieldCheck) representando seguridad y cumplimiento
- **Nombre del sistema**: "SIAR" en tipografía bold, tamaño 3xl
- **Descripción**: "Sistema Integral de Administración de Riesgos y Cumplimiento"
- **Colores**: Gradiente azul (blue-600 a blue-700) para transmitir profesionalismo y confianza
- **Fondo del logo**: Círculo blanco con sombra para destacar el ícono

#### Formulario de Login
- **Campo Usuario**: Input de texto con placeholder "Ingrese su usuario"
- **Campo Contraseña**: Input tipo password con toggle para mostrar/ocultar
- **Botón Iniciar Sesión**: Botón primario azul con estado de carga
- **Mensajes de error**: Alert rojo con ícono de advertencia (sin información sensible)

#### Footer (Pie de página)
- **Mensaje regulatorio**: "Sistema bajo supervisión de SUDEASEG"
- **Mensaje de auditoría**: "Todos los accesos son registrados para auditoría"
- **Versión del sistema**: SIAR v1.0

### 2.2 Paleta de Colores

```css
/* Colores principales */
Primary: #2563eb (blue-600)     /* Botones, header */
Primary Dark: #1d4ed8 (blue-700) /* Hover states */
Background: #f8fafc (slate-50)   /* Fondo de página */
Card: #ffffff (white)            /* Fondo de card */
Border: #e2e8f0 (slate-200)      /* Bordes */

/* Estados de error */
Error: #dc2626 (red-600)         /* Mensajes de error */
Error BG: #fef2f2 (red-50)       /* Fondo de alert */
Error Border: #fecaca (red-200)  /* Borde de alert */

/* Textos */
Text Primary: #0f172a (slate-900)
Text Secondary: #64748b (slate-500)
Text Muted: #94a3b8 (slate-400)
```

### 2.3 Tipografía

- **Títulos**: Font family system (sans-serif), peso bold (700)
- **Subtítulos**: Font family system, peso medium (500)
- **Textos**: Font family system, peso normal (400)
- **Tamaños**:
  - H1 (Título SIAR): 30px (3xl)
  - Descripción: 14px (sm)
  - Labels: 14px (sm)
  - Inputs: 16px (base)
  - Mensajes de error: 14px (sm)
  - Footer: 12px (xs)

### 2.4 Espaciado y Layout

- **Container máximo**: 28rem (448px)
- **Padding del card**: 2rem (32px)
- **Espaciado entre campos**: 1.5rem (24px)
- **Border radius**: 1rem (16px) para el card principal
- **Sombra**: shadow-2xl para efecto de elevación

---

## 3. Flujo de Autenticación

### 3.1 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                   INICIO - Pantalla Login                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Usuario ingresa      │
                │ credenciales         │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Validación de        │
                │ campos requeridos    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ POST /api/auth/login │
                └──────────┬───────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
     ┌──────────────────┐  ┌──────────────────┐
     │ Backend valida   │  │ Registra evento  │
     │ credenciales     │  │ en audit_logs    │
     └────────┬─────────┘  └──────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐      ┌──────────────┐
│ Válidas │      │ Inválidas    │
└────┬────┘      └──────┬───────┘
     │                  │
     │                  ▼
     │           ┌──────────────────────┐
     │           │ Incrementar counter  │
     │           │ login_attempts       │
     │           └──────┬───────────────┘
     │                  │
     │           ┌──────┴──────┐
     │           ▼             ▼
     │    ┌───────────┐ ┌─────────────┐
     │    │ < 5       │ │ >= 5        │
     │    │ intentos  │ │ intentos    │
     │    └─────┬─────┘ └──────┬──────┘
     │          │               │
     │          ▼               ▼
     │    ┌──────────┐   ┌────────────┐
     │    │ Error    │   │ Bloqueo    │
     │    │ 401      │   │ temporal   │
     │    └──────────┘   │ 30 min     │
     │                   │ Error 423  │
     │                   └────────────┘
     │
     ▼
┌────────────────────────┐
│ Verificar estado       │
│ del usuario            │
└───────────┬────────────┘
            │
    ┌───────┴──────┐
    ▼              ▼
┌─────────┐  ┌──────────────┐
│ ACTIVE  │  │ No activo    │
└────┬────┘  │ (PENDING,    │
     │       │ INACTIVE,    │
     │       │ SUSPENDED)   │
     │       └──────┬───────┘
     │              │
     │              ▼
     │       ┌──────────────┐
     │       │ Error 403    │
     │       └──────────────┘
     │
     ▼
┌────────────────────────┐
│ Verificar bloqueo      │
│ temporal (locked_until)│
└───────────┬────────────┘
            │
    ┌───────┴──────┐
    ▼              ▼
┌──────────┐  ┌─────────────┐
│ No       │  │ Bloqueado   │
│ bloqueado│  │ Error 423   │
└─────┬────┘  └─────────────┘
      │
      ▼
┌────────────────────────┐
│ Verificar acceso       │
│ temporal (externos)    │
└───────────┬────────────┘
            │
    ┌───────┴──────┐
    ▼              ▼
┌──────────┐  ┌─────────────┐
│ Vigente  │  │ Vencido     │
│          │  │ Error 403   │
└─────┬────┘  └─────────────┘
      │
      ▼
┌────────────────────────┐
│ Cargar roles activos   │
│ del usuario            │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Determinar rol         │
│ principal (isMain)     │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Crear sesión en        │
│ user_sessions          │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Generar token JWT      │
│ con roles y permisos   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Registrar login        │
│ exitoso en audit_logs  │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Actualizar             │
│ last_login_at          │
└───────────┬────────────┘
            │
    ┌───────┴──────────┐
    ▼                  ▼
┌──────────────┐  ┌─────────────────┐
│ Verificar    │  │ No requiere     │
│ must_change_ │  │ cambio          │
│ password     │  └────────┬────────┘
└──────┬───────┘           │
       │                   │
   ┌───┴────┐              │
   ▼        ▼              │
┌─────┐  ┌──────┐          │
│ Sí  │  │ No   │          │
└──┬──┘  └───┬──┘          │
   │         │              │
   ▼         └──────────────┘
┌──────────────┐            │
│ Redirigir a  │            │
│ /auth/change │            │
│ -password    │            │
└──────────────┘            │
                            ▼
                 ┌────────────────────┐
                 │ Redirigir a        │
                 │ dashboard según    │
                 │ rol principal      │
                 └──────────┬─────────┘
                            │
                            ▼
                 ┌────────────────────┐
                 │ ROL-001 →          │
                 │ /compliance-officer│
                 │                    │
                 │ ROL-002 →          │
                 │ /compliance        │
                 │                    │
                 │ ROL-003 →          │
                 │ /commercial        │
                 │                    │
                 │ ... etc            │
                 └────────────────────┘
```

### 3.2 Validaciones de Seguridad

#### En el Cliente (Frontend)
1. **Campos requeridos**: Usuario y contraseña no pueden estar vacíos
2. **Deshabilitar formulario**: Durante el proceso de autenticación
3. **No almacenar credenciales**: No guardar en localStorage ni sessionStorage
4. **Timeout de sesión**: 8 horas de inactividad

#### En el Servidor (Backend)
1. **Verificación de credenciales**: Hash bcrypt de la contraseña
2. **Validación de estado**: Usuario debe estar ACTIVE
3. **Control de intentos fallidos**:
   - Incrementar `login_attempts` en cada fallo
   - Bloquear cuenta por 30 minutos después de 5 intentos
   - Almacenar en `locked_until`
4. **Validación de acceso temporal**: Para usuarios externos (ROL-010, ROL-011)
5. **Verificación de roles activos**: Solo cargar roles con `active = true`
6. **IP y User-Agent**: Registrar en sesión para detección de anomalías

### 3.3 Registro de Eventos de Auditoría

Cada intento de login (exitoso o fallido) debe registrarse en `audit_logs`:

#### Evento: LOGIN_ATTEMPT (Intento de login)
```json
{
  "event_id": "uuid",
  "event_type": "LOGIN",
  "action": "ATTEMPT",
  "category": "AUTHENTICATION",
  "level": "INFO",
  "user_id": null,
  "username": "usuario_ingresado",
  "session_id": null,
  "resource_type": "AUTHENTICATION",
  "resource_id": null,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "event_data": {
    "username": "usuario_ingresado",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "created_at": "2025-01-15T10:30:00Z"
}
```

#### Evento: LOGIN_SUCCESS (Login exitoso)
```json
{
  "event_id": "uuid",
  "event_type": "LOGIN",
  "action": "SUCCESS",
  "category": "AUTHENTICATION",
  "level": "INFO",
  "user_id": "user-uuid",
  "username": "jperez",
  "session_id": "session-uuid",
  "resource_type": "AUTHENTICATION",
  "resource_id": "user-uuid",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "event_data": {
    "username": "jperez",
    "user_id": "user-uuid",
    "full_name": "Juan Pérez",
    "roles": ["ROL-002"],
    "timestamp": "2025-01-15T10:30:05Z",
    "session_id": "session-uuid"
  },
  "created_at": "2025-01-15T10:30:05Z"
}
```

#### Evento: LOGIN_FAILED (Login fallido)
```json
{
  "event_id": "uuid",
  "event_type": "LOGIN",
  "action": "FAILED",
  "category": "AUTHENTICATION",
  "level": "WARNING",
  "user_id": null,
  "username": "jperez",
  "session_id": null,
  "resource_type": "AUTHENTICATION",
  "resource_id": null,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "event_data": {
    "username": "jperez",
    "reason": "INVALID_CREDENTIALS",
    "attempts": 1,
    "timestamp": "2025-01-15T10:25:00Z"
  },
  "created_at": "2025-01-15T10:25:00Z"
}
```

#### Evento: ACCOUNT_LOCKED (Cuenta bloqueada)
```json
{
  "event_id": "uuid",
  "event_type": "ACCOUNT",
  "action": "LOCKED",
  "category": "SECURITY",
  "level": "CRITICAL",
  "user_id": "user-uuid",
  "username": "jperez",
  "session_id": null,
  "resource_type": "USER",
  "resource_id": "user-uuid",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "event_data": {
    "username": "jperez",
    "user_id": "user-uuid",
    "reason": "MAX_FAILED_ATTEMPTS",
    "failed_attempts": 5,
    "locked_until": "2025-01-15T11:00:00Z",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "created_at": "2025-01-15T10:30:00Z"
}
```

### 3.4 Mensajes de Error (Sin Información Sensible)

Para cumplir con los requisitos de seguridad, los mensajes de error NO deben revelar información que pueda ser utilizada por atacantes:

| Situación | HTTP Status | Mensaje al Usuario |
|-----------|-------------|-------------------|
| Credenciales incorrectas | 401 | "Credenciales inválidas. Por favor verifique sus datos." |
| Usuario no existe | 401 | "Credenciales inválidas. Por favor verifique sus datos." |
| Usuario inactivo | 403 | "Su cuenta está inactiva o suspendida. Contacte al administrador." |
| Usuario suspendido | 403 | "Su cuenta está inactiva o suspendida. Contacte al administrador." |
| Cuenta bloqueada | 423 | "Cuenta bloqueada temporalmente por múltiples intentos fallidos." |
| Acceso temporal vencido | 403 | "Su acceso temporal ha expirado. Contacte al administrador." |
| Error de servidor | 500 | "Error al iniciar sesión. Intente nuevamente." |
| Error de conexión | 503 | "Error de conexión. Verifique su red e intente nuevamente." |

**Principio**: Nunca confirmar si un usuario existe o no. Siempre usar mensajes genéricos.

---

## 4. Gestión de Sesiones

### 4.1 Creación de Sesión

Al autenticarse exitosamente, se crea un registro en `user_sessions`:

```sql
INSERT INTO user_sessions (
  session_id,
  user_id,
  token_hash,
  ip_address,
  user_agent,
  login_at,
  last_activity_at,
  expires_at,
  is_active
) VALUES (
  'uuid',
  'user-uuid',
  'sha256-hash-of-token',
  '192.168.1.100',
  'Mozilla/5.0...',
  NOW(),
  NOW(),
  NOW() + INTERVAL '8 hours',
  true
);
```

### 4.2 Token JWT

El token JWT contiene:

```json
{
  "sub": "user-uuid",
  "username": "jperez",
  "fullName": "Juan Pérez",
  "roles": [
    {
      "roleId": "role-uuid",
      "roleCode": "ROL-002",
      "roleName": "Área de Cumplimiento",
      "isMain": true
    }
  ],
  "permissions": ["CLIENTES:READ", "CLIENTES:CREATE", "CLIENTES:UPDATE"],
  "sessionId": "session-uuid",
  "iat": 1705315800,
  "exp": 1705344600,
  "iss": "SIAR-Backend",
  "aud": "SIAR-Frontend"
}
```

### 4.3 Validación de Sesión

En cada request protegido:

1. **Verificar token JWT**: Firma, expiración, estructura
2. **Verificar sesión activa**: Consultar `user_sessions.is_active = true`
3. **Verificar expiración**: `expires_at > NOW()`
4. **Actualizar actividad**: `UPDATE user_sessions SET last_activity_at = NOW()`
5. **Verificar usuario activo**: `users.status = 'ACTIVE'`
6. **Verificar roles activos**: Solo permisos de roles activos

### 4.4 Cierre de Sesión

Al cerrar sesión (logout):

1. **Invalidar sesión**: `UPDATE user_sessions SET is_active = false, logout_at = NOW()`
2. **Eliminar cookie**: Borrar cookie `siar_session`
3. **Registrar evento**: Crear evento `LOGOUT_SUCCESS` en `audit_logs`
4. **Redirigir**: Enviar a `/login`

---

## 5. Redirección por Rol

### 5.1 Mapeo de Roles a Dashboards

| Código Rol | Nombre Rol | URL de Redirección |
|-----------|------------|-------------------|
| ROL-001 | Oficial de Cumplimiento | /dashboard/compliance-officer |
| ROL-002 | Área de Cumplimiento | /dashboard/compliance |
| ROL-003 | Área Comercial | /dashboard/commercial |
| ROL-004 | Área de Operaciones | /dashboard/operations |
| ROL-005 | Área Administrativa | /dashboard/administration |
| ROL-006 | Área Técnica | /dashboard/technical |
| ROL-007 | Recursos Humanos | /dashboard/hr |
| ROL-008 | Auditoría Interna | /dashboard/internal-audit |
| ROL-009 | Contraloría | /dashboard/comptroller |
| ROL-010 | Auditor Externo | /dashboard/external-auditor |
| ROL-011 | Inspector SUDEASEG | /dashboard/sudeaseg-inspector |

### 5.2 Lógica de Selección de Dashboard

```typescript
function determineRedirectUrl(roles: Role[]): string {
  // 1. Buscar rol marcado como principal (isMain = true)
  const mainRole = roles.find(r => r.isMain)
  
  if (mainRole) {
    return roleRedirects[mainRole.roleCode] || '/dashboard'
  }
  
  // 2. Si no hay rol principal, usar el primero activo
  if (roles.length > 0) {
    return roleRedirects[roles[0].roleCode] || '/dashboard'
  }
  
  // 3. Fallback a dashboard genérico
  return '/dashboard'
}
```

---

## 6. Consideraciones de Cumplimiento Regulatorio

### 6.1 Requisitos de SUDEASEG

1. **Trazabilidad Total**: Todos los accesos deben ser registrados en `audit_logs`
2. **Inmutabilidad de Auditoría**: Los registros de auditoría NO pueden ser modificados ni eliminados
3. **Control de Acceso**: RBAC estricto con segregación de funciones
4. **Acceso de Inspectores**: Los inspectores de SUDEASEG deben tener acceso de solo lectura
5. **Bloqueo de Cuentas**: Sistema automático de bloqueo por intentos fallidos
6. **Expiración de Sesiones**: Sesiones con tiempo límite (8 horas)
7. **Usuarios Externos**: Control especial para auditores externos e inspectores

### 6.2 Evidencia para Inspección

La pantalla de login y el flujo de autenticación generan evidencia verificable para inspecciones:

1. **Registro de todos los intentos**: En `audit_logs`
2. **Trazabilidad de sesiones**: En `user_sessions`
3. **Historial de cambios de contraseña**: En `user_change_history`
4. **Registro de bloqueos**: En `audit_logs` con nivel CRITICAL
5. **Accesos de inspectores**: Marcados específicamente en auditoría

### 6.3 Reportes Regulatorios

Información disponible para reportes:

- Total de accesos por período
- Intentos fallidos por usuario
- Cuentas bloqueadas
- Accesos de usuarios externos
- Accesos fuera de horario laboral
- Accesos desde IPs no autorizadas
- Sesiones simultáneas por usuario

---

## 7. Pruebas y Validación

### 7.1 Casos de Prueba

#### Prueba 1: Login Exitoso
- **Entrada**: Credenciales válidas de usuario activo
- **Esperado**: Redirección al dashboard correspondiente
- **Auditoría**: Evento LOGIN_SUCCESS registrado

#### Prueba 2: Credenciales Inválidas
- **Entrada**: Contraseña incorrecta
- **Esperado**: Error 401, mensaje genérico
- **Auditoría**: Evento LOGIN_FAILED registrado, incremento de login_attempts

#### Prueba 3: Usuario Inactivo
- **Entrada**: Credenciales de usuario con status != ACTIVE
- **Esperado**: Error 403, mensaje de cuenta inactiva
- **Auditoría**: Evento LOGIN_FAILED con reason = INACTIVE_ACCOUNT

#### Prueba 4: Bloqueo por Intentos Fallidos
- **Entrada**: 5 intentos fallidos consecutivos
- **Esperado**: Error 423, cuenta bloqueada 30 minutos
- **Auditoría**: Evento ACCOUNT_LOCKED con nivel CRITICAL

#### Prueba 5: Acceso Temporal Expirado (Externo)
- **Entrada**: Usuario externo con temporal_access_end < NOW()
- **Esperado**: Error 403, mensaje de acceso expirado
- **Auditoría**: Evento LOGIN_FAILED con reason = TEMPORAL_ACCESS_EXPIRED

#### Prueba 6: Cambio Obligatorio de Contraseña
- **Entrada**: Usuario con must_change_password = true
- **Esperado**: Redirección a /auth/change-password
- **Auditoría**: Evento LOGIN_SUCCESS + PASSWORD_CHANGE_REQUIRED

#### Prueba 7: Múltiples Roles
- **Entrada**: Usuario con 3 roles activos
- **Esperado**: Redirección según rol principal (isMain = true)
- **Auditoría**: JWT debe contener los 3 roles

### 7.2 Pruebas de Seguridad

1. **SQL Injection**: Validar escape de caracteres especiales en username
2. **XSS**: Sanitizar inputs antes de mostrar errores
3. **Brute Force**: Verificar bloqueo después de 5 intentos
4. **Session Hijacking**: Verificar que tokens no sean reutilizables
5. **Timing Attacks**: Mismo tiempo de respuesta para usuario existente/no existente
6. **CSRF**: Verificar tokens CSRF en formularios

---

## 8. Mantenimiento y Monitoreo

### 8.1 Métricas a Monitorear

- Tasa de éxito de login (%)
- Intentos fallidos por hora
- Cuentas bloqueadas por día
- Tiempo promedio de autenticación
- Sesiones activas concurrentes
- Accesos fuera de horario
- Errores 500 en autenticación

### 8.2 Alertas Automáticas

Configurar alertas para:
- Más de 10 intentos fallidos en 5 minutos (posible ataque)
- Más de 5 cuentas bloqueadas en 1 hora
- Accesos de inspectores SUDEASEG (notificación al Oficial de Cumplimiento)
- Errores de conexión con backend
- Sesiones expiradas masivamente

---

## 9. Anexos

### 9.1 Código de Respuesta HTTP

| Código | Significado | Uso en Login |
|--------|-------------|--------------|
| 200 | OK | Login exitoso |
| 400 | Bad Request | Campos faltantes |
| 401 | Unauthorized | Credenciales inválidas |
| 403 | Forbidden | Usuario inactivo/suspendido |
| 423 | Locked | Cuenta bloqueada |
| 500 | Internal Server Error | Error del servidor |
| 503 | Service Unavailable | Backend no disponible |

### 9.2 Referencias

- OWASP Authentication Cheat Sheet
- NIST SP 800-63B - Digital Identity Guidelines
- Providencia SUDEBAN 025/2010 (Gestión de Riesgos)
- Providencia SUDEBAN 162/2009 (Prevención de LAFT)

---

**Versión**: 1.0  
**Fecha**: Enero 2025  
**Autor**: Equipo de Desarrollo SIAR  
**Aprobado por**: Oficial de Cumplimiento
