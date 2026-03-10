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

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad Rol del Sistema SIAR
 * Define roles con permisos y restricciones asociadas
 */
@Entity
@Table(name = "roles", indexes = {
    @Index(name = "idx_role_code", columnList = "roleCode", unique = true),
    @Index(name = "idx_role_type", columnList = "roleType"),
    @Index(name = "idx_role_active", columnList = "active")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "role_id", updatable = false, nullable = false)
    private UUID roleId;

    @Column(name = "role_code", unique = true, nullable = false, length = 50)
    private String roleCode;

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false, length = 30)
    private RoleType roleType;

    @Column(name = "is_system_role", nullable = false)
    @Builder.Default
    private Boolean isSystemRole = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id"),
        indexes = {
            @Index(name = "idx_role_permissions_role", columnList = "role_id"),
            @Index(name = "idx_role_permissions_permission", columnList = "permission_id")
        }
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private RoleMetadata metadata;

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
    public enum RoleType {
        INTERNAL_OPERATIONAL,
        INTERNAL_CONTROL,
        EXTERNAL
    }

    // Nested classes for metadata
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleMetadata {
        private Boolean requiresApproval;
        private Integer maxConcurrentSessions;
        private Integer sessionTimeoutMinutes;
        private List<String> allowedIpRanges;
        private List<TimeWindow> allowedTimeWindows;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeWindow {
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    // Business methods
    public Set<String> getPermissionCodes() {
        Set<String> permissionCodes = new HashSet<>();
        for (Permission permission : this.permissions) {
            if (permission.isActive()) {
                permissionCodes.add(permission.getPermissionCode());
            }
        }
        return permissionCodes;
    }

    public boolean hasPermission(String permissionCode) {
        return getPermissionCodes().contains(permissionCode);
    }

    public boolean isActive() {
        return this.active != null && this.active;
    }

    public Integer getSessionTimeoutMinutes() {
        if (this.metadata != null && this.metadata.getSessionTimeoutMinutes() != null) {
            return this.metadata.getSessionTimeoutMinutes();
        }
        return 30; // default 30 minutes
    }

    public Integer getMaxConcurrentSessions() {
        if (this.metadata != null && this.metadata.getMaxConcurrentSessions() != null) {
            return this.metadata.getMaxConcurrentSessions();
        }
        return 3; // default 3 concurrent sessions
    }

    public boolean isAccessAllowedFromIp(String ipAddress) {
        if (this.metadata == null || this.metadata.getAllowedIpRanges() == null || this.metadata.getAllowedIpRanges().isEmpty()) {
            return true; // No restriction
        }
        
        // Simple IP range checking (can be enhanced with CIDR notation support)
        for (String allowedRange : this.metadata.getAllowedIpRanges()) {
            if (ipAddress.matches(allowedRange)) {
                return true;
            }
        }
        return false;
    }

    public boolean isAccessAllowedAtTime(LocalDateTime timestamp) {
        if (this.metadata == null || this.metadata.getAllowedTimeWindows() == null || this.metadata.getAllowedTimeWindows().isEmpty()) {
            return true; // No restriction
        }

        DayOfWeek day = timestamp.getDayOfWeek();
        LocalTime time = timestamp.toLocalTime();

        for (TimeWindow window : this.metadata.getAllowedTimeWindows()) {
            if (window.getDayOfWeek() == day) {
                if (!time.isBefore(window.getStartTime()) && !time.isAfter(window.getEndTime())) {
                    return true;
                }
            }
        }
        return false;
    }
}
