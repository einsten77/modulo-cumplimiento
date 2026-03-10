package com.siar.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Catálogo de roles del sistema SIAR
 * Los roles son predefinidos y no pueden ser modificados
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @Column(name = "role_code", length = 10)
    private String roleCode; // ROL-001 a ROL-011

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false, length = 20)
    private RoleType roleType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_supervisory", nullable = false)
    @Builder.Default
    private Boolean isSupervisory = false;

    @Column(name = "is_read_only", nullable = false)
    @Builder.Default
    private Boolean isReadOnly = false;

    @Column(name = "is_approver", nullable = false)
    @Builder.Default
    private Boolean isApprover = false;

    @Column(name = "requires_temporal_access", nullable = false)
    @Builder.Default
    private Boolean requiresTemporalAccess = false;

    @Column(name = "max_concurrent_roles", nullable = false)
    @Builder.Default
    private Integer maxConcurrentRoles = 3;

    @Column(name = "is_system_role", nullable = false)
    @Builder.Default
    private Boolean isSystemRole = true;

    @Column(name = "can_be_modified", nullable = false)
    @Builder.Default
    private Boolean canBeModified = false;

    // Permisos almacenados como JSON
    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    // Relaciones
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserRole> userRoles = new ArrayList<>();

    /**
     * Verifica si el rol es el Oficial de Cumplimiento
     */
    public boolean isComplianceOfficer() {
        return "ROL-001".equals(this.roleCode);
    }

    /**
     * Verifica si el rol es externo (auditor o inspector)
     */
    public boolean isExternalRole() {
        return this.roleType == RoleType.EXTERNAL;
    }
}
