package com.siar.alert.dto;

import com.siar.alert.model.TrackingActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO para respuestas de seguimiento de alertas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertTrackingDTO {
    
    private UUID trackingId;
    private UUID alertId;
    
    private TrackingActionType actionType;
    private String actionDescription;
    
    private String previousStatus;
    private String newStatus;
    
    private String previousAssignedTo;
    private String newAssignedTo;
    
    private String comment;
    
    private Boolean evidenceAttached;
    private String evidenceReference;
    
    private String actionTaken;
    
    private UserInfo performedBy;
    private Instant performedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private String userId;
        private String userName;
        private String userRole;
    }
}
