package com.siar.risk.dto;

import com.siar.risk.model.RiskLevel;
import lombok.Data;

@Data
public class OverrideRequest {
    private RiskLevel finalRiskLevel;
    private String justification;
}
