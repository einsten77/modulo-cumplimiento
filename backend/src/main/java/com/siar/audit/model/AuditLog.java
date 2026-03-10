package com.siar.audit.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;

/**
 * Entidad de Registro de Auditoría Inmutable del Sistema SIAR
 * 
 * Esta entidad representa un registro inmutable en la bitácora de auditoría.
 * NO PUEDE SER MODIFICADA NI ELIMINADA después de su creación.
 * 
 * Características de inmutabilidad:
 * - No tiene métodos setters después de la persistencia
 * - Los registros solo se crean con INSERT
 * - La base de datos tiene triggers que rechazan UPDATE/DELETE
 * - Cada registro tiene un hash del registro anterior (hash chain)
 * 
 * @author Sistema SIAR
 * @version 1.0
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_sequence", columnList = "sequenceNumber"),
    @Index(name = "idx_audit_event_code", columnList = "eventCode"),
    @Index(name = "idx_audit_event_category", columnList = "eventCategory"),
    @Index(name = "idx_audit_event_level", columnList = "eventLevel"),
    @Index(name = "idx_audit_timestamp", columnList = "eventTimestamp"),
    @Index(name = "idx_audit_user_id", columnList = "userId"),
    @Index(name = "idx_audit_user_role", columnList = "userRole"),
    @Index(name = "idx_audit_resource_type", columnList = "resourceType"),
    @Index(name = "idx_audit_resource_id", columnList = "resourceId"),
    @Index(name = "idx_audit_event_date", columnList = "eventDate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    
    // ============================================
    // IDENTIFICACIÓN DEL REGISTRO
    // ============================================
    
    /**
     * Identificador único del registro de auditoría
     * Formato: AUD-YYYY-NNNNNNNNNN (ej: AUD-2025-0001234567)
     */
    @Id
    @Column(length = 25, nullable = false)
    private String auditId;
    
    /**
     * Número de secuencia autoincremental
     * Garantiza el orden cronológico de los eventos
     */
    @Column(nullable = false, unique = true)
    private Long sequenceNumber;
    
    // ============================================
    // INFORMACIÓN DEL EVENTO
    // ============================================
    
    /**
     * Código del evento según catálogo
     * (ej: AUD-001, AUD-003, AUD-015)
     */
    @Column(length = 10, nullable = false)
    private String eventCode;
    
    /**
     * Nombre descriptivo del evento
     */
    @Column(length = 200, nullable = false)
    private String eventName;
    
    /**
     * Categoría o módulo del sistema
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private EventCategory eventCategory;
    
    /**
     * Nivel de criticidad del evento
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private EventLevel eventLevel;
    
    /**
     * Fecha y hora exacta del evento (con precisión de microsegundos)
     */
    @Column(nullable = false)
    private Instant eventTimestamp;
    
    /**
     * Fecha del evento (para facilitar búsquedas)
     */
    @Column(nullable = false)
    private LocalDate eventDate;
    
    /**
     * Hora del evento (para facilitar búsquedas)
     */
    @Column(nullable = false)
    private LocalTime eventTime;
    
    // ============================================
    // INFORMACIÓN DEL ACTOR (QUIEN EJECUTA)
    // ============================================
    
    /**
     * ID del usuario que ejecuta la acción
     */
    @Column(length = 50, nullable = false)
    private String userId;
    
    /**
     * Nombre completo del usuario
     */
    @Column(length = 200, nullable = false)
    private String userName;
    
    /**
     * Email del usuario
     */
    @Column(length = 100, nullable = false)
    private String userEmail;
    
    /**
     * Rol del usuario en el momento del evento
     */
    @Column(length = 50, nullable = false)
    private String userRole;
    
    /**
     * Departamento del usuario
     */
    @Column(length = 100)
    private String userDepartment;
    
    /**
     * Ubicación del usuario
     */
    @Column(length = 100)
    private String userLocation;
    
    // ============================================
    // INFORMACIÓN DE SESIÓN Y ACCESO
    // ============================================
    
    /**
     * ID de la sesión del usuario
     */
    @Column(length = 100)
    private String sessionId;
    
    /**
     * Dirección IP del usuario
     */
    @Column(length = 45)
    private String ipAddress;
    
    /**
     * User Agent del navegador
     */
    @Column(length = 500)
    private String userAgent;
    
    /**
     * Tipo de dispositivo
     */
    @Column(length = 50)
    private String device;
    
    /**
     * Navegador
     */
    @Column(length = 100)
    private String browser;
    
    /**
     * Sistema operativo
     */
    @Column(length = 100)
    private String os;
    
    // ============================================
    // INFORMACIÓN DEL RECURSO AFECTADO
    // ============================================
    
    /**
     * Tipo de recurso afectado (DOSSIER, RISK_EVALUATION, etc.)
     */
    @Column(length = 50, nullable = false)
    private String resourceType;
    
    /**
     * ID del recurso afectado
     */
    @Column(length = 100, nullable = false)
    private String resourceId;
    
    /**
     * Nombre o descripción del recurso
     */
    @Column(length = 500)
    private String resourceName;
    
    /**
     * Tipo de recurso padre (si aplica)
     */
    @Column(length = 50)
    private String parentResourceType;
    
    /**
     * ID del recurso padre (si aplica)
     */
    @Column(length = 100)
    private String parentResourceId;
    
    // ============================================
    // INFORMACIÓN DE LA ACCIÓN
    // ============================================
    
    /**
     * Tipo de acción realizada
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private ActionType actionType;
    
    /**
     * Verbo de la acción (CREATED, UPDATED, DELETED, etc.)
     */
    @Column(length = 30, nullable = false)
    private String actionVerb;
    
    /**
     * Descripción detallada de la acción
     */
    @Column(length = 1000, nullable = false)
    private String actionDescription;
    
    /**
     * Método HTTP usado (GET, POST, PUT, DELETE)
     */
    @Column(length = 10)
    private String actionMethod;
    
    /**
     * Endpoint de la API invocado
     */
    @Column(length = 500)
    private String actionEndpoint;
    
    /**
     * Duración de la acción en milisegundos
     */
    @Column
    private Integer actionDuration;
    
    // ============================================
    // CAMBIOS DE ESTADO
    // ============================================
    
    /**
     * Indica si hubo cambio de estado
     */
    @Column(nullable = false)
    private Boolean hasStateChange;
    
    /**
     * Estado anterior del recurso (JSON)
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode previousState;
    
    /**
     * Nuevo estado del recurso (JSON)
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode newState;
    
    /**
     * Lista de campos modificados (JSON)
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode changedFields;
    
    // ============================================
    // CONTEXTO DE NEGOCIO Y CUMPLIMIENTO
    // ============================================
    
    /**
     * Justificación de la acción
     */
    @Column(length = 2000)
    private String justification;
    
    /**
     * Base regulatoria
     */
    @Column(length = 500)
    private String regulatoryBasis;
    
    /**
     * Notas de cumplimiento
     */
    @Column(length = 2000)
    private String complianceNotes;
    
    /**
     * Entidades relacionadas (JSON)
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode relatedEntities;
    
    // ============================================
    // INFORMACIÓN TÉCNICA
    // ============================================
    
    /**
     * Versión de la aplicación
     */
    @Column(length = 50)
    private String applicationVersion;
    
    /**
     * Versión de la base de datos
     */
    @Column(length = 100)
    private String databaseVersion;
    
    /**
     * Servidor donde se ejecutó
     */
    @Column(length = 100)
    private String serverHostname;
    
    /**
     * ID de la petición
     */
    @Column(length = 100)
    private String requestId;
    
    /**
     * ID de la transacción
     */
    @Column(length = 100)
    private String transactionId;
    
    // ============================================
    // INFORMACIÓN DE SEGURIDAD
    // ============================================
    
    /**
     * Método de autenticación usado
     */
    @Column(length = 50)
    private String authenticationMethod;
    
    /**
     * Indica si pasó la autorización
     */
    @Column
    private Boolean authorizationPassed;
    
    /**
     * Permisos verificados (JSON array)
     */
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode permissionsChecked;
    
    /**
     * Nivel de seguridad
     */
    @Column(length = 30)
    private String securityLevel;
    
    // ============================================
    // PROTECCIÓN DE DATOS
    // ============================================
    
    /**
     * Indica si contiene datos personales (PII)
     */
    @Column
    private Boolean containsPII;
    
    /**
     * Clasificación de los datos
     */
    @Column(length = 30)
    private String dataClassification;
    
    /**
     * Indica si se aplicó encriptación
     */
    @Column
    private Boolean encryptionApplied;
    
    /**
     * Indica si requiere anonimización
     */
    @Column
    private Boolean anonymizationRequired;
    
    // ============================================
    // INTEGRIDAD Y HASH CHAIN
    // ============================================
    
    /**
     * Hash SHA-256 de este registro
     * Se calcula al momento de la inserción
     */
    @Column(length = 64, nullable = false)
    private String recordHash;
    
    /**
     * Hash del registro anterior (para cadena de hash)
     * Permite detectar modificaciones no autorizadas
     */
    @Column(length = 64)
    private String previousRecordHash;
    
    // ============================================
    // METADATA DE AUDITORÍA
    // ============================================
    
    /**
     * Fecha y hora de creación del registro
     * (momento en que se insertó en la base de datos)
     */
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    
    /**
     * Versión del formato de registro
     */
    @Column(length = 10, nullable = false)
    private String recordVersion;
    
    /**
     * Indica si el registro ha sido exportado
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean exported = false;
    
    /**
     * Fecha de exportación (si aplica)
     */
    @Column
    private Instant exportedAt;
    
    /**
     * Usuario que exportó (si aplica)
     */
    @Column(length = 50)
    private String exportedBy;
    
    // ============================================
    // MÉTODOS DE UTILIDAD
    // ============================================
    
    /**
     * Genera el ID de auditoría basado en el año y número de secuencia
     */
    public static String generateAuditId(int year, long sequenceNumber) {
        return String.format("AUD-%d-%010d", year, sequenceNumber);
    }
    
    /**
     * Indica si el evento es crítico
     */
    public boolean isCritical() {
        return EventLevel.CRITICAL.equals(this.eventLevel);
    }
    
    /**
     * Obtiene el año del evento
     */
    public int getEventYear() {
        return eventDate.getYear();
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (recordVersion == null) {
            recordVersion = "1.0";
        }
    }
}
