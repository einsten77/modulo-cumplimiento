package com.siar.alert.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO para solicitudes de creación de alertas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAlertRequest {
    
    @NotBlank(message = "El código de alerta es obligatorio")
    private String alertCode;
    
    @NotNull(message = "El ID del expediente es obligatorio")
    private UUID dossierId;
    
    @NotBlank(message = "El módulo origen es obligatorio")
    private String originModule;
    
    @NotBlank(message = "La descripción es obligatoria")
    private String description;
    
    private String detectedBy; // Si no se proporciona, se usa el usuario autenticado
    
    private Boolean requiresAction;
    private Integer actionDeadlineDays;
    
    private Map<String, Object> metadata;
    
    private String relatedEntityType;
    private String relatedEntityId;
}
