package com.siar.user.repository;

import com.siar.user.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para entidad UserSession
 */
@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {

    /**
     * Busca sesiones activas de un usuario
     */
    @Query("SELECT us FROM UserSession us " +
           "WHERE us.user.userId = :userId " +
           "AND us.isActive = true")
    List<UserSession> findActiveByUserId(@Param("userId") String userId);

    /**
     * Busca todas las sesiones de un usuario
     */
    List<UserSession> findByUser_UserId(String userId);

    /**
     * Busca sesiones por dirección IP
     */
    List<UserSession> findByIpAddress(String ipAddress);

    /**
     * Busca sesiones expiradas por inactividad
     */
    @Query("SELECT us FROM UserSession us " +
           "WHERE us.isActive = true " +
           "AND us.lastActivityAt < :expirationTime")
    List<UserSession> findExpiredSessions(@Param("expirationTime") LocalDateTime expirationTime);

    /**
     * Cuenta sesiones activas de un usuario
     */
    @Query("SELECT COUNT(us) FROM UserSession us " +
           "WHERE us.user.userId = :userId " +
           "AND us.isActive = true")
    Long countActiveByUserId(@Param("userId") String userId);

    /**
     * Cuenta todas las sesiones activas en el sistema
     */
    @Query("SELECT COUNT(us) FROM UserSession us " +
           "WHERE us.isActive = true")
    Long countAllActiveSessions();

    /**
     * Busca sesiones en un rango de fechas
     */
    @Query("SELECT us FROM UserSession us " +
           "WHERE us.loginAt BETWEEN :startDate AND :endDate")
    List<UserSession> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
}
