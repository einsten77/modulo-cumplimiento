package com.siar.pep.controller;

import com.siar.common.dto.ApiResponse;
import com.siar.pep.dto.PepInformationDTO;
import com.siar.pep.service.PepManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/pep")
@RequiredArgsConstructor
@Tag(name = "PEP Management", description = "Gestión de Personas Expuestas Políticamente")
public class PepManagementController {
    
    private final PepManagementService pepManagementService;
    
    @PostMapping("/dossier/{dossierId}/evaluation")
    @PreAuthorize("hasAnyRole('COMPLIANCE_ANALYST', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN')")
    @Operation(summary = "Crear evaluación inicial PEP", 
               description = "Crea la evaluación PEP inicial para un expediente")
    public ResponseEntity<ApiResponse<PepInformationDTO>> createPepEvaluation(
            @PathVariable Long dossierId,
            @Valid @RequestBody PepInformationDTO pepDTO,
            Principal principal) {
        
        PepInformationDTO result = pepManagementService.createInitialPepEvaluation(
            dossierId, pepDTO, principal.getName());
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("PEP evaluation created successfully", result));
    }
    
    @GetMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyRole('COMPLIANCE_ANALYST', 'COMPLIANCE_OFFICER', 'OPERATIONAL_USER', 'AUDITOR', 'SUPER_ADMIN')")
    @Operation(summary = "Obtener información PEP", 
               description = "Obtiene la información PEP de un expediente")
    public ResponseEntity<ApiResponse<PepInformationDTO>> getPepInformation(
            @PathVariable Long dossierId) {
        
        PepInformationDTO result = pepManagementService.getPepInformation(dossierId);
        
        return ResponseEntity.ok(ApiResponse.success("PEP information retrieved successfully", result));
    }
    
    @PutMapping("/dossier/{dossierId}")
    @PreAuthorize("hasAnyRole('COMPLIANCE_ANALYST', 'COMPLIANCE_OFFICER', 'SUPER_ADMIN')")
    @Operation(summary = "Actualizar condición PEP", 
               description = "Actualiza la condición PEP de un expediente")
    public ResponseEntity<ApiResponse<PepInformationDTO>> updatePepStatus(
            @PathVariable Long dossierId,
            @Valid @RequestBody PepInformationDTO pepDTO,
            Principal principal) {
        
        PepInformationDTO result = pepManagementService.updatePepStatus(
            dossierId, pepDTO, principal.getName());
        
        return ResponseEntity.ok(ApiResponse.success("PEP status updated successfully", result));
    }
    
    @GetMapping("/dossier/{dossierId}/history")
    @PreAuthorize("hasAnyRole('COMPLIANCE_ANALYST', 'COMPLIANCE_OFFICER', 'AUDITOR', 'SUPER_ADMIN')")
    @Operation(summary = "Obtener historial PEP", 
               description = "Obtiene el historial de cambios de condición PEP")
    public ResponseEntity<ApiResponse<?>> getPepHistory(
            @PathVariable Long dossierId) {
        
        var result = pepManagementService.getPepHistory(dossierId);
        
        return ResponseEntity.ok(ApiResponse.success("PEP history retrieved successfully", result));
    }
}
