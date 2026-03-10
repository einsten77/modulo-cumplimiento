package com.siar.screening.model;

public enum DecisionType {
    FALSE_POSITIVE,     // Falso positivo - no es la misma entidad
    TRUE_MATCH,         // Confirmado - es la misma entidad
    ESCALATE,           // Requiere escalamiento a superior
    PENDING_INFO        // Pendiente por información adicional
}
