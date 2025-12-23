package com.siar.pep.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que representa un cargo o posición ocupada por un PEP
 */
@Entity
@Table(name = "pep_position", indexes = {
    @Index(name = "idx_position_pep", columnList = "pep_id"),
    @Index(name = "idx_position_current", columnList = "is_current"),
    @Index(name = "idx_position_type", columnList = "position_type"),
    @Index(name = "idx_position_institution", columnList = "institution_name"),
    @Index(name = "idx_position_dates", columnList = "start_date, end_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PepPosition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "position_id")
    private Long id;
    
    @Column(name = "position_uuid", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID positionUuid = UUID.randomUUID();
    
    // Relación con PepInformation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pep_id", nullable = false)
    @JsonIgnore
    private PepInformation pepInformation;
    
    // Tipo de posición
    @Column(name = "position_type", nullable = false, length = 50)
    @NotBlank(message = "Tipo de posición es requerido")
    private String positionType; // Referencia a catálogo de tipos PEP
    
    @Column(name = "position_title", nullable = false, length = 300)
    @NotBlank(message = "Título de la posición es requerido")
    private String positionTitle;
    
    @Column(name = "position_level", length = 50)
    private String positionLevel; // NATIONAL, STATE, MUNICIPAL, INTERNATIONAL
    
    // Institución
    @Column(name = "institution_name", nullable = false, length = 300)
    @NotBlank(message = "Nombre de la institución es requerido")
    private String institutionName;
    
    @Column(name = "institution_type", length = 100)
    private String institutionType; // EXECUTIVE, LEGISLATIVE, JUDICIAL, MILITARY, SOE, REGULATOR
    
    @Column(name = "institution_sector", length = 100)
    private String institutionSector; // PUBLIC, MIXED, INTERNATIONAL
    
    @Column(name = "jurisdiction", nullable = false, length = 100)
    @NotBlank(message = "Jurisdicción es requerida")
    private String jurisdiction; // País o jurisdicción
    
    // Fechas
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "Fecha de inicio es requerida")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private Boolean isCurrent = true;
    
    // Verificación
    @Column(name = "verification_source", length = 200)
    private String verificationSource;
    
    @Column(name = "verification_method", length = 100)
    private String verificationMethod; // OFFICIAL_GAZETTE, PUBLIC_REGISTRY, MEDIA, WEBSITE
    
    @Column(name = "document_reference", length = 200)
    private String documentReference;
    
    @Column(name = "verification_date")
    private LocalDate verificationDate;
    
    @Column(name = "last_verification_date")
    private LocalDate lastVerificationDate;
    
    // Control
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "requires_update", nullable = false)
    @Builder.Default
    private Boolean requiresUpdate = false;
    
    // Observaciones
    @Column(name = "responsibilities", columnDefinition = "TEXT")
    private String responsibilities;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // Auditoría
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isCurrent == null) {
            isCurrent = (endDate == null);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Si tiene fecha de fin, ya no es cargo actual
        if (endDate != null && endDate.isBefore(LocalDate.now())) {
            isCurrent = false;
        }
    }
    
    /**
     * Verifica si el cargo ya finalizó
     */
    public boolean hasEnded() {
        return endDate != null && endDate.isBefore(LocalDate.now());
    }
    
    /**
     * Calcula la duración del cargo en meses
     */
    public Long getDurationInMonths() {
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return java.time.temporal.ChronoUnit.MONTHS.between(startDate, end);
    }
}
