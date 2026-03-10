package com.siar.duediligence.repository;

import com.siar.duediligence.model.DocumentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentHistoryRepository extends JpaRepository<DocumentHistory, Long> {
    
    List<DocumentHistory> findByDocumentIdOrderByChangeDateDesc(Long documentId);
    
    @Query("SELECT dh FROM DocumentHistory dh WHERE dh.documentId = :docId " +
           "AND dh.changeDate BETWEEN :startDate AND :endDate " +
           "ORDER BY dh.changeDate DESC")
    List<DocumentHistory> findByDocumentAndDateRange(
        @Param("docId") Long docId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT dh FROM DocumentHistory dh WHERE dh.changedBy = :userId " +
           "ORDER BY dh.changeDate DESC")
    List<DocumentHistory> findByUser(@Param("userId") Long userId);
    
    @Query("SELECT dh FROM DocumentHistory dh WHERE dh.changeType = :changeType " +
           "AND dh.changeDate >= :since ORDER BY dh.changeDate DESC")
    List<DocumentHistory> findRecentByType(
        @Param("changeType") String changeType,
        @Param("since") LocalDateTime since
    );
}
