package com.siar.screening.model;

public enum ScreeningStatus {
    PENDING,        // Screening en cola
    IN_PROGRESS,    // Screening en ejecución
    COMPLETED,      // Screening completado
    ERROR,          // Error durante screening
    CANCELLED       // Screening cancelado
}
