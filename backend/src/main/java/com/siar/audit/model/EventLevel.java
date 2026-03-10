package com.siar.audit.model;

/**
 * Niveles de criticidad de eventos auditables
 * 
 * Define la importancia del evento desde la perspectiva de auditoría
 * y cumplimiento regulatorio.
 */
public enum EventLevel {
    
    /**
     * Evento informativo
     * Operaciones normales del sistema
     */
    INFO("Informativo", 1, "Operación normal del sistema"),
    
    /**
     * Evento de advertencia
     * Situaciones que requieren atención pero no son críticas
     */
    WARNING("Advertencia", 2, "Situación que requiere atención"),
    
    /**
     * Evento crítico
     * Decisiones importantes, cambios significativos
     * Requiere revisión por parte del Oficial de Cumplimiento
     */
    CRITICAL("Crítico", 3, "Evento de alta importancia regulatoria"),
    
    /**
     * Evento de seguridad
     * Intentos de acceso no autorizado, violaciones de seguridad
     */
    SECURITY("Seguridad", 4, "Evento relacionado con seguridad");
    
    private final String displayName;
    private final int severity;
    private final String description;
    
    EventLevel(String displayName, int severity, String description) {
        this.displayName = displayName;
        this.severity = severity;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getSeverity() {
        return severity;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Indica si el nivel es crítico o superior
     */
    public boolean requiresAttention() {
        return severity >= CRITICAL.severity;
    }
}
