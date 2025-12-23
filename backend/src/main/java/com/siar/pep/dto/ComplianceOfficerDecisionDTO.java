package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para decisión del Oficial de Cumplimiento
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ComplianceOfficerDecisionDTO {
    
    private LocalDateTime decisionDate;
    private String decidedBy;
    private String decision;
    private String justification;
    private List<String> conditions;
    private String approvalLevel;
    private LocalDate nextMandatoryReview;
}
