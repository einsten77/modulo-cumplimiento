package com.siar.risk.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_evaluations", indexes = {
    @Index(name = "idx_dossier_id", columnList = "dossierId"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_evaluation_date", columnList = "evaluationDate"),
    @Index(name = "idx_final_risk_level", columnList = "finalRiskLevel"),
    @Index(name = "idx_next_review_date", columnList = "nextReviewDate")
})
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskEvaluation {
    
    @Id
    @Column(length = 50)
    private String evaluationId;  // EVAL-2024-000123-v1
    
    @Column(nullable = false, length = 50)
    private String dossierId;  // FK to Dossier
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationType evaluationType;
    
    @Column(nullable = false)
    private LocalDateTime evaluationDate;
    
    @Column(nullable = false, length = 50)
    private String evaluatorUserId;  // FK to User
    
    @Column(nullable = false)
    private Integer version;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EvaluationStatus status;
    
    @Type(type = "jsonb")
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode riskFactorsJson;
    
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode calculationResultJson;
    
    @Column(length = 50)
    private String configurationId;  // FK to RiskConfiguration
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private RiskLevel preliminaryRiskLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private RiskLevel finalRiskLevel;
    
    @Column(nullable = false)
    private Boolean hasManualOverride;
    
    @Column(columnDefinition = "TEXT")
    private String manualOverrideJustification;
    
    @Column(length = 50)
    private String overrideAppliedBy;  // FK to User
    
    private LocalDateTime overrideAppliedAt;
    
    @Column(nullable = false)
    private Boolean requiresEnhancedDueDiligence;
    
    @Column(nullable = false)
    private Boolean requiresApproval;
    
    @Column(length = 30)
    private String approvalLevel;
    
    @Column(length = 50)
    private String approvedBy;  // FK to User
    
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    private LocalDate nextReviewDate;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (hasManualOverride == null) hasManualOverride = false;
        if (requiresEnhancedDueDiligence == null) requiresEnhancedDueDiligence = false;
        if (requiresApproval == null) requiresApproval = true;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
