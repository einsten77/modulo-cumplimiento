package com.siar.governance.model;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.Instant;

/**
 * Registro de Inconsistencia Detectada
 * 
 * Almacena inconsistencias encontradas por el motor de reglas:
 * - Duplicados
 * - Validaciones cruzadas fallidas
 * - Datos desactualizados
 * - Referencias rotas
 */
@Entity
@Table(name = "data_inconsistencies", indexes = {
    @Index(name = "idx_inconsistency_type", columnList = "inconsistencyType"),
    @Index(name = "idx_severity", columnList = "severity"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_detected_at", columnList = "detectedAt"),
    @Index(name = "idx_affected_entity", columnList = "affectedEntity, affectedEntityId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataInconsistency {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inconsistencyId;
    
    @Column(nullable = false, unique = true, length = 50)
    private String inconsistencyCode;  // INC-2024-000123
    
    @Column(nullable = false, length = 100)
    private String inconsistencyType;  // DUPLICATE, MISSING_RISK_EVAL, EXPIRED_DOCUMENT
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, length = 50)
    private String affectedEntity;  // Dossier, RiskEvaluation, Document
    
    @Column(nullable = false, length = 100)
    private String affectedEntityId;
    
    /**
     * Entidades adicionales afectadas (JSON array)
     * Ejemplo: múltiples expedientes en caso de duplicados
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode relatedEntities;
    
    /**
     * Detalles técnicos de la inconsistencia
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode technicalDetails;
    
    /**
     * Regla de validación que falló
     */
    @Column(length = 100)
    private String validationRule;
    
    @Column(nullable = false, updatable = false)
    private Instant detectedAt;
    
    @Column(length = 50)
    private String detectedBy;  // SYSTEM o userId
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private InconsistencyStatus status = InconsistencyStatus.DETECTED;
    
    @Column(length = 50)
    private String assignedTo;
    
    @Column
    private Instant assignedAt;
    
    /**
     * Alerta generada (si aplica)
     */
    @Column(length = 50)
    private String alertId;
    
    /**
     * Solicitud de corrección (si aplica)
     */
    @Column(length = 50)
    private String correctionRequestId;
    
    @Column
    private Instant resolvedAt;
    
    @Column(length = 50)
    private String resolvedBy;
    
    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;
    
    /**
     * Acción correctiva tomada
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ResolutionAction resolutionAction;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean requiresManualReview = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean autoResolvable = false;
    
    @Version
    private Long version;
}

enum Severity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

enum InconsistencyStatus {
    DETECTED,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    DISMISSED
}

enum ResolutionAction {
    DATA_CORRECTED,
    DUPLICATE_MERGED,
    DOCUMENT_UPDATED,
    EVALUATION_REFRESHED,
    FALSE_POSITIVE,
    MANUAL_OVERRIDE,
    OTHER
}
