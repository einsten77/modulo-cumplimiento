package com.siar.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

/**
 * Historial inmutable de cambios realizados a usuarios
 */
@Entity
@Table(name = "user_change_history", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_change_type", columnList = "change_type"),
    @Index(name = "idx_changed_at", columnList = "changed_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserChangeHistory {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "history_id", columnDefinition = "VARCHAR(36)")
    private String historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 50)
    private ChangeType changeType;

    @Column(name = "changed_by", length = 36)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Column(name = "field_changed", length = 100)
    private String fieldChanged;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "session_id", length = 36)
    private String sessionId;

    @Column(name = "is_approval_required")
    private Boolean isApprovalRequired;

    @Column(name = "approved_by", length = 36)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approval_comment", columnDefinition = "TEXT")
    private String approvalComment;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }
}
