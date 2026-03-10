package com.siar.risk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_factors", indexes = {
    @Index(name = "idx_factor_code", columnList = "factorCode", unique = true),
    @Index(name = "idx_factor_category", columnList = "factorCategory"),
    @Index(name = "idx_is_active", columnList = "isActive")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskFactor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long factorId;
    
    @Column(nullable = false, unique = true, length = 50)
    private String factorCode;
    
    @Column(nullable = false, length = 100)
    private String factorName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RiskCategory factorCategory;
    
    @Column(columnDefinition = "TEXT")
    private String factorDescription;
    
    @Column(nullable = false)
    private Integer scaleMin;  // Typically 0
    
    @Column(nullable = false)
    private Integer scaleMax;  // Typically 5
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Column(nullable = false)
    private Boolean requiresJustification;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (requiresJustification == null) requiresJustification = false;
        if (scaleMin == null) scaleMin = 0;
        if (scaleMax == null) scaleMax = 5;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
