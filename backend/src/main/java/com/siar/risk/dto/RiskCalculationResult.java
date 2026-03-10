package com.siar.risk.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.siar.risk.model.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskCalculationResult {
    private Map<String, CategoryScore> categoryScores;
    private Double grossScore;
    private Double mitigationFactor;
    private Double adjustedScore;
    private RiskLevel riskLevel;
    private String calculationMethod;
    private String configurationVersion;
    
    public JsonNode toJson() {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.valueToTree(this);
    }
}
