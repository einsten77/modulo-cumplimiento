package com.siar.dossier.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonType;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "dossier_change_history", indexes = {
    @Index(name = "idx_change_dossier_id", columnList = "dossier_uuid"),
    @Index(name = "idx_change_timestamp", columnList = "timestamp"),
    @Index(name = "idx_change_performed_by", columnList = "performed_by")
})
@Data
public class DossierChangeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "change_uuid", nullable = false, updatable = false)
    private UUID changeUuid;
    
    @Column(name = "change_id", nullable = false, unique = true, length = 50)
    private String changeId; // CHG-2024-00001
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_uuid", nullable = false, updatable = false)
    private Dossier dossier;
    
    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 50, updatable = false)
    private ChangeType changeType;
    
    @Column(name = "performed_by", nullable = false, length = 100, updatable = false)
    private String performedBy;
    
    @Column(name = "performed_by_role", nullable = false, length = 50, updatable = false)
    private String performedByRole;
    
    @Column(name = "ip_address", length = 45, updatable = false)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500, updatable = false)
    private String userAgent;
    
    @Column(name = "description", columnDefinition = "TEXT", updatable = false)
    private String description;
    
    @Type(JsonType.class)
    @Column(name = "affected_sections", columnDefinition = "jsonb", updatable = false)
    private List<String> affectedSections;
    
    @Type(JsonType.class)
    @Column(name = "affected_fields", columnDefinition = "jsonb", updatable = false)
    private List<String> affectedFields;
    
    @Type(JsonType.class)
    @Column(name = "previous_values", columnDefinition = "jsonb", updatable = false)
    private Map<String, Object> previousValues;
    
    @Type(JsonType.class)
    @Column(name = "new_values", columnDefinition = "jsonb", updatable = false)
    private Map<String, Object> newValues;
    
    @Column(name = "requires_approval", nullable = false, updatable = false)
    private Boolean requiresApproval = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 50)
    private ApprovalStatus approvalStatus;
    
    @Column(name = "approved_by", length = 100)
    private String approvedBy;
    
    @Column(name = "approved_at")
    private Instant approvedAt;
    
    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;
    
    @PrePersist
    protected void onCreate() {
        timestamp = Instant.now();
    }
}

enum ChangeType {
    CREATION,
    UPDATE,
    STATUS_CHANGE,
    DOCUMENT_UPLOAD,
    DOCUMENT_REMOVAL,
    APPROVAL,
    REJECTION,
    DELETION
}

enum ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED
}
