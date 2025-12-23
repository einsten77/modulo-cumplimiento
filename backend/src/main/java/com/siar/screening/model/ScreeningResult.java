package com.siar.screening.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "screening_result", indexes = {
    @Index(name = "idx_result_screening", columnList = "screening_id"),
    @Index(name = "idx_result_watchlist", columnList = "watchlist_id")
})
public class ScreeningResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "screening_id", nullable = false)
    private Long screeningId;
    
    @Column(name = "watchlist_id", nullable = false)
    private Long watchlistId;
    
    @Column(name = "watchlist_name", nullable = false, length = 200)
    private String watchlistName;
    
    @Column(name = "total_entries_checked", nullable = false)
    private Integer totalEntriesChecked;
    
    @Column(name = "matches_found", nullable = false)
    private Integer matchesFound;
    
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;
    
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
    
    public Long getScreeningId() {
        return screeningId;
    }
    
    public void setScreeningId(Long screeningId) {
        this.screeningId = screeningId;
    }
    
    public Long getWatchlistId() {
        return watchlistId;
    }
    
    public void setWatchlistId(Long watchlistId) {
        this.watchlistId = watchlistId;
    }
    
    public String getWatchlistName() {
        return watchlistName;
    }
    
    public void setWatchlistName(String watchlistName) {
        this.watchlistName = watchlistName;
    }
    
    public Integer getTotalEntriesChecked() {
        return totalEntriesChecked;
    }
    
    public void setTotalEntriesChecked(Integer totalEntriesChecked) {
        this.totalEntriesChecked = totalEntriesChecked;
    }
    
    public Integer getMatchesFound() {
        return matchesFound;
    }
    
    public void setMatchesFound(Integer matchesFound) {
        this.matchesFound = matchesFound;
    }
    
    public Long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public void setExecutionTimeMs(Long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
