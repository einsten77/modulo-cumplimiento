package com.siar.duediligence.controller;

import com.siar.duediligence.model.DueDiligenceDocument;
import com.siar.duediligence.model.DocumentHistory;
import com.siar.duediligence.service.DocumentManagementService;
import com.siar.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {
    
    private final DocumentManagementService documentService;
    
    /**
     * POST /api/v1/documents
     * Carga un documento
     */
    @PostMapping
    @PreAuthorize("hasPermission('document', 'create')")
    public ResponseEntity<ApiResponse<DueDiligenceDocument>> uploadDocument(
            @RequestParam Long dueDiligenceId,
            @RequestParam String documentTypeCode,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Map<String, Object> metadata,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligenceDocument doc = documentService.uploadDocument(
            dueDiligenceId, documentTypeCode, file, metadata, userId);
        
        return ResponseEntity.ok(ApiResponse.success(doc));
    }
    
    /**
     * POST /api/v1/documents/{id}/approve
     * Aprueba un documento (solo Oficial de Cumplimiento)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('OFICIAL_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<DueDiligenceDocument>> approveDocument(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligenceDocument doc = documentService.approveDocument(id, userId, notes);
        return ResponseEntity.ok(ApiResponse.success(doc));
    }
    
    /**
     * POST /api/v1/documents/{id}/reject
     * Rechaza un documento
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('OFICIAL_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<DueDiligenceDocument>> rejectDocument(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestAttribute("userId") Long userId) {
        
        DueDiligenceDocument doc = documentService.rejectDocument(id, userId, reason);
        return ResponseEntity.ok(ApiResponse.success(doc));
    }
    
    /**
     * GET /api/v1/documents/versions
     * Obtiene todas las versiones de un tipo de documento
     */
    @GetMapping("/versions")
    @PreAuthorize("hasPermission('document', 'read')")
    public ResponseEntity<ApiResponse<List<DueDiligenceDocument>>> getDocumentVersions(
            @RequestParam Long dueDiligenceId,
            @RequestParam String documentTypeCode) {
        
        List<DueDiligenceDocument> versions = documentService.getDocumentVersions(
            dueDiligenceId, documentTypeCode);
        return ResponseEntity.ok(ApiResponse.success(versions));
    }
    
    /**
     * GET /api/v1/documents/{id}/history
     * Obtiene el historial de cambios de un documento
     */
    @GetMapping("/{id}/history")
    @PreAuthorize("hasPermission('document', 'read')")
    public ResponseEntity<ApiResponse<List<DocumentHistory>>> getDocumentHistory(@PathVariable Long id) {
        List<DocumentHistory> history = documentService.getDocumentHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
    
    /**
     * GET /api/v1/documents/expiring
     * Obtiene documentos próximos a vencer
     */
    @GetMapping("/expiring")
    @PreAuthorize("hasRole('ANALISTA_CUMPLIMIENTO')")
    public ResponseEntity<ApiResponse<List<DueDiligenceDocument>>> getExpiringDocuments(
            @RequestParam(defaultValue = "30") int daysAhead) {
        
        List<DueDiligenceDocument> docs = documentService.findExpiringDocuments(daysAhead);
        return ResponseEntity.ok(ApiResponse.success(docs));
    }
}
