package com.siar.duediligence.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "due_diligences", indexes = {
    @Index(name = "idx_dd_id", columnList = "dueDiligenceId"),
    @Index(name = "idx_dd_dossier", columnList = "dossier_id"),
    @Index(name = "idx_dd_status", columnList = "status"),
    @Index(name = "idx_dd_risk", columnList = "riskLevel")
})
@Data
public class DueDiligence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String dueDiligenceId;
    
    @Column(nullable = false)
    private Long dossierId;  // FK al expediente
    
    @Column(nullable = false, length = 50)
    private String dossierType;  // CLIENTE, INTERMEDIARIO, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DueDiligenceStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private String riskLevel;  // BAJO, MEDIO, ALTO
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiligenceLevel diligenceLevel;
    
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal completenessPercentage;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "required_documents")
    private String requiredDocumentsJson;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "workflow")
    private String workflowJson;
    
    // Workflow tracking
    private LocalDateTime submittedDate;
    
    @Column(name = "submitted_by")
    private Long submittedBy;
    
    private LocalDateTime reviewStartDate;
    
    @Column(name = "reviewed_by")
    private Long reviewedBy;
    
    private LocalDateTime approvalDate;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "audit_trail")
    private String auditTrailJson;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    private Long version;
}
