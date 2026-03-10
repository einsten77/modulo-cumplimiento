package com.siar.auth.config;

/**
 * Modos de autenticación soportados por el sistema
 * Permite transición progresiva hacia autenticación corporativa
 */
public enum AuthenticationMode {
    /**
     * Autenticación local mediante base de datos
     */
    LOCAL,
    
    /**
     * Autenticación mediante LDAP corporativo
     */
    LDAP,
    
    /**
     * Autenticación mediante Active Directory
     */
    ACTIVE_DIRECTORY,
    
    /**
     * Autenticación mediante SSO (SAML, OAuth2, OpenID Connect)
     */
    SSO,
    
    /**
     * Modo híbrido - permite ambos LOCAL y SSO
     */
    HYBRID
}
