package com.siar.duediligence.model;

public enum DueDiligenceStatus {
    PENDIENTE,           // Estado inicial, esperando carga documental
    EN_REVISION,         // Analista de Cumplimiento revisando
    REQUIERE_INFORMACION, // Se necesita información adicional
    APROBADA,            // Oficial de Cumplimiento aprobó
    OBSERVADA,           // Oficial de Cumplimiento rechazó
    VENCIDA              // Documentos críticos vencidos
}
