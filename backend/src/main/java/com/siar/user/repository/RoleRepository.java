package com.siar.user.repository;

import com.siar.user.model.Role;
import com.siar.user.model.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para entidad Role
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    /**
     * Busca un rol por código
     */
    Optional<Role> findByRoleCode(String roleCode);

    /**
     * Busca roles por tipo
     */
    List<Role> findByRoleType(RoleType roleType);

    /**
     * Busca roles de supervisión
     */
    List<Role> findByIsSupervisoryTrue();

    /**
     * Busca roles de solo lectura
     */
    List<Role> findByIsReadOnlyTrue();

    /**
     * Busca roles que pueden aprobar
     */
    List<Role> findByIsApproverTrue();

    /**
     * Busca roles que requieren acceso temporal
     */
    List<Role> findByRequiresTemporalAccessTrue();

    /**
     * Busca roles del sistema (no editables)
     */
    List<Role> findByIsSystemRoleTrue();
}
