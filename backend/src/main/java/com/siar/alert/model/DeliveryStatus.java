package com.siar.alert.model;

/**
 * Enum que representa el estado de entrega de una notificación
 */
public enum DeliveryStatus {
    PENDIENTE,   // Pendiente de envío
    ENVIADA,     // Enviada pero no confirmada
    ENTREGADA,   // Confirmada entrega
    FALLIDA      // Fallo en el envío
}
