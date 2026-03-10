package com.siar.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para respuesta de login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    
    private boolean success;
    private String message;
    
    // Información del usuario
    private String userId;
    private String username;
    private String fullName;
    private String email;
    private String identificationType;
    private String identificationNumber;
    
    // Información de sesión
    private String sessionToken;
    private String sessionId;
    private LocalDateTime loginAt;
    private LocalDateTime expiresAt;
    
    // Información de roles
    private List<RoleInfo> roles;
    private RoleInfo mainRole;
    
    // Flags de seguridad
    private boolean mustChangePassword;
    private boolean temporalAccessExpiring;
    private LocalDateTime temporalAccessEnd;
    private boolean isExternalUser;
    
    // URL de redirección
    private String redirectUrl;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleInfo {
        private String roleId;
        private String roleCode;
        private String roleName;
        private String description;
        private boolean isMain;
        private boolean isExternal;
        private Integer hierarchyLevel;
    }
}
