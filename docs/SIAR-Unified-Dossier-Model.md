# Modelo de Expediente Único - SIAR
## Sistema Integral de Administración de Riesgos y Cumplimiento

---

## 1. Estructura Lógica del Expediente Único

### 1.1 Concepto

El **Expediente Único** es un contenedor de información integral y permanente que agrupa todos los datos relevantes de un sujeto obligado (Cliente, Intermediario, Empleado, Proveedor, Reasegurador, Retrocesionario) desde el punto de vista de cumplimiento normativo y gestión de riesgos.

### 1.2 Principios Rectores

1. **Unicidad**: Un sujeto = Un expediente (identificación única por tipo y documento)
2. **Inmutabilidad post-aprobación**: Una vez aprobado, el expediente no puede eliminarse
3. **Trazabilidad total**: Cada cambio genera un registro auditable inmutable
4. **Existencia permanente**: El expediente existe desde su creación, aunque esté incompleto
5. **Transparencia regulatoria**: Diseñado para inspección continua del regulador

### 1.3 Estados del Expediente

```
INCOMPLETO → EN_REVISION → APROBADO
                ↓              ↓
    REQUIERE_INFORMACION  OBSERVADO
                ↓              ↓
           EN_REVISION ← ← ← ←
```

| Estado | Código | Descripción | Puede modificarse |
|--------|--------|-------------|-------------------|
| Incompleto | `INCOMPLETE` | Faltan campos obligatorios | Sí (por creador) |
| En Revisión | `UNDER_REVIEW` | Bajo análisis del Área de Cumplimiento | No (en proceso) |
| Requiere Información | `REQUIRES_INFO` | El Área de Cumplimiento solicita datos adicionales | Sí (por creador) |
| Observado | `OBSERVED` | Anomalías detectadas que requieren corrección | Sí (por creador) |
| Aprobado | `APPROVED` | Validado por Oficial de Cumplimiento | No (requiere solicitud formal) |

---

## 2. Modelo de Datos en JSON

### 2.1 Estructura Principal del Expediente

```json
{
  "dossier": {
    "dossierId": "DOSS-2024-00001",
    "dossierUuid": "550e8400-e29b-41d4-a716-446655440000",
    "subjectType": "CLIENT",
    "status": "INCOMPLETE",
    "completenessPercentage": 45.5,
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "juan.perez",
    "lastModifiedAt": "2024-01-20T14:22:00Z",
    "lastModifiedBy": "maria.lopez",
    "approvedAt": null,
    "approvedBy": null,
    "version": 3,
    "isDeletable": true,
    "requiresApprovalForChanges": false,
    
    "structuredForm": {
      "identification": { /* Sección 1 */ },
      "economicInformation": { /* Sección 2 */ },
      "insurerRelationship": { /* Sección 3 */ },
      "geographicLocation": { /* Sección 4 */ },
      "internalControls": { /* Sección 5 */ }
    },
    
    "attachedDocuments": [ /* Lista de documentos adjuntos */ ],
    "riskAssessment": { /* Evaluación de riesgo calculada */ },
    "changeHistory": [ /* Historial completo de modificaciones */ ],
    "reviewComments": [ /* Comentarios del proceso de revisión */ ]
  }
}
```

### 2.2 Sección 1: Identificación

```json
{
  "identification": {
    "personType": "NATURAL",
    "fullName": "Juan Alberto Pérez Gómez",
    "legalName": null,
    "documentType": "CEDULA",
    "documentNumber": "V-12345678",
    "passportNumber": null,
    "rifNumber": null,
    "nationalityCountry": "VE",
    "birthDate": "1985-03-15",
    "gender": "M",
    "maritalStatus": "MARRIED",
    "address": {
      "street": "Avenida Principal de Los Ruices",
      "buildingNumber": "Edificio Torre Europa, Piso 5, Oficina 501",
      "neighborhood": "Los Ruices",
      "city": "Caracas",
      "state": "Miranda",
      "country": "VE",
      "postalCode": "1071",
      "referencePoint": "Frente al Centro Comercial Millenium"
    },
    "contactInformation": {
      "primaryPhone": "+58-212-9876543",
      "mobilePhone": "+58-414-1234567",
      "email": "juan.perez@example.com",
      "alternativeEmail": "jperez@gmail.com"
    },
    "politicallyExposedPerson": {
      "isPEP": false,
      "pepType": null,
      "position": null,
      "institution": null,
      "fromDate": null,
      "toDate": null
    },
    "relatedPEP": {
      "hasRelatedPEP": false,
      "relationshipType": null,
      "pepName": null,
      "pepPosition": null
    },
    "mandatoryFields": [
      "personType", "fullName", "documentType", 
      "documentNumber", "address.street", "address.city", 
      "address.state", "address.country", "contactInformation.primaryPhone",
      "contactInformation.email"
    ],
    "completedFields": [
      "personType", "fullName", "documentType", "documentNumber",
      "nationalityCountry", "birthDate", "gender", "maritalStatus",
      "address.street", "address.buildingNumber", "address.city",
      "address.state", "address.country", "contactInformation.primaryPhone",
      "contactInformation.mobilePhone", "contactInformation.email"
    ],
    "sectionCompletenessPercentage": 90.0
  }
}
```

### 2.3 Sección 2: Información Económica y de Actividad

```json
{
  "economicInformation": {
    "economicActivity": {
      "primaryActivity": "COMERCIO_AL_POR_MAYOR",
      "primaryActivityCode": "CIIU-G4610",
      "secondaryActivity": "IMPORTACION_EXPORTACION",
      "secondaryActivityCode": "CIIU-G4690",
      "businessSector": "COMMERCIAL",
      "description": "Importación y distribución de equipos electrónicos"
    },
    "incomeInformation": {
      "monthlyIncome": {
        "amount": 5000.00,
        "currency": "USD"
      },
      "annualIncome": {
        "amount": 60000.00,
        "currency": "USD"
      },
      "incomeRange": "50000_100000_USD"
    },
    "fundsOrigin": {
      "primarySource": "SALARIO_EMPRESA_PROPIA",
      "secondarySource": "INGRESOS_COMERCIALES",
      "description": "Ingresos derivados de empresa familiar dedicada al comercio exterior",
      "fundsSourceDocumentation": ["DOC-2024-001", "DOC-2024-002"]
    },
    "beneficialOwner": {
      "complexityLevel": "LOW",
      "isTransparent": true,
      "identifiedBeneficialOwners": [
        {
          "name": "Juan Alberto Pérez Gómez",
          "documentType": "CEDULA",
          "documentNumber": "V-12345678",
          "ownershipPercentage": 100.0,
          "controlType": "DIRECT_OWNERSHIP"
        }
      ],
      "corporateStructure": null,
      "requiresAdditionalAnalysis": false
    },
    "financialProfile": {
      "hasInternationalTransactions": true,
      "internationalCountries": ["USA", "COL", "PAN"],
      "averageTransactionAmount": {
        "amount": 10000.00,
        "currency": "USD"
      },
      "transactionFrequency": "MONTHLY"
    },
    "mandatoryFields": [
      "economicActivity.primaryActivity",
      "fundsOrigin.primarySource",
      "beneficialOwner.complexityLevel"
    ],
    "completedFields": [
      "economicActivity.primaryActivity", "economicActivity.primaryActivityCode",
      "economicActivity.businessSector", "incomeInformation.monthlyIncome",
      "fundsOrigin.primarySource", "fundsOrigin.description",
      "beneficialOwner.complexityLevel", "beneficialOwner.isTransparent"
    ],
    "sectionCompletenessPercentage": 85.0
  }
}
```

### 2.4 Sección 3: Relación con la Aseguradora

```json
{
  "insurerRelationship": {
    "relationshipStartDate": "2020-05-10",
    "relationshipStatus": "ACTIVE",
    "customerSegment": "RETAIL",
    "riskProfile": "MEDIUM",
    "associatedProducts": [
      {
        "productId": "PROD-AUTO-001",
        "productType": "AUTO",
        "productName": "Seguro de Vehículos - Cobertura Total",
        "policyNumber": "POL-2024-00123",
        "policyStatus": "ACTIVE",
        "effectiveDate": "2024-01-01",
        "expirationDate": "2025-01-01",
        "insuredAmount": {
          "amount": 25000.00,
          "currency": "USD"
        },
        "premium": {
          "amount": 1500.00,
          "currency": "USD",
          "frequency": "ANNUAL"
        },
        "beneficiaries": [
          {
            "name": "María Elena Gómez de Pérez",
            "documentType": "CEDULA",
            "documentNumber": "V-11223344",
            "relationship": "SPOUSE",
            "beneficiaryPercentage": 100.0
          }
        ]
      },
      {
        "productId": "PROD-LIFE-002",
        "productType": "LIFE",
        "productName": "Seguro de Vida con Ahorro",
        "policyNumber": "POL-2024-00456",
        "policyStatus": "ACTIVE",
        "effectiveDate": "2023-06-15",
        "expirationDate": "2043-06-15",
        "insuredAmount": {
          "amount": 100000.00,
          "currency": "USD"
        },
        "premium": {
          "amount": 2400.00,
          "currency": "USD",
          "frequency": "ANNUAL"
        }
      }
    ],
    "distributionChannel": "INTERMEDIARY",
    "distributionChannelDetails": {
      "channelType": "TRADITIONAL_INTERMEDIARY",
      "intermediaryId": "INTER-2020-055",
      "intermediaryName": "Correduria de Seguros XYZ, C.A.",
      "brokerLicenseNumber": "SSV-2018-123",
      "agentName": "Carlos Rodriguez",
      "agentCode": "AGT-001"
    },
    "totalPremiumVolume": {
      "annual": {
        "amount": 3900.00,
        "currency": "USD"
      },
      "lifetime": {
        "amount": 19500.00,
        "currency": "USD"
      }
    },
    "claimsHistory": {
      "totalClaims": 2,
      "totalClaimedAmount": {
        "amount": 5000.00,
        "currency": "USD"
      },
      "totalPaidAmount": {
        "amount": 4500.00,
        "currency": "USD"
      },
      "claimFrequency": "LOW",
      "hasUnusualClaims": false
    },
    "mandatoryFields": [
      "relationshipStartDate",
      "associatedProducts",
      "distributionChannel"
    ],
    "completedFields": [
      "relationshipStartDate", "relationshipStatus", "customerSegment",
      "associatedProducts", "distributionChannel", "distributionChannelDetails"
    ],
    "sectionCompletenessPercentage": 95.0
  }
}
```

### 2.5 Sección 4: Ubicación Geográfica

```json
{
  "geographicLocation": {
    "domicileCountry": {
      "countryCode": "VE",
      "countryName": "Venezuela",
      "riskLevel": "HIGH"
    },
    "state": {
      "stateCode": "MI",
      "stateName": "Miranda"
    },
    "city": {
      "cityName": "Caracas",
      "municipalityName": "Municipio Sucre"
    },
    "coordinates": {
      "latitude": 10.4806,
      "longitude": -66.9036,
      "precision": "STREET_LEVEL",
      "collectionMethod": "GPS",
      "collectionDate": "2024-01-15"
    },
    "geographicRiskFactors": {
      "isHighRiskZone": false,
      "isBorderArea": false,
      "isTripleFrontierArea": false,
      "proximityToHighRiskArea": false,
      "urbanRuralClassification": "URBAN",
      "securityLevel": "MEDIUM"
    },
    "jurisdictionInformation": {
      "taxJurisdiction": "VE",
      "regulatoryJurisdiction": "VE-SUPERINTENDENCIA-SEGUROS",
      "hasMultipleJurisdictions": false,
      "additionalJurisdictions": []
    },
    "mandatoryFields": [
      "domicileCountry.countryCode",
      "state.stateName",
      "city.cityName"
    ],
    "completedFields": [
      "domicileCountry.countryCode", "domicileCountry.countryName",
      "state.stateName", "city.cityName", "coordinates.latitude",
      "coordinates.longitude", "geographicRiskFactors"
    ],
    "sectionCompletenessPercentage": 88.0
  }
}
```

### 2.6 Sección 5: Controles Internos

```json
{
  "internalControls": {
    "applicableControls": [
      {
        "controlId": "CTRL-KYC-001",
        "controlName": "Verificación de Identidad",
        "controlType": "DOCUMENTARY_VERIFICATION",
        "implementationStatus": "IMPLEMENTED",
        "implementationDate": "2024-01-15",
        "responsibleArea": "COMPLIANCE",
        "responsiblePerson": "María López",
        "verificationMethod": "DOCUMENTO_ORIGINAL_COTEJADO",
        "verificationDate": "2024-01-15",
        "documentReference": "DOC-2024-001",
        "effectivenessLevel": "HIGH"
      },
      {
        "controlId": "CTRL-EDD-002",
        "controlName": "Debida Diligencia Reforzada - Transacciones Internacionales",
        "controlType": "ENHANCED_DUE_DILIGENCE",
        "implementationStatus": "PENDING",
        "implementationDate": null,
        "responsibleArea": "COMPLIANCE",
        "responsiblePerson": "Pedro García",
        "justification": "Cliente realiza transacciones internacionales frecuentes",
        "plannedDate": "2024-02-15"
      },
      {
        "controlId": "CTRL-MON-003",
        "controlName": "Monitoreo Continuo de Transacciones",
        "controlType": "TRANSACTION_MONITORING",
        "implementationStatus": "IMPLEMENTED",
        "monitoringFrequency": "REAL_TIME",
        "lastReviewDate": "2024-01-20",
        "nextReviewDate": "2024-02-20",
        "anomaliesDetected": 0
      }
    ],
    "riskMitigationLevel": "MEDIUM",
    "mitigationStrategy": {
      "description": "Aplicación de controles estándar de KYC con monitoreo reforzado debido a transacciones internacionales",
      "specificMeasures": [
        "Verificación documental completa",
        "Monitoreo automatizado de transacciones",
        "Revisión periódica trimestral",
        "Debida diligencia reforzada en proceso"
      ],
      "residualRisk": "LOW_MEDIUM",
      "acceptanceJustification": "El perfil del cliente y sus operaciones son consistentes con su actividad económica declarada"
    },
    "dueDiligenceLevel": "STANDARD",
    "requiresEnhancedDueDiligence": true,
    "enhancedDueDiligenceReason": "INTERNATIONAL_TRANSACTIONS",
    "lastDueDiligenceUpdate": "2024-01-15",
    "nextDueDiligenceReviewDate": "2024-07-15",
    "complianceOfficerNotes": [
      {
        "noteId": "NOTE-2024-001",
        "noteDate": "2024-01-15",
        "author": "María López",
        "noteType": "OBSERVATION",
        "content": "Cliente presenta perfil de riesgo medio. Se recomienda implementar EDD por transacciones internacionales frecuentes.",
        "isResolved": false
      }
    ],
    "mandatoryFields": [
      "applicableControls",
      "riskMitigationLevel",
      "dueDiligenceLevel"
    ],
    "completedFields": [
      "applicableControls", "riskMitigationLevel", "mitigationStrategy",
      "dueDiligenceLevel", "requiresEnhancedDueDiligence"
    ],
    "sectionCompletenessPercentage": 75.0
  }
}
```

### 2.7 Documentos Adjuntos

```json
{
  "attachedDocuments": [
    {
      "documentId": "DOC-2024-001",
      "documentType": "IDENTITY_CARD",
      "documentName": "Cédula de Identidad - Frente y Dorso",
      "fileFormat": "PDF",
      "fileSize": 1024576,
      "uploadDate": "2024-01-15T10:45:00Z",
      "uploadedBy": "juan.perez",
      "filePath": "/dossiers/DOSS-2024-00001/documents/cedula_v12345678.pdf",
      "fileHash": "sha256:a3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "isVerified": true,
      "verifiedBy": "maria.lopez",
      "verifiedDate": "2024-01-15T11:30:00Z",
      "expirationDate": null,
      "isMandatory": true,
      "status": "APPROVED"
    },
    {
      "documentId": "DOC-2024-002",
      "documentType": "PROOF_OF_INCOME",
      "documentName": "Declaración de Impuestos 2023",
      "fileFormat": "PDF",
      "fileSize": 2048576,
      "uploadDate": "2024-01-16T09:15:00Z",
      "uploadedBy": "juan.perez",
      "filePath": "/dossiers/DOSS-2024-00001/documents/declaracion_2023.pdf",
      "fileHash": "sha256:b4c3d2e1f0g9h8i7j6k5l4m3n2o1p0",
      "isVerified": true,
      "verifiedBy": "maria.lopez",
      "verifiedDate": "2024-01-16T14:20:00Z",
      "expirationDate": "2025-04-15",
      "isMandatory": true,
      "status": "APPROVED"
    }
  ]
}
```

### 2.8 Evaluación de Riesgo

```json
{
  "riskAssessment": {
    "assessmentId": "RISK-2024-00001",
    "assessmentDate": "2024-01-20T16:00:00Z",
    "assessmentVersion": 2,
    "assessedBy": "pedro.garcia",
    "approvedBy": null,
    "assessmentStatus": "UNDER_REVIEW",
    
    "inherentRisk": {
      "overall": "MEDIUM",
      "score": 55,
      "maxScore": 100,
      "factors": [
        {
          "factorCode": "CUSTOMER_TYPE",
          "factorName": "Tipo de Cliente",
          "weight": 15,
          "score": 45,
          "ratingValue": "MEDIUM",
          "justification": "Persona natural con actividad comercial"
        },
        {
          "factorCode": "PRODUCT_RISK",
          "factorName": "Riesgo de Productos",
          "weight": 20,
          "score": 30,
          "ratingValue": "LOW_MEDIUM",
          "justification": "Seguros de auto y vida sin componente de inversión complejo"
        },
        {
          "factorCode": "GEOGRAPHIC_RISK",
          "factorName": "Riesgo Geográfico",
          "weight": 20,
          "score": 75,
          "ratingValue": "HIGH",
          "justification": "Venezuela es jurisdicción de alto riesgo + transacciones internacionales"
        },
        {
          "factorCode": "DISTRIBUTION_CHANNEL",
          "factorName": "Canal de Distribución",
          "weight": 15,
          "score": 50,
          "ratingValue": "MEDIUM",
          "justification": "Intermediario tradicional con licencia vigente"
        },
        {
          "factorCode": "BENEFICIAL_OWNER",
          "factorName": "Beneficiario Final",
          "weight": 15,
          "score": 20,
          "ratingValue": "LOW",
          "justification": "Estructura de propiedad transparente y simple"
        },
        {
          "factorCode": "PEP_STATUS",
          "factorName": "Persona Expuesta Políticamente",
          "weight": 15,
          "score": 0,
          "ratingValue": "LOW",
          "justification": "No es PEP ni tiene vínculos con PEPs"
        }
      ]
    },
    
    "residualRisk": {
      "overall": "LOW_MEDIUM",
      "score": 35,
      "maxScore": 100,
      "mitigationEffectiveness": 36.4,
      "justification": "Controles de KYC estándar y monitoreo continuo reducen significativamente el riesgo inherente"
    },
    
    "alerts": [
      {
        "alertId": "ALT-2024-001",
        "alertType": "PENDING_ENHANCED_DUE_DILIGENCE",
        "severity": "MEDIUM",
        "message": "Requiere Debida Diligencia Reforzada por transacciones internacionales",
        "generatedDate": "2024-01-20T16:00:00Z",
        "status": "OPEN",
        "assignedTo": "pedro.garcia"
      }
    ],
    
    "recommendations": [
      "Implementar Debida Diligencia Reforzada antes de 2024-02-15",
      "Programar revisión trimestral del expediente",
      "Monitorear transacciones internacionales con umbral reducido"
    ]
  }
}
```

### 2.9 Historial de Cambios (Inmutable)

```json
{
  "changeHistory": [
    {
      "changeId": "CHG-2024-00001",
      "changeUuid": "660e8400-e29b-41d4-a716-446655440001",
      "timestamp": "2024-01-15T10:30:00Z",
      "changeType": "CREATION",
      "performedBy": "juan.perez",
      "performedByRole": "AREA_RESPONSIBLE",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "description": "Creación inicial del expediente",
      "affectedSections": ["ALL"],
      "affectedFields": [],
      "previousValue": null,
      "newValue": null,
      "requiresApproval": false,
      "approvalStatus": null
    },
    {
      "changeId": "CHG-2024-00002",
      "changeUuid": "660e8400-e29b-41d4-a716-446655440002",
      "timestamp": "2024-01-16T14:22:00Z",
      "changeType": "UPDATE",
      "performedBy": "juan.perez",
      "performedByRole": "AREA_RESPONSIBLE",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "description": "Actualización de información económica",
      "affectedSections": ["economicInformation"],
      "affectedFields": [
        "economicInformation.incomeInformation.monthlyIncome",
        "economicInformation.fundsOrigin.description"
      ],
      "previousValues": {
        "economicInformation.incomeInformation.monthlyIncome": {
          "amount": 4000.00,
          "currency": "USD"
        },
        "economicInformation.fundsOrigin.description": "Ingresos comerciales"
      },
      "newValues": {
        "economicInformation.incomeInformation.monthlyIncome": {
          "amount": 5000.00,
          "currency": "USD"
        },
        "economicInformation.fundsOrigin.description": "Ingresos derivados de empresa familiar dedicada al comercio exterior"
      },
      "requiresApproval": false,
      "approvalStatus": null
    },
    {
      "changeId": "CHG-2024-00003",
      "changeUuid": "660e8400-e29b-41d4-a716-446655440003",
      "timestamp": "2024-01-20T09:15:00Z",
      "changeType": "STATUS_CHANGE",
      "performedBy": "maria.lopez",
      "performedByRole": "COMPLIANCE_AREA",
      "ipAddress": "192.168.1.105",
      "userAgent": "Mozilla/5.0...",
      "description": "Cambio de estado a En Revisión",
      "affectedSections": ["status"],
      "affectedFields": ["status"],
      "previousValues": {
        "status": "INCOMPLETE"
      },
      "newValues": {
        "status": "UNDER_REVIEW"
      },
      "requiresApproval": false,
      "approvalStatus": null
    }
  ]
}
```

### 2.10 Comentarios de Revisión

```json
{
  "reviewComments": [
    {
      "commentId": "CMT-2024-001",
      "commentDate": "2024-01-20T14:30:00Z",
      "author": "maria.lopez",
      "authorRole": "COMPLIANCE_ANALYST",
      "commentType": "REQUEST_INFO",
      "section": "economicInformation",
      "specificField": "fundsOrigin.fundsSourceDocumentation",
      "comment": "Se requiere documentación adicional que respalde el origen de los fondos declarados. Por favor adjuntar estados de cuenta bancarios de los últimos 3 meses.",
      "priority": "HIGH",
      "dueDate": "2024-01-25",
      "status": "OPEN",
      "responseDate": null,
      "response": null,
      "resolvedBy": null,
      "resolvedDate": null
    },
    {
      "commentId": "CMT-2024-002",
      "commentDate": "2024-01-20T15:45:00Z",
      "author": "pedro.garcia",
      "authorRole": "COMPLIANCE_OFFICER",
      "commentType": "OBSERVATION",
      "section": "geographicLocation",
      "specificField": "coordinates",
      "comment": "Las coordenadas geográficas deben verificarse con mayor precisión. Favor validar con el cliente.",
      "priority": "MEDIUM",
      "dueDate": "2024-01-27",
      "status": "OPEN",
      "responseDate": null,
      "response": null,
      "resolvedBy": null,
      "resolvedDate": null
    }
  ]
}
```

---

## 3. Gestión de Completitud del Expediente

### 3.1 Algoritmo de Cálculo de Completitud

El sistema calcula automáticamente el porcentaje de completitud del expediente basándose en:

1. **Campos Obligatorios por Sección**: Cada sección define sus campos mandatorios
2. **Documentos Obligatorios**: Lista de documentos requeridos según tipo de sujeto
3. **Controles Mínimos**: Controles internos que deben estar implementados

```javascript
// Pseudocódigo del algoritmo
function calculateCompletenessPercentage(dossier) {
  let totalWeight = 0;
  let completedWeight = 0;
  
  // Peso de cada sección
  const sectionWeights = {
    identification: 25,
    economicInformation: 20,
    insurerRelationship: 20,
    geographicLocation: 15,
    internalControls: 15,
    attachedDocuments: 5
  };
  
  // Evaluar cada sección
  for (const [section, weight] of Object.entries(sectionWeights)) {
    totalWeight += weight;
    
    const mandatoryFields = dossier[section].mandatoryFields;
    const completedFields = dossier[section].completedFields;
    
    const sectionCompleteness = 
      (completedFields.length / mandatoryFields.length) * weight;
    
    completedWeight += sectionCompleteness;
  }
  
  return (completedWeight / totalWeight) * 100;
}
```

### 3.2 Indicadores de Completitud

| Porcentaje | Estado Visual | Acción Permitida |
|------------|---------------|------------------|
| 0% - 25% | 🔴 Crítico | Solo edición por creador |
| 26% - 50% | 🟠 Muy Incompleto | Solo edición por creador |
| 51% - 75% | 🟡 Parcialmente Completo | Solo edición por creador |
| 76% - 95% | 🔵 Casi Completo | Puede enviarse a revisión |
| 96% - 100% | 🟢 Completo | Listo para aprobación |

### 3.3 Campos Obligatorios por Tipo de Sujeto

```json
{
  "mandatoryFieldsBySubjectType": {
    "CLIENT": {
      "identification": [
        "personType", "fullName", "documentType", "documentNumber",
        "address.street", "address.city", "address.state", "address.country",
        "contactInformation.primaryPhone", "contactInformation.email"
      ],
      "economicInformation": [
        "economicActivity.primaryActivity",
        "fundsOrigin.primarySource",
        "beneficialOwner.complexityLevel"
      ],
      "insurerRelationship": [
        "relationshipStartDate", "associatedProducts", "distributionChannel"
      ],
      "geographicLocation": [
        "domicileCountry.countryCode", "state.stateName", "city.cityName"
      ],
      "internalControls": [
        "applicableControls", "riskMitigationLevel", "dueDiligenceLevel"
      ],
      "attachedDocuments": [
        "IDENTITY_CARD", "PROOF_OF_ADDRESS", "PROOF_OF_INCOME"
      ]
    },
    "INTERMEDIARY": {
      "identification": [
        "personType", "legalName", "rifNumber",
        "address.street", "address.city", "address.state",
        "contactInformation.primaryPhone", "contactInformation.email"
      ],
      "economicInformation": [
        "economicActivity.primaryActivity",
        "beneficialOwner.complexityLevel",
        "beneficialOwner.identifiedBeneficialOwners"
      ],
      "insurerRelationship": [
        "relationshipStartDate", "distributionChannel"
      ],
      "geographicLocation": [
        "domicileCountry.countryCode", "state.stateName"
      ],
      "internalControls": [
        "applicableControls", "riskMitigationLevel"
      ],
      "attachedDocuments": [
        "COMMERCIAL_REGISTRY", "BROKER_LICENSE", "TAX_CERTIFICATE"
      ]
    },
    "EMPLOYEE": {
      "identification": [
        "personType", "fullName", "documentType", "documentNumber",
        "address.city", "address.state",
        "contactInformation.primaryPhone", "contactInformation.email"
      ],
      "economicInformation": [
        "fundsOrigin.primarySource"
      ],
      "insurerRelationship": [
        "relationshipStartDate"
      ],
      "geographicLocation": [
        "domicileCountry.countryCode", "state.stateName"
      ],
      "internalControls": [
        "applicableControls"
      ],
      "attachedDocuments": [
        "IDENTITY_CARD", "BACKGROUND_CHECK"
      ]
    },
    "PROVIDER": {
      "identification": [
        "personType", "legalName", "rifNumber",
        "address.street", "address.city",
        "contactInformation.primaryPhone", "contactInformation.email"
      ],
      "economicInformation": [
        "economicActivity.primaryActivity",
        "beneficialOwner.complexityLevel"
      ],
      "insurerRelationship": [
        "relationshipStartDate"
      ],
      "geographicLocation": [
        "domicileCountry.countryCode"
      ],
      "internalControls": [
        "applicableControls"
      ],
      "attachedDocuments": [
        "COMMERCIAL_REGISTRY", "TAX_CERTIFICATE"
      ]
    },
    "REINSURER": {
      "identification": [
        "personType", "legalName", "rifNumber",
        "address.country",
        "contactInformation.primaryPhone", "contactInformation.email"
      ],
      "economicInformation": [
        "beneficialOwner.complexityLevel"
      ],
      "insurerRelationship": [
        "relationshipStartDate"
      ],
      "geographicLocation": [
        "domicileCountry.countryCode"
      ],
      "internalControls": [
        "applicableControls", "riskMitigationLevel"
      ],
      "attachedDocuments": [
        "REINSURANCE_LICENSE", "FINANCIAL_STATEMENTS"
      ]
    },
    "RETROCESSIONAIRE": {
      "identification": [
        "personType", "legalName",
        "address.country",
        "contactInformation.email"
      ],
      "economicInformation": [
        "beneficialOwner.complexityLevel"
      ],
      "insurerRelationship": [
        "relationshipStartDate"
      ],
      "geographicLocation": [
        "domicileCountry.countryCode"
      ],
      "internalControls": [
        "applicableControls"
      ],
      "attachedDocuments": [
        "RETROCESSION_AGREEMENT", "FINANCIAL_STATEMENTS"
      ]
    }
  }
}
```

---

## 4. Reglas de Flujo Operativo

### 4.1 Creación y Actualización

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: CREACIÓN Y COMPLETADO (Responsable del Área)           │
└─────────────────────────────────────────────────────────────────┘
          │
          ├─> Crear expediente nuevo
          ├─> Completar información obligatoria
          ├─> Adjuntar documentos requeridos
          ├─> Sistema calcula completitud automáticamente
          │
          ├─> Si completitud < 76%
          │   └─> Estado: INCOMPLETO (puede seguir editando)
          │
          └─> Si completitud >= 76%
              └─> Puede enviar a revisión
                  └─> Estado cambia a: EN_REVISION

┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: REVISIÓN (Área de Cumplimiento)                        │
└─────────────────────────────────────────────────────────────────┘
          │
          ├─> Analista revisa información
          ├─> Verifica documentos adjuntos
          ├─> Ejecuta evaluación de riesgo
          │
          ├─> OPCIÓN A: Solicitar información adicional
          │   └─> Estado: REQUIERE_INFORMACION
          │       └─> Regresa al Responsable del Área
          │           └─> Vuelve a FASE 1
          │
          ├─> OPCIÓN B: Identificar observaciones
          │   └─> Estado: OBSERVADO
          │       └─> Regresa al Responsable del Área
          │           └─> Vuelve a FASE 1
          │
          └─> OPCIÓN C: Enviar al Oficial de Cumplimiento
              └─> Mantiene estado: EN_REVISION

┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: APROBACIÓN (Oficial de Cumplimiento)                   │
└─────────────────────────────────────────────────────────────────┘
          │
          ├─> Oficial revisa análisis del Área
          ├─> Valida evaluación de riesgo
          ├─> Confirma controles aplicados
          │
          ├─> OPCIÓN A: Devolver para revisión adicional
          │   └─> Estado: REQUIERE_INFORMACION o OBSERVADO
          │       └─> Regresa a FASE 1 o FASE 2
          │
          └─> OPCIÓN B: Aprobar expediente
              └─> Estado: APROBADO
                  └─> Expediente YA NO PUEDE ELIMINARSE
                  └─> Cambios futuros requieren aprobación previa
```

### 4.2 Modificación Post-Aprobación

```
┌─────────────────────────────────────────────────────────────────┐
│ EXPEDIENTE APROBADO - Solicitud de Modificación                │
└─────────────────────────────────────────────────────────────────┘
          │
          ├─> Usuario intenta modificar datos
          │
          └─> Sistema BLOQUEA la modificación directa
              │
              ├─> Genera ALERTA automática al Oficial de Cumplimiento
              │   - Tipo de alerta: SOLICITUD_MODIFICACION_EXPEDIENTE
              │   - Contiene: Campo a modificar, valor actual, valor propuesto
              │   - Usuario que solicita, justificación
              │
              └─> Oficial de Cumplimiento recibe notificación
                  │
                  ├─> OPCIÓN A: APROBAR modificación
                  │   └─> Sistema registra aprobación en historial
                  │       └─> Modificación se aplica
                  │           └─> Expediente mantiene estado: APROBADO
                  │               └─> Registro inmutable de cambio en changeHistory
                  │
                  ├─> OPCIÓN B: RECHAZAR modificación
                  │   └─> Sistema notifica al usuario
                  │       └─> Expediente permanece sin cambios
                  │           └─> Registro del intento y rechazo en audit log
                  │
                  └─> OPCIÓN C: SOLICITAR INFORMACIÓN ADICIONAL
                      └─> Usuario debe proporcionar más justificación
                          └─> Proceso se repite
```

### 4.3 Reglas de Eliminación

```
┌─────────────────────────────────────────────────────────────────┐
│ REGLAS DE ELIMINACIÓN DE EXPEDIENTES                           │
└─────────────────────────────────────────────────────────────────┘

1. EXPEDIENTE CON ESTADO = INCOMPLETO
   └─> Puede eliminarse (soft delete)
       └─> Solo por usuario creador o Oficial de Cumplimiento
           └─> Genera registro en audit log
               └─> Expediente marcado como: isDeleted = true
                   └─> NO se elimina físicamente de la BD

2. EXPEDIENTE CON ESTADO = EN_REVISION
   └─> NO puede eliminarse
       └─> Debe revertirse a INCOMPLETO primero
           └─> Requiere justificación y aprobación

3. EXPEDIENTE CON ESTADO = REQUIERE_INFORMACION
   └─> Puede eliminarse (soft delete)
       └─> Solo con aprobación del Área de Cumplimiento
           └─> Genera registro en audit log

4. EXPEDIENTE CON ESTADO = OBSERVADO
   └─> Puede eliminarse (soft delete)
       └─> Solo con aprobación del Área de Cumplimiento
           └─> Genera registro en audit log

5. EXPEDIENTE CON ESTADO = APROBADO
   └─> NUNCA puede eliminarse
       └─> Permanece en el sistema de forma permanente
           └─> Solo puede marcarse como "inactivo" si la relación termina
               └─> Pero el expediente y su historial persisten para inspecciones
```

---

## 5. Diseño para Inspección Regulatoria

### 5.1 Principios de Transparencia Regulatoria

El expediente único está diseñado específicamente para facilitar inspecciones por parte de la Superintendencia de Seguros de Venezuela:

1. **Trazabilidad Completa**
   - Cada acción genera un registro inmutable
   - Historial de cambios nunca se elimina
   - Identificación clara de quién hizo qué y cuándo

2. **Segregación de Funciones Evidente**
   - Roles claramente definidos en cada operación
   - Separación entre creación, revisión y aprobación
   - Logs muestran la cadena de responsabilidades

3. **Evidencia de Controles Internos**
   - Documentación de controles aplicados
   - Justificación de decisiones de riesgo
   - Medidas de mitigación implementadas

4. **Información Consolidada**
   - Toda la información del sujeto en un solo lugar
   - Fácil acceso para auditores
   - Exportable en formatos estándar

### 5.2 Reportes para el Regulador

El sistema debe poder generar los siguientes reportes bajo demanda:

```json
{
  "regulatoryReports": [
    {
      "reportType": "COMPLETE_DOSSIER_EXPORT",
      "description": "Expediente completo con todo el historial",
      "format": ["PDF", "JSON", "XML"],
      "includes": [
        "Planilla estructurada completa",
        "Documentos adjuntos",
        "Evaluación de riesgo",
        "Historial completo de cambios",
        "Comentarios de revisión",
        "Logs de auditoría"
      ]
    },
    {
      "reportType": "RISK_ASSESSMENT_SUMMARY",
      "description": "Resumen de evaluación de riesgo",
      "format": ["PDF", "EXCEL"],
      "includes": [
        "Factores de riesgo identificados",
        "Puntajes de riesgo inherente y residual",
        "Controles aplicados",
        "Justificación de decisiones"
      ]
    },
    {
      "reportType": "AUDIT_TRAIL",
      "description": "Pista de auditoría completa",
      "format": ["PDF", "CSV"],
      "includes": [
        "Todas las modificaciones al expediente",
        "Usuarios que realizaron cada acción",
        "Fechas y horas exactas",
        "Direcciones IP y user agents",
        "Aprobaciones y rechazos"
      ]
    },
    {
      "reportType": "COMPLIANCE_CERTIFICATION",
      "description": "Certificación de cumplimiento",
      "format": ["PDF"],
      "includes": [
        "Verificación de completitud",
        "Confirmación de revisión por Área de Cumplimiento",
        "Aprobación del Oficial de Cumplimiento",
        "Fecha de última actualización",
        "Próxima fecha de revisión"
      ]
    }
  ]
}
```

### 5.3 Acceso para Inspectores

```json
{
  "inspectorAccess": {
    "accessLevel": "READ_ONLY",
    "scope": "ALL_DOSSIERS",
    "capabilities": [
      "Ver expedientes completos",
      "Exportar expedientes en múltiples formatos",
      "Consultar historial de cambios",
      "Generar reportes predefinidos",
      "Búsqueda avanzada por criterios múltiples",
      "Visualizar evaluaciones de riesgo",
      "Acceder a documentos adjuntos",
      "Ver logs de auditoría del sistema"
    ],
    "restrictions": [
      "No puede modificar información",
      "No puede eliminar registros",
      "No puede crear usuarios",
      "Acceso registrado en audit log especial"
    ],
    "auditOfInspectorAccess": {
      "logFields": [
        "inspectorId",
        "inspectorName",
        "inspectorInstitution",
        "accessDate",
        "accessTime",
        "dossiersAccessed",
        "reportsGenerated",
        "searchQueriesPerformed",
        "sessionDuration"
      ]
    }
  }
}
```

---

## 6. Consideraciones Técnicas de Implementación

### 6.1 Validaciones en Backend

```java
// Validación de completitud antes de enviar a revisión
public ValidationResult validateDossierForReview(Dossier dossier) {
    ValidationResult result = new ValidationResult();
    
    // Verificar porcentaje mínimo de completitud
    if (dossier.getCompletenessPercentage() < 76.0) {
        result.addError("INSUFFICIENT_COMPLETENESS",
            "El expediente debe estar al menos 76% completo para enviarse a revisión");
    }
    
    // Verificar campos obligatorios por sección
    for (String section : MANDATORY_SECTIONS) {
        List<String> missingFields = 
            dossier.getMissingMandatoryFields(section);
        
        if (!missingFields.isEmpty()) {
            result.addError("MISSING_MANDATORY_FIELDS",
                String.format("Faltan campos obligatorios en %s: %s",
                    section, String.join(", ", missingFields)));
        }
    }
    
    // Verificar documentos obligatorios
    List<String> missingDocuments = 
        dossier.getMissingMandatoryDocuments();
    
    if (!missingDocuments.isEmpty()) {
        result.addError("MISSING_MANDATORY_DOCUMENTS",
            String.format("Faltan documentos obligatorios: %s",
                String.join(", ", missingDocuments)));
    }
    
    return result;
}
```

### 6.2 Gestión de Concurrencia

```java
// Optimistic locking para prevenir modificaciones concurrentes
@Entity
@Table(name = "dossiers")
public class Dossier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID dossierUuid;
    
    @Version
    private Long version;
    
    // Otros campos...
    
    // Método para verificar si el expediente puede modificarse
    public boolean canBeModified(String userId, String userRole) {
        if (this.status == DossierStatus.APPROVED) {
            // Si está aprobado, solo puede modificarse con aprobación previa
            return false;
        }
        
        if (this.status == DossierStatus.UNDER_REVIEW) {
            // Si está en revisión, solo el área de cumplimiento puede modificarlo
            return userRole.equals("COMPLIANCE_ANALYST") || 
                   userRole.equals("COMPLIANCE_OFFICER");
        }
        
        // En otros estados, el creador puede modificarlo
        return this.createdBy.equals(userId);
    }
}
```

### 6.3 Eventos de Auditoría

```java
// Event Sourcing para auditoría inmutable
@Service
public class DossierAuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Async
    public void recordDossierChange(
        UUID dossierId,
        String changeType,
        String performedBy,
        String performedByRole,
        Map<String, Object> previousValues,
        Map<String, Object> newValues,
        HttpServletRequest request
    ) {
        AuditLog auditLog = new AuditLog();
        auditLog.setChangeUuid(UUID.randomUUID());
        auditLog.setDossierId(dossierId);
        auditLog.setChangeType(changeType);
        auditLog.setPerformedBy(performedBy);
        auditLog.setPerformedByRole(performedByRole);
        auditLog.setPreviousValues(jsonSerialize(previousValues));
        auditLog.setNewValues(jsonSerialize(newValues));
        auditLog.setIpAddress(request.getRemoteAddr());
        auditLog.setUserAgent(request.getHeader("User-Agent"));
        auditLog.setTimestamp(Instant.now());
        
        // Los audit logs NUNCA se actualizan ni eliminan
        auditLogRepository.save(auditLog);
        
        // Emitir evento para notificaciones en tiempo real
        eventPublisher.publishEvent(
            new DossierChangedEvent(dossierId, changeType, performedBy)
        );
    }
}
```

### 6.4 Cálculo Automático de Completitud

```java
@Service
public class DossierCompletenessService {
    
    public double calculateCompleteness(Dossier dossier) {
        Map<String, Double> sectionWeights = Map.of(
            "identification", 25.0,
            "economicInformation", 20.0,
            "insurerRelationship", 20.0,
            "geographicLocation", 15.0,
            "internalControls", 15.0,
            "attachedDocuments", 5.0
        );
        
        double totalWeight = 0.0;
        double completedWeight = 0.0;
        
        for (Map.Entry<String, Double> entry : sectionWeights.entrySet()) {
            String section = entry.getKey();
            Double weight = entry.getValue();
            
            totalWeight += weight;
            
            // Obtener campos obligatorios y completados de la sección
            List<String> mandatoryFields = 
                dossier.getMandatoryFieldsForSection(section);
            List<String> completedFields = 
                dossier.getCompletedFieldsForSection(section);
            
            if (mandatoryFields.isEmpty()) {
                // Si no hay campos obligatorios, la sección está completa
                completedWeight += weight;
            } else {
                // Calcular el porcentaje de completitud de la sección
                double sectionCompletenessPercentage = 
                    (double) completedFields.size() / mandatoryFields.size();
                completedWeight += sectionCompletenessPercentage * weight;
            }
        }
        
        return (completedWeight / totalWeight) * 100.0;
    }
    
    @Scheduled(fixedRate = 3600000) // Cada hora
    public void recalculateAllIncompleteDossiers() {
        List<Dossier> incompleteDossiers = 
            dossierRepository.findByStatusIn(
                List.of(DossierStatus.INCOMPLETE, 
                        DossierStatus.REQUIRES_INFO)
            );
        
        for (Dossier dossier : incompleteDossiers) {
            double newCompleteness = calculateCompleteness(dossier);
            dossier.setCompletenessPercentage(newCompleteness);
            dossierRepository.save(dossier);
        }
    }
}
```

---

## 7. Conclusión

Este modelo de expediente único proporciona:

1. **Estructura robusta** que cumple con todos los requerimientos regulatorios
2. **Trazabilidad completa** de todas las operaciones
3. **Segregación clara** de funciones y responsabilidades
4. **Flexibilidad** para manejar diferentes tipos de sujetos obligados
5. **Transparencia** para inspecciones regulatorias
6. **Escalabilidad** mediante diseño modular y formato JSON
7. **Seguridad** mediante controles de acceso y auditoría inmutable

El expediente está diseñado para ser el corazón del SIAR, garantizando que cada sujeto obligado tenga un registro completo, auditable y regulatorialmente conforme de toda su información relevante para la gestión de riesgos y cumplimiento normativo.
