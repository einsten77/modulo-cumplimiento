package com.siar.audit.model;

/**
 * Tipos de acciones auditables en el Sistema SIAR
 */
public enum ActionType {
    
    // Operaciones CRUD básicas
    CREATE("Creación de recurso"),
    READ("Lectura de recurso"),
    UPDATE("Actualización de recurso"),
    DELETE("Eliminación de recurso"),
    
    // Operaciones de workflow
    SUBMIT("Envío para revisión"),
    APPROVE("Aprobación"),
    REJECT("Rechazo"),
    REVIEW("Revisión"),
    
    // Operaciones de estado
    STATUS_CHANGE("Cambio de estado"),
    ASSIGN("Asignación"),
    REASSIGN("Reasignación"),
    
    // Operaciones de autenticación
    LOGIN("Inicio de sesión"),
    LOGOUT("Cierre de sesión"),
    LOGIN_FAILED("Intento fallido de login"),
    PASSWORD_CHANGE("Cambio de contraseña"),
    PASSWORD_RESET("Reset de contraseña"),
    
    // Operaciones de autorización
    ACCESS_GRANTED("Acceso concedido"),
    ACCESS_DENIED("Acceso denegado"),
    PERMISSION_GRANT("Concesión de permiso"),
    PERMISSION_REVOKE("Revocación de permiso"),
    
    // Operaciones especializadas
    SCREENING_EXECUTE("Ejecución de screening"),
    SCREENING_DECISION("Decisión sobre screening"),
    RISK_EVALUATE("Evaluación de riesgo"),
    ALERT_GENERATE("Generación de alerta"),
    ALERT_RESOLVE("Resolución de alerta"),
    DOCUMENT_UPLOAD("Carga de documento"),
    REPORT_GENERATE("Generación de reporte"),
    EXPORT("Exportación de datos"),
    
    // Operaciones de configuración
    CONFIG_CHANGE("Cambio de configuración"),
    PARAMETER_CHANGE("Cambio de parámetro"),
    
    // Operaciones del sistema
    BACKUP("Respaldo"),
    RESTORE("Restauración"),
    MAINTENANCE("Mantenimiento"),
    
    // Operaciones sospechosas
    TAMPERING_ATTEMPT("Intento de manipulación"),
    INTEGRITY_VIOLATION("Violación de integridad");
    
    private final String description;
    
    ActionType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
