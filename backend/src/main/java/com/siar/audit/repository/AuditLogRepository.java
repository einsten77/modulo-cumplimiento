package com.siar.audit.repository;

import com.siar.audit.model.AuditLog;
import com.siar.audit.model.EventCategory;
import com.siar.audit.model.EventLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para acceso a registros de auditoría
 * 
 * IMPORTANTE: Este repositorio solo permite operaciones de lectura y creación.
 * NO expone métodos para actualizar o eliminar registros (inmutabilidad).
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    
    /**
     * Busca el último registro insertado para obtener el hash y continuar la cadena
     */
    Optional<AuditLog> findTopByOrderBySequenceNumberDesc();
    
    /**
     * Obtiene el siguiente número de secuencia
     */
    @Query("SELECT COALESCE(MAX(a.sequenceNumber), 0) + 1 FROM AuditLog a")
    Long getNextSequenceNumber();
    
    /**
     * Busca registros por rango de fechas
     */
    Page<AuditLog> findByEventDateBetweenOrderByEventTimestampDesc(
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Busca registros por usuario
     */
    Page<AuditLog> findByUserIdOrderByEventTimestampDesc(
            String userId, 
            Pageable pageable
    );
    
    /**
     * Busca registros por categoría
     */
    Page<AuditLog> findByEventCategoryOrderByEventTimestampDesc(
            EventCategory category, 
            Pageable pageable
    );
    
    /**
     * Busca registros por nivel de evento
     */
    Page<AuditLog> findByEventLevelOrderByEventTimestampDesc(
            EventLevel level, 
            Pageable pageable
    );
    
    /**
     * Busca registros por recurso
     */
    List<AuditLog> findByResourceTypeAndResourceIdOrderByEventTimestampAsc(
            String resourceType, 
            String resourceId
    );
    
    /**
     * Busca registros por código de evento
     */
    Page<AuditLog> findByEventCodeOrderByEventTimestampDesc(
            String eventCode, 
            Pageable pageable
    );
    
    /**
     * Búsqueda combinada con filtros
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:startDate IS NULL OR a.eventDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.eventDate <= :endDate) AND " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:category IS NULL OR a.eventCategory = :category) AND " +
           "(:level IS NULL OR a.eventLevel = :level) AND " +
           "(:resourceType IS NULL OR a.resourceType = :resourceType) " +
           "ORDER BY a.eventTimestamp DESC")
    Page<AuditLog> findByFilters(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("userId") String userId,
            @Param("category") EventCategory category,
            @Param("level") EventLevel level,
            @Param("resourceType") String resourceType,
            Pageable pageable
    );
    
    /**
     * Busca registros por rango de IDs de auditoría (para verificación de integridad)
     */
    List<AuditLog> findByAuditIdBetweenOrderBySequenceNumberAsc(
            String startAuditId, 
            String endAuditId
    );
    
    /**
     * Busca registros por rango de números de secuencia
     */
    List<AuditLog> findBySequenceNumberBetweenOrderBySequenceNumberAsc(
            Long startSequence, 
            Long endSequence
    );
    
    /**
     * Cuenta eventos críticos en un período
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE " +
           "a.eventLevel = 'CRITICAL' AND " +
           "a.eventTimestamp BETWEEN :startTime AND :endTime")
    Long countCriticalEvents(
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime
    );
    
    /**
     * Obtiene eventos críticos recientes
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "a.eventLevel = 'CRITICAL' AND " +
           "a.eventTimestamp >= :since " +
           "ORDER BY a.eventTimestamp DESC")
    List<AuditLog> findRecentCriticalEvents(
            @Param("since") Instant since,
            Pageable pageable
    );
    
    /**
     * Cuenta registros por categoría en un período
     */
    @Query("SELECT a.eventCategory, COUNT(a) FROM AuditLog a WHERE " +
           "a.eventDate BETWEEN :startDate AND :endDate " +
           "GROUP BY a.eventCategory")
    List<Object[]> countByCategory(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    /**
     * Busca intentos de violación de integridad
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "a.eventCode = 'AUD-033' AND " +
           "a.eventTimestamp >= :since " +
           "ORDER BY a.eventTimestamp DESC")
    List<AuditLog> findIntegrityViolationAttempts(@Param("since") Instant since);
}
