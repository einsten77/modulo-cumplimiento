package com.siar.pep.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para detalles del cargo PEP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PepDetailsDTO {
    
    private String position;
    private String institution;
    private String institutionType;
    private String country;
    private String countryName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrentPosition;
    private String prominenceLevel;
    private String publicExposureDescription;
    
    // Para Ex-PEP
    private String cessationReason;
    private Integer monthsSinceCessation;
}
