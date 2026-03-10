package com.siar.alert.model;

/**
 * Enum que representa los tipos de acción en el seguimiento de alertas
 */
public enum TrackingActionType {
    ASIGNADA,          // Alerta asignada a un usuario
    REASIGNADA,        // Alerta reasignada a otro usuario
    COMENTARIO,        // Usuario agregó un comentario
    ESTADO_CAMBIO,     // Cambio de estado de la alerta
    CERRADA,           // Alerta cerrada
    REABIERTA,         // Alerta reabierta (excepcional)
    ESCALADA,          // Alerta escalada a un superior
    EVIDENCIA_ADJUNTA  // Evidencia adjuntada
}
