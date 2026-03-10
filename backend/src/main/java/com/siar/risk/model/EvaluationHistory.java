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
@Table(name = "evaluation_history", indexes = {
    @Index(name = "idx_evaluation_id", columnList = "evaluationId"),
    @Index(name = "idx_changed_at", columnList = "changedAt"),
    @Index(name = "idx_change_type", columnList = "changeType")
})
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;
    
    @Column(nullable = false, length = 50)
    private String evaluationId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HistoryChangeType changeType;
    
    @Column(nullable = false, length = 50)
    private String changedBy;
    
    @Column(nullable = false)
    private LocalDateTime changedAt;
    
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode previousStateJson;
    
    @Type(type = "jsonb")
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode newStateJson;
    
    @Column(columnDefinition = "TEXT")
    private String changeJustification;
    
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode affectedFields;
    
    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
