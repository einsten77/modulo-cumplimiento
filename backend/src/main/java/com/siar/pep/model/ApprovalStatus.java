package com.siar.pep.model;

/**
 * Enumeración de estados de aprobación
 */
public enum ApprovalStatus {
    /**
     * Pendiente de aprobación
     */
    PENDING("Pendiente", "Pendiente de aprobación del Oficial de Cumplimiento"),
    
    /**
     * Aprobado
     */
    APPROVED("Aprobado", "Aprobado por el Oficial de Cumplimiento"),
    
    /**
     * Rechazado
     */
    REJECTED("Rechazado", "Rechazado, requiere correcciones"),
    
    /**
     * En revisión
     */
    UNDER_REVIEW("En Revisión", "En proceso de revisión"),
    
    /**
     * Requiere información adicional
     */
    REQUIRES_INFO("Requiere Información", "Requiere información o documentación adicional");
    
    private final String displayName;
    private final String description;
    
    ApprovalStatus(String displayName, String description) {
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
