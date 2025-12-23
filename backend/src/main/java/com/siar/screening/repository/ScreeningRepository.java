package com.siar.screening.repository;

import com.siar.screening.model.Screening;
import com.siar.screening.model.ScreeningStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScreeningRepository extends JpaRepository<Screening, Long> {
    
    List<Screening> findByDossierId(Long dossierId);
    
    @Query("SELECT s FROM Screening s WHERE s.dossierId = :dossierId ORDER BY s.executionDate DESC")
    Optional<Screening> findLatestByDossierId(@Param("dossierId") Long dossierId);
    
    @Query("SELECT s FROM Screening s WHERE s.dossierId = :dossierId AND s.id < :screeningId ORDER BY s.executionDate DESC")
    Optional<Screening> findPreviousByDossierId(
        @Param("dossierId") Long dossierId,
        @Param("screeningId") Long screeningId
    );
    
    List<Screening> findByStatusAndHasRelevantMatches(ScreeningStatus status, Boolean hasRelevantMatches);
    
    @Query("SELECT s FROM Screening s WHERE s.executionDate BETWEEN :startDate AND :endDate")
    List<Screening> findByExecutionDateBetween(
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );
    
    @Query("SELECT COUNT(s) FROM Screening s WHERE s.executionDate >= :since")
    Long countScreeningsSince(@Param("since") Instant since);
    
    @Query("SELECT COUNT(s) FROM Screening s WHERE s.hasRelevantMatches = true AND s.executionDate >= :since")
    Long countScreeningsWithMatchesSince(@Param("since") Instant since);
}
