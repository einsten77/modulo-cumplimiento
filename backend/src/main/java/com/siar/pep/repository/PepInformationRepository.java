package com.siar.pep.repository;

import com.siar.pep.model.PepInformation;
import com.siar.pep.model.PepType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PepInformationRepository extends JpaRepository<PepInformation, Long> {
    
    /**
     * Buscar información PEP por ID de expediente
     */
    Optional<PepInformation> findByDossierId(Long dossierId);
    
    /**
     * Buscar todos los PEPs activos
     */
    @Query("SELECT p FROM PepInformation p WHERE p.isPep = true AND p.pepType IN :activePepTypes")
    List<PepInformation> findAllActivePeps(@Param("activePepTypes") List<PepType> activePepTypes);
    
    /**
     * Buscar expedientes con revisión PEP pendiente
     */
    @Query("SELECT p FROM PepInformation p WHERE p.isPep = true AND p.nextReviewDate <= :date")
    List<PepInformation> findPendingReviews(@Param("date") LocalDate date);
    
    /**
     * Buscar Ex-PEPs próximos a cumplir período de degradación
     */
    @Query("SELECT p FROM PepInformation p WHERE p.pepType = 'PEP_FORMER' " +
           "AND CAST(p.pepDetails->>'cessationDate' AS date) <= :downgradeThresholdDate")
    List<PepInformation> findExPepsApproachingDowngrade(@Param("downgradeThresholdDate") LocalDate downgradeThresholdDate);
    
    /**
     * Contar PEPs por tipo
     */
    @Query("SELECT p.pepType, COUNT(p) FROM PepInformation p WHERE p.isPep = true GROUP BY p.pepType")
    List<Object[]> countByPepType();
    
    /**
     * Buscar expedientes que requieren aprobación del Oficial de Cumplimiento
     */
    @Query("SELECT p FROM PepInformation p WHERE p.isPep = true " +
           "AND p.complianceOfficerDecision IS NULL " +
           "AND p.dossier.status = 'UNDER_REVIEW'")
    List<PepInformation> findPendingComplianceOfficerApproval();
}
