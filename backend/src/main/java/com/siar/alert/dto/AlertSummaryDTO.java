package com.siar.alert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * DTO para resumen de alertas en dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertSummaryDTO {
    
    private Long totalAlerts;
    private Long newAlerts;
    private Long inProgressAlerts;
    private Long attendedAlerts;
    private Long closedAlerts;
    
    private Map<String, Long> byLevel; // CRÍTICA: 3, ALTA: 28, etc.
    private Map<String, Long> byModule; // DOSSIER: 98, RISK: 67, etc.
    
    private Long overdueAlerts;
    private Long escalatedAlerts;
    
    private MyAlertsInfo myAlerts;
    
    private Double averageResolutionDays;
    
    private Instant lastUpdated;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MyAlertsInfo {
        private Long total;
        private Long pending;
        private Long inProgress;
    }
}
