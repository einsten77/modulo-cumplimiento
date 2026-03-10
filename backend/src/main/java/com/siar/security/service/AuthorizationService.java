package com.siar.security.service;

import com.siar.security.dto.UserContext;
import com.siar.security.exception.AuthorizationException;
import com.siar.security.model.Permission;
import com.siar.security.model.Role;
import com.siar.security.model.SecurityAuditEvent;
import com.siar.security.model.User;
import com.siar.security.repository.PermissionRepository;
import com.siar.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de Autorización del Sistema SIAR
 * Implementa el motor RBAC para verificar permisos
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final SecurityAuditService auditService;
    private final AlertIntegrationService alertService;

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    public boolean hasPermission(UserContext context, String permissionCode) {
        log.debug("[v0] Checking permission {} for user {}", permissionCode, context.getUsername());
        
        User user = loadUser(context.getUserId());
        return user.hasPermission(permissionCode);
    }

    /**
     * Verifica permiso y lanza excepción si no lo tiene
     */
    public void checkPermission(UserContext context, String permissionCode, String ipAddress) {
        if (!hasPermission(context, permissionCode)) {
            handleAccessDenied(context, permissionCode, ipAddress, 
                "Usuario no tiene el permiso requerido");
        }
    }

    /**
     * Verifica permiso considerando ownership del recurso
     */
    public void checkPermissionWithOwnership(UserContext context, String permissionCode, 
                                            UUID resourceCreatorId, String ipAddress) {
        User user = loadUser(context.getUserId());
        
        // Verificar que tiene el permiso base
        if (!user.hasPermission(permissionCode)) {
            handleAccessDenied(context, permissionCode, ipAddress, 
                "Usuario no tiene el permiso requerido");
        }

        // Cargar el permiso para verificar si requiere ownership
        Permission permission = permissionRepository.findByPermissionCode(permissionCode)
            .orElseThrow(() -> new AuthorizationException("Permiso no encontrado"));

        if (permission.requiresOwnership()) {
            // Verificar ownership o si es Oficial/Área de Cumplimiento
            boolean isOwner = user.getUserId().equals(resourceCreatorId);
            boolean isCompliance = user.isComplianceArea();

            if (!isOwner && !isCompliance) {
                handleAccessDenied(context, permissionCode, ipAddress, 
                    "Permiso requiere ser el creador del recurso");
            }
        }
    }

    /**
     * Verifica permiso considerando el estado del recurso
     */
    public void checkPermissionWithStatus(UserContext context, String permissionCode, 
                                         String resourceStatus, String ipAddress) {
        User user = loadUser(context.getUserId());
        
        // Verificar que tiene el permiso base
        if (!user.hasPermission(permissionCode)) {
            handleAccessDenied(context, permissionCode, ipAddress, 
                "Usuario no tiene el permiso requerido");
        }

        // Cargar el permiso para verificar estados permitidos
        Permission permission = permissionRepository.findByPermissionCode(permissionCode)
            .orElseThrow(() -> new AuthorizationException("Permiso no encontrado"));

        if (!permission.isStatusAllowed(resourceStatus)) {
            handleAccessDenied(context, permissionCode, ipAddress, 
                "Permiso no permite acción en recurso con estado: " + resourceStatus);
        }
    }

    /**
     * Verifica restricciones de rol (horario, IP)
     */
    public void checkRoleRestrictions(UserContext context, String ipAddress) {
        User user = loadUser(context.getUserId());

        for (Role role : user.getRoles()) {
            if (!role.isActive()) {
                continue;
            }

            // Verificar restricción de IP
            if (!role.isAccessAllowedFromIp(ipAddress)) {
                handleAccessDeniedIp(context, ipAddress);
            }

            // Verificar restricción de horario
            if (!role.isAccessAllowedAtTime(LocalDateTime.now())) {
                handleAccessDeniedTimeWindow(context, ipAddress);
            }
        }
    }

    /**
     * Maneja un acceso denegado por falta de permisos
     */
    private void handleAccessDenied(UserContext context, String permissionCode, 
                                   String ipAddress, String reason) {
        User user = loadUser(context.getUserId());

        auditService.recordAccessDenied(user, permissionCode, ipAddress, 
            SecurityAuditEvent.PERM_ACCESS_DENIED_NO_PERMISSION, reason);

        // Generar alerta si hay múltiples accesos denegados
        checkMultipleAccessDenied(user);

        throw new AuthorizationException("Acceso denegado: " + reason);
    }

    /**
     * Maneja un acceso denegado por IP no autorizada
     */
    private void handleAccessDeniedIp(UserContext context, String ipAddress) {
        User user = loadUser(context.getUserId());

        auditService.recordAccessDenied(user, "N/A", ipAddress, 
            SecurityAuditEvent.PERM_ACCESS_DENIED_IP, 
            "Acceso desde IP no autorizada: " + ipAddress);

        // Generar alerta inmediatamente
        alertService.generateUnauthorizedIpAlert(user, ipAddress);

        throw new AuthorizationException("Acceso denegado: IP no autorizada");
    }

    /**
     * Maneja un acceso denegado por fuera de horario
     */
    private void handleAccessDeniedTimeWindow(UserContext context, String ipAddress) {
        User user = loadUser(context.getUserId());

        auditService.recordAccessDenied(user, "N/A", ipAddress, 
            SecurityAuditEvent.PERM_ACCESS_DENIED_TIME_WINDOW, 
            "Acceso fuera de horario permitido");

        // Generar alerta
        alertService.generateOutOfHoursAlert(user);

        throw new AuthorizationException("Acceso denegado: fuera de horario permitido");
    }

    /**
     * Verifica si hay múltiples accesos denegados y genera alerta
     */
    private void checkMultipleAccessDenied(User user) {
        // Contar eventos PERM-001 en la última hora
        long deniedCount = auditService.countAccessDeniedInLastHour(user.getUserId());

        if (deniedCount >= 10) {
            alertService.generateMultipleAccessDeniedAlert(user, deniedCount);
        }
    }

    /**
     * Carga usuario desde BD
     */
    private User loadUser(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new AuthorizationException("Usuario no encontrado"));
    }
}
