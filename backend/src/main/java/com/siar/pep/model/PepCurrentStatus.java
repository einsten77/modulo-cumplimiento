package com.siar.pep.model;

/**
 * Enumeración de estados actuales del registro PEP
 */
public enum PepCurrentStatus {
    /**
     * Activo - Información verificada y actual
     */
    ACTIVE("Activo", "Información PEP verificada y actualizada"),
    
    /**
     * Inactivo - Ya no es PEP
     */
    INACTIVE("Inactivo", "Ya no cumple condición PEP"),
    
    /**
     * En revisión - Pendiente de verificación
     */
    UNDER_REVIEW("En Revisión", "Información pendiente de verificación"),
    
    /**
     * Verificado - Completamente validado
     */
    VERIFIED("Verificado", "Información completamente verificada"),
    
    /**
     * Requiere actualización - Información desactualizada
     */
    REQUIRES_UPDATE("Requiere Actualización", "Información debe ser actualizada"),
    
    /**
     * En monitoreo - Bajo vigilancia continua
     */
    UNDER_MONITORING("En Monitoreo", "Bajo vigilancia y monitoreo continuo");
    
    private final String displayName;
    private final String description;
    
    PepCurrentStatus(String displayName, String description) {
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
