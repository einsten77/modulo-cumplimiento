package com.siar.risk.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class CreateEvaluationRequest {
    private String dossierId;
    private String evaluatorUserId;
    private JsonNode riskFactors;
    private String comments;
}
