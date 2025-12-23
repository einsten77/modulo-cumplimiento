package com.siar.alert.model;

/**
 * Enum que representa los estados del ciclo de vida de una alerta
 */
public enum AlertStatus {
    NUEVA,            // Alerta recién generada, no asignada o pendiente de atención
    EN_SEGUIMIENTO,   // Alerta en proceso de atención
    ATENDIDA,         // Alerta atendida pero pendiente de cierre formal
    CERRADA           // Alerta cerrada con justificación documentada
}
