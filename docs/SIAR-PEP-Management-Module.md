# Módulo de Gestión de Personas Expuestas Políticamente (PEP)
## Sistema Integral de Administración de Riesgos y Cumplimiento (SIAR)

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Módulo:** Gestión PEP y Familiares PEP  
**Normativa:** Providencia 083.18 - SUDEBAN

---

## 1. RESUMEN EJECUTIVO

El Módulo de Gestión PEP es un componente crítico del SIAR que permite identificar, clasificar, documentar y hacer seguimiento continuo a Personas Expuestas Políticamente (PEP), sus familiares y personas estrechamente vinculadas, conforme a las regulaciones venezolanas para empresas de seguros.

### 1.1 Objetivos del Módulo

- **Identificación exhaustiva**: Detectar PEPs, ex-PEPs, familiares y vinculados
- **Clasificación precisa**: Categorizar según tipo de exposición política
- **Documentación completa**: Registrar toda la información requerida regulatoriamente
- **Seguimiento continuo**: Monitorear cambios en la condición PEP
- **Integración con riesgo**: Impactar automáticamente la evaluación de riesgo
- **Debida diligencia reforzada**: Activar controles adicionales para PEPs
- **Trazabilidad regulatoria**: Mantener evidencia documental para inspecciones

### 1.2 Características Clave

- ✅ Evaluación obligatoria al crear expediente
- ✅ Modificación en cualquier momento con alertas automáticas
- ✅ Impacto directo en nivel de riesgo
- ✅ Activación automática de debida diligencia reforzada
- ✅ Historial completo de cambios de estatus PEP
- ✅ Integración con screening externo
- ✅ Alertas al Oficial de Cumplimiento por cambios
- ✅ Reevaluaciones periódicas configurables
- ✅ Documentación de fuentes de información

---

## 2. MARCO CONCEPTUAL Y REGULATORIO

### 2.1 Definiciones Operativas

#### 2.1.1 Persona Expuesta Políticamente (PEP)

Individuo que desempeña o ha desempeñado funciones públicas prominentes, incluyendo:

- Jefes de Estado o de gobierno
- Políticos de alto nivel
- Funcionarios gubernamentales de alto nivel
- Jueces de tribunales supremos
- Oficiales militares de alto rango
- Ejecutivos de empresas estatales
- Funcionarios importantes de partidos políticos
- Miembros de órganos de administración, dirección o supervisión de empresas del Estado

#### 2.1.2 Clasificación de PEPs

| Tipo | Código | Descripción | Nivel de Riesgo Base |
|------|--------|-------------|---------------------|
| PEP Nacional | `PEP_NATIONAL` | Persona que ejerce o ejerció funciones públicas prominentes en Venezuela | ALTO |
| PEP Extranjero | `PEP_FOREIGN` | Persona que ejerce o ejerció funciones públicas prominentes en otro país | ALTO |
| PEP Internacional | `PEP_INTERNATIONAL` | Persona que ejerce o ejerció funciones en organismos internacionales | ALTO |
| Ex-PEP | `PEP_FORMER` | Persona que cesó funciones PEP hace más de 1 año | MEDIO-ALTO |
| Familiar de PEP | `PEP_FAMILY` | Familiar directo de un PEP activo o ex-PEP | MEDIO-ALTO |
| Vinculado a PEP | `PEP_ASSOCIATE` | Persona con relación comercial o profesional estrecha con PEP | MEDIO |

#### 2.1.3 Relaciones con PEP

**Familiares Directos (Línea Directa):**
- Cónyuge o concubino(a)
- Hijos e hijas
- Padres y madres
- Hermanos y hermanas
- Abuelos y abuelas
- Nietos y nietas

**Personas Estrechamente Vinculadas:**
- Socios comerciales conocidos
- Apoderados con poderes amplios
- Co-inversionistas en negocios
- Personas que ejercen control efectivo conjunto sobre entidades

### 2.2 Período de Vigencia

Según mejores prácticas internacionales:

- **PEP Activo**: Durante el ejercicio del cargo
- **Ex-PEP**: Hasta 2 años después del cese de funciones (configurable)
- **Familiar de PEP**: Mientras el PEP esté activo o sea Ex-PEP
- **Vinculado a PEP**: Mientras exista la relación comercial o profesional estrecha

---

## 3. ESTRUCTURA LÓGICA DEL MÓDULO PEP

### 3.1 Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────┐
│                   MÓDULO GESTIÓN PEP                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  1. IDENTIFICACIÓN Y CLASIFICACIÓN PEP            │    │
│  │     - Evaluación inicial                          │    │
│  │     - Clasificación de tipo PEP                   │    │
│  │     - Registro de información obligatoria         │    │
│  └───────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  2. INTEGRACIÓN CON SCREENING                     │    │
│  │     - Búsqueda en listas PEP                      │    │
│  │     - Validación de resultados                    │    │
│  │     - Registro de fuente de información           │    │
│  └───────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  3. IMPACTO EN EVALUACIÓN DE RIESGO               │    │
│  │     - Incremento automático de score              │    │
│  │     - Activación de debida diligencia reforzada   │    │
│  │     - Generación de alertas                       │    │
│  └───────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  4. SEGUIMIENTO Y REEVALUACIÓN                    │    │
│  │     - Monitoreo de cambios de estatus             │    │
│  │     - Reevaluaciones periódicas                   │    │
│  │     - Actualización de información                │    │
│  └───────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  5. AUDITORÍA Y TRAZABILIDAD                      │    │
│  │     - Historial de cambios de condición PEP       │    │
│  │     - Registro de decisiones                      │    │
│  │     - Documentación de justificaciones            │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Trabajo del Módulo PEP

```
INICIO → CREACIÓN EXPEDIENTE
           ↓
[1] Evaluación PEP Obligatoria
           ↓
    ¿Es PEP? ────NO───→ Registrar: NO PEP → Continuar con Expediente
           │
          SÍ
           ↓
[2] Clasificar Tipo PEP
    (Nacional, Extranjero, Ex-PEP, Familiar, Vinculado)
           ↓
[3] Registrar Información Obligatoria
    - Cargo desempeñado
    - País
    - Fechas (inicio/cese)
    - Relación (si aplica)
    - Fuente de información
           ↓
[4] Integración con Screening (opcional)
    - Validar contra listas PEP
    - Documentar resultados
           ↓
[5] IMPACTO AUTOMÁTICO EN RIESGO
    - Incrementar score de riesgo (+15 a +30 puntos)
    - Activar Debida Diligencia Reforzada
    - Generar Alerta al Oficial de Cumplimiento
           ↓
[6] Aprobación del Oficial de Cumplimiento
    - Revisar información PEP
    - Validar debida diligencia
    - Aprobar/Rechazar/Solicitar información
           ↓
    EXPEDIENTE CONTINÚA FLUJO NORMAL
           ↓
[7] MONITOREO CONTINUO
    - Reevaluaciones periódicas (cada 6 meses)
    - Alertas de cambio de estatus
    - Actualización por screening
           ↓
    FIN (ciclo continuo)
```

### 3.3 Reglas de Negocio

#### RN-PEP-001: Evaluación Obligatoria Inicial
- La condición PEP DEBE evaluarse al crear el expediente
- El expediente NO puede pasar a estado "EN_REVISION" sin evaluación PEP completada
- Si no se tiene información, se registra como "PENDIENTE_VERIFICACION"

#### RN-PEP-002: Modificación Post-Aprobación
- La condición PEP puede modificarse en cualquier momento
- Toda modificación de PEP DEBE generar alerta al Oficial de Cumplimiento
- Si un expediente aprobado cambia a PEP, requiere nueva revisión

#### RN-PEP-003: Impacto en Riesgo
- PEP Nacional/Extranjero/Internacional: Score +5 (escala 1-5)
- Ex-PEP: Score +4
- Familiar de PEP: Score +3 a +4
- Vinculado a PEP: Score +2 a +3
- El sistema DEBE recalcular riesgo automáticamente al cambiar condición PEP

#### RN-PEP-004: Debida Diligencia Reforzada
- Todo PEP activo DEBE tener Debida Diligencia Reforzada (EDD)
- Ex-PEP DEBE tener EDD si cesó hace menos de 2 años
- Familiar de PEP DEBE tener EDD si el PEP vinculado está activo

#### RN-PEP-005: Reevaluación Periódica
- PEP activo: Reevaluación cada 6 meses
- Ex-PEP: Reevaluación cada 12 meses hasta cumplir 2 años de cese
- Familiar/Vinculado: Reevaluación cada 12 meses

#### RN-PEP-006: Cese Automático de Condición
- Ex-PEP pasa a NO-PEP después de 2 años de cese (configurable)
- Sistema DEBE generar alerta para revisión manual antes del cambio automático
- Oficial de Cumplimiento puede extender el período si existe justificación

#### RN-PEP-007: Fuentes de Información
- Todo registro PEP DEBE documentar la fuente de información
- Fuentes aceptadas: Declaración del cliente, Screening, Medios públicos, Registros oficiales
- Si la fuente es Screening, DEBE registrarse el proveedor y fecha de consulta

---

## 4. MODELO DE DATOS JSON

### 4.1 Estructura PEP en el Expediente

```json
{
  "pepInformation": {
    "evaluationStatus": "COMPLETED",
    "lastEvaluationDate": "2024-01-15T10:30:00Z",
    "evaluatedBy": "maria.lopez",
    "nextReviewDate": "2024-07-15",
    
    "isPep": true,
    "pepType": "PEP_NATIONAL",
    "pepCategory": "ACTIVE_PEP",
    
    "pepDetails": {
      "position": "Director General de Ente Público",
      "institution": "Instituto Nacional de Seguros (INASES)",
      "institutionType": "GOVERNMENT_AGENCY",
      "country": "VE",
      "countryName": "Venezuela",
      "startDate": "2022-03-15",
      "endDate": null,
      "isCurrentPosition": true,
      "prominenceLevel": "HIGH",
      "publicExposureDescription": "Máxima autoridad del organismo regulador del sector asegurador"
    },
    
    "relationshipToPep": null,
    
    "informationSources": [
      {
        "sourceId": "SRC-PEP-001",
        "sourceType": "OFFICIAL_GAZETTE",
        "sourceName": "Gaceta Oficial N° 42.345",
        "sourceDate": "2022-03-20",
        "sourceReference": "Decreto de nombramiento",
        "verificationDate": "2024-01-15",
        "verifiedBy": "maria.lopez",
        "reliability": "HIGH",
        "documentReference": "DOC-GACETA-2022-001"
      },
      {
        "sourceId": "SRC-PEP-002",
        "sourceType": "SCREENING",
        "sourceName": "World-Check",
        "sourceDate": "2024-01-15",
        "screeningProvider": "Refinitiv",
        "screeningReference": "WC-VE-12345678",
        "matchQuality": "EXACT_MATCH",
        "verificationDate": "2024-01-15",
        "verifiedBy": "maria.lopez",
        "reliability": "HIGH"
      }
    ],
    
    "riskImpact": {
      "riskScoreIncrement": 5,
      "riskLevelBefore": "MEDIUM",
      "riskLevelAfter": "HIGH",
      "requiresEnhancedDueDiligence": true,
      "enhancedDueDiligenceStatus": "IN_PROGRESS",
      "additionalControls": [
        "Aprobación obligatoria por Oficial de Cumplimiento",
        "Monitoreo transaccional reforzado",
        "Revisión semestral obligatoria",
        "Documentación ampliada de origen de fondos",
        "Verificación de fuente de patrimonio"
      ]
    },
    
    "complianceOfficerDecision": {
      "decisionDate": "2024-01-16T15:30:00Z",
      "decidedBy": "oficial.cumplimiento@empresa.com",
      "decision": "APPROVED_WITH_CONDITIONS",
      "justification": "PEP activo verificado. Se aprueba relación comercial bajo debida diligencia reforzada con monitoreo continuo y revisión semestral obligatoria.",
      "conditions": [
        "Revisión semestral obligatoria",
        "Monitoreo de transacciones con umbral reducido al 50%",
        "Documentación anual de origen de fondos",
        "Revisión de patrimonio neto cada 12 meses"
      ],
      "approvalLevel": "SENIOR_COMPLIANCE_OFFICER",
      "nextMandatoryReview": "2024-07-16"
    },
    
    "pepHistory": [
      {
        "historyId": "PEPH-2024-001",
        "changeDate": "2024-01-15T10:30:00Z",
        "changedBy": "maria.lopez",
        "changeType": "INITIAL_CLASSIFICATION",
        "previousStatus": null,
        "newStatus": "PEP_NATIONAL",
        "previousDetails": null,
        "newDetails": {
          "isPep": true,
          "pepType": "PEP_NATIONAL",
          "position": "Director General de Ente Público"
        },
        "justification": "Identificación inicial durante creación de expediente",
        "alertGenerated": true,
        "alertId": "ALT-PEP-2024-001"
      }
    ],
    
    "monitoringSchedule": {
      "reviewFrequency": "SEMI_ANNUAL",
      "nextScheduledReview": "2024-07-15",
      "lastCompletedReview": "2024-01-15",
      "missedReviews": 0,
      "automatedMonitoring": true,
      "monitoringAlerts": []
    },
    
    "metadata": {
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "maria.lopez",
      "lastModifiedAt": "2024-01-16T15:30:00Z",
      "lastModifiedBy": "oficial.cumplimiento@empresa.com",
      "version": 2,
      "regulatoryReferences": [
        "Providencia 083.18 SUDEBAN - Art. 12",
        "Recomendaciones GAFI - Recomendación 12"
      ]
    }
  }
}
```

### 4.2 Estructura PEP para Familiar de PEP

```json
{
  "pepInformation": {
    "evaluationStatus": "COMPLETED",
    "lastEvaluationDate": "2024-02-10T11:00:00Z",
    "evaluatedBy": "carlos.rodriguez",
    "nextReviewDate": "2025-02-10",
    
    "isPep": true,
    "pepType": "PEP_FAMILY",
    "pepCategory": "FAMILY_MEMBER",
    
    "pepDetails": null,
    
    "relationshipToPep": {
      "relationType": "SPOUSE",
      "relationDescription": "Cónyuge",
      "relatedPepName": "Juan Alberto Pérez Gómez",
      "relatedPepDocument": "V-12345678",
      "relatedPepPosition": "Ministro de Economía",
      "relatedPepInstitution": "Ministerio del Poder Popular para Economía",
      "relatedPepCountry": "VE",
      "relatedPepStatus": "ACTIVE_PEP",
      "relatedPepStartDate": "2023-01-15",
      "relatedPepEndDate": null,
      "relationshipStartDate": "2015-06-20",
      "relationshipEndDate": null,
      "relationshipEvidence": [
        "Acta de matrimonio",
        "Declaración jurada del cliente"
      ],
      "documentReferences": ["DOC-MATRIMONIO-001"]
    },
    
    "informationSources": [
      {
        "sourceId": "SRC-PEP-010",
        "sourceType": "CLIENT_DECLARATION",
        "sourceName": "Declaración del Cliente",
        "sourceDate": "2024-02-10",
        "verificationDate": "2024-02-10",
        "verifiedBy": "carlos.rodriguez",
        "reliability": "MEDIUM",
        "requiresAdditionalVerification": true
      },
      {
        "sourceId": "SRC-PEP-011",
        "sourceType": "PUBLIC_REGISTRY",
        "sourceName": "Registro Civil - Acta Matrimonial",
        "sourceDate": "2015-06-20",
        "sourceReference": "Acta N° 123-2015",
        "verificationDate": "2024-02-10",
        "verifiedBy": "carlos.rodriguez",
        "reliability": "HIGH"
      }
    ],
    
    "riskImpact": {
      "riskScoreIncrement": 4,
      "riskLevelBefore": "MEDIUM",
      "riskLevelAfter": "HIGH",
      "requiresEnhancedDueDiligence": true,
      "enhancedDueDiligenceStatus": "REQUIRED",
      "additionalControls": [
        "Debida diligencia reforzada obligatoria",
        "Verificación de independencia patrimonial",
        "Documentación de origen de fondos",
        "Revisión anual obligatoria"
      ]
    },
    
    "complianceOfficerDecision": {
      "decisionDate": "2024-02-11T09:00:00Z",
      "decidedBy": "oficial.cumplimiento@empresa.com",
      "decision": "APPROVED_WITH_CONDITIONS",
      "justification": "Familiar directo (cónyuge) de PEP activo. Se verifica independencia patrimonial mediante declaración jurada y estados de cuenta. Se aprueba bajo EDD con condiciones.",
      "conditions": [
        "Revisión anual obligatoria",
        "Documentación de independencia patrimonial anual",
        "Monitoreo de transacciones",
        "Re-evaluación si el PEP vinculado cambia de posición"
      ],
      "approvalLevel": "COMPLIANCE_OFFICER",
      "nextMandatoryReview": "2025-02-11"
    },
    
    "pepHistory": [
      {
        "historyId": "PEPH-2024-045",
        "changeDate": "2024-02-10T11:00:00Z",
        "changedBy": "carlos.rodriguez",
        "changeType": "INITIAL_CLASSIFICATION",
        "previousStatus": null,
        "newStatus": "PEP_FAMILY",
        "justification": "Identificación de condición de familiar de PEP durante evaluación inicial",
        "alertGenerated": true,
        "alertId": "ALT-PEP-2024-045"
      }
    ],
    
    "monitoringSchedule": {
      "reviewFrequency": "ANNUAL",
      "nextScheduledReview": "2025-02-10",
      "lastCompletedReview": "2024-02-10",
      "missedReviews": 0,
      "automatedMonitoring": true,
      "monitoringAlerts": []
    }
  }
}
```

### 4.3 Estructura PEP para Ex-PEP

```json
{
  "pepInformation": {
    "evaluationStatus": "COMPLETED",
    "lastEvaluationDate": "2024-03-05T14:00:00Z",
    "evaluatedBy": "ana.martinez",
    "nextReviewDate": "2025-03-05",
    
    "isPep": true,
    "pepType": "PEP_FORMER",
    "pepCategory": "FORMER_PEP",
    
    "pepDetails": {
      "position": "Gobernador del Estado Miranda",
      "institution": "Gobierno del Estado Miranda",
      "institutionType": "STATE_GOVERNMENT",
      "country": "VE",
      "countryName": "Venezuela",
      "startDate": "2018-01-15",
      "endDate": "2022-12-31",
      "isCurrentPosition": false,
      "cessationReason": "FIN_DE_PERIODO",
      "monthsSinceCessation": 14,
      "prominenceLevel": "HIGH",
      "publicExposureDescription": "Máxima autoridad ejecutiva de entidad federal"
    },
    
    "relationshipToPep": null,
    
    "informationSources": [
      {
        "sourceId": "SRC-PEP-078",
        "sourceType": "PUBLIC_MEDIA",
        "sourceName": "Prensa Nacional",
        "sourceDate": "2022-12-31",
        "sourceReference": "Publicación sobre cese de funciones",
        "verificationDate": "2024-03-05",
        "verifiedBy": "ana.martinez",
        "reliability": "MEDIUM"
      },
      {
        "sourceId": "SRC-PEP-079",
        "sourceType": "SCREENING",
        "sourceName": "World-Check",
        "sourceDate": "2024-03-05",
        "screeningProvider": "Refinitiv",
        "screeningReference": "WC-VE-87654321",
        "matchQuality": "EXACT_MATCH",
        "pepStatus": "FORMER_PEP",
        "verificationDate": "2024-03-05",
        "verifiedBy": "ana.martinez",
        "reliability": "HIGH"
      }
    ],
    
    "riskImpact": {
      "riskScoreIncrement": 4,
      "riskLevelBefore": "LOW",
      "riskLevelAfter": "MEDIUM_HIGH",
      "requiresEnhancedDueDiligence": true,
      "enhancedDueDiligenceStatus": "REQUIRED",
      "additionalControls": [
        "Debida diligencia reforzada",
        "Revisión anual hasta cumplir 2 años de cese",
        "Documentación de actividad económica actual",
        "Monitoreo de transacciones"
      ]
    },
    
    "exPepManagement": {
      "cessationDate": "2022-12-31",
      "monthsSinceCessation": 14,
      "remainingMonthsAsExPep": 10,
      "automaticDowngradeDate": "2024-12-31",
      "downgradeNotificationSent": false,
      "downgradeNotificationDate": null,
      "extendedPeriodRequested": false,
      "extendedPeriodJustification": null,
      "monitoringUntilDowngrade": true
    },
    
    "complianceOfficerDecision": {
      "decisionDate": "2024-03-06T10:00:00Z",
      "decidedBy": "oficial.cumplimiento@empresa.com",
      "decision": "APPROVED_WITH_CONDITIONS",
      "justification": "Ex-PEP verificado. Cesó hace 14 meses. Se mantiene EDD hasta completar 24 meses desde el cese. Perfil de riesgo medio-alto.",
      "conditions": [
        "Revisión anual obligatoria",
        "Re-evaluación automática al cumplir 24 meses de cese",
        "Documentación de actividad económica actual",
        "Monitoreo estándar de transacciones"
      ],
      "approvalLevel": "COMPLIANCE_OFFICER",
      "nextMandatoryReview": "2025-03-06"
    },
    
    "pepHistory": [
      {
        "historyId": "PEPH-2024-089",
        "changeDate": "2024-03-05T14:00:00Z",
        "changedBy": "ana.martinez",
        "changeType": "INITIAL_CLASSIFICATION",
        "previousStatus": null,
        "newStatus": "PEP_FORMER",
        "justification": "Identificación de Ex-PEP durante evaluación inicial",
        "alertGenerated": true,
        "alertId": "ALT-PEP-2024-089"
      }
    ],
    
    "monitoringSchedule": {
      "reviewFrequency": "ANNUAL",
      "nextScheduledReview": "2025-03-05",
      "lastCompletedReview": "2024-03-05",
      "missedReviews": 0,
      "automatedMonitoring": true,
      "automaticDowngradeCheck": true,
      "monitoringAlerts": [
        {
          "alertType": "APPROACHING_DOWNGRADE",
          "scheduledDate": "2024-11-30",
          "message": "Ex-PEP próximo a cumplir 24 meses. Revisar para posible cambio a NO-PEP",
          "status": "PENDING"
        }
      ]
    }
  }
}
```

### 4.4 Estructura PEP para NO-PEP

```json
{
  "pepInformation": {
    "evaluationStatus": "COMPLETED",
    "lastEvaluationDate": "2024-01-20T09:30:00Z",
    "evaluatedBy": "luis.fernandez",
    "nextReviewDate": "2025-01-20",
    
    "isPep": false,
    "pepType": null,
    "pepCategory": "NON_PEP",
    
    "pepDetails": null,
    "relationshipToPep": null,
    
    "informationSources": [
      {
        "sourceId": "SRC-PEP-150",
        "sourceType": "CLIENT_DECLARATION",
        "sourceName": "Declaración del Cliente - Formulario KYC",
        "sourceDate": "2024-01-20",
        "verificationDate": "2024-01-20",
        "verifiedBy": "luis.fernandez",
        "reliability": "MEDIUM"
      },
      {
        "sourceId": "SRC-PEP-151",
        "sourceType": "SCREENING",
        "sourceName": "World-Check",
        "sourceDate": "2024-01-20",
        "screeningProvider": "Refinitiv",
        "screeningReference": "WC-VE-99887766",
        "matchQuality": "NO_MATCH",
        "verificationDate": "2024-01-20",
        "verifiedBy": "luis.fernandez",
        "reliability": "HIGH"
      }
    ],
    
    "riskImpact": {
      "riskScoreIncrement": 0,
      "requiresEnhancedDueDiligence": false,
      "enhancedDueDiligenceStatus": "NOT_REQUIRED",
      "additionalControls": []
    },
    
    "complianceOfficerDecision": null,
    
    "pepHistory": [
      {
        "historyId": "PEPH-2024-200",
        "changeDate": "2024-01-20T09:30:00Z",
        "changedBy": "luis.fernandez",
        "changeType": "INITIAL_CLASSIFICATION",
        "previousStatus": null,
        "newStatus": "NON_PEP",
        "justification": "Evaluación inicial confirma que no es PEP ni tiene vínculos con PEPs",
        "alertGenerated": false,
        "alertId": null
      }
    ],
    
    "monitoringSchedule": {
      "reviewFrequency": "ANNUAL",
      "nextScheduledReview": "2025-01-20",
      "lastCompletedReview": "2024-01-20",
      "missedReviews": 0,
      "automatedMonitoring": false,
      "monitoringAlerts": []
    }
  }
}
```

### 4.5 Catálogo de Tipos de PEP (Configurable)

```json
{
  "pepTypeCatalog": {
    "catalogId": "CAT-PEP-TYPES-2024",
    "version": "1.0",
    "effectiveDate": "2024-01-01",
    "pepTypes": [
      {
        "code": "PEP_NATIONAL",
        "name": "PEP Nacional",
        "description": "Persona que ejerce o ejerció funciones públicas prominentes en Venezuela",
        "riskScoreIncrement": 5,
        "requiresEDD": true,
        "reviewFrequencyMonths": 6,
        "active": true
      },
      {
        "code": "PEP_FOREIGN",
        "name": "PEP Extranjero",
        "description": "Persona que ejerce o ejerció funciones públicas prominentes en otro país",
        "riskScoreIncrement": 5,
        "requiresEDD": true,
        "reviewFrequencyMonths": 6,
        "active": true
      },
      {
        "code": "PEP_INTERNATIONAL",
        "name": "PEP Internacional",
        "description": "Persona que ejerce funciones en organismos internacionales prominentes",
        "riskScoreIncrement": 4,
        "requiresEDD": true,
        "reviewFrequencyMonths": 6,
        "active": true
      },
      {
        "code": "PEP_FORMER",
        "name": "Ex-PEP",
        "description": "Persona que cesó funciones PEP hace más de 1 año pero menos de 2 años",
        "riskScoreIncrement": 4,
        "requiresEDD": true,
        "reviewFrequencyMonths": 12,
        "downgradeMonths": 24,
        "active": true
      },
      {
        "code": "PEP_FAMILY",
        "name": "Familiar de PEP",
        "description": "Familiar directo de un PEP activo o ex-PEP",
        "riskScoreIncrement": 3,
        "requiresEDD": true,
        "reviewFrequencyMonths": 12,
        "active": true,
        "relationships": [
          "SPOUSE",
          "CHILD",
          "PARENT",
          "SIBLING",
          "GRANDPARENT",
          "GRANDCHILD"
        ]
      },
      {
        "code": "PEP_ASSOCIATE",
        "name": "Vinculado a PEP",
        "description": "Persona con relación comercial o profesional estrecha con PEP",
        "riskScoreIncrement": 2,
        "requiresEDD": false,
        "reviewFrequencyMonths": 12,
        "active": true,
        "relationships": [
          "BUSINESS_PARTNER",
          "ATTORNEY_WITH_POWERS",
          "CO_INVESTOR",
          "JOINT_CONTROLLER"
        ]
      }
    ]
  }
}
```

### 4.6 Catálogo de Cargos PEP (Configurable)

```json
{
  "pepPositionsCatalog": {
    "catalogId": "CAT-PEP-POSITIONS-2024",
    "version": "1.0",
    "effectiveDate": "2024-01-01",
    "country": "VE",
    "positions": [
      {
        "positionId": "POS-001",
        "category": "EXECUTIVE_BRANCH",
        "positionName": "Presidente de la República",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "CRITICAL"
      },
      {
        "positionId": "POS-002",
        "category": "EXECUTIVE_BRANCH",
        "positionName": "Vicepresidente Ejecutivo",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "CRITICAL"
      },
      {
        "positionId": "POS-003",
        "category": "EXECUTIVE_BRANCH",
        "positionName": "Ministro del Poder Popular",
        "prominenceLevel": "HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-004",
        "category": "EXECUTIVE_BRANCH",
        "positionName": "Viceministro",
        "prominenceLevel": "MEDIUM_HIGH",
        "riskLevel": "MEDIUM_HIGH"
      },
      {
        "positionId": "POS-005",
        "category": "EXECUTIVE_BRANCH",
        "positionName": "Gobernador de Estado",
        "prominenceLevel": "HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-006",
        "category": "EXECUTIVE_BRANCH",
        "positionName": "Alcalde",
        "prominenceLevel": "MEDIUM",
        "riskLevel": "MEDIUM"
      },
      {
        "positionId": "POS-010",
        "category": "LEGISLATIVE_BRANCH",
        "positionName": "Presidente de la Asamblea Nacional",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-011",
        "category": "LEGISLATIVE_BRANCH",
        "positionName": "Diputado de la Asamblea Nacional",
        "prominenceLevel": "MEDIUM_HIGH",
        "riskLevel": "MEDIUM_HIGH"
      },
      {
        "positionId": "POS-020",
        "category": "JUDICIAL_BRANCH",
        "positionName": "Magistrado del Tribunal Supremo de Justicia",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-030",
        "category": "ELECTORAL_BRANCH",
        "positionName": "Rector del Consejo Nacional Electoral",
        "prominenceLevel": "HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-040",
        "category": "CITIZEN_BRANCH",
        "positionName": "Fiscal General de la República",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-041",
        "category": "CITIZEN_BRANCH",
        "positionName": "Contralor General de la República",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-042",
        "category": "CITIZEN_BRANCH",
        "positionName": "Defensor del Pueblo",
        "prominenceLevel": "HIGH",
        "riskLevel": "MEDIUM_HIGH"
      },
      {
        "positionId": "POS-050",
        "category": "MILITARY",
        "positionName": "General en Jefe de la FANB",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-051",
        "category": "MILITARY",
        "positionName": "Oficial General (Mayor General, General de División, etc.)",
        "prominenceLevel": "HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-060",
        "category": "STATE_OWNED_ENTERPRISES",
        "positionName": "Presidente de PDVSA",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-061",
        "category": "STATE_OWNED_ENTERPRISES",
        "positionName": "Presidente de BCV (Banco Central de Venezuela)",
        "prominenceLevel": "VERY_HIGH",
        "riskLevel": "CRITICAL"
      },
      {
        "positionId": "POS-062",
        "category": "STATE_OWNED_ENTERPRISES",
        "positionName": "Presidente/Director de Empresa del Estado",
        "prominenceLevel": "MEDIUM_HIGH",
        "riskLevel": "MEDIUM_HIGH"
      },
      {
        "positionId": "POS-070",
        "category": "REGULATORY_BODIES",
        "positionName": "Superintendente de Seguros (SUDEASEG)",
        "prominenceLevel": "HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-071",
        "category": "REGULATORY_BODIES",
        "positionName": "Superintendente Bancario (SUDEBAN)",
        "prominenceLevel": "HIGH",
        "riskLevel": "HIGH"
      },
      {
        "positionId": "POS-072",
        "category": "REGULATORY_BODIES",
        "positionName": "Superintendente de otro ente regulador",
        "prominenceLevel": "MEDIUM_HIGH",
        "riskLevel": "MEDIUM_HIGH"
      },
      {
        "positionId": "POS-080",
        "category": "POLITICAL_PARTIES",
        "positionName": "Presidente/Secretario General de Partido Político",
        "prominenceLevel": "MEDIUM_HIGH",
        "riskLevel": "MEDIUM"
      },
      {
        "positionId": "POS-090",
        "category": "INTERNATIONAL_ORGANIZATIONS",
        "positionName": "Alto funcionario de organismo internacional (ONU, OEA, OPEP, etc.)",
        "prominenceLevel": "HIGH",
        "riskLevel": "MEDIUM_HIGH"
      }
    ]
  }
}
```

---

## 5. INTEGRACIÓN CON EVALUACIÓN DE RIESGOS

### 5.1 Impacto de la Condición PEP en el Score de Riesgo

El módulo PEP se integra directamente con el motor de evaluación de riesgos del SIAR, modificando automáticamente el puntaje de riesgo.

#### 5.1.1 Factor PEP en la Categoría "Riesgo del Sujeto"

```json
{
  "riskFactors": {
    "subjectRisk": {
      "pepStatus": {
        "value": 5,
        "label": "MUY_ALTO",
        "isPep": true,
        "pepType": "PEP_NATIONAL",
        "position": "Director General de Ente Público",
        "justification": "PEP activo en cargo de alta relevancia regulatoria"
      }
    }
  }
}
```

#### 5.1.2 Tabla de Impacto PEP en Score de Riesgo

| Tipo PEP | Valor (escala 1-5) | Impacto en Nivel de Riesgo | EDD Obligatoria |
|----------|-------------------|------------------------------|-----------------|
| NO-PEP | 0 | Ninguno | No |
| Vinculado a PEP | 2-3 | Incremento moderado | No (recomendada) |
| Familiar de PEP | 3-4 | Incremento significativo | Sí |
| Ex-PEP | 4 | Alto incremento | Sí |
| PEP Nacional/Extranjero | 5 | Máximo incremento | Sí (obligatorio) |

#### 5.1.3 Reglas de Recalculo Automático

```javascript
// Pseudocódigo del motor de riesgo
function recalcularRiesgoPorCambioPEP(expediente, nuevaCondicionPEP) {
  // 1. Obtener evaluación de riesgo actual
  let evaluacionActual = obtenerEvaluacionRiesgo(expediente.id);
  
  // 2. Actualizar factor PEP
  evaluacionActual.riskFactors.subjectRisk.pepStatus.value = nuevaCondicionPEP.riskScoreIncrement;
  evaluacionActual.riskFactors.subjectRisk.pepStatus.isPep = nuevaCondicionPEP.isPep;
  evaluacionActual.riskFactors.subjectRisk.pepStatus.pepType = nuevaCondicionPEP.pepType;
  
  // 3. Recalcular score total
  let nuevoScore = calcularScoreConsolidado(evaluacionActual);
  
  // 4. Reclasificar nivel de riesgo
  let nuevoNivelRiesgo = clasificarNivelRiesgo(nuevoScore);
  
  // 5. Determinar si requiere EDD
  let requiereEDD = nuevaCondicionPEP.requiresEnhancedDueDiligence;
  
  // 6. Generar alerta si nivel de riesgo cambió
  if (nuevoNivelRiesgo !== evaluacionActual.decision.finalRiskLevel) {
    generarAlerta({
      tipo: "CAMBIO_NIVEL_RIESGO_POR_PEP",
      expedienteId: expediente.id,
      nivelAnterior: evaluacionActual.decision.finalRiskLevel,
      nivelNuevo: nuevoNivelRiesgo,
      motivoCambio: "Cambio en condición PEP"
    });
  }
  
  // 7. Generar alerta para Oficial de Cumplimiento
  generarAlerta({
    tipo: "CAMBIO_CONDICION_PEP",
    expedienteId: expediente.id,
    condicionAnterior: expediente.pepInformation.pepType,
    condicionNueva: nuevaCondicionPEP.pepType,
    requiereRevision: true
  });
  
  // 8. Si requiere EDD, actualizar controles internos
  if (requiereEDD) {
    activarDebidaDiligenciaReforzada(expediente.id);
  }
  
  // 9. Guardar nueva evaluación
  guardarNuevaEvaluacion(expediente.id, evaluacionActual);
  
  return {
    success: true,
    nuevoScore: nuevoScore,
    nuevoNivelRiesgo: nuevoNivelRiesgo,
    requiereEDD: requiereEDD
  };
}
```

### 5.2 Activación Automática de Debida Diligencia Reforzada (EDD)

Cuando se identifica una condición PEP que requiere EDD, el sistema automáticamente:

```json
{
  "internalControls": {
    "dueDiligenceLevel": "ENHANCED",
    "requiresEnhancedDueDiligence": true,
    "enhancedDueDiligenceReason": "PEP_STATUS",
    "enhancedDueDiligenceTriggeredBy": "AUTOMATIC_PEP_CLASSIFICATION",
    "enhancedDueDiligenceTriggeredDate": "2024-01-15T10:30:00Z",
    
    "applicableControls": [
      {
        "controlId": "CTRL-EDD-PEP-001",
        "controlName": "Verificación Ampliada de Identidad",
        "controlType": "IDENTITY_VERIFICATION",
        "implementationStatus": "REQUIRED",
        "mandatoryForPEP": true
      },
      {
        "controlId": "CTRL-EDD-PEP-002",
        "controlName": "Documentación de Fuente de Fondos y Patrimonio",
        "controlType": "FUNDS_VERIFICATION",
        "implementationStatus": "REQUIRED",
        "mandatoryForPEP": true,
        "requiredDocuments": [
          "Declaración de patrimonio",
          "Estados de cuenta bancarios",
          "Declaración de renta o impuestos",
          "Documentación de origen de fondos"
        ]
      },
      {
        "controlId": "CTRL-EDD-PEP-003",
        "controlName": "Verificación de Independencia Patrimonial (Familiares PEP)",
        "controlType": "INDEPENDENCE_VERIFICATION",
        "implementationStatus": "REQUIRED",
        "applicableWhen": "PEP_FAMILY",
        "mandatoryForPEP": true
      },
      {
        "controlId": "CTRL-EDD-PEP-004",
        "controlName": "Aprobación Obligatoria por Oficial de Cumplimiento",
        "controlType": "SENIOR_APPROVAL",
        "implementationStatus": "REQUIRED",
        "mandatoryForPEP": true,
        "approvalLevel": "COMPLIANCE_OFFICER"
      },
      {
        "controlId": "CTRL-EDD-PEP-005",
        "controlName": "Monitoreo Transaccional Reforzado",
        "controlType": "TRANSACTION_MONITORING",
        "implementationStatus": "REQUIRED",
        "mandatoryForPEP": true,
        "monitoringFrequency": "REAL_TIME",
        "thresholdReduction": 50
      },
      {
        "controlId": "CTRL-EDD-PEP-006",
        "controlName": "Revisión Periódica Reforzada",
        "controlType": "PERIODIC_REVIEW",
        "implementationStatus": "REQUIRED",
        "mandatoryForPEP": true,
        "reviewFrequency": "SEMI_ANNUAL_OR_ANNUAL",
        "nextReviewDate": "2024-07-15"
      }
    ]
  }
}
```

---

## 6. INTEGRACIÓN CON SCREENING

### 6.1 Flujo de Integración con Proveedor de Screening

```
EXPEDIENTE NUEVO/ACTUALIZACIÓN
           ↓
[1] Sistema envía solicitud a API de Screening
    POST /api/v1/screening/pep-check
    {
      "subject": {
        "fullName": "Juan Pérez",
        "documentType": "CEDULA",
        "documentNumber": "V-12345678",
        "birthDate": "1980-05-15",
        "nationality": "VE"
      },
      "screeningType": "PEP_SCREENING"
    }
           ↓
[2] Proveedor de Screening (World-Check, Dow Jones, etc.)
    realiza búsqueda en bases de datos PEP
           ↓
[3] Sistema recibe respuesta
    {
      "matchFound": true,
      "matchQuality": "EXACT_MATCH",
      "pepStatus": "ACTIVE_PEP",
      "details": {
        "name": "Juan Alberto Pérez",
        "position": "Ministro",
        "country": "VE",
        "startDate": "2022-01-15"
      }
    }
           ↓
[4] Sistema registra resultado en pepInformation.informationSources
           ↓
[5] Si hay match: Sistema pre-llena pepDetails con datos del screening
           ↓
[6] Usuario/Analista revisa y confirma/ajusta información
           ↓
[7] Se completa evaluación PEP
```

### 6.2 Estructura de Solicitud de Screening

```json
{
  "screeningRequest": {
    "requestId": "SCR-REQ-2024-001",
    "requestDate": "2024-01-15T10:30:00Z",
    "requestedBy": "maria.lopez",
    "dossierId": "DOS-CLI-2024-00123",
    
    "subject": {
      "fullName": "Juan Alberto Pérez Gómez",
      "documentType": "CEDULA",
      "documentNumber": "V-12345678",
      "birthDate": "1985-03-15",
      "nationality": "VE",
      "countryOfResidence": "VE"
    },
    
    "screeningTypes": [
      "PEP_SCREENING",
      "SANCTIONS_LIST",
      "ADVERSE_MEDIA"
    ],
    
    "provider": "REFINITIV_WORLD_CHECK",
    "urgency": "STANDARD"
  }
}
```

### 6.3 Estructura de Respuesta de Screening

```json
{
  "screeningResponse": {
    "responseId": "SCR-RES-2024-001",
    "requestId": "SCR-REQ-2024-001",
    "responseDate": "2024-01-15T10:32:15Z",
    "provider": "REFINITIV_WORLD_CHECK",
    "providerReference": "WC-VE-12345678",
    
    "overallResult": "MATCH_FOUND",
    "totalMatches": 1,
    
    "pepScreening": {
      "result": "MATCH_FOUND",
      "matchQuality": "EXACT_MATCH",
      "confidenceScore": 98,
      
      "matches": [
        {
          "matchId": "WC-MATCH-001",
          "matchScore": 98,
          "matchType": "EXACT_MATCH",
          
          "matchedData": {
            "name": "Juan Alberto Pérez Gómez",
            "alternateNames": ["Juan Pérez", "J.A. Pérez"],
            "pepStatus": "ACTIVE_PEP",
            "pepType": "NATIONAL_PEP",
            "position": "Director General",
            "institution": "Instituto Nacional de Seguros",
            "country": "VE",
            "startDate": "2022-03-15",
            "endDate": null,
            "prominenceLevel": "HIGH",
            "sourceDescription": "Official government gazette",
            "lastUpdated": "2024-01-10"
          },
          
          "matchFields": [
            {"field": "fullName", "matchScore": 100},
            {"field": "documentNumber", "matchScore": 100},
            {"field": "birthDate", "matchScore": 95}
          ]
        }
      ]
    },
    
    "sanctionsScreening": {
      "result": "NO_MATCH",
      "matchQuality": "NO_MATCH",
      "listsChecked": ["OFAC", "UN", "EU", "UK_HMT"]
    },
    
    "adverseMediaScreening": {
      "result": "NO_MATCH",
      "matchQuality": "NO_MATCH"
    },
    
    "recommendation": {
      "action": "ENHANCED_DUE_DILIGENCE",
      "rationale": "Subject identified as active PEP in high-level government position",
      "riskLevel": "HIGH"
    }
  }
}
```

### 6.4 Registro de Screening en el Expediente

```json
{
  "screeningHistory": [
    {
      "screeningId": "SCR-2024-001",
      "screeningDate": "2024-01-15T10:32:15Z",
      "screeningType": "PEP_SCREENING",
      "provider": "REFINITIV_WORLD_CHECK",
      "requestedBy": "maria.lopez",
      "result": "MATCH_FOUND",
      "matchQuality": "EXACT_MATCH",
      "pepStatusConfirmed": true,
      "pepType": "PEP_NATIONAL",
      "providerReference": "WC-VE-12345678",
      "screeningCost": {
        "amount": 15.00,
        "currency": "USD"
      },
      "actionTaken": "PEP_CONFIRMED_AND_REGISTERED",
      "reviewedBy": "maria.lopez",
      "reviewDate": "2024-01-15T10:45:00Z"
    },
    {
      "screeningId": "SCR-2024-045",
      "screeningDate": "2024-07-15T09:00:00Z",
      "screeningType": "PEP_SCREENING",
      "provider": "REFINITIV_WORLD_CHECK",
      "requestedBy": "AUTOMATIC_RECHECK",
      "result": "MATCH_FOUND",
      "matchQuality": "EXACT_MATCH",
      "pepStatusConfirmed": true,
      "pepType": "PEP_NATIONAL",
      "providerReference": "WC-VE-12345678-UPDATE",
      "statusChange": false,
      "actionTaken": "NO_CHANGE_CONFIRMED",
      "reviewedBy": "automatic_system",
      "reviewDate": "2024-07-15T09:05:00Z"
    }
  ]
}
```

---

## 7. ALERTAS Y NOTIFICACIONES PEP

### 7.1 Tipos de Alertas Relacionadas con PEP

```json
{
  "alertTypesCatalog": [
    {
      "alertCode": "ALT-PEP-001",
      "alertType": "PEP_IDENTIFICATION",
      "alertName": "Identificación de Condición PEP",
      "description": "Se ha identificado que el sujeto es PEP o tiene vínculos con PEP",
      "severity": "HIGH",
      "requiresImmediateAction": true,
      "assignedTo": "COMPLIANCE_OFFICER",
      "slaHours": 24
    },
    {
      "alertCode": "ALT-PEP-002",
      "alertType": "PEP_STATUS_CHANGE",
      "alertName": "Cambio de Estatus PEP",
      "description": "La condición PEP del sujeto ha cambiado",
      "severity": "HIGH",
      "requiresImmediateAction": true,
      "assignedTo": "COMPLIANCE_OFFICER",
      "slaHours": 24
    },
    {
      "alertCode": "ALT-PEP-003",
      "alertType": "EDD_REQUIRED",
      "alertName": "Debida Diligencia Reforzada Requerida",
      "description": "La condición PEP requiere activación de EDD",
      "severity": "MEDIUM",
      "requiresImmediateAction": false,
      "assignedTo": "COMPLIANCE_ANALYST",
      "slaHours": 48
    },
    {
      "alertCode": "ALT-PEP-004",
      "alertType": "PEP_PERIODIC_REVIEW_DUE",
      "alertName": "Revisión Periódica PEP Pendiente",
      "description": "El expediente PEP requiere revisión periódica",
      "severity": "MEDIUM",
      "requiresImmediateAction": false,
      "assignedTo": "COMPLIANCE_ANALYST",
      "slaHours": 72
    },
    {
      "alertCode": "ALT-PEP-005",
      "alertType": "EX_PEP_DOWNGRADE_APPROACHING",
      "alertName": "Ex-PEP Próximo a Cambio de Estatus",
      "description": "Ex-PEP está próximo a cumplir período de 24 meses",
      "severity": "LOW",
      "requiresImmediateAction": false,
      "assignedTo": "COMPLIANCE_ANALYST",
      "slaHours": 240
    },
    {
      "alertCode": "ALT-PEP-006",
      "alertType": "PEP_SCREENING_MATCH",
      "alertName": "Match en Screening PEP",
      "description": "El screening automático identificó un match PEP",
      "severity": "HIGH",
      "requiresImmediateAction": true,
      "assignedTo": "COMPLIANCE_ANALYST",
      "slaHours": 24
    },
    {
      "alertCode": "ALT-PEP-007",
      "alertType": "PEP_APPROVAL_PENDING",
      "alertName": "Expediente PEP Requiere Aprobación",
      "description": "Expediente con condición PEP requiere aprobación del Oficial de Cumplimiento",
      "severity": "HIGH",
      "requiresImmediateAction": true,
      "assignedTo": "COMPLIANCE_OFFICER",
      "slaHours": 48
    }
  ]
}
```

### 7.2 Ejemplo de Alerta Generada

```json
{
  "alert": {
    "alertId": "ALT-2024-PEP-00001",
    "alertUuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "alertType": "PEP_IDENTIFICATION",
    "alertCode": "ALT-PEP-001",
    "severity": "HIGH",
    
    "generatedDate": "2024-01-15T10:30:00Z",
    "generatedBy": "AUTOMATIC_SYSTEM",
    "triggerEvent": "PEP_CLASSIFICATION_DURING_DOSSIER_CREATION",
    
    "relatedEntities": {
      "dossierId": "DOS-CLI-2024-00123",
      "subjectId": "SUB-CLI-2024-00123",
      "subjectName": "Juan Alberto Pérez Gómez",
      "subjectType": "CLIENT"
    },
    
    "alertDetails": {
      "message": "Se ha identificado que el cliente Juan Alberto Pérez Gómez es una Persona Expuesta Políticamente (PEP Nacional - Activo)",
      "pepType": "PEP_NATIONAL",
      "position": "Director General de INASES",
      "riskImpact": "Incremento de nivel de riesgo de MEDIO a ALTO",
      "requiredActions": [
        "Revisar y validar la información PEP",
        "Activar Debida Diligencia Reforzada",
        "Documentar origen de fondos y patrimonio",
        "Aprobar expediente con condiciones especiales"
      ]
    },
    
    "assignment": {
      "assignedTo": "oficial.cumplimiento@empresa.com",
      "assignedRole": "COMPLIANCE_OFFICER",
      "assignedDate": "2024-01-15T10:30:00Z",
      "slaDeadline": "2024-01-16T10:30:00Z",
      "slaHoursRemaining": 24
    },
    
    "status": "OPEN",
    "priority": "URGENT",
    
    "workflowActions": [
      {
        "actionId": "ACT-001",
        "actionType": "REVIEW_PEP_INFORMATION",
        "actionDescription": "Revisar y validar información PEP",
        "status": "PENDING",
        "assignedTo": "oficial.cumplimiento@empresa.com"
      },
      {
        "actionId": "ACT-002",
        "actionType": "ACTIVATE_EDD",
        "actionDescription": "Activar controles de Debida Diligencia Reforzada",
        "status": "PENDING",
        "assignedTo": "oficial.cumplimiento@empresa.com"
      },
      {
        "actionId": "ACT-003",
        "actionType": "APPROVE_DOSSIER",
        "actionDescription": "Aprobar o rechazar expediente",
        "status": "PENDING",
        "assignedTo": "oficial.cumplimiento@empresa.com"
      }
    ],
    
    "resolution": null,
    "resolutionDate": null,
    "resolvedBy": null,
    
    "auditTrail": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "action": "ALERT_GENERATED",
        "performedBy": "SYSTEM",
        "details": "Alerta generada automáticamente por clasificación PEP"
      }
    ]
  }
}
```

---

## 8. IMPLEMENTACIÓN BACKEND (JAVA)

### 8.1 Entidad JPA - PepInformation

```java
package com.siar.pep.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.siar.common.model.AuditableEntity;
import com.siar.dossier.model.Dossier;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pep_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PepInformation extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "dossier_id", nullable = false, unique = true)
    private Dossier dossier;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_status", nullable = false)
    private PepEvaluationStatus evaluationStatus; // PENDING, COMPLETED, PENDING_VERIFICATION
    
    @Column(name = "last_evaluation_date", nullable = false)
    private LocalDateTime lastEvaluationDate;
    
    @Column(name = "evaluated_by")
    private String evaluatedBy;
    
    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;
    
    @Column(name = "is_pep", nullable = false)
    private Boolean isPep = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "pep_type")
    private PepType pepType; // PEP_NATIONAL, PEP_FOREIGN, PEP_FORMER, PEP_FAMILY, PEP_ASSOCIATE
    
    @Enumerated(EnumType.STRING)
    @Column(name = "pep_category")
    private PepCategory pepCategory; // ACTIVE_PEP, FORMER_PEP, FAMILY_MEMBER, ASSOCIATE, NON_PEP
    
    @Type(JsonType.class)
    @Column(name = "pep_details", columnDefinition = "jsonb")
    private JsonNode pepDetails;
    
    @Type(JsonType.class)
    @Column(name = "relationship_to_pep", columnDefinition = "jsonb")
    private JsonNode relationshipToPep;
    
    @Type(JsonType.class)
    @Column(name = "information_sources", columnDefinition = "jsonb")
    private JsonNode informationSources;
    
    @Type(JsonType.class)
    @Column(name = "risk_impact", columnDefinition = "jsonb")
    private JsonNode riskImpact;
    
    @Type(JsonType.class)
    @Column(name = "compliance_officer_decision", columnDefinition = "jsonb")
    private JsonNode complianceOfficerDecision;
    
    @Type(JsonType.class)
    @Column(name = "monitoring_schedule", columnDefinition = "jsonb")
    private JsonNode monitoringSchedule;
    
    @OneToMany(mappedBy = "pepInformation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PepChangeHistory> pepHistory = new ArrayList<>();
    
    @Column(name = "version")
    @Version
    private Integer version;
}
```

### 8.2 Entidad JPA - PepChangeHistory

```java
package com.siar.pep.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.siar.common.model.AuditableEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pep_change_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PepChangeHistory extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "history_id", nullable = false, unique = true)
    private String historyId;
    
    @Column(name = "history_uuid", nullable = false, unique = true)
    private UUID historyUuid;
    
    @ManyToOne
    @JoinColumn(name = "pep_information_id", nullable = false)
    private PepInformation pepInformation;
    
    @Column(name = "change_date", nullable = false)
    private LocalDateTime changeDate;
    
    @Column(name = "changed_by", nullable = false)
    private String changedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private PepChangeType changeType; // INITIAL_CLASSIFICATION, STATUS_UPDATE, PERIODIC_REVIEW, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private PepType previousStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    private PepType newStatus;
    
    @Type(JsonType.class)
    @Column(name = "previous_details", columnDefinition = "jsonb")
    private JsonNode previousDetails;
    
    @Type(JsonType.class)
    @Column(name = "new_details", columnDefinition = "jsonb")
    private JsonNode newDetails;
    
    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;
    
    @Column(name = "alert_generated")
    private Boolean alertGenerated = false;
    
    @Column(name = "alert_id")
    private String alertId;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @PrePersist
    protected void onCreate() {
        if (historyUuid == null) {
            historyUuid = UUID.randomUUID();
        }
        if (historyId == null) {
            historyId = generateHistoryId();
        }
    }
    
    private String generateHistoryId() {
        return "PEPH-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", System.currentTimeMillis() % 1000000);
    }
}
```

### 8.3 Enumeraciones

```java
package com.siar.pep.model;

public enum PepEvaluationStatus {
    PENDING,                // Evaluación pendiente
    COMPLETED,              // Evaluación completada
    PENDING_VERIFICATION,   // Pendiente de verificación adicional
    UNDER_REVIEW           // Bajo revisión por Oficial de Cumplimiento
}

public enum PepType {
    PEP_NATIONAL,           // PEP Nacional
    PEP_FOREIGN,            // PEP Extranjero
    PEP_INTERNATIONAL,      // PEP Internacional
    PEP_FORMER,             // Ex-PEP
    PEP_FAMILY,             // Familiar de PEP
    PEP_ASSOCIATE          // Vinculado a PEP
}

public enum PepCategory {
    ACTIVE_PEP,             // PEP activo
    FORMER_PEP,             // Ex-PEP
    FAMILY_MEMBER,          // Familiar de PEP
    ASSOCIATE,              // Vinculado a PEP
    NON_PEP                // No es PEP
}

public enum PepChangeType {
    INITIAL_CLASSIFICATION,  // Clasificación inicial
    STATUS_UPDATE,           // Actualización de estatus
    PERIODIC_REVIEW,         // Revisión periódica
    SCREENING_UPDATE,        // Actualización por screening
    MANUAL_CORRECTION,       // Corrección manual
    AUTOMATIC_DOWNGRADE     // Degradación automática (Ex-PEP a NO-PEP)
}

public enum PepRelationType {
    // Familiares directos
    SPOUSE,                 // Cónyuge
    CHILD,                  // Hijo/Hija
    PARENT,                 // Padre/Madre
    SIBLING,                // Hermano/Hermana
    GRANDPARENT,            // Abuelo/Abuela
    GRANDCHILD,             // Nieto/Nieta
    
    // Vinculados
    BUSINESS_PARTNER,       // Socio comercial
    ATTORNEY_WITH_POWERS,   // Apoderado
    CO_INVESTOR,            // Co-inversionista
    JOINT_CONTROLLER       // Controlador conjunto
}
```

### 8.4 DTOs (Data Transfer Objects)

```java
package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.siar.pep.model.PepType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PepInformationDTO {
    
    private Long id;
    private String evaluationStatus;
    private LocalDateTime lastEvaluationDate;
    private String evaluatedBy;
    private LocalDate nextReviewDate;
    
    private Boolean isPep;
    private String pepType;
    private String pepCategory;
    
    private PepDetailsDTO pepDetails;
    private RelationshipToPepDTO relationshipToPep;
    
    private List<InformationSourceDTO> informationSources;
    private RiskImpactDTO riskImpact;
    private ComplianceOfficerDecisionDTO complianceOfficerDecision;
    private MonitoringScheduleDTO monitoringSchedule;
    
    private List<PepChangeHistoryDTO> pepHistory;
    
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;
    private Integer version;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PepDetailsDTO {
    private String position;
    private String institution;
    private String institutionType;
    private String country;
    private String countryName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrentPosition;
    private String prominenceLevel;
    private String publicExposureDescription;
    
    // Para Ex-PEP
    private String cessationReason;
    private Integer monthsSinceCessation;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipToPepDTO {
    private String relationType;
    private String relationDescription;
    private String relatedPepName;
    private String relatedPepDocument;
    private String relatedPepPosition;
    private String relatedPepInstitution;
    private String relatedPepCountry;
    private String relatedPepStatus;
    private LocalDate relatedPepStartDate;
    private LocalDate relatedPepEndDate;
    private LocalDate relationshipStartDate;
    private LocalDate relationshipEndDate;
    private List<String> relationshipEvidence;
    private List<String> documentReferences;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InformationSourceDTO {
    private String sourceId;
    private String sourceType;
    private String sourceName;
    private LocalDate sourceDate;
    private String sourceReference;
    private LocalDateTime verificationDate;
    private String verifiedBy;
    private String reliability;
    private String screeningProvider;
    private String screeningReference;
    private String matchQuality;
    private String documentReference;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskImpactDTO {
    private Integer riskScoreIncrement;
    private String riskLevelBefore;
    private String riskLevelAfter;
    private Boolean requiresEnhancedDueDiligence;
    private String enhancedDueDiligenceStatus;
    private List<String> additionalControls;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceOfficerDecisionDTO {
    private LocalDateTime decisionDate;
    private String decidedBy;
    private String decision;
    private String justification;
    private List<String> conditions;
    private String approvalLevel;
    private LocalDate nextMandatoryReview;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringScheduleDTO {
    private String reviewFrequency;
    private LocalDate nextScheduledReview;
    private LocalDate lastCompletedReview;
    private Integer missedReviews;
    private Boolean automatedMonitoring;
    private List<MonitoringAlertDTO> monitoringAlerts;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringAlertDTO {
    private String alertType;
    private LocalDate scheduledDate;
    private String message;
    private String status;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PepChangeHistoryDTO {
    private String historyId;
    private LocalDateTime changeDate;
    private String changedBy;
    private String changeType;
    private String previousStatus;
    private String newStatus;
    private String justification;
    private Boolean alertGenerated;
    private String alertId;
}
```

### 8.5 Servicio - PepManagementService

```java
package com.siar.pep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.siar.alert.service.AlertService;
import com.siar.dossier.model.Dossier;
import com.siar.dossier.repository.DossierRepository;
import com.siar.pep.dto.*;
import com.siar.pep.model.*;
import com.siar.pep.repository.PepInformationRepository;
import com.siar.risk.service.RiskAssessmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PepManagementService {
    
    private final PepInformationRepository pepRepository;
    private final DossierRepository dossierRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final AlertService alertService;
    private final ObjectMapper objectMapper;
    
    /**
     * Crea la evaluación inicial PEP para un expediente
     */
    public PepInformationDTO createInitialPepEvaluation(Long dossierId, PepInformationDTO pepDTO, String evaluatedBy) {
        log.info("Creating initial PEP evaluation for dossier: {}", dossierId);
        
        // Validar que el expediente existe
        Dossier dossier = dossierRepository.findById(dossierId)
            .orElseThrow(() -> new RuntimeException("Dossier not found: " + dossierId));
        
        // Verificar que no existe evaluación previa
        if (pepRepository.findByDossierId(dossierId).isPresent()) {
            throw new RuntimeException("PEP evaluation already exists for dossier: " + dossierId);
        }
        
        // Crear entidad PepInformation
        PepInformation pepInfo = PepInformation.builder()
            .dossier(dossier)
            .evaluationStatus(PepEvaluationStatus.COMPLETED)
            .lastEvaluationDate(LocalDateTime.now())
            .evaluatedBy(evaluatedBy)
            .isPep(pepDTO.getIsPep())
            .build();
        
        if (pepDTO.getIsPep()) {
            pepInfo.setPepType(PepType.valueOf(pepDTO.getPepType()));
            pepInfo.setPepCategory(PepCategory.valueOf(pepDTO.getPepCategory()));
            
            // Convertir DTOs a JSON
            pepInfo.setPepDetails(objectMapper.valueToTree(pepDTO.getPepDetails()));
            
            if (pepDTO.getRelationshipToPep() != null) {
                pepInfo.setRelationshipToPep(objectMapper.valueToTree(pepDTO.getRelationshipToPep()));
            }
            
            pepInfo.setInformationSources(objectMapper.valueToTree(pepDTO.getInformationSources()));
            
            // Calcular impacto en riesgo
            RiskImpactDTO riskImpact = calculateRiskImpact(dossier, pepDTO);
            pepInfo.setRiskImpact(objectMapper.valueToTree(riskImpact));
            
            // Configurar monitoreo
            MonitoringScheduleDTO monitoringSchedule = createMonitoringSchedule(pepDTO.getPepType());
            pepInfo.setMonitoringSchedule(objectMapper.valueToTree(monitoringSchedule));
            pepInfo.setNextReviewDate(monitoringSchedule.getNextScheduledReview());
        } else {
            pepInfo.setPepCategory(PepCategory.NON_PEP);
            
            // Monitoreo anual para NO-PEP
            MonitoringScheduleDTO monitoringSchedule = MonitoringScheduleDTO.builder()
                .reviewFrequency("ANNUAL")
                .nextScheduledReview(LocalDate.now().plusYears(1))
                .lastCompletedReview(LocalDate.now())
                .missedReviews(0)
                .automatedMonitoring(false)
                .build();
            pepInfo.setMonitoringSchedule(objectMapper.valueToTree(monitoringSchedule));
            pepInfo.setNextReviewDate(monitoringSchedule.getNextScheduledReview());
        }
        
        // Guardar
        pepInfo = pepRepository.save(pepInfo);
        
        // Registrar en historial
        addPepHistory(pepInfo, null, pepDTO.getPepType(), PepChangeType.INITIAL_CLASSIFICATION, 
                     "Clasificación PEP inicial durante creación de expediente", evaluatedBy);
        
        // Si es PEP, generar alerta y recalcular riesgo
        if (pepDTO.getIsPep()) {
            // Generar alerta
            String alertId = alertService.generatePepIdentificationAlert(dossier, pepInfo);
            
            // Actualizar historial con ID de alerta
            pepInfo.getPepHistory().get(0).setAlertGenerated(true);
            pepInfo.getPepHistory().get(0).setAlertId(alertId);
            
            // Recalcular evaluación de riesgo
            riskAssessmentService.recalculateRiskByPepChange(dossierId, pepInfo);
            
            // Activar EDD si es necesario
            if (Boolean.TRUE.equals(pepDTO.getRiskImpact().getRequiresEnhancedDueDiligence())) {
                activateEnhancedDueDiligence(dossier, pepInfo);
            }
        }
        
        return convertToDTO(pepInfo);
    }
    
    /**
     * Actualiza la condición PEP de un expediente
     */
    public PepInformationDTO updatePepStatus(Long dossierId, PepInformationDTO pepDTO, String updatedBy) {
        log.info("Updating PEP status for dossier: {}", dossierId);
        
        PepInformation pepInfo = pepRepository.findByDossierId(dossierId)
            .orElseThrow(() -> new RuntimeException("PEP information not found for dossier: " + dossierId));
        
        Dossier dossier = pepInfo.getDossier();
        
        // Guardar estado anterior
        String previousPepType = pepInfo.getPepType() != null ? pepInfo.getPepType().name() : null;
        Boolean previousIsPep = pepInfo.getIsPep();
        
        // Actualizar información
        pepInfo.setIsPep(pepDTO.getIsPep());
        pepInfo.setLastEvaluationDate(LocalDateTime.now());
        pepInfo.setEvaluatedBy(updatedBy);
        
        if (pepDTO.getIsPep()) {
            pepInfo.setPepType(PepType.valueOf(pepDTO.getPepType()));
            pepInfo.setPepCategory(PepCategory.valueOf(pepDTO.getPepCategory()));
            pepInfo.setPepDetails(objectMapper.valueToTree(pepDTO.getPepDetails()));
            
            if (pepDTO.getRelationshipToPep() != null) {
                pepInfo.setRelationshipToPep(objectMapper.valueToTree(pepDTO.getRelationshipToPep()));
            }
            
            // Actualizar fuentes de información
            pepInfo.setInformationSources(objectMapper.valueToTree(pepDTO.getInformationSources()));
            
            // Recalcular impacto en riesgo
            RiskImpactDTO riskImpact = calculateRiskImpact(dossier, pepDTO);
            pepInfo.setRiskImpact(objectMapper.valueToTree(riskImpact));
            
            // Actualizar monitoreo
            MonitoringScheduleDTO monitoringSchedule = createMonitoringSchedule(pepDTO.getPepType());
            pepInfo.setMonitoringSchedule(objectMapper.valueToTree(monitoringSchedule));
            pepInfo.setNextReviewDate(monitoringSchedule.getNextScheduledReview());
        } else {
            pepInfo.setPepType(null);
            pepInfo.setPepCategory(PepCategory.NON_PEP);
            pepInfo.setPepDetails(null);
            pepInfo.setRelationshipToPep(null);
            pepInfo.setRiskImpact(null);
        }
        
        pepInfo = pepRepository.save(pepInfo);
        
        // Registrar cambio en historial
        String justification = String.format("Cambio de condición PEP de %s a %s", 
            previousIsPep ? previousPepType : "NO-PEP",
            pepDTO.getIsPep() ? pepDTO.getPepType() : "NO-PEP");
        
        addPepHistory(pepInfo, previousPepType, pepDTO.getPepType(), 
                     PepChangeType.STATUS_UPDATE, justification, updatedBy);
        
        // Generar alerta de cambio de estatus
        String alertId = alertService.generatePepStatusChangeAlert(dossier, pepInfo, previousPepType, pepDTO.getPepType());
        
        pepInfo.getPepHistory().get(0).setAlertGenerated(true);
        pepInfo.getPepHistory().get(0).setAlertId(alertId);
        
        // Recalcular riesgo
        riskAssessmentService.recalculateRiskByPepChange(dossierId, pepInfo);
        
        // Activar/Desactivar EDD según corresponda
        if (pepDTO.getIsPep() && Boolean.TRUE.equals(pepDTO.getRiskImpact().getRequiresEnhancedDueDiligence())) {
            activateEnhancedDueDiligence(dossier, pepInfo);
        }
        
        return convertToDTO(pepInfo);
    }
    
    /**
     * Calcula el impacto en riesgo de la condición PEP
     */
    private RiskImpactDTO calculateRiskImpact(Dossier dossier, PepInformationDTO pepDTO) {
        // Obtener configuración de impacto según tipo PEP
        int riskScoreIncrement = getRiskScoreIncrement(pepDTO.getPepType());
        
        // Obtener nivel de riesgo actual del expediente
        String currentRiskLevel = dossier.getRiskLevel() != null ? dossier.getRiskLevel() : "LOW";
        
        // Calcular nuevo nivel de riesgo (simplificado)
        String newRiskLevel = calculateNewRiskLevel(currentRiskLevel, riskScoreIncrement);
        
        // Determinar si requiere EDD
        boolean requiresEDD = requiresEnhancedDueDiligence(pepDTO.getPepType());
        
        return RiskImpactDTO.builder()
            .riskScoreIncrement(riskScoreIncrement)
            .riskLevelBefore(currentRiskLevel)
            .riskLevelAfter(newRiskLevel)
            .requiresEnhancedDueDiligence(requiresEDD)
            .enhancedDueDiligenceStatus(requiresEDD ? "REQUIRED" : "NOT_REQUIRED")
            .additionalControls(getAdditionalControls(pepDTO.getPepType()))
            .build();
    }
    
    private int getRiskScoreIncrement(String pepType) {
        return switch (PepType.valueOf(pepType)) {
            case PEP_NATIONAL, PEP_FOREIGN, PEP_INTERNATIONAL -> 5;
            case PEP_FORMER -> 4;
            case PEP_FAMILY -> 3;
            case PEP_ASSOCIATE -> 2;
        };
    }
    
    private boolean requiresEnhancedDueDiligence(String pepType) {
        PepType type = PepType.valueOf(pepType);
        return type == PepType.PEP_NATIONAL || 
               type == PepType.PEP_FOREIGN || 
               type == PepType.PEP_INTERNATIONAL || 
               type == PepType.PEP_FORMER || 
               type == PepType.PEP_FAMILY;
    }
    
    private List<String> getAdditionalControls(String pepType) {
        // Retornar controles según tipo de PEP
        return List.of(
            "Aprobación obligatoria por Oficial de Cumplimiento",
            "Debida diligencia reforzada",
            "Documentación ampliada de origen de fondos",
            "Monitoreo transaccional reforzado",
            "Revisión periódica según tipo PEP"
        );
    }
    
    private String calculateNewRiskLevel(String currentLevel, int increment) {
        // Lógica simplificada - en producción usar el motor de riesgo completo
        if (increment >= 4) {
            return "HIGH";
        } else if (increment >= 2) {
            return "MEDIUM_HIGH";
        }
        return currentLevel;
    }
    
    /**
     * Crea el schedule de monitoreo según tipo PEP
     */
    private MonitoringScheduleDTO createMonitoringSchedule(String pepType) {
        PepType type = PepType.valueOf(pepType);
        
        String reviewFrequency;
        LocalDate nextReview;
        
        switch (type) {
            case PEP_NATIONAL, PEP_FOREIGN, PEP_INTERNATIONAL -> {
                reviewFrequency = "SEMI_ANNUAL";
                nextReview = LocalDate.now().plusMonths(6);
            }
            case PEP_FORMER, PEP_FAMILY, PEP_ASSOCIATE -> {
                reviewFrequency = "ANNUAL";
                nextReview = LocalDate.now().plusYears(1);
            }
            default -> {
                reviewFrequency = "ANNUAL";
                nextReview = LocalDate.now().plusYears(1);
            }
        }
        
        return MonitoringScheduleDTO.builder()
            .reviewFrequency(reviewFrequency)
            .nextScheduledReview(nextReview)
            .lastCompletedReview(LocalDate.now())
            .missedReviews(0)
            .automatedMonitoring(true)
            .build();
    }
    
    /**
     * Registra un cambio en el historial PEP
     */
    private void addPepHistory(PepInformation pepInfo, String previousStatus, String newStatus,
                              PepChangeType changeType, String justification, String changedBy) {
        
        PepChangeHistory history = PepChangeHistory.builder()
            .pepInformation(pepInfo)
            .changeDate(LocalDateTime.now())
            .changedBy(changedBy)
            .changeType(changeType)
            .previousStatus(previousStatus != null ? PepType.valueOf(previousStatus) : null)
            .newStatus(newStatus != null ? PepType.valueOf(newStatus) : null)
            .justification(justification)
            .alertGenerated(false)
            .build();
        
        pepInfo.getPepHistory().add(history);
    }
    
    /**
     * Activa la debida diligencia reforzada para un expediente PEP
     */
    private void activateEnhancedDueDiligence(Dossier dossier, PepInformation pepInfo) {
        log.info("Activating Enhanced Due Diligence for dossier: {}", dossier.getId());
        
        // Lógica para activar EDD
        // Esto se integrará con el módulo de Due Diligence
        // Por ahora, solo registramos el evento
        
        // TODO: Integrar con módulo de Due Diligence
    }
    
    /**
     * Convierte entidad a DTO
     */
    private PepInformationDTO convertToDTO(PepInformation pepInfo) {
        // Implementar conversión completa
        // Por simplicidad, se muestra versión básica
        return PepInformationDTO.builder()
            .id(pepInfo.getId())
            .evaluationStatus(pepInfo.getEvaluationStatus().name())
            .lastEvaluationDate(pepInfo.getLastEvaluationDate())
            .evaluatedBy(pepInfo.getEvaluatedBy())
            .nextReviewDate(pepInfo.getNextReviewDate())
            .isPep(pepInfo.getIsPep())
            .pepType(pepInfo.getPepType() != null ? pepInfo.getPepType().name() : null)
            .pepCategory(pepInfo.getPepCategory() != null ? pepInfo.getPepCategory().name() : null)
            .build();
    }
}
```

---

## 9. API ENDPOINTS

### 9.1 Endpoints REST para Gestión PEP

```
# Evaluación PEP

POST   /api/v1/pep/dossier/{dossierId}/evaluation
       Crear evaluación inicial PEP para un expediente

GET    /api/v1/pep/dossier/{dossierId}
       Obtener información PEP de un expediente

PUT    /api/v1/pep/dossier/{dossierId}
       Actualizar condición PEP de un expediente

GET    /api/v1/pep/dossier/{dossierId}/history
       Obtener historial de cambios PEP

# Aprobación del Oficial de Cumplimiento

POST   /api/v1/pep/dossier/{dossierId}/approve
       Aprobar expediente PEP

POST   /api/v1/pep/dossier/{dossierId}/reject
       Rechazar expediente PEP

POST   /api/v1/pep/dossier/{dossierId}/request-info
       Solicitar información adicional

# Monitoreo y Revisiones

GET    /api/v1/pep/reviews/pending
       Listar expedientes PEP con revisión pendiente

POST   /api/v1/pep/dossier/{dossierId}/periodic-review
       Registrar revisión periódica

GET    /api/v1/pep/reviews/overdue
       Listar expedientes PEP con revisión vencida

# Catálogos

GET    /api/v1/pep/catalog/types
       Obtener catálogo de tipos PEP

GET    /api/v1/pep/catalog/positions
       Obtener catálogo de cargos PEP

GET    /api/v1/pep/catalog/relationships
       Obtener catálogo de relaciones con PEP

# Screening

POST   /api/v1/pep/screening/check
       Realizar consulta de screening PEP

GET    /api/v1/pep/dossier/{dossierId}/screening-history
       Obtener historial de screening

# Alertas

GET    /api/v1/pep/alerts/pending
       Listar alertas PEP pendientes

PUT    /api/v1/pep/alerts/{alertId}/resolve
       Resolver alerta PEP

# Reportes

GET    /api/v1/pep/reports/active-peps
       Reporte de PEPs activos

GET    /api/v1/pep/reports/pending-reviews
       Reporte de revisiones PEP pendientes

GET    /api/v1/pep/reports/ex-peps-approaching-downgrade
       Reporte de Ex-PEPs próximos a degradación
```

### 9.2 Ejemplo de Request/Response

#### POST /api/v1/pep/dossier/{dossierId}/evaluation

**Request Body:**
```json
{
  "isPep": true,
  "pepType": "PEP_NATIONAL",
  "pepCategory": "ACTIVE_PEP",
  "pepDetails": {
    "position": "Ministro de Economía",
    "institution": "Ministerio del Poder Popular para Economía",
    "institutionType": "GOVERNMENT_MINISTRY",
    "country": "VE",
    "startDate": "2023-01-15",
    "isCurrentPosition": true,
    "prominenceLevel": "VERY_HIGH"
  },
  "informationSources": [
    {
      "sourceType": "OFFICIAL_GAZETTE",
      "sourceName": "Gaceta Oficial N° 42.500",
      "sourceDate": "2023-01-20",
      "sourceReference": "Decreto de nombramiento",
      "reliability": "HIGH"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "PEP evaluation created successfully",
  "data": {
    "id": 1,
    "evaluationStatus": "COMPLETED",
    "lastEvaluationDate": "2024-12-14T10:30:00Z",
    "evaluatedBy": "maria.lopez",
    "nextReviewDate": "2025-06-14",
    "isPep": true,
    "pepType": "PEP_NATIONAL",
    "pepCategory": "ACTIVE_PEP",
    "riskImpact": {
      "riskScoreIncrement": 5,
      "riskLevelBefore": "MEDIUM",
      "riskLevelAfter": "HIGH",
      "requiresEnhancedDueDiligence": true,
      "enhancedDueDiligenceStatus": "REQUIRED"
    },
    "monitoringSchedule": {
      "reviewFrequency": "SEMI_ANNUAL",
      "nextScheduledReview": "2025-06-14"
    }
  },
  "alerts": [
    {
      "alertId": "ALT-PEP-2024-001",
      "alertType": "PEP_IDENTIFICATION",
      "severity": "HIGH",
      "message": "PEP Nacional identificado - Requiere revisión del Oficial de Cumplimiento"
    }
  ]
}
```

---

## 10. REPORTES REGULATORIOS

### 10.1 Reporte de PEPs Activos

**Contenido:**
- Lista completa de todos los PEPs activos
- Tipo de PEP (Nacional, Extranjero, Familiar, etc.)
- Cargo y fecha de inicio
- Nivel de riesgo asignado
- Estado de debida diligencia reforzada
- Fecha de última revisión
- Fecha de próxima revisión

### 10.2 Reporte de Cambios de Condición PEP

**Contenido:**
- Todos los cambios de condición PEP en el período
- Cliente/Entidad afectada
- Condición anterior y nueva
- Fecha del cambio
- Usuario que realizó el cambio
- Justificación documentada
- Alerta generada
- Acción del Oficial de Cumplimiento

### 10.3 Reporte de Revisiones PEP

**Contenido:**
- Expedientes PEP revisados en el período
- Frecuencia de revisión cumplida
- Resultados de las revisiones
- Cambios detectados
- Acciones tomadas
- Expedientes con revisión vencida

---

## 11. CONSIDERACIONES FINALES

### 11.1 Mejores Prácticas

1. **Documentación Exhaustiva**: Todo registro PEP debe estar respaldado por fuentes confiables
2. **Revisión Independiente**: La clasificación PEP debe ser revisada por personal independiente
3. **Actualización Continua**: Mantener la información PEP actualizada mediante screening periódico
4. **Escalamiento Apropiado**: PEPs de alta prominencia requieren aprobación de niveles superiores
5. **Evidencia Regulatoria**: Mantener documentación organizada para inspecciones

### 11.2 Integración con Otros Módulos

- **Módulo de Expedientes**: PEP es parte integral del expediente único
- **Módulo de Riesgo**: Impacto directo en evaluación de riesgo
- **Módulo de Debida Diligencia**: Activación automática de EDD
- **Módulo de Screening**: Validación mediante servicios externos
- **Módulo de Alertas**: Notificaciones automáticas al Oficial de Cumplimiento
- **Módulo de Auditoría**: Trazabilidad completa de cambios

### 11.3 Mantenimiento y Evolución

- Actualizar catálogo de cargos PEP según cambios regulatorios
- Revisar periódicamente umbrales de riesgo
- Ajustar frecuencias de revisión según experiencia
- Incorporar feedback de inspecciones regulatorias
- Mantener integración con proveedores de screening actualizados

---

**Fin del Documento**
