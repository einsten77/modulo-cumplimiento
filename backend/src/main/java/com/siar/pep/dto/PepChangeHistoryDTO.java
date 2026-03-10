package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para historial de cambios de condición PEP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PepChangeHistoryDTO {
    
    private String historyId;
    private LocalDateTime changeDate;
    private String changedBy;
    private String changeType;
    private String previousStatus;
    private String newStatus;
    private String justification;
    private Boolean alertGenerated;
    private String alertId;
}
