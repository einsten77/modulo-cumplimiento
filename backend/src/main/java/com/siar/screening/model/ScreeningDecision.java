package com.siar.screening.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "screening_decision", indexes = {
    @Index(name = "idx_decision_match", columnList = "match_id"),
    @Index(name = "idx_decision_screening", columnList = "screening_id"),
    @Index(name = "idx_decision_decided_by", columnList = "decided_by"),
    @Index(name = "idx_decision_type", columnList = "decision")
})
public class ScreeningDecision {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "match_id", nullable = false, unique = true)
    private Long matchId;
    
    @Column(name = "screening_id", nullable = false)
    private Long screeningId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false, length = 30)
    private DecisionType decision;
    
    @Column(name = "justification", nullable = false, columnDefinition = "TEXT")
    private String justification;
    
    @Column(name = "decided_by", nullable = false)
    private Long decidedBy;
    
    @Column(name = "decided_at", nullable = false)
    private Instant decidedAt;
    
    @Column(name = "requires_escalation")
    private Boolean requiresEscalation;
    
    @Column(name = "escalated_to")
    private Long escalatedTo;
    
    @Column(name = "escalation_reason", columnDefinition = "TEXT")
    private String escalationReason;
    
    @Column(name = "impact_on_risk")
    private Boolean impactOnRisk;
    
    @Column(name = "requires_enhanced_due_diligence")
    private Boolean requiresEnhancedDueDiligence;
    
    @Type(JsonType.class)
    @Column(name = "attachments", columnDefinition = "jsonb")
    private Map<String, Object> attachments;
    
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
    
    public Long getMatchId() {
        return matchId;
    }
    
    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }
    
    public Long getScreeningId() {
        return screeningId;
    }
    
    public void setScreeningId(Long screeningId) {
        this.screeningId = screeningId;
    }
    
    public DecisionType getDecision() {
        return decision;
    }
    
    public void setDecision(DecisionType decision) {
        this.decision = decision;
    }
    
    public String getJustification() {
        return justification;
    }
    
    public void setJustification(String justification) {
        this.justification = justification;
    }
    
    public Long getDecidedBy() {
        return decidedBy;
    }
    
    public void setDecidedBy(Long decidedBy) {
        this.decidedBy = decidedBy;
    }
    
    public Instant getDecidedAt() {
        return decidedAt;
    }
    
    public void setDecidedAt(Instant decidedAt) {
        this.decidedAt = decidedAt;
    }
    
    public Boolean getRequiresEscalation() {
        return requiresEscalation;
    }
    
    public void setRequiresEscalation(Boolean requiresEscalation) {
        this.requiresEscalation = requiresEscalation;
    }
    
    public Long getEscalatedTo() {
        return escalatedTo;
    }
    
    public void setEscalatedTo(Long escalatedTo) {
        this.escalatedTo = escalatedTo;
    }
    
    public String getEscalationReason() {
        return escalationReason;
    }
    
    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }
    
    public Boolean getImpactOnRisk() {
        return impactOnRisk;
    }
    
    public void setImpactOnRisk(Boolean impactOnRisk) {
        this.impactOnRisk = impactOnRisk;
    }
    
    public Boolean getRequiresEnhancedDueDiligence() {
        return requiresEnhancedDueDiligence;
    }
    
    public void setRequiresEnhancedDueDiligence(Boolean requiresEnhancedDueDiligence) {
        this.requiresEnhancedDueDiligence = requiresEnhancedDueDiligence;
    }
    
    public Map<String, Object> getAttachments() {
        return attachments;
    }
    
    public void setAttachments(Map<String, Object> attachments) {
        this.attachments = attachments;
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
