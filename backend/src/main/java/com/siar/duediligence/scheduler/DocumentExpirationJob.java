package com.siar.duediligence.scheduler;

import com.siar.duediligence.model.DueDiligenceDocument;
import com.siar.duediligence.service.DocumentManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Job que se ejecuta diariamente para marcar documentos vencidos
 * y generar alertas sobre documentos próximos a vencer
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentExpirationJob {
    
    private final DocumentManagementService documentService;
    // private final AlertService alertService;
    
    /**
     * Se ejecuta todos los días a las 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void markExpiredDocuments() {
        log.info("Starting document expiration job");
        
        try {
            List<DueDiligenceDocument> expiredDocs = documentService.markExpiredDocuments();
            log.info("Marked {} documents as expired", expiredDocs.size());
            
            // Generar alertas críticas para cada documento vencido
            for (DueDiligenceDocument doc : expiredDocs) {
                // alertService.createAlert(...)
                log.warn("Document expired: {}", doc.getDocumentId());
            }
            
        } catch (Exception e) {
            log.error("Error in document expiration job", e);
        }
    }
    
    /**
     * Se ejecuta todos los días a las 8:00 AM
     * Genera alertas para documentos próximos a vencer
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void alertExpiringDocuments() {
        log.info("Starting expiring documents alert job");
        
        try {
            // Documentos que vencen en 30 días
            List<DueDiligenceDocument> expiring30 = documentService.findExpiringDocuments(30);
            for (DueDiligenceDocument doc : expiring30) {
                // alertService.createAlert("DOCUMENTO_PROXIMO_VENCER", severity=MEDIA, ...)
                log.info("Document expiring in 30 days: {}", doc.getDocumentId());
            }
            
            // Documentos que vencen en 7 días
            List<DueDiligenceDocument> expiring7 = documentService.findExpiringDocuments(7);
            for (DueDiligenceDocument doc : expiring7) {
                // alertService.createAlert("DOCUMENTO_PROXIMO_VENCER", severity=ALTA, ...)
                log.warn("Document expiring in 7 days: {}", doc.getDocumentId());
            }
            
        } catch (Exception e) {
            log.error("Error in expiring documents alert job", e);
        }
    }
}
