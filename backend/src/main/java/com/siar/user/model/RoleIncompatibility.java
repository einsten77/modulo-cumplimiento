package com.siar.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

/**
 * Define incompatibilidades entre roles por segregación de funciones
 */
@Entity
@Table(name = "role_incompatibilities", indexes = {
    @Index(name = "idx_role_codes", columnList = "role_code_1, role_code_2"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleIncompatibility {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "incompatibility_id", columnDefinition = "VARCHAR(36)")
    private String incompatibilityId;

    @Column(name = "role_code_1", nullable = false, length = 10)
    private String roleCode1;

    @Column(name = "role_code_2", nullable = false, length = 10)
    private String roleCode2;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private IncompatibilitySeverity severity;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * Verifica si una combinación de roles es incompatible con esta regla
     */
    public boolean isIncompatibleWith(String role1, String role2) {
        return isActive && (
            (roleCode1.equals(role1) && roleCode2.equals(role2)) ||
            (roleCode1.equals(role2) && roleCode2.equals(role1))
        );
    }
}
