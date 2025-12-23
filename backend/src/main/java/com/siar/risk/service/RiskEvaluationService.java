package com.siar.risk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.siar.risk.dto.CreateEvaluationRequest;
import com.siar.risk.dto.OverrideRequest;
import com.siar.risk.dto.RiskCalculationResult;
import com.siar.risk.model.*;
import com.siar.risk.repository.EvaluationHistoryRepository;
import com.siar.risk.repository.RiskAlertRepository;
import com.siar.risk.repository.RiskConfigurationRepository;
import com.siar.risk.repository.RiskEvaluationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskEvaluationService {
    
    private final RiskEvaluationRepository evaluationRepository;
    private final RiskConfigurationRepository configurationRepository;
    private final EvaluationHistoryRepository historyRepository;
    private final RiskAlertRepository alertRepository;
    private final RiskCalculationEngine calculationEngine;
    private final AuditService auditService;
    
    /**
     * Crea la evaluación inicial de riesgo para un expediente
     */
    @Transactional
    public RiskEvaluation createInitialEvaluation(CreateEvaluationRequest request) {
        log.info("Creating initial risk evaluation for dossier: {}", request.getDossierId());
        
        // Validar factores obligatorios
        validateMandatoryFactors(request.getRiskFactors());
        
        // Obtener configuración activa
        RiskConfiguration activeConfig = configurationRepository.findByIsActiveTrue()
            .orElseThrow(() -> new RuntimeException("No active risk configuration found"));
        
        // Calcular riesgo
        RiskCalculationResult calculationResult = calculationEngine.calculateRisk(
            request.getRiskFactors(), 
            activeConfig
        );
        
        // Generar ID y versión
        Integer nextVersion = getNextVersion(request.getDossierId());
        String evaluationId = generateEvaluationId(request.getDossierId(), nextVersion);
        
        // Determinar si requiere DD reforzada
        boolean requiresEnhancedDD = shouldRequireEnhancedDueDiligence(
            request.getRiskFactors(), 
            calculationResult.getRiskLevel()
        );
        
        // Calcular próxima fecha de revisión
        LocalDate nextReviewDate = calculateNextReviewDate(
            calculationResult.getRiskLevel(), 
            LocalDate.now()
        );
        
        // Crear evaluación
        RiskEvaluation evaluation = RiskEvaluation.builder()
            .evaluationId(evaluationId)
            .dossierId(request.getDossierId())
            .evaluationType(EvaluationType.INITIAL)
            .evaluationDate(LocalDateTime.now())
            .evaluatorUserId(request.getEvaluatorUserId())
            .version(nextVersion)
            .status(EvaluationStatus.PENDING_REVIEW)
            .riskFactorsJson(request.getRiskFactors())
            .calculationResultJson(calculationResult.toJson())
            .configurationId(activeConfig.getConfigurationId())
            .preliminaryRiskLevel(calculationResult.getRiskLevel())
            .finalRiskLevel(null)  // Será asignado tras revisión
            .hasManualOverride(false)
            .requiresEnhancedDueDiligence(requiresEnhancedDD)
            .requiresApproval(true)
            .nextReviewDate(nextReviewDate)
            .comments(request.getComments())
            .build();
        
        RiskEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // Registrar en historial
        recordHistory(savedEvaluation, HistoryChangeType.CREATED, request.getEvaluatorUserId(), 
            null, "Evaluación inicial creada");
        
        // Generar alertas si aplica
        generateAlertsIfNeeded(savedEvaluation);
        
        // Auditoría
        auditService.logEvent("RISK-001", "Evaluación de riesgo creada", 
            request.getEvaluatorUserId(), "RiskEvaluation", evaluationId);
        
        log.info("Initial risk evaluation created: {} with preliminary level: {}", 
            evaluationId, calculationResult.getRiskLevel());
        
        return savedEvaluation;
    }
    
    /**
     * Actualiza una evaluación existente (solo si está en DRAFT)
     */
    @Transactional
    public RiskEvaluation updateEvaluation(String evaluationId, JsonNode updatedFactors, String userId) {
        log.info("Updating risk evaluation: {}", evaluationId);
        
        RiskEvaluation evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found: " + evaluationId));
        
        if (evaluation.getStatus() != EvaluationStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT evaluations can be updated");
        }
        
        // Guardar estado anterior
        JsonNode previousState = evaluation.getRiskFactorsJson();
        
        // Actualizar factores
        evaluation.setRiskFactorsJson(updatedFactors);
        
        // Recalcular riesgo
        RiskConfiguration activeConfig = configurationRepository.findByIsActiveTrue()
            .orElseThrow(() -> new RuntimeException("No active risk configuration found"));
        
        RiskCalculationResult calculationResult = calculationEngine.calculateRisk(
            updatedFactors, 
            activeConfig
        );
        
        evaluation.setCalculationResultJson(calculationResult.toJson());
        evaluation.setPreliminaryRiskLevel(calculationResult.getRiskLevel());
        
        RiskEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // Registrar en historial
        recordHistory(savedEvaluation, HistoryChangeType.UPDATED, userId, 
            previousState, "Factores de riesgo actualizados");
        
        auditService.logEvent("RISK-002", "Evaluación de riesgo actualizada", 
            userId, "RiskEvaluation", evaluationId);
        
        return savedEvaluation;
    }
    
    /**
     * Aplica un override manual al resultado de la evaluación
     * Solo ejecutable por Oficial de Cumplimiento
     */
    @Transactional
    public RiskEvaluation applyManualOverride(String evaluationId, OverrideRequest request, String userId) {
        log.info("Applying manual override to evaluation: {}", evaluationId);
        
        RiskEvaluation evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found: " + evaluationId));
        
        // Validar justificación
        if (request.getJustification() == null || request.getJustification().trim().length() < 50) {
            throw new RuntimeException("Override requires detailed justification (min 50 characters)");
        }
        
        // Determinar si requiere aprobación de supervisor
        boolean requiresSupervisorApproval = isDrasticChange(
            evaluation.getPreliminaryRiskLevel(), 
            request.getFinalRiskLevel()
        );
        
        // Aplicar override
        evaluation.setFinalRiskLevel(request.getFinalRiskLevel());
        evaluation.setHasManualOverride(true);
        evaluation.setManualOverrideJustification(request.getJustification());
        evaluation.setOverrideAppliedBy(userId);
        evaluation.setOverrideAppliedAt(LocalDateTime.now());
        
        if (requiresSupervisorApproval) {
            evaluation.setStatus(EvaluationStatus.PENDING_SUPERVISOR_APPROVAL);
            
            // Generar alerta para supervisor
            createAlert(evaluation, RiskAlertType.SUPERVISOR_APPROVAL_REQUIRED, 
                AlertSeverity.HIGH, 
                "Override drástico requiere aprobación de supervisor: " + 
                evaluation.getPreliminaryRiskLevel() + " → " + request.getFinalRiskLevel(),
                "SUPERVISOR");
        }
        
        RiskEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // Registrar en historial
        recordHistory(savedEvaluation, HistoryChangeType.OVERRIDE_APPLIED, userId, 
            null, request.getJustification());
        
        // Generar alerta
        createAlert(savedEvaluation, RiskAlertType.MANUAL_OVERRIDE_APPLIED, 
            AlertSeverity.MEDIUM, 
            "Override manual aplicado por Oficial de Cumplimiento",
            "COMPLIANCE_OFFICER");
        
        auditService.logEvent("RISK-003", "Override manual aplicado", 
            userId, "RiskEvaluation", evaluationId);
        
        log.info("Manual override applied to evaluation: {} from {} to {}", 
            evaluationId, evaluation.getPreliminaryRiskLevel(), request.getFinalRiskLevel());
        
        return savedEvaluation;
    }
    
    /**
     * Aprueba una evaluación
     */
    @Transactional
    public RiskEvaluation approveEvaluation(String evaluationId, String approvalComments, String userId) {
        log.info("Approving risk evaluation: {}", evaluationId);
        
        RiskEvaluation evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found: " + evaluationId));
        
        if (evaluation.getStatus() != EvaluationStatus.PENDING_REVIEW && 
            evaluation.getStatus() != EvaluationStatus.PENDING_SUPERVISOR_APPROVAL) {
            throw new RuntimeException("Only PENDING_REVIEW or PENDING_SUPERVISOR_APPROVAL evaluations can be approved");
        }
        
        // Si no hubo override, el final es igual al preliminar
        if (!evaluation.getHasManualOverride()) {
            evaluation.setFinalRiskLevel(evaluation.getPreliminaryRiskLevel());
        }
        
        evaluation.setStatus(EvaluationStatus.APPROVED);
        evaluation.setApprovedBy(userId);
        evaluation.setApprovedAt(LocalDateTime.now());
        evaluation.setComments(approvalComments);
        
        // Marcar versiones anteriores como SUPERSEDED
        supersedePreviousVersions(evaluation.getDossierId(), evaluation.getVersion());
        
        RiskEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // Registrar en historial
        recordHistory(savedEvaluation, HistoryChangeType.APPROVED, userId, 
            null, approvalComments);
        
        auditService.logEvent("RISK-004", "Evaluación de riesgo aprobada", 
            userId, "RiskEvaluation", evaluationId);
        
        return savedEvaluation;
    }
    
    /**
     * Rechaza una evaluación
     */
    @Transactional
    public RiskEvaluation rejectEvaluation(String evaluationId, String rejectionReason, String userId) {
        log.info("Rejecting risk evaluation: {}", evaluationId);
        
        RiskEvaluation evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found: " + evaluationId));
        
        evaluation.setStatus(EvaluationStatus.REJECTED);
        evaluation.setRejectionReason(rejectionReason);
        
        RiskEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        // Registrar en historial
        recordHistory(savedEvaluation, HistoryChangeType.REJECTED, userId, 
            null, rejectionReason);
        
        auditService.logEvent("RISK-005", "Evaluación de riesgo rechazada", 
            userId, "RiskEvaluation", evaluationId);
        
        return savedEvaluation;
    }
    
    /**
     * Dispara una reevaluación por cambio significativo
     */
    @Transactional
    public RiskEvaluation triggerReevaluation(String dossierId, String triggerReason, String userId) {
        log.info("Triggering reevaluation for dossier: {} due to: {}", dossierId, triggerReason);
        
        // Obtener evaluación actual
        RiskEvaluation currentEvaluation = getCurrentEvaluation(dossierId);
        
        if (currentEvaluation == null) {
            throw new RuntimeException("No current evaluation found for dossier: " + dossierId);
        }
        
        // Crear nueva versión
        Integer nextVersion = getNextVersion(dossierId);
        String newEvaluationId = generateEvaluationId(dossierId, nextVersion);
        
        RiskEvaluation newEvaluation = RiskEvaluation.builder()
            .evaluationId(newEvaluationId)
            .dossierId(dossierId)
            .evaluationType(EvaluationType.TRIGGERED)
            .evaluationDate(LocalDateTime.now())
            .evaluatorUserId(userId)
            .version(nextVersion)
            .status(EvaluationStatus.DRAFT)
            .riskFactorsJson(currentEvaluation.getRiskFactorsJson())  // Copiar factores actuales
            .configurationId(currentEvaluation.getConfigurationId())
            .hasManualOverride(false)
            .requiresApproval(true)
            .comments("Reevaluación disparada por: " + triggerReason)
            .build();
        
        RiskEvaluation savedEvaluation = evaluationRepository.save(newEvaluation);
        
        // Registrar en historial
        recordHistory(savedEvaluation, HistoryChangeType.CREATED, userId, 
            null, "Reevaluación disparada por: " + triggerReason);
        
        auditService.logEvent("RISK-007", "Reevaluación disparada", 
            userId, "RiskEvaluation", newEvaluationId);
        
        return savedEvaluation;
    }
    
    /**
     * Obtiene la evaluación vigente de un expediente
     */
    public RiskEvaluation getCurrentEvaluation(String dossierId) {
        return evaluationRepository.findByDossierIdAndStatus(dossierId, EvaluationStatus.APPROVED)
            .stream()
            .max((e1, e2) -> e1.getVersion().compareTo(e2.getVersion()))
            .orElse(null);
    }
    
    // ========== Métodos Auxiliares ==========
    
    private void validateMandatoryFactors(JsonNode riskFactors) {
        String[] requiredCategories = {
            "subjectRisk", "productRisk", "channelRisk", 
            "geographicRisk", "internalControls"
        };
        
        for (String category : requiredCategories) {
            if (!riskFactors.has(category)) {
                throw new RuntimeException("Missing mandatory risk category: " + category);
            }
        }
    }
    
    private boolean shouldRequireEnhancedDueDiligence(JsonNode riskFactors, RiskLevel riskLevel) {
        // Requiere DD reforzada si:
        // 1. Riesgo es ALTO
        // 2. PEP detectado con valor >= 4
        
        if (riskLevel == RiskLevel.ALTO) {
            return true;
        }
        
        JsonNode pepStatus = riskFactors.path("subjectRisk").path("pepStatus").path("value");
        if (!pepStatus.isMissingNode() && pepStatus.asInt() >= 4) {
            return true;
        }
        
        return false;
    }
    
    private LocalDate calculateNextReviewDate(RiskLevel riskLevel, LocalDate evaluationDate) {
        switch (riskLevel) {
            case ALTO:
                return evaluationDate.plusMonths(6);
            case MEDIO:
                return evaluationDate.plusMonths(12);
            case BAJO:
                return evaluationDate.plusMonths(24);
            default:
                throw new IllegalArgumentException("Invalid risk level");
        }
    }
    
    private String generateEvaluationId(String dossierId, Integer version) {
        // DOS-CLI-2024-000123 → EVAL-2024-000123-v1
        String dossierNumber = dossierId.substring(dossierId.lastIndexOf("-") + 1);
        String year = String.valueOf(LocalDateTime.now().getYear());
        return String.format("EVAL-%s-%s-v%d", year, dossierNumber, version);
    }
    
    private Integer getNextVersion(String dossierId) {
        return evaluationRepository.findByDossierId(dossierId)
            .stream()
            .map(RiskEvaluation::getVersion)
            .max(Integer::compareTo)
            .orElse(0) + 1;
    }
    
    private boolean isDrasticChange(RiskLevel from, RiskLevel to) {
        return (from == RiskLevel.BAJO && to == RiskLevel.ALTO) ||
               (from == RiskLevel.ALTO && to == RiskLevel.BAJO);
    }
    
    private void supersedePreviousVersions(String dossierId, Integer currentVersion) {
        evaluationRepository.findByDossierId(dossierId).stream()
            .filter(e -> e.getVersion() < currentVersion)
            .filter(e -> e.getStatus() == EvaluationStatus.APPROVED)
            .forEach(e -> {
                e.setStatus(EvaluationStatus.SUPERSEDED);
                evaluationRepository.save(e);
            });
    }
    
    private void recordHistory(RiskEvaluation evaluation, HistoryChangeType changeType, 
                               String userId, JsonNode previousState, String justification) {
        EvaluationHistory history = EvaluationHistory.builder()
            .evaluationId(evaluation.getEvaluationId())
            .changeType(changeType)
            .changedBy(userId)
            .previousStateJson(previousState)
            .newStateJson(evaluation.getRiskFactorsJson())
            .changeJustification(justification)
            .build();
        
        historyRepository.save(history);
    }
    
    private void generateAlertsIfNeeded(RiskEvaluation evaluation) {
        if (evaluation.getPreliminaryRiskLevel() == RiskLevel.ALTO) {
            createAlert(evaluation, RiskAlertType.HIGH_RISK_EVALUATION, 
                AlertSeverity.HIGH, 
                "Evaluación de riesgo ALTO detectada para expediente " + evaluation.getDossierId(),
                "COMPLIANCE_OFFICER");
        } else if (evaluation.getPreliminaryRiskLevel() == RiskLevel.MEDIO) {
            createAlert(evaluation, RiskAlertType.MEDIUM_RISK_EVALUATION, 
                AlertSeverity.MEDIUM, 
                "Evaluación de riesgo MEDIO detectada para expediente " + evaluation.getDossierId(),
                "COMPLIANCE_OFFICER");
        }
        
        if (evaluation.getRequiresEnhancedDueDiligence()) {
            createAlert(evaluation, RiskAlertType.ENHANCED_DD_REQUIRED, 
                AlertSeverity.MEDIUM, 
                "Se requiere debida diligencia reforzada para expediente " + evaluation.getDossierId(),
                "COMPLIANCE_ANALYST");
        }
    }
    
    private void createAlert(RiskEvaluation evaluation, RiskAlertType alertType, 
                            AlertSeverity severity, String message, String assignedTo) {
        RiskAlert alert = RiskAlert.builder()
            .evaluationId(evaluation.getEvaluationId())
            .alertType(alertType)
            .severity(severity)
            .alertMessage(message)
            .assignedTo(assignedTo)
            .status(AlertStatus.OPEN)
            .build();
        
        alertRepository.save(alert);
    }
}
