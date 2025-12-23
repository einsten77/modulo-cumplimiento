# SIAR - Modelo de Evaluación Inicial de Riesgos

## 1. Visión General

El módulo de Evaluación Inicial de Riesgos es un componente crítico del SIAR que implementa el Enfoque Basado en Riesgo (EBR) requerido por las regulaciones venezolanas para empresas de seguros.

### 1.1 Objetivos

- Evaluar el nivel de riesgo de LA/FT para cada sujeto, producto y región
- Permitir parametrización completa por el Oficial de Cumplimiento
- Generar alertas automáticas para riesgos Medio y Alto
- Mantener trazabilidad completa de todas las evaluaciones
- Facilitar la supervisión regulatoria

### 1.2 Características Clave

- **Obligatoriedad**: Evaluación requerida antes de aprobar cualquier expediente
- **Flexibilidad**: Ponderaciones configurables sin programación
- **Trazabilidad**: Registro inmutable de todas las evaluaciones y cambios
- **Transparencia**: Historial completo visible para auditorías
- **Alertas**: Notificaciones automáticas según nivel de riesgo

---

## 2. Factores de Riesgo

### 2.1 Categorías de Factores

#### A. Riesgo del Sujeto (SUBJECT_RISK)
- **Tipo de persona**: Natural vs Jurídica
- **Actividad económica**: Según clasificación regulatoria
- **Origen de los fondos**: Fuentes de ingresos
- **Complejidad del beneficiario final**: Estructura de propiedad
- **Condición PEP**: Persona Expuesta Políticamente o familiar

#### B. Riesgo del Producto (PRODUCT_RISK)
- **Tipo de producto**: Vida, no vida, pensiones, etc.
- **Uso del producto**: Propósito declarado
- **Complejidad del producto**: Estructura y características

#### C. Riesgo del Canal (CHANNEL_RISK)
- **Canal de distribución**: Directo, intermediario, digital, etc.
- **Controles del canal**: Verificaciones implementadas

#### D. Riesgo Geográfico (GEOGRAPHIC_RISK)
- **País de domicilio**: Riesgo país según GAFI
- **Regiones de alto riesgo en Venezuela**: Zonas identificadas
- **Zonas fronterizas**: Proximidad a fronteras internacionales
- **Arco Minero del Orinoco**: Zona de alto riesgo
- **Proximidad a centros penitenciarios**: Radio de 5 km

#### E. Controles Internos (INTERNAL_CONTROLS)
- **Existencia de controles**: Políticas y procedimientos
- **Efectividad de controles**: Capacidad de mitigación
- **Frecuencia de revisión**: Periodicidad de validación

### 2.2 Escala de Ponderación

| Valor | Etiqueta | Descripción |
|-------|----------|-------------|
| 0 | NO_APLICA | Factor no aplicable al caso |
| 1 | MUY_BAJO | Riesgo insignificante |
| 2 | BAJO | Riesgo menor, bien controlado |
| 3 | MEDIO | Riesgo moderado, requiere atención |
| 4 | ALTO | Riesgo significativo, requiere mitigación |
| 5 | MUY_ALTO | Riesgo crítico, requiere acción inmediata |

---

## 3. Lógica de Consolidación de Riesgos

### 3.1 Metodología de Cálculo

El sistema utiliza un modelo de ponderación configurable que calcula el riesgo consolidado mediante:

#### Paso 1: Cálculo por Categoría
Para cada categoría de riesgo:

```
Puntaje_Categoría = Σ(Factor_i × Peso_i) / Σ(Peso_i aplicables)
```

Donde:
- `Factor_i`: Valor del factor individual (0-5)
- `Peso_i`: Peso asignado a ese factor por el Oficial de Cumplimiento
- Solo se consideran factores donde `Factor_i > 0` (aplica)

#### Paso 2: Aplicación de Pesos Categoriales
```
Puntaje_Bruto = Σ(Puntaje_Categoría_j × Peso_Categoría_j) / Σ(Peso_Categoría_j)
```

Donde:
- `Puntaje_Categoría_j`: Puntaje calculado para cada categoría
- `Peso_Categoría_j`: Peso de la categoría (configurable por Oficial)

#### Paso 3: Ajuste por Controles Internos
```
Factor_Mitigación = 1 - (Controles_Internos / 10)
Puntaje_Ajustado = Puntaje_Bruto × Factor_Mitigación
```

Los controles internos fuertes reducen el riesgo final.

#### Paso 4: Clasificación Final
```
SI Puntaje_Ajustado <= 2.0  → BAJO
SI 2.0 < Puntaje_Ajustado <= 3.5 → MEDIO
SI Puntaje_Ajustado > 3.5 → ALTO
```

### 3.2 Configuración de Pesos por Defecto

```json
{
  "categoryWeights": {
    "SUBJECT_RISK": 35,
    "PRODUCT_RISK": 20,
    "CHANNEL_RISK": 15,
    "GEOGRAPHIC_RISK": 20,
    "INTERNAL_CONTROLS": 10
  },
  "factorWeights": {
    "SUBJECT_RISK": {
      "personType": 20,
      "economicActivity": 30,
      "fundsOrigin": 25,
      "beneficiaryComplexity": 15,
      "pepStatus": 10
    },
    "PRODUCT_RISK": {
      "productType": 40,
      "productUsage": 35,
      "productComplexity": 25
    },
    "CHANNEL_RISK": {
      "distributionChannel": 60,
      "channelControls": 40
    },
    "GEOGRAPHIC_RISK": {
      "countryRisk": 30,
      "highRiskRegion": 25,
      "borderZone": 20,
      "miningArc": 15,
      "prisonProximity": 10
    },
    "INTERNAL_CONTROLS": {
      "controlExistence": 50,
      "controlEffectiveness": 50
    }
  },
  "thresholds": {
    "lowToMedium": 2.0,
    "mediumToHigh": 3.5
  }
}
```

---

## 4. Modelo de Datos JSON

### 4.1 Estructura de Evaluación de Riesgos

```json
{
  "riskAssessmentId": "RA-2024-000001",
  "dossierId": "DOS-CLI-2024-000123",
  "assessmentType": "INITIAL",
  "evaluationDate": "2024-01-15T10:30:00Z",
  "evaluatedBy": "user-compliance-001",
  "status": "APPROVED",
  
  "subjectInfo": {
    "subjectId": "SUB-CLI-2024-000123",
    "subjectType": "CLIENT",
    "personType": "LEGAL",
    "name": "Empresa de Transporte ABC, C.A."
  },
  
  "riskFactors": {
    "subjectRisk": {
      "personType": {
        "value": 2,
        "label": "BAJO",
        "justification": "Persona jurídica local con estructura clara"
      },
      "economicActivity": {
        "value": 3,
        "label": "MEDIO",
        "activityCode": "CIIU-4923",
        "activityName": "Transporte de carga por carretera",
        "justification": "Actividad de riesgo moderado según matriz regulatoria"
      },
      "fundsOrigin": {
        "value": 2,
        "label": "BAJO",
        "sources": ["Ingresos operacionales", "Contratos con entes públicos"],
        "justification": "Fuentes verificables y documentadas"
      },
      "beneficiaryComplexity": {
        "value": 1,
        "label": "MUY_BAJO",
        "layers": 1,
        "beneficiaries": 3,
        "justification": "Estructura simple, 3 accionistas personas naturales venezolanas"
      },
      "pepStatus": {
        "value": 4,
        "label": "ALTO",
        "isPep": true,
        "pepType": "DIRECT",
        "pepPosition": "Director de ente público",
        "justification": "Uno de los accionistas es PEP activo"
      }
    },
    
    "productRisk": {
      "productType": {
        "value": 2,
        "label": "BAJO",
        "productCode": "PROD-AUTO-001",
        "productName": "Seguro de Vehículos - Básico",
        "justification": "Producto estándar de baja complejidad"
      },
      "productUsage": {
        "value": 2,
        "label": "BAJO",
        "intendedUse": "Cobertura de flota vehicular empresarial",
        "justification": "Uso comercial típico"
      },
      "productComplexity": {
        "value": 1,
        "label": "MUY_BAJO",
        "complexityFactors": ["Producto simple", "Sin componente de inversión"],
        "justification": "Seguro tradicional sin componentes complejos"
      }
    },
    
    "channelRisk": {
      "distributionChannel": {
        "value": 3,
        "label": "MEDIO",
        "channelType": "BROKER",
        "channelId": "BRK-2024-045",
        "channelName": "Corretaje de Seguros XYZ",
        "justification": "Canal intermediario con supervisión estándar"
      },
      "channelControls": {
        "value": 2,
        "label": "BAJO",
        "controls": ["Debida diligencia del intermediario", "Monitoreo trimestral"],
        "justification": "Intermediario certificado con controles adecuados"
      }
    },
    
    "geographicRisk": {
      "countryRisk": {
        "value": 3,
        "label": "MEDIO",
        "country": "VEN",
        "countryName": "Venezuela",
        "gafi_rating": "MEDIUM",
        "justification": "País con riesgo moderado según evaluación GAFI"
      },
      "highRiskRegion": {
        "value": 4,
        "label": "ALTO",
        "state": "Zulia",
        "municipality": "Maracaibo",
        "isHighRisk": true,
        "justification": "Región fronteriza identificada como alto riesgo"
      },
      "borderZone": {
        "value": 4,
        "label": "ALTO",
        "isBorderZone": true,
        "borderCountry": "Colombia",
        "distanceKm": 15,
        "justification": "Operaciones a 15 km de frontera con Colombia"
      },
      "miningArc": {
        "value": 0,
        "label": "NO_APLICA",
        "inMiningArc": false,
        "justification": "Fuera del Arco Minero del Orinoco"
      },
      "prisonProximity": {
        "value": 0,
        "label": "NO_APLICA",
        "nearPrison": false,
        "justification": "Sin operaciones cercanas a centros penitenciarios"
      }
    },
    
    "internalControls": {
      "controlExistence": {
        "value": 3,
        "label": "MEDIO",
        "controls": [
          "Política KYC implementada",
          "Procedimientos de debida diligencia",
          "Capacitación anual en LA/FT"
        ],
        "justification": "Controles básicos implementados, en proceso de mejora"
      },
      "controlEffectiveness": {
        "value": 3,
        "label": "MEDIO",
        "lastAudit": "2023-11-15",
        "auditResult": "SATISFACTORY_WITH_OBSERVATIONS",
        "mitigationCapacity": 60,
        "justification": "Controles funcionando pero con oportunidades de mejora"
      }
    }
  },
  
  "calculation": {
    "categoryScores": {
      "subjectRisk": {
        "rawScore": 2.4,
        "weightedScore": 0.84,
        "weight": 35
      },
      "productRisk": {
        "rawScore": 1.67,
        "weightedScore": 0.33,
        "weight": 20
      },
      "channelRisk": {
        "rawScore": 2.5,
        "weightedScore": 0.38,
        "weight": 15
      },
      "geographicRisk": {
        "rawScore": 3.67,
        "weightedScore": 0.73,
        "weight": 20
      },
      "internalControls": {
        "rawScore": 3.0,
        "weightedScore": 0.30,
        "weight": 10
      }
    },
    "grossScore": 2.58,
    "mitigationFactor": 0.70,
    "adjustedScore": 1.81,
    "riskLevel": "BAJO",
    "calculationMethod": "WEIGHTED_AVERAGE_WITH_MITIGATION",
    "configurationVersion": "CFG-2024-001"
  },
  
  "decision": {
    "finalRiskLevel": "BAJO",
    "requiresEnhancedDueDiligence": false,
    "requiresApproval": true,
    "approvalLevel": "COMPLIANCE_OFFICER",
    "alerts": [],
    "recommendations": [
      "Monitoreo estándar según política",
      "Revisión anual de la evaluación",
      "Actualizar evaluación si PEP cambia de posición"
    ]
  },
  
  "approvalWorkflow": {
    "createdBy": "user-analyst-003",
    "createdAt": "2024-01-15T10:30:00Z",
    "reviewedBy": "user-supervisor-002",
    "reviewedAt": "2024-01-15T14:20:00Z",
    "approvedBy": "user-compliance-001",
    "approvedAt": "2024-01-15T16:45:00Z",
    "comments": "Evaluación completa y justificada. Aprobado para proceder."
  },
  
  "metadata": {
    "version": 1,
    "isActive": true,
    "supersedes": null,
    "supersededBy": null,
    "nextReviewDate": "2025-01-15",
    "regulatoryReferences": ["Providencia 083.18", "Res. 083.18 Art. 15"],
    "auditTrail": {
      "created": "2024-01-15T10:30:00Z",
      "modified": "2024-01-15T16:45:00Z",
      "accessLog": [
        {
          "userId": "user-analyst-003",
          "action": "CREATE",
          "timestamp": "2024-01-15T10:30:00Z",
          "ipAddress": "192.168.1.100"
        },
        {
          "userId": "user-supervisor-002",
          "action": "REVIEW",
          "timestamp": "2024-01-15T14:20:00Z",
          "ipAddress": "192.168.1.101"
        },
        {
          "userId": "user-compliance-001",
          "action": "APPROVE",
          "timestamp": "2024-01-15T16:45:00Z",
          "ipAddress": "192.168.1.102"
        }
      ]
    }
  }
}
```

### 4.2 Estructura de Configuración de Ponderaciones

```json
{
  "configurationId": "CFG-2024-001",
  "configurationName": "Matriz de Riesgos 2024 - Q1",
  "version": "1.0",
  "effectiveDate": "2024-01-01T00:00:00Z",
  "expirationDate": null,
  "isActive": true,
  "createdBy": "user-compliance-001",
  "createdAt": "2023-12-15T10:00:00Z",
  "approvedBy": "user-compliance-001",
  "approvedAt": "2023-12-20T15:30:00Z",
  "justification": "Actualización anual de la matriz de riesgos según nuevas regulaciones y lecciones aprendidas del año 2023",
  
  "categoryWeights": {
    "SUBJECT_RISK": {
      "weight": 35,
      "justification": "Factor más relevante según análisis de casos históricos"
    },
    "PRODUCT_RISK": {
      "weight": 20,
      "justification": "Productos tradicionales con bajo riesgo inherente"
    },
    "CHANNEL_RISK": {
      "weight": 15,
      "justification": "Canales bien supervisados"
    },
    "GEOGRAPHIC_RISK": {
      "weight": 20,
      "justification": "Alto impacto por situación fronteriza"
    },
    "INTERNAL_CONTROLS": {
      "weight": 10,
      "justification": "Factor de mitigación, no de riesgo inherente"
    }
  },
  
  "factorWeights": {
    "SUBJECT_RISK": {
      "personType": {
        "weight": 20,
        "valueMapping": {
          "NATURAL": 1,
          "LEGAL_SIMPLE": 2,
          "LEGAL_COMPLEX": 4,
          "LEGAL_OFFSHORE": 5
        },
        "description": "Tipo de persona: natural o jurídica con diferentes niveles de complejidad"
      },
      "economicActivity": {
        "weight": 30,
        "valueCatalog": "ECONOMIC_ACTIVITIES_CATALOG",
        "description": "Actividad económica principal según clasificación de riesgo regulatoria"
      },
      "fundsOrigin": {
        "weight": 25,
        "valueMapping": {
          "SALARY": 1,
          "BUSINESS_INCOME": 2,
          "INVESTMENTS": 3,
          "INHERITANCE": 2,
          "DONATIONS": 4,
          "CRYPTO": 5,
          "UNVERIFIED": 5
        },
        "description": "Origen de los fondos y su verificabilidad"
      },
      "beneficiaryComplexity": {
        "weight": 15,
        "valueRules": {
          "layers1": 1,
          "layers2": 2,
          "layers3": 3,
          "layers4plus": 4,
          "offshoreStructure": 5
        },
        "description": "Complejidad de la estructura de beneficiarios finales"
      },
      "pepStatus": {
        "weight": 10,
        "valueMapping": {
          "NON_PEP": 0,
          "PEP_FAMILY_DISTANT": 2,
          "PEP_FAMILY_CLOSE": 3,
          "PEP_FORMER": 3,
          "PEP_CURRENT": 5
        },
        "description": "Condición de Persona Expuesta Políticamente"
      }
    },
    "PRODUCT_RISK": {
      "productType": {
        "weight": 40,
        "valueCatalog": "PRODUCTS_RISK_CATALOG",
        "description": "Tipo de producto de seguros según clasificación interna"
      },
      "productUsage": {
        "weight": 35,
        "valueMapping": {
          "PERSONAL_STANDARD": 1,
          "PERSONAL_HIGH_VALUE": 3,
          "COMMERCIAL_STANDARD": 2,
          "COMMERCIAL_INTERNATIONAL": 4,
          "INVESTMENT_LINKED": 5
        },
        "description": "Uso previsto del producto"
      },
      "productComplexity": {
        "weight": 25,
        "valueMapping": {
          "SIMPLE": 1,
          "MODERATE": 2,
          "COMPLEX": 4,
          "HIGHLY_COMPLEX": 5
        },
        "description": "Complejidad estructural del producto"
      }
    },
    "CHANNEL_RISK": {
      "distributionChannel": {
        "weight": 60,
        "valueMapping": {
          "DIRECT": 1,
          "AGENT_EXCLUSIVE": 2,
          "AGENT_INDEPENDENT": 3,
          "BROKER": 3,
          "ONLINE": 2,
          "THIRD_PARTY": 4
        },
        "description": "Canal de distribución utilizado"
      },
      "channelControls": {
        "weight": 40,
        "valueMapping": {
          "STRONG": 1,
          "ADEQUATE": 2,
          "BASIC": 3,
          "WEAK": 4,
          "NONE": 5
        },
        "description": "Nivel de controles sobre el canal"
      }
    },
    "GEOGRAPHIC_RISK": {
      "countryRisk": {
        "weight": 30,
        "valueCatalog": "COUNTRY_RISK_CATALOG",
        "description": "Riesgo del país según GAFI y análisis interno"
      },
      "highRiskRegion": {
        "weight": 25,
        "valueCatalog": "VENEZUELA_REGIONS_CATALOG",
        "description": "Regiones de Venezuela clasificadas como alto riesgo"
      },
      "borderZone": {
        "weight": 20,
        "valueRules": {
          "distance_gt_100km": 0,
          "distance_50_100km": 2,
          "distance_20_50km": 3,
          "distance_lt_20km": 4
        },
        "description": "Proximidad a zonas fronterizas internacionales"
      },
      "miningArc": {
        "weight": 15,
        "valueMapping": {
          "OUTSIDE": 0,
          "NEARBY_50KM": 3,
          "NEARBY_20KM": 4,
          "INSIDE": 5
        },
        "description": "Relación con el Arco Minero del Orinoco"
      },
      "prisonProximity": {
        "weight": 10,
        "valueRules": {
          "distance_gt_5km": 0,
          "distance_2_5km": 2,
          "distance_lt_2km": 4
        },
        "description": "Proximidad a centros penitenciarios"
      }
    },
    "INTERNAL_CONTROLS": {
      "controlExistence": {
        "weight": 50,
        "valueMapping": {
          "COMPREHENSIVE": 1,
          "ADEQUATE": 2,
          "BASIC": 3,
          "INSUFFICIENT": 4,
          "ABSENT": 5
        },
        "description": "Existencia y alcance de controles internos"
      },
      "controlEffectiveness": {
        "weight": 50,
        "valueMapping": {
          "EXCELLENT": 1,
          "GOOD": 2,
          "SATISFACTORY": 3,
          "NEEDS_IMPROVEMENT": 4,
          "INEFFECTIVE": 5
        },
        "description": "Efectividad demostrada de los controles"
      }
    }
  },
  
  "thresholds": {
    "lowToMedium": 2.0,
    "mediumToHigh": 3.5,
    "justification": "Umbrales establecidos según apetito de riesgo de la organización"
  },
  
  "changeHistory": [
    {
      "changeId": "CHG-001",
      "changedBy": "user-compliance-001",
      "changedAt": "2023-12-15T10:00:00Z",
      "changeType": "CREATION",
      "description": "Creación inicial de la configuración",
      "changedFields": []
    }
  ]
}
```

### 4.3 Estructura de Historial de Evaluaciones

```json
{
  "dossierId": "DOS-CLI-2024-000123",
  "subjectId": "SUB-CLI-2024-000123",
  "assessmentHistory": [
    {
      "assessmentId": "RA-2024-000001",
      "assessmentDate": "2024-01-15T16:45:00Z",
      "assessmentType": "INITIAL",
      "riskLevel": "BAJO",
      "adjustedScore": 1.81,
      "evaluatedBy": "user-analyst-003",
      "approvedBy": "user-compliance-001",
      "configurationVersion": "CFG-2024-001"
    }
  ],
  "riskEvolution": {
    "currentRisk": "BAJO",
    "previousRisk": null,
    "trend": "STABLE",
    "significantChanges": []
  }
}
```

---

## 5. Implementación Backend (Java)

### 5.1 Entidades JPA

```java
// RiskAssessment.java
@Entity
@Table(name = "risk_assessments")
public class RiskAssessment extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String riskAssessmentId;
    
    @ManyToOne
    @JoinColumn(name = "dossier_id", nullable = false)
    private Dossier dossier;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentType assessmentType; // INITIAL, PERIODIC, EXCEPTIONAL, MODIFICATION
    
    @Column(nullable = false)
    private LocalDateTime evaluationDate;
    
    @ManyToOne
    @JoinColumn(name = "evaluated_by", nullable = false)
    private User evaluatedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentStatus status; // DRAFT, IN_REVIEW, APPROVED, REJECTED
    
    @Type(type = "json")
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode riskFactors;
    
    @Type(type = "json")
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode calculation;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel finalRiskLevel; // BAJO, MEDIO, ALTO
    
    @Column
    private Double adjustedScore;
    
    @ManyToOne
    @JoinColumn(name = "configuration_id", nullable = false)
    private RiskConfiguration configuration;
    
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String approvalComments;
    
    @Column
    private LocalDate nextReviewDate;
    
    @OneToMany(mappedBy = "riskAssessment", cascade = CascadeType.ALL)
    private List<RiskAlert> alerts;
    
    // Getters and setters
}
```

```java
// RiskConfiguration.java
@Entity
@Table(name = "risk_configurations")
public class RiskConfiguration extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String configurationId;
    
    @Column(nullable = false)
    private String configurationName;
    
    @Column(nullable = false)
    private String version;
    
    @Column(nullable = false)
    private LocalDateTime effectiveDate;
    
    @Column
    private LocalDateTime expirationDate;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Type(type = "json")
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode categoryWeights;
    
    @Type(type = "json")
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode factorWeights;
    
    @Type(type = "json")
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode thresholds;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column
    private LocalDateTime approvedAt;
    
    @OneToMany(mappedBy = "configuration", cascade = CascadeType.ALL)
    private List<RiskConfigurationHistory> changeHistory;
    
    // Getters and setters
}
```

```java
// RiskAlert.java
@Entity
@Table(name = "risk_alerts")
public class RiskAlert extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String alertId;
    
    @ManyToOne
    @JoinColumn(name = "risk_assessment_id", nullable = false)
    private RiskAssessment riskAssessment;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType; // MEDIUM_RISK, HIGH_RISK, THRESHOLD_EXCEEDED
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity; // INFO, WARNING, CRITICAL
    
    @Column(nullable = false)
    private String message;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime generatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status; // OPEN, ACKNOWLEDGED, RESOLVED
    
    @ManyToOne
    @JoinColumn(name = "acknowledged_by")
    private User acknowledgedBy;
    
    @Column
    private LocalDateTime acknowledgedAt;
    
    @Column(columnDefinition = "TEXT")
    private String acknowledgeComments;
    
    // Getters and setters
}
```

### 5.2 Servicio de Evaluación de Riesgos

```java
@Service
@Transactional
public class RiskAssessmentService {
    
    @Autowired
    private RiskAssessmentRepository riskAssessmentRepository;
    
    @Autowired
    private RiskConfigurationRepository configurationRepository;
    
    @Autowired
    private RiskCalculationEngine calculationEngine;
    
    @Autowired
    private RiskAlertService alertService;
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Crea una nueva evaluación de riesgos
     */
    public RiskAssessment createRiskAssessment(CreateRiskAssessmentRequest request) {
        // Validar que existe el expediente
        Dossier dossier = dossierRepository.findById(request.getDossierId())
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));
        
        // Obtener configuración activa
        RiskConfiguration activeConfig = configurationRepository.findActiveConfiguration()
            .orElseThrow(() -> new BusinessException("No hay configuración de riesgos activa"));
        
        // Crear evaluación
        RiskAssessment assessment = new RiskAssessment();
        assessment.setRiskAssessmentId(generateAssessmentId());
        assessment.setDossier(dossier);
        assessment.setAssessmentType(request.getAssessmentType());
        assessment.setEvaluationDate(LocalDateTime.now());
        assessment.setEvaluatedBy(getCurrentUser());
        assessment.setStatus(AssessmentStatus.DRAFT);
        assessment.setRiskFactors(request.getRiskFactors());
        assessment.setConfiguration(activeConfig);
        
        // Calcular riesgo
        RiskCalculationResult result = calculationEngine.calculateRisk(
            request.getRiskFactors(), 
            activeConfig
        );
        
        assessment.setCalculation(result.getCalculationDetails());
        assessment.setAdjustedScore(result.getAdjustedScore());
        assessment.setFinalRiskLevel(result.getRiskLevel());
        assessment.setNextReviewDate(calculateNextReviewDate(result.getRiskLevel()));
        
        // Guardar
        assessment = riskAssessmentRepository.save(assessment);
        
        // Generar alertas si corresponde
        if (result.getRiskLevel() == RiskLevel.MEDIO || result.getRiskLevel() == RiskLevel.ALTO) {
            alertService.generateRiskAlerts(assessment, result);
        }
        
        // Auditoría
        auditService.logAction(
            AuditAction.RISK_ASSESSMENT_CREATED,
            "RiskAssessment",
            assessment.getId(),
            "Evaluación de riesgos creada para expediente " + dossier.getDossierId()
        );
        
        return assessment;
    }
    
    /**
     * Aprueba una evaluación de riesgos
     */
    @Auditable(action = "APPROVE_RISK_ASSESSMENT")
    @RequirePermission(permission = "RISK_ASSESSMENT_APPROVE")
    public RiskAssessment approveRiskAssessment(Long assessmentId, String comments) {
        RiskAssessment assessment = riskAssessmentRepository.findById(assessmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Evaluación no encontrada"));
        
        // Validar estado
        if (assessment.getStatus() != AssessmentStatus.IN_REVIEW) {
            throw new BusinessException("La evaluación debe estar en revisión para ser aprobada");
        }
        
        // Aprobar
        assessment.setStatus(AssessmentStatus.APPROVED);
        assessment.setApprovedBy(getCurrentUser());
        assessment.setApprovedAt(LocalDateTime.now());
        assessment.setApprovalComments(comments);
        
        assessment = riskAssessmentRepository.save(assessment);
        
        // Actualizar expediente con nivel de riesgo
        Dossier dossier = assessment.getDossier();
        dossier.setCurrentRiskLevel(assessment.getFinalRiskLevel());
        dossier.setLastRiskAssessmentDate(assessment.getEvaluationDate());
        dossierRepository.save(dossier);
        
        return assessment;
    }
    
    /**
     * Obtiene el historial de evaluaciones de un expediente
     */
    public List<RiskAssessment> getAssessmentHistory(Long dossierId) {
        return riskAssessmentRepository.findByDossierIdOrderByEvaluationDateDesc(dossierId);
    }
    
    /**
     * Obtiene la evolución del riesgo en el tiempo
     */
    public RiskEvolutionDTO getRiskEvolution(Long dossierId) {
        List<RiskAssessment> history = getAssessmentHistory(dossierId);
        
        if (history.isEmpty()) {
            return new RiskEvolutionDTO(null, null, "NO_DATA", Collections.emptyList());
        }
        
        RiskAssessment current = history.get(0);
        RiskAssessment previous = history.size() > 1 ? history.get(1) : null;
        
        String trend = calculateTrend(current, previous);
        List<RiskChangeDTO> significantChanges = identifySignificantChanges(history);
        
        return new RiskEvolutionDTO(
            current.getFinalRiskLevel(),
            previous != null ? previous.getFinalRiskLevel() : null,
            trend,
            significantChanges
        );
    }
    
    private String generateAssessmentId() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long sequence = riskAssessmentRepository.getNextSequence();
        return String.format("RA-%s-%06d", year, sequence);
    }
    
    private LocalDate calculateNextReviewDate(RiskLevel riskLevel) {
        LocalDate today = LocalDate.now();
        switch (riskLevel) {
            case ALTO:
                return today.plusMonths(6); // Revisión semestral
            case MEDIO:
                return today.plusYears(1); // Revisión anual
            case BAJO:
                return today.plusYears(2); // Revisión bienal
            default:
                return today.plusYears(1);
        }
    }
    
    private String calculateTrend(RiskAssessment current, RiskAssessment previous) {
        if (previous == null) {
            return "STABLE";
        }
        
        if (current.getAdjustedScore() > previous.getAdjustedScore() * 1.2) {
            return "INCREASING";
        } else if (current.getAdjustedScore() < previous.getAdjustedScore() * 0.8) {
            return "DECREASING";
        } else {
            return "STABLE";
        }
    }
    
    private List<RiskChangeDTO> identifySignificantChanges(List<RiskAssessment> history) {
        List<RiskChangeDTO> changes = new ArrayList<>();
        
        for (int i = 0; i < history.size() - 1; i++) {
            RiskAssessment current = history.get(i);
            RiskAssessment previous = history.get(i + 1);
            
            if (current.getFinalRiskLevel() != previous.getFinalRiskLevel()) {
                changes.add(new RiskChangeDTO(
                    current.getEvaluationDate(),
                    previous.getFinalRiskLevel(),
                    current.getFinalRiskLevel(),
                    "Cambio de nivel de riesgo"
                ));
            }
        }
        
        return changes;
    }
}
```

### 5.3 Motor de Cálculo de Riesgos

```java
@Service
public class RiskCalculationEngine {
    
    /**
     * Calcula el riesgo consolidado basado en factores y configuración
     */
    public RiskCalculationResult calculateRisk(JsonNode riskFactors, RiskConfiguration config) {
        Map<String, CategoryScore> categoryScores = new HashMap<>();
        
        // Calcular puntaje por cada categoría
        categoryScores.put("subjectRisk", calculateCategoryScore(
            riskFactors.get("subjectRisk"),
            config.getFactorWeights().get("SUBJECT_RISK"),
            config.getCategoryWeights().get("SUBJECT_RISK")
        ));
        
        categoryScores.put("productRisk", calculateCategoryScore(
            riskFactors.get("productRisk"),
            config.getFactorWeights().get("PRODUCT_RISK"),
            config.getCategoryWeights().get("PRODUCT_RISK")
        ));
        
        categoryScores.put("channelRisk", calculateCategoryScore(
            riskFactors.get("channelRisk"),
            config.getFactorWeights().get("CHANNEL_RISK"),
            config.getCategoryWeights().get("CHANNEL_RISK")
        ));
        
        categoryScores.put("geographicRisk", calculateCategoryScore(
            riskFactors.get("geographicRisk"),
            config.getFactorWeights().get("GEOGRAPHIC_RISK"),
            config.getCategoryWeights().get("GEOGRAPHIC_RISK")
        ));
        
        categoryScores.put("internalControls", calculateCategoryScore(
            riskFactors.get("internalControls"),
            config.getFactorWeights().get("INTERNAL_CONTROLS"),
            config.getCategoryWeights().get("INTERNAL_CONTROLS")
        ));
        
        // Calcular puntaje bruto ponderado
        double grossScore = calculateGrossScore(categoryScores);
        
        // Aplicar factor de mitigación de controles internos
        double controlScore = categoryScores.get("internalControls").getRawScore();
        double mitigationFactor = 1.0 - (controlScore / 10.0);
        double adjustedScore = grossScore * mitigationFactor;
        
        // Determinar nivel de riesgo final
        RiskLevel riskLevel = determineRiskLevel(adjustedScore, config.getThresholds());
        
        // Construir resultado
        return RiskCalculationResult.builder()
            .categoryScores(categoryScores)
            .grossScore(grossScore)
            .mitigationFactor(mitigationFactor)
            .adjustedScore(adjustedScore)
            .riskLevel(riskLevel)
            .calculationMethod("WEIGHTED_AVERAGE_WITH_MITIGATION")
            .configurationVersion(config.getConfigurationId())
            .build();
    }
    
    private CategoryScore calculateCategoryScore(
        JsonNode factors, 
        JsonNode factorWeights, 
        JsonNode categoryWeight
    ) {
        double totalWeightedValue = 0.0;
        double totalApplicableWeight = 0.0;
        
        Iterator<String> fieldNames = factors.fieldNames();
        while (fieldNames.hasNext()) {
            String factorName = fieldNames.next();
            JsonNode factor = factors.get(factorName);
            
            int value = factor.get("value").asInt();
            
            // Solo considerar factores que aplican (value > 0)
            if (value > 0) {
                double weight = factorWeights.get(factorName).get("weight").asDouble();
                totalWeightedValue += value * weight;
                totalApplicableWeight += weight;
            }
        }
        
        double rawScore = totalApplicableWeight > 0 
            ? totalWeightedValue / totalApplicableWeight 
            : 0.0;
        
        double weight = categoryWeight.get("weight").asDouble();
        double weightedScore = (rawScore * weight) / 100.0;
        
        return new CategoryScore(rawScore, weightedScore, weight);
    }
    
    private double calculateGrossScore(Map<String, CategoryScore> categoryScores) {
        return categoryScores.values().stream()
            .mapToDouble(CategoryScore::getWeightedScore)
            .sum();
    }
    
    private RiskLevel determineRiskLevel(double adjustedScore, JsonNode thresholds) {
        double lowToMedium = thresholds.get("lowToMedium").asDouble();
        double mediumToHigh = thresholds.get("mediumToHigh").asDouble();
        
        if (adjustedScore <= lowToMedium) {
            return RiskLevel.BAJO;
        } else if (adjustedScore <= mediumToHigh) {
            return RiskLevel.MEDIO;
        } else {
            return RiskLevel.ALTO;
        }
    }
    
    @Data
    @AllArgsConstructor
    public static class CategoryScore {
        private double rawScore;
        private double weightedScore;
        private double weight;
    }
    
    @Data
    @Builder
    public static class RiskCalculationResult {
        private Map<String, CategoryScore> categoryScores;
        private double grossScore;
        private double mitigationFactor;
        private double adjustedScore;
        private RiskLevel riskLevel;
        private String calculationMethod;
        private String configurationVersion;
        
        public JsonNode getCalculationDetails() {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.valueToTree(this);
        }
    }
}
```

### 5.4 Servicio de Configuración de Riesgos

```java
@Service
@Transactional
public class RiskConfigurationService {
    
    @Autowired
    private RiskConfigurationRepository configurationRepository;
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Crea una nueva configuración de riesgos
     */
    @RequirePermission(permission = "RISK_CONFIGURATION_CREATE")
    public RiskConfiguration createConfiguration(CreateConfigurationRequest request) {
        // Validar que los pesos sumen 100
        validateWeights(request.getCategoryWeights());
        
        RiskConfiguration config = new RiskConfiguration();
        config.setConfigurationId(generateConfigurationId());
        config.setConfigurationName(request.getName());
        config.setVersion(request.getVersion());
        config.setEffectiveDate(request.getEffectiveDate());
        config.setIsActive(false); // No activa hasta aprobación
        config.setCategoryWeights(request.getCategoryWeights());
        config.setFactorWeights(request.getFactorWeights());
        config.setThresholds(request.getThresholds());
        config.setJustification(request.getJustification());
        config.setCreatedBy(getCurrentUser());
        
        config = configurationRepository.save(config);
        
        auditService.logAction(
            AuditAction.RISK_CONFIGURATION_CREATED,
            "RiskConfiguration",
            config.getId(),
            "Nueva configuración de riesgos creada: " + config.getConfigurationName()
        );
        
        return config;
    }
    
    /**
     * Aprueba y activa una configuración
     */
    @RequirePermission(permission = "RISK_CONFIGURATION_APPROVE")
    public RiskConfiguration approveConfiguration(Long configId, String comments) {
        RiskConfiguration config = configurationRepository.findById(configId)
            .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada"));
        
        if (config.getIsActive()) {
            throw new BusinessException("La configuración ya está activa");
        }
        
        // Desactivar configuración anterior
        configurationRepository.findActiveConfiguration()
            .ifPresent(activeConfig -> {
                activeConfig.setIsActive(false);
                activeConfig.setExpirationDate(LocalDateTime.now());
                configurationRepository.save(activeConfig);
            });
        
        // Activar nueva configuración
        config.setIsActive(true);
        config.setApprovedBy(getCurrentUser());
        config.setApprovedAt(LocalDateTime.now());
        
        config = configurationRepository.save(config);
        
        auditService.logAction(
            AuditAction.RISK_CONFIGURATION_APPROVED,
            "RiskConfiguration",
            config.getId(),
            "Configuración aprobada y activada: " + config.getConfigurationName()
        );
        
        return config;
    }
    
    /**
     * Actualiza pesos de una configuración (crea nueva versión)
     */
    @RequirePermission(permission = "RISK_CONFIGURATION_MODIFY")
    public RiskConfiguration updateWeights(UpdateWeightsRequest request) {
        RiskConfiguration currentConfig = configurationRepository.findActiveConfiguration()
            .orElseThrow(() -> new BusinessException("No hay configuración activa"));
        
        // Crear nueva versión
        RiskConfiguration newConfig = new RiskConfiguration();
        newConfig.setConfigurationId(generateConfigurationId());
        newConfig.setConfigurationName(currentConfig.getConfigurationName() + " - Updated");
        newConfig.setVersion(incrementVersion(currentConfig.getVersion()));
        newConfig.setEffectiveDate(request.getEffectiveDate());
        newConfig.setIsActive(false);
        newConfig.setCategoryWeights(request.getCategoryWeights());
        newConfig.setFactorWeights(request.getFactorWeights());
        newConfig.setThresholds(currentConfig.getThresholds());
        newConfig.setJustification(request.getJustification());
        newConfig.setCreatedBy(getCurrentUser());
        
        newConfig = configurationRepository.save(newConfig);
        
        // Registrar cambio en historial
        recordConfigurationChange(currentConfig, newConfig, request.getChangedFields());
        
        return newConfig;
    }
    
    /**
     * Obtiene la configuración activa
     */
    public RiskConfiguration getActiveConfiguration() {
        return configurationRepository.findActiveConfiguration()
            .orElseThrow(() -> new BusinessException("No hay configuración activa"));
    }
    
    /**
     * Obtiene historial de configuraciones
     */
    public List<RiskConfiguration> getConfigurationHistory() {
        return configurationRepository.findAllByOrderByEffectiveDateDesc();
    }
    
    private void validateWeights(JsonNode categoryWeights) {
        double total = 0.0;
        Iterator<JsonNode> elements = categoryWeights.elements();
        while (elements.hasNext()) {
            total += elements.next().get("weight").asDouble();
        }
        
        if (Math.abs(total - 100.0) > 0.01) {
            throw new ValidationException("Los pesos de categorías deben sumar 100%");
        }
    }
    
    private String generateConfigurationId() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long sequence = configurationRepository.getNextSequence();
        return String.format("CFG-%s-%03d", year, sequence);
    }
    
    private String incrementVersion(String currentVersion) {
        String[] parts = currentVersion.split("\\.");
        int major = Integer.parseInt(parts[0]);
        int minor = Integer.parseInt(parts[1]);
        return String.format("%d.%d", major, minor + 1);
    }
    
    private void recordConfigurationChange(
        RiskConfiguration oldConfig,
        RiskConfiguration newConfig,
        List<String> changedFields
    ) {
        RiskConfigurationHistory history = new RiskConfigurationHistory();
        history.setConfiguration(newConfig);
        history.setChangeId(generateChangeId());
        history.setChangedBy(getCurrentUser());
        history.setChangedAt(LocalDateTime.now());
        history.setChangeType(ChangeType.UPDATE);
        history.setDescription("Actualización de ponderaciones");
        history.setChangedFields(changedFields);
        history.setPreviousConfigurationId(oldConfig.getConfigurationId());
        
        configurationHistoryRepository.save(history);
    }
}
```

---

## 6. API REST Endpoints

### 6.1 Evaluación de Riesgos

```
POST /api/risk-assessments
Crea una nueva evaluación de riesgos

Request Body:
{
  "dossierId": "DOS-CLI-2024-000123",
  "assessmentType": "INITIAL",
  "riskFactors": { ... } // Estructura JSON completa de factores
}

Response: 201 Created
{
  "riskAssessmentId": "RA-2024-000001",
  "finalRiskLevel": "BAJO",
  "adjustedScore": 1.81,
  "status": "DRAFT",
  ...
}
```

```
PUT /api/risk-assessments/{id}/submit
Envía evaluación a revisión

Response: 200 OK
```

```
POST /api/risk-assessments/{id}/approve
Aprueba una evaluación de riesgos

Request Body:
{
  "comments": "Evaluación completa y justificada. Aprobado."
}

Response: 200 OK
```

```
GET /api/risk-assessments/{id}
Obtiene detalles de una evaluación

Response: 200 OK
```

```
GET /api/dossiers/{dossierId}/risk-assessments
Obtiene historial de evaluaciones de un expediente

Response: 200 OK
[...]
```

```
GET /api/dossiers/{dossierId}/risk-evolution
Obtiene evolución del riesgo en el tiempo

Response: 200 OK
{
  "currentRisk": "BAJO",
  "previousRisk": null,
  "trend": "STABLE",
  "significantChanges": []
}
```

### 6.2 Configuración de Riesgos

```
POST /api/risk-configurations
Crea nueva configuración de riesgos

Request Body:
{
  "name": "Matriz de Riesgos 2024 - Q2",
  "version": "1.0",
  "effectiveDate": "2024-04-01T00:00:00Z",
  "categoryWeights": { ... },
  "factorWeights": { ... },
  "thresholds": { ... },
  "justification": "..."
}

Response: 201 Created
```

```
POST /api/risk-configurations/{id}/approve
Aprueba y activa una configuración

Response: 200 OK
```

```
GET /api/risk-configurations/active
Obtiene configuración activa

Response: 200 OK
```

```
GET /api/risk-configurations
Lista todas las configuraciones

Response: 200 OK
[...]
```

```
PUT /api/risk-configurations/weights
Actualiza pesos (crea nueva versión)

Request Body:
{
  "effectiveDate": "2024-06-01T00:00:00Z",
  "categoryWeights": { ... },
  "factorWeights": { ... },
  "changedFields": ["SUBJECT_RISK.pepStatus"],
  "justification": "Ajuste por nueva regulación"
}

Response: 200 OK
```

### 6.3 Alertas de Riesgo

```
GET /api/risk-alerts
Lista alertas de riesgo

Query Params:
- status: OPEN, ACKNOWLEDGED, RESOLVED
- severity: INFO, WARNING, CRITICAL
- dateFrom, dateTo

Response: 200 OK
[...]
```

```
POST /api/risk-alerts/{id}/acknowledge
Reconoce una alerta

Request Body:
{
  "comments": "Alerta revisada, se procederá con debida diligencia reforzada"
}

Response: 200 OK
```

---

## 7. Interfaz Lógica para el Oficial de Cumplimiento

### 7.1 Panel de Configuración de Ponderaciones

**Componentes UI:**

1. **Vista de Categorías**
   - Slider para cada categoría (0-100)
   - Validación en tiempo real que sume 100%
   - Visualización gráfica de distribución (pie chart)

2. **Vista de Factores por Categoría**
   - Tabla expandible por categoría
   - Slider para cada factor dentro de la categoría
   - Campo de justificación por factor
   - Mapeo de valores (dropdown o tabla)

3. **Vista de Umbrales**
   - Input numérico para umbral Bajo → Medio
   - Input numérico para umbral Medio → Alto
   - Visualización de rangos resultantes

4. **Simulador de Evaluación**
   - Permite ingresar factores de prueba
   - Calcula riesgo con configuración actual
   - Muestra desglose del cálculo paso a paso

5. **Historial de Cambios**
   - Lista cronológica de configuraciones
   - Comparación entre versiones (diff)
   - Justificación de cada cambio

### 7.2 Panel de Evaluación de Riesgos

**Componentes UI:**

1. **Formulario de Evaluación**
   - Secciones colapsables por categoría
   - Cada factor con:
     - Dropdown de valor (0-5 con etiquetas)
     - Campo de justificación obligatorio
     - Ayuda contextual (tooltip)
   - Cálculo en tiempo real del riesgo

2. **Visualización de Resultados**
   - Gauge visual del puntaje final
   - Semáforo de nivel de riesgo (Verde/Amarillo/Rojo)
   - Desglose por categoría (bar chart)
   - Tabla de factores más influyentes

3. **Alertas Automáticas**
   - Banner de alerta si riesgo ≥ Medio
   - Lista de recomendaciones
   - Requisitos de due diligence

4. **Historial del Expediente**
   - Timeline de evaluaciones previas
   - Gráfico de evolución del riesgo
   - Comparación con evaluación anterior

### 7.3 Flujo de Trabajo

```
1. Analista de Riesgos → Crea evaluación (DRAFT)
   ↓
2. Sistema → Calcula riesgo automáticamente
   ↓
3. Analista → Envía a revisión (IN_REVIEW)
   ↓
4. Supervisor de Cumplimiento → Revisa evaluación
   ↓
5. Oficial de Cumplimiento → Aprueba o rechaza (APPROVED/REJECTED)
   ↓
6. Sistema → Actualiza expediente y genera alertas
```

---

## 8. Trazabilidad y Auditabilidad

### 8.1 Registros de Auditoría

Cada acción relacionada con evaluaciones de riesgo genera registros inmutables:

```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100)
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_event_type ON audit_log(event_type);
```

### 8.2 Eventos Auditables

- `RISK_ASSESSMENT_CREATED`: Creación de evaluación
- `RISK_ASSESSMENT_MODIFIED`: Modificación de factores
- `RISK_ASSESSMENT_SUBMITTED`: Envío a revisión
- `RISK_ASSESSMENT_APPROVED`: Aprobación
- `RISK_ASSESSMENT_REJECTED`: Rechazo
- `RISK_CONFIG_CREATED`: Creación de configuración
- `RISK_CONFIG_MODIFIED`: Modificación de pesos
- `RISK_CONFIG_APPROVED`: Activación de configuración
- `RISK_ALERT_GENERATED`: Generación de alerta
- `RISK_ALERT_ACKNOWLEDGED`: Reconocimiento de alerta

### 8.3 Reportes para Reguladores

El sistema debe generar reportes automáticos con:

1. **Reporte de Evaluaciones por Período**
   - Total de evaluaciones realizadas
   - Distribución por nivel de riesgo
   - Tiempo promedio de evaluación
   - Tasa de aprobación/rechazo

2. **Reporte de Cambios en Configuración**
   - Historial de modificaciones de pesos
   - Justificaciones de cambios
   - Impacto de cambios en evaluaciones existentes

3. **Reporte de Alertas**
   - Alertas generadas por nivel de severidad
   - Tiempo de respuesta a alertas
   - Acciones tomadas

4. **Reporte de Evolución de Riesgo**
   - Sujetos con aumento de riesgo
   - Tendencias por tipo de sujeto
   - Efectividad de controles

---

## 9. Casos de Uso Específicos

### 9.1 Evaluación Inicial de Cliente Nuevo

**Escenario**: Persona jurídica solicita seguro de vida colectivo

**Proceso**:
1. Analista obtiene información del cliente
2. Completa formulario de evaluación:
   - Persona jurídica → 2 puntos
   - Actividad: Construcción → 4 puntos (alto riesgo)
   - Fondos: Contratos con entes públicos → 3 puntos
   - Beneficiarios: 2 niveles → 2 puntos
   - PEP: Accionista es PEP → 5 puntos
3. Sistema calcula: Riesgo ALTO
4. Genera alerta automática
5. Requiere aprobación del Oficial de Cumplimiento
6. Se implementa due diligence reforzada

### 9.2 Re-evaluación por Cambio Material

**Escenario**: Cliente cambia de actividad económica

**Proceso**:
1. Sistema detecta cambio en expediente
2. Sugiere re-evaluación de riesgos
3. Analista crea evaluación tipo MODIFICATION
4. Compara con evaluación anterior
5. Si cambia nivel de riesgo → workflow de aprobación
6. Actualiza expediente con nuevo nivel

### 9.3 Ajuste de Ponderaciones por Regulación

**Escenario**: Nueva regulación aumenta peso del factor PEP

**Proceso**:
1. Oficial de Cumplimiento crea nueva configuración
2. Aumenta peso de factor PEP de 10 a 15
3. Justifica: "Nueva Providencia 123.45 Art. 8"
4. Aprueba configuración con fecha efectiva
5. Sistema re-calcula evaluaciones activas
6. Genera reporte de impacto
7. Notifica cambios significativos

---

## 10. Consideraciones de Implementación

### 10.1 Rendimiento

- Índices en tablas de evaluaciones por dossierId
- Cache de configuración activa (Redis)
- Cálculo asíncrono para evaluaciones masivas
- Paginación en historiales largos

### 10.2 Seguridad

- Encriptación de datos sensibles en JSON
- Logs inmutables con hash encadenado
- Segregación de permisos por rol
- Timeout de sesión reducido para Oficial de Cumplimiento

### 10.3 Escalabilidad

- Microservicio independiente para cálculo de riesgos
- Queue para procesamiento de evaluaciones masivas
- Particionamiento de tablas por año
- Archivo de evaluaciones antiguas

### 10.4 Integración con Otros Módulos

- **Expediente Único**: Lee datos del sujeto
- **Debida Diligencia**: Dispara procesos según nivel de riesgo
- **Monitoreo**: Alimenta con nivel de riesgo para alertas
- **Reportes**: Genera dashboards de riesgo

---

## 11. Conclusión

El modelo de Evaluación Inicial de Riesgos propuesto:

✅ Implementa EBR según regulación venezolana
✅ Permite parametrización completa sin programación
✅ Garantiza trazabilidad total y auditabilidad
✅ Genera alertas automáticas
✅ Facilita supervisión regulatoria
✅ Segrega funciones apropiadamente
✅ Escala para alta carga transaccional
✅ Se integra con sistema global SIAR

El sistema está diseñado para resistir el máximo escrutinio regulatorio, con transparencia absoluta en cada decisión y cálculo.
