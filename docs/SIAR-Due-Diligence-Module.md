# SIAR - Módulo de Debida Diligencia y Gestión Documental

## 1. Visión General del Módulo

El módulo de Debida Diligencia y Gestión Documental es un componente crítico del SIAR que garantiza el cumplimiento normativo mediante la gestión rigurosa de documentación respaldatoria para todos los sujetos obligados.

### 1.1 Objetivos

- Gestionar documentación completa y actualizada de todos los sujetos obligados
- Implementar control de versiones y trazabilidad documental
- Asegurar aprobación exclusiva por el Oficial de Cumplimiento
- Generar alertas automáticas sobre vencimientos y estados documentales
- Alinear la carga documental con el nivel de riesgo del expediente
- Proporcionar evidencia auditable para inspecciones regulatorias

### 1.2 Principios Fundamentales

1. **Obligatoriedad**: Toda relación comercial requiere debida diligencia aprobada
2. **Segregación de funciones**: Carga vs. Revisión vs. Aprobación
3. **Inmutabilidad controlada**: Los documentos aprobados no se eliminan, se versionan
4. **Trazabilidad total**: Cada acción documental queda registrada
5. **Alineación con riesgo**: La profundidad documental depende del nivel de riesgo

---

## 2. Arquitectura Lógica del Módulo

### 2.1 Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│           MÓDULO DE DEBIDA DILIGENCIA                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Gestión de      │  │  Motor de        │               │
│  │  Documentos      │  │  Alertas         │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
│           │                     │                          │
│  ┌────────▼─────────────────────▼─────────┐               │
│  │  Motor de Workflow de Aprobación       │               │
│  └────────┬───────────────────────────────┘               │
│           │                                                │
│  ┌────────▼─────────┐  ┌──────────────────┐               │
│  │  Versionamiento  │  │  Integración con │               │
│  │  de Documentos   │  │  Expediente/Risk │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Trabajo

```
┌───────────────┐
│   PENDIENTE   │ ← Estado inicial al crear expediente
└───────┬───────┘
        │ Área operativa carga documentos
        ▼
┌───────────────┐
│  EN REVISIÓN  │ ← Analista de Cumplimiento revisa
└───────┬───────┘
        │
        ├──→ ¿Completo? ──NO──→ ┌─────────────────────────┐
        │                        │ REQUIERE INFORMACIÓN    │
        │                        │     ADICIONAL           │
        │                        └──────────┬──────────────┘
        │                                   │ Se solicita info
        │                                   ▼
        │                        ┌─────────────────────────┐
        │                        │ Área operativa completa │
        │                        └──────────┬──────────────┘
        │                                   │
        │ ◄─────────────────────────────────┘
        │
        │ SÍ
        ▼
┌───────────────┐
│  APROBADA     │ ← Solo Oficial de Cumplimiento
└───────────────┘

        o
        
┌───────────────┐
│  OBSERVADA    │ ← Oficial rechaza o solicita cambios
└───────┬───────┘
        │
        └──→ Vuelve a Pendiente o Requiere Información
```

---

## 3. Modelo de Datos JSON

### 3.1 Estructura de Debida Diligencia

```json
{
  "dueDiligence": {
    "id": "DD-00001234",
    "dossierId": "EXP-00001234",
    "dossierType": "CLIENTE",
    "status": "APROBADA",
    "riskLevel": "ALTO",
    "diligenceLevel": "REFORZADA",
    "completenessPercentage": 100,
    "requiredDocuments": [
      {
        "documentTypeId": "DOC-001",
        "documentTypeName": "Documento de Identidad",
        "category": "IDENTIFICACION",
        "isMandatory": true,
        "expirationRequired": true,
        "isPresent": true,
        "currentVersion": 2
      },
      {
        "documentTypeId": "DOC-002",
        "documentTypeName": "Comprobante de Domicilio",
        "category": "DOMICILIO",
        "isMandatory": true,
        "expirationRequired": true,
        "isPresent": true,
        "currentVersion": 1
      },
      {
        "documentTypeId": "DOC-010",
        "documentTypeName": "Declaración Jurada de Origen de Fondos",
        "category": "FINANCIERA",
        "isMandatory": false,
        "requiredForRiskLevel": ["MEDIO", "ALTO"],
        "expirationRequired": false,
        "isPresent": true,
        "currentVersion": 1
      }
    ],
    "documents": [
      {
        "id": "DOC-EXP-00001234-001",
        "documentTypeId": "DOC-001",
        "fileName": "cedula_juan_perez_v2.pdf",
        "fileSize": 2048576,
        "mimeType": "application/pdf",
        "fileHash": "sha256:a3b5c7d9...",
        "storageLocation": "/storage/documents/2025/01/cedula_juan_perez_v2.pdf",
        "version": 2,
        "isCurrentVersion": true,
        "uploadDate": "2025-01-15T10:30:00Z",
        "uploadedBy": "USR-OPS-001",
        "uploadedByName": "María González",
        "expirationDate": "2030-05-20",
        "lastModifiedDate": "2025-01-15T10:30:00Z",
        "lastModifiedBy": "USR-OPS-001",
        "approvalStatus": "APROBADO",
        "approvedBy": "USR-OFCOM-001",
        "approvedByName": "Carlos Rodríguez - Oficial de Cumplimiento",
        "approvalDate": "2025-01-16T14:20:00Z",
        "approvalNotes": "Documento vigente y legible",
        "replacesDocumentId": "DOC-EXP-00001234-001-V1",
        "metadata": {
          "issueDate": "2020-05-20",
          "issuer": "SAIME",
          "documentNumber": "V-12345678"
        }
      }
    ],
    "workflow": {
      "currentStatus": "APROBADA",
      "submittedDate": "2025-01-15T11:00:00Z",
      "submittedBy": "USR-OPS-001",
      "reviewStartDate": "2025-01-15T15:00:00Z",
      "reviewedBy": "USR-ANAL-001",
      "reviewedByName": "Ana Martínez - Analista de Cumplimiento",
      "approvalDate": "2025-01-16T14:30:00Z",
      "approvedBy": "USR-OFCOM-001",
      "approvedByName": "Carlos Rodríguez - Oficial de Cumplimiento",
      "history": [
        {
          "status": "PENDIENTE",
          "date": "2025-01-15T09:00:00Z",
          "userId": "SYSTEM",
          "notes": "Expediente creado, esperando carga documental"
        },
        {
          "status": "EN_REVISION",
          "date": "2025-01-15T15:00:00Z",
          "userId": "USR-ANAL-001",
          "notes": "Iniciada revisión documental"
        },
        {
          "status": "REQUIERE_INFORMACION",
          "date": "2025-01-15T16:30:00Z",
          "userId": "USR-ANAL-001",
          "notes": "Se requiere versión actualizada de cédula"
        },
        {
          "status": "EN_REVISION",
          "date": "2025-01-16T10:30:00Z",
          "userId": "USR-ANAL-001",
          "notes": "Documento actualizado recibido, reanudando revisión"
        },
        {
          "status": "APROBADA",
          "date": "2025-01-16T14:30:00Z",
          "userId": "USR-OFCOM-001",
          "notes": "Documentación completa y conforme"
        }
      ]
    },
    "additionalInformationRequests": [
      {
        "id": "REQ-00001",
        "requestDate": "2025-01-15T16:30:00Z",
        "requestedBy": "USR-ANAL-001",
        "requestedByName": "Ana Martínez",
        "description": "La cédula presentada está vencida. Se requiere versión actualizada.",
        "documentTypeIds": ["DOC-001"],
        "dueDate": "2025-01-20",
        "status": "COMPLETADA",
        "responseDate": "2025-01-16T10:30:00Z",
        "respondedBy": "USR-OPS-001",
        "responseNotes": "Cédula actualizada cargada"
      }
    ],
    "alerts": [
      {
        "id": "ALR-DD-00001",
        "type": "DOCUMENTO_VENCIDO",
        "severity": "ALTA",
        "documentId": "DOC-EXP-00001234-001-V1",
        "message": "Documento de identidad vencido",
        "generatedDate": "2025-01-15T00:00:00Z",
        "status": "RESUELTA",
        "resolvedDate": "2025-01-15T10:30:00Z",
        "resolvedBy": "USR-OPS-001"
      },
      {
        "id": "ALR-DD-00002",
        "type": "CAMBIO_DOCUMENTAL",
        "severity": "MEDIA",
        "documentId": "DOC-EXP-00001234-001",
        "message": "Nueva versión de documento cargada, requiere aprobación",
        "generatedDate": "2025-01-15T10:30:00Z",
        "notifiedTo": ["USR-OFCOM-001"],
        "status": "RESUELTA",
        "resolvedDate": "2025-01-16T14:20:00Z"
      }
    ],
    "auditTrail": [
      {
        "timestamp": "2025-01-15T09:00:00Z",
        "userId": "SYSTEM",
        "action": "CREATE_DUE_DILIGENCE",
        "details": "Debida diligencia inicializada para expediente EXP-00001234",
        "ipAddress": "10.0.0.1"
      },
      {
        "timestamp": "2025-01-15T10:30:00Z",
        "userId": "USR-OPS-001",
        "action": "UPLOAD_DOCUMENT",
        "details": "Documento DOC-001 cargado (versión 2)",
        "ipAddress": "10.0.0.45"
      },
      {
        "timestamp": "2025-01-16T14:20:00Z",
        "userId": "USR-OFCOM-001",
        "action": "APPROVE_DOCUMENT",
        "details": "Documento DOC-001 aprobado",
        "ipAddress": "10.0.0.10"
      },
      {
        "timestamp": "2025-01-16T14:30:00Z",
        "userId": "USR-OFCOM-001",
        "action": "APPROVE_DUE_DILIGENCE",
        "details": "Debida diligencia aprobada completamente",
        "ipAddress": "10.0.0.10"
      }
    ],
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-01-16T14:30:00Z"
  }
}
```

### 3.2 Catálogo de Tipos de Documentos (Parametrizable)

```json
{
  "documentTypes": [
    {
      "id": "DOC-001",
      "code": "CI",
      "name": "Documento de Identidad",
      "description": "Cédula de identidad, pasaporte o documento equivalente",
      "category": "IDENTIFICACION",
      "applicableTo": ["CLIENTE", "EMPLEADO", "INTERMEDIARIO"],
      "isMandatory": true,
      "requiresExpiration": true,
      "defaultExpirationMonths": null,
      "acceptedFormats": ["PDF", "JPG", "PNG"],
      "maxFileSizeMB": 5,
      "requiredForRiskLevels": ["BAJO", "MEDIO", "ALTO"],
      "validationRules": {
        "minFileSize": 10240,
        "requiresOCR": false,
        "metadata": ["issueDate", "expirationDate", "documentNumber"]
      }
    },
    {
      "id": "DOC-002",
      "code": "CD",
      "name": "Comprobante de Domicilio",
      "description": "Recibo de servicio público o documento que acredite domicilio",
      "category": "DOMICILIO",
      "applicableTo": ["CLIENTE", "EMPLEADO", "INTERMEDIARIO", "PROVEEDOR"],
      "isMandatory": true,
      "requiresExpiration": true,
      "defaultExpirationMonths": 3,
      "acceptedFormats": ["PDF", "JPG", "PNG"],
      "maxFileSizeMB": 5,
      "requiredForRiskLevels": ["BAJO", "MEDIO", "ALTO"],
      "validationRules": {
        "maxAgeMonths": 3
      }
    },
    {
      "id": "DOC-003",
      "code": "RIF",
      "name": "Registro de Información Fiscal (RIF)",
      "description": "Documento de inscripción en el registro fiscal",
      "category": "FISCAL",
      "applicableTo": ["CLIENTE", "INTERMEDIARIO", "PROVEEDOR", "REASEGURADOR"],
      "isMandatory": true,
      "requiresExpiration": false,
      "acceptedFormats": ["PDF"],
      "maxFileSizeMB": 2,
      "requiredForRiskLevels": ["BAJO", "MEDIO", "ALTO"]
    },
    {
      "id": "DOC-010",
      "code": "DOF",
      "name": "Declaración Jurada de Origen de Fondos",
      "description": "Declaración sobre el origen lícito de los recursos",
      "category": "FINANCIERA",
      "applicableTo": ["CLIENTE"],
      "isMandatory": false,
      "requiresExpiration": true,
      "defaultExpirationMonths": 12,
      "acceptedFormats": ["PDF"],
      "maxFileSizeMB": 5,
      "requiredForRiskLevels": ["MEDIO", "ALTO"],
      "validationRules": {
        "requiresSignature": true
      }
    },
    {
      "id": "DOC-015",
      "code": "EF",
      "name": "Estados Financieros Auditados",
      "description": "Estados financieros auditados de los últimos 2 años",
      "category": "FINANCIERA",
      "applicableTo": ["CLIENTE", "REASEGURADOR", "RETROCESIONARIO"],
      "isMandatory": false,
      "requiresExpiration": true,
      "defaultExpirationMonths": 12,
      "acceptedFormats": ["PDF"],
      "maxFileSizeMB": 20,
      "requiredForRiskLevels": ["ALTO"]
    },
    {
      "id": "DOC-020",
      "code": "CR",
      "name": "Certificado de Registro Mercantil",
      "description": "Documento de constitución y registro de la empresa",
      "category": "CORPORATIVA",
      "applicableTo": ["CLIENTE", "INTERMEDIARIO", "PROVEEDOR", "REASEGURADOR"],
      "isMandatory": true,
      "requiresExpiration": true,
      "defaultExpirationMonths": 12,
      "acceptedFormats": ["PDF"],
      "maxFileSizeMB": 10,
      "requiredForRiskLevels": ["BAJO", "MEDIO", "ALTO"]
    },
    {
      "id": "DOC-025",
      "code": "AP",
      "name": "Acta de Asamblea con Poderes",
      "description": "Acta que autoriza representación legal",
      "category": "CORPORATIVA",
      "applicableTo": ["CLIENTE", "INTERMEDIARIO", "PROVEEDOR"],
      "isMandatory": false,
      "requiresExpiration": false,
      "acceptedFormats": ["PDF"],
      "maxFileSizeMB": 10,
      "requiredForRiskLevels": ["MEDIO", "ALTO"]
    }
  ]
}
```

### 3.3 Configuración de Alertas

```json
{
  "alertConfiguration": {
    "documentExpirationAlerts": {
      "enabled": true,
      "thresholds": [
        {
          "type": "DOCUMENTO_PROXIMO_VENCER",
          "daysBeforeExpiration": 30,
          "severity": "MEDIA",
          "notifyRoles": ["OPERACIONES", "ANALISTA_CUMPLIMIENTO"]
        },
        {
          "type": "DOCUMENTO_PROXIMO_VENCER",
          "daysBeforeExpiration": 7,
          "severity": "ALTA",
          "notifyRoles": ["OPERACIONES", "ANALISTA_CUMPLIMIENTO", "OFICIAL_CUMPLIMIENTO"]
        },
        {
          "type": "DOCUMENTO_VENCIDO",
          "daysAfterExpiration": 0,
          "severity": "CRITICA",
          "notifyRoles": ["OPERACIONES", "ANALISTA_CUMPLIMIENTO", "OFICIAL_CUMPLIMIENTO"],
          "escalate": true
        }
      ]
    },
    "dueDiligenceAlerts": {
      "incompleteDocumentation": {
        "enabled": true,
        "severity": "ALTA",
        "notifyRoles": ["OPERACIONES", "ANALISTA_CUMPLIMIENTO"]
      },
      "additionalInformationRequest": {
        "enabled": true,
        "severity": "ALTA",
        "notifyRoles": ["OPERACIONES"]
      },
      "documentChange": {
        "enabled": true,
        "severity": "MEDIA",
        "notifyRoles": ["OFICIAL_CUMPLIMIENTO"]
      },
      "documentRejection": {
        "enabled": true,
        "severity": "ALTA",
        "notifyRoles": ["OPERACIONES", "ANALISTA_CUMPLIMIENTO"]
      }
    }
  }
}
```

---

## 4. Implementación Backend (Java)

### 4.1 Entidad DueDiligence

```java
@Entity
@Table(name = "due_diligences")
public class DueDiligence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String dueDiligenceId;
    
    @ManyToOne
    @JoinColumn(name = "dossier_id", nullable = false)
    private Dossier dossier;
    
    @Enumerated(EnumType.STRING)
    private DueDiligenceStatus status;
    
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;
    
    @Enumerated(EnumType.STRING)
    private DiligenceLevel diligenceLevel;
    
    @Column(nullable = false)
    private BigDecimal completenessPercentage;
    
    @OneToMany(mappedBy = "dueDiligence", cascade = CascadeType.ALL)
    private List<DueDiligenceDocument> documents;
    
    @OneToMany(mappedBy = "dueDiligence", cascade = CascadeType.ALL)
    private List<InformationRequest> informationRequests;
    
    @Column(columnDefinition = "jsonb")
    private String requiredDocumentsJson;
    
    @Column(columnDefinition = "jsonb")
    private String workflowJson;
    
    private LocalDateTime submittedDate;
    private Long submittedBy;
    
    private LocalDateTime reviewStartDate;
    private Long reviewedBy;
    
    private LocalDateTime approvalDate;
    private Long approvedBy;
    
    @Column(columnDefinition = "jsonb")
    private String auditTrailJson;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 4.2 Entidad DueDiligenceDocument

```java
@Entity
@Table(name = "due_diligence_documents")
public class DueDiligenceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String documentId;
    
    @ManyToOne
    @JoinColumn(name = "due_diligence_id", nullable = false)
    private DueDiligence dueDiligence;
    
    @ManyToOne
    @JoinColumn(name = "document_type_id", nullable = false)
    private DocumentType documentType;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(nullable = false)
    private String mimeType;
    
    @Column(nullable = false)
    private String fileHash;
    
    @Column(nullable = false)
    private String storageLocation;
    
    @Column(nullable = false)
    private Integer version;
    
    @Column(nullable = false)
    private Boolean isCurrentVersion;
    
    private LocalDate expirationDate;
    
    @Column(nullable = false)
    private LocalDateTime uploadDate;
    
    @Column(nullable = false)
    private Long uploadedBy;
    
    private LocalDateTime lastModifiedDate;
    private Long lastModifiedBy;
    
    @Enumerated(EnumType.STRING)
    private DocumentApprovalStatus approvalStatus;
    
    private Long approvedBy;
    private LocalDateTime approvalDate;
    
    @Column(columnDefinition = "text")
    private String approvalNotes;
    
    private Long replacesDocumentId;
    
    @Column(columnDefinition = "jsonb")
    private String metadataJson;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 4.3 Servicio DueDiligenceService

```java
@Service
@Transactional
public class DueDiligenceService {
    
    @Autowired
    private DueDiligenceRepository dueDiligenceRepository;
    
    @Autowired
    private DueDiligenceDocumentRepository documentRepository;
    
    @Autowired
    private DocumentTypeRepository documentTypeRepository;
    
    @Autowired
    private AlertService alertService;
    
    @Autowired
    private AuditService auditService;
    
    @Autowired
    private StorageService storageService;
    
    /**
     * Inicializa la debida diligencia para un expediente
     */
    public DueDiligence initializeDueDiligence(Long dossierId) {
        Dossier dossier = dossierRepository.findById(dossierId)
            .orElseThrow(() -> new NotFoundException("Dossier not found"));
        
        DueDiligence dd = new DueDiligence();
        dd.setDueDiligenceId(generateDueDiligenceId());
        dd.setDossier(dossier);
        dd.setStatus(DueDiligenceStatus.PENDIENTE);
        dd.setRiskLevel(dossier.getRiskAssessment().getRiskLevel());
        dd.setDiligenceLevel(calculateDiligenceLevel(dossier.getRiskAssessment().getRiskLevel()));
        dd.setCompletenessPercentage(BigDecimal.ZERO);
        
        // Cargar documentos requeridos según el tipo de expediente y nivel de riesgo
        List<DocumentType> requiredDocs = documentTypeRepository
            .findRequiredDocuments(dossier.getDossierType(), dd.getRiskLevel());
        dd.setRequiredDocumentsJson(serializeRequiredDocuments(requiredDocs));
        
        DueDiligence saved = dueDiligenceRepository.save(dd);
        
        auditService.log("CREATE_DUE_DILIGENCE", 
            "Debida diligencia inicializada para " + dossier.getDossierId(),
            null, saved.getId());
        
        return saved;
    }
    
    /**
     * Carga un documento al expediente
     */
    public DueDiligenceDocument uploadDocument(
        Long dueDiligenceId,
        Long documentTypeId,
        MultipartFile file,
        LocalDate expirationDate,
        Map<String, Object> metadata,
        Long userId
    ) throws IOException {
        
        DueDiligence dd = dueDiligenceRepository.findById(dueDiligenceId)
            .orElseThrow(() -> new NotFoundException("Due Diligence not found"));
        
        DocumentType docType = documentTypeRepository.findById(documentTypeId)
            .orElseThrow(() -> new NotFoundException("Document Type not found"));
        
        // Validaciones
        validateDocumentType(file, docType);
        validateExpiration(expirationDate, docType);
        
        // Obtener versión actual
        Integer nextVersion = documentRepository
            .findMaxVersionByDueDiligenceAndDocumentType(dueDiligenceId, documentTypeId)
            .orElse(0) + 1;
        
        // Marcar versión anterior como no actual
        if (nextVersion > 1) {
            documentRepository.markPreviousVersionAsOld(dueDiligenceId, documentTypeId);
        }
        
        // Almacenar archivo
        String storagePath = storageService.store(file, dd.getDueDiligenceId());
        String fileHash = calculateHash(file);
        
        // Crear registro de documento
        DueDiligenceDocument doc = new DueDiligenceDocument();
        doc.setDocumentId(generateDocumentId(dd, docType, nextVersion));
        doc.setDueDiligence(dd);
        doc.setDocumentType(docType);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileSize(file.getSize());
        doc.setMimeType(file.getContentType());
        doc.setFileHash(fileHash);
        doc.setStorageLocation(storagePath);
        doc.setVersion(nextVersion);
        doc.setIsCurrentVersion(true);
        doc.setUploadDate(LocalDateTime.now());
        doc.setUploadedBy(userId);
        doc.setExpirationDate(expirationDate);
        doc.setApprovalStatus(DocumentApprovalStatus.PENDIENTE);
        doc.setMetadataJson(serializeMetadata(metadata));
        
        DueDiligenceDocument saved = documentRepository.save(doc);
        
        // Actualizar porcentaje de completitud
        updateCompletenessPercentage(dd);
        
        // Generar alerta al Oficial de Cumplimiento
        alertService.createAlert(
            AlertType.CAMBIO_DOCUMENTAL,
            AlertSeverity.MEDIA,
            "Nueva versión de documento cargada: " + docType.getName(),
            dd.getId(),
            saved.getId(),
            List.of(RoleType.OFICIAL_CUMPLIMIENTO)
        );
        
        auditService.log("UPLOAD_DOCUMENT",
            String.format("Documento %s cargado (versión %d)", docType.getName(), nextVersion),
            userId, dd.getId());
        
        return saved;
    }
    
    /**
     * Aprobar un documento (solo Oficial de Cumplimiento)
     */
    @RequirePermission(permission = "DD_APPROVE", resource = "DUE_DILIGENCE")
    public void approveDocument(Long documentId, String notes, Long officerId) {
        DueDiligenceDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));
        
        if (!doc.getIsCurrentVersion()) {
            throw new BusinessException("Solo se puede aprobar la versión actual del documento");
        }
        
        doc.setApprovalStatus(DocumentApprovalStatus.APROBADO);
        doc.setApprovedBy(officerId);
        doc.setApprovalDate(LocalDateTime.now());
        doc.setApprovalNotes(notes);
        
        documentRepository.save(doc);
        
        // Actualizar estado general de debida diligencia
        updateDueDiligenceStatus(doc.getDueDiligence());
        
        auditService.log("APPROVE_DOCUMENT",
            "Documento aprobado: " + doc.getDocumentType().getName(),
            officerId, doc.getDueDiligence().getId());
    }
    
    /**
     * Rechazar un documento (solo Oficial de Cumplimiento)
     */
    @RequirePermission(permission = "DD_APPROVE", resource = "DUE_DILIGENCE")
    public void rejectDocument(Long documentId, String reason, Long officerId) {
        DueDiligenceDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));
        
        doc.setApprovalStatus(DocumentApprovalStatus.RECHAZADO);
        doc.setApprovedBy(officerId);
        doc.setApprovalDate(LocalDateTime.now());
        doc.setApprovalNotes(reason);
        
        documentRepository.save(doc);
        
        // Generar alerta al área operativa
        alertService.createAlert(
            AlertType.DOCUMENTO_RECHAZADO,
            AlertSeverity.ALTA,
            "Documento rechazado: " + doc.getDocumentType().getName() + ". Razón: " + reason,
            doc.getDueDiligence().getId(),
            doc.getId(),
            List.of(RoleType.OPERACIONES)
        );
        
        // Cambiar estado de debida diligencia
        doc.getDueDiligence().setStatus(DueDiligenceStatus.OBSERVADA);
        dueDiligenceRepository.save(doc.getDueDiligence());
        
        auditService.log("REJECT_DOCUMENT",
            "Documento rechazado: " + doc.getDocumentType().getName(),
            officerId, doc.getDueDiligence().getId());
    }
    
    /**
     * Solicitar información adicional (Analista o Oficial)
     */
    @RequirePermission(permission = "DD_REVIEW", resource = "DUE_DILIGENCE")
    public InformationRequest requestAdditionalInformation(
        Long dueDiligenceId,
        String description,
        List<Long> documentTypeIds,
        LocalDate dueDate,
        Long requestedBy
    ) {
        DueDiligence dd = dueDiligenceRepository.findById(dueDiligenceId)
            .orElseThrow(() -> new NotFoundException("Due Diligence not found"));
        
        InformationRequest request = new InformationRequest();
        request.setRequestId(generateRequestId());
        request.setDueDiligence(dd);
        request.setDescription(description);
        request.setDocumentTypeIdsJson(serializeDocumentTypeIds(documentTypeIds));
        request.setRequestDate(LocalDateTime.now());
        request.setRequestedBy(requestedBy);
        request.setDueDate(dueDate);
        request.setStatus(RequestStatus.PENDIENTE);
        
        InformationRequest saved = informationRequestRepository.save(request);
        
        // Cambiar estado de debida diligencia
        dd.setStatus(DueDiligenceStatus.REQUIERE_INFORMACION);
        dueDiligenceRepository.save(dd);
        
        // Generar alerta al área operativa
        alertService.createAlert(
            AlertType.SOLICITUD_INFORMACION,
            AlertSeverity.ALTA,
            description,
            dd.getId(),
            saved.getId(),
            List.of(RoleType.OPERACIONES)
        );
        
        auditService.log("REQUEST_INFORMATION",
            "Información adicional solicitada",
            requestedBy, dd.getId());
        
        return saved;
    }
    
    /**
     * Aprobar debida diligencia completa (solo Oficial de Cumplimiento)
     */
    @RequirePermission(permission = "DD_APPROVE", resource = "DUE_DILIGENCE")
    public void approveDueDiligence(Long dueDiligenceId, String notes, Long officerId) {
        DueDiligence dd = dueDiligenceRepository.findById(dueDiligenceId)
            .orElseThrow(() -> new NotFoundException("Due Diligence not found"));
        
        // Validar que todos los documentos obligatorios estén aprobados
        if (!allMandatoryDocumentsApproved(dd)) {
            throw new BusinessException("No se puede aprobar: faltan documentos obligatorios");
        }
        
        dd.setStatus(DueDiligenceStatus.APROBADA);
        dd.setApprovalDate(LocalDateTime.now());
        dd.setApprovedBy(officerId);
        
        updateWorkflowHistory(dd, DueDiligenceStatus.APROBADA, notes, officerId);
        
        dueDiligenceRepository.save(dd);
        
        auditService.log("APPROVE_DUE_DILIGENCE",
            "Debida diligencia aprobada completamente",
            officerId, dd.getId());
    }
    
    /**
     * Verifica documentos próximos a vencer y vencidos (ejecutado por scheduler)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Ejecutar diariamente a las 2 AM
    public void checkExpiringDocuments() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);
        LocalDate in7Days = today.plusDays(7);
        
        // Documentos que vencen en 30 días
        List<DueDiligenceDocument> expiring30 = documentRepository
            .findExpiringBetween(today, in30Days, DocumentApprovalStatus.APROBADO);
        
        for (DueDiligenceDocument doc : expiring30) {
            alertService.createAlert(
                AlertType.DOCUMENTO_PROXIMO_VENCER,
                AlertSeverity.MEDIA,
                String.format("Documento %s vence en %d días", 
                    doc.getDocumentType().getName(),
                    ChronoUnit.DAYS.between(today, doc.getExpirationDate())),
                doc.getDueDiligence().getId(),
                doc.getId(),
                List.of(RoleType.OPERACIONES, RoleType.ANALISTA_CUMPLIMIENTO)
            );
        }
        
        // Documentos que vencen en 7 días
        List<DueDiligenceDocument> expiring7 = documentRepository
            .findExpiringBetween(today, in7Days, DocumentApprovalStatus.APROBADO);
        
        for (DueDiligenceDocument doc : expiring7) {
            alertService.createAlert(
                AlertType.DOCUMENTO_PROXIMO_VENCER,
                AlertSeverity.ALTA,
                String.format("URGENTE: Documento %s vence en %d días", 
                    doc.getDocumentType().getName(),
                    ChronoUnit.DAYS.between(today, doc.getExpirationDate())),
                doc.getDueDiligence().getId(),
                doc.getId(),
                List.of(RoleType.OPERACIONES, RoleType.ANALISTA_CUMPLIMIENTO, RoleType.OFICIAL_CUMPLIMIENTO)
            );
        }
        
        // Documentos vencidos
        List<DueDiligenceDocument> expired = documentRepository
            .findExpiredDocuments(today, DocumentApprovalStatus.APROBADO);
        
        for (DueDiligenceDocument doc : expired) {
            alertService.createAlert(
                AlertType.DOCUMENTO_VENCIDO,
                AlertSeverity.CRITICA,
                String.format("CRÍTICO: Documento %s está vencido desde hace %d días", 
                    doc.getDocumentType().getName(),
                    ChronoUnit.DAYS.between(doc.getExpirationDate(), today)),
                doc.getDueDiligence().getId(),
                doc.getId(),
                List.of(RoleType.OPERACIONES, RoleType.ANALISTA_CUMPLIMIENTO, RoleType.OFICIAL_CUMPLIMIENTO)
            );
            
            // Marcar el expediente como con documentación vencida
            doc.getDueDiligence().setStatus(DueDiligenceStatus.OBSERVADA);
            dueDiligenceRepository.save(doc.getDueDiligence());
        }
    }
    
    private void updateCompletenessPercentage(DueDiligence dd) {
        List<DocumentType> required = deserializeRequiredDocuments(dd.getRequiredDocumentsJson());
        
        long totalRequired = required.stream()
            .filter(dt -> dt.getIsMandatory() || 
                dt.getRequiredForRiskLevels().contains(dd.getRiskLevel()))
            .count();
        
        long presentAndApproved = documentRepository
            .countApprovedDocumentsByType(dd.getId(), 
                required.stream().map(DocumentType::getId).collect(Collectors.toList()));
        
        BigDecimal percentage = totalRequired > 0 
            ? BigDecimal.valueOf(presentAndApproved)
                .divide(BigDecimal.valueOf(totalRequired), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;
        
        dd.setCompletenessPercentage(percentage);
        dueDiligenceRepository.save(dd);
    }
    
    private boolean allMandatoryDocumentsApproved(DueDiligence dd) {
        List<DocumentType> required = deserializeRequiredDocuments(dd.getRequiredDocumentsJson());
        
        List<Long> mandatoryIds = required.stream()
            .filter(dt -> dt.getIsMandatory() || 
                dt.getRequiredForRiskLevels().contains(dd.getRiskLevel()))
            .map(DocumentType::getId)
            .collect(Collectors.toList());
        
        long approvedCount = documentRepository
            .countApprovedDocumentsByType(dd.getId(), mandatoryIds);
        
        return approvedCount == mandatoryIds.size();
    }
    
    private DiligenceLevel calculateDiligenceLevel(RiskLevel riskLevel) {
        switch (riskLevel) {
            case ALTO:
                return DiligenceLevel.REFORZADA;
            case MEDIO:
                return DiligenceLevel.REFORZADA;
            default:
                return DiligenceLevel.SIMPLIFICADA;
        }
    }
}
```

---

## 5. API REST Endpoints

### 5.1 Gestión de Debida Diligencia

```
POST   /api/v1/due-diligence/initialize
POST   /api/v1/due-diligence/{id}/submit-for-review
GET    /api/v1/due-diligence/{id}
GET    /api/v1/due-diligence/dossier/{dossierId}
GET    /api/v1/due-diligence/search
PUT    /api/v1/due-diligence/{id}/approve
PUT    /api/v1/due-diligence/{id}/request-information
```

### 5.2 Gestión de Documentos

```
POST   /api/v1/due-diligence/{id}/documents/upload
GET    /api/v1/due-diligence/{id}/documents
GET    /api/v1/due-diligence/documents/{documentId}
GET    /api/v1/due-diligence/documents/{documentId}/download
GET    /api/v1/due-diligence/documents/{documentId}/versions
PUT    /api/v1/due-diligence/documents/{documentId}/approve
PUT    /api/v1/due-diligence/documents/{documentId}/reject
```

### 5.3 Tipos de Documentos (Parametrización)

```
GET    /api/v1/document-types
GET    /api/v1/document-types/{id}
POST   /api/v1/document-types
PUT    /api/v1/document-types/{id}
GET    /api/v1/document-types/required?dossierType={type}&riskLevel={level}
```

### 5.4 Solicitudes de Información

```
POST   /api/v1/due-diligence/{id}/information-requests
GET    /api/v1/due-diligence/{id}/information-requests
PUT    /api/v1/due-diligence/information-requests/{requestId}/respond
```

### 5.5 Alertas y Reportes

```
GET    /api/v1/due-diligence/alerts
GET    /api/v1/due-diligence/alerts/expiring-documents
GET    /api/v1/due-diligence/alerts/expired-documents
GET    /api/v1/due-diligence/reports/completeness
GET    /api/v1/due-diligence/reports/pending-approvals
```

---

## 6. Integración con Otros Módulos

### 6.1 Integración con Expediente Único

```java
@Service
public class DossierIntegrationService {
    
    /**
     * Al crear un expediente, se inicializa automáticamente la debida diligencia
     */
    @EventListener
    public void onDossierCreated(DossierCreatedEvent event) {
        dueDiligenceService.initializeDueDiligence(event.getDossierId());
    }
    
    /**
     * Al actualizar el nivel de riesgo, se actualiza la debida diligencia
     */
    @EventListener
    public void onRiskLevelChanged(RiskLevelChangedEvent event) {
        DueDiligence dd = dueDiligenceService.findByDossierId(event.getDossierId());
        dueDiligenceService.updateRequiredDocuments(dd.getId(), event.getNewRiskLevel());
    }
}
```

### 6.2 Integración con Evaluación de Riesgos

- El nivel de riesgo determina qué documentos son obligatorios
- Riesgo Alto → Debida Diligencia Reforzada (más documentos)
- Cualquier cambio en el riesgo actualiza los requisitos documentales

### 6.3 Integración con RBAC

```
Permisos específicos del módulo:
- DD_VIEW: Ver debida diligencia
- DD_UPLOAD: Cargar documentos
- DD_REVIEW: Revisar y solicitar información
- DD_APPROVE: Aprobar documentos y debida diligencia (solo Oficial)
- DD_CONFIG: Configurar tipos de documentos y alertas
```

---

## 7. Consideraciones para Inspección Regulatoria

### 7.1 Evidencia Documental

El módulo proporciona evidencia completa para el regulador:

1. **Registro de carga**: Quién cargó cada documento y cuándo
2. **Historial de versiones**: Todas las versiones previas se mantienen
3. **Registro de aprobación**: Quién aprobó, cuándo y con qué observaciones
4. **Trazabilidad de cambios**: Log inmutable de todas las acciones
5. **Alertas generadas**: Registro de todas las alertas de vencimiento
6. **Solicitudes de información**: Documentación de información solicitada y respuesta

### 7.2 Segregación de Funciones

- **Operaciones**: Carga documentos, no aprueba
- **Analista de Cumplimiento**: Revisa, solicita información, no aprueba
- **Oficial de Cumplimiento**: Única persona autorizada para aprobar

### 7.3 Reportes para el Regulador

```sql
-- Reporte de documentos vencidos
SELECT 
    d.dossier_id,
    dt.name AS document_type,
    dd.expiration_date,
    CURRENT_DATE - dd.expiration_date AS days_expired
FROM due_diligence_documents dd
JOIN document_types dt ON dd.document_type_id = dt.id
JOIN due_diligences d ON dd.due_diligence_id = d.id
WHERE dd.expiration_date < CURRENT_DATE
  AND dd.is_current_version = true
  AND dd.approval_status = 'APROBADO';

-- Reporte de expedientes sin debida diligencia aprobada
SELECT 
    d.dossier_id,
    d.dossier_type,
    dd.status,
    dd.completeness_percentage,
    dd.created_at
FROM due_diligences dd
JOIN dossiers d ON dd.dossier_id = d.id
WHERE dd.status != 'APROBADA';

-- Reporte de acciones del Oficial de Cumplimiento
SELECT 
    at.timestamp,
    at.action,
    at.details,
    d.dossier_id
FROM audit_trail at
JOIN due_diligences dd ON at.entity_id = dd.id
JOIN dossiers d ON dd.dossier_id = d.id
WHERE at.user_id = ? -- ID del Oficial de Cumplimiento
  AND at.entity_type = 'DUE_DILIGENCE'
ORDER BY at.timestamp DESC;
```

---

## 8. Flujo Completo de Ejemplo

### Caso: Cliente nuevo con Riesgo Alto

```
1. CREACIÓN DE EXPEDIENTE
   - Sistema crea expediente para Juan Pérez (CLIENTE)
   - Se ejecuta evaluación de riesgo → Resultado: ALTO
   - Sistema inicializa debida diligencia automáticamente
   - Estado: PENDIENTE
   - Documentos requeridos: CI, CD, RIF, DOF, Estados Financieros

2. CARGA DOCUMENTAL (Operaciones)
   - María González (Operaciones) carga:
     * Cédula de identidad (vence 2030)
     * Comprobante de domicilio (vence en 3 meses)
     * RIF
     * Declaración jurada de origen de fondos
   - Sistema genera alerta a Oficial de Cumplimiento
   - Completitud: 80% (falta Estados Financieros)

3. REVISIÓN (Analista de Cumplimiento)
   - Ana Martínez revisa documentos
   - Estado: EN_REVISION
   - Observa que falta Estados Financieros
   - Solicita información adicional
   - Sistema genera alerta a Operaciones
   - Estado: REQUIERE_INFORMACION

4. COMPLEMENTO DOCUMENTAL
   - María carga Estados Financieros Auditados
   - Sistema notifica a Ana Martínez
   - Completitud: 100%
   - Estado: EN_REVISION

5. APROBACIÓN (Oficial de Cumplimiento)
   - Carlos Rodríguez (Oficial) revisa todo
   - Aprueba cada documento individualmente
   - Aprueba la debida diligencia completa
   - Estado: APROBADA
   - Expediente habilitado para operar

6. MONITOREO CONTINUO
   - Sistema verifica vencimientos diariamente
   - 30 días antes del vencimiento del comprobante de domicilio:
     * Alerta MEDIA a Operaciones y Analista
   - 7 días antes:
     * Alerta ALTA a Operaciones, Analista y Oficial
   - Si vence:
     * Alerta CRITICA
     * Expediente pasa a estado OBSERVADA
```

---

## 9. Conclusión

El módulo de Debida Diligencia y Gestión Documental es el corazón del cumplimiento normativo del SIAR. Garantiza que:

1. ✅ Toda documentación es cargada, revisada y aprobada formalmente
2. ✅ Existe segregación total de funciones (carga ≠ revisión ≠ aprobación)
3. ✅ El Oficial de Cumplimiento es la única autoridad de aprobación
4. ✅ Los documentos vencidos generan alertas inmediatas
5. ✅ Existe trazabilidad completa de todas las acciones
6. ✅ El sistema está alineado con el nivel de riesgo del expediente
7. ✅ La evidencia documental está disponible para inspecciones
8. ✅ No se pueden eliminar documentos aprobados, solo versionarlos
9. ✅ Toda modificación documental requiere aprobación del Oficial

Este módulo proporciona la base para demostrar al regulador que la empresa tiene controles internos sólidos y que cumple con todas las obligaciones de debida diligencia.
