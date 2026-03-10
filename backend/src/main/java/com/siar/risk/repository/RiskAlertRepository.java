package com.siar.risk.repository;

import com.siar.risk.model.AlertStatus;
import com.siar.risk.model.RiskAlert;
import com.siar.risk.model.RiskAlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {
    
    List<RiskAlert> findByEvaluationId(String evaluationId);
    
    List<RiskAlert> findByStatus(AlertStatus status);
    
    List<RiskAlert> findByAssignedTo(String assignedTo);
    
    List<RiskAlert> findByAlertType(RiskAlertType alertType);
    
    List<RiskAlert> findByAssignedToAndStatus(String assignedTo, AlertStatus status);
}
