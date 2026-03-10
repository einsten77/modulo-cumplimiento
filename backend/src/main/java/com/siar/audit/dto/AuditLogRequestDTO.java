package com.siar.audit.dto;

import com.siar.audit.model.ActionType;
import com.siar.audit.model.EventCategory;
import com.siar.audit.model.EventLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Instant;

/**
 * DTO para solicitudes de creación de registros de auditoría
 * 
 * Contiene la información mínima requerida para crear un nuevo registro.
 * El servicio completará automáticamente la información adicional.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogRequestDTO {
    
    // Información del evento (obligatoria)
    private String eventCode;
    private String eventName;
    private EventCategory eventCategory;
    private EventLevel eventLevel;
    
    // Información del recurso afectado (obligatoria)
    private String resourceType;
    private String resourceId;
    private String resourceName;
    
    // Información de la acción (obligatoria)
    private ActionType actionType;
    private String actionVerb;
    private String actionDescription;
    
    // Información opcional
    private String justification;
    private String regulatoryBasis;
    private String complianceNotes;
    
    // Información de estado (opcional)
    private Object previousState;
    private Object newState;
    
    // Información de sesión (se completa automáticamente si no se provee)
    private String sessionId;
    private String ipAddress;
    private String userAgent;
}
