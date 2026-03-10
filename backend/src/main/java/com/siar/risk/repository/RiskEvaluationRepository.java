package com.siar.risk.repository;

import com.siar.risk.model.EvaluationStatus;
import com.siar.risk.model.RiskEvaluation;
import com.siar.risk.model.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RiskEvaluationRepository extends JpaRepository<RiskEvaluation, String> {
    
    List<RiskEvaluation> findByDossierId(String dossierId);
    
    List<RiskEvaluation> findByDossierIdAndStatus(String dossierId, EvaluationStatus status);
    
    List<RiskEvaluation> findByStatus(EvaluationStatus status);
    
    List<RiskEvaluation> findByFinalRiskLevel(RiskLevel riskLevel);
    
    List<RiskEvaluation> findByEvaluatorUserId(String evaluatorUserId);
    
    List<RiskEvaluation> findByRequiresEnhancedDueDiligenceTrue();
    
    @Query("SELECT e FROM RiskEvaluation e WHERE e.nextReviewDate <= :date AND e.status = 'APPROVED'")
    List<RiskEvaluation> findDueForReview(@Param("date") LocalDate date);
    
    @Query("SELECT e FROM RiskEvaluation e WHERE e.evaluationDate BETWEEN :startDate AND :endDate")
    List<RiskEvaluation> findByEvaluationDateBetween(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT e FROM RiskEvaluation e WHERE e.hasManualOverride = true")
    List<RiskEvaluation> findWithManualOverrides();
}
