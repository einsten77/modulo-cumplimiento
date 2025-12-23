package com.siar.dossier.repository;

import com.siar.dossier.model.Dossier;
import com.siar.dossier.model.DossierStatus;
import com.siar.dossier.model.DossierType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DossierRepository extends JpaRepository<Dossier, UUID>, 
                                          JpaSpecificationExecutor<Dossier> {

    Optional<Dossier> findByDossierNumber(String dossierNumber);

    List<Dossier> findByDossierTypeAndIsDeleted(DossierType dossierType, Boolean isDeleted);

    List<Dossier> findByStatusAndIsDeleted(DossierStatus status, Boolean isDeleted);

    Page<Dossier> findByDossierTypeAndIsDeleted(
        DossierType dossierType, 
        Boolean isDeleted, 
        Pageable pageable
    );

    @Query("SELECT d FROM Dossier d WHERE d.createdBy = :userId AND d.isDeleted = false")
    List<Dossier> findByCreatedBy(@Param("userId") UUID userId);

    @Query("SELECT d FROM Dossier d WHERE d.status = :status " +
           "AND d.isDeleted = false " +
           "AND d.updatedAt BETWEEN :from AND :to")
    List<Dossier> findByStatusAndDateRange(
        @Param("status") DossierStatus status,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    @Query("SELECT COUNT(d) FROM Dossier d WHERE d.status = :status AND d.isDeleted = false")
    Long countByStatus(@Param("status") DossierStatus status);

    @Query("SELECT COUNT(d) FROM Dossier d WHERE d.dossierType = :type AND d.isDeleted = false")
    Long countByType(@Param("type") DossierType type);

    @Query("SELECT d FROM Dossier d WHERE " +
           "d.isDeleted = false AND " +
           "(LOWER(CAST(d.generalData AS string)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(CAST(d.identificationData AS string)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.dossierNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Dossier> searchDossiers(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT d FROM Dossier d WHERE " +
           "d.completenessPercentage < 76.0 AND " +
           "d.status = 'INCOMPLETE' AND " +
           "d.isDeleted = false AND " +
           "d.createdAt < :threshold")
    List<Dossier> findIncompleteOlderThan(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT d FROM Dossier d WHERE " +
           "d.status = 'APPROVED' AND " +
           "d.isDeleted = false AND " +
           "CAST(d.generalData->'isPep' AS boolean) = true")
    List<Dossier> findApprovedPepDossiers();
}
