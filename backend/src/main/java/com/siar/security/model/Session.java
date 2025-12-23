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
 * Entidad Sesión del Sistema SIAR
 * Representa una sesión activa de un usuario autenticado
 */
@Entity
@Table(name = "sessions", indexes = {
    @Index(name = "idx_session_user", columnList = "userId"),
    @Index(name = "idx_session_status", columnList = "status"),
    @Index(name = "idx_session_token_hash", columnList = "tokenHash"),
    @Index(name = "idx_session_expiration", columnList = "tokenExpiration")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id", updatable = false, nullable = false)
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "session_active_roles",
        joinColumns = @JoinColumn(name = "session_id")
    )
    @Column(name = "role_code")
    private List<String> activeRoles;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "token_expiration", nullable = false)
    private LocalDateTime tokenExpiration;

    @Column(name = "refresh_token_hash", length = 64)
    private String refreshTokenHash;

    @Column(name = "refresh_token_expiration")
    private LocalDateTime refreshTokenExpiration;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE;

    @Column(name = "login_timestamp", nullable = false)
    private LocalDateTime loginTimestamp;

    @Column(name = "last_activity_timestamp", nullable = false)
    private LocalDateTime lastActivityTimestamp;

    @Column(name = "logout_timestamp")
    private LocalDateTime logoutTimestamp;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "device_info", columnDefinition = "jsonb")
    private DeviceInfo deviceInfo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private SessionMetadata metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enums
    public enum SessionStatus {
        ACTIVE,
        EXPIRED,
        REVOKED,
        LOGGED_OUT
    }

    public enum LoginMethod {
        PASSWORD,
        SSO,
        API_KEY
    }

    // Nested classes for JSON fields
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceInfo {
        private String browser;
        private String os;
        private String device;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionMetadata {
        private LoginMethod loginMethod;
        private Boolean mfaVerified;
        private Integer riskScore;
    }

    // Business methods
    public boolean isActive() {
        return this.status == SessionStatus.ACTIVE;
    }

    public boolean isExpired() {
        return this.tokenExpiration != null && this.tokenExpiration.isBefore(LocalDateTime.now());
    }

    public boolean isRefreshTokenValid() {
        return this.refreshTokenHash != null && 
               this.refreshTokenExpiration != null && 
               this.refreshTokenExpiration.isAfter(LocalDateTime.now());
    }

    public void updateActivity() {
        this.lastActivityTimestamp = LocalDateTime.now();
    }

    public void expire() {
        this.status = SessionStatus.EXPIRED;
        this.logoutTimestamp = LocalDateTime.now();
    }

    public void revoke() {
        this.status = SessionStatus.REVOKED;
        this.logoutTimestamp = LocalDateTime.now();
    }

    public void logout() {
        this.status = SessionStatus.LOGGED_OUT;
        this.logoutTimestamp = LocalDateTime.now();
    }

    public long getMinutesSinceLastActivity() {
        return java.time.Duration.between(this.lastActivityTimestamp, LocalDateTime.now()).toMinutes();
    }

    public boolean shouldExpireByInactivity(int timeoutMinutes) {
        return getMinutesSinceLastActivity() >= timeoutMinutes;
    }
}
