package com.siar.dossier.repository;

import com.siar.dossier.model.ApprovalRequestStatus;
import com.siar.dossier.model.DossierApprovalRequest;
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
public interface DossierApprovalRequestRepository extends JpaRepository<DossierApprovalRequest, UUID> {

    List<DossierApprovalRequest> findByDossierIdOrderByRequestedAtDesc(UUID dossierId);

    Page<DossierApprovalRequest> findByStatusOrderByRequestedAtDesc(
        ApprovalRequestStatus status,
        Pageable pageable
    );

    List<DossierApprovalRequest> findByRequestedByOrderByRequestedAtDesc(UUID userId);

    @Query("SELECT r FROM DossierApprovalRequest r WHERE " +
           "r.status = 'PENDING' AND " +
           "r.requestedAt < :threshold " +
           "ORDER BY r.requestedAt ASC")
    List<DossierApprovalRequest> findPendingOlderThan(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT COUNT(r) FROM DossierApprovalRequest r WHERE " +
           "r.dossierId = :dossierId AND r.status = 'PENDING'")
    Long countPendingRequestsByDossierId(@Param("dossierId") UUID dossierId);
}
