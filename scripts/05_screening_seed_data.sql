-- ============================================================================
-- SIAR - Datos Iniciales del Módulo de Screening
-- Versión: 1.0
-- Fecha: 2024
-- Descripción: Datos de prueba y configuración inicial para el módulo
-- ============================================================================

-- ============================================================================
-- 1. LISTAS RESTRICTIVAS PRINCIPALES
-- ============================================================================

INSERT INTO watchlist (name, code, source, list_type, jurisdiction, description, update_frequency, is_active, priority, source_url, total_entries) VALUES
-- Listas de Sanciones Internacionales
('OFAC Specially Designated Nationals', 'OFAC-SDN', 'US Office of Foreign Assets Control', 'SANCTIONS', 'USA', 
 'Lista de personas y entidades sancionadas por Estados Unidos por terrorismo, narcotráfico, proliferación de armas y otros delitos graves', 
 'WEEKLY', true, 'CRITICAL', 'https://www.treasury.gov/ofac/downloads/sdnlist.pdf', 0),

('EU Consolidated Sanctions List', 'EU-CONS', 'European Union', 'SANCTIONS', 'EU', 
 'Lista consolidada de sanciones de la Unión Europea que incluye embargos de armas, congelamiento de activos y restricciones de viaje', 
 'DAILY', true, 'CRITICAL', 'https://webgate.ec.europa.eu/fsd/fsf', 0),

('UN Consolidated Sanctions List', 'UN-CONS', 'United Nations Security Council', 'SANCTIONS', 'GLOBAL', 
 'Lista consolidada de sanciones del Consejo de Seguridad de Naciones Unidas', 
 'MONTHLY', true, 'HIGH', 'https://www.un.org/securitycouncil/content/un-sc-consolidated-list', 0),

('UK HM Treasury Sanctions List', 'UK-HMT', 'UK HM Treasury', 'SANCTIONS', 'UK', 
 'Lista de sanciones del Tesoro del Reino Unido', 
 'WEEKLY', true, 'HIGH', 'https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets', 0),

-- Listas PEP y Funcionarios
('PEP Panama Database', 'PEP-PA', 'SUDEASEG', 'PEP', 'PANAMA', 
 'Base de datos de Personas Políticamente Expuestas de Panamá actualizada por la Superintendencia', 
 'MONTHLY', true, 'MEDIUM', null, 0),

('World-Check PEP', 'WC-PEP', 'Refinitiv World-Check', 'PEP', 'GLOBAL', 
 'Base de datos global de PEP y funcionarios de alto nivel', 
 'DAILY', true, 'MEDIUM', 'https://www.refinitiv.com/en/products/world-check-kyc-screening', 0),

-- Listas Antiterroristas
('OFAC Terrorism List', 'OFAC-TERROR', 'US Office of Foreign Assets Control', 'TERRORIST', 'USA', 
 'Lista de organizaciones terroristas extranjeras designadas por Estados Unidos', 
 'WEEKLY', true, 'CRITICAL', 'https://www.treasury.gov/resource-center/sanctions/Programs', 0),

('EU Terrorism List', 'EU-TERROR', 'European Union', 'TERRORIST', 'EU', 
 'Lista de personas, grupos y entidades involucradas en actos terroristas', 
 'MONTHLY', true, 'CRITICAL', 'https://www.consilium.europa.eu/en/policies/fight-against-terrorism/terrorist-list/', 0),

-- Listas de Criminales
('Interpol Red Notices', 'INTERPOL-RED', 'Interpol', 'CRIMINAL', 'GLOBAL', 
 'Personas buscadas internacionalmente para extradición o arresto', 
 'DAILY', true, 'HIGH', 'https://www.interpol.int/en/How-we-work/Notices/Red-Notices', 0),

('FBI Most Wanted', 'FBI-WANTED', 'Federal Bureau of Investigation', 'CRIMINAL', 'USA', 
 'Lista de personas más buscadas por el FBI', 
 'WEEKLY', true, 'HIGH', 'https://www.fbi.gov/wanted', 0),

-- Medios Adversos
('Adverse Media Global', 'ADVERSE-GLOBAL', 'Various Sources', 'ADVERSE_MEDIA', 'GLOBAL', 
 'Compilación de menciones negativas en medios de comunicación internacionales', 
 'DAILY', true, 'LOW', null, 0);

-- ============================================================================
-- 2. EJEMPLOS DE ENTRADAS EN LISTAS (Datos Ficticios para Testing)
-- ============================================================================

-- Entradas de ejemplo en OFAC-SDN (ficticio)
INSERT INTO watchlist_entry (watchlist_id, entity_type, name, aliases, document, date_of_birth, nationality, country, sanction_program, sanction_date, remarks, is_active) 
SELECT 
    id,
    'PERSON',
    'Juan Carlos Delgado',
    '["J.C. Delgado", "Juan C. Del Gado", "JC Delgado"]'::jsonb,
    '8-123-4567',
    '1975-03-15',
    'PA',
    'Panama',
    'Narcotic Trafficking Sanctions',
    '2020-06-10',
    'Designado por tráfico de narcóticos y lavado de activos',
    true
FROM watchlist WHERE code = 'OFAC-SDN';

INSERT INTO watchlist_entry (watchlist_id, entity_type, name, aliases, document, nationality, country, sanction_program, sanction_date, remarks, is_active)
SELECT 
    id,
    'COMPANY',
    'ACME Trading Corporation S.A.',
    '["ACME Trading", "ACME Corp", "ACME Trading SA"]'::jsonb,
    '123456-1-123456',
    null,
    'Panama',
    'Financial Fraud Sanctions',
    '2021-11-22',
    'Empresa utilizada para esquemas de fraude financiero internacional',
    true
FROM watchlist WHERE code = 'OFAC-SDN';

-- Entradas PEP Panamá (ficticio)
INSERT INTO watchlist_entry (watchlist_id, entity_type, name, document, date_of_birth, nationality, country, remarks, additional_info, is_active)
SELECT 
    id,
    'PERSON',
    'María Elena Rodríguez',
    '8-987-6543',
    '1980-07-20',
    'PA',
    'Panama',
    'Diputada de la Asamblea Nacional',
    '{"position": "Diputada", "institution": "Asamblea Nacional", "start_date": "2019-07-01"}'::jsonb,
    true
FROM watchlist WHERE code = 'PEP-PA';

INSERT INTO watchlist_entry (watchlist_id, entity_type, name, document, date_of_birth, nationality, country, remarks, additional_info, is_active)
SELECT 
    id,
    'PERSON',
    'Roberto Carlos Pérez',
    '8-111-2222',
    '1965-12-05',
    'PA',
    'Panama',
    'Director General de Contraloría',
    '{"position": "Director General", "institution": "Contraloría General", "start_date": "2018-01-15"}'::jsonb,
    true
FROM watchlist WHERE code = 'PEP-PA';

-- ============================================================================
-- 3. ACTUALIZAR TOTAL DE ENTRADAS
-- ============================================================================

UPDATE watchlist w
SET total_entries = (
    SELECT COUNT(*) 
    FROM watchlist_entry we 
    WHERE we.watchlist_id = w.id AND we.is_active = true
);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
