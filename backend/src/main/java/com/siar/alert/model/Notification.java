package com.siar.alert.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entidad Notification - Notificaciones enviadas a usuarios sobre alertas
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_alert", columnList = "alert_id"),
    @Index(name = "idx_notification_recipient", columnList = "recipient_user_id"),
    @Index(name = "idx_notification_sent_at", columnList = "sent_at"),
    @Index(name = "idx_notification_status", columnList = "delivery_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id", nullable = false, updatable = false)
    private UUID notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false, updatable = false)
    private Alert alert;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, updatable = false, length = 20)
    private NotificationType notificationType;

    @Column(name = "recipient_user_id", nullable = false, updatable = false, length = 50)
    private String recipientUserId;

    @Column(name = "recipient_email", length = 100, updatable = false)
    private String recipientEmail;

    @Column(name = "subject", nullable = false, updatable = false, length = 200)
    private String subject;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false, updatable = false)
    private String message;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 20)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDIENTE;

    @Column(name = "delivery_error", columnDefinition = "TEXT")
    private String deliveryError;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "read_by_user")
    @Builder.Default
    private Boolean readByUser = false;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (sentAt == null) {
            sentAt = Instant.now();
        }
    }

    /**
     * Marca la notificación como leída
     */
    public void markAsRead() {
        this.readByUser = true;
        this.readAt = Instant.now();
    }

    /**
     * Incrementa el contador de reintentos
     */
    public void incrementRetryCount() {
        this.retryCount++;
    }
}
