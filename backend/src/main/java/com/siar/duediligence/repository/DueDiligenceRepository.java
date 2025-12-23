package com.siar.duediligence.repository;

import com.siar.duediligence.model.DueDiligence;
import com.siar.duediligence.model.DueDiligenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DueDiligenceRepository extends JpaRepository<DueDiligence, Long> {
    
    Optional<DueDiligence> findByDueDiligenceId(String dueDiligenceId);
    
    Optional<DueDiligence> findByDossierId(Long dossierId);
    
    List<DueDiligence> findByStatus(DueDiligenceStatus status);
    
    List<DueDiligence> findByStatusIn(List<DueDiligenceStatus> statuses);
    
    @Query("SELECT dd FROM DueDiligence dd WHERE dd.status = :status " +
           "AND dd.submittedDate < :beforeDate")
    List<DueDiligence> findPendingOlderThan(
        @Param("status") DueDiligenceStatus status,
        @Param("beforeDate") LocalDateTime beforeDate
    );
    
    @Query("SELECT dd FROM DueDiligence dd WHERE dd.reviewedBy = :userId " +
           "AND dd.status IN ('EN_REVISION', 'REQUIERE_INFORMACION')")
    List<DueDiligence> findByReviewer(@Param("userId") Long userId);
    
    @Query("SELECT dd FROM DueDiligence dd WHERE dd.riskLevel = :riskLevel " +
           "AND dd.status != 'APROBADA'")
    List<DueDiligence> findPendingByRiskLevel(@Param("riskLevel") String riskLevel);
    
    @Query("SELECT COUNT(dd) FROM DueDiligence dd WHERE dd.status = 'APROBADA'")
    Long countApproved();
    
    @Query("SELECT COUNT(dd) FROM DueDiligence dd WHERE dd.status IN ('PENDIENTE', 'EN_REVISION', 'REQUIERE_INFORMACION')")
    Long countPending();
}
