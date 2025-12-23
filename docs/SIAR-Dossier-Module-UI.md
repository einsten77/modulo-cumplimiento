# Documentación: Módulo de Gestión de Expedientes - UI/UX

## 1. Arquitectura de Pantallas

### Pantalla 1: Listado de Expedientes (`/dossiers`)

**Objetivo**: Vista consolidada de todos los expedientes con capacidad de filtrado, búsqueda y navegación.

**Componentes Principales**:
- **Summary Cards**: 4 métricas clave (Total, En Revisión, Incompletos, Alto Riesgo)
- **Filtros Avanzados**: Por tipo, riesgo, estado y búsqueda libre
- **Tabla Dinámica**: Con columnas configurables y acciones contextuales
- **Indicadores Visuales**: Barras de progreso de completitud, badges de estado y riesgo

**Características de Seguridad**:
- Filtrado por rol RBAC automático (usuarios solo ven expedientes autorizados)
- Auditoría de cada consulta realizada
- Solo lectura para roles AUDITOR e INSPECTOR

**Flujo de Navegación**:
```
Listado → Click en ID → Detalle del Expediente
Listado → Click "Nuevo Expediente" → Creación
```

---

### Pantalla 2: Creación de Expediente (`/dossiers/new`)

**Objetivo**: Formulario guiado para creación de expedientes con validación según tipo de sujeto.

**Paso 1: Selección de Tipo**
- Cards visuales con iconos descriptivos
- Filtrado automático según rol (ej: COMMERCIAL solo ve Cliente/Intermediario)
- Descripción clara de cada tipo de expediente

**Paso 2: Formulario por Tabs**
- **Tab Identificación**: Campos básicos (nombre, documento, RIF)
- **Tab Contacto**: Email, teléfono, dirección
- **Tab Información Económica**: Actividad, ingresos, origen de fondos
- **Tab Documentos**: Placeholder para carga posterior

**Características de Validación**:
- Cálculo dinámico de completitud en tiempo real
- Indicador visual de porcentaje (colores según threshold: <51% rojo, 51-75% ámbar, >76% verde)
- Campos obligatorios marcados con asterisco rojo

**Acciones Disponibles**:
1. **Guardar Borrador**: Permite guardar con cualquier completitud (estado: INCOMPLETE)
2. **Enviar a Cumplimiento**: Requiere ≥76% completitud (cambia estado a: UNDER_REVIEW)

**Reglas de Negocio**:
- Todo expediente nuevo inicia en estado INCOMPLETE
- La creación queda registrada en auditoría con usuario, fecha y hora
- El expediente se asocia automáticamente al creador

---

### Pantalla 3: Detalle y Aprobación (`/dossiers/[id]`)

**Objetivo**: Vista completa del expediente con capacidades de revisión, edición y aprobación.

**Sección Superior: Header**
- ID del expediente, nombre del sujeto
- Estado actual con badge visual
- Botones de acción contextuales según rol

**Columna Izquierda: Resumen**
- **Información General**: Tipo, documento, riesgo, completitud
- **Alertas Activas**: Cantidad y acceso rápido
- **Trazabilidad**: Quién creó, modificó, aprobó (con fechas)

**Columna Derecha: Información Detallada (Tabs)**
- **Identificación**: Datos personales/corporativos
- **Económica**: Actividad, ingresos, origen de fondos
- **Relación con Aseguradora**: Fecha inicio, productos, canal
- **Documentos**: Lista de documentos adjuntos con estado (Aprobado/Pendiente)
- **Historial**: Timeline completo de cambios con usuario y fecha

**Acciones Exclusivas del Oficial de Cumplimiento**:
Cuando el estado es `UNDER_REVIEW` y el usuario es `COMPLIANCE_OFFICER`:

1. **Aprobar Expediente**:
   - Dialog de confirmación con advertencia de inmutabilidad
   - Cambia estado a: APPROVED
   - Marca `isDeletable = false`
   - Marca `requiresApprovalForChanges = true`
   - Registra `approvedBy` y `approvedAt`
   - Genera evento de auditoría: DOSSIER_APPROVED

2. **Rechazar Expediente**:
   - Dialog con campo obligatorio de motivo
   - Cambia estado a: OBSERVED o REQUIRES_INFO
   - Genera notificación al creador
   - Genera evento de auditoría: DOSSIER_REJECTED
   - El expediente regresa al responsable para correcciones

---

## 2. Estrategia de Diseño Visual

### Paleta de Colores

**Estados de Expediente**:
- INCOMPLETE → Badge secundario (gris) + ícono Clock
- UNDER_REVIEW → Badge azul + ícono FileText
- REQUIRES_INFO → Badge outline (borde) + ícono AlertCircle
- OBSERVED → Badge destructivo (rojo) + ícono AlertTriangle
- APPROVED → Badge verde + ícono CheckCircle

**Niveles de Riesgo**:
- LOW → Verde esmeralda (bg-emerald-500/10)
- MEDIUM → Ámbar (bg-amber-500/10)
- HIGH → Rojo (bg-red-500/10)

**Completitud**:
- 0-50% → Barra roja
- 51-75% → Barra ámbar
- 76-100% → Barra verde

### Tipografía
- Headings: Inter font-bold
- Body: Inter font-normal
- Monospace: Para IDs y documentos (font-mono)

### Espaciado y Layout
- Container principal: `max-w-7xl mx-auto`
- Cards: `rounded-lg border shadow-sm`
- Spacing: Sistema de 4px (gap-4, p-4, etc.)

---

## 3. Flujos de Usuario por Rol

### Comercial (COMMERCIAL)
```
Dashboard → Gestión de Expedientes → Nuevo Expediente
→ Selecciona: Cliente o Intermediario
→ Completa formulario
→ Guarda borrador (múltiples veces permitido)
→ Envía a cumplimiento (cuando completitud ≥ 76%)
→ Espera revisión
```

### Analista de Cumplimiento (COMPLIANCE_ANALYST)
```
Dashboard → Gestión de Expedientes → Filtro: "En Revisión"
→ Abre expediente
→ Revisa información
→ Ejecuta evaluación de riesgo
→ Si necesita más info: Cambia a "Requiere Info"
→ Si identifica problemas: Cambia a "Observado"
→ Si está conforme: Eleva al Oficial de Cumplimiento
```

### Oficial de Cumplimiento (COMPLIANCE_OFFICER)
```
Dashboard → Gestión de Expedientes → Filtro: "En Revisión"
→ Abre expediente elevado por analista
→ Revisa análisis completo
→ Valida evaluación de riesgo
→ Opción A: APROBAR
   → Dialog de confirmación
   → Estado: APPROVED
   → Ya no puede eliminarse
→ Opción B: RECHAZAR
   → Dialog con motivo obligatorio
   → Estado: OBSERVED o REQUIRES_INFO
   → Notifica al responsable
```

### Auditor (AUDITOR) / Inspector SUDEASEG (INSPECTOR)
```
Dashboard → Gestión de Expedientes
→ Solo lectura (sin botones de edición)
→ Acceso completo a historial de cambios
→ Visualización de trazabilidad completa
→ Exportación de reportes (futuro)
```

---

## 4. Integración con Backend

### Endpoints Requeridos

**GET** `/api/dossiers`
- Parámetros: `type`, `riskLevel`, `status`, `search`, `page`, `limit`
- Respuesta: Lista paginada de expedientes con metadatos
- Filtrado automático por rol del usuario autenticado

**POST** `/api/dossiers`
- Body: `{ subjectType, status: "INCOMPLETE", formData }`
- Respuesta: `{ dossierId, dossierUuid, status }`
- Genera evento de auditoría: DOSSIER_CREATED

**GET** `/api/dossiers/:id`
- Respuesta: Expediente completo con todos los tabs
- Incluye historial de cambios y documentos

**PUT** `/api/dossiers/:id`
- Body: Datos modificados del expediente
- Validación: Si status=APPROVED, rechaza modificación directa
- Genera evento de auditoría: DOSSIER_UPDATED

**POST** `/api/dossiers/:id/approve`
- Exclusivo para COMPLIANCE_OFFICER
- Body: `{ approverComments }`
- Cambia estado a APPROVED, marca inmutable
- Genera evento de auditoría: DOSSIER_APPROVED

**POST** `/api/dossiers/:id/reject`
- Exclusivo para COMPLIANCE_OFFICER
- Body: `{ rejectionReason, newStatus: "OBSERVED" | "REQUIRES_INFO" }`
- Genera notificación al creador
- Genera evento de auditoría: DOSSIER_REJECTED

---

## 5. Cumplimiento Regulatorio

### Evidencias para SUDEASEG

1. **Segregación de Funciones**:
   - Comercial crea, Cumplimiento aprueba
   - Auditoría solo consulta
   - Inspector SUDEASEG tiene acceso solo lectura

2. **Trazabilidad Completa**:
   - Cada acción registrada en `audit_logs`
   - Historial inmutable de cambios en `dossier_change_history`
   - Timestamps de creación, modificación y aprobación

3. **Controles de Aprobación**:
   - Expedientes incompletos identificables visualmente
   - Flujo obligatorio de revisión antes de aprobación
   - Motivos de rechazo documentados

4. **Inmutabilidad Post-Aprobación**:
   - Expedientes aprobados no pueden eliminarse
   - Cambios futuros requieren aprobación previa (genera alerta)
   - Indicador visual claro de estado aprobado

5. **Gestión Basada en Riesgo**:
   - Clasificación visual de niveles de riesgo
   - Alertas prioritarias para alto riesgo
   - Filtrado rápido por nivel de riesgo

---

## 6. Mejoras Futuras

- **Carga Masiva**: Importación de expedientes desde Excel/CSV
- **Exportación**: PDF del expediente completo para inspecciones
- **Notificaciones Push**: Alertas en tiempo real para cambios de estado
- **Dashboard de Métricas**: Tiempo promedio de aprobación, backlog, etc.
- **Firma Digital**: Integración con certificados digitales para aprobaciones
- **OCR**: Extracción automática de datos desde documentos escaneados
- **Workflow Visual**: Diagrama de flujo interactivo del estado del expediente

---

**Fecha de Documentación**: 2024-01-21  
**Versión**: 1.0  
**Sistema**: SIAR - Sistema Integral de Administración de Riesgos y Cumplimiento
