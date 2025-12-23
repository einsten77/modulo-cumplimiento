package com.siar.duediligence.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_history", indexes = {
    @Index(name = "idx_dh_document", columnList = "document_id"),
    @Index(name = "idx_dh_date", columnList = "changeDate"),
    @Index(name = "idx_dh_user", columnList = "changedBy")
})
@Data
public class DocumentHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "document_id", nullable = false)
    private Long documentId;
    
    @Column(nullable = false)
    private LocalDateTime changeDate;
    
    @Column(nullable = false)
    private Long changedBy;
    
    @Column(nullable = false, length = 50)
    private String changeType;  // UPLOADED, APPROVED, REJECTED, EXPIRED, REPLACED
    
    @Column(length = 50)
    private String previousStatus;
    
    @Column(nullable = false, length = 50)
    private String newStatus;
    
    @Column(columnDefinition = "text")
    private String notes;
    
    @Column(length = 50)
    private String ipAddress;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
