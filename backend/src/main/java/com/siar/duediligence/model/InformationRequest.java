package com.siar.duediligence.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "information_requests", indexes = {
    @Index(name = "idx_ir_dd", columnList = "dueDiligence_id"),
    @Index(name = "idx_ir_status", columnList = "status"),
    @Index(name = "idx_ir_due", columnList = "dueDate")
})
@Data
public class InformationRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String requestId;
    
    @Column(name = "dueDiligence_id", nullable = false)
    private Long dueDiligenceId;
    
    @Column(nullable = false)
    private LocalDateTime requestDate;
    
    @Column(nullable = false)
    private Long requestedBy;
    
    @Column(nullable = false, columnDefinition = "text")
    private String description;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "document_type_ids")
    private String documentTypeIdsJson;  // ["DOC-001", "DOC-002"]
    
    @Column(nullable = false)
    private LocalDate dueDate;
    
    @Column(nullable = false, length = 30)
    private String status;  // PENDIENTE, COMPLETADA, VENCIDA
    
    private LocalDateTime responseDate;
    private Long respondedBy;
    
    @Column(columnDefinition = "text")
    private String responseNotes;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Version
    private Long version;
}
