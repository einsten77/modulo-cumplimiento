package com.siar.risk.model;

public enum EvaluationStatus {
    DRAFT,                          // Borrador en proceso
    PENDING_REVIEW,                 // Completada, pendiente de revisión
    APPROVED,                       // Aprobada, vigente
    REJECTED,                       // Rechazada, requiere corrección
    SUPERSEDED,                     // Reemplazada por versión más reciente
    PENDING_SUPERVISOR_APPROVAL     // Pendiente aprobación supervisor (override drástico)
}
