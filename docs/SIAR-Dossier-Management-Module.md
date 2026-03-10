# SIAR - Módulo de Gestión de Expedientes (Dossier Management)

## Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura del Módulo](#2-arquitectura-del-módulo)
3. [Modelo de Datos](#3-modelo-de-datos)
4. [Entidades Java](#4-entidades-java)
5. [DTOs y Comunicación JSON](#5-dtos-y-comunicación-json)
6. [Lógica de Negocio](#6-lógica-de-negocio)
7. [APIs REST](#7-apis-rest)
8. [Flujo de Aprobación](#8-flujo-de-aprobación)
9. [Historial de Cambios](#9-historial-de-cambios)
10. [Integración con Otros Módulos](#10-integración-con-otros-módulos)
11. [Validaciones y Reglas de Negocio](#11-validaciones-y-reglas-de-negocio)
12. [Evidencia para Inspecciones Regulatorias](#12-evidencia-para-inspecciones-regulatorias)
13. [Testing y Calidad](#13-testing-y-calidad)

---

## 1. Visión General

### 1.1 Propósito

El **Módulo de Gestión de Expedientes** es el componente central del SIAR que administra información estructurada y validada de todas las entidades con las que la aseguradora mantiene relaciones comerciales, operativas o laborales.

### 1.2 Alcance

Este módulo proporciona:

- **Creación y mantenimiento** de expedientes únicos para cada entidad
- **Control de cambios** con historial inmutable y trazabilidad completa
- **Flujo de aprobación** con segregación de funciones
- **Integración** con módulos de Riesgo, PEP, Screening y Debida Diligencia
- **Evidencia auditable** para inspecciones regulatorias

### 1.3 Tipos de Expedientes

| Tipo | Código | Descripción | Áreas Responsables |
|------|--------|-------------|-------------------|
| Cliente | `CLIENT` | Personas naturales o jurídicas que contratan pólizas | Comercial, Cumplimiento |
| Intermediario | `INTERMEDIARY` | Corredores, agentes y productores de seguros | Comercial, Operaciones |
| Empleado | `EMPLOYEE` | Personal interno de la aseguradora | Recursos Humanos |
| Proveedor | `SUPPLIER` | Proveedores de bienes y servicios | Administración, Operaciones |
| Reasegurador | `REINSURER` | Compañías reaseguradoras | Operaciones, Técnico |
| Retrocesionario | `RETROCESSIONAIRE` | Compañías retrocesionarias | Técnico |

### 1.4 Estados del Expediente

```
INCOMPLETO → EN_REVISION → APROBADO
                ↓              ↓
    REQUIERE_INFORMACION  OBSERVADO
                ↓              ↓
           EN_REVISION ← ← ← ←
```

| Estado | Código | Descripción | Editable |
|--------|--------|-------------|----------|
| Incompleto | `INCOMPLETE` | Faltan campos obligatorios (< 76% completo) | Sí |
| En Revisión | `UNDER_REVIEW` | Bajo análisis del Área de Cumplimiento | No |
| Requiere Información | `REQUIRES_INFO` | Solicitud de datos adicionales | Sí |
| Observado | `OBSERVED` | Anomalías detectadas que requieren corrección | Sí |
| Aprobado | `APPROVED` | Validado por Oficial de Cumplimiento | Solo con aprobación |

### 1.5 Principios Fundamentales

1. **Identificador único inmutable**: Cada expediente tiene un ID único generado automáticamente
2. **Expediente puede estar incompleto**: No todos los campos son obligatorios inicialmente
3. **No eliminación física**: Todos los expedientes se conservan permanentemente (soft delete)
4. **Aprobación obligatoria**: Modificaciones a expedientes aprobados requieren autorización
5. **Historial completo**: Todos los cambios quedan registrados de forma inmutable
6. **Segregación de funciones**: Creadores no pueden aprobar sus propios expedientes
7. **Solo alerta, no bloquea**: El sistema genera alertas pero no impide operaciones

---

## 2. Arquitectura del Módulo

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO DE EXPEDIENTES                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Controller  │  │   Service    │  │  Repository  │    │
│  │    Layer     │→ │    Layer     │→ │    Layer     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         ↓                  ↓                  ↓            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     DTOs     │  │   Entities   │  │   Database   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↑    ↓
        ┌────────────────┴────┴───────────────┐
        │                                     │
┌───────▼────────┐  ┌──────────┐  ┌─────────▼──────┐
│  Autenticación │  │   RBAC   │  │    Auditoría   │
│     & Login    │  │          │  │                │
└────────────────┘  └──────────┘  └────────────────┘
        │                                     │
┌───────▼────────┐  ┌──────────┐  ┌─────────▼──────┐
│     Alertas    │  │  Riesgo  │  │      PEP       │
│                │  │          │  │                │
└────────────────┘  └──────────┘  └────────────────┘
```

### 2.2 Capas del Módulo

#### Controller Layer (Capa de Presentación)
- **DossierController**: Endpoints REST para operaciones CRUD
- **DossierApprovalController**: Endpoints para flujo de aprobación
- **DossierHistoryController**: Endpoints para consultar historial

#### Service Layer (Capa de Lógica de Negocio)
- **DossierService**: Operaciones principales (crear, actualizar, consultar)
- **DossierValidationService**: Validaciones de negocio
- **DossierApprovalService**: Lógica de flujo de aprobación
- **DossierCompletenessService**: Cálculo de porcentaje de completitud
- **DossierHistoryService**: Gestión de historial de cambios

#### Repository Layer (Capa de Persistencia)
- **DossierRepository**: Acceso a datos de expedientes
- **DossierChangeHistoryRepository**: Acceso a historial de cambios
- **DossierApprovalRequestRepository**: Solicitudes de modificación

### 2.3 Integración con Otros Módulos

| Módulo | Tipo de Integración | Descripción |
|--------|---------------------|-------------|
| **Autenticación** | Obligatoria | Valida identidad del usuario en cada operación |
| **RBAC** | Obligatoria | Verifica permisos según rol del usuario |
| **Auditoría** | Obligatoria | Registra todas las operaciones en audit log |
| **Alertas** | Obligatoria | Genera alertas automáticas ante eventos críticos |
| **Riesgo** | Bidireccional | Evalúa riesgo del expediente, recibe resultado |
| **PEP** | Bidireccional | Consulta condición PEP, recibe notificaciones |
| **Screening** | Bidireccional | Envía datos para screening, recibe resultados |
| **Debida Diligencia** | Bidireccional | Determina nivel de DD según riesgo |

---

## 3. Modelo de Datos

### 3.1 Diagrama de Entidades

```
┌────────────────────────────────────────────────────────────────┐
│                          DOSSIER                                │
├────────────────────────────────────────────────────────────────┤
│ - id (UUID, PK)                                                 │
│ - dossierNumber (String, UNIQUE)                               │
│ - dossierType (Enum)                                           │
│ - status (Enum)                                                │
│ - completenessPercentage (Double)                             │
│ - createdBy (UUID, FK → User)                                 │
│ - createdAt (Timestamp)                                        │
│ - updatedBy (UUID, FK → User)                                 │
│ - updatedAt (Timestamp)                                        │
│ - approvedBy (UUID, FK → User)                                │
│ - approvedAt (Timestamp)                                       │
│ - isDeleted (Boolean)                                          │
│ - deletedBy (UUID, FK → User)                                 │
│ - deletedAt (Timestamp)                                        │
│ - generalData (JSON)                                           │
│ - contactData (JSON)                                           │
│ - identificationData (JSON)                                    │
│ - economicData (JSON)                                          │
│ - documentsData (JSON)                                         │
└────────────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                  DOSSIER_CHANGE_HISTORY                        │
├────────────────────────────────────────────────────────────────┤
│ - id (UUID, PK)                                                 │
│ - dossierId (UUID, FK → Dossier)                               │
│ - changeType (Enum)                                            │
│ - changedBy (UUID, FK → User)                                 │
│ - changedAt (Timestamp)                                        │
│ - fieldName (String)                                           │
│ - oldValue (Text)                                              │
│ - newValue (Text)                                              │
│ - changeReason (Text)                                          │
│ - approvedBy (UUID, FK → User)                                │
│ - approvedAt (Timestamp)                                       │
│ - ipAddress (String)                                           │
│ - userAgent (String)                                           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│              DOSSIER_APPROVAL_REQUEST                          │
├────────────────────────────────────────────────────────────────┤
│ - id (UUID, PK)                                                 │
│ - dossierId (UUID, FK → Dossier)                               │
│ - requestType (Enum)                                           │
│ - requestedBy (UUID, FK → User)                                │
│ - requestedAt (Timestamp)                                      │
│ - proposedChanges (JSON)                                       │
│ - justification (Text)                                         │
│ - status (Enum: PENDING, APPROVED, REJECTED)                  │
│ - reviewedBy (UUID, FK → User)                                 │
│ - reviewedAt (Timestamp)                                       │
│ - reviewComments (Text)                                        │
│ - alertId (UUID, FK → Alert)                                   │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Estructura de Datos JSON por Tipo de Expediente

#### 3.2.1 Cliente (CLIENT)

```json
{
  "generalData": {
    "personType": "NATURAL|LEGAL",
    "firstName": "Juan",
    "middleName": "Carlos",
    "lastName": "Pérez",
    "secondLastName": "González",
    "businessName": null,
    "commercialName": null,
    "dateOfBirth": "1985-03-15",
    "nationality": "Venezolana",
    "gender": "M|F|OTHER",
    "maritalStatus": "SINGLE|MARRIED|DIVORCED|WIDOWED",
    "isPep": false,
    "pepDetails": null
  },
  "identificationData": {
    "documentType": "V|E|J|G|P",
    "documentNumber": "12345678",
    "taxId": "V123456789",
    "registrationNumber": null,
    "registrationDate": null,
    "registrationCountry": "VE"
  },
  "contactData": {
    "email": "juan.perez@email.com",
    "phoneNumber": "+58-414-1234567",
    "alternatePhone": "+58-212-1234567",
    "address": {
      "street": "Av. Principal",
      "buildingNumber": "123",
      "apartmentNumber": "5-A",
      "urbanization": "Los Palos Grandes",
      "city": "Caracas",
      "state": "Distrito Capital",
      "postalCode": "1060",
      "country": "Venezuela"
    }
  },
  "economicData": {
    "occupation": "Ingeniero",
    "economicActivity": "Servicios profesionales",
    "monthlyIncome": 5000.00,
    "sourceOfFunds": "Salario",
    "companyName": "Tech Solutions C.A.",
    "companyPosition": "Gerente de Proyectos",
    "hasForeignAccounts": false,
    "foreignAccountDetails": null
  },
  "documentsData": {
    "requiredDocuments": [
      {
        "documentType": "IDENTIFICATION",
        "fileName": "cedula_juan_perez.pdf",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "uploadedBy": "user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-15T14:00:00Z"
      },
      {
        "documentType": "PROOF_OF_ADDRESS",
        "fileName": "recibo_servicios.pdf",
        "uploadedAt": "2024-01-15T10:35:00Z",
        "uploadedBy": "user-uuid",
        "verified": false,
        "verifiedBy": null,
        "verifiedAt": null
      }
    ],
    "additionalDocuments": []
  }
}
```

#### 3.2.2 Intermediario (INTERMEDIARY)

```json
{
  "generalData": {
    "personType": "NATURAL|LEGAL",
    "firstName": "María",
    "lastName": "Rodríguez",
    "businessName": "Corredora de Seguros MR C.A.",
    "intermediaryType": "BROKER|AGENT|PRODUCER",
    "licenseNumber": "CDS-2024-0123",
    "licenseExpiryDate": "2025-12-31",
    "yearsOfExperience": 10,
    "specialization": ["AUTO", "VIDA", "SALUD"]
  },
  "identificationData": {
    "documentType": "J",
    "documentNumber": "123456789",
    "taxId": "J123456789",
    "registrationNumber": "CDS-2024-0123",
    "registrationDate": "2014-01-15",
    "registrationCountry": "VE",
    "sudeasegRegistration": "INT-2014-5678"
  },
  "contactData": {
    "email": "contacto@correduramr.com",
    "phoneNumber": "+58-212-9876543",
    "alternatePhone": "+58-414-9876543",
    "website": "www.correduramr.com",
    "address": {
      "street": "Av. Francisco de Miranda",
      "buildingNumber": "456",
      "floor": "Piso 8",
      "urbanization": "Los Palos Grandes",
      "city": "Caracas",
      "state": "Distrito Capital",
      "postalCode": "1060",
      "country": "Venezuela"
    }
  },
  "economicData": {
    "annualProduction": 1500000.00,
    "numberOfPolicies": 450,
    "averagePolicyValue": 3333.33,
    "mainInsuranceLines": ["AUTO", "VIDA"],
    "bankAccount": {
      "bankName": "Banco Nacional",
      "accountNumber": "0123-4567-89-0123456789",
      "accountType": "CORRIENTE"
    }
  },
  "documentsData": {
    "requiredDocuments": [
      {
        "documentType": "BROKER_LICENSE",
        "fileName": "licencia_correduria.pdf",
        "uploadedAt": "2024-01-10T09:00:00Z",
        "uploadedBy": "user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-10T15:00:00Z"
      },
      {
        "documentType": "COMPANY_REGISTRY",
        "fileName": "registro_mercantil.pdf",
        "uploadedAt": "2024-01-10T09:05:00Z",
        "uploadedBy": "user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-10T15:00:00Z"
      },
      {
        "documentType": "SUDEASEG_REGISTRATION",
        "fileName": "registro_sudeaseg.pdf",
        "uploadedAt": "2024-01-10T09:10:00Z",
        "uploadedBy": "user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-10T15:00:00Z"
      }
    ]
  }
}
```

#### 3.2.3 Empleado (EMPLOYEE)

```json
{
  "generalData": {
    "personType": "NATURAL",
    "firstName": "Carlos",
    "middleName": "Alberto",
    "lastName": "Gómez",
    "secondLastName": "Martínez",
    "dateOfBirth": "1990-07-20",
    "nationality": "Venezolana",
    "gender": "M",
    "maritalStatus": "MARRIED",
    "department": "Operaciones",
    "position": "Analista Senior",
    "employeeId": "EMP-2024-0456",
    "hireDate": "2018-05-01",
    "employmentType": "FULL_TIME|PART_TIME|CONTRACT",
    "reportingTo": "user-uuid-manager",
    "isPep": false
  },
  "identificationData": {
    "documentType": "V",
    "documentNumber": "23456789",
    "taxId": "V234567890",
    "socialSecurityNumber": "123456789012"
  },
  "contactData": {
    "email": "carlos.gomez@aseguradora.com",
    "personalEmail": "carlos.gomez@personal.com",
    "phoneNumber": "+58-414-2345678",
    "emergencyContactName": "Ana Gómez",
    "emergencyContactPhone": "+58-414-8765432",
    "emergencyContactRelationship": "Esposa",
    "address": {
      "street": "Calle Los Pinos",
      "buildingNumber": "789",
      "apartmentNumber": "12-B",
      "urbanization": "La Florida",
      "city": "Caracas",
      "state": "Miranda",
      "postalCode": "1050",
      "country": "Venezuela"
    }
  },
  "economicData": {
    "monthlySalary": 8000.00,
    "bankAccount": {
      "bankName": "Banco Provincial",
      "accountNumber": "0108-1234-56-1234567890",
      "accountType": "AHORRO"
    },
    "benefits": ["Seguro de Vida", "HCM", "Bono Anual"]
  },
  "documentsData": {
    "requiredDocuments": [
      {
        "documentType": "IDENTIFICATION",
        "fileName": "cedula_carlos_gomez.pdf",
        "uploadedAt": "2018-04-20T10:00:00Z",
        "uploadedBy": "hr-user-uuid",
        "verified": true,
        "verifiedBy": "hr-manager-uuid",
        "verifiedAt": "2018-04-20T14:00:00Z"
      },
      {
        "documentType": "EMPLOYMENT_CONTRACT",
        "fileName": "contrato_trabajo.pdf",
        "uploadedAt": "2018-04-20T10:10:00Z",
        "uploadedBy": "hr-user-uuid",
        "verified": true,
        "verifiedBy": "hr-manager-uuid",
        "verifiedAt": "2018-04-20T14:00:00Z"
      },
      {
        "documentType": "BACKGROUND_CHECK",
        "fileName": "antecedentes_penales.pdf",
        "uploadedAt": "2018-04-20T10:15:00Z",
        "uploadedBy": "hr-user-uuid",
        "verified": true,
        "verifiedBy": "hr-manager-uuid",
        "verifiedAt": "2018-04-20T14:00:00Z"
      }
    ]
  }
}
```

#### 3.2.4 Proveedor (SUPPLIER)

```json
{
  "generalData": {
    "personType": "LEGAL",
    "businessName": "Tecnología y Servicios C.A.",
    "commercialName": "TechServ",
    "supplierType": "GOODS|SERVICES|BOTH",
    "supplierCategory": "Technology",
    "yearsInBusiness": 8
  },
  "identificationData": {
    "documentType": "J",
    "documentNumber": "987654321",
    "taxId": "J987654321",
    "registrationNumber": "REG-2016-1234",
    "registrationDate": "2016-03-10",
    "registrationCountry": "VE"
  },
  "contactData": {
    "email": "ventas@techserv.com",
    "phoneNumber": "+58-212-5551234",
    "alternatePhone": "+58-414-5551234",
    "website": "www.techserv.com",
    "contactPerson": {
      "name": "Luis Fernández",
      "position": "Gerente de Ventas",
      "email": "luis.fernandez@techserv.com",
      "phone": "+58-414-5559999"
    },
    "address": {
      "street": "Av. Libertador",
      "buildingNumber": "321",
      "floor": "Piso 5",
      "urbanization": "Chacao",
      "city": "Caracas",
      "state": "Miranda",
      "postalCode": "1060",
      "country": "Venezuela"
    }
  },
  "economicData": {
    "annualRevenue": 5000000.00,
    "paymentTerms": "30 días",
    "creditLimit": 100000.00,
    "bankAccount": {
      "bankName": "Banco Mercantil",
      "accountNumber": "0105-7890-12-3456789012",
      "accountType": "CORRIENTE"
    }
  },
  "documentsData": {
    "requiredDocuments": [
      {
        "documentType": "COMPANY_REGISTRY",
        "fileName": "registro_mercantil_techserv.pdf",
        "uploadedAt": "2024-02-01T11:00:00Z",
        "uploadedBy": "admin-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-02-01T16:00:00Z"
      },
      {
        "documentType": "TAX_CERTIFICATE",
        "fileName": "rif_techserv.pdf",
        "uploadedAt": "2024-02-01T11:05:00Z",
        "uploadedBy": "admin-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-02-01T16:00:00Z"
      },
      {
        "documentType": "BANK_CERTIFICATION",
        "fileName": "certificacion_bancaria.pdf",
        "uploadedAt": "2024-02-01T11:10:00Z",
        "uploadedBy": "admin-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-02-01T16:00:00Z"
      }
    ]
  }
}
```

#### 3.2.5 Reasegurador (REINSURER)

```json
{
  "generalData": {
    "personType": "LEGAL",
    "businessName": "Global Reinsurance Corporation",
    "commercialName": "GRC",
    "country": "United States",
    "reinsuranceType": "TREATY|FACULTATIVE|BOTH",
    "rating": {
      "agency": "AM Best",
      "rating": "A++",
      "outlook": "Stable",
      "ratingDate": "2023-12-01"
    },
    "yearsInBusiness": 45
  },
  "identificationData": {
    "documentType": "G",
    "documentNumber": "US-123456789",
    "taxId": "US-TAX-987654321",
    "registrationNumber": "NAIC-12345",
    "registrationDate": "1979-06-15",
    "registrationCountry": "US"
  },
  "contactData": {
    "email": "latinamerica@grc.com",
    "phoneNumber": "+1-212-555-9876",
    "alternatePhone": "+1-212-555-9877",
    "website": "www.grc.com",
    "localRepresentative": {
      "name": "Pedro Ramírez",
      "company": "GRC Venezuela",
      "email": "pedro.ramirez@grc.com",
      "phone": "+58-212-9991234"
    },
    "address": {
      "street": "Wall Street",
      "buildingNumber": "100",
      "floor": "50th Floor",
      "city": "New York",
      "state": "NY",
      "postalCode": "10005",
      "country": "United States"
    }
  },
  "economicData": {
    "capital": 5000000000.00,
    "surplus": 3000000000.00,
    "annualPremium": 15000000000.00,
    "marketShare": 8.5,
    "creditRating": "A++",
    "acceptedLines": ["PROPERTY", "CASUALTY", "LIFE", "HEALTH"]
  },
  "documentsData": {
    "requiredDocuments": [
      {
        "documentType": "COMPANY_REGISTRY",
        "fileName": "certificate_of_incorporation.pdf",
        "uploadedAt": "2024-01-05T08:00:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-05T17:00:00Z"
      },
      {
        "documentType": "FINANCIAL_STATEMENTS",
        "fileName": "audited_financials_2023.pdf",
        "uploadedAt": "2024-01-05T08:10:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-05T17:00:00Z"
      },
      {
        "documentType": "RATING_REPORT",
        "fileName": "am_best_rating_2023.pdf",
        "uploadedAt": "2024-01-05T08:15:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-05T17:00:00Z"
      },
      {
        "documentType": "REINSURANCE_LICENSE",
        "fileName": "reinsurance_license_naic.pdf",
        "uploadedAt": "2024-01-05T08:20:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-05T17:00:00Z"
      }
    ]
  }
}
```

#### 3.2.6 Retrocesionario (RETROCESSIONAIRE)

```json
{
  "generalData": {
    "personType": "LEGAL",
    "businessName": "International Retrocession Ltd.",
    "commercialName": "IRL",
    "country": "Bermuda",
    "retrocessionType": "PROPORTIONAL|NON_PROPORTIONAL|BOTH",
    "rating": {
      "agency": "S&P",
      "rating": "AA",
      "outlook": "Positive",
      "ratingDate": "2023-11-15"
    },
    "yearsInBusiness": 30
  },
  "identificationData": {
    "documentType": "G",
    "documentNumber": "BM-987654321",
    "taxId": "BM-TAX-123456789",
    "registrationNumber": "BMA-56789",
    "registrationDate": "1994-09-20",
    "registrationCountry": "BM"
  },
  "contactData": {
    "email": "info@irl.bm",
    "phoneNumber": "+1-441-555-7890",
    "website": "www.irl.bm",
    "localRepresentative": {
      "name": "María González",
      "company": "IRL Representative Venezuela",
      "email": "maria.gonzalez@irl.bm",
      "phone": "+58-212-7771234"
    },
    "address": {
      "street": "Front Street",
      "buildingNumber": "25",
      "floor": "3rd Floor",
      "city": "Hamilton",
      "postalCode": "HM 11",
      "country": "Bermuda"
    }
  },
  "economicData": {
    "capital": 2000000000.00,
    "surplus": 1500000000.00,
    "annualPremium": 5000000000.00,
    "creditRating": "AA",
    "acceptedLines": ["CATASTROPHE", "PROPERTY", "CASUALTY"]
  },
  "documentsData": {
    "requiredDocuments": [
      {
        "documentType": "COMPANY_REGISTRY",
        "fileName": "bma_certificate.pdf",
        "uploadedAt": "2024-01-08T09:00:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-08T16:00:00Z"
      },
      {
        "documentType": "FINANCIAL_STATEMENTS",
        "fileName": "audited_financials_2023.pdf",
        "uploadedAt": "2024-01-08T09:10:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-08T16:00:00Z"
      },
      {
        "documentType": "RATING_REPORT",
        "fileName": "sp_rating_2023.pdf",
        "uploadedAt": "2024-01-08T09:15:00Z",
        "uploadedBy": "technical-user-uuid",
        "verified": true,
        "verifiedBy": "compliance-officer-uuid",
        "verifiedAt": "2024-01-08T16:00:00Z"
      }
    ]
  }
}
```

---

## 4. Entidades Java

### 4.1 Dossier.java (Entidad Principal)

```java
package com.siar.dossier.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dossiers", indexes = {
    @Index(name = "idx_dossier_number", columnList = "dossierNumber"),
    @Index(name = "idx_dossier_type", columnList = "dossierType"),
    @Index(name = "idx_dossier_status", columnList = "status"),
    @Index(name = "idx_created_by", columnList = "createdBy"),
    @Index(name = "idx_is_deleted", columnList = "isDeleted")
})
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dossier {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String dossierNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DossierType dossierType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DossierStatus status;

    @Column(nullable = false)
    private Double completenessPercentage;

    // Auditoría de creación
    @Column(nullable = false)
    private UUID createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Auditoría de última actualización
    @Column(nullable = false)
    private UUID updatedBy;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Auditoría de aprobación
    @Column
    private UUID approvedBy;

    @Column
    private LocalDateTime approvedAt;

    // Soft delete
    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column
    private UUID deletedBy;

    @Column
    private LocalDateTime deletedAt;

    // Datos estructurados en JSON
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private Object generalData;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private Object contactData;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private Object identificationData;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private Object economicData;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private Object documentsData;

    // Métodos de utilidad
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = DossierStatus.INCOMPLETE;
        }
        if (completenessPercentage == null) {
            completenessPercentage = 0.0;
        }
        if (isDeleted == null) {
            isDeleted = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isEditable() {
        return status == DossierStatus.INCOMPLETE || 
               status == DossierStatus.REQUIRES_INFO || 
               status == DossierStatus.OBSERVED;
    }

    public boolean requiresApprovalForChanges() {
        return status == DossierStatus.APPROVED;
    }

    public boolean canBeDeleted() {
        return status != DossierStatus.APPROVED && !isDeleted;
    }
}
```

### 4.2 DossierType.java (Enum)

```java
package com.siar.dossier.model;

public enum DossierType {
    CLIENT("Cliente", "CL"),
    INTERMEDIARY("Intermediario", "IN"),
    EMPLOYEE("Empleado", "EM"),
    SUPPLIER("Proveedor", "PR"),
    REINSURER("Reasegurador", "RE"),
    RETROCESSIONAIRE("Retrocesionario", "RT");

    private final String displayName;
    private final String prefix;

    DossierType(String displayName, String prefix) {
        this.displayName = displayName;
        this.prefix = prefix;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getPrefix() {
        return prefix;
    }
}
```

### 4.3 DossierStatus.java (Enum)

```java
package com.siar.dossier.model;

public enum DossierStatus {
    INCOMPLETE("Incompleto", true),
    UNDER_REVIEW("En Revisión", false),
    REQUIRES_INFO("Requiere Información", true),
    OBSERVED("Observado", true),
    APPROVED("Aprobado", false);

    private final String displayName;
    private final boolean editable;

    DossierStatus(String displayName, boolean editable) {
        this.displayName = displayName;
        this.editable = editable;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isEditable() {
        return editable;
    }

    public boolean canTransitionTo(DossierStatus newStatus) {
        switch (this) {
            case INCOMPLETE:
                return newStatus == UNDER_REVIEW;
            case UNDER_REVIEW:
                return newStatus == REQUIRES_INFO || 
                       newStatus == OBSERVED || 
                       newStatus == APPROVED;
            case REQUIRES_INFO:
            case OBSERVED:
                return newStatus == UNDER_REVIEW;
            case APPROVED:
                return false; // No puede cambiar de estado una vez aprobado
            default:
                return false;
        }
    }
}
```

### 4.4 DossierChangeHistory.java (Historial de Cambios)

```java
package com.siar.dossier.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dossier_change_history", indexes = {
    @Index(name = "idx_dch_dossier_id", columnList = "dossierId"),
    @Index(name = "idx_dch_changed_by", columnList = "changedBy"),
    @Index(name = "idx_dch_changed_at", columnList = "changedAt"),
    @Index(name = "idx_dch_change_type", columnList = "changeType")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierChangeHistory {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID dossierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChangeType changeType;

    @Column(nullable = false)
    private UUID changedBy;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @Column(length = 100)
    private String fieldName;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String changeReason;

    @Column
    private UUID approvedBy;

    @Column
    private LocalDateTime approvedAt;

    // Información de auditoría técnica
    @Column(length = 45)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }
}
```

### 4.5 ChangeType.java (Enum)

```java
package com.siar.dossier.model;

public enum ChangeType {
    CREATED("Creación"),
    UPDATED("Actualización"),
    STATUS_CHANGED("Cambio de Estado"),
    APPROVED("Aprobación"),
    REJECTED("Rechazo"),
    OBSERVED("Observación"),
    DELETED("Eliminación"),
    RESTORED("Restauración"),
    DOCUMENT_ADDED("Documento Agregado"),
    DOCUMENT_REMOVED("Documento Removido"),
    DOCUMENT_VERIFIED("Documento Verificado");

    private final String displayName;

    ChangeType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

### 4.6 DossierApprovalRequest.java (Solicitudes de Modificación)

```java
package com.siar.dossier.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dossier_approval_requests", indexes = {
    @Index(name = "idx_dar_dossier_id", columnList = "dossierId"),
    @Index(name = "idx_dar_requested_by", columnList = "requestedBy"),
    @Index(name = "idx_dar_status", columnList = "status"),
    @Index(name = "idx_dar_requested_at", columnList = "requestedAt")
})
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierApprovalRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID dossierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApprovalRequestType requestType;

    @Column(nullable = false)
    private UUID requestedBy;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private Object proposedChanges;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApprovalRequestStatus status = ApprovalRequestStatus.PENDING;

    @Column
    private UUID reviewedBy;

    @Column
    private LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String reviewComments;

    @Column
    private UUID alertId;

    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ApprovalRequestStatus.PENDING;
        }
    }
}
```

### 4.7 ApprovalRequestType.java (Enum)

```java
package com.siar.dossier.model;

public enum ApprovalRequestType {
    UPDATE_APPROVED_DOSSIER("Modificar Expediente Aprobado"),
    DELETE_DOSSIER("Eliminar Expediente"),
    CHANGE_STATUS("Cambiar Estado"),
    UPDATE_CRITICAL_FIELD("Modificar Campo Crítico");

    private final String displayName;

    ApprovalRequestType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

### 4.8 ApprovalRequestStatus.java (Enum)

```java
package com.siar.dossier.model;

public enum ApprovalRequestStatus {
    PENDING("Pendiente"),
    APPROVED("Aprobada"),
    REJECTED("Rechazada"),
    CANCELLED("Cancelada");

    private final String displayName;

    ApprovalRequestStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

---

## 5. DTOs y Comunicación JSON

### 5.1 CreateDossierRequest.java

```java
package com.siar.dossier.dto;

import com.siar.dossier.model.DossierType;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class CreateDossierRequest {

    @NotNull(message = "El tipo de expediente es obligatorio")
    private DossierType dossierType;

    private Object generalData;
    private Object contactData;
    private Object identificationData;
    private Object economicData;
    private Object documentsData;
}
```

### 5.2 UpdateDossierRequest.java

```java
package com.siar.dossier.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class UpdateDossierRequest {

    private Object generalData;
    private Object contactData;
    private Object identificationData;
    private Object economicData;
    private Object documentsData;

    @NotBlank(message = "La razón del cambio es obligatoria")
    private String changeReason;
}
```

### 5.3 DossierResponse.java

```java
package com.siar.dossier.dto;

import com.siar.dossier.model.DossierStatus;
import com.siar.dossier.model.DossierType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DossierResponse {

    private UUID id;
    private String dossierNumber;
    private DossierType dossierType;
    private DossierStatus status;
    private Double completenessPercentage;

    private UUID createdBy;
    private String createdByUsername;
    private LocalDateTime createdAt;

    private UUID updatedBy;
    private String updatedByUsername;
    private LocalDateTime updatedAt;

    private UUID approvedBy;
    private String approvedByUsername;
    private LocalDateTime approvedAt;

    private Boolean isDeleted;

    private Object generalData;
    private Object contactData;
    private Object identificationData;
    private Object economicData;
    private Object documentsData;

    // Indicadores útiles para el frontend
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean canApprove;
    private Boolean requiresApproval;
}
```

### 5.4 DossierListItemResponse.java

```java
package com.siar.dossier.dto;

import com.siar.dossier.model.DossierStatus;
import com.siar.dossier.model.DossierType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DossierListItemResponse {

    private UUID id;
    private String dossierNumber;
    private DossierType dossierType;
    private DossierStatus status;
    private Double completenessPercentage;

    // Información básica de la entidad (para mostrar en listas)
    private String entityName;
    private String identificationNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    private Boolean isDeleted;
}
```

### 5.5 ApproveDossierRequest.java

```java
package com.siar.dossier.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ApproveDossierRequest {

    @NotBlank(message = "Los comentarios de aprobación son obligatorios")
    private String approvalComments;
}
```

### 5.6 ObserveDossierRequest.java

```java
package com.siar.dossier.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ObserveDossierRequest {

    @NotBlank(message = "Las observaciones son obligatorias")
    private String observations;

    private Boolean requiresInfoFromCreator;
}
```

### 5.7 RequestDossierModificationRequest.java

```java
package com.siar.dossier.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class RequestDossierModificationRequest {

    @NotNull(message = "Los cambios propuestos son obligatorios")
    private Object proposedChanges;

    @NotBlank(message = "La justificación es obligatoria")
    private String justification;
}
```

### 5.8 ReviewApprovalRequestRequest.java

```java
package com.siar.dossier.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class ReviewApprovalRequestRequest {

    @NotNull(message = "La decisión (aprobar/rechazar) es obligatoria")
    private Boolean approved;

    @NotBlank(message = "Los comentarios de revisión son obligatorios")
    private String reviewComments;
}
```

### 5.9 DossierChangeHistoryResponse.java

```java
package com.siar.dossier.dto;

import com.siar.dossier.model.ChangeType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DossierChangeHistoryResponse {

    private UUID id;
    private UUID dossierId;
    private ChangeType changeType;

    private UUID changedBy;
    private String changedByUsername;
    private LocalDateTime changedAt;

    private String fieldName;
    private String oldValue;
    private String newValue;
    private String changeReason;

    private UUID approvedBy;
    private String approvedByUsername;
    private LocalDateTime approvedAt;

    private String ipAddress;
}
```

### 5.10 DossierSearchCriteria.java

```java
package com.siar.dossier.dto;

import com.siar.dossier.model.DossierStatus;
import com.siar.dossier.model.DossierType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class DossierSearchCriteria {

    private List<DossierType> dossierTypes;
    private List<DossierStatus> statuses;
    private String searchTerm; // Búsqueda en nombre, identificación, dossierNumber
    private UUID createdBy;
    private UUID approvedBy;
    private LocalDateTime createdFrom;
    private LocalDateTime createdTo;
    private LocalDateTime approvedFrom;
    private LocalDateTime approvedTo;
    private Double completenessMin;
    private Double completenessMax;
    private Boolean includeDeleted;

    // Paginación
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}
```

---

## 6. Lógica de Negocio

### 6.1 DossierService.java (Servicio Principal)

```java
package com.siar.dossier.service;

import com.siar.dossier.dto.*;
import com.siar.dossier.model.*;
import com.siar.dossier.repository.DossierRepository;
import com.siar.security.service.SecurityContext;
import com.siar.audit.service.AuditService;
import com.siar.alert.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DossierService {

    private final DossierRepository dossierRepository;
    private final DossierValidationService validationService;
    private final DossierCompletenessService completenessService;
    private final DossierHistoryService historyService;
    private final SecurityContext securityContext;
    private final AuditService auditService;
    private final AlertService alertService;
    private final DossierNumberGenerator numberGenerator;

    @Transactional
    public DossierResponse createDossier(CreateDossierRequest request) {
        log.info("Creating new dossier of type: {}", request.getDossierType());

        // Validar permisos
        validationService.validateCreatePermissions(
            securityContext.getCurrentUser(),
            request.getDossierType()
        );

        // Crear expediente
        Dossier dossier = Dossier.builder()
            .dossierNumber(numberGenerator.generate(request.getDossierType()))
            .dossierType(request.getDossierType())
            .status(DossierStatus.INCOMPLETE)
            .createdBy(securityContext.getCurrentUserId())
            .createdAt(LocalDateTime.now())
            .updatedBy(securityContext.getCurrentUserId())
            .updatedAt(LocalDateTime.now())
            .isDeleted(false)
            .generalData(request.getGeneralData())
            .contactData(request.getContactData())
            .identificationData(request.getIdentificationData())
            .economicData(request.getEconomicData())
            .documentsData(request.getDocumentsData())
            .build();

        // Calcular completitud
        double completeness = completenessService.calculateCompleteness(dossier);
        dossier.setCompletenessPercentage(completeness);

        // Guardar
        dossier = dossierRepository.save(dossier);

        // Registrar en historial
        historyService.recordCreation(dossier, securityContext.getCurrentUserId());

        // Auditoría
        auditService.logEvent(
            "DOSSIER_CREATED",
            securityContext.getCurrentUserId(),
            "Dossier",
            dossier.getId(),
            String.format("Dossier %s creado", dossier.getDossierNumber())
        );

        // Alerta si es PEP
        if (isPep(dossier)) {
            alertService.createAlert(
                "PEP_DETECTED",
                "Nuevo expediente identificado como PEP",
                dossier.getId(),
                "COMPLIANCE_OFFICER",
                "HIGH"
            );
        }

        log.info("Dossier created successfully: {}", dossier.getDossierNumber());
        return toDossierResponse(dossier);
    }

    @Transactional
    public DossierResponse updateDossier(UUID dossierId, UpdateDossierRequest request) {
        log.info("Updating dossier: {}", dossierId);

        Dossier dossier = dossierRepository.findById(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Dossier no encontrado"));

        // Validar que no esté eliminado
        if (dossier.getIsDeleted()) {
            throw new BusinessException("No se puede modificar un expediente eliminado");
        }

        // Si está aprobado, requiere solicitud de modificación
        if (dossier.requiresApprovalForChanges()) {
            throw new BusinessException(
                "Este expediente requiere aprobación para modificaciones. " +
                "Use el endpoint de solicitud de modificación."
            );
        }

        // Validar permisos
        validationService.validateUpdatePermissions(
            securityContext.getCurrentUser(),
            dossier
        );

        // Validar que sea editable
        if (!dossier.isEditable()) {
            throw new BusinessException(
                String.format("Expediente en estado %s no puede editarse", dossier.getStatus())
            );
        }

        // Registrar cambios en historial ANTES de modificar
        historyService.recordUpdate(
            dossier,
            request,
            securityContext.getCurrentUserId()
        );

        // Aplicar cambios
        if (request.getGeneralData() != null) {
            dossier.setGeneralData(request.getGeneralData());
        }
        if (request.getContactData() != null) {
            dossier.setContactData(request.getContactData());
        }
        if (request.getIdentificationData() != null) {
            dossier.setIdentificationData(request.getIdentificationData());
        }
        if (request.getEconomicData() != null) {
            dossier.setEconomicData(request.getEconomicData());
        }
        if (request.getDocumentsData() != null) {
            dossier.setDocumentsData(request.getDocumentsData());
        }

        dossier.setUpdatedBy(securityContext.getCurrentUserId());
        dossier.setUpdatedAt(LocalDateTime.now());

        // Recalcular completitud
        double completeness = completenessService.calculateCompleteness(dossier);
        dossier.setCompletenessPercentage(completeness);

        // Guardar
        dossier = dossierRepository.save(dossier);

        // Auditoría
        auditService.logEvent(
            "DOSSIER_UPDATED",
            securityContext.getCurrentUserId(),
            "Dossier",
            dossier.getId(),
            String.format("Dossier %s actualizado: %s", 
                dossier.getDossierNumber(), 
                request.getChangeReason())
        );

        // Alerta al Oficial de Cumplimiento
        alertService.createAlert(
            "DOSSIER_MODIFIED",
            String.format("Expediente %s modificado: %s", 
                dossier.getDossierNumber(), 
                request.getChangeReason()),
            dossier.getId(),
            "COMPLIANCE_OFFICER",
            "MEDIUM"
        );

        log.info("Dossier updated successfully: {}", dossier.getDossierNumber());
        return toDossierResponse(dossier);
    }

    @Transactional(readOnly = true)
    public DossierResponse getDossier(UUID dossierId) {
        Dossier dossier = dossierRepository.findById(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Dossier no encontrado"));

        // Validar permisos de lectura
        validationService.validateReadPermissions(
            securityContext.getCurrentUser(),
            dossier
        );

        // Auditoría
        auditService.logEvent(
            "DOSSIER_VIEWED",
            securityContext.getCurrentUserId(),
            "Dossier",
            dossier.getId(),
            String.format("Dossier %s consultado", dossier.getDossierNumber())
        );

        return toDossierResponse(dossier);
    }

    @Transactional
    public void deleteDossier(UUID dossierId, String reason) {
        log.info("Deleting dossier: {}", dossierId);

        Dossier dossier = dossierRepository.findById(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Dossier no encontrado"));

        // Validar que puede eliminarse
        if (!dossier.canBeDeleted()) {
            throw new BusinessException(
                "Expedientes aprobados no pueden eliminarse. " +
                "Solo pueden marcarse como inactivos."
            );
        }

        // Validar permisos
        validationService.validateDeletePermissions(
            securityContext.getCurrentUser(),
            dossier
        );

        // Soft delete
        dossier.setIsDeleted(true);
        dossier.setDeletedBy(securityContext.getCurrentUserId());
        dossier.setDeletedAt(LocalDateTime.now());

        dossierRepository.save(dossier);

        // Registrar en historial
        historyService.recordDeletion(dossier, securityContext.getCurrentUserId(), reason);

        // Auditoría
        auditService.logEvent(
            "DOSSIER_DELETED",
            securityContext.getCurrentUserId(),
            "Dossier",
            dossier.getId(),
            String.format("Dossier %s eliminado: %s", dossier.getDossierNumber(), reason)
        );

        // Alerta
        alertService.createAlert(
            "DOSSIER_DELETED",
            String.format("Expediente %s eliminado: %s", dossier.getDossierNumber(), reason),
            dossier.getId(),
            "COMPLIANCE_OFFICER",
            "HIGH"
        );

        log.info("Dossier deleted successfully: {}", dossier.getDossierNumber());
    }

    private boolean isPep(Dossier dossier) {
        // Implementación simplificada
        Object generalData = dossier.getGeneralData();
        // Lógica para verificar si es PEP
        return false; // Placeholder
    }

    private DossierResponse toDossierResponse(Dossier dossier) {
        // Implementación de mapeo
        return DossierResponse.builder()
            .id(dossier.getId())
            .dossierNumber(dossier.getDossierNumber())
            .dossierType(dossier.getDossierType())
            .status(dossier.getStatus())
            .completenessPercentage(dossier.getCompletenessPercentage())
            .createdBy(dossier.getCreatedBy())
            .createdAt(dossier.getCreatedAt())
            .updatedBy(dossier.getUpdatedBy())
            .updatedAt(dossier.getUpdatedAt())
            .approvedBy(dossier.getApprovedBy())
            .approvedAt(dossier.getApprovedAt())
            .isDeleted(dossier.getIsDeleted())
            .generalData(dossier.getGeneralData())
            .contactData(dossier.getContactData())
            .identificationData(dossier.getIdentificationData())
            .economicData(dossier.getEconomicData())
            .documentsData(dossier.getDocumentsData())
            .canEdit(dossier.isEditable())
            .canDelete(dossier.canBeDeleted())
            .requiresApproval(dossier.requiresApprovalForChanges())
            .build();
    }
}
```

---

## 7. APIs REST

### 7.1 DossierController.java

```java
package com.siar.dossier.controller;

import com.siar.dossier.dto.*;
import com.siar.dossier.service.DossierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dossiers")
@RequiredArgsConstructor
public class DossierController {

    private final DossierService dossierService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('dossier:create')")
    public ResponseEntity<DossierResponse> createDossier(
            @Valid @RequestBody CreateDossierRequest request) {
        DossierResponse response = dossierService.createDossier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('dossier:read')")
    public ResponseEntity<DossierResponse> getDossier(@PathVariable UUID id) {
        DossierResponse response = dossierService.getDossier(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('dossier:read')")
    public ResponseEntity<Page<DossierListItemResponse>> searchDossiers(
            @Valid @ModelAttribute DossierSearchCriteria criteria) {
        Page<DossierListItemResponse> response = dossierService.searchDossiers(criteria);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('dossier:update')")
    public ResponseEntity<DossierResponse> updateDossier(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDossierRequest request) {
        DossierResponse response = dossierService.updateDossier(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('dossier:delete')")
    public ResponseEntity<Void> deleteDossier(
            @PathVariable UUID id,
            @RequestParam String reason) {
        dossierService.deleteDossier(id, reason);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyAuthority('dossier:read')")
    public ResponseEntity<Page<DossierChangeHistoryResponse>> getDossierHistory(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DossierChangeHistoryResponse> response = 
            dossierService.getDossierHistory(id, page, size);
        return ResponseEntity.ok(response);
    }
}
```

### 7.2 DossierApprovalController.java

```java
package com.siar.dossier.controller;

import com.siar.dossier.dto.*;
import com.siar.dossier.service.DossierApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dossiers")
@RequiredArgsConstructor
public class DossierApprovalController {

    private final DossierApprovalService approvalService;

    @PostMapping("/{id}/submit-for-review")
    @PreAuthorize("hasAnyAuthority('dossier:update')")
    public ResponseEntity<DossierResponse> submitForReview(@PathVariable UUID id) {
        DossierResponse response = approvalService.submitForReview(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('dossier:approve')")
    public ResponseEntity<DossierResponse> approveDossier(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveDossierRequest request) {
        DossierResponse response = approvalService.approveDossier(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/observe")
    @PreAuthorize("hasAuthority('dossier:review')")
    public ResponseEntity<DossierResponse> observeDossier(
            @PathVariable UUID id,
            @Valid @RequestBody ObserveDossierRequest request) {
        DossierResponse response = approvalService.observeDossier(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/request-info")
    @PreAuthorize("hasAuthority('dossier:review')")
    public ResponseEntity<DossierResponse> requestAdditionalInfo(
            @PathVariable UUID id,
            @Valid @RequestBody ObserveDossierRequest request) {
        DossierResponse response = approvalService.requestAdditionalInfo(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/request-modification")
    @PreAuthorize("hasAnyAuthority('dossier:update')")
    public ResponseEntity<UUID> requestModification(
            @PathVariable UUID id,
            @Valid @RequestBody RequestDossierModificationRequest request) {
        UUID requestId = approvalService.requestModification(id, request);
        return ResponseEntity.ok(requestId);
    }

    @PostMapping("/approval-requests/{requestId}/review")
    @PreAuthorize("hasAuthority('dossier:approve')")
    public ResponseEntity<Void> reviewApprovalRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody ReviewApprovalRequestRequest request) {
        approvalService.reviewApprovalRequest(requestId, request);
        return ResponseEntity.ok().build();
    }
}
```

---

## 8. Flujo de Aprobación

### 8.1 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE APROBACIÓN DE EXPEDIENTES                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│ ETAPA 1: CREACIÓN Y COMPLETADO                                            │
│ Actor: Responsable del Área (Comercial, Operaciones, RRHH, Admin)        │
└───────────────────────────────────────────────────────────────────────────┘
    │
    ├─> POST /api/v1/dossiers
    │   Body: { dossierType: "CLIENT", generalData: {...}, ... }
    │   Response: { id, dossierNumber: "CL-2024-00123", status: "INCOMPLETE" }
    │
    ├─> Sistema calcula completenessPercentage automáticamente
    │   - Verifica campos obligatorios según tipo de expediente
    │   - Porcentaje = (campos completados / campos obligatorios) * 100
    │
    ├─> Si completenessPercentage < 76%:
    │   └─> Estado permanece: INCOMPLETE
    │       └─> Puede seguir editando: PUT /api/v1/dossiers/{id}
    │
    └─> Si completenessPercentage >= 76%:
        └─> Usuario puede enviar a revisión
            └─> POST /api/v1/dossiers/{id}/submit-for-review
                └─> Estado cambia a: UNDER_REVIEW
                    └─> Genera ALERTA a Área de Cumplimiento
                        └─> Tipo: DOSSIER_SUBMITTED_FOR_REVIEW

┌───────────────────────────────────────────────────────────────────────────┐
│ ETAPA 2: REVISIÓN INICIAL                                                 │
│ Actor: Analista de Cumplimiento                                           │
└───────────────────────────────────────────────────────────────────────────┘
    │
    ├─> GET /api/v1/dossiers/{id}
    │   └─> Revisa información completa
    │
    ├─> Ejecuta evaluación de riesgo (módulo integrado)
    │
    ├─> DECISIÓN A: Solicitar información adicional
    │   └─> POST /api/v1/dossiers/{id}/request-info
    │       Body: { observations: "Falta certificado bancario actualizado" }
    │       └─> Estado cambia a: REQUIRES_INFO
    │           └─> Genera ALERTA al creador del expediente
    │               └─> Expediente regresa a ETAPA 1 (editable)
    │
    ├─> DECISIÓN B: Identificar observaciones
    │   └─> POST /api/v1/dossiers/{id}/observe
    │       Body: { observations: "Dirección no coincide con documento" }
    │       └─> Estado cambia a: OBSERVED
    │           └─> Genera ALERTA al creador del expediente
    │               └─> Expediente regresa a ETAPA 1 (editable)
    │
    └─> DECISIÓN C: Enviar al Oficial de Cumplimiento
        └─> Expediente mantiene estado: UNDER_REVIEW
            └─> Genera ALERTA al COMPLIANCE_OFFICER
                └─> Tipo: DOSSIER_READY_FOR_APPROVAL

┌───────────────────────────────────────────────────────────────────────────┐
│ ETAPA 3: APROBACIÓN FINAL                                                 │
│ Actor: Oficial de Cumplimiento                                            │
└───────────────────────────────────────────────────────────────────────────┘
    │
    ├─> GET /api/v1/dossiers/{id}
    │   └─> Revisa análisis del Área de Cumplimiento
    │   └─> Valida evaluación de riesgo
    │   └─> Confirma controles aplicados
    │
    ├─> DECISIÓN A: Devolver para revisión adicional
    │   └─> POST /api/v1/dossiers/{id}/request-info (o /observe)
    │       └─> Expediente regresa a ETAPA 1 o ETAPA 2
    │
    └─> DECISIÓN B: Aprobar expediente
        └─> POST /api/v1/dossiers/{id}/approve
            Body: { approvalComments: "Expediente aprobado sin observaciones" }
            └─> Estado cambia a: APPROVED
                ├─> approvedBy = UUID del Oficial
                ├─> approvedAt = timestamp actual
                ├─> Genera entrada en dossier_change_history
                │   └─> changeType: APPROVED
                ├─> Genera ALERTA al creador del expediente
                │   └─> Tipo: DOSSIER_APPROVED
                └─> Auditoría registra: DOSSIER_APPROVED

┌───────────────────────────────────────────────────────────────────────────┐
│ ETAPA 4: MODIFICACIÓN POST-APROBACIÓN                                     │
│ Actor: Cualquier usuario autorizado                                       │
└───────────────────────────────────────────────────────────────────────────┘
    │
    ├─> Usuario intenta: PUT /api/v1/dossiers/{id}
    │   └─> Sistema valida: status == APPROVED?
    │       └─> SI: Rechaza con HTTP 400
    │           └─> Mensaje: "Requiere solicitud de modificación"
    │
    └─> Usuario debe usar endpoint específico:
        └─> POST /api/v1/dossiers/{id}/request-modification
            Body: {
              proposedChanges: {
                "contactData.email": "nuevo@email.com"
              },
              justification: "Cliente cambió de correo electrónico"
            }
            │
            ├─> Sistema crea DossierApprovalRequest
            │   └─> status: PENDING
            │
            ├─> Genera ALERTA CRÍTICA al COMPLIANCE_OFFICER
            │   └─> Tipo: MODIFICATION_REQUEST_PENDING
            │   └─> Prioridad: HIGH
            │
            └─> Response: { requestId: "uuid-de-la-solicitud" }

┌───────────────────────────────────────────────────────────────────────────┐
│ ETAPA 5: REVISIÓN DE SOLICITUD DE MODIFICACIÓN                            │
│ Actor: Oficial de Cumplimiento                                            │
└───────────────────────────────────────────────────────────────────────────┘
    │
    ├─> GET /api/v1/dossiers/approval-requests?status=PENDING
    │   └─> Lista todas las solicitudes pendientes
    │
    ├─> GET /api/v1/dossiers/approval-requests/{requestId}
    │   └─> Revisa cambios propuestos y justificación
    │
    ├─> DECISIÓN A: APROBAR modificación
    │   └─> POST /api/v1/dossiers/approval-requests/{requestId}/review
    │       Body: { 
    │         approved: true, 
    │         reviewComments: "Modificación autorizada" 
    │       }
    │       │
    │       ├─> Sistema actualiza DossierApprovalRequest
    │       │   └─> status: APPROVED
    │       │   └─> reviewedBy: UUID del Oficial
    │       │   └─> reviewedAt: timestamp actual
    │       │
    │       ├─> Sistema aplica cambios al expediente
    │       │   └─> Actualiza campos según proposedChanges
    │       │   └─> Expediente mantiene status: APPROVED
    │       │
    │       ├─> Genera entrada en dossier_change_history
    │       │   └─> changeType: UPDATED
    │       │   └─> approvedBy: UUID del Oficial
    │       │
    │       ├─> Genera ALERTA al solicitante
    │       │   └─> Tipo: MODIFICATION_APPROVED
    │       │
    │       └─> Auditoría registra: DOSSIER_MODIFICATION_APPROVED
    │
    └─> DECISIÓN B: RECHAZAR modificación
        └─> POST /api/v1/dossiers/approval-requests/{requestId}/review
            Body: { 
              approved: false, 
              reviewComments: "Justificación insuficiente" 
            }
            │
            ├─> Sistema actualiza DossierApprovalRequest
            │   └─> status: REJECTED
            │
            ├─> Expediente NO cambia (permanece sin modificar)
            │
            ├─> Genera ALERTA al solicitante
            │   └─> Tipo: MODIFICATION_REJECTED
            │
            └─> Auditoría registra: DOSSIER_MODIFICATION_REJECTED
```

### 8.2 Reglas de Segregación de Funciones

| Rol | Puede Crear | Puede Modificar | Puede Aprobar | Puede Eliminar |
|-----|-------------|-----------------|---------------|----------------|
| **Oficial de Cumplimiento** | ✓ | ✓ | ✓ | ✓ (con justificación) |
| **Área de Cumplimiento** | ✓ | ✓ | ✗ | ✗ |
| **Comercial** | ✓ (Cliente, Intermediario) | ✓ (propios) | ✗ | ✗ |
| **Operaciones** | ✓ (Intermediario, Reasegurador, Proveedor) | ✓ (propios) | ✗ | ✗ |
| **Recursos Humanos** | ✓ (Empleado) | ✓ (propios) | ✗ | ✗ |
| **Administración** | ✓ (Proveedor) | ✓ (propios) | ✗ | ✗ |
| **Técnico** | ✓ (Reasegurador, Retrocesionario) | ✓ (propios) | ✗ | ✗ |
| **Auditoría** | ✗ | ✗ | ✗ | ✗ |
| **Contraloría** | ✗ | ✗ | ✗ | ✗ |
| **Auditores Externos** | ✗ | ✗ | ✗ | ✗ |
| **Inspectores SUDEASEG** | ✗ | ✗ | ✗ | ✗ |

**Regla Crítica**: Un usuario NUNCA puede aprobar un expediente que él mismo creó. El sistema valida esto automáticamente.

---

## 9. Historial de Cambios

### 9.1 DossierHistoryService.java

```java
package com.siar.dossier.service;

import com.siar.dossier.model.*;
import com.siar.dossier.repository.DossierChangeHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DossierHistoryService {

    private final DossierChangeHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public void recordCreation(Dossier dossier, UUID userId) {
        DossierChangeHistory history = DossierChangeHistory.builder()
            .dossierId(dossier.getId())
            .changeType(ChangeType.CREATED)
            .changedBy(userId)
            .changedAt(LocalDateTime.now())
            .newValue(String.format("Expediente %s creado", dossier.getDossierNumber()))
            .changeReason("Creación inicial")
            .build();

        historyRepository.save(history);
    }

    public void recordUpdate(Dossier dossier, Object updateRequest, UUID userId) {
        // Comparar valores antiguos vs nuevos
        Map<String, Object> changes = detectChanges(dossier, updateRequest);

        for (Map.Entry<String, Object> entry : changes.entrySet()) {
            DossierChangeHistory history = DossierChangeHistory.builder()
                .dossierId(dossier.getId())
                .changeType(ChangeType.UPDATED)
                .changedBy(userId)
                .changedAt(LocalDateTime.now())
                .fieldName(entry.getKey())
                .oldValue(String.valueOf(entry.getValue()))
                .newValue(String.valueOf(getNewValue(updateRequest, entry.getKey())))
                .build();

            historyRepository.save(history);
        }
    }

    public void recordStatusChange(
            Dossier dossier, 
            DossierStatus oldStatus, 
            DossierStatus newStatus, 
            UUID userId,
            String reason) {
        DossierChangeHistory history = DossierChangeHistory.builder()
            .dossierId(dossier.getId())
            .changeType(ChangeType.STATUS_CHANGED)
            .changedBy(userId)
            .changedAt(LocalDateTime.now())
            .fieldName("status")
            .oldValue(oldStatus.name())
            .newValue(newStatus.name())
            .changeReason(reason)
            .build();

        historyRepository.save(history);
    }

    public void recordApproval(Dossier dossier, UUID approvedBy, String comments) {
        DossierChangeHistory history = DossierChangeHistory.builder()
            .dossierId(dossier.getId())
            .changeType(ChangeType.APPROVED)
            .changedBy(approvedBy)
            .changedAt(LocalDateTime.now())
            .approvedBy(approvedBy)
            .approvedAt(LocalDateTime.now())
            .changeReason(comments)
            .build();

        historyRepository.save(history);
    }

    public void recordDeletion(Dossier dossier, UUID deletedBy, String reason) {
        DossierChangeHistory history = DossierChangeHistory.builder()
            .dossierId(dossier.getId())
            .changeType(ChangeType.DELETED)
            .changedBy(deletedBy)
            .changedAt(LocalDateTime.now())
            .changeReason(reason)
            .build();

        historyRepository.save(history);
    }

    private Map<String, Object> detectChanges(Dossier dossier, Object updateRequest) {
        // Implementación de detección de cambios
        // Compara valores actuales vs propuestos
        return Map.of(); // Placeholder
    }

    private Object getNewValue(Object updateRequest, String fieldName) {
        // Implementación de extracción de valor
        return null; // Placeholder
    }
}
```

### 9.2 Características del Historial

1. **Inmutabilidad**: Una vez registrado, un cambio NO puede modificarse ni eliminarse
2. **Completitud**: Se registran TODOS los cambios, sin excepción
3. **Trazabilidad**: Cada cambio incluye usuario, fecha, hora, IP y user agent
4. **Aprobaciones**: Los cambios a expedientes aprobados incluyen quién aprobó la modificación
5. **Evidencia**: El historial completo está disponible para inspecciones regulatorias

---

## 10. Integración con Otros Módulos

### 10.1 Integración con Módulo de Riesgo

```java
@Service
@RequiredArgsConstructor
public class DossierRiskIntegrationService {

    private final RiskAssessmentService riskService;
    private final AlertService alertService;

    public void triggerRiskAssessment(Dossier dossier) {
        // Cuando se aprueba un expediente, se dispara evaluación de riesgo
        RiskAssessmentRequest request = buildRiskRequest(dossier);
        RiskAssessmentResult result = riskService.assessRisk(request);

        // Si el riesgo es ALTO, genera alerta
        if (result.getRiskLevel() == RiskLevel.HIGH) {
            alertService.createAlert(
                "HIGH_RISK_DOSSIER",
                String.format("Expediente %s calificado como ALTO RIESGO", 
                    dossier.getDossierNumber()),
                dossier.getId(),
                "COMPLIANCE_OFFICER",
                "CRITICAL"
            );
        }
    }
}
```

### 10.2 Integración con Módulo PEP

```java
@Service
@RequiredArgsConstructor
public class DossierPepIntegrationService {

    private final PepManagementService pepService;
    private final AlertService alertService;

    public void checkPepStatus(Dossier dossier) {
        // Verifica si la entidad es PEP
        boolean isPep = pepService.isPep(extractIdentification(dossier));

        if (isPep) {
            // Genera alerta inmediata
            alertService.createAlert(
                "PEP_DETECTED",
                String.format("Expediente %s identificado como PEP", 
                    dossier.getDossierNumber()),
                dossier.getId(),
                "COMPLIANCE_OFFICER",
                "HIGH"
            );

            // Dispara debida diligencia reforzada automáticamente
            // ...
        }
    }
}
```

### 10.3 Integración con Módulo de Screening

```java
@Service
@RequiredArgsConstructor
public class DossierScreeningIntegrationService {

    private final ScreeningService screeningService;
    private final AlertService alertService;

    public void performScreening(Dossier dossier) {
        // Ejecuta screening contra listas restrictivas
        ScreeningRequest request = buildScreeningRequest(dossier);
        ScreeningResult result = screeningService.screen(request);

        // Si hay coincidencias (hits), genera alerta CRÍTICA
        if (result.hasHits()) {
            alertService.createAlert(
                "SCREENING_HIT",
                String.format("Expediente %s con coincidencias en screening: %s", 
                    dossier.getDossierNumber(),
                    result.getHitSummary()),
                dossier.getId(),
                "COMPLIANCE_OFFICER",
                "CRITICAL"
            );
        }
    }
}
```

---

## 11. Validaciones y Reglas de Negocio

### 11.1 Campos Obligatorios por Tipo de Expediente

| Tipo | Campos Obligatorios (Mínimo para 76%) |
|------|----------------------------------------|
| **Cliente** | - personType<br>- firstName/businessName<br>- lastName (si es persona natural)<br>- documentType<br>- documentNumber<br>- email<br>- phoneNumber<br>- address.city<br>- address.state<br>- address.country |
| **Intermediario** | - personType<br>- businessName<br>- intermediaryType<br>- licenseNumber<br>- documentType<br>- documentNumber<br>- taxId<br>- email<br>- phoneNumber |
| **Empleado** | - firstName<br>- lastName<br>- dateOfBirth<br>- documentType<br>- documentNumber<br>- email<br>- phoneNumber<br>- department<br>- position<br>- employeeId<br>- hireDate |
| **Proveedor** | - businessName<br>- supplierType<br>- documentType<br>- documentNumber<br>- taxId<br>- email<br>- phoneNumber<br>- address.city |
| **Reasegurador** | - businessName<br>- country<br>- documentType<br>- documentNumber<br>- email<br>- rating.agency<br>- rating.rating |
| **Retrocesionario** | - businessName<br>- country<br>- documentType<br>- documentNumber<br>- email<br>- rating.agency<br>- rating.rating |

### 11.2 Validaciones de Negocio

```java
@Service
public class DossierValidationService {

    public void validateBusinessRules(Dossier dossier) {
        validateDocumentNumber(dossier);
        validateEmail(dossier);
        validateDateOfBirth(dossier);
        validateLicenseExpiry(dossier);
        validateRatingAgency(dossier);
    }

    private void validateDocumentNumber(Dossier dossier) {
        // Validar formato según tipo de documento (V, E, J, G, P)
        // ...
    }

    private void validateEmail(Dossier dossier) {
        // Validar formato de email
        // Verificar que no exista otro expediente con el mismo email (según tipo)
        // ...
    }

    private void validateDateOfBirth(Dossier dossier) {
        // Para personas naturales, validar edad mínima (18 años)
        // ...
    }

    private void validateLicenseExpiry(Dossier dossier) {
        // Para intermediarios, validar que la licencia no esté vencida
        // ...
    }

    private void validateRatingAgency(Dossier dossier) {
        // Para reaseguradores/retrocesionarios, validar rating mínimo aceptable
        // ...
    }
}
```

---

## 12. Evidencia para Inspecciones Regulatorias

### 12.1 Reportes Disponibles

El módulo proporciona los siguientes reportes pre-configurados para SUDEASEG:

| Reporte | Descripción | Endpoint |
|---------|-------------|----------|
| **Expedientes por Estado** | Cantidad de expedientes en cada estado | GET /api/v1/reports/dossiers/by-status |
| **Expedientes por Tipo** | Cantidad de expedientes de cada tipo | GET /api/v1/reports/dossiers/by-type |
| **Expedientes Aprobados en Período** | Expedientes aprobados en rango de fechas | GET /api/v1/reports/dossiers/approved?from=&to= |
| **Expedientes con Observaciones** | Expedientes observados y razones | GET /api/v1/reports/dossiers/observed |
| **Historial Completo de Expediente** | Todos los cambios de un expediente | GET /api/v1/dossiers/{id}/history/full |
| **Segregación de Funciones** | Evidencia de que creador ≠ aprobador | GET /api/v1/reports/dossiers/segregation |
| **Expedientes PEP** | Listado de expedientes con condición PEP | GET /api/v1/reports/dossiers/pep |
| **Expedientes Alto Riesgo** | Expedientes calificados como alto riesgo | GET /api/v1/reports/dossiers/high-risk |

### 12.2 Información de Auditoría

Cada expediente incluye metadatos completos de auditoría:

```json
{
  "auditInfo": {
    "createdBy": "uuid",
    "createdByUsername": "jperez",
    "createdByRole": "COMMERCIAL",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdFromIp": "192.168.1.100",
    "updatedBy": "uuid",
    "updatedByUsername": "mrodriguez",
    "updatedByRole": "COMPLIANCE_AREA",
    "updatedAt": "2024-01-16T14:20:00Z",
    "approvedBy": "uuid",
    "approvedByUsername": "cgonzalez",
    "approvedByRole": "COMPLIANCE_OFFICER",
    "approvedAt": "2024-01-17T09:00:00Z",
    "totalChanges": 8,
    "lastChangeType": "APPROVED"
  }
}
```

### 12.3 Exportación para Inspecciones

```java
@RestController
@RequestMapping("/api/v1/reports")
public class DossierReportController {

    @GetMapping("/dossiers/export")
    @PreAuthorize("hasAnyAuthority('dossier:export', 'reports:generate')")
    public ResponseEntity<byte[]> exportDossiersForInspection(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "PDF") ReportFormat format) {

        // Genera reporte completo para SUDEASEG
        // Incluye:
        // - Lista de todos los expedientes
        // - Historial de cambios completo
        // - Evidencia de segregación de funciones
        // - Alertas generadas y su resolución
        // - Expedientes PEP y alto riesgo

        byte[] reportContent = reportService.generateInspectionReport(from, to, format);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(format == ReportFormat.PDF ? 
            MediaType.APPLICATION_PDF : 
            MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
            .filename(String.format("SIAR_Expedientes_Inspeccion_%s.%s", 
                LocalDate.now(), 
                format.name().toLowerCase()))
            .build());

        return ResponseEntity.ok()
            .headers(headers)
            .body(reportContent);
    }
}
```

---

## 13. Testing y Calidad

### 13.1 Test Cases Críticos

| Test ID | Descripción | Expected Result |
|---------|-------------|-----------------|
| TC-DOSS-001 | Crear expediente con datos mínimos | 201 Created, completenessPercentage calculada |
| TC-DOSS-002 | Crear expediente sin permisos | 403 Forbidden |
| TC-DOSS-003 | Actualizar expediente INCOMPLETE | 200 OK, cambios aplicados |
| TC-DOSS-004 | Actualizar expediente APPROVED sin solicitud | 400 Bad Request |
| TC-DOSS-005 | Enviar a revisión con < 76% completo | 400 Bad Request |
| TC-DOSS-006 | Enviar a revisión con >= 76% completo | 200 OK, status = UNDER_REVIEW |
| TC-DOSS-007 | Aprobar expediente (Oficial Cumplimiento) | 200 OK, status = APPROVED |
| TC-DOSS-008 | Aprobar expediente (usuario sin permiso) | 403 Forbidden |
| TC-DOSS-009 | Aprobar expediente que creó el mismo usuario | 400 Bad Request (segregación) |
| TC-DOSS-010 | Solicitar modificación a expediente aprobado | 200 OK, solicitud creada |
| TC-DOSS-011 | Aprobar solicitud de modificación | 200 OK, cambios aplicados |
| TC-DOSS-012 | Rechazar solicitud de modificación | 200 OK, sin cambios al expediente |
| TC-DOSS-013 | Eliminar expediente INCOMPLETE | 204 No Content, isDeleted = true |
| TC-DOSS-014 | Eliminar expediente APPROVED | 400 Bad Request |
| TC-DOSS-015 | Consultar historial completo | 200 OK, lista de todos los cambios |

### 13.2 Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
public class DossierIntegrationTest {

    @Test
    @WithMockUser(authorities = {"dossier:create"})
    public void testCreateAndApproveDossierCompleteFlow() {
        // 1. Crear expediente
        CreateDossierRequest createRequest = new CreateDossierRequest();
        // ... configurar request

        DossierResponse created = dossierService.createDossier(createRequest);
        assertThat(created.getStatus()).isEqualTo(DossierStatus.INCOMPLETE);

        // 2. Actualizar para completar
        UpdateDossierRequest updateRequest = new UpdateDossierRequest();
        // ... agregar datos faltantes

        DossierResponse updated = dossierService.updateDossier(created.getId(), updateRequest);
        assertThat(updated.getCompletenessPercentage()).isGreaterThanOrEqualTo(76.0);

        // 3. Enviar a revisión
        DossierResponse submitted = approvalService.submitForReview(created.getId());
        assertThat(submitted.getStatus()).isEqualTo(DossierStatus.UNDER_REVIEW);

        // 4. Aprobar
        ApproveDossierRequest approveRequest = new ApproveDossierRequest();
        approveRequest.setApprovalComments("Aprobado");

        DossierResponse approved = approvalService.approveDossier(created.getId(), approveRequest);
        assertThat(approved.getStatus()).isEqualTo(DossierStatus.APPROVED);
        assertThat(approved.getApprovedBy()).isNotNull();
        assertThat(approved.getApprovedAt()).isNotNull();

        // 5. Verificar historial
        List<DossierChangeHistory> history = historyService.getHistory(created.getId());
        assertThat(history).hasSize(4); // Created, Updated, Status Changed, Approved
    }
}
```

---

## Conclusión

El **Módulo de Gestión de Expedientes** es el núcleo del SIAR, proporcionando:

- **Control completo** de información de todas las entidades
- **Trazabilidad absoluta** con historial inmutable
- **Flujo de aprobación robusto** con segregación de funciones
- **Integración perfecta** con módulos de Riesgo, PEP, Screening y Debida Diligencia
- **Evidencia completa** para inspecciones regulatorias de SUDEASEG

El diseño modular, parametrizable y orientado a JSON permite escalabilidad y mantenibilidad a largo plazo, mientras que los controles estrictos garantizan cumplimiento normativo y protección ante auditorías regulatorias.
