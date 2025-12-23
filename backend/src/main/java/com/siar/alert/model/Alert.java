package com.siar.alert.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Entidad Alert - Representa una alerta de cumplimiento en el sistema SIAR
 * Las alertas son inmutables en términos de eliminación - nunca se eliminan, solo se cierran
 */
@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_code", columnList = "alert_code"),
    @Index(name = "idx_alert_status", columnList = "status"),
    @Index(name = "idx_alert_level", columnList = "alert_level"),
    @Index(name = "idx_alert_dossier", columnList = "dossier_id"),
    @Index(name = "idx_alert_assigned_to", columnList = "assigned_to"),
    @Index(name = "idx_alert_detected_at", columnList = "detected_at"),
    @Index(name = "idx_alert_module", columnList = "origin_module")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "alert_id", nullable = false, updatable = false)
    private UUID alertId;

    @Column(name = "alert_code", nullable = false, length = 20)
    private String alertCode; // ALT-001, ALT-002, etc.

    @Column(name = "alert_type", nullable = false, length = 50)
    private String alertType; // Nombre descriptivo del tipo

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_level", nullable = false, length = 20)
    private AlertLevel alertLevel;

    @Column(name = "origin_module", nullable = false, length = 50)
    private String originModule; // DOSSIER, RISK, DUE_DILIGENCE, SCREENING, PEP

    // Expediente asociado
    @Column(name = "dossier_id", nullable = false)
    private UUID dossierId;

    @Column(name = "entity_type", length = 50)
    private String entityType; // CLIENT, INTERMEDIARY, etc.

    @Column(name = "entity_name", length = 200)
    private String entityName;

    @Column(name = "entity_identification", length = 50)
    private String entityIdentification;

    // Estado de la alerta
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AlertStatus status = AlertStatus.NUEVA;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    // Detección
    @Column(name = "detected_at", nullable = false, updatable = false)
    private Instant detectedAt;

    @Column(name = "detected_by", nullable = false, updatable = false, length = 50)
    private String detectedBy; // Usuario o SYSTEM

    // Asignación
    @Column(name = "assigned_to", length = 50)
    private String assignedTo; // userId del usuario asignado

    @Column(name = "assigned_at")
    private Instant assignedAt;

    // Atención
    @Column(name = "attended_by", length = 50)
    private String attendedBy;

    @Column(name = "attended_at")
    private Instant attendedAt;

    // Cierre
    @Column(name = "closed_by", length = 50)
    private String closedBy;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "closure_reason", columnDefinition = "TEXT")
    private String closureReason;

    // Acción requerida
    @Column(name = "requires_action", nullable = false)
    @Builder.Default
    private Boolean requiresAction = false;

    @Column(name = "action_deadline")
    private LocalDate actionDeadline;

    @Column(name = "priority_score", nullable = false)
    @Builder.Default
    private Integer priorityScore = 50; // 0-100

    // Metadata adicional en formato JSON
    @Type(JsonType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    // Entidad relacionada (opcional)
    @Column(name = "related_entity_id", length = 50)
    private String relatedEntityId;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    // Notificación
    @Column(name = "notification_sent", nullable = false)
    @Builder.Default
    private Boolean notificationSent = false;

    @Column(name = "notification_sent_at")
    private Instant notificationSentAt;

    // Escalación
    @Column(name = "escalated", nullable = false)
    @Builder.Default
    private Boolean escalated = false;

    @Column(name = "escalated_at")
    private Instant escalatedAt;

    @Column(name = "escalated_to", length = 50)
    private String escalatedTo;

    @Column(name = "escalation_reason", columnDefinition = "TEXT")
    private String escalationReason;

    // Auditoría y control
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    // Relaciones
    @OneToMany(mappedBy = "alert", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AlertTracking> trackingHistory = new ArrayList<>();

    @OneToMany(mappedBy = "alert", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (detectedAt == null) {
            detectedAt = Instant.now();
        }
        if (status == null) {
            status = AlertStatus.NUEVA;
        }
    }

    // Métodos de utilidad

    /**
     * Verifica si la alerta está vencida (deadline sobrepasado)
     */
    public boolean isOverdue() {
        if (actionDeadline == null || status == AlertStatus.CERRADA) {
            return false;
        }
        return LocalDate.now().isAfter(actionDeadline);
    }

    /**
     * Verifica si la alerta está próxima a vencer (menos de 24 horas)
     */
    public boolean isDeadlineNear() {
        if (actionDeadline == null || status == AlertStatus.CERRADA) {
            return false;
        }
        return LocalDate.now().plusDays(1).isAfter(actionDeadline);
    }

    /**
     * Calcula los días transcurridos desde la detección
     */
    public long getDaysSinceDetection() {
        return java.time.Duration.between(detectedAt, Instant.now()).toDays();
    }

    /**
     * Verifica si puede ser cerrada por el usuario
     */
    public boolean canBeClosedBy(String userId, String userRole) {
        // Solo puede cerrar si está asignada al usuario o es Oficial de Cumplimiento
        if (status == AlertStatus.CERRADA) {
            return false;
        }
        
        return userId.equals(assignedTo) || 
               "OFICIAL_CUMPLIMIENTO".equals(userRole) ||
               "GERENTE_CUMPLIMIENTO".equals(userRole);
    }

    /**
     * Verifica si debe escalarse automáticamente
     */
    public boolean shouldAutoEscalate() {
        if (status == AlertStatus.CERRADA || escalated) {
            return false;
        }

        long hoursSinceDetection = java.time.Duration.between(detectedAt, Instant.now()).toHours();

        // Reglas de escalación automática
        return switch (alertLevel) {
            case CRÍTICA -> hoursSinceDetection > 24 && status == AlertStatus.NUEVA;
            case ALTA -> hoursSinceDetection > 48 && status == AlertStatus.NUEVA;
            case MEDIA -> hoursSinceDetection > 72 && status == AlertStatus.NUEVA;
            case BAJA -> false; // No se escala automáticamente
        };
    }

    /**
     * Agrega un seguimiento a la alerta
     */
    public void addTracking(AlertTracking tracking) {
        trackingHistory.add(tracking);
        tracking.setAlert(this);
    }

    /**
     * Agrega una notificación
     */
    public void addNotification(Notification notification) {
        notifications.add(notification);
        notification.setAlert(this);
    }
}
