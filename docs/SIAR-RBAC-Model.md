# Modelo RBAC para SIAR - Sistema Integral de Administración de Riesgos y Cumplimiento

## 1. Introducción

Este documento define el modelo de Roles, Perfiles y Segregación de Funciones (RBAC - Role-Based Access Control) para el Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR) de una empresa de seguros regulada en Venezuela.

### Principios Fundamentales del Modelo RBAC

1. **Segregación de Funciones**: Separación estricta entre creación/modificación y aprobación
2. **Aprobación Centralizada**: Ninguna modificación surte efecto sin aprobación del Oficial de Cumplimiento
3. **Trazabilidad Total**: Toda acción registrada con usuario, rol, fecha y detalle del cambio
4. **Parametrización**: Permisos configurables sin cambios de código
5. **No Bloqueo**: El sistema alerta pero no bloquea operaciones
6. **Decisión Humana**: Todas las decisiones finales son tomadas por personas
7. **Auditoría Continua**: Diseñado para inspección permanente del regulador

---

## 2. Definición de Roles

### 2.1 Roles Operativos

#### ROL-001: Oficial de Cumplimiento
**Descripción**: Máxima autoridad en materia de cumplimiento. Responsable de la aprobación final de todos los expedientes y parametrizaciones del sistema.

**Responsabilidades**:
- Aprobar/rechazar expedientes creados o modificados por otras áreas
- Configurar parámetros de riesgo y alertas
- Supervisar alertas generadas por el sistema
- Gestionar usuarios y permisos del sistema
- Reportar a SUDEASEG

#### ROL-002: Área de Cumplimiento
**Descripción**: Equipo de trabajo del área de cumplimiento que realiza tareas operativas bajo supervisión del Oficial de Cumplimiento.

**Responsabilidades**:
- Crear y modificar expedientes en todos los módulos
- Realizar evaluaciones de riesgo
- Investigar alertas generadas
- Preparar reportes para el Oficial de Cumplimiento

#### ROL-003: Área Comercial
**Descripción**: Área responsable de la captación de clientes y gestión de intermediarios comerciales.

**Responsabilidades**:
- Crear y modificar expedientes de Clientes
- Crear y modificar expedientes de Intermediarios
- Consultar evaluaciones de riesgo de sus expedientes

#### ROL-004: Área de Operaciones
**Descripción**: Área encargada de operaciones diarias y relaciones con intermediarios, reaseguradores y proveedores.

**Responsabilidades**:
- Crear expedientes de Intermediarios
- Crear expedientes de Reaseguradores
- Crear expedientes de Proveedores
- Gestionar documentación operativa

#### ROL-005: Área Administrativa
**Descripción**: Área responsable de la gestión administrativa y relación con proveedores.

**Responsabilidades**:
- Crear y modificar expedientes de Proveedores
- Gestionar documentación administrativa

#### ROL-006: Área Técnica
**Descripción**: Área técnica especializada en reaseguros y retrocesión.

**Responsabilidades**:
- Crear expedientes de Reaseguradores
- Crear expedientes de Retrocesionarios
- Evaluar aspectos técnicos del riesgo

#### ROL-007: Recursos Humanos
**Descripción**: Área de gestión del talento humano de la organización.

**Responsabilidades**:
- Crear y modificar expedientes de Empleados
- Gestionar documentación de personal

### 2.2 Roles de Supervisión y Control

#### ROL-008: Auditoría Interna
**Descripción**: Auditoría interna de la organización con acceso de solo lectura para verificar controles internos.

**Responsabilidades**:
- Revisar expedientes y evaluaciones
- Analizar alertas generadas
- Verificar trazabilidad de operaciones
- Generar reportes de auditoría interna

#### ROL-009: Contraloría
**Descripción**: Contraloría interna con acceso de solo lectura para supervisión administrativa.

**Responsabilidades**:
- Revisar expedientes y evaluaciones
- Monitorear alertas
- Verificar cumplimiento de procedimientos

### 2.3 Roles Externos

#### ROL-010: Auditor Externo
**Descripción**: Auditores externos contratados por la organización. Acceso restringido y trazable.

**Responsabilidades**:
- Revisar información específica según alcance de auditoría
- Generar reportes externos

#### ROL-011: Inspector SUDEASEG
**Descripción**: Inspectores de la Superintendencia de Seguros de Venezuela. Acceso restringido y completamente trazable.

**Responsabilidades**:
- Revisar expedientes durante inspecciones
- Verificar cumplimiento normativo
- Acceder a reportes regulatorios

---

## 3. Matriz de Permisos por Rol y Módulo

### 3.1 Leyenda de Permisos

| Código | Descripción |
|--------|-------------|
| **C** | Crear (Create) |
| **R** | Leer (Read) |
| **U** | Actualizar (Update) |
| **D** | Eliminar (Delete) |
| **A** | Aprobar (Approve) |
| **X** | Sin acceso |

### 3.2 Matriz Principal de Permisos

#### Módulo 1: Gestión de Expedientes - Clientes

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | C | R | U | X | X | Solo sus expedientes |
| Área de Operaciones | X | R | X | X | X | Solo lectura |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | X | R | X | X | X | Solo lectura |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 2: Gestión de Expedientes - Intermediarios

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | C | R | U | X | X | Solo sus expedientes |
| Área de Operaciones | C | R | U | X | X | Solo sus expedientes |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | X | R | X | X | X | Solo lectura |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 3: Gestión de Expedientes - Reaseguradores

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | X | R | X | X | X | Solo lectura |
| Área de Operaciones | C | R | U | X | X | Solo sus expedientes |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | C | R | U | X | X | Solo sus expedientes |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 4: Gestión de Expedientes - Retrocesionarios

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | X | R | X | X | X | Solo lectura |
| Área de Operaciones | X | R | X | X | X | Solo lectura |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | C | R | U | X | X | Solo sus expedientes |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 5: Gestión de Expedientes - Proveedores

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | X | R | X | X | X | Solo lectura |
| Área de Operaciones | C | R | U | X | X | Solo sus expedientes |
| Área Administrativa | C | R | U | X | X | Solo sus expedientes |
| Área Técnica | X | R | X | X | X | Solo lectura |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 6: Gestión de Expedientes - Empleados

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | X | X | X | X | X | Sin acceso |
| Área de Operaciones | X | X | X | X | X | Sin acceso |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | X | X | X | X | X | Sin acceso |
| Recursos Humanos | C | R | U | X | X | Solo sus expedientes |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 7: Evaluaciones de Riesgo

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | C | R | U | X | X | Sin aprobación |
| Área Comercial | X | R | X | X | X | Solo sus expedientes |
| Área de Operaciones | X | R | X | X | X | Solo lectura |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | X | R | X | X | X | Solo lectura |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 8: Gestión de Alertas

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | X | R | U | D | A | Sistema crea alertas |
| Área de Cumplimiento | X | R | U | X | X | Investigar alertas |
| Área Comercial | X | R | X | X | X | Solo sus alertas |
| Área de Operaciones | X | R | X | X | X | Solo lectura |
| Área Administrativa | X | R | X | X | X | Solo lectura |
| Área Técnica | X | R | X | X | X | Solo lectura |
| Recursos Humanos | X | R | X | X | X | Solo lectura |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | R | X | X | X | Restringido |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 9: Parametrización del Sistema

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | A | Acceso total |
| Área de Cumplimiento | X | R | X | X | X | Solo lectura |
| Área Comercial | X | X | X | X | X | Sin acceso |
| Área de Operaciones | X | X | X | X | X | Sin acceso |
| Área Administrativa | X | X | X | X | X | Sin acceso |
| Área Técnica | X | X | X | X | X | Sin acceso |
| Recursos Humanos | X | X | X | X | X | Sin acceso |
| Auditoría | X | R | X | X | X | Solo lectura |
| Contraloría | X | R | X | X | X | Solo lectura |
| Auditor Externo | X | X | X | X | X | Sin acceso |
| Inspector SUDEASEG | X | R | X | X | X | Restringido |

#### Módulo 10: Reportes y Dashboards

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | - | Todos los reportes |
| Área de Cumplimiento | C | R | U | X | - | Reportes operativos |
| Área Comercial | X | R | X | X | - | Reportes de su área |
| Área de Operaciones | X | R | X | X | - | Reportes de su área |
| Área Administrativa | X | R | X | X | - | Reportes de su área |
| Área Técnica | X | R | X | X | - | Reportes de su área |
| Recursos Humanos | X | R | X | X | - | Reportes de su área |
| Auditoría | X | R | X | X | - | Todos los reportes |
| Contraloría | X | R | X | X | - | Todos los reportes |
| Auditor Externo | X | R | X | X | - | Restringido |
| Inspector SUDEASEG | X | R | X | X | - | Todos los reportes |

#### Módulo 11: Auditoría y Trazabilidad

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | X | R | X | X | - | Sistema registra |
| Área de Cumplimiento | X | R | X | X | - | Solo lectura |
| Área Comercial | X | R | X | X | - | Solo sus acciones |
| Área de Operaciones | X | R | X | X | - | Solo sus acciones |
| Área Administrativa | X | R | X | X | - | Solo sus acciones |
| Área Técnica | X | R | X | X | - | Solo sus acciones |
| Recursos Humanos | X | R | X | X | - | Solo sus acciones |
| Auditoría | X | R | X | X | - | Acceso total |
| Contraloría | X | R | X | X | - | Acceso total |
| Auditor Externo | X | R | X | X | - | Restringido |
| Inspector SUDEASEG | X | R | X | X | - | Acceso total |

#### Módulo 12: Gestión de Usuarios

| Rol | Crear | Leer | Modificar | Eliminar | Aprobar | Notas |
|-----|-------|------|-----------|----------|---------|-------|
| Oficial de Cumplimiento | C | R | U | D | - | Acceso total |
| Área de Cumplimiento | X | R | X | X | - | Solo lectura |
| Área Comercial | X | X | X | X | - | Sin acceso |
| Área de Operaciones | X | X | X | X | - | Sin acceso |
| Área Administrativa | X | X | X | X | - | Sin acceso |
| Área Técnica | X | X | X | X | - | Sin acceso |
| Recursos Humanos | X | X | X | X | - | Sin acceso |
| Auditoría | X | R | X | X | - | Solo lectura |
| Contraloría | X | R | X | X | - | Solo lectura |
| Auditor Externo | X | X | X | X | - | Sin acceso |
| Inspector SUDEASEG | X | R | X | X | - | Solo lectura |

---

## 4. Estados de Expedientes y Flujo de Aprobación

### 4.1 Estados del Expediente

Los expedientes en el sistema pueden tener los siguientes estados:

| Estado | Código | Descripción |
|--------|--------|-------------|
| Borrador | DRAFT | Expediente en creación, no visible para aprobación |
| Pendiente | PENDING | Expediente enviado para aprobación del Oficial |
| Aprobado | APPROVED | Expediente aprobado, activo en el sistema |
| Rechazado | REJECTED | Expediente rechazado por el Oficial |
| Modificado | MODIFIED | Expediente aprobado que ha sido modificado |
| Suspendido | SUSPENDED | Expediente suspendido temporalmente |
| Eliminado | DELETED | Expediente marcado como eliminado (soft delete) |

### 4.2 Flujo de Aprobación

```
[Área Crea Expediente] 
        ↓
    [BORRADOR]
        ↓
[Área Envía a Aprobación]
        ↓
    [PENDIENTE]
        ↓
[Oficial de Cumplimiento Revisa]
        ↓
    [APROBADO] ←→ [RECHAZADO]
        ↓               ↓
[Activo en Sistema] [Vuelve a Borrador]
        ↓
[Modificación por Área]
        ↓
    [MODIFICADO]
        ↓
    [PENDIENTE]
        ↓
[Oficial Aprueba Cambios]
        ↓
    [APROBADO]
```

### 4.3 Reglas de Transición de Estados

| Estado Actual | Acción | Rol Autorizado | Estado Resultante |
|---------------|--------|----------------|-------------------|
| DRAFT | Enviar a Aprobación | Área Creadora | PENDING |
| PENDING | Aprobar | Oficial de Cumplimiento | APPROVED |
| PENDING | Rechazar | Oficial de Cumplimiento | REJECTED |
| REJECTED | Modificar | Área Creadora | DRAFT |
| APPROVED | Modificar | Área Autorizada / Cumplimiento | MODIFIED |
| MODIFIED | Enviar a Aprobación | Área Modificadora | PENDING |
| APPROVED | Suspender | Oficial de Cumplimiento | SUSPENDED |
| SUSPENDED | Reactivar | Oficial de Cumplimiento | APPROVED |
| Cualquiera | Eliminar | Oficial de Cumplimiento | DELETED |

---

## 5. Permisos Granulares y Restricciones Especiales

### 5.1 Restricciones por Propiedad

**Regla de Propiedad de Expedientes**:
- Un usuario de área operativa solo puede modificar expedientes creados por su propia área
- Excepción: Área de Cumplimiento y Oficial pueden modificar cualquier expediente

### 5.2 Restricciones Temporales

**Acceso de Auditores Externos e Inspectores**:
- Acceso temporal con fecha de inicio y fin
- Requiere aprobación del Oficial de Cumplimiento
- Registra todas las acciones durante el período de acceso
- Acceso automáticamente revocado al vencer el período

### 5.3 Restricciones por Nivel de Riesgo

**Expedientes de Alto Riesgo**:
- Expedientes clasificados como "Alto Riesgo" requieren:
  - Notificación inmediata al Oficial de Cumplimiento
  - Revisión obligatoria dentro de 24 horas
  - Justificación documentada de aprobación o rechazo

### 5.4 Restricciones de Datos Sensibles

**Información de Empleados**:
- Datos salariales: Solo visible para RH y Oficial de Cumplimiento
- Evaluaciones disciplinarias: Solo visible para RH, Auditoría, Contraloría y Oficial
- Datos personales sensibles: Enmascarados para roles no autorizados

---

## 6. Trazabilidad y Auditoría

### 6.1 Información Registrada por Acción

Cada acción en el sistema debe registrar:

```json
{
  "auditId": "UUID único",
  "timestamp": "ISO 8601 timestamp",
  "userId": "ID del usuario",
  "username": "Nombre del usuario",
  "userRole": "Rol activo del usuario",
  "action": "CREATE|READ|UPDATE|DELETE|APPROVE|REJECT",
  "entityType": "Tipo de entidad afectada",
  "entityId": "ID de la entidad",
  "module": "Módulo del sistema",
  "ipAddress": "Dirección IP del cliente",
  "sessionId": "ID de sesión",
  "requestId": "ID de request HTTP",
  "changes": {
    "before": { "campo": "valor anterior" },
    "after": { "campo": "valor nuevo" }
  },
  "reason": "Justificación de la acción (si aplica)",
  "result": "SUCCESS|FAILURE",
  "errorMessage": "Mensaje de error si aplica"
}
```

### 6.2 Tipos de Eventos Auditables

| Código | Evento | Criticidad |
|--------|--------|------------|
| AUTH-001 | Login exitoso | NORMAL |
| AUTH-002 | Login fallido | ALTA |
| AUTH-003 | Logout | NORMAL |
| AUTH-004 | Cambio de contraseña | ALTA |
| PERM-001 | Intento de acceso denegado | ALTA |
| PERM-002 | Cambio de permisos | CRÍTICA |
| PERM-003 | Cambio de rol | CRÍTICA |
| DATA-001 | Creación de expediente | NORMAL |
| DATA-002 | Modificación de expediente | ALTA |
| DATA-003 | Eliminación de expediente | CRÍTICA |
| DATA-004 | Lectura de expediente sensible | ALTA |
| APPR-001 | Aprobación de expediente | ALTA |
| APPR-002 | Rechazo de expediente | ALTA |
| CONF-001 | Cambio de parametrización | CRÍTICA |
| CONF-002 | Cambio de criterios de riesgo | CRÍTICA |
| ALERT-001 | Generación de alerta | ALTA |
| ALERT-002 | Cierre de alerta | ALTA |
| REPT-001 | Generación de reporte | NORMAL |
| REPT-002 | Exportación de datos | ALTA |

### 6.3 Consultas de Auditoría

El sistema debe permitir consultar el log de auditoría por:

- Rango de fechas
- Usuario específico
- Rol
- Tipo de acción
- Módulo
- Entidad afectada
- Criticidad del evento
- Resultado (éxito/fallo)

### 6.4 Reportes de Auditoría Predefinidos

1. **Reporte de Accesos por Usuario**: Todas las acciones de un usuario en un período
2. **Reporte de Modificaciones de Expediente**: Historia completa de cambios de un expediente
3. **Reporte de Aprobaciones**: Todas las aprobaciones/rechazos por período
4. **Reporte de Accesos Denegados**: Intentos de acceso no autorizado
5. **Reporte de Accesos Externos**: Acciones de auditores externos e inspectores
6. **Reporte de Cambios de Configuración**: Cambios en parametrización del sistema
7. **Reporte de Actividad por Rol**: Consolidado de acciones por cada rol

---

## 7. Implementación Técnica en Java

### 7.1 Estructura de Entidades JPA

#### Role.java
```java
package com.siar.security.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String code; // ROL-001, ROL-002, etc.
    
    @Column(nullable = false, length = 100)
    private String name; // Oficial de Cumplimiento, Área Comercial, etc.
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private Boolean isExternal = false; // Para auditores externos e inspectores
    
    @Column(nullable = false)
    private Integer hierarchyLevel; // Nivel jerárquico (1=más alto)
    
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private Set<Permission> permissions = new HashSet<>();
    
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private String createdBy;
    
    @Column(nullable = false)
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### Permission.java
```java
package com.siar.security.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "permissions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"role_id", "module_code", "action"}))
@Data
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    @Column(nullable = false, length = 50)
    private String moduleCode; // CLIENTES, INTERMEDIARIOS, REASEGURADORES, etc.
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PermissionAction action; // CREATE, READ, UPDATE, DELETE, APPROVE
    
    @Column(nullable = false)
    private Boolean allowed = true;
    
    @Column(length = 500)
    private String condition; // Condiciones adicionales (ej: "solo propios")
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private String createdBy;
    
    @Column(nullable = false)
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### PermissionAction.java
```java
package com.siar.security.model;

public enum PermissionAction {
    CREATE,   // Crear nuevos registros
    READ,     // Leer/consultar registros
    UPDATE,   // Modificar registros existentes
    DELETE,   // Eliminar registros
    APPROVE,  // Aprobar registros pendientes
    EXPORT,   // Exportar datos
    CONFIG    // Configurar parámetros del módulo
}
```

#### User.java
```java
package com.siar.security.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false)
    private String password; // Bcrypt hash
    
    @Column(nullable = false, length = 200)
    private String fullName;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(length = 20)
    private String phoneNumber;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private Boolean locked = false;
    
    @Column
    private Integer failedLoginAttempts = 0;
    
    @Column
    private LocalDateTime lastLoginAt;
    
    @Column
    private LocalDateTime lastPasswordChangeAt;
    
    @Column
    private LocalDateTime accountExpiresAt; // Para usuarios externos
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private String createdBy;
    
    @Column(nullable = false)
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastPasswordChangeAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### AuditLog.java
```java
package com.siar.security.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user", columnList = "userId"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity", columnList = "entityType,entityId"),
    @Index(name = "idx_audit_criticality", columnList = "criticality")
})
@Data
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 36)
    private String auditId; // UUID
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 100)
    private String username;
    
    @Column(nullable = false, length = 100)
    private String userRole;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuditAction action;
    
    @Column(nullable = false, length = 50)
    private String entityType;
    
    @Column(length = 50)
    private String entityId;
    
    @Column(nullable = false, length = 50)
    private String module;
    
    @Column(nullable = false, length = 45)
    private String ipAddress;
    
    @Column(length = 100)
    private String sessionId;
    
    @Column(length = 100)
    private String requestId;
    
    @Column(columnDefinition = "TEXT")
    private String changesBefore; // JSON
    
    @Column(columnDefinition = "TEXT")
    private String changesAfter; // JSON
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuditResult result;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuditCriticality criticality;
    
    @Column(nullable = false)
    private Boolean requiresReview = false;
    
    @Column
    private LocalDateTime reviewedAt;
    
    @Column(length = 100)
    private String reviewedBy;
}
```

#### AuditAction.java
```java
package com.siar.security.model;

public enum AuditAction {
    LOGIN,
    LOGOUT,
    CREATE,
    READ,
    UPDATE,
    DELETE,
    APPROVE,
    REJECT,
    EXPORT,
    CONFIG_CHANGE,
    PERMISSION_CHANGE,
    ROLE_CHANGE,
    ACCESS_DENIED
}
```

#### AuditResult.java
```java
package com.siar.security.model;

public enum AuditResult {
    SUCCESS,
    FAILURE,
    PARTIAL
}
```

#### AuditCriticality.java
```java
package com.siar.security.model;

public enum AuditCriticality {
    NORMAL,   // Operaciones rutinarias
    ALTA,     // Operaciones sensibles
    CRÍTICA   // Operaciones que requieren revisión inmediata
}
```

### 7.2 Anotaciones Personalizadas para Seguridad

#### @RequirePermission
```java
package com.siar.security.annotation;

import com.siar.security.model.PermissionAction;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String module();
    PermissionAction action();
    boolean requireApproval() default false;
    String condition() default "";
}
```

#### @Auditable
```java
package com.siar.security.annotation;

import com.siar.security.model.AuditAction;
import com.siar.security.model.AuditCriticality;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    AuditAction action();
    String module();
    AuditCriticality criticality() default AuditCriticality.NORMAL;
    boolean captureChanges() default true;
    String entityType() default "";
}
```

### 7.3 Servicio de Autorización

#### AuthorizationService.java
```java
package com.siar.security.service;

import com.siar.security.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {
    
    private final PermissionRepository permissionRepository;
    private final AuditService auditService;
    
    /**
     * Verifica si un usuario tiene permiso para realizar una acción en un módulo
     */
    public boolean hasPermission(User user, String moduleCode, PermissionAction action) {
        // Verificar cuenta activa
        if (!user.getActive() || user.getLocked()) {
            log.warn("Usuario inactivo o bloqueado intentó acceder: {}", user.getUsername());
            auditService.logAccessDenied(user, moduleCode, action, "Usuario inactivo o bloqueado");
            return false;
        }
        
        // Verificar expiración de cuenta (usuarios externos)
        if (user.getAccountExpiresAt() != null && 
            user.getAccountExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            log.warn("Usuario con cuenta expirada intentó acceder: {}", user.getUsername());
            auditService.logAccessDenied(user, moduleCode, action, "Cuenta expirada");
            return false;
        }
        
        // Verificar permisos por cada rol del usuario
        for (Role role : user.getRoles()) {
            if (!role.getActive()) continue;
            
            Optional<Permission> permission = permissionRepository
                .findByRoleAndModuleCodeAndAction(role, moduleCode, action);
            
            if (permission.isPresent() && permission.get().getAllowed()) {
                log.debug("Permiso concedido: usuario={}, módulo={}, acción={}, rol={}", 
                    user.getUsername(), moduleCode, action, role.getName());
                return true;
            }
        }
        
        log.warn("Permiso denegado: usuario={}, módulo={}, acción={}", 
            user.getUsername(), moduleCode, action);
        auditService.logAccessDenied(user, moduleCode, action, "Sin permisos");
        return false;
    }
    
    /**
     * Verifica si un usuario puede aprobar en un módulo
     */
    public boolean canApprove(User user, String moduleCode) {
        return hasPermission(user, moduleCode, PermissionAction.APPROVE);
    }
    
    /**
     * Verifica si un usuario es Oficial de Cumplimiento
     */
    public boolean isComplianceOfficer(User user) {
        return user.getRoles().stream()
            .anyMatch(role -> "ROL-001".equals(role.getCode()) && role.getActive());
    }
    
    /**
     * Verifica si un usuario pertenece al Área de Cumplimiento
     */
    public boolean isComplianceArea(User user) {
        return user.getRoles().stream()
            .anyMatch(role -> 
                ("ROL-001".equals(role.getCode()) || "ROL-002".equals(role.getCode())) 
                && role.getActive());
    }
    
    /**
     * Verifica si un usuario es externo (auditor o inspector)
     */
    public boolean isExternalUser(User user) {
        return user.getRoles().stream()
            .anyMatch(role -> role.getIsExternal() && role.getActive());
    }
    
    /**
     * Verifica si un usuario puede modificar un expediente específico
     */
    public boolean canModifyRecord(User user, String moduleCode, String recordOwnerId) {
        // Oficial de Cumplimiento y Área de Cumplimiento pueden modificar cualquier expediente
        if (isComplianceArea(user)) {
            return true;
        }
        
        // Verificar permiso general de modificación
        if (!hasPermission(user, moduleCode, PermissionAction.UPDATE)) {
            return false;
        }
        
        // Verificar propiedad del expediente
        // Un usuario solo puede modificar expedientes creados por su área
        // Esta lógica debe implementarse según la regla de negocio específica
        
        return true; // Simplificado para el ejemplo
    }
    
    /**
     * Obtiene todos los permisos de un usuario
     */
    public List<Permission> getUserPermissions(User user) {
        return user.getRoles().stream()
            .filter(Role::getActive)
            .flatMap(role -> role.getPermissions().stream())
            .filter(Permission::getActive)
            .toList();
    }
}
```

### 7.4 Servicio de Auditoría

#### AuditService.java
```java
package com.siar.security.service;

import com.siar.security.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;
    
    /**
     * Registra una acción de auditoría
     * Usa REQUIRES_NEW para asegurar que el log se guarda incluso si la transacción principal falla
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(
            User user,
            AuditAction action,
            String module,
            String entityType,
            String entityId,
            Object changesBefore,
            Object changesAfter,
            AuditResult result,
            AuditCriticality criticality,
            String reason) {
        
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAuditId(UUID.randomUUID().toString());
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setUserId(user.getId());
            auditLog.setUsername(user.getUsername());
            auditLog.setUserRole(user.getRoles().stream()
                .map(Role::getName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Sin rol"));
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setModule(module);
            auditLog.setIpAddress(getClientIpAddress());
            auditLog.setSessionId(request.getSession().getId());
            auditLog.setRequestId(request.getHeader("X-Request-ID"));
            
            if (changesBefore != null) {
                auditLog.setChangesBefore(objectMapper.writeValueAsString(changesBefore));
            }
            if (changesAfter != null) {
                auditLog.setChangesAfter(objectMapper.writeValueAsString(changesAfter));
            }
            
            auditLog.setReason(reason);
            auditLog.setResult(result);
            auditLog.setCriticality(criticality);
            
            // Marcar para revisión si es crítico
            if (criticality == AuditCriticality.CRÍTICA) {
                auditLog.setRequiresReview(true);
            }
            
            auditLogRepository.save(auditLog);
            
            log.info("Auditoría registrada: usuario={}, acción={}, módulo={}, resultado={}", 
                user.getUsername(), action, module, result);
                
        } catch (Exception e) {
            log.error("Error al registrar auditoría", e);
            // No lanzar excepción para no afectar la operación principal
        }
    }
    
    /**
     * Registra un acceso denegado
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAccessDenied(User user, String module, PermissionAction action, String reason) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAuditId(UUID.randomUUID().toString());
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setUserId(user.getId());
            auditLog.setUsername(user.getUsername());
            auditLog.setUserRole(user.getRoles().stream()
                .map(Role::getName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Sin rol"));
            auditLog.setAction(AuditAction.ACCESS_DENIED);
            auditLog.setEntityType("PERMISSION");
            auditLog.setEntityId(module + ":" + action);
            auditLog.setModule(module);
            auditLog.setIpAddress(getClientIpAddress());
            auditLog.setSessionId(request.getSession().getId());
            auditLog.setReason(reason);
            auditLog.setResult(AuditResult.FAILURE);
            auditLog.setCriticality(AuditCriticality.ALTA);
            auditLog.setRequiresReview(true);
            
            auditLogRepository.save(auditLog);
            
            log.warn("Acceso denegado registrado: usuario={}, módulo={}, acción={}, razón={}", 
                user.getUsername(), module, action, reason);
                
        } catch (Exception e) {
            log.error("Error al registrar acceso denegado", e);
        }
    }
    
    /**
     * Obtiene la dirección IP del cliente
     */
    private String getClientIpAddress() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
}
```

### 7.5 Aspecto de Autorización (AOP)

#### PermissionAspect.java
```java
package com.siar.security.aspect;

import com.siar.security.annotation.RequirePermission;
import com.siar.security.model.*;
import com.siar.security.service.AuthorizationService;
import com.siar.security.service.AuditService;
import com.siar.security.exception.InsufficientPermissionException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionAspect {
    
    private final AuthorizationService authorizationService;
    private final AuditService auditService;
    
    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) 
            throws Throwable {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new InsufficientPermissionException("Usuario no autenticado");
        }
        
        User user = (User) authentication.getPrincipal();
        String module = requirePermission.module();
        PermissionAction action = requirePermission.action();
        
        // Verificar permiso
        if (!authorizationService.hasPermission(user, module, action)) {
            log.warn("Acceso denegado: usuario={}, módulo={}, acción={}", 
                user.getUsername(), module, action);
            throw new InsufficientPermissionException(
                String.format("Usuario %s no tiene permiso para %s en módulo %s", 
                    user.getUsername(), action, module));
        }
        
        // Ejecutar método
        return joinPoint.proceed();
    }
}
```

#### AuditableAspect.java
```java
package com.siar.security.aspect;

import com.siar.security.annotation.Auditable;
import com.siar.security.model.*;
import com.siar.security.service.AuditService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditableAspect {
    
    private final AuditService auditService;
    
    @Around("@annotation(auditable)")
    public Object auditAction(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        Object changesBefore = null;
        Object changesAfter = null;
        AuditResult result = AuditResult.SUCCESS;
        String errorMessage = null;
        String entityId = null;
        
        try {
            // Capturar estado antes (si es necesario)
            if (auditable.captureChanges()) {
                changesBefore = extractEntityFromArgs(joinPoint.getArgs());
            }
            
            // Ejecutar método
            Object resultObject = joinPoint.proceed();
            
            // Capturar estado después
            if (auditable.captureChanges()) {
                changesAfter = resultObject != null ? resultObject : extractEntityFromArgs(joinPoint.getArgs());
            }
            
            // Extraer ID de entidad
            entityId = extractEntityId(changesAfter);
            
            return resultObject;
            
        } catch (Exception e) {
            result = AuditResult.FAILURE;
            errorMessage = e.getMessage();
            throw e;
            
        } finally {
            // Registrar auditoría
            auditService.logAction(
                user,
                auditable.action(),
                auditable.module(),
                auditable.entityType(),
                entityId,
                changesBefore,
                changesAfter,
                result,
                auditable.criticality(),
                errorMessage
            );
        }
    }
    
    private Object extractEntityFromArgs(Object[] args) {
        // Buscar el primer argumento que no sea un tipo primitivo
        for (Object arg : args) {
            if (arg != null && !arg.getClass().isPrimitive() && !arg.getClass().getName().startsWith("java.lang")) {
                return arg;
            }
        }
        return null;
    }
    
    private String extractEntityId(Object entity) {
        if (entity == null) return null;
        
        try {
            // Intentar obtener ID por reflexión
            var idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object id = idField.get(entity);
            return id != null ? id.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
```

### 7.6 Ejemplo de Uso en Controlador

#### ClienteController.java
```java
package com.siar.expedientes.controller;

import com.siar.expedientes.model.Cliente;
import com.siar.expedientes.service.ClienteService;
import com.siar.security.annotation.RequirePermission;
import com.siar.security.annotation.Auditable;
import com.siar.security.model.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {
    
    private final ClienteService clienteService;
    
    @GetMapping
    @RequirePermission(module = "CLIENTES", action = PermissionAction.READ)
    @Auditable(action = AuditAction.READ, module = "CLIENTES", 
               entityType = "Cliente", criticality = AuditCriticality.NORMAL)
    public ResponseEntity<List<Cliente>> listarClientes() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }
    
    @PostMapping
    @RequirePermission(module = "CLIENTES", action = PermissionAction.CREATE)
    @Auditable(action = AuditAction.CREATE, module = "CLIENTES", 
               entityType = "Cliente", criticality = AuditCriticality.ALTA)
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        Cliente nuevoCliente = clienteService.crear(cliente);
        return ResponseEntity.ok(nuevoCliente);
    }
    
    @PutMapping("/{id}")
    @RequirePermission(module = "CLIENTES", action = PermissionAction.UPDATE)
    @Auditable(action = AuditAction.UPDATE, module = "CLIENTES", 
               entityType = "Cliente", criticality = AuditCriticality.ALTA, 
               captureChanges = true)
    public ResponseEntity<Cliente> actualizarCliente(
            @PathVariable Long id, 
            @RequestBody Cliente cliente) {
        Cliente clienteActualizado = clienteService.actualizar(id, cliente);
        return ResponseEntity.ok(clienteActualizado);
    }
    
    @DeleteMapping("/{id}")
    @RequirePermission(module = "CLIENTES", action = PermissionAction.DELETE)
    @Auditable(action = AuditAction.DELETE, module = "CLIENTES", 
               entityType = "Cliente", criticality = AuditCriticality.CRÍTICA)
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/aprobar")
    @RequirePermission(module = "CLIENTES", action = PermissionAction.APPROVE)
    @Auditable(action = AuditAction.APPROVE, module = "CLIENTES", 
               entityType = "Cliente", criticality = AuditCriticality.CRÍTICA)
    public ResponseEntity<Cliente> aprobarCliente(
            @PathVariable Long id, 
            @RequestParam String comentario) {
        Cliente clienteAprobado = clienteService.aprobar(id, comentario);
        return ResponseEntity.ok(clienteAprobado);
    }
}
```

---

## 8. Esquema de Base de Datos

### 8.1 Script DDL Principal

```sql
-- Tabla de Roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_external BOOLEAN NOT NULL DEFAULT FALSE,
    hierarchy_level INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    INDEX idx_role_code (code),
    INDEX idx_role_active (active)
);

-- Tabla de Permisos
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    condition_rule VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_role_module_action (role_id, module_code, action),
    INDEX idx_permission_role (role_id),
    INDEX idx_permission_module (module_code)
);

-- Tabla de Usuarios
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    last_login_at TIMESTAMP NULL,
    last_password_change_at TIMESTAMP NOT NULL,
    account_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_active (active)
);

-- Tabla de Relación Usuario-Rol (Muchos a Muchos)
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_role_user (user_id),
    INDEX idx_user_role_role (role_id)
);

-- Tabla de Logs de Auditoría
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    audit_id VARCHAR(36) UNIQUE NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    module VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    changes_before TEXT,
    changes_after TEXT,
    reason TEXT,
    result VARCHAR(20) NOT NULL,
    error_message TEXT,
    criticality VARCHAR(20) NOT NULL,
    requires_review BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(100),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_username (username),
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_module (module),
    INDEX idx_audit_criticality (criticality),
    INDEX idx_audit_review (requires_review, reviewed_at)
);

-- Tabla de Sesiones (opcional, para tracking adicional)
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),
    login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_user (user_id),
    INDEX idx_session_active (active),
    INDEX idx_session_last_activity (last_activity_at)
);
```

### 8.2 Script de Datos Iniciales

```sql
-- Insertar Roles Obligatorios
INSERT INTO roles (code, name, description, is_external, hierarchy_level, created_by, updated_by) VALUES
('ROL-001', 'Oficial de Cumplimiento', 'Máxima autoridad en materia de cumplimiento', FALSE, 1, 'SYSTEM', 'SYSTEM'),
('ROL-002', 'Área de Cumplimiento', 'Equipo operativo del área de cumplimiento', FALSE, 2, 'SYSTEM', 'SYSTEM'),
('ROL-003', 'Área Comercial', 'Área de ventas y captación de clientes', FALSE, 3, 'SYSTEM', 'SYSTEM'),
('ROL-004', 'Área de Operaciones', 'Área de operaciones diarias', FALSE, 3, 'SYSTEM', 'SYSTEM'),
('ROL-005', 'Área Administrativa', 'Área administrativa', FALSE, 3, 'SYSTEM', 'SYSTEM'),
('ROL-006', 'Área Técnica', 'Área técnica de reaseguros', FALSE, 3, 'SYSTEM', 'SYSTEM'),
('ROL-007', 'Recursos Humanos', 'Gestión de talento humano', FALSE, 3, 'SYSTEM', 'SYSTEM'),
('ROL-008', 'Auditoría', 'Auditoría interna', FALSE, 2, 'SYSTEM', 'SYSTEM'),
('ROL-009', 'Contraloría', 'Contraloría interna', FALSE, 2, 'SYSTEM', 'SYSTEM'),
('ROL-010', 'Auditor Externo', 'Auditor externo contratado', TRUE, 4, 'SYSTEM', 'SYSTEM'),
('ROL-011', 'Inspector SUDEASEG', 'Inspector de Superintendencia', TRUE, 1, 'SYSTEM', 'SYSTEM');

-- Permisos para Oficial de Cumplimiento (Acceso Total)
INSERT INTO permissions (role_id, module_code, action, allowed, created_by, updated_by)
SELECT r.id, m.module_code, a.action, TRUE, 'SYSTEM', 'SYSTEM'
FROM roles r
CROSS JOIN (
    SELECT 'CLIENTES' AS module_code UNION ALL
    SELECT 'INTERMEDIARIOS' UNION ALL
    SELECT 'REASEGURADORES' UNION ALL
    SELECT 'RETROCESIONARIOS' UNION ALL
    SELECT 'PROVEEDORES' UNION ALL
    SELECT 'EMPLEADOS' UNION ALL
    SELECT 'EVALUACIONES' UNION ALL
    SELECT 'ALERTAS' UNION ALL
    SELECT 'PARAMETRIZACION' UNION ALL
    SELECT 'REPORTES' UNION ALL
    SELECT 'AUDITORIA' UNION ALL
    SELECT 'USUARIOS'
) m
CROSS JOIN (
    SELECT 'CREATE' AS action UNION ALL
    SELECT 'READ' UNION ALL
    SELECT 'UPDATE' UNION ALL
    SELECT 'DELETE' UNION ALL
    SELECT 'APPROVE'
) a
WHERE r.code = 'ROL-001';

-- Permisos para Área de Cumplimiento (Sin aprobación)
INSERT INTO permissions (role_id, module_code, action, allowed, created_by, updated_by)
SELECT r.id, m.module_code, a.action, TRUE, 'SYSTEM', 'SYSTEM'
FROM roles r
CROSS JOIN (
    SELECT 'CLIENTES' AS module_code UNION ALL
    SELECT 'INTERMEDIARIOS' UNION ALL
    SELECT 'REASEGURADORES' UNION ALL
    SELECT 'RETROCESIONARIOS' UNION ALL
    SELECT 'PROVEEDORES' UNION ALL
    SELECT 'EMPLEADOS' UNION ALL
    SELECT 'EVALUACIONES' UNION ALL
    SELECT 'ALERTAS' UNION ALL
    SELECT 'REPORTES' UNION ALL
    SELECT 'AUDITORIA'
) m
CROSS JOIN (
    SELECT 'CREATE' AS action UNION ALL
    SELECT 'READ' UNION ALL
    SELECT 'UPDATE'
) a
WHERE r.code = 'ROL-002';

-- Permisos para Área Comercial
INSERT INTO permissions (role_id, module_code, action, allowed, created_by, updated_by) VALUES
((SELECT id FROM roles WHERE code = 'ROL-003'), 'CLIENTES', 'CREATE', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'CLIENTES', 'READ', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'CLIENTES', 'UPDATE', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'INTERMEDIARIOS', 'CREATE', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'INTERMEDIARIOS', 'READ', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'INTERMEDIARIOS', 'UPDATE', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'EVALUACIONES', 'READ', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'ALERTAS', 'READ', TRUE, 'SYSTEM', 'SYSTEM'),
((SELECT id FROM roles WHERE code = 'ROL-003'), 'REPORTES', 'READ', TRUE, 'SYSTEM', 'SYSTEM');

-- Continuar con permisos para los demás roles según la matriz definida...
-- (Similar para ROL-004 a ROL-011)

-- Usuario Inicial: Oficial de Cumplimiento
-- Contraseña: Admin123! (debe cambiarse en primer uso)
INSERT INTO users (username, password, full_name, email, created_by, updated_by) VALUES
('oficial.cumplimiento', '$2a$10$...', 'Oficial de Cumplimiento', 'oficial@empresa.com', 'SYSTEM', 'SYSTEM');

-- Asignar rol al usuario
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
((SELECT id FROM users WHERE username = 'oficial.cumplimiento'), 
 (SELECT id FROM roles WHERE code = 'ROL-001'), 
 'SYSTEM');
```

### 8.3 Trigger de Auditoría Automática

```sql
-- Trigger para auditar cambios en la tabla de permisos
DELIMITER $$

CREATE TRIGGER trg_permissions_audit_insert
AFTER INSERT ON permissions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        audit_id, 
        timestamp, 
        user_id, 
        username, 
        user_role, 
        action, 
        entity_type, 
        entity_id, 
        module, 
        ip_address,
        changes_after,
        result,
        criticality,
        requires_review
    ) VALUES (
        UUID(),
        NOW(),
        0, -- Usuario SYSTEM
        NEW.created_by,
        'SYSTEM',
        'CREATE',
        'Permission',
        NEW.id,
        'PARAMETRIZACION',
        '127.0.0.1',
        JSON_OBJECT('role_id', NEW.role_id, 'module_code', NEW.module_code, 'action', NEW.action),
        'SUCCESS',
        'CRÍTICA',
        TRUE
    );
END$$

CREATE TRIGGER trg_permissions_audit_update
AFTER UPDATE ON permissions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        audit_id, 
        timestamp, 
        user_id, 
        username, 
        user_role, 
        action, 
        entity_type, 
        entity_id, 
        module, 
        ip_address,
        changes_before,
        changes_after,
        result,
        criticality,
        requires_review
    ) VALUES (
        UUID(),
        NOW(),
        0,
        NEW.updated_by,
        'SYSTEM',
        'UPDATE',
        'Permission',
        NEW.id,
        'PARAMETRIZACION',
        '127.0.0.1',
        JSON_OBJECT('allowed', OLD.allowed, 'active', OLD.active),
        JSON_OBJECT('allowed', NEW.allowed, 'active', NEW.active),
        'SUCCESS',
        'CRÍTICA',
        TRUE
    );
END$$

DELIMITER ;
```

---

## 9. API REST Endpoints de Gestión RBAC

### 9.1 Gestión de Roles

```
GET /api/rbac/roles
- Listar todos los roles
- Requiere: Permiso de lectura en USUARIOS
- Retorna: Lista de roles con sus permisos

GET /api/rbac/roles/{id}
- Obtener detalle de un rol
- Requiere: Permiso de lectura en USUARIOS
- Retorna: Rol con permisos asociados

POST /api/rbac/roles
- Crear un nuevo rol personalizado
- Requiere: Oficial de Cumplimiento
- Body: { "code": "ROL-012", "name": "...", "description": "..." }

PUT /api/rbac/roles/{id}
- Actualizar un rol
- Requiere: Oficial de Cumplimiento
- Body: { "name": "...", "description": "...", "active": true }

DELETE /api/rbac/roles/{id}
- Desactivar un rol (soft delete)
- Requiere: Oficial de Cumplimiento
```

### 9.2 Gestión de Permisos

```
GET /api/rbac/permissions?roleId={id}
- Listar permisos de un rol
- Requiere: Área de Cumplimiento

POST /api/rbac/permissions
- Asignar nuevo permiso a un rol
- Requiere: Oficial de Cumplimiento
- Body: { 
    "roleId": 1, 
    "moduleCode": "CLIENTES", 
    "action": "CREATE", 
    "allowed": true 
  }

PUT /api/rbac/permissions/{id}
- Modificar un permiso
- Requiere: Oficial de Cumplimiento
- Body: { "allowed": false, "condition": "..." }

DELETE /api/rbac/permissions/{id}
- Eliminar un permiso
- Requiere: Oficial de Cumplimiento
```

### 9.3 Gestión de Usuarios

```
GET /api/rbac/users
- Listar usuarios
- Requiere: Área de Cumplimiento
- Query params: ?active=true&roleId=1

GET /api/rbac/users/{id}
- Obtener detalle de usuario
- Requiere: Área de Cumplimiento

POST /api/rbac/users
- Crear nuevo usuario
- Requiere: Oficial de Cumplimiento
- Body: {
    "username": "...",
    "password": "...",
    "fullName": "...",
    "email": "...",
    "roleIds": [1, 2]
  }

PUT /api/rbac/users/{id}
- Actualizar usuario
- Requiere: Oficial de Cumplimiento
- Body: { "fullName": "...", "email": "..." }

POST /api/rbac/users/{id}/roles
- Asignar roles a usuario
- Requiere: Oficial de Cumplimiento
- Body: { "roleIds": [1, 2] }

DELETE /api/rbac/users/{id}/roles/{roleId}
- Remover rol de usuario
- Requiere: Oficial de Cumplimiento

POST /api/rbac/users/{id}/lock
- Bloquear usuario
- Requiere: Oficial de Cumplimiento

POST /api/rbac/users/{id}/unlock
- Desbloquear usuario
- Requiere: Oficial de Cumplimiento
```

### 9.4 Consultas de Auditoría

```
GET /api/rbac/audit/logs
- Consultar logs de auditoría
- Requiere: Auditoría, Contraloría, o Oficial de Cumplimiento
- Query params: 
  ?startDate=...&endDate=...
  &userId=...
  &action=...
  &module=...
  &criticality=...
  &requiresReview=true

GET /api/rbac/audit/logs/{auditId}
- Obtener detalle de un log específico
- Requiere: Auditoría, Contraloría, o Oficial de Cumplimiento

GET /api/rbac/audit/user/{userId}
- Obtener historial de acciones de un usuario
- Requiere: Auditoría, Contraloría, o Oficial de Cumplimiento

GET /api/rbac/audit/entity/{entityType}/{entityId}
- Obtener historial de cambios de una entidad
- Requiere: Auditoría, Contraloría, o Oficial de Cumplimiento

POST /api/rbac/audit/logs/{auditId}/review
- Marcar log como revisado
- Requiere: Auditoría o Oficial de Cumplimiento
- Body: { "reviewNotes": "..." }

GET /api/rbac/audit/reports/access-denied
- Reporte de accesos denegados
- Requiere: Oficial de Cumplimiento

GET /api/rbac/audit/reports/critical-actions
- Reporte de acciones críticas
- Requiere: Oficial de Cumplimiento

GET /api/rbac/audit/reports/external-access
- Reporte de accesos externos (auditores e inspectores)
- Requiere: Oficial de Cumplimiento
```

---

## 10. Configuración y Parametrización sin Código

### 10.1 Arquitectura de Parametrización

El sistema implementa parametrización a través de:

1. **Base de Datos**: Permisos almacenados en tablas
2. **API de Configuración**: Endpoints para modificar permisos sin código
3. **Cache**: Spring Cache para optimizar consultas de permisos
4. **Validación**: Reglas de negocio que validan cambios de permisos

### 10.2 Proceso de Cambio de Permisos

```
[Oficial de Cumplimiento] 
        ↓
[Interfaz de Administración]
        ↓
[API POST /api/rbac/permissions]
        ↓
[Validación de Reglas de Negocio]
        ↓
[Actualización en Base de Datos]
        ↓
[Invalidación de Cache]
        ↓
[Registro en Auditoría]
        ↓
[Notificación a Usuarios Afectados]
        ↓
[Permisos Actualizados en Tiempo Real]
```

### 10.3 Ejemplo de Configuración JSON

Los permisos pueden exportarse/importarse en formato JSON:

```json
{
  "role": {
    "code": "ROL-003",
    "name": "Área Comercial",
    "permissions": [
      {
        "module": "CLIENTES",
        "actions": {
          "CREATE": true,
          "READ": true,
          "UPDATE": true,
          "DELETE": false,
          "APPROVE": false
        }
      },
      {
        "module": "INTERMEDIARIOS",
        "actions": {
          "CREATE": true,
          "READ": true,
          "UPDATE": true,
          "DELETE": false,
          "APPROVE": false
        }
      }
    ]
  }
}
```

---

## 11. Seguridad Adicional

### 11.1 Políticas de Contraseñas

- Mínimo 8 caracteres
- Al menos una mayúscula, una minúscula, un número y un símbolo
- No puede contener el nombre de usuario
- Caducidad cada 90 días
- No reutilizar las últimas 5 contraseñas

### 11.2 Bloqueo de Cuenta

- Bloqueo automático después de 5 intentos fallidos de login
- Desbloqueo manual por Oficial de Cumplimiento
- Notificación al usuario y al Oficial de Cumplimiento

### 11.3 Sesiones

- Timeout de sesión: 30 minutos de inactividad
- Sesión única por usuario (cierra sesiones anteriores)
- Registro de todas las sesiones en audit_logs

### 11.4 Acceso Externo

- Auditores externos e inspectores tienen acceso temporal
- Fecha de expiración obligatoria
- Revocación automática al vencer
- Trazabilidad completa de todas sus acciones

---

## 12. Cumplimiento Regulatorio

### 12.1 Requisitos de SUDEASEG

El modelo RBAC cumple con:

- Segregación de funciones (creación vs aprobación)
- Trazabilidad completa de todas las acciones
- Acceso de inspectores con registro detallado
- Reportes de auditoría disponibles en todo momento
- Parametrización sin intervención técnica
- Evidencia de controles internos

### 12.2 Reportes Regulatorios

El sistema genera automáticamente:

1. Reporte mensual de cambios de permisos
2. Reporte trimestral de accesos externos
3. Reporte anual de auditoría de cumplimiento
4. Reporte ad-hoc por solicitud del regulador

---

## 13. Mantenimiento y Monitoreo

### 13.1 Revisión Periódica

- Revisión mensual de permisos por el Oficial de Cumplimiento
- Revisión trimestral de logs de acceso denegado
- Revisión anual de toda la matriz de permisos

### 13.2 Alertas Automáticas

El sistema genera alertas cuando:

- Hay múltiples intentos de acceso denegado del mismo usuario
- Se detectan acciones críticas fuera de horario laboral
- Usuarios externos exceden su período de acceso
- Se modifican permisos del Oficial de Cumplimiento

---

## 14. Diagrama de Arquitectura RBAC

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                    │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Interfaz Web   │  │ API REST        │  │ Admin RBAC      │ │
│  │ (React/Angular)│  │ (JSON)          │  │ Panel           │ │
│  └────────────────┘  └─────────────────┘  └─────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                      CAPA DE SEGURIDAD                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Spring Security Filter Chain                  │ │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐ │ │
│  │  │ JWT Filter   │→ │ Authorization   │→ │ Audit        │ │ │
│  │  │              │  │ Filter          │  │ Filter       │ │ │
│  │  └──────────────┘  └─────────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                      CAPA DE SERVICIOS                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │ Authorization   │  │ Audit            │  │ User           ││
│  │ Service         │  │ Service          │  │ Service        ││
│  └─────────────────┘  └──────────────────┘  └────────────────┘│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  AOP Aspects                             │  │
│  │  @RequirePermission  |  @Auditable  |  @Transactional   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │ Role            │  │ Permission       │  │ AuditLog       ││
│  │ Repository      │  │ Repository       │  │ Repository     ││
│  └─────────────────┘  └──────────────────┘  └────────────────┘│
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                       CAPA DE DATOS                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  MySQL Database                             ││
│  │  Roles | Permissions | Users | AuditLogs | Sessions        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. Conclusiones

Este modelo RBAC proporciona:

✅ **Segregación Total**: Separación estricta entre creación y aprobación
✅ **Trazabilidad Completa**: Registro inmutable de todas las acciones
✅ **Parametrización**: Cambios de permisos sin modificar código
✅ **Auditoría Continua**: Preparado para inspección regulatoria
✅ **Escalabilidad**: Arquitectura preparada para crecimiento
✅ **Seguridad**: Múltiples capas de protección
✅ **Cumplimiento**: Alineado con normativas de SUDEASEG

El sistema está diseñado para operar en un entorno de alto riesgo regulatorio, garantizando que todas las operaciones sean transparentes, trazables y auditables en todo momento.
