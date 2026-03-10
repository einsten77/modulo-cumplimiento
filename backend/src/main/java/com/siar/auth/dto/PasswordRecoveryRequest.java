package com.siar.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitud de recuperación de contraseña
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordRecoveryRequest {
    
    @NotBlank(message = "El nombre de usuario es requerido")
    @Size(min = 3, max = 50, message = "El usuario debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "^[a-z0-9._-]+$", message = "Usuario contiene caracteres inválidos")
    private String username;
    
    /**
     * Metadata de la solicitud para auditoría
     */
    private RequestMetadata requestMetadata;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RequestMetadata {
        private String clientIp;
        private String userAgent;
        private String timestamp;
    }
}
