package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para impacto en el riesgo
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskImpactDTO {
    
    private Integer riskScoreIncrement;
    private String riskLevelBefore;
    private String riskLevelAfter;
    private Boolean requiresEnhancedDueDiligence;
    private String enhancedDueDiligenceStatus;
    private List<String> additionalControls;
}
