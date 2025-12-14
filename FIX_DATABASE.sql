-- ============================================
-- Script de Correction Base de Données
-- ============================================

-- PROBLÈME 1: Colonne contrat_id manquante dans la table sinistres
-- Erreur: "column s1_0.contrat_id does not exist"
-- Solution: Renommer contract_id en contrat_id OU ajuster l'entité JPA

-- Option A: Renommer la colonne dans PostgreSQL (RECOMMANDÉ)
ALTER TABLE sinistres 
RENAME COLUMN contract_id TO contrat_id;

-- Option B: Si la colonne s'appelle déjà contrat_id, vérifier qu'elle existe
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'sinistres';

-- ============================================
-- PROBLÈME 2: Valeur 'string' invalide dans TypeContrat
-- Erreur: "No enum constant com.pfa.service_assurance.entity.TypeContrat.string"
-- Solution: Remplacer toutes les valeurs 'string' par une valeur valide
-- ============================================

-- Vérifier les valeurs actuelles dans la table contrats
SELECT id, type FROM contrats WHERE type NOT IN ('AUTO', 'HABITATION', 'SANTE', 'VIE');

-- Corriger les valeurs invalides (remplacer 'string' par 'AUTO' par défaut)
UPDATE contrats 
SET type = 'AUTO' 
WHERE type = 'string' OR type NOT IN ('AUTO', 'HABITATION', 'SANTE', 'VIE');

-- ============================================
-- VÉRIFICATIONS POST-CORRECTION
-- ============================================

-- Vérifier la structure de la table sinistres
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sinistres'
ORDER BY ordinal_position;

-- Vérifier que tous les types de contrats sont valides
SELECT DISTINCT type, COUNT(*) as count
FROM contrats 
GROUP BY type;

-- Résultat attendu:
-- type        | count
-- ------------|------
-- AUTO        | X
-- HABITATION  | X
-- SANTE       | X
-- VIE         | X

-- ============================================
-- SCRIPTS DE CRÉATION SI TABLES MANQUANTES
-- ============================================

-- Table sinistres (si besoin de recréer)
/*
CREATE TABLE IF NOT EXISTS sinistres (
    id BIGSERIAL PRIMARY KEY,
    numero_sinistre VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    date_sinistre DATE NOT NULL,
    date_declaration TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_demande DECIMAL(10,2) NOT NULL,
    montant_approuve DECIMAL(10,2),
    statut VARCHAR(50) NOT NULL DEFAULT 'DECLARE',
    client_id BIGINT NOT NULL,
    contrat_id BIGINT NOT NULL,  -- Attention: contrat_id, pas contract_id
    gestionnaire_id BIGINT,
    CONSTRAINT fk_sinistre_client FOREIGN KEY (client_id) REFERENCES users(id),
    CONSTRAINT fk_sinistre_contrat FOREIGN KEY (contrat_id) REFERENCES contrats(id),
    CONSTRAINT fk_sinistre_gestionnaire FOREIGN KEY (gestionnaire_id) REFERENCES users(id),
    CONSTRAINT chk_statut CHECK (statut IN ('DECLARE', 'EN_COURS', 'VALIDE', 'REJETE', 'INDEMNISE'))
);
*/

-- Table contrats (si besoin de recréer)
/*
CREATE TABLE IF NOT EXISTS contrats (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,  -- Doit être AUTO, HABITATION, SANTE, ou VIE
    prime_annuelle DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    client_id BIGINT NOT NULL,
    CONSTRAINT fk_contrat_client FOREIGN KEY (client_id) REFERENCES users(id),
    CONSTRAINT chk_type CHECK (type IN ('AUTO', 'HABITATION', 'SANTE', 'VIE')),
    CONSTRAINT chk_statut_contrat CHECK (statut IN ('ACTIVE', 'CANCELED', 'EXPIRED'))
);
*/

-- ============================================
-- DONNÉES DE TEST (Optionnel)
-- ============================================

-- Insérer des contrats de test
/*
INSERT INTO contrats (numero, type, prime_annuelle, start_date, end_date, statut, client_id)
VALUES 
('CTR-TEST-0001', 'AUTO', 1200.00, '2025-01-01', '2026-01-01', 'ACTIVE', 1),
('CTR-TEST-0002', 'HABITATION', 800.00, '2025-01-01', '2026-01-01', 'ACTIVE', 1),
('CTR-TEST-0003', 'SANTE', 2500.00, '2025-01-01', '2026-01-01', 'ACTIVE', 2);
*/

-- Insérer des sinistres de test
/*
INSERT INTO sinistres (numero_sinistre, description, date_sinistre, montant_demande, statut, client_id, contrat_id)
VALUES 
('SIN-TEST-0001', 'Accident de voiture', '2025-12-01', 5000.00, 'DECLARE', 1, 1),
('SIN-TEST-0002', 'Dégât des eaux', '2025-12-05', 3000.00, 'EN_COURS', 1, 2);
*/
