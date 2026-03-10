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
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_configurations", indexes = {
    @Index(name = "idx_is_active", columnList = "isActive"),
    @Index(name = "idx_effective_from", columnList = "effectiveFrom")
})
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskConfiguration {
    
    @Id
    @Column(length = 50)
    private String configurationId;  // CFG-2024-001
    
    @Column(nullable = false, length = 100)
    private String configurationName;
    
    @Column(nullable = false)
    private Integer version;
    
    @Column(nullable = false)
    private LocalDateTime effectiveFrom;
    
    private LocalDateTime effectiveTo;
    
    @Type(type = "jsonb")
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode categoryWeightsJson;
    
    @Type(type = "jsonb")
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode factorWeightsJson;
    
    @Type(type = "jsonb")
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode thresholdsJson;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Column(nullable = false, length = 50)
    private String createdBy;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(length = 50)
    private String approvedBy;
    
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String changeJustification;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) isActive = false;
    }
}
