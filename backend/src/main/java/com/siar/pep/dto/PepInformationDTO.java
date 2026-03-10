package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para información PEP de un expediente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PepInformationDTO {
    
    private Long id;
    private Long dossierId;
    
    private String evaluationStatus;
    private LocalDateTime lastEvaluationDate;
    private String evaluatedBy;
    private LocalDate nextReviewDate;
    
    @NotNull(message = "isPep es obligatorio")
    private Boolean isPep;
    
    private String pepType;
    private String pepCategory;
    
    private PepDetailsDTO pepDetails;
    private RelationshipToPepDTO relationshipToPep;
    
    private List<InformationSourceDTO> informationSources;
    private RiskImpactDTO riskImpact;
    private ComplianceOfficerDecisionDTO complianceOfficerDecision;
    private MonitoringScheduleDTO monitoringSchedule;
    
    private List<PepChangeHistoryDTO> pepHistory;
    
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;
    private Integer version;
}
