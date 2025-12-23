package com.siar.audit.dto;

import com.siar.audit.model.ActionType;
import com.siar.audit.model.EventCategory;
import com.siar.audit.model.EventLevel;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para transferencia de datos de auditoría a través de la API REST
 * 
 * Contiene toda la información del registro de auditoría en formato JSON.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {
    
    // Identificación
    private String auditId;
    private Long sequenceNumber;
    
    // Información del evento
    private String eventCode;
    private String eventName;
    private EventCategory eventCategory;
    private EventLevel eventLevel;
    private Instant eventTimestamp;
    private LocalDate eventDate;
    private LocalTime eventTime;
    
    // Actor (usuario que ejecuta)
    private ActorDTO actor;
    
    // Sesión
    private SessionDTO session;
    
    // Recurso afectado
    private ResourceDTO target;
    
    // Acción realizada
    private ActionDTO action;
    
    // Cambios de estado
    private StateChangeDTO stateChange;
    
    // Contexto de negocio
    private BusinessContextDTO businessContext;
    
    // Información técnica
    private TechnicalDTO technical;
    
    // Seguridad
    private SecurityDTO security;
    
    // Protección de datos
    private DataProtectionDTO dataProtection;
    
    // Integridad
    private IntegrityDTO integrity;
    
    // Metadata
    private Instant createdAt;
    private String recordVersion;
    private Boolean exported;
    private Instant exportedAt;
    private String exportedBy;
    
    // DTO internos para estructurar la información
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActorDTO {
        private String userId;
        private String userName;
        private String userEmail;
        private String userRole;
        private String userDepartment;
        private String userLocation;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionDTO {
        private String sessionId;
        private String ipAddress;
        private String userAgent;
        private String device;
        private String browser;
        private String os;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceDTO {
        private String resourceType;
        private String resourceId;
        private String resourceName;
        private String parentResourceType;
        private String parentResourceId;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionDTO {
        private ActionType actionType;
        private String actionVerb;
        private String actionDescription;
        private String actionMethod;
        private String actionEndpoint;
        private Integer actionDuration;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StateChangeDTO {
        private Boolean hasStateChange;
        private JsonNode previousState;
        private JsonNode newState;
        private JsonNode changedFields;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessContextDTO {
        private String justification;
        private String regulatoryBasis;
        private String complianceNotes;
        private JsonNode relatedEntities;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicalDTO {
        private String applicationVersion;
        private String databaseVersion;
        private String serverHostname;
        private String requestId;
        private String transactionId;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityDTO {
        private String authenticationMethod;
        private Boolean authorizationPassed;
        private JsonNode permissionsChecked;
        private String securityLevel;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataProtectionDTO {
        private Boolean containsPII;
        private String dataClassification;
        private Boolean encryptionApplied;
        private Boolean anonymizationRequired;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IntegrityDTO {
        private String recordHash;
        private String previousRecordHash;
    }
}
