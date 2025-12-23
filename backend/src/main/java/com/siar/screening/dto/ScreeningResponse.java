package com.siar.screening.dto;

import java.time.Instant;
import java.util.List;

public class ScreeningResponse {
    
    private Long id;
    private Long dossierId;
    private String screeningType;
    private Instant executionDate;
    private String status;
    private Integer totalListsChecked;
    private Integer totalMatchesFound;
    private Boolean hasRelevantMatches;
    private String overallResult;
    private Long executionDurationMs;
    private List<MatchSummary> matches;
    
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
    
    public String getScreeningType() {
        return screeningType;
    }
    
    public void setScreeningType(String screeningType) {
        this.screeningType = screeningType;
    }
    
    public Instant getExecutionDate() {
        return executionDate;
    }
    
    public void setExecutionDate(Instant executionDate) {
        this.executionDate = executionDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
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
    
    public String getOverallResult() {
        return overallResult;
    }
    
    public void setOverallResult(String overallResult) {
        this.overallResult = overallResult;
    }
    
    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }
    
    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }
    
    public List<MatchSummary> getMatches() {
        return matches;
    }
    
    public void setMatches(List<MatchSummary> matches) {
        this.matches = matches;
    }
    
    public static class MatchSummary {
        private Long matchId;
        private String watchlistName;
        private String matchedName;
        private Double similarityScore;
        private String matchType;
        private Boolean requiresReview;
        
        // Getters and Setters omitted for brevity
    }
}
