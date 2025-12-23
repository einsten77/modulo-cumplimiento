package com.siar.auth.controller;

import com.siar.auth.dto.LoginRequest;
import com.siar.auth.dto.LoginResponse;
import com.siar.auth.dto.PasswordRecoveryRequest;
import com.siar.auth.dto.PasswordRecoveryResponse;
import com.siar.security.service.AuthenticationService;
import com.siar.security.service.PasswordRecoveryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación
 * Endpoints para login, logout, recuperación de contraseña y gestión de sesiones
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;
    private final PasswordRecoveryService passwordRecoveryService;
    
    /**
     * Endpoint de login
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("Login attempt for username: {}", request.getUsername());
        
        try {
            // Enriquecer metadata con información de la request HTTP
            if (request.getSessionMetadata() == null) {
                request.setSessionMetadata(new LoginRequest.SessionMetadata());
            }
            
            if (request.getSessionMetadata().getClientIp() == null) {
                String clientIp = getClientIp(httpRequest);
                request.getSessionMetadata().setClientIp(clientIp);
            }
            
            if (request.getSessionMetadata().getUserAgent() == null) {
                String userAgent = httpRequest.getHeader("User-Agent");
                request.getSessionMetadata().setUserAgent(userAgent);
            }
            
            // Procesar login
            LoginResponse response = authenticationService.authenticate(request);
            
            if (response.isSuccess()) {
                log.info("Login successful for user: {} (ID: {})", 
                    response.getUsername(), response.getUserId());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Login failed for username: {}", request.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            log.error("Error during login for username: {}", request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(LoginResponse.builder()
                    .success(false)
                    .message("Error interno del servidor")
                    .build());
        }
    }
    
    /**
     * Endpoint de logout
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {
        
        try {
            String sessionId = extractSessionIdFromToken(authHeader);
            String clientIp = getClientIp(httpRequest);
            
            authenticationService.logout(sessionId, clientIp);
            
            log.info("Logout successful for session: {}", sessionId);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Endpoint para verificar estado de sesión
     * GET /api/v1/auth/session/status
     */
    @GetMapping("/session/status")
    public ResponseEntity<SessionStatusResponse> getSessionStatus(
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String sessionId = extractSessionIdFromToken(authHeader);
            boolean isValid = authenticationService.isSessionValid(sessionId);
            
            return ResponseEntity.ok(SessionStatusResponse.builder()
                .valid(isValid)
                .build());
            
        } catch (Exception e) {
            return ResponseEntity.ok(SessionStatusResponse.builder()
                .valid(false)
                .build());
        }
    }
    
    /**
     * Endpoint de recuperación de contraseña
     * POST /api/v1/auth/password-recovery
     */
    @PostMapping("/password-recovery")
    public ResponseEntity<PasswordRecoveryResponse> requestPasswordRecovery(
            @Valid @RequestBody PasswordRecoveryRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("Password recovery request for username: {}", request.getUsername());
        
        try {
            // Enriquecer metadata con información de la request HTTP
            if (request.getRequestMetadata() == null) {
                request.setRequestMetadata(new PasswordRecoveryRequest.RequestMetadata());
            }
            
            if (request.getRequestMetadata().getClientIp() == null) {
                String clientIp = getClientIp(httpRequest);
                request.getRequestMetadata().setClientIp(clientIp);
            }
            
            if (request.getRequestMetadata().getUserAgent() == null) {
                String userAgent = httpRequest.getHeader("User-Agent");
                request.getRequestMetadata().setUserAgent(userAgent);
            }
            
            // Procesar solicitud de recuperación
            PasswordRecoveryResponse response = passwordRecoveryService.requestPasswordRecovery(request);
            
            if (response.isSuccess()) {
                log.info("Password recovery request processed for user: {}", request.getUsername());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Password recovery request failed for username: {}", request.getUsername());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            log.error("Error during password recovery for username: {}", request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(PasswordRecoveryResponse.builder()
                    .success(false)
                    .message("Error interno del servidor")
                    .build());
        }
    }
    
    // Métodos auxiliares
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private String extractSessionIdFromToken(String authHeader) {
        // Extraer session ID del token JWT
        // Implementación simplificada
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Decodificar JWT y extraer sessionId
            // ... implementación con biblioteca JWT
            return "session-id-from-token";
        }
        return null;
    }
    
    @Data
    @Builder
    private static class SessionStatusResponse {
        private boolean valid;
    }
}
