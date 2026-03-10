package com.siar.risk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_alerts", indexes = {
    @Index(name = "idx_evaluation_id", columnList = "evaluationId"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_assigned_to", columnList = "assignedTo"),
    @Index(name = "idx_generated_at", columnList = "generatedAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertId;
    
    @Column(nullable = false, length = 50)
    private String evaluationId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RiskAlertType alertType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private AlertSeverity severity;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String alertMessage;
    
    @Column(nullable = false)
    private LocalDateTime generatedAt;
    
    @Column(length = 50)
    private String assignedTo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private AlertStatus status;
    
    @Column(length = 50)
    private String resolvedBy;
    
    private LocalDateTime resolvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;
    
    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
        if (status == null) status = AlertStatus.OPEN;
    }
}
