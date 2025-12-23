package com.siar.security.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entidad Evento de Auditoría de Seguridad del Sistema SIAR
 * Registra todos los eventos de seguridad del sistema (tabla inmutable)
 */
@Entity
@Table(name = "security_audit_events", indexes = {
    @Index(name = "idx_audit_user", columnList = "userId"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_event_code", columnList = "eventCode"),
    @Index(name = "idx_audit_event_type", columnList = "eventType"),
    @Index(name = "idx_audit_severity", columnList = "severity"),
    @Index(name = "idx_audit_result", columnList = "result")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "event_id", updatable = false, nullable = false)
    private UUID eventId;

    @Column(name = "event_code", nullable = false, length = 20)
    private String eventCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private Severity severity;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "session_id")
    private UUID sessionId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "audit_event_roles",
        joinColumns = @JoinColumn(name = "event_id")
    )
    @Column(name = "role_code")
    private List<String> activeRoles;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "action", nullable = false, length = 500)
    private String action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resource", columnDefinition = "jsonb")
    private ResourceInfo resource;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, length = 20)
    private Result result;

    @Column(name = "denial_reason", length = 500)
    private String denialReason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private EventMetadata metadata;

    @Column(name = "alert_generated", nullable = false)
    @Builder.Default
    private Boolean alertGenerated = false;

    @Column(name = "alert_id")
    private UUID alertId;

    // Enums
    public enum EventType {
        LOGIN,
        LOGOUT,
        ACCESS_DENIED,
        PERMISSION_CHANGE,
        PASSWORD_CHANGE,
        USER_MANAGEMENT,
        ROLE_MANAGEMENT,
        SESSION_MANAGEMENT
    }

    public enum Severity {
        INFO,
        WARNING,
        ERROR,
        CRITICAL
    }

    public enum Result {
        SUCCESS,
        FAILURE,
        DENIED
    }

    // Nested classes for JSON fields
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceInfo {
        private String module;
        private String entity;
        private UUID entityId;
        private String action;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventMetadata {
        private UUID requestId;
        private Long processingTimeMs;
        private Object additionalInfo;
    }

    // Standard event code constants
    public static final String AUTH_LOGIN_SUCCESS = "AUTH-001";
    public static final String AUTH_LOGIN_FAILED_PASSWORD = "AUTH-002";
    public static final String AUTH_LOGIN_FAILED_LOCKED = "AUTH-003";
    public static final String AUTH_LOGIN_FAILED_USER_NOT_FOUND = "AUTH-004";
    public static final String AUTH_LOGOUT_NORMAL = "AUTH-005";
    public static final String AUTH_LOGOUT_EXPIRED = "AUTH-006";
    public static final String AUTH_LOGOUT_REVOKED = "AUTH-007";
    
    public static final String PERM_ACCESS_DENIED_NO_PERMISSION = "PERM-001";
    public static final String PERM_ACCESS_DENIED_TIME_WINDOW = "PERM-002";
    public static final String PERM_ACCESS_DENIED_IP = "PERM-003";
    public static final String PERM_PERMISSION_CHANGE = "PERM-004";
    public static final String PERM_ROLE_ASSIGNED = "PERM-005";
    
    public static final String PWD_CHANGE_BY_USER = "PWD-001";
    public static final String PWD_CHANGE_BY_ADMIN = "PWD-002";
    public static final String PWD_CHANGE_WEAK_PASSWORD = "PWD-003";

    // Business methods
    public boolean isCritical() {
        return this.severity == Severity.CRITICAL;
    }

    public boolean shouldGenerateAlert() {
        return this.severity == Severity.CRITICAL || this.severity == Severity.ERROR;
    }

    public boolean isFailure() {
        return this.result == Result.FAILURE || this.result == Result.DENIED;
    }
}
