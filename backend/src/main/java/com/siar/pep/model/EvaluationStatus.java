package com.siar.pep.model;

/**
 * Enumeración de estados de evaluación PEP
 */
public enum EvaluationStatus {
    
    /**
     * Evaluación pendiente
     */
    PENDING_EVALUATION("Pendiente de Evaluación", "La evaluación PEP aún no se ha realizado"),
    
    /**
     * En proceso de evaluación
     */
    IN_PROGRESS("En Progreso", "La evaluación PEP está en curso"),
    
    /**
     * Evaluación completada
     */
    COMPLETED("Completada", "La evaluación PEP ha sido completada"),
    
    /**
     * Pendiente de verificación adicional
     */
    PENDING_VERIFICATION("Pendiente de Verificación", "Requiere verificación adicional de la condición PEP"),
    
    /**
     * Revisión requerida
     */
    REVIEW_REQUIRED("Revisión Requerida", "Requiere revisión por cambios o actualización periódica"),
    
    /**
     * Aprobada por Oficial de Cumplimiento
     */
    APPROVED("Aprobada", "Evaluación aprobada por el Oficial de Cumplimiento");
    
    private final String displayName;
    private final String description;
    
    EvaluationStatus(String displayName, String description) {
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
