# SIAR - Diseño de Dashboards por Rol

## Versión del Documento
- **Versión**: 1.0
- **Fecha**: Diciembre 2024
- **Sistema**: SIAR - Sistema Integral de Administración de Riesgos

---

## 1. Introducción

Este documento describe el diseño funcional de los dashboards del Sistema SIAR, adaptados específicamente para cada rol según el modelo RBAC implementado.

### 1.1 Objetivos del Dashboard

- Mostrar el estado general de cumplimiento en tiempo real
- Facilitar la gestión diaria según responsabilidades del rol
- Servir como evidencia de control activo para supervisores e inspectores
- Permitir acceso rápido a módulos y funcionalidades autorizados
- Alertar sobre situaciones que requieren atención inmediata

### 1.2 Principios de Diseño

#### Diseño Visual
- **Paleta de colores**: Tema oscuro profesional con azul institucional
- **Tipografía**: Inter para UI, JetBrains Mono para código
- **Espaciado**: Sistema consistente usando escala de Tailwind
- **Iconografía**: Lucide Icons para consistencia visual

#### Experiencia de Usuario
- **Claridad**: Información presentada de forma directa y comprensible
- **Accesibilidad**: Widgets clicables que redirigen a módulos específicos
- **Actualización**: Datos actualizados en tiempo real o periódicamente
- **Filtros**: Capacidad de filtrar por fecha, estado y tipo
- **Priorización**: Alertas críticas visibles prominentemente

---

## 2. Estructura General del Dashboard

### 2.1 Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240px)     │  Header (64px)                      │
│  ┌─────────────┐     │  ┌────────────────────────────────┐ │
│  │ Logo SIAR   │     │  │ Usuario | Rol | Logout         │ │
│  ├─────────────┤     │  └────────────────────────────────┘ │
│  │             │     ├─────────────────────────────────────┤
│  │ Nav Items   │     │                                     │
│  │ - Dashboard │     │  Content Area                       │
│  │ - Expedientes│     │  ┌────────┬────────┬────────┐    │
│  │ - Riesgo    │     │  │ Metric │ Metric │ Metric │    │
│  │ - Alertas   │     │  └────────┴────────┴────────┘    │
│  │ - Screening │     │                                     │
│  │ - Reportes  │     │  ┌───────────────────────────┐    │
│  │ - PEP       │     │  │ Alerts List               │    │
│  │ - Auditoría │     │  └───────────────────────────┘    │
│  │ - Usuarios  │     │                                     │
│  │             │     │                                     │
│  └─────────────┘     │                                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes Reutilizables

#### MetricCard
- **Título**: Descripción clara de la métrica
- **Valor**: Número grande y visible
- **Icono**: Representación visual contextual
- **Descripción**: Texto adicional explicativo
- **Tendencia**: Indicador opcional de cambio (↑↓ %)
- **Variante**: default | warning | danger | success
- **Interacción**: Clicable para navegar al módulo

#### AlertList
- **Título de alerta**: Descripción concisa del problema
- **Severidad**: Badge con color (Baja, Media, Alta, Crítica)
- **Descripción**: Detalle de la alerta
- **Contexto**: Tipo y nombre del expediente afectado
- **Timestamp**: Cuándo se generó la alerta
- **Acción**: Clicable para ver detalles completos

---

## 3. Dashboards por Rol

### 3.1 Oficial de Cumplimiento (ROL-001)

**Responsabilidad**: Supervisión total del sistema y aprobaciones finales

**Métricas Críticas** (Primera fila):
- Alertas Críticas (variant: danger)
- Aprobaciones Pendientes (variant: warning)
- Riesgo Alto (variant: warning)
- Screenings Pendientes

**Métricas Generales** (Segunda fila):
- Total Expedientes
- Expedientes Incompletos
- Documentos Vencidos
- PEP Activos

**Widgets Adicionales**:
- Lista de Alertas Activas (Top 5)
- Nivel de Cumplimiento Global (%)
- Expedientes con Gestión Activa (%)

**Acciones Rápidas**:
- Aprobar/Rechazar expedientes
- Configurar parámetros de riesgo
- Ver reportes consolidados
- Gestionar usuarios

---

### 3.2 Unidad de Cumplimiento (ROL-002)

**Responsabilidad**: Gestión operativa de expedientes asignados

**Métricas Principales**:
- Expedientes Asignados
- Pendientes de Revisión (variant: warning)
- Seguimientos Abiertos
- Evaluaciones en Curso
- Completados Esta Semana (variant: success)
- Tiempo Promedio de Procesamiento

**Widgets Adicionales**:
- Alertas Asignadas (Top 5)
- Tareas Pendientes del Día

**Acciones Rápidas**:
- Crear/modificar expedientes
- Realizar evaluaciones de riesgo
- Investigar alertas
- Preparar reportes

---

### 3.3 Área Comercial (ROL-003)

**Responsabilidad**: Gestión de clientes e intermediarios

**Métricas Principales**:
- Clientes Creados
- Intermediarios Creados
- Aprobados Este Mes (variant: success)
- Clientes Incompletos (variant: warning si > 10)
- Intermediarios Incompletos (variant: warning si > 10)
- Documentos Pendientes

**Widgets Adicionales**:
- Alertas de Mis Expedientes
- Expedientes Rechazados (requieren corrección)

**Acciones Rápidas**:
- Crear nuevo cliente
- Crear nuevo intermediario
- Cargar documentos pendientes
- Ver evaluaciones de riesgo

---

### 3.4 Área de Operaciones (ROL-004)

**Responsabilidad**: Gestión de intermediarios, reaseguradores y proveedores

**Métricas Principales**:
- Intermediarios Creados
- Reaseguradores Activos
- Proveedores Activos
- Expedientes con Observaciones (variant: warning)
- Documentos Próximos a Vencer
- Evaluaciones Completadas

**Acciones Rápidas**:
- Crear intermediario/reasegurador/proveedor
- Gestionar documentación
- Ver alertas operativas

---

### 3.5 Área Administrativa (ROL-005)

**Responsabilidad**: Gestión de proveedores

**Métricas Principales**:
- Proveedores Activos
- Proveedores Nuevos Este Mes
- Documentos Vencidos (variant: danger si > 5)
- Proveedores Incompletos
- Evaluaciones Pendientes

**Acciones Rápidas**:
- Crear proveedor
- Actualizar documentos
- Ver proveedores críticos

---

### 3.6 Área Técnica (ROL-006)

**Responsabilidad**: Gestión técnica de reaseguradores y retrocesionarios

**Métricas Principales**:
- Reaseguradores Activos
- Retrocesionarios Activos
- Evaluaciones Técnicas Pendientes
- Screenings Completados
- Documentos Técnicos Pendientes

**Acciones Rápidas**:
- Crear reasegurador/retrocesionario
- Evaluar aspectos técnicos
- Revisar screening

---

### 3.7 Recursos Humanos (ROL-007)

**Responsabilidad**: Gestión de expedientes de empleados

**Métricas Principales**:
- Total Empleados
- Empleados Nuevos Este Mes
- Documentación Laboral Pendiente (variant: warning)
- Empleados PEP
- Documentos Vencidos (variant: danger)
- Evaluaciones de Riesgo Completadas

**Acciones Rápidas**:
- Crear expediente empleado
- Cargar documentación laboral
- Ver empleados PEP

---

### 3.8 Auditoría Interna / Contraloría (ROL-008, ROL-009)

**Responsabilidad**: Supervisión y control con acceso solo lectura

**Métricas Principales**:
- Indicadores Globales de Cumplimiento
- Total de Expedientes por Tipo
- Alertas Generadas (histórico)
- Trazabilidad de Operaciones
- Controles Ejecutados
- Expedientes Auditados

**Widgets Especiales**:
- Vista Consolidada de Auditoría
- Bitácora de Eventos Recientes
- Reportes de Auditoría Disponibles

**Restricciones**:
- Sin botones de creación/edición
- Solo visualización y reportes
- Acceso completo a historial

---

### 3.9 Auditor Externo (ROL-010)

**Responsabilidad**: Revisión externa según alcance

**Métricas Limitadas**:
- Expedientes en Alcance de Auditoría
- Documentos Revisados
- Hallazgos Identificados

**Restricciones**:
- Acceso restringido según alcance
- Solo lectura
- Sesión completamente trazada

---

### 3.10 Inspector SUDEASEG (ROL-011)

**Responsabilidad**: Inspección regulatoria

**Métricas Regulatorias**:
- Vista Consolidada de Cumplimiento
- Total Expedientes por Categoría
- Alertas Críticas Históricas
- Evidencia Documental
- Seguimiento de Casos

**Widgets Especiales**:
- Panel de Cumplimiento Regulatorio
- Reportes SUDEASEG
- Bitácora Completa de Auditoría

**Restricciones**:
- Acceso solo lectura
- Sesión completamente trazada
- Registro especial en auditoría

---

## 4. Variantes de Color Semántico

### 4.1 Sistema de Colores

```css
Primary (Azul Institucional): #3B82F6
- Uso: Elementos de marca, navegación activa

Secondary (Gris Pizarra): #475569
- Uso: Elementos secundarios, botones alternativos

Success (Verde Esmeralda): #22C55E
- Uso: Métricas positivas, completadas, aprobadas

Warning (Ámbar): #F59E0B
- Uso: Alertas medias, pendientes, próximos a vencer

Danger (Rojo): #DC2626
- Uso: Alertas críticas, vencidos, rechazados, errores

Info (Cian): #06B6D4
- Uso: Información general, alertas bajas
```

### 4.2 Aplicación de Variantes

- **default**: Métricas informativas sin urgencia
- **success**: Indicadores positivos, metas cumplidas
- **warning**: Situaciones que requieren atención moderada
- **danger**: Situaciones críticas que requieren acción inmediata

---

## 5. Comportamiento Funcional

### 5.1 Interactividad

- **Métricas clicables**: Al hacer clic, navega al módulo filtrado
- **Alertas clicables**: Al hacer clic, abre detalle completo de la alerta
- **Actualización**: Refresh automático cada 60 segundos (configurable)
- **Filtros**: Por fecha, estado, prioridad (según contexto)

### 5.2 Evidencia de Cumplimiento

- Dashboard muestra **gestión activa** del sistema
- Métricas demuestran **seguimiento continuo**
- Alertas evidencian **controles automatizados**
- Segregación de funciones **visible por rol**
- **Trazabilidad** completa en auditoría

---

## 6. Consideraciones Técnicas

### 6.1 Arquitectura Frontend

- **Framework**: Next.js 16 con App Router
- **Styling**: Tailwind CSS v4 con tema custom
- **Componentes**: shadcn/ui para UI base
- **Estado**: SWR para fetching y caché de datos
- **Tipado**: TypeScript para seguridad de tipos

### 6.2 Integración Backend

```typescript
// API Routes for Dashboard Data
GET /api/dashboard/metrics?role={role}
GET /api/dashboard/alerts?role={role}&limit={n}
GET /api/dashboard/activity?role={role}&period={period}
```

### 6.3 Performance

- **SSR**: Server-side rendering para primera carga rápida
- **Caché**: SWR con revalidación inteligente
- **Lazy Loading**: Componentes pesados cargados bajo demanda
- **Optimistic UI**: Actualizaciones optimistas para mejor UX

---

## 7. Seguridad y Cumplimiento

### 7.1 Control de Acceso

- Dashboard renderizado según rol autenticado
- Métricas filtradas por permisos del usuario
- Botones de acción mostrados solo si usuario tiene permiso
- Navegación dinámica basada en RBAC

### 7.2 Auditoría

- Cada vista de dashboard registrada en audit_logs
- Cada clic en métrica registrado
- Sesiones de usuarios externos (auditores, inspectores) completamente trazadas
- Registro de tiempo de permanencia en cada sección

---

## 8. Roadmap de Mejoras

### Fase 2
- Widgets configurables por usuario
- Dashboards personalizables (drag & drop)
- Notificaciones push en tiempo real
- Exportación de reportes desde dashboard

### Fase 3
- Gráficos y tendencias históricas
- Comparativas período vs período
- Predicción de alertas con ML
- Dashboard móvil responsive

---

## 9. Implementación

### 9.1 Archivos Creados

```
app/
  dashboard/
    page.tsx                              # Router principal
  globals.css                             # Tema custom SIAR

components/
  dashboard/
    dashboard-shell.tsx                   # Layout wrapper
    dashboard-header.tsx                  # Header con usuario
    sidebar-nav.tsx                       # Navegación lateral
    metric-card.tsx                       # Componente métrica reutilizable
    alert-list.tsx                        # Lista de alertas
    roles/
      officer-dashboard.tsx               # Oficial de Cumplimiento
      compliance-unit-dashboard.tsx       # Unidad de Cumplimiento
      commercial-dashboard.tsx            # Área Comercial
      # ... otros dashboards por rol
```

### 9.2 Próximos Pasos

1. Implementar dashboards para roles restantes (Operaciones, RH, Técnico, Auditoría)
2. Conectar con APIs del backend Java
3. Implementar sistema de actualización en tiempo real
4. Agregar filtros y búsqueda avanzada
5. Crear vistas de detalle para cada módulo
6. Implementar exportación de reportes

---

## 10. Conclusión

El diseño de dashboards del SIAR cumple con los requisitos regulatorios de evidenciar gestión activa y control continuo, mientras proporciona herramientas efectivas para cada rol según sus responsabilidades específicas. El sistema es escalable, auditable y cumple con las normativas de SUDEASEG.
