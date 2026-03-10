package com.siar.duediligence.model;

public enum DocumentApprovalStatus {
    PENDIENTE,
    EN_REVISION,
    APROBADO,
    RECHAZADO,
    VENCIDO,
    OBSOLETO  // Cuando hay una versión más nueva aprobada
}
