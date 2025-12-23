package com.siar.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitud de login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    
    @NotBlank(message = "El nombre de usuario es requerido")
    @Size(min = 3, max = 50, message = "El usuario debe tener entre 3 y 50 caracteres")
    private String username;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    private String password;
    
    /**
     * Metadata de la sesión para auditoría
     */
    private SessionMetadata sessionMetadata;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionMetadata {
        private String clientIp;
        private String userAgent;
        private String timestamp;
        private String deviceId;
        private String location;
    }
}
