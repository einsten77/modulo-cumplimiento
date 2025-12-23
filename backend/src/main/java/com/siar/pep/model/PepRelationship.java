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
 * Entidad que representa la relación de un familiar o asociado con un PEP directo
 */
@Entity
@Table(name = "pep_relationship", indexes = {
    @Index(name = "idx_relationship_pep", columnList = "pep_id"),
    @Index(name = "idx_relationship_related", columnList = "related_pep_id"),
    @Index(name = "idx_relationship_type", columnList = "relationship_type"),
    @Index(name = "idx_relationship_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PepRelationship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "relationship_id")
    private Long id;
    
    @Column(name = "relationship_uuid", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID relationshipUuid = UUID.randomUUID();
    
    // PEP principal (familiar o asociado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pep_id", nullable = false)
    @JsonIgnore
    private PepInformation pepInformation;
    
    // PEP Directo relacionado (puede ser nulo si no está en el sistema)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_pep_id")
    @JsonIgnore
    private PepInformation relatedPepInformation;
    
    // Información del PEP Directo
    @Column(name = "related_person_name", length = 300)
    private String relatedPersonName;
    
    @Column(name = "related_person_document", length = 100)
    private String relatedPersonDocument;
    
    @Column(name = "related_person_position", length = 300)
    private String relatedPersonPosition;
    
    // Tipo de relación
    @Column(name = "relationship_type", nullable = false, length = 50)
    @NotBlank(message = "Tipo de relación es requerido")
    private String relationshipType; // FAMILY, ASSOCIATE
    
    @Column(name = "relationship_nature", nullable = false, length = 100)
    @NotBlank(message = "Naturaleza de la relación es requerida")
    private String relationshipNature; // SPOUSE, CHILD, PARENT, BUSINESS_PARTNER, etc.
    
    @Column(name = "relationship_degree", length = 50)
    private String relationshipDegree; // FIRST_DEGREE, SECOND_DEGREE
    
    // Fechas
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "Fecha de inicio de la relación es requerida")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    // Verificación
    @Column(name = "verification_source", length = 200)
    private String verificationSource;
    
    @Column(name = "verification_method", length = 100)
    private String verificationMethod;
    
    @Column(name = "document_reference", length = 200)
    private String documentReference;
    
    @Column(name = "verification_date")
    private LocalDate verificationDate;
    
    // Detalles adicionales
    @Column(name = "business_relationship_description", columnDefinition = "TEXT")
    private String businessRelationshipDescription; // Para asociados comerciales
    
    @Column(name = "financial_links_description", columnDefinition = "TEXT")
    private String financialLinksDescription; // Para asociados financieros
    
    // Observaciones
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
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Si tiene fecha de fin, ya no está activa
        if (endDate != null && endDate.isBefore(LocalDate.now())) {
            isActive = false;
        }
    }
    
    /**
     * Verifica si es relación familiar
     */
    public boolean isFamilyRelationship() {
        return "FAMILY".equalsIgnoreCase(relationshipType);
    }
    
    /**
     * Verifica si es relación de negocios
     */
    public boolean isBusinessRelationship() {
        return "ASSOCIATE".equalsIgnoreCase(relationshipType) || 
               "BUSINESS_PARTNER".equalsIgnoreCase(relationshipNature);
    }
}
