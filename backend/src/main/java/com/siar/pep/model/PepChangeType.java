package com.siar.pep.model;

/**
 * Enumeración de tipos de cambios en el historial PEP
 */
public enum PepChangeType {
    /**
     * Clasificación inicial como PEP
     */
    INITIAL_CLASSIFICATION("Clasificación Inicial"),
    
    /**
     * Cambio de estatus PEP
     */
    STATUS_CHANGE("Cambio de Estatus"),
    
    /**
     * Nuevo cargo o posición
     */
    POSITION_CHANGE("Cambio de Cargo"),
    
    /**
     * Cambio en la clasificación
     */
    CLASSIFICATION_CHANGE("Cambio de Clasificación"),
    
    /**
     * Actualización de verificación
     */
    VERIFICATION("Verificación"),
    
    /**
     * Cambio en el nivel de riesgo
     */
    RISK_CHANGE("Cambio de Riesgo"),
    
    /**
     * Nueva relación identificada
     */
    RELATIONSHIP_ADDED("Relación Agregada"),
    
    /**
     * Relación finalizada
     */
    RELATIONSHIP_ENDED("Relación Finalizada"),
    
    /**
     * Revisión periódica
     */
    PERIODIC_REVIEW("Revisión Periódica"),
    
    /**
     * Decisión del Oficial de Cumplimiento
     */
    COMPLIANCE_DECISION("Decisión de Cumplimiento");
    
    private final String displayName;
    
    PepChangeType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
