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
 * Solicitud de Corrección de Datos
 * 
 * Workflow formal para corrección de datos con aprobaciones:
 * - Correcciones menores: auto-aprobadas
 * - Correcciones mayores: requieren aprobación
 */
@Entity
@Table(name = "data_correction_requests", indexes = {
    @Index(name = "idx_correction_type", columnList = "correctionType"),
    @Index(name = "idx_correction_status", columnList = "status"),
    @Index(name = "idx_requested_at", columnList = "requestedAt"),
    @Index(name = "idx_affected_entity", columnList = "affectedEntity, affectedEntityId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataCorrectionRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String requestId;  // DCR-2024-00001
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CorrectionType correctionType;
    
    @Column(nullable = false, length = 50)
    private String affectedEntity;  // Dossier, RiskEvaluation, Document
    
    @Column(nullable = false, length = 100)
    private String affectedEntityId;
    
    /**
     * Campos a modificar con valores anteriores y nuevos
     * Estructura:
     * {
     *   "identification.firstName": { "old": "Juan", "new": "Juan Carlos" },
     *   "contactData.email": { "old": "old@mail.com", "new": "new@mail.com" }
     * }
     */
    @Type(JsonType.class)
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode fieldChanges;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String justification;
    
    /**
     * Documentos de respaldo (URLs o referencias)
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode supportingDocuments;
    
    @Column(nullable = false, length = 50, updatable = false)
    private String requestedBy;
    
    @Column(nullable = false, updatable = false)
    private Instant requestedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;
    
    @Column(length = 50)
    private String reviewedBy;
    
    @Column
    private Instant reviewedAt;
    
    @Column(columnDefinition = "TEXT")
    private String reviewNotes;
    
    @Column(length = 50)
    private String appliedBy;
    
    @Column
    private Instant appliedAt;
    
    /**
     * ID del cambio en el historial (una vez aplicado)
     */
    @Column(length = 50)
    private String changeHistoryId;
    
    /**
     * Inconsistencia relacionada (si fue detectada automáticamente)
     */
    @Column(length = 50)
    private String inconsistencyId;
    
    @Version
    private Long version;
    
    @PrePersist
    protected void onCreate() {
        requestedAt = Instant.now();
    }
}

enum CorrectionType {
    MINOR,    // Auto-aprobada, solo auditoría
    MAJOR     // Requiere aprobación explícita
}

enum RequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    APPLIED,
    CANCELLED
}
