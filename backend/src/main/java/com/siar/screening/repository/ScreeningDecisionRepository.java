package com.siar.screening.repository;

import com.siar.screening.model.ScreeningDecision;
import com.siar.screening.model.DecisionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScreeningDecisionRepository extends JpaRepository<ScreeningDecision, Long> {
    
    Optional<ScreeningDecision> findByMatchId(Long matchId);
    
    List<ScreeningDecision> findByScreeningId(Long screeningId);
    
    @Query("SELECT sd FROM ScreeningDecision sd WHERE sd.screeningId = :screeningId AND sd.decision = :decision")
    List<ScreeningDecision> findByScreeningIdAndDecision(
        @Param("screeningId") Long screeningId,
        @Param("decision") DecisionType decision
    );
    
    @Query("SELECT sd FROM ScreeningDecision sd WHERE sd.decidedBy = :userId " +
           "AND sd.decidedAt BETWEEN :startDate AND :endDate")
    List<ScreeningDecision> findByDeciderAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );
    
    @Query("SELECT COUNT(sd) FROM ScreeningDecision sd WHERE sd.requiresEscalation = true " +
           "AND sd.escalatedTo IS NULL")
    Long countPendingEscalations();
    
    @Query("SELECT sd FROM ScreeningDecision sd WHERE sd.requiresEnhancedDueDiligence = true")
    List<ScreeningDecision> findRequiringEnhancedDueDiligence();
}
