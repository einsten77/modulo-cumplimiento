package com.siar.governance.model;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

/**
 * Catálogo Maestro Parametrizable
 * 
 * Permite gestionar listas de valores de referencia sin código:
 * - Productos de seguros
 * - Canales de distribución
 * - Países y zonas de riesgo
 * - Tipos documentales
 * - Otros valores de dominio
 */
@Entity
@Table(name = "master_catalogs", indexes = {
    @Index(name = "idx_catalog_type", columnList = "catalogType"),
    @Index(name = "idx_catalog_active", columnList = "isActive"),
    @Index(name = "idx_catalog_effective", columnList = "effectiveFrom, effectiveTo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterCatalog {
    
    @Id
    @Column(length = 50, nullable = false)
    private String catalogCode;  // CAT-PRODUCTS, CAT-CHANNELS, CAT-COUNTRIES
    
    @Column(nullable = false, length = 100)
    private String catalogName;  // "Productos de Seguros"
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CatalogType catalogType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * Valores del catálogo en formato JSON
     * Estructura flexible según el tipo de catálogo
     * 
     * Ejemplo para productos:
     * [
     *   {
     *     "code": "AUT-001",
     *     "name": "Seguro de Vehículos",
     *     "category": "AUTOMOVIL",
     *     "inherentRiskLevel": "MEDIO",
     *     "requiredDocuments": ["RIF", "CI_REPRESENTANTE"]
     *   }
     * ]
     */
    @Type(JsonType.class)
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode catalogValues;
    
    /**
     * Schema de validación JSON Schema para los valores
     * Define la estructura esperada de cada item en catalogValues
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode validationSchema;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    /**
     * Fecha desde la cual el catálogo es efectivo
     */
    @Column(nullable = false)
    private LocalDateTime effectiveFrom;
    
    /**
     * Fecha hasta la cual el catálogo es efectivo (null = indefinido)
     */
    @Column
    private LocalDateTime effectiveTo;
    
    /**
     * Orden de visualización
     */
    @Column
    private Integer displayOrder;
    
    /**
     * Indica si permite agregar valores personalizados por el usuario
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean allowCustomValues = false;
    
    /**
     * Indica si requiere aprobación para modificaciones
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean requiresApproval = false;
    
    // Auditoría
    @Column(nullable = false, updatable = false, length = 50)
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(length = 50)
    private String lastModifiedBy;
    
    @Column
    private LocalDateTime lastModifiedAt;
    
    @Column(length = 50)
    private String approvedBy;
    
    @Column
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String changeJustification;
    
    @Version
    @Column(nullable = false)
    private Long version;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (effectiveFrom == null) {
            effectiveFrom = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
    
    /**
     * Verifica si el catálogo está vigente en la fecha actual
     */
    public boolean isEffective() {
        LocalDateTime now = LocalDateTime.now();
        return isActive 
            && !now.isBefore(effectiveFrom)
            && (effectiveTo == null || !now.isAfter(effectiveTo));
    }
}

enum CatalogType {
    PRODUCTS,              // Productos de seguros
    DISTRIBUTION_CHANNELS, // Canales de distribución
    COUNTRIES,             // Países
    RISK_ZONES,            // Zonas de riesgo geográfico
    DOCUMENT_TYPES,        // Tipos de documentos
    OCCUPATION_TYPES,      // Tipos de ocupación
    ECONOMIC_ACTIVITIES,   // Actividades económicas
    RELATIONSHIP_TYPES,    // Tipos de relación comercial
    CURRENCY_CODES,        // Códigos de moneda
    CUSTOM                 // Catálogos personalizados
}
