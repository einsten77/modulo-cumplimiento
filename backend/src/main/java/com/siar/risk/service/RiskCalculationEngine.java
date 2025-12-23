package com.siar.risk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.siar.risk.dto.CategoryScore;
import com.siar.risk.dto.RiskCalculationResult;
import com.siar.risk.model.RiskConfiguration;
import com.siar.risk.model.RiskLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskCalculationEngine {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Calcula el riesgo consolidado basado en factores y configuración
     */
    public RiskCalculationResult calculateRisk(JsonNode riskFactors, RiskConfiguration config) {
        log.info("Calculating risk with configuration: {}", config.getConfigurationId());
        
        Map<String, CategoryScore> categoryScores = new HashMap<>();
        
        // Calcular puntaje por cada categoría
        categoryScores.put("subjectRisk", calculateCategoryScore(
            riskFactors.get("subjectRisk"),
            config.getFactorWeightsJson().get("SUBJECT_RISK"),
            config.getCategoryWeightsJson().get("SUBJECT_RISK").asDouble()
        ));
        
        categoryScores.put("productRisk", calculateCategoryScore(
            riskFactors.get("productRisk"),
            config.getFactorWeightsJson().get("PRODUCT_RISK"),
            config.getCategoryWeightsJson().get("PRODUCT_RISK").asDouble()
        ));
        
        categoryScores.put("channelRisk", calculateCategoryScore(
            riskFactors.get("channelRisk"),
            config.getFactorWeightsJson().get("CHANNEL_RISK"),
            config.getCategoryWeightsJson().get("CHANNEL_RISK").asDouble()
        ));
        
        categoryScores.put("geographicRisk", calculateCategoryScore(
            riskFactors.get("geographicRisk"),
            config.getFactorWeightsJson().get("GEOGRAPHIC_RISK"),
            config.getCategoryWeightsJson().get("GEOGRAPHIC_RISK").asDouble()
        ));
        
        categoryScores.put("internalControls", calculateCategoryScore(
            riskFactors.get("internalControls"),
            config.getFactorWeightsJson().get("INTERNAL_CONTROLS"),
            config.getCategoryWeightsJson().get("INTERNAL_CONTROLS").asDouble()
        ));
        
        // Calcular puntaje bruto ponderado
        double grossScore = calculateGrossScore(categoryScores);
        
        // Aplicar factor de mitigación de controles internos
        double controlScore = categoryScores.get("internalControls").getRawScore();
        double mitigationFactor = 1.0 - (controlScore / 10.0);
        double adjustedScore = grossScore * mitigationFactor;
        
        // Determinar nivel de riesgo final
        RiskLevel riskLevel = determineRiskLevel(adjustedScore, config.getThresholdsJson());
        
        // Construir resultado
        RiskCalculationResult result = RiskCalculationResult.builder()
            .categoryScores(categoryScores)
            .grossScore(grossScore)
            .mitigationFactor(mitigationFactor)
            .adjustedScore(adjustedScore)
            .riskLevel(riskLevel)
            .calculationMethod("WEIGHTED_AVERAGE_WITH_MITIGATION")
            .configurationVersion(config.getConfigurationId())
            .build();
        
        log.info("Risk calculation completed: grossScore={}, adjustedScore={}, level={}", 
            grossScore, adjustedScore, riskLevel);
        
        return result;
    }
    
    private CategoryScore calculateCategoryScore(
        JsonNode factors, 
        JsonNode factorWeights, 
        double categoryWeight
    ) {
        double totalWeightedValue = 0.0;
        double totalApplicableWeight = 0.0;
        
        Iterator<String> fieldNames = factors.fieldNames();
        while (fieldNames.hasNext()) {
            String factorName = fieldNames.next();
            JsonNode factor = factors.get(factorName);
            
            int value = factor.get("value").asInt();
            
            // Solo considerar factores que aplican (value > 0)
            if (value > 0) {
                double weight = factorWeights.get(factorName).asDouble();
                totalWeightedValue += value * weight;
                totalApplicableWeight += weight;
            }
        }
        
        double rawScore = totalApplicableWeight > 0 
            ? totalWeightedValue / totalApplicableWeight 
            : 0.0;
        
        double weightedScore = (rawScore * categoryWeight) / 100.0;
        
        return CategoryScore.builder()
            .rawScore(rawScore)
            .weightedScore(weightedScore)
            .weight(categoryWeight)
            .build();
    }
    
    private double calculateGrossScore(Map<String, CategoryScore> categoryScores) {
        return categoryScores.values().stream()
            .mapToDouble(CategoryScore::getWeightedScore)
            .sum();
    }
    
    private RiskLevel determineRiskLevel(double adjustedScore, JsonNode thresholds) {
        double lowToMedium = thresholds.get("lowToMedium").asDouble();
        double mediumToHigh = thresholds.get("mediumToHigh").asDouble();
        
        if (adjustedScore <= lowToMedium) {
            return RiskLevel.BAJO;
        } else if (adjustedScore <= mediumToHigh) {
            return RiskLevel.MEDIO;
        } else {
            return RiskLevel.ALTO;
        }
    }
}
