package com.siar.screening.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "screening", indexes = {
    @Index(name = "idx_screening_dossier", columnList = "dossier_id"),
    @Index(name = "idx_screening_execution_date", columnList = "execution_date"),
    @Index(name = "idx_screening_status", columnList = "status"),
    @Index(name = "idx_screening_has_matches", columnList = "has_relevant_matches")
})
public class Screening {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dossier_id", nullable = false)
    private Long dossierId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "screening_type", nullable = false, length = 20)
    private ScreeningType screeningType;
    
    @Column(name = "execution_date", nullable = false)
    private Instant executionDate;
    
    @Column(name = "screened_entity_name", nullable = false, length = 500)
    private String screenedEntityName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "screened_entity_type", nullable = false, length = 50)
    private EntityType screenedEntityType;
    
    @Column(name = "screened_entity_document", length = 100)
    private String screenedEntityDocument;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ScreeningStatus status;
    
    @Column(name = "total_lists_checked")
    private Integer totalListsChecked;
    
    @Column(name = "total_matches_found")
    private Integer totalMatchesFound;
    
    @Column(name = "has_relevant_matches")
    private Boolean hasRelevantMatches;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "overall_result", length = 30)
    private ScreeningResult overallResult;
    
    @Column(name = "executed_by", nullable = false)
    private Long executedBy;
    
    @Column(name = "execution_duration_ms")
    private Long executionDurationMs;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getDossierId() {
        return dossierId;
    }
    
    public void setDossierId(Long dossierId) {
        this.dossierId = dossierId;
    }
    
    public ScreeningType getScreeningType() {
        return screeningType;
    }
    
    public void setScreeningType(ScreeningType screeningType) {
        this.screeningType = screeningType;
    }
    
    public Instant getExecutionDate() {
        return executionDate;
    }
    
    public void setExecutionDate(Instant executionDate) {
        this.executionDate = executionDate;
    }
    
    public String getScreenedEntityName() {
        return screenedEntityName;
    }
    
    public void setScreenedEntityName(String screenedEntityName) {
        this.screenedEntityName = screenedEntityName;
    }
    
    public EntityType getScreenedEntityType() {
        return screenedEntityType;
    }
    
    public void setScreenedEntityType(EntityType screenedEntityType) {
        this.screenedEntityType = screenedEntityType;
    }
    
    public String getScreenedEntityDocument() {
        return screenedEntityDocument;
    }
    
    public void setScreenedEntityDocument(String screenedEntityDocument) {
        this.screenedEntityDocument = screenedEntityDocument;
    }
    
    public ScreeningStatus getStatus() {
        return status;
    }
    
    public void setStatus(ScreeningStatus status) {
        this.status = status;
    }
    
    public Integer getTotalListsChecked() {
        return totalListsChecked;
    }
    
    public void setTotalListsChecked(Integer totalListsChecked) {
        this.totalListsChecked = totalListsChecked;
    }
    
    public Integer getTotalMatchesFound() {
        return totalMatchesFound;
    }
    
    public void setTotalMatchesFound(Integer totalMatchesFound) {
        this.totalMatchesFound = totalMatchesFound;
    }
    
    public Boolean getHasRelevantMatches() {
        return hasRelevantMatches;
    }
    
    public void setHasRelevantMatches(Boolean hasRelevantMatches) {
        this.hasRelevantMatches = hasRelevantMatches;
    }
    
    public ScreeningResult getOverallResult() {
        return overallResult;
    }
    
    public void setOverallResult(ScreeningResult overallResult) {
        this.overallResult = overallResult;
    }
    
    public Long getExecutedBy() {
        return executedBy;
    }
    
    public void setExecutedBy(Long executedBy) {
        this.executedBy = executedBy;
    }
    
    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }
    
    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
