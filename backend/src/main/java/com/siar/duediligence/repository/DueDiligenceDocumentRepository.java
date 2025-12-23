package com.siar.duediligence.repository;

import com.siar.duediligence.model.DueDiligenceDocument;
import com.siar.duediligence.model.DocumentApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DueDiligenceDocumentRepository extends JpaRepository<DueDiligenceDocument, Long> {
    
    Optional<DueDiligenceDocument> findByDocumentId(String documentId);
    
    List<DueDiligenceDocument> findByDueDiligenceId(Long dueDiligenceId);
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.dueDiligenceId = :ddId " +
           "AND d.isCurrentVersion = true")
    List<DueDiligenceDocument> findCurrentVersionsByDueDiligence(@Param("ddId") Long ddId);
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.dueDiligenceId = :ddId " +
           "AND d.documentTypeId = :typeId AND d.isCurrentVersion = true")
    Optional<DueDiligenceDocument> findCurrentVersionByType(
        @Param("ddId") Long ddId,
        @Param("typeId") Long typeId
    );
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.dueDiligenceId = :ddId " +
           "AND d.documentTypeId = :typeId ORDER BY d.version DESC")
    List<DueDiligenceDocument> findAllVersionsByType(
        @Param("ddId") Long ddId,
        @Param("typeId") Long typeId
    );
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.expirationDate IS NOT NULL " +
           "AND d.expirationDate BETWEEN :startDate AND :endDate " +
           "AND d.isCurrentVersion = true AND d.approvalStatus = 'APROBADO'")
    List<DueDiligenceDocument> findExpiringDocuments(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.expirationDate < :today " +
           "AND d.isCurrentVersion = true AND d.approvalStatus != 'VENCIDO'")
    List<DueDiligenceDocument> findExpiredDocuments(@Param("today") LocalDate today);
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.approvalStatus = :status")
    List<DueDiligenceDocument> findByApprovalStatus(@Param("status") DocumentApprovalStatus status);
    
    @Query("SELECT d FROM DueDiligenceDocument d WHERE d.uploadedBy = :userId " +
           "AND d.approvalStatus = 'PENDIENTE'")
    List<DueDiligenceDocument> findPendingByUploader(@Param("userId") Long userId);
}
