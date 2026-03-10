package com.siar.alert.model;

/**
 * Enum que representa los niveles de prioridad de una alerta
 */
public enum AlertLevel {
    BAJA,      // Informativa, sin urgencia
    MEDIA,     // Requiere atención pero no urgente
    ALTA,      // Requiere atención pronta
    CRÍTICA    // Requiere atención inmediata
}
