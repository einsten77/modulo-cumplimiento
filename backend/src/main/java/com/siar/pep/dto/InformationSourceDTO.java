package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para fuentes de información PEP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InformationSourceDTO {
    
    private String sourceId;
    private String sourceType;
    private String sourceName;
    private LocalDate sourceDate;
    private String sourceReference;
    private LocalDateTime verificationDate;
    private String verifiedBy;
    private String reliability;
    private String screeningProvider;
    private String screeningReference;
    private String matchQuality;
    private String documentReference;
}
