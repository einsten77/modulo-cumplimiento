package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para configuración de monitoreo
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MonitoringScheduleDTO {
    
    private String reviewFrequency;
    private LocalDate nextScheduledReview;
    private LocalDate lastCompletedReview;
    private Integer missedReviews;
    private Boolean automatedMonitoring;
    private List<MonitoringAlertDTO> monitoringAlerts;
}
