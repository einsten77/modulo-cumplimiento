package com.siar.alert.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entidad AlertTracking - Registro inmutable de seguimiento de alertas
 * Cada acción realizada sobre una alerta genera un registro de tracking
 */
@Entity
@Table(name = "alert_tracking", indexes = {
    @Index(name = "idx_tracking_alert", columnList = "alert_id"),
    @Index(name = "idx_tracking_performed_at", columnList = "performed_at"),
    @Index(name = "idx_tracking_performed_by", columnList = "performed_by")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tracking_id", nullable = false, updatable = false)
    private UUID trackingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false, updatable = false)
    private Alert alert;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, updatable = false, length = 30)
    private TrackingActionType actionType;

    @Column(name = "action_description", columnDefinition = "TEXT", nullable = false, updatable = false)
    private String actionDescription;

    // Cambios de estado
    @Column(name = "previous_status", length = 20, updatable = false)
    private String previousStatus;

    @Column(name = "new_status", length = 20, updatable = false)
    private String newStatus;

    // Cambios de asignación
    @Column(name = "previous_assigned_to", length = 50, updatable = false)
    private String previousAssignedTo;

    @Column(name = "new_assigned_to", length = 50, updatable = false)
    private String newAssignedTo;

    // Comentario del usuario
    @Column(name = "comment", columnDefinition = "TEXT", updatable = false)
    private String comment;

    // Evidencia
    @Column(name = "evidence_attached", nullable = false, updatable = false)
    @Builder.Default
    private Boolean evidenceAttached = false;

    @Column(name = "evidence_reference", length = 200, updatable = false)
    private String evidenceReference;

    // Acción tomada
    @Column(name = "action_taken", columnDefinition = "TEXT", updatable = false)
    private String actionTaken;

    // Usuario que realizó la acción
    @Column(name = "performed_by", nullable = false, updatable = false, length = 50)
    private String performedBy;

    @Column(name = "performed_at", nullable = false, updatable = false)
    private Instant performedAt;

    // Información técnica para auditoría
    @Column(name = "ip_address", length = 45, updatable = false)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT", updatable = false)
    private String userAgent;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (performedAt == null) {
            performedAt = Instant.now();
        }
    }

    /**
     * Los registros de tracking NO pueden modificarse ni eliminarse
     * Son inmutables por diseño regulatorio
     */
}
