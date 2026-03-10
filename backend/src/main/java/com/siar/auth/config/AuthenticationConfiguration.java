package com.siar.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de autenticación del sistema
 * Permite cambiar el modo de autenticación sin modificar código
 */
@Configuration
@ConfigurationProperties(prefix = "siar.auth")
@Data
public class AuthenticationConfiguration {
    
    /**
     * Modo de autenticación activo
     * Por defecto: LOCAL
     */
    private AuthenticationMode mode = AuthenticationMode.LOCAL;
    
    /**
     * Indica si se permite acceso ADMIN temporal
     * Debe ser deshabilitado en producción
     */
    private boolean adminAccessEnabled = true;
    
    /**
     * Dominio corporativo para construcción de emails
     */
    private String corporateDomain = "@laoccidental.com";
    
    /**
     * Configuración LDAP (cuando mode = LDAP)
     */
    private LdapConfig ldap;
    
    /**
     * Configuración SSO (cuando mode = SSO)
     */
    private SsoConfig sso;
    
    @Data
    public static class LdapConfig {
        private String url;
        private String baseDn;
        private String userSearchBase;
        private String userSearchFilter;
        private String managerDn;
        private String managerPassword;
        private boolean enabled = false;
    }
    
    @Data
    public static class SsoConfig {
        private String provider; // SAML, OAUTH2, OIDC
        private String entityId;
        private String metadataUrl;
        private String clientId;
        private String clientSecret;
        private String redirectUri;
        private boolean enabled = false;
    }
}
