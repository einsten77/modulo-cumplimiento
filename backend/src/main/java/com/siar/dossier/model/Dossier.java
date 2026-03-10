package com.siar.dossier.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dossiers", indexes = {
    @Index(name = "idx_dossier_status", columnList = "status"),
    @Index(name = "idx_dossier_subject_type", columnList = "subject_type"),
    @Index(name = "idx_dossier_created_by", columnList = "created_by"),
    @Index(name = "idx_dossier_document_number", columnList = "document_number")
})
@Data
public class Dossier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "dossier_uuid", nullable = false, updatable = false)
    private UUID dossierUuid;
    
    @Column(name = "dossier_id", nullable = false, unique = true, length = 50)
    private String dossierId; // DOSS-2024-00001
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false, length = 50)
    private SubjectType subjectType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private DossierStatus status;
    
    @Column(name = "completeness_percentage", nullable = false)
    private Double completenessPercentage = 0.0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;
    
    @Column(name = "last_modified_at")
    private Instant lastModifiedAt;
    
    @Column(name = "last_modified_by", length = 100)
    private String lastModifiedBy;
    
    @Column(name = "approved_at")
    private Instant approvedAt;
    
    @Column(name = "approved_by", length = 100)
    private String approvedBy;
    
    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;
    
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    @Column(name = "is_deletable", nullable = false)
    private Boolean isDeletable = true;
    
    @Column(name = "requires_approval_for_changes", nullable = false)
    private Boolean requiresApprovalForChanges = false;
    
    // Almacenar el documento de identificación para búsquedas rápidas
    @Column(name = "document_type", length = 20)
    private String documentType;
    
    @Column(name = "document_number", length = 50)
    private String documentNumber;
    
    // JSON fields para almacenar la planilla estructurada
    @Type(JsonType.class)
    @Column(name = "identification", columnDefinition = "jsonb")
    private IdentificationSection identification;
    
    @Type(JsonType.class)
    @Column(name = "economic_information", columnDefinition = "jsonb")
    private EconomicInformationSection economicInformation;
    
    @Type(JsonType.class)
    @Column(name = "insurer_relationship", columnDefinition = "jsonb")
    private InsurerRelationshipSection insurerRelationship;
    
    @Type(JsonType.class)
    @Column(name = "geographic_location", columnDefinition = "jsonb")
    private GeographicLocationSection geographicLocation;
    
    @Type(JsonType.class)
    @Column(name = "internal_controls", columnDefinition = "jsonb")
    private InternalControlsSection internalControls;
    
    // Relaciones con otras entidades
    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DossierDocument> attachedDocuments = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DossierChangeHistory> changeHistory = new ArrayList<>();
    
    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DossierReviewComment> reviewComments = new ArrayList<>();
    
    @OneToOne(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    private DossierRiskAssessment riskAssessment;
    
    // Métodos de utilidad
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (status == null) {
            status = DossierStatus.INCOMPLETE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = Instant.now();
        
        // Si el expediente es aprobado, ya no puede eliminarse
        if (status == DossierStatus.APPROVED) {
            isDeletable = false;
            requiresApprovalForChanges = true;
        }
    }
    
    public boolean canBeModified(String userId, String userRole) {
        // Si está eliminado, no puede modificarse
        if (isDeleted) {
            return false;
        }
        
        // Si está aprobado, requiere proceso especial
        if (status == DossierStatus.APPROVED && requiresApprovalForChanges) {
            return false;
        }
        
        // Si está en revisión, solo el área de cumplimiento puede modificarlo
        if (status == DossierStatus.UNDER_REVIEW) {
            return "COMPLIANCE_ANALYST".equals(userRole) || 
                   "COMPLIANCE_OFFICER".equals(userRole);
        }
        
        // En otros estados, el creador puede modificarlo
        return createdBy.equals(userId) || 
               "COMPLIANCE_OFFICER".equals(userRole);
    }
    
    public boolean canBeDeleted(String userRole) {
        return isDeletable && !isDeleted && 
               ("COMPLIANCE_OFFICER".equals(userRole) || 
                status == DossierStatus.INCOMPLETE);
    }
    
    public List<String> getMissingMandatoryFields(String section) {
        // Implementar lógica según el tipo de sujeto
        List<String> mandatory = MandatoryFieldsConfig
            .getMandatoryFields(subjectType, section);
        List<String> completed = getCompletedFieldsForSection(section);
        
        List<String> missing = new ArrayList<>(mandatory);
        missing.removeAll(completed);
        
        return missing;
    }
    
    public List<String> getCompletedFieldsForSection(String section) {
        // Implementar lógica para verificar campos completados
        switch (section) {
            case "identification":
                return identification != null ? 
                    identification.getCompletedFields() : new ArrayList<>();
            case "economicInformation":
                return economicInformation != null ? 
                    economicInformation.getCompletedFields() : new ArrayList<>();
            case "insurerRelationship":
                return insurerRelationship != null ? 
                    insurerRelationship.getCompletedFields() : new ArrayList<>();
            case "geographicLocation":
                return geographicLocation != null ? 
                    geographicLocation.getCompletedFields() : new ArrayList<>();
            case "internalControls":
                return internalControls != null ? 
                    internalControls.getCompletedFields() : new ArrayList<>();
            default:
                return new ArrayList<>();
        }
    }
    
    public List<String> getMissingMandatoryDocuments() {
        List<String> mandatory = MandatoryFieldsConfig
            .getMandatoryDocuments(subjectType);
        
        List<String> existing = attachedDocuments.stream()
            .filter(doc -> doc.getStatus().equals("APPROVED"))
            .map(DossierDocument::getDocumentType)
            .toList();
        
        List<String> missing = new ArrayList<>(mandatory);
        missing.removeAll(existing);
        
        return missing;
    }
}

// Enums
enum SubjectType {
    CLIENT,
    INTERMEDIARY,
    EMPLOYEE,
    PROVIDER,
    REINSURER,
    RETROCESSIONAIRE
}

enum DossierStatus {
    INCOMPLETE,
    UNDER_REVIEW,
    REQUIRES_INFO,
    OBSERVED,
    APPROVED
}
