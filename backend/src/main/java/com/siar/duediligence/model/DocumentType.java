package com.siar.duediligence.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.util.List;

@Entity
@Table(name = "document_types", indexes = {
    @Index(name = "idx_dt_code", columnList = "code"),
    @Index(name = "idx_dt_category", columnList = "category")
})
@Data
public class DocumentType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 20)
    private String code;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(columnDefinition = "text")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DocumentCategory category;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "applicable_to")
    private String applicableToJson;  // ["CLIENTE", "INTERMEDIARIO", etc.]
    
    @Column(nullable = false)
    private Boolean isMandatory;
    
    @Column(nullable = false)
    private Boolean requiresExpiration;
    
    private Integer defaultExpirationMonths;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "accepted_formats")
    private String acceptedFormatsJson;  // ["PDF", "JPG", "PNG"]
    
    @Column(nullable = false)
    private Integer maxFileSizeMB;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "required_for_risk_levels")
    private String requiredForRiskLevelsJson;  // ["BAJO", "MEDIO", "ALTO"]
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", name = "validation_rules")
    private String validationRulesJson;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Version
    private Long version;
}
