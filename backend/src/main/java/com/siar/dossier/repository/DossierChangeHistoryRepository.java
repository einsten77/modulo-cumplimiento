package com.siar.dossier.repository;

import com.siar.dossier.model.ChangeType;
import com.siar.dossier.model.DossierChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DossierChangeHistoryRepository extends JpaRepository<DossierChangeHistory, UUID> {

    List<DossierChangeHistory> findByDossierIdOrderByChangedAtDesc(UUID dossierId);

    Page<DossierChangeHistory> findByDossierIdOrderByChangedAtDesc(UUID dossierId, Pageable pageable);

    List<DossierChangeHistory> findByChangedByOrderByChangedAtDesc(UUID userId);

    @Query("SELECT h FROM DossierChangeHistory h WHERE " +
           "h.dossierId = :dossierId AND " +
           "h.changeType = :changeType " +
           "ORDER BY h.changedAt DESC")
    List<DossierChangeHistory> findByDossierIdAndChangeType(
        @Param("dossierId") UUID dossierId,
        @Param("changeType") ChangeType changeType
    );

    @Query("SELECT h FROM DossierChangeHistory h WHERE " +
           "h.dossierId = :dossierId AND " +
           "h.changedAt BETWEEN :from AND :to " +
           "ORDER BY h.changedAt DESC")
    List<DossierChangeHistory> findByDossierIdAndDateRange(
        @Param("dossierId") UUID dossierId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    @Query("SELECT COUNT(h) FROM DossierChangeHistory h WHERE h.dossierId = :dossierId")
    Long countByDossierId(@Param("dossierId") UUID dossierId);
}
