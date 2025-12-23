package com.siar.alert.dto;

import com.siar.alert.model.AlertLevel;
import com.siar.alert.model.AlertStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * DTO para respuestas de API de alertas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDTO {
    
    private UUID alertId;
    private String alertCode;
    private String alertType;
    private AlertLevel alertLevel;
    private String originModule;
    
    private DossierInfo dossier;
    
    private AlertStatus status;
    private String description;
    
    private Instant detectedAt;
    private String detectedBy;
    
    private UserInfo assignedTo;
    private Instant assignedAt;
    
    private UserInfo attendedBy;
    private Instant attendedAt;
    
    private UserInfo closedBy;
    private Instant closedAt;
    private String closureReason;
    
    private Boolean requiresAction;
    private LocalDate actionDeadline;
    private Integer priorityScore;
    
    private Map<String, Object> metadata;
    
    private RelatedEntity relatedEntity;
    
    private Boolean notificationSent;
    private Instant notificationSentAt;
    
    private Boolean escalated;
    private Instant escalatedAt;
    private UserInfo escalatedTo;
    private String escalationReason;
    
    private Integer trackingCount;
    private LastActivity lastActivity;
    
    private Instant createdAt;
    
    // Clases internas para información estructurada
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DossierInfo {
        private String dossierId;
        private String entityType;
        private String entityName;
        private String entityIdentification;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private String userId;
        private String userName;
        private String userRole;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RelatedEntity {
        private String entityType;
        private String entityId;
        private String relationship;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LastActivity {
        private String actionType;
        private String performedBy;
        private Instant performedAt;
        private String comment;
    }
}
