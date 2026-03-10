package com.siar.alert.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entidad AlertType - Catálogo maestro de tipos de alertas parametrizables
 */
@Entity
@Table(name = "alert_types", indexes = {
    @Index(name = "idx_alert_type_code", columnList = "alert_code", unique = true),
    @Index(name = "idx_alert_type_active", columnList = "active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "alert_type_id", nullable = false, updatable = false)
    private UUID alertTypeId;

    @Column(name = "alert_code", nullable = false, unique = true, length = 20)
    private String alertCode; // ALT-001, ALT-002, etc.

    @Column(name = "alert_name", nullable = false, length = 100)
    private String alertName;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_level", nullable = false, length = 20)
    private AlertLevel alertLevel;

    @Column(name = "origin_module", nullable = false, length = 50)
    private String originModule;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "requires_action", nullable = false)
    @Builder.Default
    private Boolean requiresAction = true;

    @Column(name = "default_deadline_days")
    private Integer defaultDeadlineDays;

    @Column(name = "auto_assignment_rule", length = 50)
    private String autoAssignmentRule; // OFICIAL_CUMPLIMIENTO, ANALISTA_CUMPLIMIENTO, etc.

    @Column(name = "notification_template", length = 50)
    private String notificationTemplate;

    @Column(name = "escalation_hours")
    private Integer escalationHours; // Horas para escalación automática

    // Auditoría
    @Column(name = "created_by", nullable = false, updatable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "modified_by", length = 50)
    private String modifiedBy;

    @Column(name = "modified_at")
    private Instant modifiedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        modifiedAt = Instant.now();
    }
}
