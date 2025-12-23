package com.siar.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de recuperación de contraseña
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordRecoveryResponse {
    
    private boolean success;
    private String message;
    
    // Email corporativo enmascarado para mostrar al usuario
    private String corporateEmail;
    
    // Información de auditoría
    private String requestId;
    private LocalDateTime requestedAt;
    
    // Indicador si se envió el correo
    private boolean emailSent;
}
