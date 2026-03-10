package com.siar.audit.service;

import com.siar.audit.dto.AuditLogDTO;
import com.siar.audit.dto.AuditLogRequestDTO;
import com.siar.audit.model.*;
import com.siar.audit.repository.AuditLogRepository;
import com.siar.user.model.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import jakarta.servlet.http.HttpServletRequest;

import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de Auditoría del Sistema SIAR
 * 
 * Este servicio es responsable de:
 * - Registrar todos los eventos auditables del sistema
 * - Garantizar la inmutabilidad de los registros
 * - Mantener la cadena de hash (hash chain) para verificación de integridad
 * - Proporcionar consultas para auditorías internas y externas
 * 
 * PRINCIPIOS FUNDAMENTALES:
 * - Los registros NUNCA se modifican ni eliminan
 * - Cada registro contiene el hash del registro anterior
 * - Todo evento relevante debe ser auditado
 * - La auditoría no debe fallar nunca (transacciones independientes)
 * 
 * @author Sistema SIAR
 * @version 1.0
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;
    
    @Value("${siar.version:1.0.0}")
    private String applicationVersion;
    
    @Value("${siar.audit.timezone:America/Caracas}")
    private String timezone;
    
    // ============================================
    // REGISTRO DE EVENTOS
    // ============================================
    
    /**
     * Registra un evento de auditoría
     * 
     * Este método usa una transacción independiente (REQUIRES_NEW) para garantizar
     * que el registro de auditoría se persista incluso si la transacción principal falla.
     * 
     * @param user Usuario que ejecuta la acción
     * @param eventCode Código del evento (ej: AUD-001)
     * @param eventName Nombre descriptivo del evento
     * @param eventCategory Categoría del evento
     * @param eventLevel Nivel de criticidad
     * @param resourceType Tipo de recurso afectado
     * @param resourceId ID del recurso afectado
     * @param resourceName Nombre del recurso
     * @param actionType Tipo de acción
     * @param actionVerb Verbo de la acción
     * @param actionDescription Descripción de la acción
     * @return El registro de auditoría creado
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog logEvent(
            User user,
            String eventCode,
            String eventName,
            EventCategory eventCategory,
            EventLevel eventLevel,
            String resourceType,
            String resourceId,
            String resourceName,
            ActionType actionType,
            String actionVerb,
            String actionDescription
    ) {
        return logEvent(user, eventCode, eventName, eventCategory, eventLevel,
                resourceType, resourceId, resourceName, actionType, actionVerb,
                actionDescription, null, null, null);
    }
    
    /**
     * Registra un evento de auditoría con información completa
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog logEvent(
            User user,
            String eventCode,
            String eventName,
            EventCategory eventCategory,
            EventLevel eventLevel,
            String resourceType,
            String resourceId,
            String resourceName,
            ActionType actionType,
            String actionVerb,
            String actionDescription,
            Object previousState,
            Object newState,
            String justification
    ) {
        try {
            // Obtener el siguiente número de secuencia
            Long sequenceNumber = auditLogRepository.getNextSequenceNumber();
            
            // Obtener timestamp actual
            Instant now = Instant.now();
            LocalDate eventDate = LocalDate.now(ZoneId.of(timezone));
            LocalTime eventTime = LocalTime.now(ZoneId.of(timezone));
            int year = eventDate.getYear();
            
            // Generar ID de auditoría
            String auditId = AuditLog.generateAuditId(year, sequenceNumber);
            
            // Obtener hash del registro anterior
            String previousRecordHash = getPreviousRecordHash();
            
            // Construir el registro
            AuditLog.AuditLogBuilder builder = AuditLog.builder()
                    .auditId(auditId)
                    .sequenceNumber(sequenceNumber)
                    .eventCode(eventCode)
                    .eventName(eventName)
                    .eventCategory(eventCategory)
                    .eventLevel(eventLevel)
                    .eventTimestamp(now)
                    .eventDate(eventDate)
                    .eventTime(eventTime)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .resourceName(resourceName)
                    .actionType(actionType)
                    .actionVerb(actionVerb)
                    .actionDescription(actionDescription)
                    .justification(justification)
                    .previousRecordHash(previousRecordHash)
                    .applicationVersion(applicationVersion)
                    .recordVersion("1.0")
                    .exported(false);
            
            // Información del usuario
            if (user != null) {
                builder.userId(user.getUserId())
                       .userName(user.getFullName())
                       .userEmail(user.getEmail())
                       .userRole(user.getPrimaryRole() != null ? user.getPrimaryRole().getName() : "UNKNOWN")
                       .userDepartment(user.getDepartment())
                       .userLocation(user.getLocation());
            } else {
                builder.userId("SYSTEM")
                       .userName("Sistema Automático")
                       .userEmail("system@siar.local")
                       .userRole("SYSTEM");
            }
            
            // Información de sesión (de HttpServletRequest)
            enrichWithSessionInfo(builder);
            
            // Información de estado
            enrichWithStateInfo(builder, previousState, newState);
            
            // Información técnica
            enrichWithTechnicalInfo(builder);
            
            // Construir el registro
            AuditLog auditLog = builder.build();
            
            // Calcular el hash de este registro
            String recordHash = calculateRecordHash(auditLog);
            auditLog.setRecordHash(recordHash);
            
            // Persistir el registro
            AuditLog savedLog = auditLogRepository.save(auditLog);
            
            log.debug("Audit log created: {} - {}", auditId, eventName);
            
            return savedLog;
            
        } catch (Exception e) {
            // La auditoría no debe fallar nunca, pero si falla, se registra en el log
            log.error("Error creating audit log: {} - {}", eventCode, eventName, e);
            throw new RuntimeException("Error creating audit log", e);
        }
    }
    
    // ============================================
    // MÉTODOS AUXILIARES PARA ENRIQUECER INFORMACIÓN
    // ============================================
    
    private void enrichWithSessionInfo(AuditLog.AuditLogBuilder builder) {
        try {
            if (request != null) {
                builder.ipAddress(getClientIpAddress())
                       .userAgent(request.getHeader("User-Agent"))
                       .actionMethod(request.getMethod())
                       .actionEndpoint(request.getRequestURI());
                
                // Parsear User-Agent para obtener dispositivo, navegador, OS
                String userAgent = request.getHeader("User-Agent");
                if (userAgent != null) {
                    builder.device(extractDevice(userAgent))
                           .browser(extractBrowser(userAgent))
                           .os(extractOS(userAgent));
                }
            }
        } catch (Exception e) {
            log.warn("Error enriching session info", e);
        }
    }
    
    private void enrichWithStateInfo(AuditLog.AuditLogBuilder builder, Object previousState, Object newState) {
        try {
            boolean hasStateChange = (previousState != null || newState != null);
            builder.hasStateChange(hasStateChange);
            
            if (previousState != null) {
                JsonNode prevJson = objectMapper.valueToTree(previousState);
                builder.previousState(prevJson);
            }
            
            if (newState != null) {
                JsonNode newJson = objectMapper.valueToTree(newState);
                builder.newState(newJson);
            }
            
        } catch (Exception e) {
            log.warn("Error enriching state info", e);
            builder.hasStateChange(false);
        }
    }
    
    private void enrichWithTechnicalInfo(AuditLog.AuditLogBuilder builder) {
        try {
            String hostname = InetAddress.getLocalHost().getHostName();
            builder.serverHostname(hostname);
            
            // Información de base de datos (podría obtenerse de configuración)
            builder.databaseVersion("PostgreSQL 15.3");
            
        } catch (Exception e) {
            log.warn("Error enriching technical info", e);
        }
    }
    
    // ============================================
    // HASH CHAIN (CADENA DE HASH)
    // ============================================
    
    /**
     * Obtiene el hash del último registro insertado
     */
    private String getPreviousRecordHash() {
        return auditLogRepository.findTopByOrderBySequenceNumberDesc()
                .map(AuditLog::getRecordHash)
                .orElse("GENESIS_BLOCK");
    }
    
    /**
     * Calcula el hash SHA-256 de un registro
     */
    private String calculateRecordHash(AuditLog auditLog) {
        try {
            // Construir la cadena de datos a hashear
            String dataToHash = buildRecordDataForHashing(auditLog);
            
            // Calcular SHA-256
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));
            
            // Convertir a hexadecimal
            return HexFormat.of().formatHex(hash);
            
        } catch (NoSuchAlgorithmException e) {
            log.error("Error calculating record hash", e);
            throw new RuntimeException("Error calculating record hash", e);
        }
    }
    
    /**
     * Construye la cadena de datos para calcular el hash
     */
    private String buildRecordDataForHashing(AuditLog auditLog) {
        return String.format("%s|%d|%s|%s|%s|%s|%s|%s|%s",
                auditLog.getAuditId(),
                auditLog.getSequenceNumber(),
                auditLog.getEventCode(),
                auditLog.getEventTimestamp(),
                auditLog.getUserId(),
                auditLog.getResourceType(),
                auditLog.getResourceId(),
                auditLog.getActionVerb(),
                auditLog.getPreviousRecordHash()
        );
    }
    
    /**
     * Verifica la integridad de la cadena de hash
     */
    public boolean verifyChainIntegrity(String startAuditId, String endAuditId) {
        List<AuditLog> records = auditLogRepository
                .findByAuditIdBetweenOrderBySequenceNumberAsc(startAuditId, endAuditId);
        
        if (records.isEmpty()) {
            return true;
        }
        
        for (int i = 1; i < records.size(); i++) {
            AuditLog current = records.get(i);
            AuditLog previous = records.get(i - 1);
            
            // Verificar que el hash anterior coincide
            if (!current.getPreviousRecordHash().equals(previous.getRecordHash())) {
                log.error("Chain integrity broken between {} and {}", 
                        previous.getAuditId(), current.getAuditId());
                return false;
            }
            
            // Recalcular hash del registro actual
            String calculatedHash = calculateRecordHash(current);
            if (!calculatedHash.equals(current.getRecordHash())) {
                log.error("Record hash mismatch for {}", current.getAuditId());
                return false;
            }
        }
        
        return true;
    }
    
    // ============================================
    // CONSULTAS
    // ============================================
    
    /**
     * Busca registros por filtros
     */
    public Page<AuditLog> findByFilters(
            LocalDate startDate,
            LocalDate endDate,
            String userId,
            EventCategory category,
            EventLevel level,
            String resourceType,
            Pageable pageable
    ) {
        return auditLogRepository.findByFilters(
                startDate, endDate, userId, category, level, resourceType, pageable
        );
    }
    
    /**
     * Busca registros por expediente
     */
    public List<AuditLog> findByDossier(String dossierId) {
        return auditLogRepository.findByResourceTypeAndResourceIdOrderByEventTimestampAsc(
                "DOSSIER", dossierId
        );
    }
    
    /**
     * Busca eventos críticos recientes
     */
    public List<AuditLog> findRecentCriticalEvents(Instant since, int limit) {
        return auditLogRepository.findRecentCriticalEvents(since, PageRequest.of(0, limit));
    }
    
    /**
     * Obtiene un registro por ID
     */
    public AuditLog findById(String auditId) {
        return auditLogRepository.findById(auditId)
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + auditId));
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    private String getClientIpAddress() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    
    private String extractDevice(String userAgent) {
        if (userAgent.contains("Mobile")) return "Mobile";
        if (userAgent.contains("Tablet")) return "Tablet";
        return "Desktop";
    }
    
    private String extractBrowser(String userAgent) {
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        return "Unknown";
    }
    
    private String extractOS(String userAgent) {
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac OS")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iOS")) return "iOS";
        return "Unknown";
    }
    
    /**
     * Convierte una entidad AuditLog a DTO
     */
    public AuditLogDTO toDTO(AuditLog auditLog) {
        return AuditLogDTO.builder()
                .auditId(auditLog.getAuditId())
                .sequenceNumber(auditLog.getSequenceNumber())
                .eventCode(auditLog.getEventCode())
                .eventName(auditLog.getEventName())
                .eventCategory(auditLog.getEventCategory())
                .eventLevel(auditLog.getEventLevel())
                .eventTimestamp(auditLog.getEventTimestamp())
                .eventDate(auditLog.getEventDate())
                .eventTime(auditLog.getEventTime())
                .actor(AuditLogDTO.ActorDTO.builder()
                        .userId(auditLog.getUserId())
                        .userName(auditLog.getUserName())
                        .userEmail(auditLog.getUserEmail())
                        .userRole(auditLog.getUserRole())
                        .userDepartment(auditLog.getUserDepartment())
                        .userLocation(auditLog.getUserLocation())
                        .build())
                .session(AuditLogDTO.SessionDTO.builder()
                        .sessionId(auditLog.getSessionId())
                        .ipAddress(auditLog.getIpAddress())
                        .userAgent(auditLog.getUserAgent())
                        .device(auditLog.getDevice())
                        .browser(auditLog.getBrowser())
                        .os(auditLog.getOs())
                        .build())
                .target(AuditLogDTO.ResourceDTO.builder()
                        .resourceType(auditLog.getResourceType())
                        .resourceId(auditLog.getResourceId())
                        .resourceName(auditLog.getResourceName())
                        .parentResourceType(auditLog.getParentResourceType())
                        .parentResourceId(auditLog.getParentResourceId())
                        .build())
                .action(AuditLogDTO.ActionDTO.builder()
                        .actionType(auditLog.getActionType())
                        .actionVerb(auditLog.getActionVerb())
                        .actionDescription(auditLog.getActionDescription())
                        .actionMethod(auditLog.getActionMethod())
                        .actionEndpoint(auditLog.getActionEndpoint())
                        .actionDuration(auditLog.getActionDuration())
                        .build())
                .stateChange(AuditLogDTO.StateChangeDTO.builder()
                        .hasStateChange(auditLog.getHasStateChange())
                        .previousState(auditLog.getPreviousState())
                        .newState(auditLog.getNewState())
                        .changedFields(auditLog.getChangedFields())
                        .build())
                .businessContext(AuditLogDTO.BusinessContextDTO.builder()
                        .justification(auditLog.getJustification())
                        .regulatoryBasis(auditLog.getRegulatoryBasis())
                        .complianceNotes(auditLog.getComplianceNotes())
                        .relatedEntities(auditLog.getRelatedEntities())
                        .build())
                .technical(AuditLogDTO.TechnicalDTO.builder()
                        .applicationVersion(auditLog.getApplicationVersion())
                        .databaseVersion(auditLog.getDatabaseVersion())
                        .serverHostname(auditLog.getServerHostname())
                        .requestId(auditLog.getRequestId())
                        .transactionId(auditLog.getTransactionId())
                        .build())
                .security(AuditLogDTO.SecurityDTO.builder()
                        .authenticationMethod(auditLog.getAuthenticationMethod())
                        .authorizationPassed(auditLog.getAuthorizationPassed())
                        .permissionsChecked(auditLog.getPermissionsChecked())
                        .securityLevel(auditLog.getSecurityLevel())
                        .build())
                .dataProtection(AuditLogDTO.DataProtectionDTO.builder()
                        .containsPII(auditLog.getContainsPII())
                        .dataClassification(auditLog.getDataClassification())
                        .encryptionApplied(auditLog.getEncryptionApplied())
                        .anonymizationRequired(auditLog.getAnonymizationRequired())
                        .build())
                .integrity(AuditLogDTO.IntegrityDTO.builder()
                        .recordHash(auditLog.getRecordHash())
                        .previousRecordHash(auditLog.getPreviousRecordHash())
                        .build())
                .createdAt(auditLog.getCreatedAt())
                .recordVersion(auditLog.getRecordVersion())
                .exported(auditLog.getExported())
                .exportedAt(auditLog.getExportedAt())
                .exportedBy(auditLog.getExportedBy())
                .build();
    }
}
