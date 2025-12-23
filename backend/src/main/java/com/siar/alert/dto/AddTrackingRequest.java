package com.siar.alert.dto;

import com.siar.alert.model.AlertStatus;
import com.siar.alert.model.TrackingActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitudes de agregar seguimiento a una alerta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddTrackingRequest {
    
    @NotNull(message = "El tipo de acción es obligatorio")
    private TrackingActionType actionType;
    
    @NotBlank(message = "El comentario es obligatorio")
    private String comment;
    
    private String actionTaken;
    
    private Boolean evidenceAttached;
    private String evidenceReference;
    
    private AlertStatus newStatus; // Si se cambia el estado
}
