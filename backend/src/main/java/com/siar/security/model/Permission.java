package com.siar.security.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad Permiso del Sistema SIAR
 * Define permisos granulares en formato module:entity:action
 */
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_code", columnList = "permissionCode", unique = true),
    @Index(name = "idx_permission_module", columnList = "module"),
    @Index(name = "idx_permission_entity", columnList = "entity"),
    @Index(name = "idx_permission_action", columnList = "action")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "permission_id", updatable = false, nullable = false)
    private UUID permissionId;

    @Column(name = "permission_code", unique = true, nullable = false, length = 100)
    private String permissionCode;

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity", nullable = false, length = 50)
    private String entity;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private PermissionAction action;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "requires_ownership", nullable = false)
    @Builder.Default
    private Boolean requiresOwnership = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "permission_allowed_statuses",
        joinColumns = @JoinColumn(name = "permission_id")
    )
    @Column(name = "status")
    @Builder.Default
    private List<String> allowedStatuses = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private PermissionMetadata metadata;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    // Enums
    public enum PermissionAction {
        CREATE,
        READ,
        UPDATE,
        DELETE,
        APPROVE,
        EXPORT
    }

    // Nested class for metadata
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionMetadata {
        private CriticalLevel criticalLevel;
        private Boolean requiresJustification;
        private Boolean generateAlert;
    }

    public enum CriticalLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    // Business methods
    public boolean isActive() {
        return this.active != null && this.active;
    }

    public boolean requiresOwnership() {
        return this.requiresOwnership != null && this.requiresOwnership;
    }

    public boolean isStatusAllowed(String status) {
        if (this.allowedStatuses == null || this.allowedStatuses.isEmpty()) {
            return true; // No restriction
        }
        return this.allowedStatuses.contains(status);
    }

    public boolean shouldGenerateAlert() {
        return this.metadata != null && 
               this.metadata.getGenerateAlert() != null && 
               this.metadata.getGenerateAlert();
    }

    public boolean requiresJustification() {
        return this.metadata != null && 
               this.metadata.getRequiresJustification() != null && 
               this.metadata.getRequiresJustification();
    }

    public CriticalLevel getCriticalLevel() {
        if (this.metadata != null && this.metadata.getCriticalLevel() != null) {
            return this.metadata.getCriticalLevel();
        }
        return CriticalLevel.LOW;
    }
}
