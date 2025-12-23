package com.siar.screening.repository;

import com.siar.screening.model.ScreeningResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreeningResultRepository extends JpaRepository<ScreeningResult, Long> {
    
    @Query("SELECT sr FROM ScreeningResult sr WHERE sr.screeningId = :screeningId")
    List<ScreeningResult> findByScreeningId(@Param("screeningId") Long screeningId);
    
    @Query("SELECT sr FROM ScreeningResult sr WHERE sr.screeningId = :screeningId AND sr.matchesFound > 0")
    List<ScreeningResult> findWithMatchesByScreeningId(@Param("screeningId") Long screeningId);
}
