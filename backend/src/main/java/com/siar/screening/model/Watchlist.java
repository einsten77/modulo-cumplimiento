package com.siar.screening.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "watchlist", indexes = {
    @Index(name = "idx_watchlist_code", columnList = "code", unique = true),
    @Index(name = "idx_watchlist_active", columnList = "is_active"),
    @Index(name = "idx_watchlist_priority", columnList = "priority")
})
public class Watchlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(name = "source", nullable = false, length = 100)
    private String source;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "list_type", nullable = false, length = 50)
    private ListType listType;
    
    @Column(name = "jurisdiction", length = 100)
    private String jurisdiction;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "source_url", length = 500)
    private String sourceUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "update_frequency", nullable = false, length = 20)
    private UpdateFrequency updateFrequency;
    
    @Column(name = "last_update_date")
    private Instant lastUpdateDate;
    
    @Column(name = "next_scheduled_update")
    private Instant nextScheduledUpdate;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority;
    
    @Column(name = "total_entries")
    private Integer totalEntries;
    
    @Column(name = "version", length = 50)
    private String version;
    
    @Column(name = "checksum_md5", length = 32)
    private String checksumMd5;
    
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public ListType getListType() {
        return listType;
    }
    
    public void setListType(ListType listType) {
        this.listType = listType;
    }
    
    public String getJurisdiction() {
        return jurisdiction;
    }
    
    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSourceUrl() {
        return sourceUrl;
    }
    
    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }
    
    public UpdateFrequency getUpdateFrequency() {
        return updateFrequency;
    }
    
    public void setUpdateFrequency(UpdateFrequency updateFrequency) {
        this.updateFrequency = updateFrequency;
    }
    
    public Instant getLastUpdateDate() {
        return lastUpdateDate;
    }
    
    public void setLastUpdateDate(Instant lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
    }
    
    public Instant getNextScheduledUpdate() {
        return nextScheduledUpdate;
    }
    
    public void setNextScheduledUpdate(Instant nextScheduledUpdate) {
        this.nextScheduledUpdate = nextScheduledUpdate;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Priority getPriority() {
        return priority;
    }
    
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
    public Integer getTotalEntries() {
        return totalEntries;
    }
    
    public void setTotalEntries(Integer totalEntries) {
        this.totalEntries = totalEntries;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public String getChecksumMd5() {
        return checksumMd5;
    }
    
    public void setChecksumMd5(String checksumMd5) {
        this.checksumMd5 = checksumMd5;
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
