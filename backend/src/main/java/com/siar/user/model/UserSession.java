package com.siar.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Sesiones activas e históricas de usuarios
 */
@Entity
@Table(name = "user_sessions", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_is_active", columnList = "is_active"),
    @Index(name = "idx_login_at", columnList = "login_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "session_id", columnDefinition = "VARCHAR(36)")
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "active_role", length = 10)
    private String activeRole;

    @Column(name = "login_at", nullable = false)
    private LocalDateTime loginAt;

    @Column(name = "logout_at")
    private LocalDateTime logoutAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "login_method", length = 20)
    private LoginMethod loginMethod;

    @PrePersist
    protected void onCreate() {
        if (loginAt == null) {
            loginAt = LocalDateTime.now();
        }
        if (lastActivityAt == null) {
            lastActivityAt = LocalDateTime.now();
        }
    }

    /**
     * Calcula la duración de la sesión en segundos
     */
    public Long getSessionDuration() {
        LocalDateTime endTime = logoutAt != null ? logoutAt : LocalDateTime.now();
        return ChronoUnit.SECONDS.between(loginAt, endTime);
    }

    /**
     * Registra actividad en la sesión
     */
    public void recordActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }

    /**
     * Cierra la sesión
     */
    public void close() {
        this.logoutAt = LocalDateTime.now();
        this.isActive = false;
    }

    /**
     * Verifica si la sesión ha expirado por inactividad (8 horas)
     */
    public boolean isExpired() {
        if (!isActive) {
            return true;
        }
        
        if (lastActivityAt == null) {
            return false;
        }
        
        LocalDateTime expirationTime = lastActivityAt.plusHours(8);
        return LocalDateTime.now().isAfter(expirationTime);
    }
}
