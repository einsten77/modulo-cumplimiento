package com.siar.screening.service;

import com.siar.screening.model.*;
import com.siar.screening.repository.*;
import com.siar.alert.service.AlertService;
import com.siar.audit.service.AuditService;
import com.siar.risk.service.RiskEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ScreeningDecisionService {
    
    @Autowired
    private ScreeningDecisionRepository decisionRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private ScreeningRepository screeningRepository;
    
    @Autowired
    private RiskEvaluationService riskEvaluationService;
    
    @Autowired
    private AlertService alertService;
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Registra decisión del Oficial de Cumplimiento sobre una coincidencia
     */
    @Transactional
    public ScreeningDecision registerDecision(
        Long matchId,
        DecisionType decision,
        String justification,
        User complianceOfficer
    ) {
        // Validar que el usuario sea Oficial de Cumplimiento
        if (!complianceOfficer.hasRole("COMPLIANCE_OFFICER")) {
            throw new RuntimeException("Only Compliance Officers can make screening decisions");
        }
        
        // Verificar que no exista decisión previa
        if (decisionRepository.findByMatchId(matchId).isPresent()) {
            throw new RuntimeException("Decision already exists for match: " + matchId);
        }
        
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found: " + matchId));
        
        Screening screening = screeningRepository.findById(
            match.getScreeningResultId()
        ).orElseThrow(() -> new RuntimeException("Screening not found"));
        
        // Crear decisión
        ScreeningDecision screeningDecision = new ScreeningDecision();
        screeningDecision.setMatchId(matchId);
        screeningDecision.setScreeningId(screening.getId());
        screeningDecision.setDecision(decision);
        screeningDecision.setJustification(justification);
        screeningDecision.setDecidedBy(complianceOfficer.getId());
        screeningDecision.setDecidedAt(Instant.now());
        
        // Determinar acciones según el tipo de decisión
        switch (decision) {
            case TRUE_MATCH:
                screeningDecision.setImpactOnRisk(true);
                screeningDecision.setRequiresEnhancedDueDiligence(true);
                
                // Incrementar nivel de riesgo
                riskEvaluationService.handleScreeningTrueMatch(
                    screening.getDossierId(),
                    matchId
                );
                
                // Alerta crítica
                alertService.createCriticalScreeningMatchAlert(
                    screening.getId(),
                    screening.getDossierId(),
                    matchId
                );
                break;
                
            case FALSE_POSITIVE:
                screeningDecision.setImpactOnRisk(false);
                screeningDecision.setRequiresEnhancedDueDiligence(false);
                break;
                
            case ESCALATE:
                screeningDecision.setRequiresEscalation(true);
                // TODO: Implementar lógica de escalamiento
                break;
                
            case PENDING_INFO:
                // Solicitar información adicional
                break;
        }
        
        screeningDecision = decisionRepository.save(screeningDecision);
        
        // Auditoría
        auditService.logScreeningDecision(screeningDecision, complianceOfficer);
        
        return screeningDecision;
    }
    
    /**
     * Obtiene decisión de una coincidencia
     */
    public ScreeningDecision getDecision(Long matchId) {
        return decisionRepository.findByMatchId(matchId)
            .orElse(null);
    }
    
    /**
     * Obtiene todas las decisiones de un screening
     */
    public List<ScreeningDecision> getScreeningDecisions(Long screeningId) {
        return decisionRepository.findByScreeningId(screeningId);
    }
}
