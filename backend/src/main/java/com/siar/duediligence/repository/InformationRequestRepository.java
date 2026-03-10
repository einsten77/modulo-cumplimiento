package com.siar.duediligence.repository;

import com.siar.duediligence.model.InformationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InformationRequestRepository extends JpaRepository<InformationRequest, Long> {
    
    Optional<InformationRequest> findByRequestId(String requestId);
    
    List<InformationRequest> findByDueDiligenceId(Long dueDiligenceId);
    
    @Query("SELECT ir FROM InformationRequest ir WHERE ir.dueDiligenceId = :ddId " +
           "AND ir.status = 'PENDIENTE' ORDER BY ir.dueDate ASC")
    List<InformationRequest> findPendingByDueDiligence(@Param("ddId") Long ddId);
    
    @Query("SELECT ir FROM InformationRequest ir WHERE ir.status = 'PENDIENTE' " +
           "AND ir.dueDate < :today")
    List<InformationRequest> findOverdue(@Param("today") LocalDate today);
    
    @Query("SELECT ir FROM InformationRequest ir WHERE ir.requestedBy = :userId " +
           "AND ir.status = 'PENDIENTE'")
    List<InformationRequest> findPendingByRequester(@Param("userId") Long userId);
}
