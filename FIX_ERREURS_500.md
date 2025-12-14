# 🚨 Résolution Erreurs 500 - Base de Données

## ❌ ERREUR 1: Column contrat_id does not exist

### Diagnostic
```
ERROR: column s1_0.contrat_id does not exist
Position : 31
```

**Cause**: La table `sinistres` utilise probablement `contract_id` au lieu de `contrat_id`

### 💡 Solutions

#### Solution A: Renommer la colonne PostgreSQL (RECOMMANDÉ)
```sql
ALTER TABLE sinistres 
RENAME COLUMN contract_id TO contrat_id;
```

#### Solution B: Modifier l'entité JPA
Dans `Sinistre.java`:
```java
@Column(name = "contract_id", nullable = false)
private Long contratId;
```

---

## ❌ ERREUR 2: No enum constant TypeContrat.string

### Diagnostic
```
java.lang.IllegalArgumentException: No enum constant 
com.pfa.service_assurance.entity.TypeContrat.string
```

**Cause**: La base de données contient la valeur littérale `"string"` au lieu d'une valeur valide:
- AUTO
- HABITATION
- SANTE
- VIE

### 💡 Solutions

#### Solution A: Nettoyer la base de données (RECOMMANDÉ)
```sql
-- Voir les valeurs invalides
SELECT id, type FROM contrats 
WHERE type NOT IN ('AUTO', 'HABITATION', 'SANTE', 'VIE');

-- Corriger
UPDATE contrats 
SET type = 'AUTO' 
WHERE type = 'string' OR type NOT IN ('AUTO', 'HABITATION', 'SANTE', 'VIE');
```

#### Solution B: Créer un Converter JPA tolérant
Voir `FIX_BACKEND_ENTITIES.java` pour le code complet

---

## 🔧 Procédure de Correction

### Étape 1: Connexion à PostgreSQL
```bash
# Windows
psql -U postgres -d nom_de_votre_base

# Ou avec pgAdmin
```

### Étape 2: Vérifier la structure
```sql
-- Vérifier les colonnes de sinistres
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sinistres';

-- Résultat attendu doit inclure: contrat_id (pas contract_id)
```

### Étape 3: Exécuter les corrections
```sql
-- Copier-coller depuis FIX_DATABASE.sql
-- OU exécuter le fichier directement:
\i C:/Users/elabd/Desktop/FrontEnd/FIX_DATABASE.sql
```

### Étape 4: Vérifier les corrections
```sql
-- Vérifier que contrat_id existe
SELECT * FROM sinistres LIMIT 1;

-- Vérifier les types de contrats
SELECT DISTINCT type FROM contrats;
-- Doit retourner uniquement: AUTO, HABITATION, SANTE, VIE
```

### Étape 5: Redémarrer Spring Boot
```bash
# Arrêter le serveur
# Puis redémarrer
mvn spring-boot:run
```

---

## 🧪 Tests Post-Correction

### Test 1: API Contrats
```bash
curl http://localhost:8080/contracts
# Doit retourner un tableau JSON, pas une erreur 500
```

### Test 2: API Sinistres
```bash
curl http://localhost:8080/sinistres/health
# Doit retourner: "Service Sinistre is running"

curl http://localhost:8080/sinistres
# Doit retourner un tableau JSON
```

### Test 3: Frontend Health Check
1. Ouvrir `http://localhost:4200/admin/health`
2. Tous les services doivent être ✅ verts

---

## 📋 Checklist Complète

### Base de Données
- [ ] PostgreSQL démarré
- [ ] Connexion à la base réussie
- [ ] Colonne `contrat_id` existe dans table `sinistres`
- [ ] Toutes les valeurs de `type` dans `contrats` sont valides
- [ ] Contraintes CHECK ajoutées

### Backend
- [ ] Spring Boot redémarré après corrections DB
- [ ] Aucune exception au démarrage
- [ ] Logs ne montrent pas d'erreurs SQL
- [ ] Endpoints testés avec curl

### Frontend
- [ ] npm start en cours
- [ ] Page `/admin/health` affiche services verts
- [ ] Liste des contrats se charge
- [ ] Création de sinistre fonctionne

---

## 🔍 Diagnostics Avancés

### Vérifier les logs Hibernate
Dans `application.properties`:
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
```

Redémarrer et observer les requêtes SQL générées.

### Inspecter les tables
```sql
-- Structure complète de sinistres
\d sinistres

-- Structure complète de contrats
\d contrats

-- Compter les enregistrements
SELECT COUNT(*) FROM sinistres;
SELECT COUNT(*) FROM contrats;
```

### Recréer les tables (dernier recours)
⚠️ **ATTENTION: Supprime toutes les données!**
```sql
DROP TABLE IF EXISTS sinistres CASCADE;
DROP TABLE IF EXISTS contrats CASCADE;

-- Puis relancer Spring Boot avec:
spring.jpa.hibernate.ddl-auto=create
```

---

## 💾 Sauvegarde Avant Modifications

```bash
# Backup PostgreSQL
pg_dump -U postgres nom_base > backup_avant_fix.sql

# Restauration si problème
psql -U postgres nom_base < backup_avant_fix.sql
```

---

## 🆘 Si les Erreurs Persistent

### Erreur persiste après correction SQL
1. ✅ Vérifier que les commandes SQL ont réussi
2. ✅ Redémarrer PostgreSQL
3. ✅ Redémarrer Spring Boot
4. ✅ Vider le cache Hibernate: supprimer `target/` et recompiler

### Nouvelles erreurs apparaissent
1. ✅ Copier la stack trace complète
2. ✅ Chercher "Caused by:" dans les logs
3. ✅ Vérifier les foreign keys (client_id, contrat_id)
4. ✅ S'assurer que la table `users` existe

### Cannot connect to database
1. ✅ PostgreSQL est démarré?
2. ✅ `application.properties` a les bons paramètres?
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/nom_base
   spring.datasource.username=postgres
   spring.datasource.password=votre_password
   ```

---

## 📚 Fichiers de Référence

- `FIX_DATABASE.sql` - Scripts SQL de correction
- `FIX_BACKEND_ENTITIES.java` - Alternatives côté Java
- `GUIDE_PROBLEMES_API.md` - Guide général des problèmes API

---

## 🎯 Résumé Rapide

**Problème**: Erreurs 500 sur `/contracts` et `/sinistres`

**Cause**:
1. Nom de colonne incorrect: `contract_id` vs `contrat_id`
2. Valeurs invalides dans enum TypeContrat

**Solution**:
```sql
-- Dans PostgreSQL
ALTER TABLE sinistres RENAME COLUMN contract_id TO contrat_id;
UPDATE contrats SET type = 'AUTO' WHERE type = 'string';
```

Puis redémarrer Spring Boot et tester! 🚀
