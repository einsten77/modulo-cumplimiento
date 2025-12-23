package com.siar.user.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad Usuario del sistema SIAR
 * Representa tanto usuarios internos (empleados) como externos (auditores, inspectores)
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_username", columnList = "username", unique = true),
    @Index(name = "idx_email", columnList = "email", unique = true),
    @Index(name = "idx_identification", columnList = "identification_type, identification_number", unique = true),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_user_type", columnList = "user_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "user_id", columnDefinition = "VARCHAR(36)")
    private String userId;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "identification_type", nullable = false, length = 1)
    private String identificationType; // V, E, P, J

    @Column(name = "identification_number", nullable = false, length = 20)
    private String identificationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 20)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "organization_area", length = 100)
    private String organizationArea;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "position", length = 100)
    private String position;

    // Información de creación
    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Información de aprobación
    @Column(name = "approved_by", length = 36)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Información de modificación
    @Column(name = "last_modified_by", length = 36)
    private String lastModifiedBy;

    @Column(name = "last_modified_at")
    private LocalDateTime lastModifiedAt;

    // Información de inactivación
    @Column(name = "inactivated_by", length = 36)
    private String inactivatedBy;

    @Column(name = "inactivated_at")
    private LocalDateTime inactivatedAt;

    @Column(name = "inactivation_reason", columnDefinition = "TEXT")
    private String inactivationReason;

    // Seguridad
    @Column(name = "password_last_changed")
    private LocalDateTime passwordLastChanged;

    @Column(name = "must_change_password")
    private Boolean mustChangePassword;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "login_attempts", nullable = false)
    @Builder.Default
    private Integer loginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    // Acceso temporal para usuarios externos
    @Column(name = "temporal_access_start")
    private LocalDateTime temporalAccessStart;

    @Column(name = "temporal_access_end")
    private LocalDateTime temporalAccessEnd;

    @Column(name = "external_organization", length = 200)
    private String externalOrganization;

    @Column(name = "external_access_purpose", columnDefinition = "TEXT")
    private String externalAccessPurpose;

    // Metadatos adicionales en formato JSON
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    // Relaciones
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserRole> userRoles = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserSession> userSessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserChangeHistory> changeHistory = new ArrayList<>();

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = UserStatus.PENDING_APPROVAL;
        }
        if (mustChangePassword == null) {
            mustChangePassword = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }

    // Métodos de utilidad
    
    /**
     * Verifica si el usuario está activo y puede acceder al sistema
     */
    public boolean isActive() {
        if (status != UserStatus.ACTIVE) {
            return false;
        }
        
        // Verificar bloqueo temporal
        if (lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil)) {
            return false;
        }
        
        // Verificar acceso temporal para externos
        if (userType == UserType.EXTERNAL) {
            LocalDateTime now = LocalDateTime.now();
            if (temporalAccessStart != null && now.isBefore(temporalAccessStart)) {
                return false;
            }
            if (temporalAccessEnd != null && now.isAfter(temporalAccessEnd)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Verifica si el acceso temporal está próximo a vencer (menos de 7 días)
     */
    public boolean isAccessExpiringSoon() {
        if (userType == UserType.EXTERNAL && temporalAccessEnd != null) {
            LocalDateTime sevenDaysFromNow = LocalDateTime.now().plusDays(7);
            return temporalAccessEnd.isBefore(sevenDaysFromNow);
        }
        return false;
    }

    /**
     * Obtiene el nombre completo del usuario
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Obtiene la identificación completa (tipo + número)
     */
    public String getFullIdentification() {
        return identificationType + "-" + identificationNumber;
    }

    /**
     * Incrementa el contador de intentos fallidos de login
     */
    public void incrementLoginAttempts() {
        this.loginAttempts++;
        
        // Bloquear por 30 minutos después de 5 intentos fallidos
        if (this.loginAttempts >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    /**
     * Resetea el contador de intentos fallidos
     */
    public void resetLoginAttempts() {
        this.loginAttempts = 0;
        this.lockedUntil = null;
    }

    /**
     * Registra un login exitoso
     */
    public void recordSuccessfulLogin() {
        this.lastLoginAt = LocalDateTime.now();
        resetLoginAttempts();
    }
}
