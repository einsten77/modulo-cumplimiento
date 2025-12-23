package com.siar.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

/**
 * Asignación de roles a usuarios
 * Relación muchos-a-muchos entre User y Role con atributos adicionales
 */
@Entity
@Table(name = "user_roles", indexes = {
    @Index(name = "idx_user_role", columnList = "user_id, role_code"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "user_role_id", columnDefinition = "VARCHAR(36)")
    private String userRoleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_code", nullable = false)
    private Role role;

    @Column(name = "assigned_by", length = 36)
    private String assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "assignment_reason", columnDefinition = "TEXT")
    private String assignmentReason;

    @Column(name = "approved_by", length = 36)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "revoked_by", length = 36)
    private String revokedBy;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revocation_reason", columnDefinition = "TEXT")
    private String revocationReason;

    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
        if (validFrom == null) {
            validFrom = LocalDateTime.now();
        }
    }

    /**
     * Verifica si la asignación de rol es válida actualmente
     */
    public boolean isCurrentlyValid() {
        if (!isActive) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        if (validFrom != null && now.isBefore(validFrom)) {
            return false;
        }
        
        if (validUntil != null && now.isAfter(validUntil)) {
            return false;
        }
        
        return true;
    }

    /**
     * Revoca la asignación de rol
     */
    public void revoke(String revokedByUserId, String reason) {
        this.isActive = false;
        this.revokedBy = revokedByUserId;
        this.revokedAt = LocalDateTime.now();
        this.revocationReason = reason;
    }
}
