package com.siar.pep.model;

/**
 * Enumeración de tipos de PEP
 */
public enum PepType {
    
    /**
     * PEP Nacional - Persona que ejerce o ejerció funciones públicas prominentes en Venezuela
     */
    PEP_NATIONAL("PEP Nacional", "Nacional", 5),
    
    /**
     * PEP Extranjero - Persona que ejerce o ejerció funciones públicas prominentes en otro país
     */
    PEP_FOREIGN("PEP Extranjero", "Extranjero", 5),
    
    /**
     * PEP Internacional - Persona que ejerce o ejerció funciones en organismos internacionales
     */
    PEP_INTERNATIONAL("PEP Internacional", "Internacional", 5),
    
    /**
     * Ex-PEP - Persona que cesó funciones PEP hace más de 1 año pero menos de 2
     */
    PEP_FORMER("Ex-PEP", "Anterior", 4),
    
    /**
     * Familiar de PEP - Familiar directo de un PEP activo o ex-PEP
     */
    PEP_FAMILY("Familiar de PEP", "Familiar", 3),
    
    /**
     * Vinculado a PEP - Persona con relación comercial o profesional estrecha con PEP
     */
    PEP_ASSOCIATE("Vinculado a PEP", "Vinculado", 2);
    
    private final String displayName;
    private final String category;
    private final int riskScore;
    
    PepType(String displayName, String category, int riskScore) {
        this.displayName = displayName;
        this.category = category;
        this.riskScore = riskScore;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getCategory() {
        return category;
    }
    
    public int getRiskScore() {
        return riskScore;
    }
    
    /**
     * Determina si el tipo de PEP requiere Debida Diligencia Reforzada
     */
    public boolean requiresEnhancedDueDiligence() {
        return riskScore >= 3;
    }
    
    /**
     * Obtiene la frecuencia de revisión recomendada en meses
     */
    public int getReviewFrequencyMonths() {
        return switch (this) {
            case PEP_NATIONAL, PEP_FOREIGN, PEP_INTERNATIONAL -> 6;  // Semestral
            case PEP_FORMER, PEP_FAMILY, PEP_ASSOCIATE -> 12;        // Anual
        };
    }
}
