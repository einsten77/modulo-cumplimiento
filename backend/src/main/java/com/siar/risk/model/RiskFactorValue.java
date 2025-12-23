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
@Table(name = "risk_factor_values", indexes = {
    @Index(name = "idx_evaluation_id", columnList = "evaluationId"),
    @Index(name = "idx_factor_id", columnList = "factorId")
})
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskFactorValue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long factorValueId;
    
    @Column(nullable = false, length = 50)
    private String evaluationId;
    
    @Column(nullable = false)
    private Long factorId;
    
    @Column(nullable = false)
    private Integer value;  // 0-5
    
    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private RiskValueLabel label;
    
    @Column(columnDefinition = "TEXT")
    private String justification;
    
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode evidenceAttachments;
    
    @Column(nullable = false, length = 50)
    private String assignedBy;
    
    @Column(nullable = false)
    private LocalDateTime assignedAt;
    
    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
    }
}
