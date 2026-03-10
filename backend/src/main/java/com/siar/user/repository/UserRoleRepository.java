package com.siar.user.repository;

import com.siar.user.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para entidad UserRole
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, String> {

    /**
     * Busca asignaciones de roles activas de un usuario
     */
    @Query("SELECT ur FROM UserRole ur " +
           "WHERE ur.user.userId = :userId " +
           "AND ur.isActive = true")
    List<UserRole> findActiveByUserId(@Param("userId") String userId);

    /**
     * Busca todas las asignaciones de roles de un usuario (activas e inactivas)
     */
    List<UserRole> findByUser_UserId(String userId);

    /**
     * Busca una asignación específica de rol a usuario
     */
    @Query("SELECT ur FROM UserRole ur " +
           "WHERE ur.user.userId = :userId " +
           "AND ur.role.roleCode = :roleCode " +
           "AND ur.isActive = true")
    Optional<UserRole> findActiveByUserIdAndRoleCode(
        @Param("userId") String userId, 
        @Param("roleCode") String roleCode);

    /**
     * Verifica si un usuario tiene un rol específico activo
     */
    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur " +
           "WHERE ur.user.userId = :userId " +
           "AND ur.role.roleCode = :roleCode " +
           "AND ur.isActive = true")
    boolean existsActiveByUserIdAndRoleCode(
        @Param("userId") String userId, 
        @Param("roleCode") String roleCode);

    /**
     * Obtiene los códigos de roles activos de un usuario
     */
    @Query("SELECT ur.role.roleCode FROM UserRole ur " +
           "WHERE ur.user.userId = :userId " +
           "AND ur.isActive = true")
    List<String> findActiveRoleCodesByUserId(@Param("userId") String userId);

    /**
     * Busca asignaciones de roles que vencen pronto
     */
    @Query("SELECT ur FROM UserRole ur " +
           "WHERE ur.isActive = true " +
           "AND ur.validUntil BETWEEN :startDate AND :endDate")
    List<UserRole> findExpiringRoles(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Busca asignaciones de roles vencidas
     */
    @Query("SELECT ur FROM UserRole ur " +
           "WHERE ur.isActive = true " +
           "AND ur.validUntil < :currentDate")
    List<UserRole> findExpiredRoles(@Param("currentDate") LocalDateTime currentDate);

    /**
     * Cuenta el número de roles activos de un usuario
     */
    @Query("SELECT COUNT(ur) FROM UserRole ur " +
           "WHERE ur.user.userId = :userId " +
           "AND ur.isActive = true")
    Long countActiveRolesByUserId(@Param("userId") String userId);

    /**
     * Busca todos los usuarios con un rol específico
     */
    @Query("SELECT ur FROM UserRole ur " +
           "WHERE ur.role.roleCode = :roleCode " +
           "AND ur.isActive = true")
    List<UserRole> findActiveByRoleCode(@Param("roleCode") String roleCode);
}
