package com.siar.governance.service;

import com.siar.alert.service.AlertService;
import com.siar.dossier.model.Dossier;
import com.siar.dossier.model.DossierStatus;
import com.siar.governance.model.*;
import com.siar.governance.repository.DataInconsistencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de Consistencia de Datos
 * 
 * Motor de reglas que detecta inconsistencias:
 * - Duplicados
 * - Validaciones cruzadas
 * - Datos desactualizados
 * - Referencias rotas
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DataConsistencyService {
    
    private final DataInconsistencyRepository inconsistencyRepository;
    private final AlertService alertService;
    
    /**
     * Detecta todas las inconsistencias de un expediente
     */
    @Transactional
    public List<DataInconsistency> detectInconsistencies(Dossier dossier) {
        List<DataInconsistency> issues = new ArrayList<>();
        
        // Regla 1: Expediente aprobado debe tener evaluación de riesgo
        if (dossier.getStatus() == DossierStatus.APPROVED 
            && dossier.getRiskAssessment() == null) {
            issues.add(createInconsistency(
                "MISSING_RISK_EVALUATION",
                Severity.CRITICAL,
                "Expediente aprobado sin evaluación de riesgo",
                "Dossier",
                dossier.getDossierId(),
                "RULE_001_APPROVED_WITHOUT_RISK_EVAL"
            ));
        }
        
        // Regla 2: Documentos vencidos
        dossier.getAttachedDocuments().stream()
            .filter(doc -> doc.getExpirationDate() != null 
                        && doc.getExpirationDate().isBefore(LocalDate.now()))
            .forEach(doc -> issues.add(createInconsistency(
                "EXPIRED_DOCUMENT",
                Severity.HIGH,
                "Documento vencido: " + doc.getDocumentType(),
                "Document",
                doc.getDocumentId(),
                "RULE_002_EXPIRED_DOCUMENT"
            )));
        
        // Regla 3: PEP sin Due Diligence Reforzada
        if (dossier.getPepInformation() != null 
            && dossier.getPepInformation().getIsPep()
            && dossier.getDueDiligenceLevel() != DiligenceLevel.ENHANCED) {
            issues.add(createInconsistency(
                "PEP_WITHOUT_ENHANCED_DD",
                Severity.CRITICAL,
                "PEP requiere Due Diligence Reforzada",
                "Dossier",
                dossier.getDossierId(),
                "RULE_003_PEP_WITHOUT_ENHANCED_DD"
            ));
        }
        
        // Regla 4: Screening vencido
        if (dossier.getLastScreeningDate() != null) {
            LocalDate nextScreeningDue = calculateNextScreeningDate(
                dossier.getLastScreeningDate(),
                dossier.getRiskLevel()
            );
            
            if (LocalDate.now().isAfter(nextScreeningDue)) {
                issues.add(createInconsistency(
                    "OVERDUE_SCREENING",
                    Severity.MEDIUM,
                    "Screening vencido desde " + nextScreeningDue,
                    "Dossier",
                    dossier.getDossierId(),
                    "RULE_004_OVERDUE_SCREENING"
                ));
            }
        }
        
        // Regla 5: Evaluación de riesgo desactualizada
        if (dossier.getRiskAssessment() != null 
            && dossier.getRiskAssessment().getNextReviewDate() != null
            && LocalDate.now().isAfter(dossier.getRiskAssessment().getNextReviewDate())) {
            issues.add(createInconsistency(
                "OUTDATED_RISK_EVALUATION",
                Severity.MEDIUM,
                "Evaluación de riesgo debe actualizarse",
                "RiskEvaluation",
                dossier.getRiskAssessment().getEvaluationId(),
                "RULE_005_OUTDATED_RISK_EVAL"
            ));
        }
        
        // Persistir inconsistencias nuevas
        issues.forEach(issue -> {
            inconsistencyRepository.save(issue);
            
            // Crear alerta si es crítica o alta
            if (issue.getSeverity() == Severity.CRITICAL 
                || issue.getSeverity() == Severity.HIGH) {
                createAlertForInconsistency(issue);
            }
        });
        
        return issues;
    }
    
    /**
     * Chequeo programado diario de consistencia
     */
    @Scheduled(cron = "0 0 2 * * *") // Diariamente a las 2 AM
    @Transactional
    public void scheduledConsistencyCheck() {
        log.info("Iniciando chequeo programado de consistencia de datos");
        
        // Obtener expedientes activos
        List<Dossier> activeDossiers = dossierRepository.findByIsDeletedFalse();
        
        int totalChecked = 0;
        int totalIssues = 0;
        
        for (Dossier dossier : activeDossiers) {
            List<DataInconsistency> issues = detectInconsistencies(dossier);
            totalChecked++;
            totalIssues += issues.size();
        }
        
        log.info("Chequeo de consistencia completado: {} expedientes revisados, {} inconsistencias detectadas",
                totalChecked, totalIssues);
    }
    
    /**
     * Detecta expedientes duplicados
     */
    public List<DataInconsistency> detectDuplicates() {
        List<DataInconsistency> duplicates = new ArrayList<>();
        
        // Buscar duplicados exactos por documento
        List<Dossier> allDossiers = dossierRepository.findByIsDeletedFalse();
        
        for (int i = 0; i < allDossiers.size(); i++) {
            for (int j = i + 1; j < allDossiers.size(); j++) {
                Dossier d1 = allDossiers.get(i);
                Dossier d2 = allDossiers.get(j);
                
                // Mismo documento de identidad
                if (d1.getDocumentNumber() != null 
                    && d1.getDocumentNumber().equals(d2.getDocumentNumber())) {
                    
                    duplicates.add(createDuplicateInconsistency(d1, d2, "EXACT_DOCUMENT_MATCH"));
                }
            }
        }
        
        return duplicates;
    }
    
    // Métodos auxiliares
    
    private DataInconsistency createInconsistency(
            String type,
            Severity severity,
            String description,
            String entityType,
            String entityId,
            String validationRule) {
        
        return DataInconsistency.builder()
            .inconsistencyCode(generateInconsistencyCode())
            .inconsistencyType(type)
            .severity(severity)
            .description(description)
            .affectedEntity(entityType)
            .affectedEntityId(entityId)
            .validationRule(validationRule)
            .detectedAt(Instant.now())
            .detectedBy("SYSTEM")
            .status(InconsistencyStatus.DETECTED)
            .requiresManualReview(severity == Severity.CRITICAL || severity == Severity.HIGH)
            .autoResolvable(false)
            .build();
    }
    
    private DataInconsistency createDuplicateInconsistency(Dossier d1, Dossier d2, String matchType) {
        // Implementación de detección de duplicados
        return DataInconsistency.builder()
            .inconsistencyCode(generateInconsistencyCode())
            .inconsistencyType("DUPLICATE")
            .severity(Severity.HIGH)
            .description("Posible duplicado detectado: " + d1.getDossierId() + " y " + d2.getDossierId())
            .affectedEntity("Dossier")
            .affectedEntityId(d1.getDossierId())
            .validationRule("RULE_006_DUPLICATE_DETECTION")
            .detectedAt(Instant.now())
            .detectedBy("SYSTEM")
            .status(InconsistencyStatus.DETECTED)
            .requiresManualReview(true)
            .autoResolvable(false)
            .build();
    }
    
    private void createAlertForInconsistency(DataInconsistency inconsistency) {
        // Delegar a AlertService
        alertService.createAlertFromInconsistency(inconsistency);
    }
    
    private String generateInconsistencyCode() {
        return "INC-" + java.time.Year.now().getValue() + "-" 
             + String.format("%06d", inconsistencyRepository.count() + 1);
    }
    
    private LocalDate calculateNextScreeningDate(LocalDate lastScreening, RiskLevel riskLevel) {
        return switch (riskLevel) {
            case HIGH -> lastScreening.plusMonths(1);
            case MEDIUM -> lastScreening.plusMonths(3);
            case LOW -> lastScreening.plusMonths(6);
        };
    }
}
