package com.siar.dossier.service;

import com.siar.dossier.dto.DossierDTO;
import com.siar.dossier.model.*;
import com.siar.dossier.repository.DossierRepository;
import com.siar.security.SecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DossierService {
    
    private final DossierRepository dossierRepository;
    private final DossierCompletenessService completenessService;
    private final DossierAuditService auditService;
    private final DossierSequenceService sequenceService;
    private final SecurityContext securityContext;
    
    @Transactional
    public Dossier createDossier(DossierDTO dossierDTO, HttpServletRequest request) {
        String currentUser = securityContext.getCurrentUsername();
        String currentRole = securityContext.getCurrentUserRole();
        
        // Crear nuevo expediente
        Dossier dossier = new Dossier();
        dossier.setDossierId(sequenceService.generateDossierId());
        dossier.setSubjectType(dossierDTO.getSubjectType());
        dossier.setStatus(DossierStatus.INCOMPLETE);
        dossier.setCreatedBy(currentUser);
        dossier.setCreatedAt(Instant.now());
        
        // Mapear datos de la planilla estructurada
        dossier.setIdentification(dossierDTO.getIdentification());
        dossier.setEconomicInformation(dossierDTO.getEconomicInformation());
        dossier.setInsurerRelationship(dossierDTO.getInsurerRelationship());
        dossier.setGeographicLocation(dossierDTO.getGeographicLocation());
        dossier.setInternalControls(dossierDTO.getInternalControls());
        
        // Extraer documento de identidad para búsquedas rápidas
        if (dossier.getIdentification() != null) {
            dossier.setDocumentType(
                dossier.getIdentification().getDocumentType()
            );
            dossier.setDocumentNumber(
                dossier.getIdentification().getDocumentNumber()
            );
        }
        
        // Calcular completitud inicial
        double completeness = completenessService.calculateCompleteness(dossier);
        dossier.setCompletenessPercentage(completeness);
        
        // Guardar expediente
        Dossier savedDossier = dossierRepository.save(dossier);
        
        // Registrar evento de auditoría
        auditService.recordDossierChange(
            savedDossier.getDossierUuid(),
            "CREATION",
            currentUser,
            currentRole,
            null,
            null,
            request
        );
        
        return savedDossier;
    }
    
    @Transactional
    public Dossier updateDossier(
        UUID dossierUuid, 
        DossierDTO dossierDTO, 
        HttpServletRequest request
    ) throws DossierException {
        String currentUser = securityContext.getCurrentUsername();
        String currentRole = securityContext.getCurrentUserRole();
        
        Dossier dossier = dossierRepository.findById(dossierUuid)
            .orElseThrow(() -> new DossierException("Expediente no encontrado"));
        
        // Verificar si el usuario puede modificar el expediente
        if (!dossier.canBeModified(currentUser, currentRole)) {
            // Si está aprobado, generar solicitud de modificación
            if (dossier.getStatus() == DossierStatus.APPROVED) {
                return createModificationRequest(dossier, dossierDTO, request);
            }
            
            throw new DossierException(
                "No tiene permisos para modificar este expediente"
            );
        }
        
        // Capturar valores previos para auditoría
        Map<String, Object> previousValues = captureDossierState(dossier);
        
        // Actualizar datos
        dossier.setIdentification(dossierDTO.getIdentification());
        dossier.setEconomicInformation(dossierDTO.getEconomicInformation());
        dossier.setInsurerRelationship(dossierDTO.getInsurerRelationship());
        dossier.setGeographicLocation(dossierDTO.getGeographicLocation());
        dossier.setInternalControls(dossierDTO.getInternalControls());
        dossier.setLastModifiedBy(currentUser);
        dossier.setLastModifiedAt(Instant.now());
        
        // Recalcular completitud
        double completeness = completenessService.calculateCompleteness(dossier);
        dossier.setCompletenessPercentage(completeness);
        
        // Guardar cambios
        Dossier updatedDossier = dossierRepository.save(dossier);
        
        // Capturar valores nuevos
        Map<String, Object> newValues = captureDossierState(updatedDossier);
        
        // Registrar evento de auditoría
        auditService.recordDossierChange(
            updatedDossier.getDossierUuid(),
            "UPDATE",
            currentUser,
            currentRole,
            previousValues,
            newValues,
            request
        );
        
        return updatedDossier;
    }
    
    @Transactional
    public Dossier submitForReview(
        UUID dossierUuid, 
        HttpServletRequest request
    ) throws DossierException {
        String currentUser = securityContext.getCurrentUsername();
        String currentRole = securityContext.getCurrentUserRole();
        
        Dossier dossier = dossierRepository.findById(dossierUuid)
            .orElseThrow(() -> new DossierException("Expediente no encontrado"));
        
        // Validar que el expediente esté suficientemente completo
        ValidationResult validation = validateDossierForReview(dossier);
        if (!validation.isValid()) {
            throw new DossierException(
                "El expediente no cumple los requisitos para revisión: " + 
                validation.getErrorMessages()
            );
        }
        
        // Cambiar estado
        dossier.setStatus(DossierStatus.UNDER_REVIEW);
        dossier.setLastModifiedBy(currentUser);
        dossier.setLastModifiedAt(Instant.now());
        
        Dossier updatedDossier = dossierRepository.save(dossier);
        
        // Registrar evento
        auditService.recordDossierChange(
            updatedDossier.getDossierUuid(),
            "STATUS_CHANGE",
            currentUser,
            currentRole,
            Map.of("status", "INCOMPLETE"),
            Map.of("status", "UNDER_REVIEW"),
            request
        );
        
        // Notificar al área de cumplimiento
        notificationService.notifyComplianceAreaNewReview(updatedDossier);
        
        return updatedDossier;
    }
    
    @Transactional
    public Dossier approveDossier(
        UUID dossierUuid,
        String approvalNotes,
        HttpServletRequest request
    ) throws DossierException {
        String currentUser = securityContext.getCurrentUsername();
        String currentRole = securityContext.getCurrentUserRole();
        
        // Solo el Oficial de Cumplimiento puede aprobar
        if (!"COMPLIANCE_OFFICER".equals(currentRole)) {
            throw new DossierException(
                "Solo el Oficial de Cumplimiento puede aprobar expedientes"
            );
        }
        
        Dossier dossier = dossierRepository.findById(dossierUuid)
            .orElseThrow(() -> new DossierException("Expediente no encontrado"));
        
        if (dossier.getStatus() != DossierStatus.UNDER_REVIEW) {
            throw new DossierException(
                "Solo pueden aprobarse expedientes en estado En Revisión"
            );
        }
        
        // Cambiar estado a aprobado
        dossier.setStatus(DossierStatus.APPROVED);
        dossier.setApprovedBy(currentUser);
        dossier.setApprovedAt(Instant.now());
        dossier.setLastModifiedBy(currentUser);
        dossier.setLastModifiedAt(Instant.now());
        
        // Marcar como no eliminable y que requiere aprobación para cambios
        dossier.setIsDeletable(false);
        dossier.setRequiresApprovalForChanges(true);
        
        Dossier approvedDossier = dossierRepository.save(dossier);
        
        // Registrar evento
        auditService.recordDossierChange(
            approvedDossier.getDossierUuid(),
            "APPROVAL",
            currentUser,
            currentRole,
            Map.of("status", "UNDER_REVIEW"),
            Map.of("status", "APPROVED", "approvalNotes", approvalNotes),
            request
        );
        
        // Notificar al creador
        notificationService.notifyDossierApproved(approvedDossier);
        
        return approvedDossier;
    }
    
    private Dossier createModificationRequest(
        Dossier dossier,
        DossierDTO proposedChanges,
        HttpServletRequest request
    ) {
        // Generar alerta al Oficial de Cumplimiento
        alertService.createModificationRequestAlert(
            dossier,
            proposedChanges,
            securityContext.getCurrentUsername(),
            request
        );
        
        // Retornar el expediente sin cambios
        return dossier;
    }
    
    private ValidationResult validateDossierForReview(Dossier dossier) {
        ValidationResult result = new ValidationResult();
        
        // Verificar completitud mínima
        if (dossier.getCompletenessPercentage() < 76.0) {
            result.addError(
                "El expediente debe estar al menos 76% completo"
            );
        }
        
        // Verificar documentos obligatorios
        List<String> missingDocs = dossier.getMissingMandatoryDocuments();
        if (!missingDocs.isEmpty()) {
            result.addError(
                "Faltan documentos obligatorios: " + String.join(", ", missingDocs)
            );
        }
        
        return result;
    }
    
    private Map<String, Object> captureDossierState(Dossier dossier) {
        // Capturar el estado actual del expediente para auditoría
        return Map.of(
            "identification", dossier.getIdentification(),
            "economicInformation", dossier.getEconomicInformation(),
            "insurerRelationship", dossier.getInsurerRelationship(),
            "geographicLocation", dossier.getGeographicLocation(),
            "internalControls", dossier.getInternalControls()
        );
    }
}
