package com.siar.pep.model;

/**
 * Enumeración de estados de Debida Diligencia Reforzada (EDD)
 */
public enum EddStatus {
    /**
     * No requerida
     */
    NOT_REQUIRED("No Requerida", "No se requiere EDD para este caso"),
    
    /**
     * Pendiente de inicio
     */
    PENDING("Pendiente", "EDD pendiente de inicio"),
    
    /**
     * En progreso
     */
    IN_PROGRESS("En Progreso", "EDD en proceso de ejecución"),
    
    /**
     * Completada
     */
    COMPLETED("Completada", "EDD completada satisfactoriamente"),
    
    /**
     * Requiere documentación adicional
     */
    REQUIRES_DOCUMENTS("Requiere Documentos", "Faltan documentos para completar EDD"),
    
    /**
     * Vencida - requiere actualización
     */
    EXPIRED("Vencida", "EDD vencida, requiere actualización"),
    
    /**
     * Rechazada
     */
    REJECTED("Rechazada", "EDD no satisfactoria");
    
    private final String displayName;
    private final String description;
    
    EddStatus(String displayName, String description) {
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
