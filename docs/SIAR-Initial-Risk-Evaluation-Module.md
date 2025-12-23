# SIAR - Módulo de Evaluación Inicial de Riesgos

## Tabla de Contenido
1. [Visión General](#1-visión-general)
2. [Arquitectura del Módulo](#2-arquitectura-del-módulo)
3. [Modelo de Datos](#3-modelo-de-datos)
4. [Factores de Riesgo Obligatorios](#4-factores-de-riesgo-obligatorios)
5. [Lógica de Consolidación](#5-lógica-de-consolidación)
6. [Sistema de Versionamiento](#6-sistema-de-versionamiento)
7. [Integración con Otros Módulos](#7-integración-con-otros-módulos)
8. [APIs REST](#8-apis-rest)
9. [Reglas de Negocio](#9-reglas-de-negocio)
10. [Auditoría y Trazabilidad](#10-auditoría-y-trazabilidad)
11. [Casos de Uso](#11-casos-de-uso)
12. [Testing y Validación](#12-testing-y-validación)
13. [Preparación para Inspecciones](#13-preparación-para-inspecciones)

---

## 1. Visión General

### 1.1 Propósito

El **Módulo de Evaluación Inicial de Riesgos** es el componente central del SIAR que ejecuta la evaluación de riesgos obligatoria para cada expediente, producto y región geográfica. Este módulo:

- Evalúa 6 factores de riesgo obligatorios usando una escala configurable de 0 a 5
- Permite ponderación manual y ajustes por el Oficial de Cumplimiento
- Consolida el riesgo en categorías Bajo, Medio o Alto
- Mantiene historial completo y versionado de todas las evaluaciones
- Genera alertas automáticas sin bloquear operaciones
- Proporciona trazabilidad completa para inspecciones regulatorias

### 1.2 Principios Arquitectónicos

- **Solo Alerta, No Bloquea**: El sistema registra y alerta, pero no impide operaciones
- **Trazabilidad Total**: Cada evaluación, ajuste y decisión es registrada de forma inmutable
- **Ponderación Configurable**: Pesos y umbrales ajustables por el Oficial de Cumplimiento
- **Versionamiento Completo**: Todas las evaluaciones son versionadas y auditables
- **Integración Fluida**: Se integra con Expedientes, RBAC, Alertas y Auditoría

### 1.3 Alcance de la Evaluación

La evaluación de riesgos es **obligatoria** para:

1. **Cada Expediente**: Cliente, Intermediario, Proveedor, etc.
2. **Cada Producto**: Asociado al expediente
3. **Cada Región Geográfica**: Donde opera el sujeto

---

## 2. Arquitectura del Módulo

### 2.1 Componentes Principales

```
┌──────────────────────────────────────────────────────────────┐
│                     RISK EVALUATION MODULE                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          RiskEvaluationController (REST)            │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    │                                          │
│  ┌─────────────────▼───────────────────────────────────┐    │
│  │          RiskEvaluationService (Business)           │    │
│  │  - createInitialEvaluation()                        │    │
│  │  - updateEvaluation()                               │    │
│  │  - applyManualOverride()                            │    │
│  │  - triggerReevaluation()                            │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    │                                          │
│  ┌─────────────────▼───────────────────────────────────┐    │
│  │      RiskCalculationEngine (Calculation Logic)      │    │
│  │  - calculateRisk()                                  │    │
│  │  - consolidateRiskLevel()                           │    │
│  │  - applyMitigationFactor()                          │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    │                                          │
│  ┌─────────────────▼───────────────────────────────────┐    │
│  │    RiskEvaluationRepository (Data Access)           │    │
│  │    RiskConfigurationRepository                      │    │
│  │    EvaluationHistoryRepository                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
  │  Dossier    │   │    Alerts    │   │   Audit      │
  │  Module     │   │    Module    │   │   Module     │
  └─────────────┘   └──────────────┘   └──────────────┘
```

### 2.2 Flujo de Evaluación

```
1. Creación de Expediente
         │
         ▼
2. Solicitud de Evaluación Inicial
         │
         ▼
3. Recolección de Factores de Riesgo
   - Riesgo del Sujeto
   - Riesgo del Producto
   - Riesgo del Canal
   - Riesgo Geográfico
   - Controles Internos
   - Condición PEP
         │
         ▼
4. Cálculo Automático
   - Puntaje por categoría
   - Puntaje bruto consolidado
   - Aplicación de mitigación
   - Determinación de nivel
         │
         ▼
5. Resultado Preliminar
   (BAJO / MEDIO / ALTO)
         │
         ▼
6. Revisión por Oficial de Cumplimiento
   - ¿Ajuste necesario? ─── SÍ ──▶ Justificación + Override
         │                                │
         NO                               │
         │                                │
         ▼                                ▼
7. Resultado Final Confirmado
         │
         ▼
8. Generación de Alertas (si aplica)
         │
         ▼
9. Registro en Historial (Inmutable)
```

---

## 3. Modelo de Datos

### 3.1 Entidades Principales

#### RiskEvaluation (Evaluación de Riesgo)

Entidad principal que representa una evaluación de riesgo completa.

**Campos**:
- `evaluationId` (PK): Identificador único de la evaluación
- `dossierId` (FK): Expediente evaluado
- `evaluationType`: INITIAL, PERIODIC, TRIGGERED, MANUAL
- `evaluationDate`: Fecha y hora de la evaluación
- `evaluatorUserId` (FK): Usuario que ejecutó la evaluación
- `version`: Número de versión de esta evaluación
- `status`: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, SUPERSEDED
- `riskFactorsJson`: JSON con todos los factores evaluados (JSONB)
- `calculationResultJson`: JSON con resultados del cálculo (JSONB)
- `configurationId` (FK): Configuración usada para el cálculo
- `preliminaryRiskLevel`: BAJO, MEDIO, ALTO (resultado automático)
- `finalRiskLevel`: BAJO, MEDIO, ALTO (resultado final tras revisión)
- `hasManualOverride`: Indica si hubo ajuste manual
- `manualOverrideJustification`: Justificación del ajuste
- `overrideAppliedBy` (FK): Usuario que aplicó el override
- `overrideAppliedAt`: Fecha del override
- `requiresEnhancedDueDiligence`: Flag para debida diligencia reforzada
- `requiresApproval`: Flag de aprobación requerida
- `approvalLevel`: Nivel de aprobación necesario
- `approvedBy` (FK): Usuario que aprobó
- `approvedAt`: Fecha de aprobación
- `rejectionReason`: Razón de rechazo si aplica
- `nextReviewDate`: Fecha de próxima revisión
- `createdAt`: Timestamp de creación
- `updatedAt`: Timestamp de última actualización

**Relaciones**:
- `ManyToOne` con `Dossier`
- `ManyToOne` con `User` (evaluator, overrideAppliedBy, approvedBy)
- `ManyToOne` con `RiskConfiguration`
- `OneToMany` con `EvaluationHistory`
- `OneToMany` con `RiskAlert`

#### RiskConfiguration (Configuración de Riesgo)

Define pesos y umbrales configurables para el cálculo de riesgo.

**Campos**:
- `configurationId` (PK): Identificador único
- `configurationName`: Nombre descriptivo
- `version`: Versión de la configuración
- `effectiveFrom`: Fecha desde la cual aplica
- `effectiveTo`: Fecha hasta la cual aplica (null = vigente)
- `categoryWeightsJson`: JSON con pesos por categoría (JSONB)
- `factorWeightsJson`: JSON con pesos por factor (JSONB)
- `thresholdsJson`: JSON con umbrales de consolidación (JSONB)
- `isActive`: Indica si está activa
- `createdBy` (FK): Usuario creador
- `createdAt`: Timestamp de creación
- `approvedBy` (FK): Usuario que aprobó
- `approvedAt`: Timestamp de aprobación

**Estructura JSON de categoryWeightsJson**:
```json
{
  "SUBJECT_RISK": 35,
  "PRODUCT_RISK": 20,
  "CHANNEL_RISK": 15,
  "GEOGRAPHIC_RISK": 20,
  "INTERNAL_CONTROLS": 10
}
```

**Estructura JSON de factorWeightsJson**:
```json
{
  "SUBJECT_RISK": {
    "personType": 20,
    "economicActivity": 30,
    "fundsOrigin": 25,
    "beneficiaryComplexity": 15,
    "pepStatus": 10
  },
  "PRODUCT_RISK": { ... },
  "CHANNEL_RISK": { ... },
  "GEOGRAPHIC_RISK": { ... },
  "INTERNAL_CONTROLS": { ... }
}
```

**Estructura JSON de thresholdsJson**:
```json
{
  "lowToMedium": 2.0,
  "mediumToHigh": 3.5
}
```

#### EvaluationHistory (Historial de Evaluación)

Registro inmutable de cada cambio en una evaluación.

**Campos**:
- `historyId` (PK): Identificador único
- `evaluationId` (FK): Evaluación relacionada
- `changeType`: CREATED, UPDATED, OVERRIDE_APPLIED, APPROVED, REJECTED, SUPERSEDED
- `changedBy` (FK): Usuario que realizó el cambio
- `changedAt`: Timestamp del cambio
- `previousStateJson`: Estado anterior (JSONB)
- `newStateJson`: Estado nuevo (JSONB)
- `changeJustification`: Justificación del cambio
- `affectedFields`: Lista de campos modificados

**Propiedades**:
- Tabla de solo inserción (append-only)
- Sin deletes ni updates permitidos
- Indexada por evaluationId y changedAt

#### RiskFactor (Factor de Riesgo)

Catálogo de factores de riesgo disponibles.

**Campos**:
- `factorId` (PK): Identificador único
- `factorCode`: Código único del factor
- `factorName`: Nombre descriptivo
- `factorCategory`: SUBJECT_RISK, PRODUCT_RISK, CHANNEL_RISK, GEOGRAPHIC_RISK, INTERNAL_CONTROLS
- `factorDescription`: Descripción detallada
- `scaleMin`: Valor mínimo de la escala (0)
- `scaleMax`: Valor máximo de la escala (5)
- `isActive`: Indica si está activo
- `requiresJustification`: Si requiere justificación obligatoria
- `createdAt`: Timestamp de creación
- `updatedAt`: Timestamp de actualización

#### RiskFactorValue (Valor de Factor)

Almacena el valor asignado a un factor en una evaluación específica.

**Campos**:
- `factorValueId` (PK): Identificador único
- `evaluationId` (FK): Evaluación relacionada
- `factorId` (FK): Factor evaluado
- `value`: Valor asignado (0-5)
- `label`: Etiqueta (NO_APLICA, MUY_BAJO, BAJO, MEDIO, ALTO, MUY_ALTO)
- `justification`: Justificación del valor asignado
- `evidenceAttachments`: Lista de documentos adjuntos como evidencia
- `assignedBy` (FK): Usuario que asignó el valor
- `assignedAt`: Timestamp de asignación

**Relaciones**:
- `ManyToOne` con `RiskEvaluation`
- `ManyToOne` con `RiskFactor`
- `ManyToOne` con `User` (assignedBy)

#### RiskAlert (Alerta de Riesgo)

Alertas generadas por evaluaciones de riesgo.

**Campos**:
- `alertId` (PK): Identificador único
- `evaluationId` (FK): Evaluación que generó la alerta
- `alertType`: HIGH_RISK, MEDIUM_RISK, PEP_DETECTED, ENHANCED_DD_REQUIRED, etc.
- `severity`: LOW, MEDIUM, HIGH, CRITICAL
- `alertMessage`: Mensaje descriptivo
- `generatedAt`: Timestamp de generación
- `assignedTo` (FK): Usuario asignado (típicamente Oficial de Cumplimiento)
- `status`: OPEN, IN_REVIEW, RESOLVED, DISMISSED
- `resolvedBy` (FK): Usuario que resolvió
- `resolvedAt`: Timestamp de resolución
- `resolutionNotes`: Notas de resolución

### 3.2 Diagrama Entidad-Relación

```
┌──────────────────┐         ┌──────────────────┐
│   Dossier        │────┬───▶│ RiskEvaluation   │
└──────────────────┘    │    │ (versioned)      │
                        │    └────────┬─────────┘
                        │             │
┌──────────────────┐    │    ┌────────▼─────────┐
│   User           │◀───┼────│EvaluationHistory │
│ (evaluator)      │    │    │  (append-only)   │
└──────────────────┘    │    └──────────────────┘
                        │
┌──────────────────┐    │    ┌──────────────────┐
│RiskConfiguration │◀───┴───▶│ RiskFactorValue  │
│ (configurable)   │         └────────┬─────────┘
└──────────────────┘                  │
                                      │
                             ┌────────▼─────────┐
                             │   RiskFactor     │
                             │   (catalog)      │
                             └──────────────────┘

                        ┌──────────────────┐
                        │   RiskAlert      │
                        │  (auto-generated)│
                        └──────────────────┘
```

---

## 4. Factores de Riesgo Obligatorios

### 4.1 Categoría: Riesgo del Sujeto (SUBJECT_RISK)

#### 4.1.1 Tipo de Persona (personType)

**Descripción**: Naturaleza jurídica del sujeto evaluado.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Persona natural venezolana, sin complejidad |
| 2 | BAJO | Persona jurídica local simple (< 5 accionistas) |
| 3 | MEDIO | Persona jurídica con estructura moderada (5-20 accionistas) |
| 4 | ALTO | Persona jurídica compleja (> 20 accionistas o multinacional) |
| 5 | MUY_ALTO | Fideicomiso, trust, estructuras offshore |

**Justificación Requerida**: Siempre para valores ≥ 4

#### 4.1.2 Actividad Económica (economicActivity)

**Descripción**: Sector económico según clasificación CIIU y matriz de riesgo regulatoria.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Educación, salud, servicios profesionales tradicionales |
| 2 | BAJO | Comercio minorista, manufactura básica |
| 3 | MEDIO | Construcción, transporte, comercio exterior |
| 4 | ALTO | Minería, cambio de divisas, compraventa de metales preciosos |
| 5 | MUY_ALTO | Casinos, juegos de azar, actividades financieras no reguladas |

**Justificación Requerida**: Siempre

**Fuente de Datos**: Código CIIU + Matriz de Riesgo Sectorial SUDEASEG

#### 4.1.3 Origen de los Fondos (fundsOrigin)

**Descripción**: Fuentes de ingresos y patrimonio del sujeto.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Salario verificable, pensión, ingresos públicos documentados |
| 2 | BAJO | Ingresos por negocio propio verificable con declaraciones fiscales |
| 3 | MEDIO | Mezcla de fuentes, algunas no verificables completamente |
| 4 | ALTO | Fondos provenientes de zonas de alto riesgo o actividades sensibles |
| 5 | MUY_ALTO | Fondos no explicados, origen desconocido, transacciones en efectivo |

**Justificación Requerida**: Siempre para valores ≥ 3

#### 4.1.4 Complejidad del Beneficiario Final (beneficiaryComplexity)

**Descripción**: Capas de propiedad hasta llegar al beneficiario final.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | Persona natural (no hay estructura) |
| 1 | MUY_BAJO | 1 capa, 1-3 beneficiarios claramente identificados |
| 2 | BAJO | 1-2 capas, 4-10 beneficiarios identificados |
| 3 | MEDIO | 2-3 capas, 11-20 beneficiarios o algunos en el extranjero |
| 4 | ALTO | 3-4 capas, > 20 beneficiarios, estructuras internacionales |
| 5 | MUY_ALTO | > 4 capas, beneficiarios no identificables, paraísos fiscales |

**Justificación Requerida**: Siempre para valores ≥ 3

#### 4.1.5 Condición PEP (pepStatus)

**Descripción**: Si el sujeto, accionista o beneficiario es Persona Expuesta Políticamente.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | Ningún PEP identificado |
| 1 | MUY_BAJO | Ex-PEP (> 2 años fuera del cargo), cargo menor |
| 2 | BAJO | PEP indirecto (familiar lejano) |
| 3 | MEDIO | PEP indirecto (familiar cercano) o vinculado cercano |
| 4 | ALTO | PEP directo activo (cargo de nivel medio) |
| 5 | MUY_ALTO | PEP directo activo (alto cargo: ministro, gobernador, etc.) |

**Justificación Requerida**: Siempre

**Integración**: Se conecta automáticamente con el módulo de Gestión de PEP.

---

### 4.2 Categoría: Riesgo del Producto (PRODUCT_RISK)

#### 4.2.1 Tipo de Producto (productType)

**Descripción**: Clasificación del producto de seguros.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Seguros obligatorios (RCVA), productos estándar masivos |
| 2 | BAJO | Seguros de vida temporal, vehículos, hogar |
| 3 | MEDIO | Seguros de vida con ahorro, seguros empresariales |
| 4 | ALTO | Seguros con componente de inversión, productos estructurados |
| 5 | MUY_ALTO | Productos offshore, seguros de vida con beneficios complejos |

**Justificación Requerida**: Siempre para valores ≥ 4

#### 4.2.2 Uso del Producto (productUsage)

**Descripción**: Propósito declarado para la contratación del producto.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Protección personal/familiar básica |
| 2 | BAJO | Protección patrimonial estándar |
| 3 | MEDIO | Inversión y protección combinadas |
| 4 | ALTO | Estructuración patrimonial compleja |
| 5 | MUY_ALTO | Uso no claro, cambios frecuentes de beneficiarios |

**Justificación Requerida**: Siempre para valores ≥ 3

#### 4.2.3 Complejidad del Producto (productComplexity)

**Descripción**: Nivel de sofisticación y dificultad de comprensión del producto.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Producto simple, términos claros, sin componentes adicionales |
| 2 | BAJO | Producto con coberturas adicionales opcionales |
| 3 | MEDIO | Producto con componente de ahorro o inversión básica |
| 4 | ALTO | Producto estructurado, múltiples componentes, inversiones complejas |
| 5 | MUY_ALTO | Producto altamente complejo, difícil de explicar al cliente |

**Justificación Requerida**: Siempre para valores ≥ 4

---

### 4.3 Categoría: Riesgo del Canal de Distribución (CHANNEL_RISK)

#### 4.3.1 Canal de Distribución (distributionChannel)

**Descripción**: Medio por el cual se comercializa el producto.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Venta directa en oficina con KYC completo |
| 2 | BAJO | Red de agentes propios certificados |
| 3 | MEDIO | Intermediarios/corredores autorizados con supervisión |
| 4 | ALTO | Canales digitales sin verificación presencial |
| 5 | MUY_ALTO | Intermediarios no regulados, ventas en zonas de alto riesgo |

**Justificación Requerida**: Siempre para valores ≥ 4

#### 4.3.2 Controles del Canal (channelControls)

**Descripción**: Mecanismos de control implementados en el canal.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Sin controles específicos |
| 2 | BAJO | Controles básicos de documentación |
| 3 | MEDIO | KYC estándar, verificación de identidad |
| 4 | ALTO | KYC reforzado, monitoreo periódico del canal |
| 5 | MUY_ALTO | KYC exhaustivo, auditoría continua, tecnología avanzada |

**Justificación Requerida**: Siempre

**Nota**: Valor alto en controles **reduce** el riesgo (efecto de mitigación).

---

### 4.4 Categoría: Riesgo Geográfico (GEOGRAPHIC_RISK)

#### 4.4.1 Riesgo País (countryRisk)

**Descripción**: Evaluación del país de domicilio según GAFI y listas internacionales.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | País con calificación GAFI "Compliant", bajo riesgo |
| 2 | BAJO | País con sistema AML robusto, cooperación internacional |
| 3 | MEDIO | País con deficiencias menores en marco AML |
| 4 | ALTO | País con deficiencias significativas, lista gris GAFI |
| 5 | MUY_ALTO | País en lista negra GAFI, no cooperante, paraíso fiscal |

**Justificación Requerida**: Siempre

**Fuente de Datos**: Listas GAFI, OFAC, evaluaciones internacionales

#### 4.4.2 Región de Alto Riesgo Venezuela (highRiskRegion)

**Descripción**: Regiones identificadas por SUDEASEG como alto riesgo dentro de Venezuela.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | Región no identificada como alto riesgo |
| 1 | MUY_BAJO | - |
| 2 | BAJO | Región con riesgo bajo |
| 3 | MEDIO | Región con incidencia moderada de actividades ilícitas |
| 4 | ALTO | Región fronteriza o zona identificada por SUDEASEG |
| 5 | MUY_ALTO | Región en lista crítica (Arco Minero, fronteras activas) |

**Justificación Requerida**: Siempre para valores ≥ 4

#### 4.4.3 Zona Fronteriza (borderZone)

**Descripción**: Proximidad a fronteras internacionales.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | Más de 50 km de cualquier frontera |
| 1 | MUY_BAJO | - |
| 2 | BAJO | 30-50 km de frontera |
| 3 | MEDIO | 15-30 km de frontera |
| 4 | ALTO | 5-15 km de frontera |
| 5 | MUY_ALTO | Menos de 5 km de frontera activa |

**Justificación Requerida**: Siempre para valores > 0

#### 4.4.4 Arco Minero del Orinoco (miningArc)

**Descripción**: Operaciones en la zona del Arco Minero.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | Fuera del Arco Minero |
| 5 | MUY_ALTO | Dentro del Arco Minero (riesgo automático muy alto) |

**Justificación Requerida**: Siempre si valor = 5

**Nota**: Por normativa, cualquier operación en el Arco Minero es automáticamente calificada como riesgo MUY_ALTO.

#### 4.4.5 Proximidad a Centros Penitenciarios (prisonProximity)

**Descripción**: Cercanía a cárceles o centros de reclusión.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | Más de 5 km de cualquier centro penitenciario |
| 3 | MEDIO | 2-5 km de centro penitenciario |
| 5 | MUY_ALTO | Menos de 2 km de centro penitenciario |

**Justificación Requerida**: Siempre para valores > 0

---

### 4.5 Categoría: Controles Internos (INTERNAL_CONTROLS)

#### 4.5.1 Existencia de Controles (controlExistence)

**Descripción**: Implementación de políticas y procedimientos de control.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Sin controles documentados |
| 2 | BAJO | Controles básicos sin formalización |
| 3 | MEDIO | Controles documentados, implementación parcial |
| 4 | ALTO | Controles formalizados, implementación completa |
| 5 | MUY_ALTO | Controles exhaustivos, tecnología avanzada, auditoría continua |

**Justificación Requerida**: Siempre

**Nota**: Valores altos en controles internos **reducen** el riesgo consolidado (efecto mitigante).

#### 4.5.2 Efectividad de Controles (controlEffectiveness)

**Descripción**: Capacidad de los controles para mitigar riesgos.

**Escala de Valoración**:
| Valor | Etiqueta | Criterio |
|-------|----------|----------|
| 0 | NO_APLICA | - |
| 1 | MUY_BAJO | Controles inefectivos, no funcionan |
| 2 | BAJO | Controles funcionan ocasionalmente |
| 3 | MEDIO | Controles funcionan la mayoría del tiempo |
| 4 | ALTO | Controles efectivos, alta tasa de detección |
| 5 | MUY_ALTO | Controles preventivos y detectivos, alta efectividad probada |

**Justificación Requerida**: Siempre

---

## 5. Lógica de Consolidación

### 5.1 Metodología de Cálculo

El sistema utiliza un **modelo de ponderación configurable** que consolida el riesgo en 4 pasos:

#### Paso 1: Cálculo del Puntaje por Categoría

Para cada categoría de riesgo (Sujeto, Producto, Canal, Geográfico, Controles):

```
Puntaje_Categoría = Σ(Factor_i × Peso_i) / Σ(Peso_i aplicables)
```

**Donde**:
- `Factor_i`: Valor del factor individual (0-5)
- `Peso_i`: Peso asignado a ese factor en la configuración
- Solo se consideran factores donde `Factor_i > 0` (aplica al caso)

**Ejemplo**:

Si en la categoría **Riesgo del Sujeto**:
- `personType = 2` con peso 20
- `economicActivity = 3` con peso 30
- `fundsOrigin = 2` con peso 25
- `beneficiaryComplexity = 1` con peso 15
- `pepStatus = 4` con peso 10

Entonces:
```
Puntaje_Sujeto = (2×20 + 3×30 + 2×25 + 1×15 + 4×10) / (20 + 30 + 25 + 15 + 10)
               = (40 + 90 + 50 + 15 + 40) / 100
               = 235 / 100
               = 2.35
```

#### Paso 2: Aplicación de Pesos Categoriales

Cada categoría tiene un peso en la evaluación total:

```
Puntaje_Bruto = Σ(Puntaje_Categoría_j × Peso_Categoría_j) / 100
```

**Pesos por defecto** (configurables):
- Riesgo del Sujeto: 35%
- Riesgo del Producto: 20%
- Riesgo del Canal: 15%
- Riesgo Geográfico: 20%
- Controles Internos: 10%

**Ejemplo**:

Si los puntajes de categoría son:
- Sujeto: 2.35 → Ponderado: 2.35 × 0.35 = 0.8225
- Producto: 1.67 → Ponderado: 1.67 × 0.20 = 0.334
- Canal: 2.50 → Ponderado: 2.50 × 0.15 = 0.375
- Geográfico: 3.67 → Ponderado: 3.67 × 0.20 = 0.734
- Controles: 3.00 → Ponderado: 3.00 × 0.10 = 0.300

Entonces:
```
Puntaje_Bruto = 0.8225 + 0.334 + 0.375 + 0.734 + 0.300
               = 2.5655
```

#### Paso 3: Aplicación del Factor de Mitigación

Los **Controles Internos fuertes reducen el riesgo**:

```
Factor_Mitigación = 1 - (Puntaje_Controles_Internos / 10)
Puntaje_Ajustado = Puntaje_Bruto × Factor_Mitigación
```

**Ejemplo**:

Si `Puntaje_Controles_Internos = 3.0`:
```
Factor_Mitigación = 1 - (3.0 / 10) = 1 - 0.30 = 0.70
Puntaje_Ajustado = 2.5655 × 0.70 = 1.7958
```

**Interpretación**:
- Controles débiles (puntaje bajo) → Factor cercano a 1 → Poco efecto mitigante
- Controles fuertes (puntaje alto) → Factor cercano a 0.5 → Gran efecto mitigante

#### Paso 4: Clasificación del Nivel de Riesgo

Se aplican **umbrales configurables** para determinar el nivel final:

```
SI Puntaje_Ajustado ≤ 2.0          → BAJO
SI 2.0 < Puntaje_Ajustado ≤ 3.5   → MEDIO
SI Puntaje_Ajustado > 3.5         → ALTO
```

**Ejemplo**:

Con `Puntaje_Ajustado = 1.7958`:
```
1.7958 ≤ 2.0 → Nivel de Riesgo = BAJO
```

### 5.2 Resultado de la Consolidación

El motor de cálculo genera un objeto `RiskCalculationResult` con:

```json
{
  "categoryScores": {
    "subjectRisk": {
      "rawScore": 2.35,
      "weightedScore": 0.8225,
      "weight": 35
    },
    "productRisk": {
      "rawScore": 1.67,
      "weightedScore": 0.334,
      "weight": 20
    },
    "channelRisk": {
      "rawScore": 2.50,
      "weightedScore": 0.375,
      "weight": 15
    },
    "geographicRisk": {
      "rawScore": 3.67,
      "weightedScore": 0.734,
      "weight": 20
    },
    "internalControls": {
      "rawScore": 3.00,
      "weightedScore": 0.300,
      "weight": 10
    }
  },
  "grossScore": 2.5655,
  "mitigationFactor": 0.70,
  "adjustedScore": 1.7958,
  "preliminaryRiskLevel": "BAJO",
  "calculationMethod": "WEIGHTED_AVERAGE_WITH_MITIGATION",
  "configurationVersion": "CFG-2024-001",
  "calculatedAt": "2024-01-15T10:30:00Z"
}
```

### 5.3 Override Manual del Resultado

El **Oficial de Cumplimiento** puede modificar el resultado preliminar por razones justificadas:

**Casos de Override**:
1. **Información cualitativa no capturada**: Elementos que el modelo cuantitativo no considera
2. **Contexto específico del cliente**: Situaciones particulares que modifican el riesgo
3. **Criterio profesional**: Experiencia del oficial detecta riesgo no evidente
4. **Información de inteligencia**: Datos de fuentes confiables no sistematizados

**Restricciones**:
- Solo el rol `COMPLIANCE_OFFICER` puede aplicar overrides
- Requiere justificación detallada (mínimo 50 caracteres)
- Se registra en historial inmutable
- Genera auditoría automática
- Requiere aprobación de supervisor si cambia de BAJO a ALTO o viceversa

**Estructura de Override**:
```json
{
  "evaluationId": "EVAL-2024-000123",
  "preliminaryRiskLevel": "BAJO",
  "finalRiskLevel": "MEDIO",
  "hasManualOverride": true,
  "manualOverrideJustification": "A pesar del puntaje automático bajo, se detectó mediante inteligencia que uno de los beneficiarios finales tiene vínculos con actividades de alto riesgo no reflejadas en la estructura formal de la empresa. Se eleva a MEDIO y se solicita debida diligencia reforzada.",
  "overrideAppliedBy": "user-oficial-cumplimiento",
  "overrideAppliedAt": "2024-01-15T14:45:00Z",
  "requiresSupervisorApproval": false
}
```

---

## 6. Sistema de Versionamiento

### 6.1 Versionamiento de Evaluaciones

Cada expediente puede tener **múltiples versiones de evaluación** a lo largo del tiempo:

**Tipos de Evaluación**:
1. **INITIAL**: Evaluación inicial al crear el expediente
2. **PERIODIC**: Reevaluación periódica programada
3. **TRIGGERED**: Reevaluación disparada por cambio significativo
4. **MANUAL**: Evaluación manual solicitada por Oficial de Cumplimiento

**Numeración de Versiones**:
```
DOS-CLI-2024-000123
  ├─ EVAL-2024-000123-v1 (INITIAL, 2024-01-15)
  ├─ EVAL-2024-000123-v2 (PERIODIC, 2024-07-15)
  └─ EVAL-2024-000123-v3 (TRIGGERED, 2024-09-20)
```

### 6.2 Estados de una Evaluación

| Estado | Descripción |
|--------|-------------|
| DRAFT | Borrador en proceso de elaboración |
| PENDING_REVIEW | Completada, pendiente de revisión por Oficial |
| APPROVED | Aprobada, es la versión vigente |
| REJECTED | Rechazada, requiere corrección |
| SUPERSEDED | Reemplazada por una versión más reciente |

**Flujo de Estados**:
```
DRAFT → PENDING_REVIEW → APPROVED
                 ↓
              REJECTED → DRAFT (corrección)

APPROVED → SUPERSEDED (cuando se crea nueva versión)
```

### 6.3 Versionamiento de Configuraciones

Las configuraciones de ponderación también se versionan:

```json
{
  "configurationId": "CFG-2024-001",
  "configurationName": "Configuración Estándar 2024",
  "version": 1,
  "effectiveFrom": "2024-01-01T00:00:00Z",
  "effectiveTo": null,
  "isActive": true
}
```

**Reglas**:
- Cada evaluación guarda el ID de la configuración usada
- Cambios en configuración no afectan evaluaciones pasadas
- Permite recalcular evaluaciones con configuración anterior
- Facilita auditorías comparando metodologías

### 6.4 Historial Inmutable

Cada cambio en una evaluación genera un registro en `EvaluationHistory`:

```json
{
  "historyId": "HIST-2024-005678",
  "evaluationId": "EVAL-2024-000123-v1",
  "changeType": "OVERRIDE_APPLIED",
  "changedBy": "user-oficial-cumplimiento",
  "changedAt": "2024-01-15T14:45:00Z",
  "previousState": {
    "finalRiskLevel": "BAJO",
    "hasManualOverride": false
  },
  "newState": {
    "finalRiskLevel": "MEDIO",
    "hasManualOverride": true,
    "manualOverrideJustification": "..."
  },
  "affectedFields": ["finalRiskLevel", "hasManualOverride", "manualOverrideJustification"],
  "changeJustification": "Aplicación de override por información de inteligencia"
}
```

**Propiedades del Historial**:
- **Append-only**: Solo inserciones, sin updates ni deletes
- **Inmutable**: Una vez escrito, no se puede modificar
- **Completo**: Captura estado anterior y nuevo
- **Auditable**: Incluye usuario, timestamp y justificación

---

## 7. Integración con Otros Módulos

### 7.1 Integración con Gestión de Expedientes

**Punto de Integración**: El módulo de Evaluación de Riesgos es invocado por el módulo de Expedientes.

**Flujo**:
1. Se crea un nuevo expediente (Dossier)
2. Se valida completitud de datos necesarios para evaluación
3. Se dispara automáticamente evaluación inicial de riesgo
4. El resultado se almacena en el expediente
5. No se puede aprobar el expediente sin evaluación de riesgo completada

**Dependencias**:
- `dossierId`: ID del expediente a evaluar
- Datos del expediente usados como entrada para factores de riesgo

**Endpoints Relacionados**:
```
POST /dossiers/{dossierId}/risk-evaluation/initial
GET  /dossiers/{dossierId}/risk-evaluation/current
GET  /dossiers/{dossierId}/risk-evaluation/history
```

### 7.2 Integración con Gestión de PEP

**Punto de Integración**: El factor `pepStatus` se alimenta automáticamente del módulo PEP.

**Flujo**:
1. Durante la evaluación, se consulta el módulo PEP por el cliente/beneficiarios
2. Si se detecta un PEP, se asigna automáticamente el valor correspondiente:
   - PEP directo activo alto cargo → 5 (MUY_ALTO)
   - PEP directo activo cargo medio → 4 (ALTO)
   - PEP indirecto familiar cercano → 3 (MEDIO)
   - Ex-PEP → 1-2 (MUY_BAJO / BAJO)
3. Se registra el detalle del PEP en el JSON del factor
4. Se activa bandera `requiresEnhancedDueDiligence` si PEP ≥ 4

**API de Consulta**:
```java
PepInformation pepInfo = pepService.checkPepStatus(clientId);
if (pepInfo.isPep()) {
    int pepRiskValue = mapPepTypeToRiskValue(pepInfo.getPepType(), pepInfo.getPepPosition());
    // Asignar pepRiskValue al factor pepStatus
}
```

### 7.3 Integración con Sistema de Alertas

**Punto de Integración**: Las evaluaciones de riesgo generan alertas automáticas.

**Reglas de Generación de Alertas**:

| Condición | Tipo de Alerta | Severidad | Asignado a |
|-----------|---------------|-----------|------------|
| Riesgo ALTO | HIGH_RISK_EVALUATION | HIGH | Oficial Cumplimiento |
| Riesgo MEDIO | MEDIUM_RISK_EVALUATION | MEDIUM | Oficial Cumplimiento |
| PEP detectado (≥4) | PEP_HIGH_RISK_DETECTED | HIGH | Oficial Cumplimiento |
| Requiere DD reforzada | ENHANCED_DD_REQUIRED | MEDIUM | Analista Cumplimiento |
| Override aplicado | MANUAL_OVERRIDE_APPLIED | LOW | Supervisor Cumplimiento |
| Cambio de BAJO a ALTO | RISK_LEVEL_ESCALATION | CRITICAL | Oficial Cumplimiento + Supervisor |

**Flujo**:
```java
@Service
public class RiskEvaluationService {
    
    @Autowired
    private AlertService alertService;
    
    public RiskEvaluation completeEvaluation(String evaluationId) {
        RiskEvaluation evaluation = repository.findById(evaluationId);
        
        // Generar alertas según resultado
        if (evaluation.getFinalRiskLevel() == RiskLevel.ALTO) {
            alertService.createAlert(AlertType.HIGH_RISK_EVALUATION, evaluation);
        }
        
        if (evaluation.isRequiresEnhancedDueDiligence()) {
            alertService.createAlert(AlertType.ENHANCED_DD_REQUIRED, evaluation);
        }
        
        return evaluation;
    }
}
```

### 7.4 Integración con Sistema de Auditoría

**Punto de Integración**: Cada operación genera eventos de auditoría.

**Eventos Registrados**:

| Evento | Código | Disparado Por |
|--------|--------|---------------|
| Evaluación creada | RISK-001 | createInitialEvaluation() |
| Evaluación actualizada | RISK-002 | updateEvaluation() |
| Override aplicado | RISK-003 | applyManualOverride() |
| Evaluación aprobada | RISK-004 | approveEvaluation() |
| Evaluación rechazada | RISK-005 | rejectEvaluation() |
| Configuración modificada | RISK-006 | updateConfiguration() |
| Reevaluación disparada | RISK-007 | triggerReevaluation() |

**Estructura de Evento**:
```json
{
  "eventId": "AUD-2024-012345",
  "eventType": "RISK-003",
  "eventDescription": "Override manual aplicado a evaluación de riesgo",
  "timestamp": "2024-01-15T14:45:00Z",
  "userId": "user-oficial-cumplimiento",
  "entityType": "RiskEvaluation",
  "entityId": "EVAL-2024-000123-v1",
  "relatedEntityType": "Dossier",
  "relatedEntityId": "DOS-CLI-2024-000123",
  "changes": {
    "finalRiskLevel": {"from": "BAJO", "to": "MEDIO"},
    "hasManualOverride": {"from": false, "to": true}
  },
  "justification": "Información de inteligencia detecta riesgo adicional"
}
```

### 7.5 Integración con RBAC

**Permisos Requeridos**:

| Operación | Permiso | Roles Autorizados |
|-----------|---------|-------------------|
| Ver evaluación | `risk:evaluation:read` | Todos los analistas + Cumplimiento |
| Crear evaluación | `risk:evaluation:create` | Analista Cumplimiento, Oficial Cumplimiento |
| Actualizar evaluación | `risk:evaluation:update` | Analista Cumplimiento, Oficial Cumplimiento |
| Aplicar override | `risk:evaluation:override` | Solo Oficial Cumplimiento |
| Aprobar evaluación | `risk:evaluation:approve` | Oficial Cumplimiento |
| Modificar configuración | `risk:configuration:update` | Solo Oficial Cumplimiento |
| Ver historial | `risk:history:read` | Cumplimiento + Auditoría |

**Implementación**:
```java
@PreAuthorize("hasPermission('risk:evaluation:override')")
public RiskEvaluation applyManualOverride(String evaluationId, OverrideRequest request) {
    // Solo ejecutable por Oficial de Cumplimiento
    ...
}
```

---

## 8. APIs REST

### 8.1 Endpoints Principales

#### POST /api/v1/dossiers/{dossierId}/risk-evaluations/initial

Crea la evaluación inicial de riesgo para un expediente.

**Request**:
```json
{
  "evaluatorUserId": "user-analista-123",
  "riskFactors": {
    "subjectRisk": { ... },
    "productRisk": { ... },
    "channelRisk": { ... },
    "geographicRisk": { ... },
    "internalControls": { ... }
  },
  "comments": "Evaluación inicial completa con toda la documentación disponible"
}
```

**Response** (201 Created):
```json
{
  "evaluationId": "EVAL-2024-000123-v1",
  "dossierId": "DOS-CLI-2024-000123",
  "evaluationType": "INITIAL",
  "version": 1,
  "status": "PENDING_REVIEW",
  "calculationResult": { ... },
  "preliminaryRiskLevel": "BAJO",
  "finalRiskLevel": null,
  "requiresEnhancedDueDiligence": false,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### PUT /api/v1/risk-evaluations/{evaluationId}

Actualiza una evaluación existente (solo si está en DRAFT).

**Request**:
```json
{
  "riskFactors": {
    "subjectRisk": {
      "pepStatus": {
        "value": 4,
        "justification": "Se detectó PEP activo"
      }
    }
  }
}
```

**Response** (200 OK):
```json
{
  "evaluationId": "EVAL-2024-000123-v1",
  "status": "DRAFT",
  "calculationResult": { ... },
  "preliminaryRiskLevel": "MEDIO",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### POST /api/v1/risk-evaluations/{evaluationId}/override

Aplica un override manual al resultado de la evaluación.

**Permisos**: `risk:evaluation:override` (solo Oficial de Cumplimiento)

**Request**:
```json
{
  "finalRiskLevel": "MEDIO",
  "justification": "A pesar del puntaje automático bajo, información de inteligencia indica vínculos con actividades de alto riesgo no reflejadas en la estructura formal."
}
```

**Response** (200 OK):
```json
{
  "evaluationId": "EVAL-2024-000123-v1",
  "preliminaryRiskLevel": "BAJO",
  "finalRiskLevel": "MEDIO",
  "hasManualOverride": true,
  "manualOverrideJustification": "...",
  "overrideAppliedBy": "user-oficial-cumplimiento",
  "overrideAppliedAt": "2024-01-15T14:45:00Z",
  "alertGenerated": true
}
```

#### POST /api/v1/risk-evaluations/{evaluationId}/approve

Aprueba una evaluación (cambia estado a APPROVED).

**Permisos**: `risk:evaluation:approve`

**Request**:
```json
{
  "approvalComments": "Evaluación revisada y aprobada, resultado consistente con perfil del cliente"
}
```

**Response** (200 OK):
```json
{
  "evaluationId": "EVAL-2024-000123-v1",
  "status": "APPROVED",
  "approvedBy": "user-oficial-cumplimiento",
  "approvedAt": "2024-01-15T15:00:00Z"
}
```

#### GET /api/v1/dossiers/{dossierId}/risk-evaluations/current

Obtiene la evaluación vigente de un expediente.

**Response** (200 OK):
```json
{
  "evaluationId": "EVAL-2024-000123-v3",
  "dossierId": "DOS-CLI-2024-000123",
  "version": 3,
  "evaluationType": "PERIODIC",
  "status": "APPROVED",
  "finalRiskLevel": "MEDIO",
  "evaluationDate": "2024-09-20T10:00:00Z",
  "nextReviewDate": "2025-03-20T00:00:00Z"
}
```

#### GET /api/v1/dossiers/{dossierId}/risk-evaluations/history

Obtiene el historial completo de evaluaciones de un expediente.

**Response** (200 OK):
```json
{
  "dossierId": "DOS-CLI-2024-000123",
  "totalVersions": 3,
  "evaluations": [
    {
      "evaluationId": "EVAL-2024-000123-v1",
      "version": 1,
      "evaluationType": "INITIAL",
      "evaluationDate": "2024-01-15T10:30:00Z",
      "finalRiskLevel": "BAJO",
      "status": "SUPERSEDED"
    },
    {
      "evaluationId": "EVAL-2024-000123-v2",
      "version": 2,
      "evaluationType": "PERIODIC",
      "evaluationDate": "2024-07-15T09:00:00Z",
      "finalRiskLevel": "BAJO",
      "status": "SUPERSEDED"
    },
    {
      "evaluationId": "EVAL-2024-000123-v3",
      "version": 3,
      "evaluationType": "PERIODIC",
      "evaluationDate": "2024-09-20T10:00:00Z",
      "finalRiskLevel": "MEDIO",
      "status": "APPROVED"
    }
  ]
}
```

#### POST /api/v1/risk-evaluations/trigger-reevaluation

Dispara una reevaluación por cambio significativo en el expediente.

**Request**:
```json
{
  "dossierId": "DOS-CLI-2024-000123",
  "triggerReason": "Cambio de actividad económica del cliente",
  "changedFields": ["economicActivity", "fundsOrigin"]
}
```

**Response** (202 Accepted):
```json
{
  "message": "Reevaluación programada",
  "newEvaluationId": "EVAL-2024-000123-v4",
  "scheduledFor": "2024-10-01T10:00:00Z"
}
```

#### GET /api/v1/risk-evaluations

Busca evaluaciones con filtros.

**Query Parameters**:
- `dossierId`: Filtrar por expediente
- `riskLevel`: Filtrar por nivel (BAJO, MEDIO, ALTO)
- `status`: Filtrar por estado
- `evaluationType`: Filtrar por tipo
- `dateFrom`, `dateTo`: Rango de fechas
- `hasManualOverride`: Solo evaluaciones con override

**Response** (200 OK):
```json
{
  "totalResults": 150,
  "page": 1,
  "pageSize": 20,
  "evaluations": [
    { ... },
    { ... }
  ]
}
```

### 8.2 Endpoints de Configuración

#### GET /api/v1/risk-configurations/active

Obtiene la configuración activa de ponderación.

**Response** (200 OK):
```json
{
  "configurationId": "CFG-2024-001",
  "configurationName": "Configuración Estándar 2024",
  "version": 1,
  "effectiveFrom": "2024-01-01T00:00:00Z",
  "isActive": true,
  "categoryWeights": { ... },
  "factorWeights": { ... },
  "thresholds": { ... }
}
```

#### PUT /api/v1/risk-configurations/{configurationId}

Actualiza la configuración de ponderación.

**Permisos**: `risk:configuration:update` (solo Oficial de Cumplimiento)

**Request**:
```json
{
  "categoryWeights": {
    "SUBJECT_RISK": 40,
    "PRODUCT_RISK": 20,
    "CHANNEL_RISK": 10,
    "GEOGRAPHIC_RISK": 20,
    "INTERNAL_CONTROLS": 10
  },
  "justification": "Ajuste para incrementar peso del riesgo del sujeto según nueva directriz regulatoria"
}
```

**Response** (200 OK):
```json
{
  "configurationId": "CFG-2024-002",
  "message": "Nueva configuración creada y activada",
  "effectiveFrom": "2024-10-01T00:00:00Z"
}
```

---

## 9. Reglas de Negocio

### 9.1 Reglas de Evaluación Obligatoria

#### RN-EVAL-001: Evaluación Inicial Obligatoria
**Descripción**: Todo expediente debe tener una evaluación inicial de riesgo antes de ser aprobado.

**Implementación**:
```java
public void approveDossier(String dossierId) {
    RiskEvaluation currentEvaluation = riskService.getCurrentEvaluation(dossierId);
    
    if (currentEvaluation == null || currentEvaluation.getStatus() != EvaluationStatus.APPROVED) {
        throw new BusinessException("DOSSIER_APPROVAL_BLOCKED", 
            "No se puede aprobar el expediente sin evaluación de riesgo aprobada");
    }
    
    // Continuar con aprobación...
}
```

#### RN-EVAL-002: Factores Obligatorios
**Descripción**: Los 6 factores de riesgo son obligatorios (pueden ser 0 si no aplican, pero deben estar presentes).

**Validación**:
```java
public void validateRiskFactors(JsonNode riskFactors) {
    String[] requiredCategories = {
        "subjectRisk", "productRisk", "channelRisk", 
        "geographicRisk", "internalControls"
    };
    
    for (String category : requiredCategories) {
        if (!riskFactors.has(category)) {
            throw new ValidationException("MISSING_RISK_CATEGORY", 
                "La categoría " + category + " es obligatoria");
        }
    }
}
```

#### RN-EVAL-003: Justificación Obligatoria para Valores Altos
**Descripción**: Factores con valor ≥ 4 requieren justificación detallada (mínimo 30 caracteres).

**Validación**:
```java
public void validateFactorJustification(RiskFactorValue factorValue) {
    if (factorValue.getValue() >= 4) {
        String justification = factorValue.getJustification();
        
        if (justification == null || justification.trim().length() < 30) {
            throw new ValidationException("INSUFFICIENT_JUSTIFICATION", 
                "Factores con valor alto (≥4) requieren justificación detallada (mínimo 30 caracteres)");
        }
    }
}
```

### 9.2 Reglas de Reevaluación

#### RN-REEVAL-001: Reevaluación Periódica
**Descripción**: Los expedientes requieren reevaluación periódica según nivel de riesgo:
- Riesgo ALTO: Cada 6 meses
- Riesgo MEDIO: Cada 12 meses
- Riesgo BAJO: Cada 24 meses

**Implementación**:
```java
public LocalDate calculateNextReviewDate(RiskLevel riskLevel, LocalDate evaluationDate) {
    switch (riskLevel) {
        case ALTO:
            return evaluationDate.plusMonths(6);
        case MEDIO:
            return evaluationDate.plusMonths(12);
        case BAJO:
            return evaluationDate.plusMonths(24);
        default:
            throw new IllegalArgumentException("Invalid risk level");
    }
}
```

#### RN-REEVAL-002: Reevaluación por Cambios Significativos
**Descripción**: Cambios en los siguientes campos del expediente disparan reevaluación automática:
- Actividad económica
- Estructura accionaria
- Condición PEP
- Región geográfica de operación
- Tipo de producto contratado

**Implementación**:
```java
@EventListener
public void onDossierUpdated(DossierUpdatedEvent event) {
    String[] significantFields = {
        "economicActivity", "shareholderStructure", "pepStatus", 
        "geographicRegion", "productType"
    };
    
    if (event.hasChangesIn(significantFields)) {
        riskEvaluationService.triggerReevaluation(
            event.getDossierId(), 
            "Cambio significativo en: " + event.getChangedFields()
        );
    }
}
```

### 9.3 Reglas de Override Manual

#### RN-OVERRIDE-001: Autorización Exclusiva
**Descripción**: Solo usuarios con rol `COMPLIANCE_OFFICER` pueden aplicar overrides manuales.

**Implementación**:
```java
@PreAuthorize("hasRole('COMPLIANCE_OFFICER')")
public RiskEvaluation applyManualOverride(String evaluationId, OverrideRequest request) {
    // Lógica de override
}
```

#### RN-OVERRIDE-002: Justificación Obligatoria
**Descripción**: Todo override requiere justificación detallada (mínimo 50 caracteres).

**Validación**:
```java
public void validateOverrideRequest(OverrideRequest request) {
    if (request.getJustification() == null || 
        request.getJustification().trim().length() < 50) {
        throw new ValidationException("INSUFFICIENT_OVERRIDE_JUSTIFICATION", 
            "Override manual requiere justificación detallada (mínimo 50 caracteres)");
    }
}
```

#### RN-OVERRIDE-003: Aprobación de Supervisor para Cambios Drásticos
**Descripción**: Si el override cambia el riesgo de BAJO a ALTO o viceversa, requiere aprobación adicional del supervisor.

**Implementación**:
```java
public RiskEvaluation applyManualOverride(String evaluationId, OverrideRequest request) {
    RiskEvaluation evaluation = repository.findById(evaluationId);
    
    boolean requiresSupervisorApproval = 
        (evaluation.getPreliminaryRiskLevel() == RiskLevel.BAJO && request.getFinalRiskLevel() == RiskLevel.ALTO) ||
        (evaluation.getPreliminaryRiskLevel() == RiskLevel.ALTO && request.getFinalRiskLevel() == RiskLevel.BAJO);
    
    evaluation.setFinalRiskLevel(request.getFinalRiskLevel());
    evaluation.setHasManualOverride(true);
    evaluation.setRequiresSupervisorApproval(requiresSupervisorApproval);
    
    if (requiresSupervisorApproval) {
        evaluation.setStatus(EvaluationStatus.PENDING_SUPERVISOR_APPROVAL);
        alertService.createAlert(AlertType.SUPERVISOR_APPROVAL_REQUIRED, evaluation);
    }
    
    return repository.save(evaluation);
}
```

### 9.4 Reglas de Alertas

#### RN-ALERT-001: Alerta Automática para Riesgo Alto
**Descripción**: Toda evaluación con resultado ALTO genera alerta automática al Oficial de Cumplimiento.

**Implementación**:
```java
public RiskEvaluation completeEvaluation(String evaluationId) {
    RiskEvaluation evaluation = repository.findById(evaluationId);
    evaluation.setStatus(EvaluationStatus.PENDING_REVIEW);
    
    if (evaluation.getPreliminaryRiskLevel() == RiskLevel.ALTO) {
        alertService.createAlert(
            AlertType.HIGH_RISK_EVALUATION,
            AlertSeverity.HIGH,
            "Evaluación de riesgo ALTO detectada para expediente " + evaluation.getDossierId(),
            "COMPLIANCE_OFFICER"
        );
    }
    
    return repository.save(evaluation);
}
```

#### RN-ALERT-002: Debida Diligencia Reforzada Automática
**Descripción**: Si se detecta PEP con valor ≥ 4, se activa automáticamente flag de debida diligencia reforzada.

**Implementación**:
```java
public RiskEvaluation calculateRisk(String evaluationId) {
    RiskEvaluation evaluation = repository.findById(evaluationId);
    
    // Obtener valor del factor PEP
    int pepValue = extractPepValue(evaluation.getRiskFactorsJson());
    
    if (pepValue >= 4) {
        evaluation.setRequiresEnhancedDueDiligence(true);
        
        alertService.createAlert(
            AlertType.ENHANCED_DD_REQUIRED,
            AlertSeverity.MEDIUM,
            "PEP de alto riesgo detectado, se requiere debida diligencia reforzada",
            "COMPLIANCE_OFFICER"
        );
    }
    
    return evaluation;
}
```

---

## 10. Auditoría y Trazabilidad

### 10.1 Eventos de Auditoría

Cada operación crítica genera un evento de auditoría:

| Evento | Código | Información Capturada |
|--------|--------|----------------------|
| Evaluación creada | RISK-001 | userId, dossierId, evaluationType, timestamp |
| Evaluación actualizada | RISK-002 | userId, evaluationId, changedFields, previousValues, newValues |
| Override aplicado | RISK-003 | userId, evaluationId, preliminaryLevel, finalLevel, justification |
| Evaluación aprobada | RISK-004 | userId, evaluationId, approvalComments |
| Evaluación rechazada | RISK-005 | userId, evaluationId, rejectionReason |
| Configuración modificada | RISK-006 | userId, configurationId, changedWeights, justification |
| Reevaluación disparada | RISK-007 | userId, dossierId, triggerReason |
| Alerta generada | RISK-008 | evaluationId, alertType, severity, assignedTo |

### 10.2 Historial Inmutable

La tabla `EvaluationHistory` mantiene un registro completo e inmutable:

**Propiedades**:
- Sin columnas de actualización (`updatedAt`)
- Sin deletes permitidos a nivel de base de datos
- Índices en `evaluationId` + `changedAt` para consultas rápidas
- Particionamiento por fecha para eficiencia en datos históricos

**Consulta de Historial**:
```java
public List<EvaluationHistory> getEvaluationHistory(String evaluationId) {
    return historyRepository.findByEvaluationIdOrderByChangedAtDesc(evaluationId);
}
```

### 10.3 Trazabilidad de Decisiones

Para inspecciones regulatorias, el sistema puede generar un reporte completo de trazabilidad:

**Reporte de Trazabilidad de una Evaluación**:
```json
{
  "evaluationId": "EVAL-2024-000123-v1",
  "dossierId": "DOS-CLI-2024-000123",
  "timeline": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "Evaluación inicial creada",
      "performedBy": "user-analista-123",
      "details": "Evaluación creada con todos los factores obligatorios"
    },
    {
      "timestamp": "2024-01-15T11:00:00Z",
      "action": "Factor pepStatus actualizado",
      "performedBy": "user-analista-123",
      "previousValue": 0,
      "newValue": 4,
      "justification": "Se detectó PEP activo mediante consulta a base de datos PEP"
    },
    {
      "timestamp": "2024-01-15T14:45:00Z",
      "action": "Override manual aplicado",
      "performedBy": "user-oficial-cumplimiento",
      "previousRiskLevel": "BAJO",
      "newRiskLevel": "MEDIO",
      "justification": "Información de inteligencia indica vínculos con actividades de alto riesgo"
    },
    {
      "timestamp": "2024-01-15T15:00:00Z",
      "action": "Evaluación aprobada",
      "performedBy": "user-oficial-cumplimiento",
      "comments": "Evaluación revisada y aprobada, resultado consistente con perfil"
    }
  ],
  "currentStatus": "APPROVED",
  "finalRiskLevel": "MEDIO",
  "hasManualOverride": true
}
```

### 10.4 Evidencia para Inspecciones

El módulo genera automáticamente evidencia para presentar en inspecciones de SUDEASEG:

**Reporte Trimestral de Evaluaciones de Riesgo**:
```json
{
  "reportPeriod": {
    "from": "2024-01-01",
    "to": "2024-03-31"
  },
  "summary": {
    "totalEvaluations": 450,
    "byRiskLevel": {
      "BAJO": 320,
      "MEDIO": 100,
      "ALTO": 30
    },
    "byEvaluationType": {
      "INITIAL": 200,
      "PERIODIC": 180,
      "TRIGGERED": 50,
      "MANUAL": 20
    },
    "manualOverrides": 15,
    "enhancedDueDiligenceRequired": 25,
    "pepDetected": 18
  },
  "highRiskEvaluations": [
    {
      "evaluationId": "EVAL-2024-000045",
      "dossierId": "DOS-CLI-2024-000045",
      "finalRiskLevel": "ALTO",
      "reasons": ["PEP activo", "Actividad de alto riesgo", "Zona fronteriza"],
      "actionsTaken": ["Debida diligencia reforzada", "Aprobación por Comité"]
    }
  ],
  "complianceStatus": "COMPLIANT",
  "generatedAt": "2024-04-05T10:00:00Z"
}
```

---

## 11. Casos de Uso

### Caso de Uso 1: Evaluación Inicial de Cliente Nuevo

**Actor**: Analista de Cumplimiento

**Flujo**:
1. Se crea un nuevo expediente de cliente
2. El analista ingresa al módulo de evaluación de riesgo
3. Completa los factores obligatorios:
   - Tipo de persona: Jurídica local (valor 2)
   - Actividad económica: Construcción (valor 3)
   - Origen de fondos: Ingresos operacionales verificables (valor 2)
   - Complejidad beneficiario: Estructura simple (valor 1)
   - Condición PEP: No detectado (valor 0)
   - Tipo de producto: Seguro empresarial (valor 3)
   - Canal: Intermediario autorizado (valor 3)
   - Controles del canal: KYC estándar (valor 3)
   - País: Venezuela (valor 3)
   - Región: Caracas (valor 2)
   - Zona fronteriza: No aplica (valor 0)
   - Arco Minero: No aplica (valor 0)
   - Proximidad prisiones: No aplica (valor 0)
   - Existencia controles: Controles formalizados (valor 4)
   - Efectividad controles: Controles efectivos (valor 4)
4. El sistema calcula automáticamente:
   - Puntaje bruto: 2.45
   - Factor mitigación: 0.60 (por controles fuertes)
   - Puntaje ajustado: 1.47
   - Resultado preliminar: **BAJO**
5. El analista envía la evaluación a revisión
6. El Oficial de Cumplimiento revisa y aprueba
7. Se genera registro en el expediente
8. El expediente puede continuar su flujo de aprobación

### Caso de Uso 2: Override Manual por Información de Inteligencia

**Actor**: Oficial de Cumplimiento

**Flujo**:
1. Una evaluación automática resulta en riesgo BAJO
2. El Oficial de Cumplimiento recibe información de inteligencia sobre vínculos del cliente con actividades sospechosas
3. Accede a la evaluación y selecciona "Aplicar Override"
4. Cambia el resultado final a MEDIO
5. Ingresa justificación detallada: "A pesar del puntaje automático bajo, información de inteligencia de fuente confiable indica que uno de los beneficiarios finales tiene vínculos con empresas investigadas por actividades de alto riesgo. Se eleva a MEDIO y se solicita debida diligencia reforzada."
6. El sistema registra el override en el historial
7. Se genera alerta al Analista de Cumplimiento para ejecutar DD reforzada
8. El expediente es marcado para seguimiento especial

### Caso de Uso 3: Reevaluación por Cambio de Actividad Económica

**Actor**: Sistema (Automático)

**Flujo**:
1. Un cliente modifica su actividad económica de "Comercio minorista" (valor 2) a "Cambio de divisas" (valor 4)
2. El módulo de Expedientes dispara el evento `DossierUpdated`
3. El módulo de Evaluación de Riesgo escucha el evento y detecta cambio en campo crítico
4. Genera automáticamente una nueva versión de evaluación (v2) con tipo TRIGGERED
5. Asigna la nueva evaluación al Analista de Cumplimiento
6. El analista recibe notificación y completa la reevaluación
7. El sistema recalcula con el nuevo valor:
   - Puntaje ajustado sube a 2.85
   - Resultado preliminar cambia a **MEDIO**
8. El Oficial de Cumplimiento aprueba el nuevo resultado
9. Se actualiza el nivel de riesgo en el expediente
10. Se genera alerta de cambio de nivel de riesgo
11. Se programa próxima revisión en 12 meses (por ser riesgo MEDIO)

### Caso de Uso 4: Detección de PEP en Evaluación

**Actor**: Analista de Cumplimiento

**Flujo**:
1. Durante la evaluación inicial, el analista ingresa los datos del cliente
2. El sistema consulta automáticamente el módulo PEP
3. Detecta que uno de los accionistas es PEP activo (Director de ente público)
4. Asigna automáticamente valor 4 al factor `pepStatus`
5. El cálculo automático resulta en riesgo MEDIO
6. Se activa automáticamente flag `requiresEnhancedDueDiligence`
7. Se genera alerta al Oficial de Cumplimiento: "PEP de alto riesgo detectado"
8. El Oficial revisa y confirma el resultado
9. Se asigna al área de Debida Diligencia Reforzada
10. No se aprueba el expediente hasta completar DD reforzada

---

## 12. Testing y Validación

### 12.1 Casos de Prueba Funcionales

| Test Case | Descripción | Expected Result |
|-----------|-------------|-----------------|
| TC-EVAL-001 | Crear evaluación inicial con todos los factores obligatorios | 201 Created, evaluación creada con cálculo correcto |
| TC-EVAL-002 | Crear evaluación sin factor obligatorio | 400 Bad Request, error de validación |
| TC-EVAL-003 | Asignar valor ≥4 sin justificación | 400 Bad Request, requiere justificación |
| TC-EVAL-004 | Calcular riesgo con controles internos fuertes | Puntaje ajustado reducido significativamente |
| TC-EVAL-005 | Aplicar override manual (Oficial Cumplimiento) | 200 OK, override aplicado, historial registrado |
| TC-EVAL-006 | Aplicar override manual (usuario no autorizado) | 403 Forbidden, permiso denegado |
| TC-EVAL-007 | Aprobar expediente sin evaluación | 400 Bad Request, evaluación obligatoria |
| TC-EVAL-008 | Modificar expediente campo crítico | Reevaluación automática disparada |
| TC-EVAL-009 | Evaluación con PEP valor ≥4 | Flag `requiresEnhancedDueDiligence` activado |
| TC-EVAL-010 | Resultado ALTO | Alerta automática generada al Oficial |
| TC-EVAL-011 | Override de BAJO a ALTO | Requiere aprobación de supervisor |
| TC-EVAL-012 | Consultar historial de evaluaciones | Todas las versiones retornadas en orden |

### 12.2 Validación de Cálculos

**Escenario de Prueba: Cliente de Riesgo Medio**

**Entrada**:
```json
{
  "subjectRisk": {
    "personType": 2,
    "economicActivity": 3,
    "fundsOrigin": 2,
    "beneficiaryComplexity": 1,
    "pepStatus": 4
  },
  "productRisk": {
    "productType": 3,
    "productUsage": 2,
    "productComplexity": 2
  },
  "channelRisk": {
    "distributionChannel": 3,
    "channelControls": 3
  },
  "geographicRisk": {
    "countryRisk": 3,
    "highRiskRegion": 2,
    "borderZone": 0,
    "miningArc": 0,
    "prisonProximity": 0
  },
  "internalControls": {
    "controlExistence": 4,
    "controlEffectiveness": 4
  }
}
```

**Cálculo Esperado**:

1. **Puntajes por Categoría**:
   - Sujeto: (2×20 + 3×30 + 2×25 + 1×15 + 4×10) / 100 = 2.35
   - Producto: (3×40 + 2×35 + 2×25) / 100 = 2.40
   - Canal: (3×60 + 3×40) / 100 = 3.00
   - Geográfico: (3×30 + 2×25) / 55 = 2.55
   - Controles: (4×50 + 4×50) / 100 = 4.00

2. **Puntaje Bruto**:
   - Sujeto: 2.35 × 0.35 = 0.8225
   - Producto: 2.40 × 0.20 = 0.48
   - Canal: 3.00 × 0.15 = 0.45
   - Geográfico: 2.55 × 0.20 = 0.51
   - Controles: 4.00 × 0.10 = 0.40
   - **Total**: 2.6625

3. **Aplicar Mitigación**:
   - Factor: 1 - (4.0 / 10) = 0.60
   - Ajustado: 2.6625 × 0.60 = 1.5975

4. **Clasificación**:
   - 1.5975 ≤ 2.0 → **BAJO**

**Resultado Esperado**: Riesgo BAJO con `requiresEnhancedDueDiligence = true` (por PEP = 4)

### 12.3 Validación de Versionamiento

**Escenario**: Expediente con 3 evaluaciones

1. Crear evaluación inicial (v1) con resultado BAJO
2. Verificar que v1 tiene `status = APPROVED`
3. Crear reevaluación periódica (v2) con resultado MEDIO
4. Verificar que v1 cambia a `status = SUPERSEDED`
5. Verificar que v2 tiene `status = APPROVED`
6. Crear reevaluación disparada (v3) con resultado BAJO
7. Verificar que v2 cambia a `status = SUPERSEDED`
8. Verificar que v3 tiene `status = APPROVED`
9. Consultar historial y verificar que retorna las 3 versiones en orden

---

## 13. Preparación para Inspecciones

### 13.1 Documentación Requerida para SUDEASEG

El módulo genera automáticamente la siguiente documentación para inspecciones:

1. **Matriz de Factores de Riesgo**:
   - Listado completo de factores configurados
   - Escalas de valoración para cada factor
   - Criterios de asignación de valores
   - Evidencia de aprobación por Oficial de Cumplimiento

2. **Configuración de Ponderación**:
   - Pesos actuales por categoría y factor
   - Historial de cambios en configuración
   - Justificaciones de cada cambio
   - Aprobaciones registradas

3. **Reporte de Evaluaciones por Período**:
   - Total de evaluaciones realizadas
   - Distribución por nivel de riesgo
   - Porcentaje de overrides manuales
   - Casos de debida diligencia reforzada

4. **Evidencia de Trazabilidad**:
   - Muestra representativa de expedientes con evaluaciones completas
   - Historial de cambios y justificaciones
   - Evidencia de segregación de funciones (creador ≠ aprobador)

5. **Alertas y Seguimiento**:
   - Alertas generadas por evaluaciones de alto riesgo
   - Evidencia de seguimiento por Oficial de Cumplimiento
   - Acciones correctivas tomadas

### 13.2 Indicadores de Cumplimiento

El módulo calcula automáticamente KPIs para demostrar cumplimiento:

| Indicador | Fórmula | Meta |
|-----------|---------|------|
| Cobertura de Evaluación | (Expedientes con evaluación / Total expedientes) × 100 | 100% |
| Evaluaciones en Tiempo | (Evaluaciones a tiempo / Total evaluaciones) × 100 | ≥ 95% |
| Tasa de Override | (Evaluaciones con override / Total evaluaciones) × 100 | < 10% |
| Reevaluaciones Periódicas Cumplidas | (Reevaluaciones realizadas / Reevaluaciones programadas) × 100 | 100% |
| Debida Diligencia Reforzada Completada | (DD reforzadas completadas / DD reforzadas requeridas) × 100 | 100% |

### 13.3 Reportes Regulatorios Automatizados

**Reporte Trimestral de Riesgo**:

Generado automáticamente el primer día de cada trimestre, incluye:

- Resumen ejecutivo de evaluaciones del período
- Distribución de niveles de riesgo
- Casos de alto riesgo y acciones tomadas
- Cambios en configuración de ponderación
- KPIs de cumplimiento
- Análisis de tendencias

**Formato de Entrega**: PDF + JSON exportable

**Destinatarios**: Oficial de Cumplimiento, Dirección, SUDEASEG (cuando aplique)

---

## Conclusión

El **Módulo de Evaluación Inicial de Riesgos** del SIAR proporciona una solución completa, robusta y auditable para la gestión de riesgos de cumplimiento en una empresa de seguros regulada.

**Características Destacadas**:
- Evaluación sistemática de 6 factores de riesgo obligatorios
- Lógica de consolidación configurable y transparente
- Versionamiento completo de evaluaciones
- Trazabilidad inmutable de todas las decisiones
- Integración fluida con otros módulos del SIAR
- Preparación exhaustiva para inspecciones regulatorias
- Solo alerta, no bloquea operaciones
- Cumplimiento total con normativa venezolana

El módulo está diseñado para soportar el escrutinio regulatorio más exigente, proporcionando evidencia completa y auditable de cada decisión de riesgo tomada en la organización.
