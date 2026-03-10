package com.siar.risk.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.siar.risk.dto.CreateEvaluationRequest;
import com.siar.risk.dto.OverrideRequest;
import com.siar.risk.model.RiskEvaluation;
import com.siar.risk.service.RiskEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/risk-evaluations")
@RequiredArgsConstructor
public class RiskEvaluationController {
    
    private final RiskEvaluationService evaluationService;
    
    /**
     * POST /api/v1/dossiers/{dossierId}/risk-evaluations/initial
     * Crea la evaluación inicial de riesgo
     */
    @PostMapping("/dossiers/{dossierId}/initial")
    @PreAuthorize("hasPermission('risk:evaluation:create')")
    public ResponseEntity<RiskEvaluation> createInitialEvaluation(
        @PathVariable String dossierId,
        @RequestBody CreateEvaluationRequest request
    ) {
        request.setDossierId(dossierId);
        RiskEvaluation evaluation = evaluationService.createInitialEvaluation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluation);
    }
    
    /**
     * PUT /api/v1/risk-evaluations/{evaluationId}
     * Actualiza una evaluación existente (solo DRAFT)
     */
    @PutMapping("/{evaluationId}")
    @PreAuthorize("hasPermission('risk:evaluation:update')")
    public ResponseEntity<RiskEvaluation> updateEvaluation(
        @PathVariable String evaluationId,
        @RequestBody JsonNode updatedFactors,
        @RequestHeader("X-User-Id") String userId
    ) {
        RiskEvaluation evaluation = evaluationService.updateEvaluation(evaluationId, updatedFactors, userId);
        return ResponseEntity.ok(evaluation);
    }
    
    /**
     * POST /api/v1/risk-evaluations/{evaluationId}/override
     * Aplica override manual (solo Oficial de Cumplimiento)
     */
    @PostMapping("/{evaluationId}/override")
    @PreAuthorize("hasPermission('risk:evaluation:override')")
    public ResponseEntity<RiskEvaluation> applyManualOverride(
        @PathVariable String evaluationId,
        @RequestBody OverrideRequest request,
        @RequestHeader("X-User-Id") String userId
    ) {
        RiskEvaluation evaluation = evaluationService.applyManualOverride(evaluationId, request, userId);
        return ResponseEntity.ok(evaluation);
    }
    
    /**
     * POST /api/v1/risk-evaluations/{evaluationId}/approve
     * Aprueba una evaluación
     */
    @PostMapping("/{evaluationId}/approve")
    @PreAuthorize("hasPermission('risk:evaluation:approve')")
    public ResponseEntity<RiskEvaluation> approveEvaluation(
        @PathVariable String evaluationId,
        @RequestBody String approvalComments,
        @RequestHeader("X-User-Id") String userId
    ) {
        RiskEvaluation evaluation = evaluationService.approveEvaluation(evaluationId, approvalComments, userId);
        return ResponseEntity.ok(evaluation);
    }
    
    /**
     * POST /api/v1/risk-evaluations/{evaluationId}/reject
     * Rechaza una evaluación
     */
    @PostMapping("/{evaluationId}/reject")
    @PreAuthorize("hasPermission('risk:evaluation:approve')")
    public ResponseEntity<RiskEvaluation> rejectEvaluation(
        @PathVariable String evaluationId,
        @RequestBody String rejectionReason,
        @RequestHeader("X-User-Id") String userId
    ) {
        RiskEvaluation evaluation = evaluationService.rejectEvaluation(evaluationId, rejectionReason, userId);
        return ResponseEntity.ok(evaluation);
    }
    
    /**
     * GET /api/v1/dossiers/{dossierId}/risk-evaluations/current
     * Obtiene la evaluación vigente
     */
    @GetMapping("/dossiers/{dossierId}/current")
    @PreAuthorize("hasPermission('risk:evaluation:read')")
    public ResponseEntity<RiskEvaluation> getCurrentEvaluation(@PathVariable String dossierId) {
        RiskEvaluation evaluation = evaluationService.getCurrentEvaluation(dossierId);
        return evaluation != null 
            ? ResponseEntity.ok(evaluation) 
            : ResponseEntity.notFound().build();
    }
    
    /**
     * GET /api/v1/dossiers/{dossierId}/risk-evaluations/history
     * Obtiene el historial de evaluaciones
     */
    @GetMapping("/dossiers/{dossierId}/history")
    @PreAuthorize("hasPermission('risk:history:read')")
    public ResponseEntity<List<RiskEvaluation>> getEvaluationHistory(@PathVariable String dossierId) {
        // Implementation would fetch all versions for the dossier
        return ResponseEntity.ok().build();
    }
    
    /**
     * POST /api/v1/risk-evaluations/trigger-reevaluation
     * Dispara reevaluación por cambio significativo
     */
    @PostMapping("/trigger-reevaluation")
    @PreAuthorize("hasPermission('risk:evaluation:create')")
    public ResponseEntity<RiskEvaluation> triggerReevaluation(
        @RequestParam String dossierId,
        @RequestParam String triggerReason,
        @RequestHeader("X-User-Id") String userId
    ) {
        RiskEvaluation evaluation = evaluationService.triggerReevaluation(dossierId, triggerReason, userId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(evaluation);
    }
}
