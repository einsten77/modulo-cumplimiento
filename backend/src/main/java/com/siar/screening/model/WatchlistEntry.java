package com.siar.screening.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "watchlist_entry", indexes = {
    @Index(name = "idx_entry_watchlist", columnList = "watchlist_id"),
    @Index(name = "idx_entry_entity_type", columnList = "entity_type"),
    @Index(name = "idx_entry_active", columnList = "is_active")
})
public class WatchlistEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "watchlist_id", nullable = false)
    private Long watchlistId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private EntityType entityType;
    
    @Column(name = "name", nullable = false, length = 500)
    private String name;
    
    @Type(JsonType.class)
    @Column(name = "aliases", columnDefinition = "jsonb")
    private List<String> aliases;
    
    @Column(name = "document", length = 100)
    private String document;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "nationality", length = 3)
    private String nationality;
    
    @Column(name = "country", length = 100)
    private String country;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "sanction_program", length = 100)
    private String sanctionProgram;
    
    @Column(name = "sanction_date")
    private LocalDate sanctionDate;
    
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
    
    @Type(JsonType.class)
    @Column(name = "additional_info", columnDefinition = "jsonb")
    private Map<String, Object> additionalInfo;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
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
    
    public Long getWatchlistId() {
        return watchlistId;
    }
    
    public void setWatchlistId(Long watchlistId) {
        this.watchlistId = watchlistId;
    }
    
    public EntityType getEntityType() {
        return entityType;
    }
    
    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public List<String> getAliases() {
        return aliases;
    }
    
    public void setAliases(List<String> aliases) {
        this.aliases = aliases;
    }
    
    public String getDocument() {
        return document;
    }
    
    public void setDocument(String document) {
        this.document = document;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getNationality() {
        return nationality;
    }
    
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getSanctionProgram() {
        return sanctionProgram;
    }
    
    public void setSanctionProgram(String sanctionProgram) {
        this.sanctionProgram = sanctionProgram;
    }
    
    public LocalDate getSanctionDate() {
        return sanctionDate;
    }
    
    public void setSanctionDate(LocalDate sanctionDate) {
        this.sanctionDate = sanctionDate;
    }
    
    public String getRemarks() {
        return remarks;
    }
    
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    
    public Map<String, Object> getAdditionalInfo() {
        return additionalInfo;
    }
    
    public void setAdditionalInfo(Map<String, Object> additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
