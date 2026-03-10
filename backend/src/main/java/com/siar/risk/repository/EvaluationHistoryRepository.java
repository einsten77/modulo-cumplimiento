package com.siar.risk.repository;

import com.siar.risk.model.EvaluationHistory;
import com.siar.risk.model.HistoryChangeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationHistoryRepository extends JpaRepository<EvaluationHistory, Long> {
    
    List<EvaluationHistory> findByEvaluationIdOrderByChangedAtDesc(String evaluationId);
    
    List<EvaluationHistory> findByChangedBy(String changedBy);
    
    List<EvaluationHistory> findByChangeType(HistoryChangeType changeType);
}
