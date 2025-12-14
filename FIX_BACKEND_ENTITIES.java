// ============================================
// Option 1: Modifier l'entité JPA Sinistre
// ============================================
// Si vous ne voulez PAS modifier la base de données,
// ajustez l'entité Java pour utiliser contract_id

package com.pfa.service_sinistre.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sinistres")
public class Sinistre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_sinistre", unique = true)
    private String numeroSinistre;

    @Column(nullable = false)
    private String description;

    @Column(name = "date_sinistre", nullable = false)
    private LocalDate dateSinistre;

    @Column(name = "date_declaration")
    private LocalDateTime dateDeclaration;

    @Column(name = "montant_demande", nullable = false)
    private Double montantDemande;

    @Column(name = "montant_approuve")
    private Double montantApprouve;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutSinistre statut;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    // ⚠️ CORRECTION: Utilisez @Column pour mapper correctement
    // Si la colonne s'appelle "contract_id" dans la DB:
    @Column(name = "contract_id", nullable = false)
    private Long contratId;

    // OU si la colonne s'appelle "contrat_id" dans la DB:
    // @Column(name = "contrat_id", nullable = false)
    // private Long contratId;

    @Column(name = "gestionnaire_id")
    private Long gestionnaireId;

    // Champs enrichis (non persistés)
    @Transient
    private String clientNom;

    @Transient
    private String clientEmail;

    // Getters et Setters
    // ... (tous les getters/setters)
}

// ============================================
// Option 2: Modifier l'entité JPA Contrat
// ============================================
// Ajouter une conversion pour gérer les valeurs invalides

package com.pfa.service_assurance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "contrats")
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    // ⚠️ CORRECTION: Ajouter un converter pour gérer les valeurs invalides
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeContrat type;

    @Column(name = "prime_annuelle")
    private Double primeAnnuelle;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Enumerated(EnumType.STRING)
    private StatutContrat statut;

    @Column(name = "client_id")
    private Long clientId;

    // Champs enrichis
    @Transient
    private String clientNom;

    @Transient
    private String clientEmail;

    // Getters et Setters
    // ... (tous les getters/setters)

    // ⚠️ PROTECTION: Setter qui filtre les valeurs invalides
    public void setType(TypeContrat type) {
        this.type = (type != null) ? type : TypeContrat.AUTO;
    }
}

// ============================================
// Option 3: Créer un Converter JPA personnalisé
// ============================================

package com.pfa.service_assurance.converter;

import com.pfa.service_assurance.entity.TypeContrat;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class TypeContratConverter implements AttributeConverter<TypeContrat, String> {

    private static final Logger logger = LoggerFactory.getLogger(TypeContratConverter.class);

    @Override
    public String convertToDatabaseColumn(TypeContrat attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public TypeContrat convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return TypeContrat.AUTO; // Valeur par défaut
        }

        try {
            return TypeContrat.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Valeur invalide pour TypeContrat: '{}'. Utilisation de AUTO par défaut.", dbData);
            return TypeContrat.AUTO; // Valeur par défaut pour les valeurs invalides
        }
    }
}

// Puis dans l'entité Contrat, utilisez:
// @Convert(converter = TypeContratConverter.class)
// @Column(nullable = false)
// private TypeContrat type;

// ============================================
// Configuration Hibernate pour ignorer les erreurs
// ============================================

// Dans application.properties ou application.yml:

// Option 1: Faire en sorte qu'Hibernate mette à jour automatiquement le schéma
spring.jpa.hibernate.ddl-auto=update

// Option 2: Désactiver la validation stricte (NON RECOMMANDÉ en production)
spring.jpa.properties.hibernate.validator.apply_to_ddl=false

// Option 3: Afficher les requêtes SQL pour débugger
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

// ============================================
// Script Liquibase/Flyway pour migration
// ============================================

// Si vous utilisez Flyway, créez: db/migration/V2__fix_column_names.sql

/*
-- Renommer contract_id en contrat_id
ALTER TABLE sinistres 
RENAME COLUMN contract_id TO contrat_id;

-- Corriger les valeurs invalides de type
UPDATE contrats 
SET type = 'AUTO' 
WHERE type NOT IN ('AUTO', 'HABITATION', 'SANTE', 'VIE');

-- Ajouter une contrainte pour éviter les valeurs invalides
ALTER TABLE contrats
ADD CONSTRAINT chk_type_valide 
CHECK (type IN ('AUTO', 'HABITATION', 'SANTE', 'VIE'));
*/
