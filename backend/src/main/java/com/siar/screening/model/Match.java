package com.siar.screening.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "match", indexes = {
    @Index(name = "idx_match_screening_result", columnList = "screening_result_id"),
    @Index(name = "idx_match_watchlist_entry", columnList = "watchlist_entry_id"),
    @Index(name = "idx_match_similarity", columnList = "similarity_score"),
    @Index(name = "idx_match_requires_review", columnList = "requires_review")
})
public class Match {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "screening_result_id", nullable = false)
    private Long screeningResultId;
    
    @Column(name = "watchlist_entry_id", nullable = false)
    private Long watchlistEntryId;
    
    @Column(name = "screened_name", nullable = false, length = 500)
    private String screenedName;
    
    @Column(name = "matched_name", nullable = false, length = 500)
    private String matchedName;
    
    @Column(name = "similarity_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal similarityScore;
    
    @Column(name = "is_relevant", nullable = false)
    private Boolean isRelevant;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", nullable = false, length = 20)
    private MatchType matchType;
    
    @Type(JsonType.class)
    @Column(name = "matched_fields", columnDefinition = "jsonb")
    private Map<String, Object> matchedFields;
    
    @Type(JsonType.class)
    @Column(name = "additional_info", columnDefinition = "jsonb")
    private Map<String, Object> additionalInfo;
    
    @Column(name = "requires_review", nullable = false)
    private Boolean requiresReview;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getScreeningResultId() {
        return screeningResultId;
    }
    
    public void setScreeningResultId(Long screeningResultId) {
        this.screeningResultId = screeningResultId;
    }
    
    public Long getWatchlistEntryId() {
        return watchlistEntryId;
    }
    
    public void setWatchlistEntryId(Long watchlistEntryId) {
        this.watchlistEntryId = watchlistEntryId;
    }
    
    public String getScreenedName() {
        return screenedName;
    }
    
    public void setScreenedName(String screenedName) {
        this.screenedName = screenedName;
    }
    
    public String getMatchedName() {
        return matchedName;
    }
    
    public void setMatchedName(String matchedName) {
        this.matchedName = matchedName;
    }
    
    public BigDecimal getSimilarityScore() {
        return similarityScore;
    }
    
    public void setSimilarityScore(BigDecimal similarityScore) {
        this.similarityScore = similarityScore;
    }
    
    public Boolean getIsRelevant() {
        return isRelevant;
    }
    
    public void setIsRelevant(Boolean isRelevant) {
        this.isRelevant = isRelevant;
    }
    
    public MatchType getMatchType() {
        return matchType;
    }
    
    public void setMatchType(MatchType matchType) {
        this.matchType = matchType;
    }
    
    public Map<String, Object> getMatchedFields() {
        return matchedFields;
    }
    
    public void setMatchedFields(Map<String, Object> matchedFields) {
        this.matchedFields = matchedFields;
    }
    
    public Map<String, Object> getAdditionalInfo() {
        return additionalInfo;
    }
    
    public void setAdditionalInfo(Map<String, Object> additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
    
    public Boolean getRequiresReview() {
        return requiresReview;
    }
    
    public void setRequiresReview(Boolean requiresReview) {
        this.requiresReview = requiresReview;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
