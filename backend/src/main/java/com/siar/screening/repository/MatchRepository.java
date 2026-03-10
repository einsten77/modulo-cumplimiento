package com.siar.screening.repository;

import com.siar.screening.model.Match;
import com.siar.screening.model.MatchType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    @Query("SELECT m FROM Match m WHERE m.screeningResultId IN " +
           "(SELECT sr.id FROM ScreeningResult sr WHERE sr.screeningId = :screeningId)")
    List<Match> findByScreeningId(@Param("screeningId") Long screeningId);
    
    @Query("SELECT m FROM Match m WHERE m.screeningResultId IN " +
           "(SELECT sr.id FROM ScreeningResult sr WHERE sr.screeningId = :screeningId) " +
           "AND m.isRelevant = true")
    List<Match> findRelevantByScreeningId(@Param("screeningId") Long screeningId);
    
    @Query("SELECT m FROM Match m " +
           "JOIN ScreeningDecision sd ON sd.matchId = m.id " +
           "WHERE m.screeningResultId IN " +
           "(SELECT sr.id FROM ScreeningResult sr WHERE sr.screeningId = :screeningId) " +
           "AND sd.decision = 'TRUE_MATCH'")
    List<Match> findTrueMatchesByScreeningId(@Param("screeningId") Long screeningId);
    
    @Query("SELECT m FROM Match m WHERE m.requiresReview = true " +
           "AND NOT EXISTS (SELECT 1 FROM ScreeningDecision sd WHERE sd.matchId = m.id)")
    List<Match> findPendingReview();
    
    List<Match> findByMatchType(MatchType matchType);
    
    List<Match> findBySimilarityScoreGreaterThanEqual(BigDecimal threshold);
}
