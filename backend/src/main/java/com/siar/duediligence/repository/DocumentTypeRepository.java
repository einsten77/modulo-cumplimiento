package com.siar.duediligence.repository;

import com.siar.duediligence.model.DocumentCategory;
import com.siar.duediligence.model.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
    
    Optional<DocumentType> findByCode(String code);
    
    List<DocumentType> findByCategory(DocumentCategory category);
    
    List<DocumentType> findByIsActive(Boolean isActive);
    
    @Query("SELECT dt FROM DocumentType dt WHERE dt.isActive = true " +
           "AND dt.isMandatory = true")
    List<DocumentType> findAllMandatory();
    
    // Esta query debe buscar en el JSONB usando funciones nativas de PostgreSQL
    @Query(value = "SELECT * FROM document_types dt WHERE dt.is_active = true " +
           "AND dt.applicable_to::jsonb ? :dossierType " +
           "AND dt.required_for_risk_levels::jsonb ? :riskLevel",
           nativeQuery = true)
    List<DocumentType> findRequiredDocuments(
        @Param("dossierType") String dossierType,
        @Param("riskLevel") String riskLevel
    );
}
