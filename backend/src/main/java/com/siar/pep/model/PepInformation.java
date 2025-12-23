package com.siar.pep.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.siar.dossier.model.Dossier;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad que representa la información PEP de un expediente
 * Almacena la clasificación, detalles y seguimiento de Personas Expuestas Políticamente
 */
@Entity
@Table(name = "pep_information", indexes = {
    @Index(name = "idx_pep_dossier", columnList = "dossier_id"),
    @Index(name = "idx_pep_status", columnList = "is_pep, pep_type"),
    @Index(name = "idx_pep_review_date", columnList = "next_review_date"),
    @Index(name = "idx_pep_evaluation", columnList = "evaluation_status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PepInformation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Referencia al expediente asociado
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false, unique = true)
    private Dossier dossier;
    
    /**
     * Estado de la evaluación PEP
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_status", nullable = false, length = 50)
    private EvaluationStatus evaluationStatus;
    
    /**
     * Fecha de última evaluación
     */
    @Column(name = "last_evaluation_date")
    private LocalDateTime lastEvaluationDate;
    
    /**
     * Usuario que realizó la evaluación
     */
    @Column(name = "evaluated_by", length = 100)
    private String evaluatedBy;
    
    /**
     * Fecha de próxima revisión obligatoria
     */
    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;
    
    /**
     * Indicador de si es PEP
     */
    @Column(name = "is_pep", nullable = false)
    private Boolean isPep;
    
    /**
     * Tipo de PEP
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "pep_type", length = 50)
    private PepType pepType;
    
    /**
     * Categoría de PEP
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "pep_category", length = 50)
    private PepCategory pepCategory;
    
    /**
     * Detalles del PEP en formato JSON
     * Incluye: position, institution, country, startDate, endDate, etc.
     */
    @Type(JsonType.class)
    @Column(name = "pep_details", columnDefinition = "jsonb")
    private JsonNode pepDetails;
    
    /**
     * Relación con el PEP (para familiares y vinculados) en formato JSON
     */
    @Type(JsonType.class)
    @Column(name = "relationship_to_pep", columnDefinition = "jsonb")
    private JsonNode relationshipToPep;
    
    /**
     * Fuentes de información en formato JSON
     */
    @Type(JsonType.class)
    @Column(name = "information_sources", columnDefinition = "jsonb", nullable = false)
    private JsonNode informationSources;
    
    /**
     * Impacto en el riesgo en formato JSON
     */
    @Type(JsonType.class)
    @Column(name = "risk_impact", columnDefinition = "jsonb")
    private JsonNode riskImpact;
    
    /**
     * Decisión del Oficial de Cumplimiento en formato JSON
     */
    @Type(JsonType.class)
    @Column(name = "compliance_officer_decision", columnDefinition = "jsonb")
    private JsonNode complianceOfficerDecision;
    
    /**
     * Historial de cambios de condición PEP en formato JSON
     */
    @Type(JsonType.class)
    @Column(name = "pep_history", columnDefinition = "jsonb", nullable = false)
    private JsonNode pepHistory;
    
    /**
     * Configuración de monitoreo en formato JSON
     */
    @Type(JsonType.class)
    @Column(name = "monitoring_schedule", columnDefinition = "jsonb")
    private JsonNode monitoringSchedule;
    
    /**
     * Metadata de auditoría
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;
    
    @Column(name = "last_modified_at")
    private LocalDateTime lastModifiedAt;
    
    @Column(name = "last_modified_by", length = 100)
    private String lastModifiedBy;
    
    @Version
    @Column(name = "version")
    private Integer version;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (evaluationStatus == null) {
            evaluationStatus = EvaluationStatus.PENDING_EVALUATION;
        }
        if (isPep == null) {
            isPep = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
}
