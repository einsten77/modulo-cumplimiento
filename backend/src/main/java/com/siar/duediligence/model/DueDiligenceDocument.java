package com.siar.duediligence.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "due_diligence_documents", indexes = {
    @Index(name = "idx_ddd_id", columnList = "documentId"),
    @Index(name = "idx_ddd_dd", columnList = "dueDiligence_id"),
    @Index(name = "idx_ddd_type", columnList = "documentType_id"),
    @Index(name = "idx_ddd_status", columnList = "approvalStatus"),
    @Index(name = "idx_ddd_expiration", columnList = "expirationDate"),
    @Index(name = "idx_ddd_current", columnList = "isCurrentVersion")
})
@Data
public class DueDiligenceDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String documentId;
    
    @Column(name = "dueDiligence_id", nullable = false)
    private Long dueDiligenceId;
    
    @Column(name = "documentType_id", nullable = false)
    private Long documentTypeId;
    
    @Column(nullable = false, length = 255)
    private String fileName;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(nullable = false, length = 100)
    private String mimeType;
    
    @Column(nullable = false, length = 100)
    private String fileHash;
    
    @Column(nullable = false, length = 500)
    private String storageLocation;
    
    @Column(nullable = false)
    private Integer version;
    
    @Column(nullable = false)
    private Boolean isCurrentVersion;
    
    private LocalDate expirationDate;
    
    @Column(nullable = false)
    private LocalDateTime uploadDate;
    
    @Column(nullable = false)
    private Long uploadedBy;
    
    private LocalDateTime lastModifiedDate;
    private Long lastModifiedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DocumentApprovalStatus approvalStatus;
    
    private Long approvedBy;
    private LocalDateTime approvalDate;
    
    @Column(columnDefinition = "text")
    private String approvalNotes;
    
    private Long replacesDocumentId;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "metadata")
    private String metadataJson;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    private Long version;
}
