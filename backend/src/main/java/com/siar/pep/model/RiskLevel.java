package com.siar.pep.model;

/**
 * Enumeración de niveles de riesgo
 */
public enum RiskLevel {
    /**
     * Riesgo Bajo
     */
    LOW("Bajo", "Riesgo bajo, controles estándar", 1),
    
    /**
     * Riesgo Medio-Bajo
     */
    LOW_MEDIUM("Medio-Bajo", "Riesgo medio-bajo, controles reforzados", 2),
    
    /**
     * Riesgo Medio
     */
    MEDIUM("Medio", "Riesgo medio, requiere monitoreo", 3),
    
    /**
     * Riesgo Alto
     */
    HIGH("Alto", "Riesgo alto, requiere EDD y monitoreo continuo", 4),
    
    /**
     * Riesgo Crítico
     */
    CRITICAL("Crítico", "Riesgo crítico, requiere aprobación especial", 5);
    
    private final String displayName;
    private final String description;
    private final int score;
    
    RiskLevel(String displayName, String description, int score) {
        this.displayName = displayName;
        this.description = description;
        this.score = score;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getScore() {
        return score;
    }
    
    /**
     * Determina si el nivel de riesgo requiere EDD
     */
    public boolean requiresEdd() {
        return score >= 3;
    }
}
