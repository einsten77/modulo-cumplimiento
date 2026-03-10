package com.siar.pep.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.siar.common.model.AuditableEntity;
import com.siar.dossier.model.Dossier;
import lombok.*;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa el estatus PEP de un expediente
 * Persona Expuesta Políticamente (PEP) y sus vinculados
 */
@Entity
@Table(name = "pep_status", indexes = {
    @Index(name = "idx_pep_dossier", columnList = "dossier_id"),
    @Index(name = "idx_pep_is_pep", columnList = "is_pep"),
    @Index(name = "idx_pep_type", columnList = "pep_type"),
    @Index(name = "idx_pep_risk_level", columnList = "risk_level"),
    @Index(name = "idx_pep_review_date", columnList = "next_review_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PepStatus extends AuditableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pep_id")
    private Long id;
    
    @Column(name = "pep_uuid", nullable = false, unique = true, updatable = false)
    private UUID pepUuid = UUID.randomUUID();
    
    // Relación con Expediente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    @JsonIgnore
    private Dossier dossier;
    
    // Estado PEP
    @Column(name = "is_pep", nullable = false)
    private Boolean isPep = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "pep_type", length = 50)
    private PepType pepType; // DIRECT, FAMILY, ASSOCIATE, NONE
    
    @Enumerated(EnumType.STRING)
    @Column(name = "pep_classification", length = 50)
    private PepClassification pepClassification; // NATIONAL, FOREIGN, INTERNATIONAL_ORG, EX_PEP
    
    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 50)
    private PepCurrentStatus currentStatus = PepCurrentStatus.UNDER_REVIEW;
    
    // Fechas de gestión
    @Column(name = "effective_date", nullable = false)
    @NotNull(message = "Fecha efectiva es requerida")
    private LocalDate effectiveDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "declaration_date", nullable = false)
    @NotNull(message = "Fecha de declaración es requerida")
    private LocalDate declarationDate;
    
    @Column(name = "verification_date")
    private LocalDate verificationDate;
    
    @Column(name = "last_review_date")
    private LocalDate lastReviewDate;
    
    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;
    
    // Fuente de información
    @Column(name = "information_source", nullable = false, length = 100)
    @NotBlank(message = "Fuente de información es requerida")
    private String informationSource; // SELF_DECLARATION, PUBLIC_DATABASE, THIRD_PARTY, MANUAL_RESEARCH
    
    @Column(name = "verification_source", length = 200)
    private String verificationSource;
    
    @Column(name = "verification_method", length = 100)
    private String verificationMethod; // DOCUMENTARY, DATABASE_MATCH, OFFICIAL_REGISTRY
    
    @Column(name = "external_reference", length = 200)
    private String externalReference;
    
    // Evaluación de riesgo
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 20)
    private RiskLevel riskLevel = RiskLevel.MEDIUM;
    
    @Column(name = "risk_score", precision = 5, scale = 2)
    private BigDecimal riskScore;
    
    @Column(name = "requires_edd", nullable = false)
    private Boolean requiresEdd = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "edd_status", length = 50)
    private EddStatus eddStatus; // NOT_REQUIRED, PENDING, IN_PROGRESS, COMPLETED
    
    @Column(name = "monitoring_frequency", length = 50)
    private String monitoringFrequency; // MONTHLY, QUARTERLY, BIANNUAL, ANNUAL
    
    // Control
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;
    
    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 50)
    private ApprovalStatus approvalStatus; // PENDING, APPROVED, REJECTED
    
    // Observaciones
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "internal_comments", columnDefinition = "TEXT")
    private String internalComments;
    
    // Auditoría adicional
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "approved_by", length = 100)
    private String approvedBy;
    
    // Relaciones
    @OneToMany(mappedBy = "pepStatus", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PepPosition> positions = new ArrayList<>();
    
    @OneToMany(mappedBy = "pepStatus", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PepRelationship> relationships = new ArrayList<>();
    
    @OneToMany(mappedBy = "pepStatus", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PepHistory> history = new ArrayList<>();
    
    // Métodos de utilidad
    
    public void addPosition(PepPosition position) {
        positions.add(position);
        position.setPepStatus(this);
    }
    
    public void removePosition(PepPosition position) {
        positions.remove(position);
        position.setPepStatus(null);
    }
    
    public void addRelationship(PepRelationship relationship) {
        relationships.add(relationship);
        relationship.setPepStatus(this);
    }
    
    public void removeRelationship(PepRelationship relationship) {
        relationships.remove(relationship);
        relationship.setPepStatus(null);
    }
    
    public void addHistoryEntry(PepHistory historyEntry) {
        history.add(historyEntry);
        historyEntry.setPepStatus(this);
    }
    
    /**
     * Calcula la fecha de próxima revisión basada en la frecuencia de monitoreo
     */
    public void calculateNextReviewDate() {
        if (this.monitoringFrequency == null || this.lastReviewDate == null) {
            return;
        }
        
        switch (this.monitoringFrequency) {
            case "MONTHLY":
                this.nextReviewDate = this.lastReviewDate.plusMonths(1);
                break;
            case "QUARTERLY":
                this.nextReviewDate = this.lastReviewDate.plusMonths(3);
                break;
            case "BIANNUAL":
                this.nextReviewDate = this.lastReviewDate.plusMonths(6);
                break;
            case "ANNUAL":
                this.nextReviewDate = this.lastReviewDate.plusYears(1);
                break;
            default:
                this.nextReviewDate = this.lastReviewDate.plusMonths(3); // Por defecto trimestral
        }
    }
    
    /**
     * Verifica si la revisión está vencida
     */
    public boolean isReviewOverdue() {
        return this.nextReviewDate != null && 
               this.nextReviewDate.isBefore(LocalDate.now()) && 
               this.isActive;
    }
    
    /**
     * Determina si es Ex-PEP basado en la fecha de fin
     */
    public boolean isExPep() {
        if (this.endDate == null || !this.isPep) {
            return false;
        }
        return this.endDate.isBefore(LocalDate.now());
    }
    
    /**
     * Calcula meses desde el cese de funciones
     */
    public Long getMonthsSinceEnd() {
        if (this.endDate == null) {
            return null;
        }
        return java.time.temporal.ChronoUnit.MONTHS.between(this.endDate, LocalDate.now());
    }
    
    @PrePersist
    @PreUpdate
    protected void validateAndCalculate() {
        // Si es PEP, validar campos requeridos
        if (this.isPep != null && this.isPep) {
            if (this.pepType == null) {
                throw new IllegalStateException("Tipo de PEP es requerido cuando isPep es true");
            }
            if (this.pepClassification == null) {
                throw new IllegalStateException("Clasificación de PEP es requerida cuando isPep es true");
            }
        }
        
        // Calcular próxima revisión si aplica
        if (this.lastReviewDate != null && this.monitoringFrequency != null) {
            calculateNextReviewDate();
        }
    }
}
