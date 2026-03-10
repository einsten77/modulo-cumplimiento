package com.siar.alert.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitudes de cierre de alertas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloseAlertRequest {
    
    @NotBlank(message = "La razón de cierre es obligatoria")
    private String closureReason;
    
    @NotBlank(message = "La acción tomada es obligatoria")
    private String actionTaken;
    
    private Boolean evidenceAttached;
    private String evidenceReference;
}
