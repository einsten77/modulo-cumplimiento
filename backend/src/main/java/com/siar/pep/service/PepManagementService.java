package com.siar.pep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.siar.audit.service.AuditService;
import com.siar.common.exception.ResourceNotFoundException;
import com.siar.dossier.model.Dossier;
import com.siar.dossier.repository.DossierRepository;
import com.siar.pep.dto.*;
import com.siar.pep.model.*;
import com.siar.pep.repository.PepInformationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio para gestión de Personas Expuestas Políticamente
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PepManagementService {
    
    private final PepInformationRepository pepRepository;
    private final DossierRepository dossierRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    
    /**
     * Crea la evaluación PEP inicial para un expediente
     */
    @Transactional
    public PepInformationDTO createInitialPepEvaluation(Long dossierId, PepInformationDTO pepDTO, String username) {
        log.info("Creando evaluación PEP inicial para expediente: {}", dossierId);
        
        // Validar que el expediente existe
        Dossier dossier = dossierRepository.findById(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado: " + dossierId));
        
        // Validar que no existe ya una evaluación PEP
        pepRepository.findByDossierId(dossierId).ifPresent(existing -> {
            throw new IllegalStateException("Ya existe una evaluación PEP para este expediente");
        });
        
        // Crear entidad PEP
        PepInformation pepInfo = PepInformation.builder()
            .dossier(dossier)
            .evaluationStatus(EvaluationStatus.COMPLETED)
            .lastEvaluationDate(LocalDateTime.now())
            .evaluatedBy(username)
            .isPep(pepDTO.getIsPep())
            .createdBy(username)
            .build();
        
        // Configurar tipo y categoría si es PEP
        if (Boolean.TRUE.equals(pepDTO.getIsPep())) {
            pepInfo.setPepType(PepType.valueOf(pepDTO.getPepType()));
            pepInfo.setPepCategory(PepCategory.valueOf(pepDTO.getPepCategory()));
            
            // Calcular próxima fecha de revisión
            int reviewMonths = pepInfo.getPepType().getReviewFrequencyMonths();
            pepInfo.setNextReviewDate(LocalDate.now().plusMonths(reviewMonths));
        } else {
            pepInfo.setPepType(null);
            pepInfo.setPepCategory(PepCategory.NOT_PEP);
            pepInfo.setNextReviewDate(null);
        }
        
        // Convertir DTOs a JSON
        try {
            if (pepDTO.getPepDetails() != null) {
                pepInfo.setPepDetails(objectMapper.valueToTree(pepDTO.getPepDetails()));
            }
            
            if (pepDTO.getRelationshipToPep() != null) {
                pepInfo.setRelationshipToPep(objectMapper.valueToTree(pepDTO.getRelationshipToPep()));
            }
            
            if (pepDTO.getInformationSources() != null && !pepDTO.getInformationSources().isEmpty()) {
                pepInfo.setInformationSources(objectMapper.valueToTree(pepDTO.getInformationSources()));
            } else {
                pepInfo.setInformationSources(objectMapper.createArrayNode());
            }
            
            if (pepDTO.getRiskImpact() != null) {
                pepInfo.setRiskImpact(objectMapper.valueToTree(pepDTO.getRiskImpact()));
            }
            
            if (pepDTO.getMonitoringSchedule() != null) {
                pepInfo.setMonitoringSchedule(objectMapper.valueToTree(pepDTO.getMonitoringSchedule()));
            }
            
            // Crear historial inicial
            ArrayNode history = objectMapper.createArrayNode();
            ObjectNode historyEntry = objectMapper.createObjectNode();
            historyEntry.put("historyId", "PEPH-" + UUID.randomUUID().toString().substring(0, 8));
            historyEntry.put("changeDate", LocalDateTime.now().toString());
            historyEntry.put("changedBy", username);
            historyEntry.put("changeType", "INITIAL_CLASSIFICATION");
            historyEntry.put("previousStatus", (String) null);
            historyEntry.put("newStatus", pepDTO.getIsPep() ? pepDTO.getPepType() : "NOT_PEP");
            historyEntry.put("justification", "Evaluación PEP inicial durante creación de expediente");
            historyEntry.put("alertGenerated", pepDTO.getIsPep());
            history.add(historyEntry);
            pepInfo.setPepHistory(history);
            
        } catch (Exception e) {
            log.error("Error al convertir DTOs a JSON: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar información PEP", e);
        }
        
        // Guardar
        PepInformation saved = pepRepository.save(pepInfo);
        
        // Registrar auditoría
        auditService.logPepEvent(
            "PEP_EVALUATION_CREATED",
            username,
            dossierId,
            "DOSSIER",
            "Evaluación PEP inicial: " + (pepDTO.getIsPep() ? pepDTO.getPepType() : "NO_PEP"),
            null,
            objectMapper.valueToTree(pepDTO)
        );
        
        log.info("Evaluación PEP creada exitosamente para expediente: {}", dossierId);
        return convertToDTO(saved);
    }
    
    /**
     * Obtiene la información PEP de un expediente
     */
    @Transactional(readOnly = true)
    public PepInformationDTO getPepInformation(Long dossierId) {
        log.info("Obteniendo información PEP para expediente: {}", dossierId);
        
        PepInformation pepInfo = pepRepository.findByDossierId(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Información PEP no encontrada para expediente: " + dossierId));
        
        return convertToDTO(pepInfo);
    }
    
    /**
     * Actualiza la condición PEP de un expediente
     */
    @Transactional
    public PepInformationDTO updatePepStatus(Long dossierId, PepInformationDTO pepDTO, String username) {
        log.info("Actualizando condición PEP para expediente: {}", dossierId);
        
        PepInformation pepInfo = pepRepository.findByDossierId(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Información PEP no encontrada para expediente: " + dossierId));
        
        // Guardar estado anterior
        String previousStatus = pepInfo.getIsPep() ? pepInfo.getPepType().name() : "NOT_PEP";
        
        // Actualizar información
        pepInfo.setIsPep(pepDTO.getIsPep());
        pepInfo.setLastEvaluationDate(LocalDateTime.now());
        pepInfo.setEvaluatedBy(username);
        pepInfo.setLastModifiedBy(username);
        
        if (Boolean.TRUE.equals(pepDTO.getIsPep())) {
            pepInfo.setPepType(PepType.valueOf(pepDTO.getPepType()));
            pepInfo.setPepCategory(PepCategory.valueOf(pepDTO.getPepCategory()));
            
            int reviewMonths = pepInfo.getPepType().getReviewFrequencyMonths();
            pepInfo.setNextReviewDate(LocalDate.now().plusMonths(reviewMonths));
        } else {
            pepInfo.setPepType(null);
            pepInfo.setPepCategory(PepCategory.NOT_PEP);
            pepInfo.setNextReviewDate(null);
        }
        
        // Actualizar JSONs
        try {
            if (pepDTO.getPepDetails() != null) {
                pepInfo.setPepDetails(objectMapper.valueToTree(pepDTO.getPepDetails()));
            }
            
            if (pepDTO.getRelationshipToPep() != null) {
                pepInfo.setRelationshipToPep(objectMapper.valueToTree(pepDTO.getRelationshipToPep()));
            }
            
            if (pepDTO.getInformationSources() != null) {
                pepInfo.setInformationSources(objectMapper.valueToTree(pepDTO.getInformationSources()));
            }
            
            if (pepDTO.getRiskImpact() != null) {
                pepInfo.setRiskImpact(objectMapper.valueToTree(pepDTO.getRiskImpact()));
            }
            
            if (pepDTO.getComplianceOfficerDecision() != null) {
                pepInfo.setComplianceOfficerDecision(objectMapper.valueToTree(pepDTO.getComplianceOfficerDecision()));
            }
            
            // Agregar entrada al historial
            ArrayNode history = (ArrayNode) pepInfo.getPepHistory();
            ObjectNode historyEntry = objectMapper.createObjectNode();
            historyEntry.put("historyId", "PEPH-" + UUID.randomUUID().toString().substring(0, 8));
            historyEntry.put("changeDate", LocalDateTime.now().toString());
            historyEntry.put("changedBy", username);
            historyEntry.put("changeType", "STATUS_UPDATE");
            historyEntry.put("previousStatus", previousStatus);
            historyEntry.put("newStatus", pepDTO.getIsPep() ? pepDTO.getPepType() : "NOT_PEP");
            historyEntry.put("justification", "Actualización de condición PEP");
            historyEntry.put("alertGenerated", true);
            history.add(historyEntry);
            pepInfo.setPepHistory(history);
            
        } catch (Exception e) {
            log.error("Error al actualizar información PEP: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar actualización PEP", e);
        }
        
        // Guardar
        PepInformation saved = pepRepository.save(pepInfo);
        
        // Registrar auditoría
        auditService.logPepEvent(
            "PEP_STATUS_UPDATED",
            username,
            dossierId,
            "DOSSIER",
            String.format("Cambio de condición PEP: %s -> %s", previousStatus, pepDTO.getIsPep() ? pepDTO.getPepType() : "NOT_PEP"),
            objectMapper.valueToTree(previousStatus),
            objectMapper.valueToTree(pepDTO)
        );
        
        log.info("Condición PEP actualizada exitosamente para expediente: {}", dossierId);
        return convertToDTO(saved);
    }
    
    /**
     * Obtiene el historial de cambios de condición PEP
     */
    @Transactional(readOnly = true)
    public List<PepChangeHistoryDTO> getPepHistory(Long dossierId) {
        log.info("Obteniendo historial PEP para expediente: {}", dossierId);
        
        PepInformation pepInfo = pepRepository.findByDossierId(dossierId)
            .orElseThrow(() -> new ResourceNotFoundException("Información PEP no encontrada para expediente: " + dossierId));
        
        try {
            ArrayNode historyArray = (ArrayNode) pepInfo.getPepHistory();
            List<PepChangeHistoryDTO> historyList = new ArrayList<>();
            
            for (JsonNode node : historyArray) {
                historyList.add(objectMapper.treeToValue(node, PepChangeHistoryDTO.class));
            }
            
            return historyList;
        } catch (Exception e) {
            log.error("Error al convertir historial PEP: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar historial PEP", e);
        }
    }
    
    /**
     * Convierte entidad a DTO
     */
    private PepInformationDTO convertToDTO(PepInformation entity) {
        try {
            PepInformationDTO dto = PepInformationDTO.builder()
                .id(entity.getId())
                .dossierId(entity.getDossier().getId())
                .evaluationStatus(entity.getEvaluationStatus().name())
                .lastEvaluationDate(entity.getLastEvaluationDate())
                .evaluatedBy(entity.getEvaluatedBy())
                .nextReviewDate(entity.getNextReviewDate())
                .isPep(entity.getIsPep())
                .pepType(entity.getPepType() != null ? entity.getPepType().name() : null)
                .pepCategory(entity.getPepCategory() != null ? entity.getPepCategory().name() : null)
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .lastModifiedAt(entity.getLastModifiedAt())
                .lastModifiedBy(entity.getLastModifiedBy())
                .version(entity.getVersion())
                .build();
            
            // Convertir JSONs a DTOs
            if (entity.getPepDetails() != null) {
                dto.setPepDetails(objectMapper.treeToValue(entity.getPepDetails(), PepDetailsDTO.class));
            }
            
            if (entity.getRelationshipToPep() != null) {
                dto.setRelationshipToPep(objectMapper.treeToValue(entity.getRelationshipToPep(), RelationshipToPepDTO.class));
            }
            
            if (entity.getInformationSources() != null) {
                List<InformationSourceDTO> sources = new ArrayList<>();
                for (JsonNode node : entity.getInformationSources()) {
                    sources.add(objectMapper.treeToValue(node, InformationSourceDTO.class));
                }
                dto.setInformationSources(sources);
            }
            
            if (entity.getRiskImpact() != null) {
                dto.setRiskImpact(objectMapper.treeToValue(entity.getRiskImpact(), RiskImpactDTO.class));
            }
            
            if (entity.getComplianceOfficerDecision() != null) {
                dto.setComplianceOfficerDecision(objectMapper.treeToValue(entity.getComplianceOfficerDecision(), ComplianceOfficerDecisionDTO.class));
            }
            
            if (entity.getMonitoringSchedule() != null) {
                dto.setMonitoringSchedule(objectMapper.treeToValue(entity.getMonitoringSchedule(), MonitoringScheduleDTO.class));
            }
            
            if (entity.getPepHistory() != null) {
                List<PepChangeHistoryDTO> history = new ArrayList<>();
                for (JsonNode node : entity.getPepHistory()) {
                    history.add(objectMapper.treeToValue(node, PepChangeHistoryDTO.class));
                }
                dto.setPepHistory(history);
            }
            
            return dto;
        } catch (Exception e) {
            log.error("Error al convertir PepInformation a DTO: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar información PEP", e);
        }
    }
}
