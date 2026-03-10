package com.siar.security.service;

import com.siar.auth.dto.PasswordRecoveryRequest;
import com.siar.auth.dto.PasswordRecoveryResponse;
import com.siar.user.model.User;
import com.siar.user.repository.UserRepository;
import com.siar.audit.service.AuditService;
import com.siar.notification.service.EmailService;
import com.siar.security.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de Recuperación de Contraseña
 * Gestiona solicitudes de recuperación y reseteo de contraseñas
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordRecoveryService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditService auditService;
    
    private static final String CORPORATE_DOMAIN = "@laoccidental.com";
    private static final int TEMP_PASSWORD_LENGTH = 12;
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    
    /**
     * Procesa solicitud de recuperación de contraseña
     */
    @Transactional
    public PasswordRecoveryResponse requestPasswordRecovery(PasswordRecoveryRequest request) {
        String username = request.getUsername().toLowerCase().trim();
        String requestId = UUID.randomUUID().toString();
        
        log.info("[v0] Processing password recovery for username: {}", username);
        
        try {
            // 1. Buscar usuario por username (que corresponde al email corporativo)
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));
            
            // 2. Validar estado del usuario
            if (user.getStatus() == User.UserStatus.INACTIVE) {
                auditService.recordPasswordRecoveryAttempt(
                    username, request.getRequestMetadata().getClientIp(), false, 
                    "Usuario inactivo"
                );
                throw new AuthenticationException("Usuario inactivo. Contacte al administrador.");
            }
            
            if (user.getStatus() == User.UserStatus.SUSPENDED) {
                auditService.recordPasswordRecoveryAttempt(
                    username, request.getRequestMetadata().getClientIp(), false, 
                    "Usuario suspendido"
                );
                throw new AuthenticationException("Usuario suspendido. Contacte al administrador.");
            }
            
            // 3. Generar contraseña temporal
            String temporaryPassword = generateTemporaryPassword();
            
            // 4. Actualizar contraseña del usuario
            user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
            user.setMustChangePassword(true);
            user.setPasswordLastChanged(LocalDateTime.now());
            user.setLastModifiedAt(LocalDateTime.now());
            user.setLastModifiedBy("SYSTEM_PASSWORD_RECOVERY");
            userRepository.save(user);
            
            // 5. Construir email corporativo
            String corporateEmail = username + CORPORATE_DOMAIN;
            
            // 6. Enviar correo con contraseña temporal
            boolean emailSent = emailService.sendPasswordRecoveryEmail(
                corporateEmail,
                user.getFullName(),
                temporaryPassword,
                username
            );
            
            // 7. Registrar en auditoría
            auditService.recordPasswordRecoveryAttempt(
                username, request.getRequestMetadata().getClientIp(), true, 
                "Contraseña temporal generada y enviada"
            );
            
            log.info("[v0] Password recovery successful for user: {}", username);
            
            // 8. Construir respuesta (enmascarar email parcialmente)
            return PasswordRecoveryResponse.builder()
                .success(true)
                .message("Contraseña temporal enviada exitosamente")
                .corporateEmail(maskEmail(corporateEmail))
                .requestId(requestId)
                .requestedAt(LocalDateTime.now())
                .emailSent(emailSent)
                .build();
                
        } catch (AuthenticationException e) {
            log.warn("[v0] Password recovery failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("[v0] Error during password recovery", e);
            auditService.recordPasswordRecoveryAttempt(
                username, request.getRequestMetadata().getClientIp(), false, 
                "Error interno: " + e.getMessage()
            );
            throw new RuntimeException("Error al procesar solicitud de recuperación");
        }
    }
    
    /**
     * Genera una contraseña temporal segura
     */
    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(TEMP_PASSWORD_LENGTH);
        
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            int index = random.nextInt(PASSWORD_CHARS.length());
            password.append(PASSWORD_CHARS.charAt(index));
        }
        
        return password.toString();
    }
    
    /**
     * Enmascara parcialmente el email para privacidad
     * Ejemplo: jmperez@laoccidental.com -> jm***@laoccidental.com
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];
        
        if (username.length() <= 2) {
            return username + "***@" + domain;
        }
        
        String masked = username.substring(0, 2) + "***@" + domain;
        return masked;
    }
}
