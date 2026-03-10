# Modelo de Gobierno de Datos del SIAR
## Sistema Automatizado de Gestión Integral de Riesgos y Cumplimiento

**Versión:** 2.0  
**Fecha:** Diciembre 2024  
**Alcance:** Seguros La Occidental de Venezuela  
**Marco Regulatorio:** SUDEBAN, UNIF, Ley Orgánica de Drogas, Ley de Legitimación de Capitales

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

El Modelo de Gobierno de Datos del SIAR establece el marco institucional para asegurar que los datos críticos de gestión de riesgos y cumplimiento sean:

- **Íntegros**: Exactos, completos y consistentes
- **Confiables**: Auditables y verificables
- **Seguros**: Protegidos contra acceso no autorizado
- **Trazables**: Con historial completo de cambios
- **Oportunos**: Disponibles cuando se requieren
- **Conformes**: Alineados con normativa regulatoria

### 1.2 Alcance

Este modelo aplica a todos los datos gestionados en el SIAR, incluyendo:

- **Expedientes** (Dossiers): Clientes, Intermediarios, Empleados, Proveedores, Reaseguradores
- **Evaluaciones de Riesgo**: Cálculos, matrices, factores de riesgo
- **Documentos**: Identidad, domicilio, estados financieros, certificaciones
- **Screening**: Listas restrictivas, sanciones, medios adversos
- **PEP**: Personas Expuestas Políticamente y vinculados
- **Alertas**: Inconsistencias, vencimientos, excepciones
- **Auditoría**: Registros inmutables de eventos del sistema

---

## 2. ROLES Y RESPONSABILIDADES

### 2.1 Estructura de Gobierno

```
┌──────────────────────────────────────────┐
│   COMITÉ DE GOBIERNO DE DATOS SIAR       │
│  (Data Governance Board)                 │
└──────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐    ┌────▼───┐    ┌─────▼────┐
│  Data  │    │  Data  │    │   Data   │
│  Owner │    │Steward │    │ Analyst  │
└────────┘    └────────┘    └──────────┘
```

### 2.2 Oficial de Cumplimiento (Data Owner)

**Responsabilidades:**

- **Propiedad de Datos**: Responsable final de la calidad y uso de datos de cumplimiento
- **Políticas**: Define reglas de negocio para validación de datos
- **Aprobaciones**: Autoriza cambios críticos en expedientes aprobados
- **Decisiones**: Resuelve conflictos en clasificación de riesgo y PEP
- **Cumplimiento**: Garantiza conformidad con SUDEBAN y UNIF
- **Reportes**: Valida información para entidades reguladoras

**Dominios de Datos:**

- Expedientes aprobados
- Evaluaciones de riesgo finales
- Clasificaciones PEP
- Alertas críticas
- Reportes regulatorios

### 2.3 Unidad de Cumplimiento (Data Steward)

**Responsabilidades:**

- **Gestión Operativa**: Administra datos en el día a día
- **Calidad**: Ejecuta controles de validación y completitud
- **Documentación**: Mantiene catálogos maestros actualizados
- **Corrección**: Rectifica errores detectados
- **Capacitación**: Entrena a usuarios en estándares de calidad
- **Métricas**: Genera indicadores de calidad de datos

**Dominios de Datos:**

- Expedientes en proceso
- Documentos adjuntos
- Screening periódico
- Seguimiento PEP
- Alertas operativas

### 2.4 Analista de Riesgos (Data Producer)

**Responsabilidades:**

- **Captura**: Ingresa datos de expedientes nuevos
- **Actualización**: Mantiene información vigente
- **Documentación**: Adjunta respaldos requeridos
- **Revisión**: Verifica completitud antes de envío
- **Justificación**: Documenta decisiones y excepciones

**Dominios de Datos:**

- Expedientes en creación
- Evaluaciones preliminares
- Adjuntos de documentos
- Comentarios y observaciones

### 2.5 Auditor Interno / Regulador (Data Consumer)

**Responsabilidades:**

- **Verificación**: Revisa integridad de registros
- **Trazabilidad**: Audita cambios y aprobaciones
- **Cumplimiento**: Valida conformidad regulatoria
- **Reporte**: Identifica brechas y riesgos de calidad

**Dominios de Datos:**

- Bitácora de auditoría inmutable
- Historial de cambios
- Reportes de cumplimiento
- Indicadores de calidad

### 2.6 Administrador de Sistema (Data Custodian)

**Responsabilidades:**

- **Disponibilidad**: Garantiza acceso 24/7 al sistema
- **Seguridad**: Protege datos contra acceso no autorizado
- **Respaldos**: Ejecuta copias de seguridad diarias
- **Integridad**: Monitorea hash chains de auditoría
- **Recuperación**: Restaura datos en caso de incidentes

---

## 3. DOMINIOS DE DATOS

### 3.1 Dominio: Expedientes (Dossiers)

**Data Owner:** Oficial de Cumplimiento  
**Data Steward:** Jefe de Unidad de Cumplimiento

**Entidades:**

- `Dossier`: Expediente maestro
- `DossierChangeHistory`: Historial de modificaciones
- `DossierReviewComment`: Comentarios de revisión
- `DossierDocument`: Documentos adjuntos

**Ciclo de Vida:**

1. **INCOMPLETE** → Expediente en construcción
2. **UNDER_REVIEW** → En revisión por Cumplimiento
3. **REQUIRES_INFO** → Requiere información adicional
4. **OBSERVED** → Con observaciones pendientes
5. **APPROVED** → Aprobado (inmutable sin autorización)

**Reglas de Negocio:**

- Campos obligatorios según tipo de sujeto (CLIENT, INTERMEDIARY, EMPLOYEE, etc.)
- Completitud mínima 100% para aprobación
- Documentos de respaldo según nivel de riesgo
- Versionamiento automático en cada cambio
- Aprobación requerida para modificar expedientes aprobados

### 3.2 Dominio: Evaluaciones de Riesgo

**Data Owner:** Oficial de Cumplimiento  
**Data Steward:** Analista Senior de Riesgos

**Entidades:**

- `RiskEvaluation`: Evaluación de riesgo
- `EvaluationHistory`: Historial de evaluaciones
- `RiskConfiguration`: Configuración de matrices
- `RiskFactor`: Catálogo de factores de riesgo

**Ciclo de Vida:**

1. **DRAFT** → Borrador en construcción
2. **PENDING_APPROVAL** → Pendiente aprobación
3. **APPROVED** → Aprobada
4. **SUPERSEDED** → Reemplazada por nueva versión

**Reglas de Negocio:**

- Todos los factores de riesgo deben evaluarse
- Justificación obligatoria si se cambia riesgo calculado
- Aprobación del Oficial de Cumplimiento para overrides
- Revisión periódica según nivel de riesgo:
  - ALTO: Cada 6 meses
  - MEDIO: Cada 12 meses
  - BAJO: Cada 24 meses

### 3.3 Dominio: Documentos

**Data Owner:** Oficial de Cumplimiento  
**Data Steward:** Coordinador de Debida Diligencia

**Entidades:**

- `Document`: Documento adjunto
- `DocumentHistory`: Historial de documento
- `DocumentType`: Catálogo de tipos de documentos

**Ciclo de Vida:**

1. **UPLOADED** → Cargado
2. **PENDING_REVIEW** → Pendiente revisión
3. **APPROVED** → Aprobado
4. **REJECTED** → Rechazado
5. **EXPIRED** → Vencido
6. **REPLACED** → Reemplazado

**Reglas de Negocio:**

- Formatos aceptados según tipo de documento (PDF, JPG, PNG)
- Tamaño máximo según configuración (típicamente 10 MB)
- Vigencia obligatoria para ciertos documentos
- Notificación 30 días antes de vencimiento
- Documentos vencidos bloquean aprobación de expediente

### 3.4 Dominio: Screening

**Data Owner:** Oficial de Cumplimiento  
**Data Steward:** Analista de Screening

**Entidades:**

- `Screening`: Screening ejecutado
- `ScreeningResult`: Resultado del screening
- `ScreeningList`: Listas restrictivas

**Reglas de Negocio:**

- Screening inicial obligatorio antes de aprobación
- Screening periódico según nivel de riesgo:
  - ALTO: Mensual
  - MEDIO: Trimestral
  - BAJO: Semestral
- Matches requieren análisis y justificación
- Screening positivo bloquea aprobación hasta resolución

### 3.5 Dominio: PEP

**Data Owner:** Oficial de Cumplimiento  
**Data Steward:** Especialista PEP

**Entidades:**

- `PepInformation`: Información PEP
- `PepPosition`: Cargo PEP
- `PepRelationship`: Relación con PEP
- `PepStatus`: Estado PEP

**Reglas de Negocio:**

- Evaluación PEP obligatoria para todos los expedientes
- Fuentes de información deben documentarse
- PEP requiere Due Diligence Reforzada
- Monitoreo reforzado (trimestral mínimo)
- Aprobación de Directorio para PEP de alto perfil

### 3.6 Dominio: Alertas

**Data Owner:** Gerente de Cumplimiento  
**Data Steward:** Unidad de Cumplimiento

**Entidades:**

- `Alert`: Alerta del sistema
- `AlertTracking`: Seguimiento de alerta

**Ciclo de Vida:**

1. **NUEVA** → Recién detectada
2. **ASIGNADA** → Asignada a analista
3. **ATENDIDA** → En proceso
4. **CERRADA** → Cerrada con resolución

**Reglas de Negocio:**

- Alertas críticas deben atenderse en 24 horas
- Alertas altas en 48 horas
- Escalación automática si se sobrepasa deadline
- Cierre requiere justificación y evidencia

### 3.7 Dominio: Auditoría

**Data Owner:** Oficial de Cumplimiento  
**Data Steward:** Administrador de Sistema

**Entidades:**

- `AuditLog`: Registro de auditoría inmutable

**Reglas de Negocio:**

- **INMUTABILIDAD ABSOLUTA**: No se permite UPDATE ni DELETE
- Hash chain para verificar integridad
- Todos los eventos críticos deben auditarse
- Retención mínima: 10 años
- Exportación para reguladores sin modificación

---

## 4. POLÍTICAS DE CALIDAD DE DATOS

### 4.1 Dimensiones de Calidad

| Dimensión | Definición | Métrica | Umbral |
|-----------|------------|---------|--------|
| **Completitud** | % de campos obligatorios llenos | Campos llenos / Campos requeridos | ≥ 100% |
| **Exactitud** | Datos correctos y verificados | Validaciones pasadas / Total validaciones | ≥ 95% |
| **Consistencia** | Datos alineados entre módulos | Inconsistencias / Total registros | ≤ 5% |
| **Vigencia** | Datos actualizados | Documentos vigentes / Total documentos | ≥ 90% |
| **Unicidad** | Sin duplicados | Duplicados detectados / Total registros | ≤ 1% |
| **Trazabilidad** | Cambios auditados | Cambios auditados / Total cambios | 100% |

### 4.2 Controles de Calidad

#### 4.2.1 Controles Preventivos (antes de guardar)

- Validación de tipos de datos (string, number, date, email)
- Validación de formatos (RIF, cédula, email, teléfono)
- Rangos permitidos (fechas, montos, porcentajes)
- Listas de valores permitidos (enumeraciones)
- Obligatoriedad según contexto (tipo de sujeto, nivel de riesgo)

#### 4.2.2 Controles Detectivos (después de guardar)

- Detección de duplicados (nombre + documento)
- Inconsistencias entre módulos (expediente vs. evaluación de riesgo)
- Documentos vencidos
- Evaluaciones de riesgo desactualizadas
- Alertas no atendidas

#### 4.2.3 Controles Correctivos

- Workflow de solicitud de corrección
- Aprobación de Cumplimiento para cambios críticos
- Registro obligatorio de justificación
- Notificación a stakeholders afectados

### 4.3 Estándares de Datos

#### 4.3.1 Nombres de Personas

- Capitalización correcta (Juan Pérez, no JUAN PEREZ)
- Sin caracteres especiales no válidos
- Campos separados: firstName, middleName, lastName, secondLastName

#### 4.3.2 Identificación

- Formato estándar según tipo:
  - Cédula: V-12345678, E-12345678
  - RIF: J-123456789-1
  - Pasaporte: Según país emisor

#### 4.3.3 Direcciones

- Estructura normalizada:
  - street (calle y número)
  - city (ciudad)
  - state (estado)
  - country (país - ISO 3166)
  - postalCode (código postal)

#### 4.3.4 Fechas

- Formato ISO 8601: `YYYY-MM-DD`
- Timezone: America/Caracas
- Validación de rangos lógicos (fecha nacimiento < fecha actual)

#### 4.3.5 Montos

- Moneda obligatoria (VES, USD, EUR)
- Precisión: 2 decimales
- Validación contra rangos esperados

---

## 5. SEGURIDAD Y PRIVACIDAD

### 5.1 Clasificación de Datos

| Clasificación | Definición | Ejemplos | Controles |
|---------------|------------|----------|-----------|
| **PÚBLICO** | No sensible | Catálogos, listas de valores | Ninguno especial |
| **INTERNO** | Uso interno | Estadísticas agregadas | Autenticación |
| **CONFIDENCIAL** | Datos de negocio | Expedientes, evaluaciones | Autenticación + Autorización |
| **RESTRINGIDO** | PII, datos sensibles | Documentos de identidad, financieros | Cifrado + Auditoría |

### 5.2 Protección de Datos Personales

**Cumplimiento:** Ley de Protección de Datos Personales de Venezuela

**Medidas:**

- Cifrado en tránsito (TLS 1.3)
- Cifrado en reposo (AES-256) para datos sensibles
- Anonimización en exportaciones de prueba
- Enmascaramiento en logs y auditorías
- Eliminación segura (soft delete + retención legal)

### 5.3 Control de Acceso

**Modelo:** RBAC (Role-Based Access Control)

**Roles:**

- `COMPLIANCE_OFFICER`: Acceso total
- `COMPLIANCE_ANALYST`: Lectura/escritura expedientes
- `RISK_ANALYST`: Lectura/escritura evaluaciones
- `AUDITOR`: Solo lectura + auditoría
- `REGULATOR`: Acceso de inspección

**Principios:**

- Mínimo privilegio necesario
- Separación de funciones (quien registra ≠ quien aprueba)
- Revisión trimestral de permisos
- Revocación inmediata al cambio de rol

---

## 6. CATÁLOGOS MAESTROS

### 6.1 Gestión de Catálogos

**Objetivo:** Estandarizar valores de referencia sin depender de desarrolladores

**Catálogos Parametrizables:**

1. **Productos de Seguros**
   - Código, nombre, categoría
   - Nivel de riesgo inherente
   - Documentos requeridos

2. **Canales de Distribución**
   - Código, nombre, tipo
   - Nivel de riesgo del canal

3. **Países y Regiones**
   - Código ISO 3166
   - Nivel de riesgo geográfico
   - Indicador de jurisdicción de alto riesgo

4. **Zonas de Riesgo**
   - Región / país
   - Nivel de riesgo (ALTO, MEDIO, BAJO)
   - Fecha de última actualización

5. **Tipos de Documentos**
   - Código, nombre, categoría
   - Formatos aceptados
   - Vigencia requerida
   - Aplicabilidad por tipo de sujeto

**Funcionalidades:**

- CRUD completo por usuarios autorizados (COMPLIANCE_OFFICER)
- Versionamiento de cambios
- Activación/desactivación (no eliminación física)
- Efectividad temporal (effectiveFrom/effectiveTo)
- Aprobación para cambios críticos
- Auditoría completa de modificaciones

### 6.2 Implementación Técnica

```java
@Entity
@Table(name = "master_catalogs")
public class MasterCatalog {
    @Id
    private String catalogCode;
    
    private String catalogName;
    private String catalogType; // PRODUCT, CHANNEL, COUNTRY, etc.
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode catalogValues; // Array de valores
    
    private Boolean isActive;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    
    private String lastModifiedBy;
    private LocalDateTime lastModifiedAt;
    
    @Version
    private Long version;
}
```

---

## 7. VERSIONAMIENTO Y TRAZABILIDAD

### 7.1 Estrategia de Versionamiento

#### 7.1.1 Versionamiento Explícito (Tablas de Historial)

**Aplicable a:**

- Expedientes: `DossierChangeHistory`
- Evaluaciones de Riesgo: `EvaluationHistory`
- Documentos: `DocumentHistory`

**Información Capturada:**

```json
{
  "changeId": "CHG-2024-001234",
  "timestamp": "2024-12-16T10:30:00Z",
  "changeType": "UPDATE",
  "performedBy": "usuario123",
  "performedByRole": "COMPLIANCE_ANALYST",
  "affectedSections": ["identification", "economicInformation"],
  "affectedFields": ["annualIncome", "occupation"],
  "previousValues": {
    "annualIncome": 50000,
    "occupation": "Comerciante"
  },
  "newValues": {
    "annualIncome": 75000,
    "occupation": "Empresario"
  },
  "requiresApproval": true,
  "approvalStatus": "PENDING"
}
```

#### 7.1.2 Versionamiento Optimista (@Version)

**Aplicable a:**

- Entities principales (Dossier, RiskEvaluation, etc.)
- Previene conflictos de concurrencia
- Incremento automático en cada actualización

#### 7.1.3 Versionamiento Semántico (Configuraciones)

**Formato:** `CFG-YYYY-XXX-vN`

- `RiskConfiguration`: CFG-2024-001-v1, CFG-2024-001-v2
- Cambios en pesos y umbrales requieren nueva versión
- Efectividad temporal (vigencia)

### 7.2 Inmutabilidad

#### 7.2.1 Auditoría Inmutable

**Tabla:** `audit_logs`

**Garantías:**

- No permite UPDATE ni DELETE (triggers en base de datos)
- Hash chain: cada registro contiene hash del anterior
- Verificación de integridad mediante recálculo de cadena

**Implementación:**

```sql
-- Trigger para prevenir modificaciones
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER prevent_audit_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();
```

#### 7.2.2 Soft Delete

**Aplicable a:** Todas las entidades principales

- Campo `isDeleted` en lugar de DELETE físico
- Preserva integridad referencial
- Permite recuperación
- Auditoría del borrado

### 7.3 Recuperación de Versiones

**Funcionalidad:**

- Ver historial completo de cambios
- Comparar versión actual vs. anterior
- Restaurar versión anterior (con aprobación)
- Exportar historial para auditoría

**Interfaz:**

```typescript
interface VersionHistory {
  changeId: string;
  timestamp: string;
  performedBy: string;
  changeType: string;
  affectedFields: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  justification?: string;
}

function getVersionHistory(dossierId: string): VersionHistory[];
function compareVersions(changeId1: string, changeId2: string): VersionComparison;
function restoreVersion(changeId: string, justification: string): Promise<void>;
```

---

## 8. INDICADORES DE CALIDAD DE DATOS

### 8.1 Dashboard de Calidad

**Objetivo:** Visibilidad en tiempo real de la salud de los datos

#### 8.1.1 Indicadores Clave (KPIs)

| Indicador | Fórmula | Frecuencia | Meta |
|-----------|---------|------------|------|
| **% Expedientes Completos** | Expedientes 100% completos / Total expedientes activos | Diaria | ≥ 95% |
| **% Documentos Vigentes** | Documentos vigentes / Total documentos | Diaria | ≥ 90% |
| **% Evaluaciones Actualizadas** | Evaluaciones dentro de periodo / Total evaluaciones | Semanal | ≥ 95% |
| **% Screening Ejecutado** | Screenings al día / Total requeridos | Diaria | 100% |
| **Tiempo Promedio de Corrección** | Σ tiempo corrección / Total correcciones | Semanal | ≤ 48h |
| **% Alertas Resueltas a Tiempo** | Alertas cerradas antes deadline / Total alertas | Diaria | ≥ 90% |

#### 8.1.2 Visualización

```typescript
interface DataQualityDashboard {
  completenessRate: number;        // 0-100
  accuracyRate: number;            // 0-100
  timeliness: {
    documentsUpToDate: number;     // 0-100
    evaluationsUpToDate: number;   // 0-100
    screeningsUpToDate: number;    // 0-100
  };
  consistency: {
    duplicatesDetected: number;
    inconsistenciesFound: number;
  };
  trends: {
    last7Days: QualityMetrics[];
    last30Days: QualityMetrics[];
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
```

### 8.2 Alertas de Calidad

**Umbrales de Alerta:**

- **Crítico** (rojo): Completitud < 80%, Documentos vigentes < 70%
- **Alto** (naranja): Completitud < 90%, Documentos vigentes < 85%
- **Medio** (amarillo): Completitud < 95%, Documentos vigentes < 90%

**Notificaciones:**

- Email diario al Oficial de Cumplimiento
- Dashboard en tiempo real
- Reportes semanales al Comité de Gobierno de Datos

### 8.3 Reporting

**Reportes Mensuales:**

1. **Resumen Ejecutivo de Calidad de Datos**
   - KPIs principales
   - Tendencias vs. mes anterior
   - Acciones correctivas implementadas

2. **Detalle de Inconsistencias**
   - Duplicados detectados y resueltos
   - Inconsistencias entre módulos
   - Tiempo de resolución

3. **Auditoría de Cambios**
   - Total de cambios por tipo
   - Cambios que requirieron aprobación
   - Tiempo de aprobación promedio

---

## 9. DETECCIÓN DE INCONSISTENCIAS

### 9.1 Tipos de Inconsistencias

#### 9.1.1 Duplicados

**Criterios de Detección:**

- Mismo documento de identidad
- Mismo nombre + misma fecha de nacimiento
- Similitud fonética del nombre + mismo tipo de sujeto

**Algoritmo:**

```typescript
interface DuplicateDetection {
  exactMatch: {
    documentNumber: string;
  };
  fuzzyMatch: {
    nameS imilarity: number;      // 0-100 (Levenshtein distance)
    dateOfBirthMatch: boolean;
    emailMatch: boolean;
    phoneMatch: boolean;
  };
  confidence: number;              // 0-100
}
```

**Acciones:**

- Alerta automática al detectar posible duplicado
- Revisión manual obligatoria antes de aprobación
- Opción de fusionar expedientes (con auditoría completa)

#### 9.1.2 Inconsistencias entre Módulos

**Validaciones Cruzadas:**

| Inconsistencia | Validación | Acción |
|----------------|------------|--------|
| Expediente aprobado sin evaluación de riesgo | `dossier.status = APPROVED` AND `riskEvaluation IS NULL` | Bloqueo + Alerta |
| Evaluación de riesgo desactualizada | `riskEvaluation.nextReviewDate < TODAY` | Alerta MEDIA |
| Documento vencido en expediente activo | `document.expirationDate < TODAY` AND `dossier.status = APPROVED` | Alerta ALTA |
| PEP sin Due Diligence Reforzada | `pepInfo.isPep = true` AND `dueDiligence.level != ENHANCED` | Bloqueo + Alerta |
| Screening vencido | `screening.nextScreeningDate < TODAY` | Alerta MEDIA |

#### 9.1.3 Datos Inválidos

**Validaciones:**

- Fechas ilógicas (fecha nacimiento > fecha actual)
- Rangos fuera de límites (edad < 18 para clientes)
- Formatos incorrectos (email sin @)
- Referencias rotas (dossierId no existe)

### 9.2 Motor de Reglas de Validación

**Implementación:**

```java
@Service
public class DataConsistencyService {
    
    public List<DataInconsistency> detectInconsistencies(Dossier dossier) {
        List<DataInconsistency> issues = new ArrayList<>();
        
        // Regla 1: Expediente aprobado debe tener evaluación de riesgo
        if (dossier.getStatus() == DossierStatus.APPROVED 
            && dossier.getRiskAssessment() == null) {
            issues.add(DataInconsistency.builder()
                .inconsistencyType("MISSING_RISK_EVALUATION")
                .severity(Severity.CRITICAL)
                .description("Expediente aprobado sin evaluación de riesgo")
                .affectedEntity("Dossier")
                .affectedEntityId(dossier.getDossierId())
                .detectedAt(Instant.now())
                .build());
        }
        
        // Regla 2: Documentos vencidos
        dossier.getAttachedDocuments().stream()
            .filter(doc -> doc.getExpirationDate() != null 
                        && doc.getExpirationDate().isBefore(LocalDate.now()))
            .forEach(doc -> issues.add(DataInconsistency.builder()
                .inconsistencyType("EXPIRED_DOCUMENT")
                .severity(Severity.HIGH)
                .description("Documento vencido: " + doc.getDocumentType())
                .affectedEntity("Document")
                .affectedEntityId(doc.getDocumentId())
                .detectedAt(Instant.now())
                .build()));
        
        // Regla 3: PEP sin Due Diligence Reforzada
        if (dossier.getPepInformation() != null 
            && dossier.getPepInformation().getIsPep()
            && dossier.getDueDiligenceLevel() != DiligenceLevel.ENHANCED) {
            issues.add(DataInconsistency.builder()
                .inconsistencyType("PEP_WITHOUT_ENHANCED_DD")
                .severity(Severity.CRITICAL)
                .description("PEP requiere Due Diligence Reforzada")
                .affectedEntity("Dossier")
                .affectedEntityId(dossier.getDossierId())
                .detectedAt(Instant.now())
                .build());
        }
        
        return issues;
    }
    
    @Scheduled(cron = "0 0 2 * * *") // Diariamente a las 2 AM
    public void scheduledConsistencyCheck() {
        List<Dossier> activeDossiers = dossierRepository.findByIsDeletedFalse();
        
        activeDossiers.forEach(dossier -> {
            List<DataInconsistency> issues = detectInconsistencies(dossier);
            if (!issues.isEmpty()) {
                createAlertsForInconsistencies(issues);
            }
        });
    }
}
```

---

## 10. PROCESO DE CORRECCIÓN DE DATOS

### 10.1 Flujo de Corrección

```
┌─────────────────┐
│  Detección de   │
│  Error/Omisión  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Solicitud de  │
│   Corrección    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validación    │
│   Técnica       │
└────────┬────────┘
         │
         ▼
     ┌───┴───┐
     │ ¿Crítico? │
     └───┬───┘
         │
    Sí───┼───No
         │         │
         ▼         ▼
┌─────────────┐  ┌────────────┐
│ Aprobación  │  │  Aplicar   │
│ Cumplimiento│  │  Corrección│
└──────┬──────┘  └─────┬──────┘
       │                │
       ▼                │
┌─────────────┐         │
│   Aplicar   │         │
│  Corrección │◄────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Auditoría  │
│  + Historial│
└─────────────┘
```

### 10.2 Tipos de Corrección

#### 10.2.1 Correcciones Menores (Sin Aprobación)

**Ejemplos:**

- Corrección de mayúsculas/minúsculas
- Agregar segundo apellido
- Actualizar teléfono o email
- Agregar dirección adicional

**Requisitos:**

- Justificación obligatoria
- Auditoría completa
- Notificación al Data Steward

#### 10.2.2 Correcciones Mayores (Con Aprobación)

**Ejemplos:**

- Cambio de documento de identidad
- Cambio de nivel de riesgo
- Cambio de clasificación PEP
- Modificación de datos en expediente aprobado

**Requisitos:**

- Solicitud formal
- Documentación de respaldo
- Justificación detallada
- Aprobación del Oficial de Cumplimiento
- Auditoría extendida

### 10.3 Implementación

```java
@Entity
@Table(name = "data_correction_requests")
public class DataCorrectionRequest {
    
    @Id
    private String requestId;  // DCR-2024-00001
    
    @Enumerated(EnumType.STRING)
    private CorrectionType correctionType; // MINOR, MAJOR
    
    private String affectedEntity;    // Dossier, RiskEvaluation, etc.
    private String affectedEntityId;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode fieldChanges;    // { "field": {"old": "...", "new": "..."} }
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification;
    
    private String requestedBy;
    private LocalDateTime requestedAt;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status;     // PENDING, APPROVED, REJECTED, APPLIED
    
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    
    private String appliedBy;
    private LocalDateTime appliedAt;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode supportingDocuments;  // Array de adjuntos
}
```

---

## 11. VISTA DE EVIDENCIA DE CALIDAD

### 11.1 Propósito

Proporcionar a auditores internos y reguladores una vista consolidada de:

- Madurez del gobierno de datos
- Controles de calidad implementados
- Historial de mejoras
- Cumplimiento normativo

### 11.2 Componentes

#### 11.2.1 Resumen de Controles

```typescript
interface QualityControlSummary {
  preventiveControls: {
    totalValidationRules: number;
    activeValidationRules: number;
    validationCoverage: number;     // % campos con validación
  };
  detectiveControls: {
    scheduledChecks: CheckSchedule[];
    lastExecutionDate: string;
    issuesDetectedLast30Days: number;
  };
  correctiveControls: {
    averageCorrectionTime: number;   // horas
    pendingCorrections: number;
    completedCorrectionsLast30Days: number;
  };
}
```

#### 11.2.2 Historial de Mejoras

```typescript
interface ImprovementHistory {
  period: string;                    // "2024-Q4"
  metrics: {
    completenessImprovement: number; // %
    accuracyImprovement: number;     // %
    timeliness Improvement: number;   // %
  };
  initiatives: {
    initiativeName: string;
    implementationDate: string;
    impact: string;
    status: string;
  }[];
}
```

#### 11.2.3 Compliance Evidence

```typescript
interface ComplianceEvidence {
  regulatoryRequirement: string;     // "SUDEBAN Circular 162/2018"
  control: string;                   // Descripción del control
  evidence: {
    evidenceType: string;            // "Audit Log", "Report", "Screenshot"
    evidenceDate: string;
    evidenceLocation: string;        // URL o path
  }[];
  complianceStatus: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
  lastReviewDate: string;
  nextReviewDate: string;
}
```

### 11.3 Acceso de Solo Lectura

**Roles Autorizados:**

- AUDITOR
- REGULATOR
- COMPLIANCE_OFFICER (lectura/escritura)

**Restricciones:**

- No permite modificación de datos
- No permite eliminación de registros
- Exportación permitida (PDF, Excel)
- Auditoría de accesos

---

## 12. AUDITORÍA Y CUMPLIMIENTO

### 12.1 Eventos Auditables

**Categorías de Eventos:**

| Categoría | Ejemplos | Nivel Mínimo |
|-----------|----------|--------------|
| `AUTHENTICATION` | Login, logout, cambio contraseña | INFO |
| `DOSSIER_MANAGEMENT` | Crear, actualizar, aprobar expediente | INFO |
| `RISK_EVALUATION` | Evaluar riesgo, override manual | INFO |
| `DUE_DILIGENCE` | Cargar documento, aprobar, rechazar | INFO |
| `SCREENING` | Ejecutar screening, resolver match | INFO |
| `PEP_MANAGEMENT` | Identificar PEP, actualizar estado | INFO |
| `ALERT_MANAGEMENT` | Crear, asignar, cerrar alerta | INFO |
| `DATA_QUALITY` | Detectar inconsistencia, solicitar corrección | WARNING |
| `SECURITY` | Intento acceso no autorizado, cambio permisos | WARNING |
| `CRITICAL_CHANGE` | Modificar expediente aprobado, cambiar configuración | CRITICAL |

### 12.2 Retención de Datos

**Política de Retención:**

| Tipo de Dato | Período Mínimo | Base Legal |
|--------------|----------------|------------|
| Expedientes activos | Indefinido | SUDEBAN |
| Expedientes cerrados | 10 años | Ley de Legitimación de Capitales |
| Evaluaciones de riesgo | 10 años | SUDEBAN |
| Documentos adjuntos | 10 años | SUDEBAN |
| Auditoría inmutable | 10 años | Ley Orgánica de Drogas |
| Alertas cerradas | 10 años | UNIF |
| Screening histórico | 10 años | SUDEBAN |

### 12.3 Exportación para Reguladores

**Formato:** JSON Lines (.jsonl) o CSV

**Contenido:**

- Datos completos (sin anonimización)
- Historial completo de cambios
- Auditoría de accesos
- Firmas digitales (hash chain)

**Validación de Integridad:**

```bash
# Validar cadena de hash
curl -X POST /api/audit/verify-integrity \
  -H "Authorization: Bearer $REGULATOR_TOKEN" \
  -d '{
    "from": "2024-01-01",
    "to": "2024-12-31"
  }'

# Respuesta
{
  "integrity": "VALID",
  "recordsChecked": 125847,
  "hashChainValid": true,
  "firstRecord": "AUD-2024-0000000001",
  "lastRecord": "AUD-2024-0000125847"
}
```

---

## 13. MEJORA CONTINUA

### 13.1 Ciclo de Mejora

```
┌─────────────┐
│   PLANEAR   │
│ Identificar │
│  Brechas    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   HACER     │
│ Implementar │
│  Controles  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  VERIFICAR  │
│   Medir     │
│ Efectividad │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ACTUAR    │
│  Ajustar    │
│  Procesos   │
└──────┬──────┘
       │
       └──────┐
              │
       ┌──────▼──────┐
       │  PLANEAR    │
       │  (siguiente │
       │   ciclo)    │
       └─────────────┘
```

### 13.2 Revisión Trimestral

**Agenda:**

1. Revisión de KPIs de calidad
2. Análisis de incidentes de calidad
3. Evaluación de controles
4. Propuestas de mejora
5. Asignación de responsables
6. Seguimiento de acciones previas

**Participantes:**

- Oficial de Cumplimiento (chair)
- Gerente de Cumplimiento
- Jefe de Tecnología
- Auditor Interno
- Data Stewards

### 13.3 Capacitación Continua

**Programa de Capacitación:**

- **Inicial** (al incorporarse):
  - Introducción al gobierno de datos
  - Políticas de calidad
  - Herramientas del sistema

- **Anual**:
  - Actualización normativa
  - Nuevas funcionalidades
  - Lecciones aprendidas

- **Ad-hoc**:
  - Cambios regulatorios
  - Nuevos módulos
  - Incidentes críticos

---

## 14. CONCLUSIONES

El Modelo de Gobierno de Datos del SIAR establece un marco robusto para:

✅ **Integridad**: Datos exactos, completos y verificados  
✅ **Trazabilidad**: Historial completo e inmutable  
✅ **Responsabilidad**: Roles claros y definidos  
✅ **Calidad**: Controles preventivos, detectivos y correctivos  
✅ **Cumplimiento**: Alineado con normativa venezolana  
✅ **Mejora Continua**: Ciclo de revisión y optimización

**Implementación:**

- ✅ Modelo de datos robusto (ya implementado)
- ✅ Auditoría inmutable (ya implementado)
- ✅ Versionamiento completo (ya implementado)
- ⚠️ Catálogos maestros (requiere interfaz de usuario)
- ⚠️ Dashboard de calidad (requiere desarrollo)
- ⚠️ Motor de reglas (requiere expansión)

**Próximos Pasos:**

1. Implementar UI para gestión de catálogos maestros
2. Desarrollar dashboard de calidad de datos
3. Expandir motor de reglas de validación
4. Crear reportes de evidencia para reguladores
5. Capacitar a usuarios en políticas de calidad

---

**Aprobado por:**  
Oficial de Cumplimiento  
Seguros La Occidental de Venezuela

**Fecha de Vigencia:** Enero 2025  
**Próxima Revisión:** Abril 2025
