package com.siar.pep.model;

/**
 * Enumeración de clasificaciones de PEP según jurisdicción
 */
public enum PepClassification {
    /**
     * PEP Nacional - Venezuela
     */
    NATIONAL("PEP Nacional", "Persona que ejerce o ejerció funciones en Venezuela", 5),
    
    /**
     * PEP Extranjero - Otro país
     */
    FOREIGN("PEP Extranjero", "Persona que ejerce o ejerció funciones en otro país", 5),
    
    /**
     * PEP de Organización Internacional
     */
    INTERNATIONAL_ORG("PEP Internacional", "Persona que ejerce o ejerció funciones en organismo internacional", 4),
    
    /**
     * Ex-PEP - Cesó funciones
     */
    EX_PEP("Ex-PEP", "Persona que cesó funciones hace menos de 2 años", 3),
    
    /**
     * No es PEP
     */
    NOT_PEP("No PEP", "No cumple condición de persona expuesta políticamente", 0);
    
    private final String displayName;
    private final String description;
    private final int riskWeight;
    
    PepClassification(String displayName, String description, int riskWeight) {
        this.displayName = displayName;
        this.description = description;
        this.riskWeight = riskWeight;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getRiskWeight() {
        return riskWeight;
    }
}
