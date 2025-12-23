package com.siar.user.model;

/**
 * Severidad de la incompatibilidad de roles
 */
public enum IncompatibilitySeverity {
    /**
     * Incompatibilidad bloqueante - No permite la asignación
     */
    BLOCKING,
    
    /**
     * Incompatibilidad de advertencia - Permite pero genera alerta
     */
    WARNING
}
