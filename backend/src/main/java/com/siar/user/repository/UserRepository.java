package com.siar.user.repository;

import com.siar.user.model.User;
import com.siar.user.model.UserStatus;
import com.siar.user.model.UserType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para entidad User
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Busca un usuario por username
     */
    Optional<User> findByUsername(String username);

    /**
     * Busca un usuario por email
     */
    Optional<User> findByEmail(String email);

    /**
     * Busca un usuario por tipo y número de identificación
     */
    Optional<User> findByIdentificationTypeAndIdentificationNumber(
        String identificationType, String identificationNumber);

    /**
     * Verifica si existe un username
     */
    boolean existsByUsername(String username);

    /**
     * Verifica si existe un email
     */
    boolean existsByEmail(String email);

    /**
     * Busca usuarios por estado
     */
    Page<User> findByStatus(UserStatus status, Pageable pageable);

    /**
     * Busca usuarios por tipo
     */
    Page<User> findByUserType(UserType userType, Pageable pageable);

    /**
     * Busca usuarios por estado y tipo
     */
    Page<User> findByStatusAndUserType(
        UserStatus status, UserType userType, Pageable pageable);

    /**
     * Busca usuarios por área organizacional
     */
    Page<User> findByOrganizationArea(String organizationArea, Pageable pageable);

    /**
     * Busca usuarios con rol específico
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN u.userRoles ur " +
           "WHERE ur.role.roleCode = :roleCode " +
           "AND ur.isActive = true")
    Page<User> findByRoleCode(@Param("roleCode") String roleCode, Pageable pageable);

    /**
     * Busca usuarios activos con rol específico
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN u.userRoles ur " +
           "WHERE ur.role.roleCode = :roleCode " +
           "AND ur.isActive = true " +
           "AND u.status = 'ACTIVE'")
    List<User> findActiveUsersByRoleCode(@Param("roleCode") String roleCode);

    /**
     * Cuenta usuarios activos con rol específico
     */
    @Query("SELECT COUNT(DISTINCT u) FROM User u " +
           "JOIN u.userRoles ur " +
           "WHERE ur.role.roleCode = :roleCode " +
           "AND ur.isActive = true " +
           "AND u.status = 'ACTIVE'")
    Long countActiveUsersByRoleCode(@Param("roleCode") String roleCode);

    /**
     * Busca usuarios externos con acceso próximo a vencer
     */
    @Query("SELECT u FROM User u " +
           "WHERE u.userType = 'EXTERNAL' " +
           "AND u.status = 'ACTIVE' " +
           "AND u.temporalAccessEnd BETWEEN :startDate AND :endDate")
    List<User> findExternalUsersWithAccessExpiringSoon(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Busca usuarios externos con acceso vencido
     */
    @Query("SELECT u FROM User u " +
           "WHERE u.userType = 'EXTERNAL' " +
           "AND u.status = 'ACTIVE' " +
           "AND u.temporalAccessEnd < :currentDate")
    List<User> findExternalUsersWithExpiredAccess(@Param("currentDate") LocalDateTime currentDate);

    /**
     * Busca usuarios con contraseña próxima a vencer (90 días)
     */
    @Query("SELECT u FROM User u " +
           "WHERE u.status = 'ACTIVE' " +
           "AND u.userType = 'INTERNAL' " +
           "AND u.passwordLastChanged < :expirationDate")
    List<User> findUsersWithPasswordExpiringSoon(@Param("expirationDate") LocalDateTime expirationDate);

    /**
     * Busca usuarios bloqueados
     */
    @Query("SELECT u FROM User u " +
           "WHERE u.lockedUntil IS NOT NULL " +
           "AND u.lockedUntil > :currentDate")
    List<User> findLockedUsers(@Param("currentDate") LocalDateTime currentDate);

    /**
     * Búsqueda avanzada de usuarios
     */
    @Query("SELECT u FROM User u " +
           "WHERE (:username IS NULL OR u.username LIKE %:username%) " +
           "AND (:email IS NULL OR u.email LIKE %:email%) " +
           "AND (:firstName IS NULL OR u.firstName LIKE %:firstName%) " +
           "AND (:lastName IS NULL OR u.lastName LIKE %:lastName%) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "AND (:userType IS NULL OR u.userType = :userType) " +
           "AND (:organizationArea IS NULL OR u.organizationArea = :organizationArea)")
    Page<User> searchUsers(
        @Param("username") String username,
        @Param("email") String email,
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("status") UserStatus status,
        @Param("userType") UserType userType,
        @Param("organizationArea") String organizationArea,
        Pageable pageable);
}
