package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para relación con PEP (familiares y vinculados)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RelationshipToPepDTO {
    
    private String relationType;
    private String relationDescription;
    private String relatedPepName;
    private String relatedPepDocument;
    private String relatedPepPosition;
    private String relatedPepInstitution;
    private String relatedPepCountry;
    private String relatedPepStatus;
    private LocalDate relatedPepStartDate;
    private LocalDate relatedPepEndDate;
    private LocalDate relationshipStartDate;
    private LocalDate relationshipEndDate;
    private List<String> relationshipEvidence;
    private List<String> documentReferences;
}
