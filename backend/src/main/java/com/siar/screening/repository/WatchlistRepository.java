package com.siar.screening.repository;

import com.siar.screening.model.Watchlist;
import com.siar.screening.model.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    
    Optional<Watchlist> findByCode(String code);
    
    List<Watchlist> findByIsActive(Boolean isActive);
    
    @Query("SELECT w FROM Watchlist w WHERE w.isActive = true ORDER BY w.priority DESC")
    List<Watchlist> findActiveWatchlistsOrderedByPriority();
    
    @Query("SELECT w FROM Watchlist w WHERE w.nextScheduledUpdate <= :now AND w.isActive = true")
    List<Watchlist> findWatchlistsDueForUpdate(@Param("now") Instant now);
    
    List<Watchlist> findByPriority(Priority priority);
    
    @Query("SELECT COUNT(w) FROM Watchlist w WHERE w.isActive = true")
    Long countActiveWatchlists();
}
