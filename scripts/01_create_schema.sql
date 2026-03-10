-- =====================================================
-- SIAR - Script de Creación del Schema Principal
-- Sistema Integral de Administración de Riesgos
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Verificar versión de PostgreSQL
DO $$
BEGIN
    IF current_setting('server_version_num')::int < 150000 THEN
        RAISE EXCEPTION 'Se requiere PostgreSQL 15 o superior';
    END IF;
END
$$;

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS public;

SET search_path TO public;

-- Comentario del schema
COMMENT ON SCHEMA public IS 'Schema principal del SIAR - Sistema Integral de Administración de Riesgos y Cumplimiento';

-- =====================================================
-- CONFIGURACIÓN DE AUDITORÍA AUTOMÁTICA
-- =====================================================

-- Variable de sesión para usuario actual
CREATE OR REPLACE FUNCTION set_current_user(username VARCHAR)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user', username, false);
END;
$$ LANGUAGE plpgsql;

-- Variable de sesión para rol actual
CREATE OR REPLACE FUNCTION set_current_role(role_code VARCHAR)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.user_role', role_code, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_current_user IS 'Establece el usuario actual en la sesión para auditoría';
COMMENT ON FUNCTION set_current_role IS 'Establece el rol actual en la sesión para políticas de seguridad';
