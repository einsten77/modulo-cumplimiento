package com.siar.screening.repository;

import com.siar.screening.model.WatchlistEntry;
import com.siar.screening.model.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchlistEntryRepository extends JpaRepository<WatchlistEntry, Long> {
    
    List<WatchlistEntry> findByWatchlistIdAndIsActive(Long watchlistId, Boolean isActive);
    
    @Query("SELECT we FROM WatchlistEntry we WHERE we.watchlistId = :watchlistId " +
           "AND we.isActive = true AND we.entityType = :entityType")
    List<WatchlistEntry> findActiveEntriesByWatchlistAndType(
        @Param("watchlistId") Long watchlistId,
        @Param("entityType") EntityType entityType
    );
    
    @Query("SELECT COUNT(we) FROM WatchlistEntry we WHERE we.watchlistId = :watchlistId AND we.isActive = true")
    Long countActiveEntriesByWatchlist(@Param("watchlistId") Long watchlistId);
    
    @Query("SELECT we FROM WatchlistEntry we WHERE we.watchlistId IN :watchlistIds AND we.isActive = true")
    List<WatchlistEntry> findActiveEntriesByWatchlists(@Param("watchlistIds") List<Long> watchlistIds);
}
