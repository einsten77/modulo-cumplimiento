package com.siar.risk.model;

public enum EvaluationType {
    INITIAL,     // Evaluación inicial al crear expediente
    PERIODIC,    // Reevaluación periódica programada
    TRIGGERED,   // Reevaluación disparada por cambio significativo
    MANUAL       // Evaluación manual solicitada por Oficial de Cumplimiento
}
