package com.siar.screening.controller;

import com.siar.screening.dto.ScreeningExecutionRequest;
import com.siar.screening.dto.ScreeningResponse;
import com.siar.screening.model.Screening;
import com.siar.screening.service.ScreeningExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/screening")
public class ScreeningController {
    
    @Autowired
    private ScreeningExecutionService screeningExecutionService;
    
    /**
     * Ejecuta screening para un expediente.
     */
    @PostMapping("/execute")
    public ResponseEntity<ScreeningResponse> executeScreening(
        @RequestBody ScreeningExecutionRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        Screening screening = screeningExecutionService.executeScreening(
            request.getDossierId(),
            request.getScreeningType(),
            currentUser
        );
        
        ScreeningResponse response = mapToResponse(screening);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Obtiene detalles de un screening.
     */
    @GetMapping("/{screeningId}")
    public ResponseEntity<ScreeningResponse> getScreening(
        @PathVariable Long screeningId
    ) {
        Screening screening = screeningExecutionService.getScreeningDetails(screeningId);
        ScreeningResponse response = mapToResponse(screening);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Obtiene historial de screenings de un expediente.
     */
    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<ScreeningResponse>> getDossierScreenings(
        @PathVariable Long dossierId
    ) {
        List<Screening> screenings = screeningExecutionService.getDossierScreenings(dossierId);
        List<ScreeningResponse> responses = screenings.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    private ScreeningResponse mapToResponse(Screening screening) {
        // Mapping logic here
        return new ScreeningResponse();
    }
}
