package com.siar.duediligence.controller;

import com.siar.duediligence.model.DueDiligence;
import com.siar.duediligence.service.DueDiligenceService;
import com.siar.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/due-diligence")
@RequiredArgsConstructor
public class DueDiligenceController {
    
    private final DueDiligenceService dueDiligenceService;
    
    /**
     * POST /api/v1/due-diligence
     * Inicializa una debida diligencia para un expediente
     */
    @PostMapping
    @PreAuthorize("hasPermission('due-diligence', 'create')")
    public ResponseEntity<ApiResponse<DueDiligence>> initializeDueDiligence(
            @RequestParam Long dossierId,
            @RequestParam String dossierType,
            @RequestParam String riskLevel,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligence dd = dueDiligenceService.initializeDueDiligence(
            dossierId, dossierType, riskLevel, userId);
        
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
    
    /**
     * GET /api/v1/due-diligence/{id}
     * Obtiene una debida diligencia por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('due-diligence', 'read')")
    public ResponseEntity<ApiResponse<DueDiligence>> getDueDiligence(@PathVariable String id) {
        DueDiligence dd = dueDiligenceService.findByDueDiligenceId(id);
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
    
    /**
     * GET /api/v1/due-diligence/{id}/completeness
     * Calcula el porcentaje de completitud
     */
    @GetMapping("/{id}/completeness")
    @PreAuthorize("hasPermission('due-diligence', 'read')")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateCompleteness(@PathVariable Long id) {
        BigDecimal percentage = dueDiligenceService.calculateCompleteness(id);
        return ResponseEntity.ok(ApiResponse.success(percentage));
    }
    
    /**
     * POST /api/v1/due-diligence/{id}/submit
     * Envía la debida diligencia a revisión
     */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasPermission('due-diligence', 'update')")
    public ResponseEntity<ApiResponse<DueDiligence>> submitForReview(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligence dd = dueDiligenceService.submitForReview(id, userId);
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
    
    /**
     * POST /api/v1/due-diligence/{id}/start-review
     * Inicia la revisión (Analista de Cumplimiento)
     */
    @PostMapping("/{id}/start-review")
    @PreAuthorize("hasRole('ANALISTA_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<DueDiligence>> startReview(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligence dd = dueDiligenceService.startReview(id, userId);
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
    
    /**
     * POST /api/v1/due-diligence/{id}/request-information
     * Solicita información adicional
     */
    @PostMapping("/{id}/request-information")
    @PreAuthorize("hasRole('ANALISTA_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<DueDiligence>> requestInformation(
            @PathVariable Long id,
            @RequestParam String description,
            @RequestParam List<String> documentTypeCodes,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligence dd = dueDiligenceService.requestAdditionalInformation(
            id, userId, description, documentTypeCodes);
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
    
    /**
     * POST /api/v1/due-diligence/{id}/approve
     * Aprueba la debida diligencia (solo Oficial de Cumplimiento)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('OFICIAL_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<DueDiligence>> approve(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligence dd = dueDiligenceService.approve(id, userId, notes);
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
    
    /**
     * POST /api/v1/due-diligence/{id}/reject
     * Observa/rechaza la debida diligencia
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('OFICIAL_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<DueDiligence>> reject(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligence dd = dueDiligenceService.reject(id, userId, reason);
        return ResponseEntity.ok(ApiResponse.success(dd));
    }
}
