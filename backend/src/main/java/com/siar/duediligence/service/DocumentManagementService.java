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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DocumentManagementService {
    
    private final DueDiligenceDocumentRepository documentRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final DocumentHistoryRepository historyRepository;
    private final DueDiligenceRepository dueDiligenceRepository;
    private final ObjectMapper objectMapper;
    // private final StorageService storageService; // Para guardar archivos
    // private final AlertService alertService; // Para generar alertas
    
    /**
     * Carga un documento nuevo
     */
    public DueDiligenceDocument uploadDocument(Long dueDiligenceId, String documentTypeCode,
                                               MultipartFile file, Map<String, Object> metadata,
                                               Long userId) {
        log.info("Uploading document type {} for due diligence: {}", documentTypeCode, dueDiligenceId);
        
        // Validar due diligence existe
        DueDiligence dd = dueDiligenceRepository.findById(dueDiligenceId)
            .orElseThrow(() -> new NotFoundException("Due diligence not found"));
        
        // Obtener tipo de documento
        DocumentType docType = documentTypeRepository.findByCode(documentTypeCode)
            .orElseThrow(() -> new NotFoundException("Document type not found: " + documentTypeCode));
        
        // Validar formato y tamaño
        validateFile(file, docType);
        
        // Verificar si hay versión previa
        Optional<DueDiligenceDocument> existingDoc = documentRepository
            .findCurrentVersionByType(dueDiligenceId, docType.getId());
        
        int newVersion = existingDoc.map(doc -> doc.getVersion() + 1).orElse(1);
        
        // Marcar versión anterior como no actual
        existingDoc.ifPresent(doc -> {
            doc.setIsCurrentVersion(false);
            if (doc.getApprovalStatus() == DocumentApprovalStatus.APROBADO) {
                doc.setApprovalStatus(DocumentApprovalStatus.OBSOLETO);
            }
            documentRepository.save(doc);
        });
        
        // Crear nuevo documento
        DueDiligenceDocument newDoc = new DueDiligenceDocument();
        newDoc.setDocumentId(generateDocumentId(dueDiligenceId, docType.getCode(), newVersion));
        newDoc.setDueDiligenceId(dueDiligenceId);
        newDoc.setDocumentTypeId(docType.getId());
        newDoc.setFileName(file.getOriginalFilename());
        newDoc.setFileSize(file.getSize());
        newDoc.setMimeType(file.getContentType());
        newDoc.setFileHash(calculateFileHash(file));
        // newDoc.setStorageLocation(storageService.store(file)); // Guardar archivo
        newDoc.setStorageLocation("/storage/temp/" + file.getOriginalFilename()); // Placeholder
        newDoc.setVersion(newVersion);
        newDoc.setIsCurrentVersion(true);
        newDoc.setUploadDate(LocalDateTime.now());
        newDoc.setUploadedBy(userId);
        newDoc.setApprovalStatus(DocumentApprovalStatus.PENDIENTE);
        
        // Calcular fecha de vencimiento si aplica
        if (docType.getRequiresExpiration() && docType.getDefaultExpirationMonths() != null) {
            newDoc.setExpirationDate(LocalDate.now().plusMonths(docType.getDefaultExpirationMonths()));
        }
        
        // Guardar metadata
        if (metadata != null && !metadata.isEmpty()) {
            newDoc.setMetadataJson(serializeJson(metadata));
        }
        
        existingDoc.ifPresent(doc -> newDoc.setReplacesDocumentId(doc.getId()));
        
        DueDiligenceDocument saved = documentRepository.save(newDoc);
        
        // Registrar en historial
        createHistory(saved.getId(), userId, "UPLOADED", null, "PENDIENTE", 
            "Documento cargado (versión " + newVersion + ")");
        
        // Generar alerta al Oficial de Cumplimiento si es una nueva versión de documento aprobado
        if (existingDoc.isPresent() && existingDoc.get().getApprovalStatus() == DocumentApprovalStatus.APROBADO) {
            // alertService.createAlert("CAMBIO_DOCUMENTAL", ...)
            log.info("Alert generated: document change for approved document");
        }
        
        return saved;
    }
    
    /**
     * Aprueba un documento (solo Oficial de Cumplimiento)
     */
    public DueDiligenceDocument approveDocument(Long documentId, Long officerId, String notes) {
        DueDiligenceDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));
        
        if (doc.getApprovalStatus() == DocumentApprovalStatus.APROBADO) {
            throw new ValidationException("Document already approved");
        }
        
        String previousStatus = doc.getApprovalStatus().name();
        
        doc.setApprovalStatus(DocumentApprovalStatus.APROBADO);
        doc.setApprovedBy(officerId);
        doc.setApprovalDate(LocalDateTime.now());
        doc.setApprovalNotes(notes);
        doc.setLastModifiedDate(LocalDateTime.now());
        doc.setLastModifiedBy(officerId);
        
        DueDiligenceDocument saved = documentRepository.save(doc);
        
        // Registrar en historial
        createHistory(documentId, officerId, "APPROVED", previousStatus, "APROBADO", notes);
        
        return saved;
    }
    
    /**
     * Rechaza un documento
     */
    public DueDiligenceDocument rejectDocument(Long documentId, Long officerId, String reason) {
        DueDiligenceDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));
        
        String previousStatus = doc.getApprovalStatus().name();
        
        doc.setApprovalStatus(DocumentApprovalStatus.RECHAZADO);
        doc.setApprovalNotes(reason);
        doc.setLastModifiedDate(LocalDateTime.now());
        doc.setLastModifiedBy(officerId);
        
        DueDiligenceDocument saved = documentRepository.save(doc);
        
        // Registrar en historial
        createHistory(documentId, officerId, "REJECTED", previousStatus, "RECHAZADO", reason);
        
        // Generar alerta
        log.info("Alert generated: document rejection");
        
        return saved;
    }
    
    /**
     * Marca documentos vencidos (ejecutado por job programado)
     */
    public List<DueDiligenceDocument> markExpiredDocuments() {
        LocalDate today = LocalDate.now();
        List<DueDiligenceDocument> expiredDocs = documentRepository.findExpiredDocuments(today);
        
        for (DueDiligenceDocument doc : expiredDocs) {
            String previousStatus = doc.getApprovalStatus().name();
            doc.setApprovalStatus(DocumentApprovalStatus.VENCIDO);
            doc.setLastModifiedDate(LocalDateTime.now());
            documentRepository.save(doc);
            
            // Registrar en historial
            createHistory(doc.getId(), null, "EXPIRED", previousStatus, "VENCIDO", 
                "Documento vencido automáticamente");
            
            // Generar alerta crítica
            log.warn("Document expired: {} for due diligence: {}", 
                doc.getDocumentId(), doc.getDueDiligenceId());
        }
        
        return expiredDocs;
    }
    
    /**
     * Obtiene documentos próximos a vencer
     */
    public List<DueDiligenceDocument> findExpiringDocuments(int daysAhead) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(daysAhead);
        return documentRepository.findExpiringDocuments(startDate, endDate);
    }
    
    /**
     * Obtiene todas las versiones de un documento
     */
    public List<DueDiligenceDocument> getDocumentVersions(Long dueDiligenceId, String documentTypeCode) {
        DocumentType docType = documentTypeRepository.findByCode(documentTypeCode)
            .orElseThrow(() -> new NotFoundException("Document type not found: " + documentTypeCode));
        
        return documentRepository.findAllVersionsByType(dueDiligenceId, docType.getId());
    }
    
    /**
     * Obtiene el historial de cambios de un documento
     */
    public List<DocumentHistory> getDocumentHistory(Long documentId) {
        return historyRepository.findByDocumentIdOrderByChangeDateDesc(documentId);
    }
    
    // Métodos auxiliares
    
    private void validateFile(MultipartFile file, DocumentType docType) {
        // Validar tamaño
        long maxSize = docType.getMaxFileSizeMB() * 1024L * 1024L;
        if (file.getSize() > maxSize) {
            throw new ValidationException("File size exceeds maximum allowed: " + docType.getMaxFileSizeMB() + "MB");
        }
        
        // Validar formato
        String contentType = file.getContentType();
        // Simplificado, en producción validar contra acceptedFormatsJson
        if (contentType == null || (!contentType.contains("pdf") && !contentType.contains("image"))) {
            throw new ValidationException("File format not accepted for this document type");
        }
    }
    
    private String calculateFileHash(MultipartFile file) {
        // En producción, calcular SHA-256 real
        return "sha256:" + UUID.randomUUID().toString();
    }
    
    private String generateDocumentId(Long dueDiligenceId, String typeCode, int version) {
        return String.format("DOC-%d-%s-V%d", dueDiligenceId, typeCode, version);
    }
    
    private void createHistory(Long documentId, Long userId, String changeType, 
                              String previousStatus, String newStatus, String notes) {
        DocumentHistory history = new DocumentHistory();
        history.setDocumentId(documentId);
        history.setChangeDate(LocalDateTime.now());
        history.setChangedBy(userId != null ? userId : 0L); // 0 = SYSTEM
        history.setChangeType(changeType);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setNotes(notes);
        historyRepository.save(history);
    }
    
    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Error serializing JSON", e);
            return "{}";
        }
    }
}
