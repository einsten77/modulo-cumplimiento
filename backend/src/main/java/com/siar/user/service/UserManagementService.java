package com.siar.user.service;

import com.siar.user.dto.*;
import com.siar.user.model.*;
import com.siar.user.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio principal para gestión de usuarios
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleIncompatibilityRepository incompatibilityRepository;
    private final UserChangeHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleSegregationService segregationService;
    private final UserAuditService auditService;
    private final UserAlertService alertService;

    /**
     * Crea un nuevo usuario en el sistema
     */
    public UserResponseDTO createUser(CreateUserRequestDTO request, String createdBy) {
        log.info("Creating new user: {} by {}", request.getUsername(), createdBy);

        // Validaciones
        validateUserCreation(request);

        // Validar segregación de funciones
        segregationService.validateRoleCompatibility(request.getRoles());

        // Crear usuario
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(generateTemporaryPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .identificationType(request.getIdentificationType())
                .identificationNumber(request.getIdentificationNumber())
                .userType(request.getUserType())
                .status(UserStatus.PENDING_APPROVAL)
                .organizationArea(request.getOrganizationArea())
                .phoneNumber(request.getPhoneNumber())
                .position(request.getPosition())
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .mustChangePassword(true)
                .build();

        // Configurar acceso temporal para externos
        if (request.getUserType() == UserType.EXTERNAL) {
            user.setTemporalAccessStart(request.getTemporalAccessStart());
            user.setTemporalAccessEnd(request.getTemporalAccessEnd());
            user.setExternalOrganization(request.getExternalOrganization());
            user.setExternalAccessPurpose(request.getExternalAccessPurpose());
        }

        user = userRepository.save(user);

        // Asignar roles
        for (String roleCode : request.getRoles()) {
            assignRoleToUser(user.getUserId(), roleCode, createdBy, "Asignación inicial");
        }

        // Registrar en auditoría
        auditService.logUserCreated(user, createdBy);

        // Generar alerta
        alertService.notifyUserCreated(user, createdBy);

        log.info("User created successfully: {}", user.getUserId());

        return convertToDTO(userRepository.findById(user.getUserId()).orElseThrow());
    }

    /**
     * Actualiza información de un usuario existente
     */
    public UserResponseDTO updateUser(String userId, UpdateUserRequestDTO request, String modifiedBy) {
        log.info("Updating user: {} by {}", userId, modifiedBy);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // No permitir auto-modificación
        if (userId.equals(modifiedBy)) {
            throw new IllegalStateException("Un usuario no puede modificarse a sí mismo");
        }

        // Validar que el usuario no esté inactivo
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new IllegalStateException("No se puede modificar un usuario inactivo");
        }

        // Registrar cambios
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            recordChange(user, "email", user.getEmail(), request.getEmail(), 
                        request.getModificationReason(), modifiedBy);
            user.setEmail(request.getEmail());
        }

        if (request.getPhoneNumber() != null) {
            recordChange(user, "phoneNumber", user.getPhoneNumber(), request.getPhoneNumber(),
                        request.getModificationReason(), modifiedBy);
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getOrganizationArea() != null) {
            recordChange(user, "organizationArea", user.getOrganizationArea(), 
                        request.getOrganizationArea(), request.getModificationReason(), modifiedBy);
            user.setOrganizationArea(request.getOrganizationArea());
        }

        if (request.getPosition() != null) {
            recordChange(user, "position", user.getPosition(), request.getPosition(),
                        request.getModificationReason(), modifiedBy);
            user.setPosition(request.getPosition());
        }

        user.setLastModifiedBy(modifiedBy);
        user.setLastModifiedAt(LocalDateTime.now());

        user = userRepository.save(user);

        // Auditoría y alerta
        auditService.logUserModified(user, modifiedBy);
        alertService.notifyUserModified(user, modifiedBy);

        log.info("User updated successfully: {}", userId);

        return convertToDTO(user);
    }

    /**
     * Cambia el estado de un usuario
     */
    public UserResponseDTO changeUserStatus(String userId, UserStatus newStatus, 
                                           String reason, String changedBy) {
        log.info("Changing user status: {} to {} by {}", userId, newStatus, changedBy);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // No permitir auto-modificación
        if (userId.equals(changedBy)) {
            throw new IllegalStateException("Un usuario no puede cambiar su propio estado");
        }

        // Validaciones especiales para Oficial de Cumplimiento
        if (hasRole(user, "ROL-001") && newStatus != UserStatus.ACTIVE) {
            throw new IllegalStateException(
                "No se puede cambiar el estado del Oficial de Cumplimiento sin reemplazo");
        }

        UserStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);

        // Acciones específicas por estado
        switch (newStatus) {
            case INACTIVE:
                user.setInactivatedBy(changedBy);
                user.setInactivatedAt(LocalDateTime.now());
                user.setInactivationReason(reason);
                // Cerrar todas las sesiones activas
                closeAllUserSessions(userId);
                break;

            case SUSPENDED:
                // Cerrar todas las sesiones activas
                closeAllUserSessions(userId);
                break;

            case ACTIVE:
                // Resetear intentos de login
                user.resetLoginAttempts();
                break;
        }

        user = userRepository.save(user);

        // Registrar cambio
        recordChange(user, "status", oldStatus.name(), newStatus.name(), reason, changedBy);

        // Auditoría y alerta
        auditService.logUserStatusChanged(user, oldStatus, newStatus, changedBy);
        alertService.notifyUserStatusChanged(user, oldStatus, newStatus, changedBy);

        log.info("User status changed successfully: {} from {} to {}", 
                userId, oldStatus, newStatus);

        return convertToDTO(user);
    }

    /**
     * Asigna un rol a un usuario
     */
    public void assignRoleToUser(String userId, String roleCode, String assignedBy, String reason) {
        log.info("Assigning role {} to user {} by {}", roleCode, userId, assignedBy);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Role role = roleRepository.findByRoleCode(roleCode)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        // Validar que no esté ya asignado
        if (userRoleRepository.existsActiveByUserIdAndRoleCode(userId, roleCode)) {
            throw new IllegalStateException("El usuario ya tiene este rol asignado");
        }

        // Validar segregación de funciones
        List<String> currentRoles = userRoleRepository.findActiveRoleCodesByUserId(userId);
        currentRoles.add(roleCode);
        segregationService.validateRoleCompatibility(currentRoles);

        // Validación especial para Oficial de Cumplimiento
        if ("ROL-001".equals(roleCode)) {
            Long complianceOfficerCount = userRepository.countActiveUsersByRoleCode("ROL-001");
            if (complianceOfficerCount > 0) {
                throw new IllegalStateException(
                    "Ya existe un Oficial de Cumplimiento activo en el sistema");
            }
        }

        // Crear asignación
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .isActive(true)
                .assignmentReason(reason)
                .build();

        userRoleRepository.save(userRole);

        // Registrar cambio
        recordChange(user, "roles", null, roleCode, reason, assignedBy);

        // Auditoría y alerta
        auditService.logRoleAssigned(user, role, assignedBy);
        alertService.notifyRoleAssigned(user, role, assignedBy);

        log.info("Role assigned successfully: {} to user {}", roleCode, userId);
    }

    /**
     * Revoca un rol de un usuario
     */
    public void revokeRoleFromUser(String userId, String roleCode, String revokedBy, String reason) {
        log.info("Revoking role {} from user {} by {}", roleCode, userId, revokedBy);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UserRole userRole = userRoleRepository.findActiveByUserIdAndRoleCode(userId, roleCode)
                .orElseThrow(() -> new IllegalArgumentException("Asignación de rol no encontrada"));

        // Validar que el usuario quedará con al menos un rol
        Long activeRolesCount = userRoleRepository.countActiveRolesByUserId(userId);
        if (activeRolesCount <= 1) {
            throw new IllegalStateException("El usuario debe mantener al menos un rol activo");
        }

        // Revocar
        userRole.revoke(revokedBy, reason);
        userRoleRepository.save(userRole);

        // Registrar cambio
        recordChange(user, "roles", roleCode, null, reason, revokedBy);

        // Auditoría y alerta
        Role role = roleRepository.findByRoleCode(roleCode).orElseThrow();
        auditService.logRoleRevoked(user, role, revokedBy);
        alertService.notifyRoleRevoked(user, role, revokedBy);

        log.info("Role revoked successfully: {} from user {}", roleCode, userId);
    }

    // Métodos auxiliares privados
    
    private void validateUserCreation(CreateUserRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El username ya existe");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        if (request.getUserType() == UserType.EXTERNAL) {
            if (request.getTemporalAccessEnd() == null) {
                throw new IllegalArgumentException(
                    "Los usuarios externos requieren fecha de fin de acceso");
            }
            
            if (request.getTemporalAccessEnd().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("La fecha de fin de acceso no puede ser pasada");
            }
        }
    }

    private void recordChange(User user, String field, String oldValue, String newValue,
                             String reason, String changedBy) {
        UserChangeHistory history = UserChangeHistory.builder()
                .user(user)
                .changeType(ChangeType.USER_MODIFIED)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .fieldChanged(field)
                .oldValue(oldValue)
                .newValue(newValue)
                .reason(reason)
                .build();

        historyRepository.save(history);
    }

    private boolean hasRole(User user, String roleCode) {
        return userRoleRepository.existsActiveByUserIdAndRoleCode(user.getUserId(), roleCode);
    }

    private void closeAllUserSessions(String userId) {
        // Implementación delegada al servicio de sesiones
    }

    private String generateTemporaryPassword() {
        // Generar contraseña temporal segura
        return "TempPass123!"; // TODO: Implementar generación segura
    }

    private UserResponseDTO convertToDTO(User user) {
        // Convertir entidad a DTO
        return new UserResponseDTO(); // TODO: Implementar conversión completa
    }
}
