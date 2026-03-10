package com.siar.duediligence.service;

import com.siar.duediligence.model.*;
import com.siar.duediligence.repository.*;
import com.siar.common.exception.NotFoundException;
import com.siar.common.exception.ValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DueDiligenceService {
    
    private final DueDiligenceRepository dueDiligenceRepository;
    private final DueDiligenceDocumentRepository documentRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final InformationRequestRepository informationRequestRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Inicializa la debida diligencia para un expediente
     */
    public DueDiligence initializeDueDiligence(Long dossierId, String dossierType, String riskLevel, Long userId) {
        log.info("Initializing due diligence for dossier: {}", dossierId);
        
        // Verificar si ya existe
        Optional<DueDiligence> existing = dueDiligenceRepository.findByDossierId(dossierId);
        if (existing.isPresent()) {
            throw new ValidationException("Due diligence already exists for dossier: " + dossierId);
        }
        
        DueDiligence dd = new DueDiligence();
        dd.setDueDiligenceId(generateDueDiligenceId());
        dd.setDossierId(dossierId);
        dd.setDossierType(dossierType);
        dd.setStatus(DueDiligenceStatus.PENDIENTE);
        dd.setRiskLevel(riskLevel);
        dd.setDiligenceLevel(calculateDiligenceLevel(riskLevel));
        dd.setCompletenessPercentage(BigDecimal.ZERO);
        
        // Cargar documentos requeridos
        List<DocumentType> requiredDocs = documentTypeRepository.findRequiredDocuments(dossierType, riskLevel);
        dd.setRequiredDocumentsJson(serializeRequiredDocuments(requiredDocs));
        
        // Inicializar workflow
        Map<String, Object> workflow = new HashMap<>();
        workflow.put("currentStatus", "PENDIENTE");
        workflow.put("history", new ArrayList<>());
        addWorkflowEvent(workflow, "PENDIENTE", userId, "Debida diligencia inicializada");
        dd.setWorkflowJson(serializeJson(workflow));
        
        // Inicializar audit trail
        List<Map<String, Object>> auditTrail = new ArrayList<>();
        addAuditEvent(auditTrail, userId, "CREATE_DUE_DILIGENCE", 
            "Debida diligencia inicializada para expediente " + dossierId);
        dd.setAuditTrailJson(serializeJson(auditTrail));
        
        return dueDiligenceRepository.save(dd);
    }
    
    /**
     * Calcula el nivel de diligencia según el riesgo
     */
    private DiligenceLevel calculateDiligenceLevel(String riskLevel) {
        return switch (riskLevel) {
            case "BAJO" -> DiligenceLevel.SIMPLIFICADA;
            case "MEDIO" -> DiligenceLevel.ESTANDAR;
            case "ALTO" -> DiligenceLevel.REFORZADA;
            default -> DiligenceLevel.ESTANDAR;
        };
    }
    
    /**
     * Calcula el porcentaje de completitud de la debida diligencia
     */
    public BigDecimal calculateCompleteness(Long dueDiligenceId) {
        DueDiligence dd = findById(dueDiligenceId);
        
        // Obtener documentos requeridos
        List<Map<String, Object>> requiredDocs = deserializeJson(dd.getRequiredDocumentsJson(), List.class);
        if (requiredDocs == null || requiredDocs.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // Obtener documentos actuales aprobados
        List<DueDiligenceDocument> currentDocs = documentRepository.findCurrentVersionsByDueDiligence(dueDiligenceId);
        Set<Long> approvedTypeIds = new HashSet<>();
        
        for (DueDiligenceDocument doc : currentDocs) {
            if (doc.getApprovalStatus() == DocumentApprovalStatus.APROBADO) {
                approvedTypeIds.add(doc.getDocumentTypeId());
            }
        }
        
        // Calcular completitud
        int mandatoryCount = 0;
        int mandatoryPresent = 0;
        
        for (Map<String, Object> reqDoc : requiredDocs) {
            Boolean isMandatory = (Boolean) reqDoc.get("isMandatory");
            if (Boolean.TRUE.equals(isMandatory)) {
                mandatoryCount++;
                Long typeId = Long.valueOf(reqDoc.get("documentTypeId").toString());
                if (approvedTypeIds.contains(typeId)) {
                    mandatoryPresent++;
                }
            }
        }
        
        if (mandatoryCount == 0) {
            return BigDecimal.valueOf(100);
        }
        
        BigDecimal percentage = BigDecimal.valueOf(mandatoryPresent)
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(mandatoryCount), 2, RoundingMode.HALF_UP);
        
        // Actualizar en BD
        dd.setCompletenessPercentage(percentage);
        dueDiligenceRepository.save(dd);
        
        return percentage;
    }
    
    /**
     * Envía la debida diligencia a revisión
     */
    public DueDiligence submitForReview(Long dueDiligenceId, Long userId) {
        DueDiligence dd = findById(dueDiligenceId);
        
        if (dd.getStatus() != DueDiligenceStatus.PENDIENTE) {
            throw new ValidationException("Due diligence must be in PENDIENTE status to submit");
        }
        
        // Verificar completitud mínima
        BigDecimal completeness = calculateCompleteness(dueDiligenceId);
        if (completeness.compareTo(BigDecimal.valueOf(80)) < 0) {
            throw new ValidationException("Due diligence must be at least 80% complete to submit. Current: " + completeness + "%");
        }
        
        dd.setStatus(DueDiligenceStatus.EN_REVISION);
        dd.setSubmittedDate(LocalDateTime.now());
        dd.setSubmittedBy(userId);
        
        // Actualizar workflow
        Map<String, Object> workflow = deserializeJson(dd.getWorkflowJson(), Map.class);
        workflow.put("currentStatus", "EN_REVISION");
        workflow.put("submittedDate", LocalDateTime.now().toString());
        workflow.put("submittedBy", userId);
        addWorkflowEvent(workflow, "EN_REVISION", userId, "Enviada a revisión");
        dd.setWorkflowJson(serializeJson(workflow));
        
        // Audit trail
        List<Map<String, Object>> auditTrail = deserializeJson(dd.getAuditTrailJson(), List.class);
        addAuditEvent(auditTrail, userId, "SUBMIT_FOR_REVIEW", "Debida diligencia enviada a revisión");
        dd.setAuditTrailJson(serializeJson(auditTrail));
        
        return dueDiligenceRepository.save(dd);
    }
    
    /**
     * Inicia la revisión (Analista de Cumplimiento)
     */
    public DueDiligence startReview(Long dueDiligenceId, Long reviewerId) {
        DueDiligence dd = findById(dueDiligenceId);
        
        if (dd.getStatus() != DueDiligenceStatus.EN_REVISION) {
            throw new ValidationException("Due diligence must be in EN_REVISION status");
        }
        
        dd.setReviewStartDate(LocalDateTime.now());
        dd.setReviewedBy(reviewerId);
        
        // Actualizar workflow
        Map<String, Object> workflow = deserializeJson(dd.getWorkflowJson(), Map.class);
        workflow.put("reviewStartDate", LocalDateTime.now().toString());
        workflow.put("reviewedBy", reviewerId);
        addWorkflowEvent(workflow, "EN_REVISION", reviewerId, "Iniciada revisión documental");
        dd.setWorkflowJson(serializeJson(workflow));
        
        // Audit trail
        List<Map<String, Object>> auditTrail = deserializeJson(dd.getAuditTrailJson(), List.class);
        addAuditEvent(auditTrail, reviewerId, "START_REVIEW", "Iniciada revisión por analista");
        dd.setAuditTrailJson(serializeJson(auditTrail));
        
        return dueDiligenceRepository.save(dd);
    }
    
    /**
     * Solicita información adicional
     */
    public DueDiligence requestAdditionalInformation(Long dueDiligenceId, Long requesterId, 
                                                     String description, List<String> documentTypeCodes) {
        DueDiligence dd = findById(dueDiligenceId);
        
        if (dd.getStatus() != DueDiligenceStatus.EN_REVISION) {
            throw new ValidationException("Can only request information during review");
        }
        
        // Crear solicitud de información
        InformationRequest request = new InformationRequest();
        request.setRequestId(generateRequestId());
        request.setDueDiligenceId(dueDiligenceId);
        request.setRequestDate(LocalDateTime.now());
        request.setRequestedBy(requesterId);
        request.setDescription(description);
        request.setDocumentTypeIdsJson(serializeJson(documentTypeCodes));
        request.setDueDate(java.time.LocalDate.now().plusDays(5)); // 5 días para responder
        request.setStatus("PENDIENTE");
        informationRequestRepository.save(request);
        
        // Cambiar estado
        dd.setStatus(DueDiligenceStatus.REQUIERE_INFORMACION);
        
        // Actualizar workflow
        Map<String, Object> workflow = deserializeJson(dd.getWorkflowJson(), Map.class);
        workflow.put("currentStatus", "REQUIERE_INFORMACION");
        addWorkflowEvent(workflow, "REQUIERE_INFORMACION", requesterId, description);
        dd.setWorkflowJson(serializeJson(workflow));
        
        // Audit trail
        List<Map<String, Object>> auditTrail = deserializeJson(dd.getAuditTrailJson(), List.class);
        addAuditEvent(auditTrail, requesterId, "REQUEST_INFORMATION", 
            "Solicitud de información adicional: " + description);
        dd.setAuditTrailJson(serializeJson(auditTrail));
        
        return dueDiligenceRepository.save(dd);
    }
    
    /**
     * Aprueba la debida diligencia (solo Oficial de Cumplimiento)
     */
    public DueDiligence approve(Long dueDiligenceId, Long officerId, String notes) {
        DueDiligence dd = findById(dueDiligenceId);
        
        if (dd.getStatus() != DueDiligenceStatus.EN_REVISION) {
            throw new ValidationException("Due diligence must be in EN_REVISION status to approve");
        }
        
        // Verificar que todos los documentos obligatorios estén aprobados
        BigDecimal completeness = calculateCompleteness(dueDiligenceId);
        if (completeness.compareTo(BigDecimal.valueOf(100)) < 0) {
            throw new ValidationException("All mandatory documents must be approved. Completeness: " + completeness + "%");
        }
        
        dd.setStatus(DueDiligenceStatus.APROBADA);
        dd.setApprovalDate(LocalDateTime.now());
        dd.setApprovedBy(officerId);
        
        // Actualizar workflow
        Map<String, Object> workflow = deserializeJson(dd.getWorkflowJson(), Map.class);
        workflow.put("currentStatus", "APROBADA");
        workflow.put("approvalDate", LocalDateTime.now().toString());
        workflow.put("approvedBy", officerId);
        addWorkflowEvent(workflow, "APROBADA", officerId, 
            notes != null ? notes : "Documentación completa y conforme");
        dd.setWorkflowJson(serializeJson(workflow));
        
        // Audit trail
        List<Map<String, Object>> auditTrail = deserializeJson(dd.getAuditTrailJson(), List.class);
        addAuditEvent(auditTrail, officerId, "APPROVE_DUE_DILIGENCE", 
            "Debida diligencia aprobada por Oficial de Cumplimiento");
        dd.setAuditTrailJson(serializeJson(auditTrail));
        
        return dueDiligenceRepository.save(dd);
    }
    
    /**
     * Observa/rechaza la debida diligencia
     */
    public DueDiligence reject(Long dueDiligenceId, Long officerId, String reason) {
        DueDiligence dd = findById(dueDiligenceId);
        
        if (dd.getStatus() != DueDiligenceStatus.EN_REVISION) {
            throw new ValidationException("Due diligence must be in EN_REVISION status to reject");
        }
        
        dd.setStatus(DueDiligenceStatus.OBSERVADA);
        
        // Actualizar workflow
        Map<String, Object> workflow = deserializeJson(dd.getWorkflowJson(), Map.class);
        workflow.put("currentStatus", "OBSERVADA");
        addWorkflowEvent(workflow, "OBSERVADA", officerId, reason);
        dd.setWorkflowJson(serializeJson(workflow));
        
        // Audit trail
        List<Map<String, Object>> auditTrail = deserializeJson(dd.getAuditTrailJson(), List.class);
        addAuditEvent(auditTrail, officerId, "REJECT_DUE_DILIGENCE", 
            "Debida diligencia observada: " + reason);
        dd.setAuditTrailJson(serializeJson(auditTrail));
        
        return dueDiligenceRepository.save(dd);
    }
    
    // Métodos auxiliares
    
    private DueDiligence findById(Long id) {
        return dueDiligenceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Due diligence not found: " + id));
    }
    
    public DueDiligence findByDueDiligenceId(String ddId) {
        return dueDiligenceRepository.findByDueDiligenceId(ddId)
            .orElseThrow(() -> new NotFoundException("Due diligence not found: " + ddId));
    }
    
    private String generateDueDiligenceId() {
        return "DD-" + String.format("%08d", dueDiligenceRepository.count() + 1);
    }
    
    private String generateRequestId() {
        return "REQ-" + String.format("%05d", informationRequestRepository.count() + 1);
    }
    
    private String serializeRequiredDocuments(List<DocumentType> docTypes) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (DocumentType dt : docTypes) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("documentTypeId", dt.getId());
            doc.put("documentTypeName", dt.getName());
            doc.put("category", dt.getCategory().name());
            doc.put("isMandatory", dt.getIsMandatory());
            doc.put("expirationRequired", dt.getRequiresExpiration());
            doc.put("isPresent", false);
            doc.put("currentVersion", 0);
            result.add(doc);
        }
        return serializeJson(result);
    }
    
    private void addWorkflowEvent(Map<String, Object> workflow, String status, Long userId, String notes) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> history = (List<Map<String, Object>>) workflow.get("history");
        if (history == null) {
            history = new ArrayList<>();
            workflow.put("history", history);
        }
        
        Map<String, Object> event = new HashMap<>();
        event.put("status", status);
        event.put("date", LocalDateTime.now().toString());
        event.put("userId", userId);
        event.put("notes", notes);
        history.add(event);
    }
    
    private void addAuditEvent(List<Map<String, Object>> auditTrail, Long userId, String action, String details) {
        Map<String, Object> event = new HashMap<>();
        event.put("timestamp", LocalDateTime.now().toString());
        event.put("userId", userId);
        event.put("action", action);
        event.put("details", details);
        auditTrail.add(event);
    }
    
    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Error serializing JSON", e);
            return "{}";
        }
    }
    
    private <T> T deserializeJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            log.error("Error deserializing JSON", e);
            return null;
        }
    }
}
