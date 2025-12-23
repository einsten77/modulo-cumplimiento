package com.siar.security.service;

import com.siar.security.dto.LoginRequest;
import com.siar.security.dto.LoginResponse;
import com.siar.security.exception.AuthenticationException;
import com.siar.security.model.*;
import com.siar.security.repository.SecurityAuditRepository;
import com.siar.security.repository.SessionRepository;
import com.siar.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de Autenticación del Sistema SIAR
 * Gestiona el login, logout y validación de credenciales
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final SecurityAuditRepository securityAuditRepository;
    private final JwtTokenService jwtTokenService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityAuditService auditService;
    private final AlertIntegrationService alertService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int FAILED_ATTEMPTS_WINDOW_MINUTES = 15;

    /**
     * Autentica un usuario y crea una sesión
     */
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        log.info("[v0] Login attempt for username: {}", request.getUsername());

        // 1. Buscar usuario
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> {
                auditService.recordFailedLogin(null, request.getUsername(), ipAddress, 
                    SecurityAuditEvent.AUTH_LOGIN_FAILED_USER_NOT_FOUND, "Usuario no encontrado");
                return new AuthenticationException("Credenciales inválidas");
            });

        // 2. Verificar estado del usuario
        validateUserStatus(user, ipAddress);

        // 3. Verificar contraseña
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user, ipAddress);
            throw new AuthenticationException("Credenciales inválidas");
        }

        // 4. Verificar si requiere cambio de contraseña
        if (user.getMustChangePassword() || user.isPasswordExpired()) {
            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGIN_SUCCESS, 
                SecurityAuditEvent.Severity.INFO, "Login exitoso - requiere cambio de contraseña", 
                ipAddress, SecurityAuditEvent.Result.SUCCESS);
            throw new AuthenticationException("PASSWORD_CHANGE_REQUIRED", 
                "Debe cambiar su contraseña antes de continuar");
        }

        // 5. Verificar acceso temporal (usuarios externos)
        if (user.isTemporaryAccessExpired()) {
            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGIN_FAILED_LOCKED, 
                SecurityAuditEvent.Severity.ERROR, "Acceso temporal expirado", 
                ipAddress, SecurityAuditEvent.Result.DENIED);
            throw new AuthenticationException("Acceso temporal expirado");
        }

        // 6. Crear sesión
        Session session = createSession(user, ipAddress, userAgent);

        // 7. Generar tokens
        String jwtToken = jwtTokenService.generateToken(user);
        String refreshToken = jwtTokenService.generateRefreshToken();

        // 8. Guardar session con tokens hasheados
        session.setTokenHash(jwtTokenService.hashToken(jwtToken));
        session.setRefreshTokenHash(jwtTokenService.hashToken(refreshToken));
        session.setTokenExpiration(jwtTokenService.getTokenExpiration());
        session.setRefreshTokenExpiration(jwtTokenService.getRefreshTokenExpiration());
        sessionRepository.save(session);

        // 9. Actualizar usuario
        user.recordSuccessfulLogin();
        userRepository.save(user);

        // 10. Registrar auditoría
        auditService.recordSuccessfulLogin(user, session, ipAddress);

        // 11. Alerta si es usuario externo
        if (user.isExternalUser()) {
            alertService.generateExternalUserAccessAlert(user, session);
        }

        log.info("[v0] Login successful for user: {}", user.getUsername());

        return LoginResponse.builder()
            .token(jwtToken)
            .refreshToken(refreshToken)
            .tokenExpiration(session.getTokenExpiration())
            .userId(user.getUserId())
            .username(user.getUsername())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .roles(user.getRoles())
            .permissions(user.getAllPermissionCodes())
            .sessionId(session.getSessionId())
            .build();
    }

    /**
     * Valida el estado del usuario antes del login
     */
    private void validateUserStatus(User user, String ipAddress) {
        if (user.getStatus() == User.UserStatus.LOCKED) {
            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGIN_FAILED_LOCKED, 
                SecurityAuditEvent.Severity.ERROR, "Cuenta bloqueada", 
                ipAddress, SecurityAuditEvent.Result.DENIED);
            throw new AuthenticationException("ACCOUNT_LOCKED", 
                "Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.");
        }

        if (user.getStatus() == User.UserStatus.INACTIVE) {
            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGIN_FAILED_LOCKED, 
                SecurityAuditEvent.Severity.ERROR, "Cuenta inactiva", 
                ipAddress, SecurityAuditEvent.Result.DENIED);
            throw new AuthenticationException("ACCOUNT_INACTIVE", "Cuenta inactiva");
        }

        if (user.getStatus() == User.UserStatus.SUSPENDED) {
            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGIN_FAILED_LOCKED, 
                SecurityAuditEvent.Severity.ERROR, "Cuenta suspendida", 
                ipAddress, SecurityAuditEvent.Result.DENIED);
            throw new AuthenticationException("ACCOUNT_SUSPENDED", "Cuenta suspendida");
        }
    }

    /**
     * Maneja un intento de login fallido
     */
    private void handleFailedLogin(User user, String ipAddress) {
        user.incrementFailedLoginAttempts();

        // Si alcanza el máximo de intentos, bloquear cuenta
        if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
            user.lockAccount();
            userRepository.save(user);

            // Generar alerta
            alertService.generateAccountLockedAlert(user);

            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGIN_FAILED_LOCKED, 
                SecurityAuditEvent.Severity.CRITICAL, 
                "Cuenta bloqueada por " + MAX_FAILED_ATTEMPTS + " intentos fallidos", 
                ipAddress, SecurityAuditEvent.Result.DENIED);

            throw new AuthenticationException("ACCOUNT_LOCKED", 
                "Cuenta bloqueada por múltiples intentos fallidos");
        }

        userRepository.save(user);

        auditService.recordFailedLogin(user, user.getUsername(), ipAddress, 
            SecurityAuditEvent.AUTH_LOGIN_FAILED_PASSWORD, "Contraseña incorrecta");

        throw new AuthenticationException("Credenciales inválidas");
    }

    /**
     * Crea una nueva sesión para el usuario
     */
    private Session createSession(User user, String ipAddress, String userAgent) {
        return Session.builder()
            .userId(user.getUserId())
            .username(user.getUsername())
            .activeRoles(user.getRoleCodes().stream().toList())
            .status(Session.SessionStatus.ACTIVE)
            .loginTimestamp(LocalDateTime.now())
            .lastActivityTimestamp(LocalDateTime.now())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .deviceInfo(parseDeviceInfo(userAgent))
            .metadata(Session.SessionMetadata.builder()
                .loginMethod(Session.LoginMethod.PASSWORD)
                .mfaVerified(false)
                .riskScore(calculateRiskScore(user, ipAddress))
                .build())
            .build();
    }

    /**
     * Cierra sesión del usuario
     */
    @Transactional
    public void logout(UUID sessionId, UUID userId, String ipAddress) {
        Session session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new AuthenticationException("Sesión no encontrada"));

        if (!session.getUserId().equals(userId)) {
            throw new AuthenticationException("Sesión no pertenece al usuario");
        }

        session.logout();
        sessionRepository.save(session);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            auditService.recordEvent(user, SecurityAuditEvent.AUTH_LOGOUT_NORMAL, 
                SecurityAuditEvent.Severity.INFO, "Logout normal", 
                ipAddress, SecurityAuditEvent.Result.SUCCESS);
        }

        log.info("[v0] User {} logged out successfully", userId);
    }

    /**
     * Refresca el token JWT usando refresh token
     */
    @Transactional
    public LoginResponse refreshToken(String refreshToken, String ipAddress) {
        String refreshTokenHash = jwtTokenService.hashToken(refreshToken);

        Session session = sessionRepository.findByRefreshTokenHashAndStatus(
            refreshTokenHash, Session.SessionStatus.ACTIVE)
            .orElseThrow(() -> new AuthenticationException("Refresh token inválido o expirado"));

        if (!session.isRefreshTokenValid()) {
            session.expire();
            sessionRepository.save(session);
            throw new AuthenticationException("Refresh token expirado");
        }

        User user = userRepository.findById(session.getUserId())
            .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        // Generar nuevo JWT
        String newJwtToken = jwtTokenService.generateToken(user);
        session.setTokenHash(jwtTokenService.hashToken(newJwtToken));
        session.setTokenExpiration(jwtTokenService.getTokenExpiration());
        session.updateActivity();
        sessionRepository.save(session);

        return LoginResponse.builder()
            .token(newJwtToken)
            .refreshToken(refreshToken)
            .tokenExpiration(session.getTokenExpiration())
            .userId(user.getUserId())
            .username(user.getUsername())
            .roles(user.getRoles())
            .permissions(user.getAllPermissionCodes())
            .sessionId(session.getSessionId())
            .build();
    }

    // Helper methods
    private Session.DeviceInfo parseDeviceInfo(String userAgent) {
        // Simple parsing - can be enhanced with a library like UADetector
        return Session.DeviceInfo.builder()
            .browser(extractBrowser(userAgent))
            .os(extractOS(userAgent))
            .device("Desktop") // Default
            .build();
    }

    private String extractBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        return "Other";
    }

    private String extractOS(String userAgent) {
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac")) return "MacOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iOS")) return "iOS";
        return "Other";
    }

    private Integer calculateRiskScore(User user, String ipAddress) {
        int score = 0;
        
        // Usuario externo = mayor riesgo
        if (user.isExternalUser()) {
            score += 30;
        }
        
        // Primer login = mayor riesgo
        if (user.getLastSuccessfulLogin() == null) {
            score += 20;
        }
        
        // TODO: Check IP reputation, geolocation, etc.
        
        return Math.min(score, 100);
    }
}
