package com.siar.user.model;

/**
 * Estados posibles de un usuario en el sistema SIAR
 */
public enum UserStatus {
    /**
     * Usuario creado pero pendiente de aprobación del Oficial de Cumplimiento
     */
    PENDING_APPROVAL,
    
    /**
     * Usuario activo con acceso al sistema
     */
    ACTIVE,
    
    /**
     * Usuario inactivo, sin acceso (eliminación lógica)
     */
    INACTIVE,
    
    /**
     * Usuario suspendido temporalmente (investigación, auditoría)
     */
    SUSPENDED
}
