package com.siar.screening.service;

import com.siar.screening.model.*;
import com.siar.screening.repository.*;
import com.siar.alert.service.AlertService;
import com.siar.audit.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScreeningExecutionService {
    
    @Autowired
    private ScreeningRepository screeningRepository;
    
    @Autowired
    private ScreeningResultRepository screeningResultRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private WatchlistRepository watchlistRepository;
    
    @Autowired
    private WatchlistEntryRepository watchlistEntryRepository;
    
    @Autowired
    private JaroWinklerService jaroWinklerService;
    
    @Autowired
    private AlertService alertService;
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Ejecuta screening para un expediente
     */
    @Transactional
    public Screening executeScreening(Long dossierId, ScreeningType screeningType, User currentUser) {
        long startTime = System.currentTimeMillis();
        
        // Crear registro de screening
        Screening screening = new Screening();
        screening.setDossierId(dossierId);
        screening.setScreeningType(screeningType);
        screening.setExecutionDate(Instant.now());
        screening.setStatus(ScreeningStatus.IN_PROGRESS);
        screening.setExecutedBy(currentUser.getId());
        
        // Obtener datos del sujeto desde el expediente
        // TODO: Implementar extracción de datos del expediente
        String entityName = "NOMBRE DEL SUJETO"; // Placeholder
        EntityType entityType = EntityType.PERSON;
        
        screening.setScreenedEntityName(entityName);
        screening.setScreenedEntityType(entityType);
        
        screening = screeningRepository.save(screening);
        
        try {
            // Obtener listas activas ordenadas por prioridad
            List<Watchlist> activeLists = watchlistRepository.findActiveWatchlistsOrderedByPriority();
            
            int totalMatches = 0;
            boolean hasRelevantMatches = false;
            
            // Ejecutar screening contra cada lista
            for (Watchlist watchlist : activeLists) {
                ScreeningResult result = screenAgainstWatchlist(
                    screening.getId(),
                    watchlist,
                    entityName,
                    entityType
                );
                
                totalMatches += result.getMatchesFound();
                
                // Verificar si hay coincidencias relevantes (> 70%)
                List<Match> matches = matchRepository.findByScreeningId(screening.getId());
                for (Match match : matches) {
                    if (match.getSimilarityScore().compareTo(BigDecimal.valueOf(70)) >= 0) {
                        hasRelevantMatches = true;
                        break;
                    }
                }
            }
            
            // Actualizar screening con resultados
            screening.setTotalListsChecked(activeLists.size());
            screening.setTotalMatchesFound(totalMatches);
            screening.setHasRelevantMatches(hasRelevantMatches);
            screening.setStatus(ScreeningStatus.COMPLETED);
            
            // Determinar resultado general
            if (!hasRelevantMatches) {
                screening.setOverallResult(ScreeningResult.CLEAR);
            } else {
                screening.setOverallResult(ScreeningResult.REQUIRES_REVIEW);
                
                // Generar alerta para Oficial de Cumplimiento
                alertService.createScreeningAlert(screening.getId(), dossierId);
            }
            
            screening.setExecutionDurationMs(System.currentTimeMillis() - startTime);
            screening = screeningRepository.save(screening);
            
            // Auditoría
            auditService.logScreeningExecution(screening, currentUser);
            
        } catch (Exception e) {
            screening.setStatus(ScreeningStatus.ERROR);
            screening.setErrorMessage(e.getMessage());
            screening = screeningRepository.save(screening);
            throw e;
        }
        
        return screening;
    }
    
    /**
     * Ejecuta screening contra una lista específica
     */
    private ScreeningResult screenAgainstWatchlist(
        Long screeningId,
        Watchlist watchlist,
        String entityName,
        EntityType entityType
    ) {
        long startTime = System.currentTimeMillis();
        
        ScreeningResult result = new ScreeningResult();
        result.setScreeningId(screeningId);
        result.setWatchlistId(watchlist.getId());
        result.setWatchlistName(watchlist.getName());
        
        // Obtener entradas activas de la lista
        List<WatchlistEntry> entries = watchlistEntryRepository
            .findActiveEntriesByWatchlistAndType(watchlist.getId(), entityType);
        
        result.setTotalEntriesChecked(entries.size());
        
        int matchesFound = 0;
        
        // Comparar contra cada entrada
        for (WatchlistEntry entry : entries) {
            double similarity = jaroWinklerService.calculateSimilarity(
                entityName,
                entry.getName()
            );
            
            BigDecimal similarityPercentage = jaroWinklerService.toPercentage(similarity);
            
            // Si la similitud es >= 70%, registrar como coincidencia
            if (similarityPercentage.compareTo(BigDecimal.valueOf(70)) >= 0) {
                Match match = createMatch(result, entry, entityName, similarityPercentage);
                matchRepository.save(match);
                matchesFound++;
            }
        }
        
        result.setMatchesFound(matchesFound);
        result.setExecutionTimeMs(System.currentTimeMillis() - startTime);
        
        return screeningResultRepository.save(result);
    }
    
    /**
     * Crea un registro de coincidencia
     */
    private Match createMatch(
        ScreeningResult result,
        WatchlistEntry entry,
        String screenedName,
        BigDecimal similarityScore
    ) {
        Match match = new Match();
        match.setScreeningResultId(result.getId());
        match.setWatchlistEntryId(entry.getId());
        match.setScreenedName(screenedName);
        match.setMatchedName(entry.getName());
        match.setSimilarityScore(similarityScore);
        
        // Determinar tipo de coincidencia
        if (similarityScore.compareTo(BigDecimal.valueOf(95)) >= 0) {
            match.setMatchType(MatchType.HIGH);
            match.setIsRelevant(true);
            match.setRequiresReview(true);
        } else if (similarityScore.compareTo(BigDecimal.valueOf(85)) >= 0) {
            match.setMatchType(MatchType.MEDIUM);
            match.setIsRelevant(true);
            match.setRequiresReview(true);
        } else {
            match.setMatchType(MatchType.LOW);
            match.setIsRelevant(false);
            match.setRequiresReview(false);
        }
        
        return match;
    }
    
    /**
     * Obtiene detalles de un screening
     */
    public Screening getScreeningDetails(Long screeningId) {
        return screeningRepository.findById(screeningId)
            .orElseThrow(() -> new RuntimeException("Screening not found: " + screeningId));
    }
    
    /**
     * Obtiene historial de screenings de un expediente
     */
    public List<Screening> getDossierScreenings(Long dossierId) {
        return screeningRepository.findByDossierId(dossierId);
    }
}
