package com.siar.user.repository;

import com.siar.user.model.IncompatibilitySeverity;
import com.siar.user.model.RoleIncompatibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para entidad RoleIncompatibility
 */
@Repository
public interface RoleIncompatibilityRepository extends JpaRepository<RoleIncompatibility, String> {

    /**
     * Busca incompatibilidades activas de un rol específico
     */
    @Query("SELECT ri FROM RoleIncompatibility ri " +
           "WHERE ri.isActive = true " +
           "AND (ri.roleCode1 = :roleCode OR ri.roleCode2 = :roleCode)")
    List<RoleIncompatibility> findActiveByRoleCode(@Param("roleCode") String roleCode);

    /**
     * Busca incompatibilidades entre dos roles específicos
     */
    @Query("SELECT ri FROM RoleIncompatibility ri " +
           "WHERE ri.isActive = true " +
           "AND ((ri.roleCode1 = :roleCode1 AND ri.roleCode2 = :roleCode2) " +
           "OR (ri.roleCode1 = :roleCode2 AND ri.roleCode2 = :roleCode1))")
    List<RoleIncompatibility> findActiveByRoleCodes(
        @Param("roleCode1") String roleCode1,
        @Param("roleCode2") String roleCode2);

    /**
     * Busca incompatibilidades bloqueantes de un rol
     */
    @Query("SELECT ri FROM RoleIncompatibility ri " +
           "WHERE ri.isActive = true " +
           "AND ri.severity = 'BLOCKING' " +
           "AND (ri.roleCode1 = :roleCode OR ri.roleCode2 = :roleCode)")
    List<RoleIncompatibility> findBlockingByRoleCode(@Param("roleCode") String roleCode);

    /**
     * Busca todas las incompatibilidades bloqueantes
     */
    List<RoleIncompatibility> findByIsActiveTrueAndSeverity(IncompatibilitySeverity severity);

    /**
     * Verifica si existe incompatibilidad entre dos roles
     */
    @Query("SELECT COUNT(ri) > 0 FROM RoleIncompatibility ri " +
           "WHERE ri.isActive = true " +
           "AND ((ri.roleCode1 = :roleCode1 AND ri.roleCode2 = :roleCode2) " +
           "OR (ri.roleCode1 = :roleCode2 AND ri.roleCode2 = :roleCode1))")
    boolean existsIncompatibility(
        @Param("roleCode1") String roleCode1,
        @Param("roleCode2") String roleCode2);
}
