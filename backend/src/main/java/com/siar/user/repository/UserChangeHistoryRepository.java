package com.siar.user.repository;

import com.siar.user.model.ChangeType;
import com.siar.user.model.UserChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para entidad UserChangeHistory
 */
@Repository
public interface UserChangeHistoryRepository extends JpaRepository<UserChangeHistory, String> {

    /**
     * Busca el historial de un usuario específico
     */
    Page<UserChangeHistory> findByUser_UserId(String userId, Pageable pageable);

    /**
     * Busca cambios por tipo
     */
    Page<UserChangeHistory> findByChangeType(ChangeType changeType, Pageable pageable);

    /**
     * Busca cambios realizados por un usuario específico
     */
    Page<UserChangeHistory> findByChangedBy(String changedBy, Pageable pageable);

    /**
     * Busca cambios en un rango de fechas
     */
    @Query("SELECT uch FROM UserChangeHistory uch " +
           "WHERE uch.changedAt BETWEEN :startDate AND :endDate")
    Page<UserChangeHistory> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable);

    /**
     * Busca cambios de un usuario en un rango de fechas
     */
    @Query("SELECT uch FROM UserChangeHistory uch " +
           "WHERE uch.user.userId = :userId " +
           "AND uch.changedAt BETWEEN :startDate AND :endDate")
    List<UserChangeHistory> findByUserIdAndDateRange(
        @Param("userId") String userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Busca cambios por tipo y usuario
     */
    @Query("SELECT uch FROM UserChangeHistory uch " +
           "WHERE uch.user.userId = :userId " +
           "AND uch.changeType = :changeType")
    List<UserChangeHistory> findByUserIdAndChangeType(
        @Param("userId") String userId,
        @Param("changeType") ChangeType changeType);

    /**
     * Busca cambios pendientes de aprobación
     */
    @Query("SELECT uch FROM UserChangeHistory uch " +
           "WHERE uch.isApprovalRequired = true " +
           "AND uch.approvedBy IS NULL")
    List<UserChangeHistory> findPendingApproval();

    /**
     * Cuenta cambios por tipo en un período
     */
    @Query("SELECT COUNT(uch) FROM UserChangeHistory uch " +
           "WHERE uch.changeType = :changeType " +
           "AND uch.changedAt BETWEEN :startDate AND :endDate")
    Long countByChangeTypeAndDateRange(
        @Param("changeType") ChangeType changeType,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
}
