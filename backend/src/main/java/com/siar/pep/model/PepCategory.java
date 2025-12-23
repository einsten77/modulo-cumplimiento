package com.siar.pep.model;

/**
 * Enumeración de categorías de PEP
 */
public enum PepCategory {
    
    /**
     * PEP Activo - En ejercicio actual del cargo
     */
    ACTIVE_PEP("PEP Activo", "Persona que actualmente ejerce funciones públicas prominentes"),
    
    /**
     * Ex-PEP - Cesó hace más de 1 año pero menos de 2
     */
    FORMER_PEP("Ex-PEP", "Persona que cesó funciones PEP hace más de 1 año"),
    
    /**
     * Familiar - Familiar directo de PEP
     */
    FAMILY_MEMBER("Familiar de PEP", "Familiar directo de persona expuesta políticamente"),
    
    /**
     * Vinculado - Relación comercial o profesional estrecha
     */
    CLOSE_ASSOCIATE("Vinculado a PEP", "Persona con relación estrecha con PEP"),
    
    /**
     * No es PEP
     */
    NOT_PEP("No es PEP", "Sin condición de persona expuesta políticamente");
    
    private final String displayName;
    private final String description;
    
    PepCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
