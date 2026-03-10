package com.siar.audit.model;

/**
 * Categorías de eventos auditables en el Sistema SIAR
 * 
 * Cada categoría representa un módulo o área funcional del sistema
 * donde se generan eventos que deben ser auditados.
 */
public enum EventCategory {
    
    /**
     * Eventos relacionados con expedientes (dossiers)
     */
    DOSSIER("Expedientes", "Gestión de expedientes de clientes y proveedores"),
    
    /**
     * Eventos relacionados con debida diligencia
     */
    DUE_DILIGENCE("Debida Diligencia", "Gestión de documentos y verificaciones"),
    
    /**
     * Eventos relacionados con evaluación de riesgos
     */
    RISK_EVALUATION("Evaluación de Riesgos", "Evaluaciones y calificaciones de riesgo"),
    
    /**
     * Eventos relacionados con screening (listas restrictivas)
     */
    SCREENING("Screening", "Consultas a listas restrictivas y decisiones"),
    
    /**
     * Eventos relacionados con alertas
     */
    ALERTS("Alertas", "Generación, atención y resolución de alertas"),
    
    /**
     * Eventos relacionados con autenticación
     */
    AUTH("Autenticación", "Login, logout y gestión de sesiones"),
    
    /**
     * Eventos relacionados con roles y permisos (RBAC)
     */
    RBAC("Roles y Permisos", "Gestión de usuarios, roles y permisos"),
    
    /**
     * Eventos relacionados con gestión de PEP
     */
    PEP("Personas Expuestas Políticamente", "Gestión de condición PEP"),
    
    /**
     * Eventos del sistema
     */
    SYSTEM("Sistema", "Eventos técnicos y de infraestructura"),
    
    /**
     * Eventos relacionados con reportes
     */
    REPORTS("Reportes", "Generación y exportación de reportes"),
    
    /**
     * Eventos relacionados con configuración
     */
    CONFIG("Configuración", "Cambios en configuración del sistema");
    
    private final String displayName;
    private final String description;
    
    EventCategory(String displayName, String description) {
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
