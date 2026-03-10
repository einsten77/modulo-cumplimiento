package com.siar.user.model;

/**
 * Método de autenticación utilizado
 */
public enum LoginMethod {
    /**
     * Usuario y contraseña
     */
    PASSWORD,
    
    /**
     * Single Sign-On
     */
    SSO,
    
    /**
     * API Key
     */
    API_KEY,
    
    /**
     * Autenticación de dos factores
     */
    TWO_FACTOR
}
