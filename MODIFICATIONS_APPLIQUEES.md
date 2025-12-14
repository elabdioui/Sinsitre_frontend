# ✅ Modifications Appliquées - Synchronisation Backend Spring Boot

## 🎯 Objectif
Synchroniser le frontend Angular avec les contrôleurs Spring Boot pour les services Contrats et Sinistres, et résoudre l'erreur 500.

---

## 🔧 Modifications Effectuées

### 1. **Correction de l'URL de l'API** ⚠️ **CRITIQUE**
**Fichier**: `src/environments/environment.development.ts`
- ❌ **Avant**: `apiUrl: 'http://192.168.100.1:8080'`
- ✅ **Après**: `apiUrl: 'http://localhost:8080'`

**Impact**: C'était probablement la cause principale de l'erreur 500 - le frontend essayait de contacter une mauvaise adresse IP.

---

### 2. **SinistreService - Simplification et Amélioration**
**Fichier**: `src/app/core/services/sinistre.service.ts`

**Changements**:
- ✅ URL directe: `http://localhost:8080/sinistres`
- ✅ Suppression de la dépendance à `environment`
- ✅ Gestion d'erreur améliorée pour afficher les messages du backend
- ✅ Logs détaillés avec statut, body, et message

**Méthodes disponibles** (correspondant au backend):
```typescript
getAll()                    // GET /sinistres
getById(id)                 // GET /sinistres/{id}
getByClientId(clientId)     // GET /sinistres/client/{clientId}
getByContratId(contratId)   // GET /sinistres/contrat/{contratId}
create(dto)                 // POST /sinistres
updateStatut(id, dto)       // PUT /sinistres/{id}/statut
delete(id)                  // DELETE /sinistres/{id}
```

---

### 3. **Auth Interceptor - Headers RBAC**
**Fichier**: `src/app/core/interceptors/auth.interceptor.ts`

**Headers automatiquement ajoutés**:
- `Authorization: Bearer {token}`
- `X-User-Id: {userId}`
- `X-User-Role: {role}`

Ces headers sont requis par le backend pour le filtrage RBAC.

---

### 4. **CreateSinistreComponent - Logs de Débogage**
**Fichier**: `src/app/features/sinistres/create-sinistre/create-sinistre.component.ts`

**Logs ajoutés**:
```typescript
console.log('=== CRÉATION SINISTRE ===');
console.log('Données du formulaire:', this.sinistre);
console.log('User dans localStorage:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
```

**Gestion d'erreur améliorée**:
- Affiche le message exact du backend
- Logs détaillés: status, error body, message

---

### 5. **Backend Health Check Component** 🆕
**Fichier**: `src/app/features/admin/backend-health/backend-health.component.ts`

**Nouvelle page de diagnostic** accessible via `/admin/health`:
- ✅ Vérifie la connectivité de tous les services backend
- ✅ Affiche le temps de réponse
- ✅ Indique le statut (succès/erreur) avec code couleur
- ✅ Affiche les informations de connexion (token, userId, role)

**Services vérifiés**:
1. `GET /sinistres/health` - Health check endpoint
2. `GET /sinistres` - Liste des sinistres
3. `GET /contracts` - Liste des contrats
4. `GET /contracts/actifs` - Contrats actifs

---

### 6. **Navigation - Lien Health Check**
**Fichier**: `src/app/shared/components/navbar/navbar.component.html`

Ajout d'un lien 🏥 **Health** dans la navbar pour accéder rapidement au diagnostic.

---

### 7. **Documentation**
**Fichier**: `DEBUG_500_ERRORS.md`

Guide complet pour:
- Identifier les causes d'erreurs 500
- Vérifier la configuration CORS
- Tester les endpoints manuellement
- Débugger dans la console navigateur

---

## 🔍 Comment Diagnostiquer les Erreurs 500

### Option 1: Page Health Check
1. Connectez-vous à l'application
2. Cliquez sur **🏥 Health** dans la navbar
3. Observez l'état de chaque service
4. Les services en ❌ rouge indiquent le problème

### Option 2: Console du Navigateur
1. Appuyez sur **F12** pour ouvrir les outils développeur
2. Allez dans l'onglet **Console**
3. Reproduisez l'erreur
4. Cherchez les logs:
   ```
   === CRÉATION SINISTRE ===
   Données du formulaire: {...}
   ❌ ERREUR CRÉATION SINISTRE: {...}
   ```

### Option 3: Onglet Network
1. Ouvrez F12 > **Network**
2. Filtrez par **XHR/Fetch**
3. Reproduisez l'erreur
4. Cliquez sur la requête en rouge
5. Vérifiez:
   - **Request URL**: Doit être `http://localhost:8080/...`
   - **Request Headers**: Doit avoir Authorization, X-User-Id, X-User-Role
   - **Response**: Message d'erreur du backend

---

## 🎯 Checklist de Vérification

### Backend
- [ ] Spring Boot démarré sur le port 8080
- [ ] Service Auth accessible: `http://localhost:8080/auth`
- [ ] Service Contrats accessible: `http://localhost:8080/contracts`
- [ ] Service Sinistres accessible: `http://localhost:8080/sinistres`
- [ ] CORS configuré pour `http://localhost:4200`
- [ ] Base de données connectée

### Frontend
- [ ] URL de l'API = `http://localhost:8080` ✅
- [ ] Token présent dans localStorage
- [ ] User avec id et role dans localStorage
- [ ] Headers RBAC ajoutés automatiquement ✅
- [ ] Page Health accessible via `/admin/health` ✅

---

## 🚀 Prochaines Étapes

1. **Démarrer le backend**:
   ```bash
   # Dans le dossier backend
   mvn spring-boot:run
   # ou
   ./mvnw spring-boot:run
   ```

2. **Vérifier avec Health Check**:
   - Aller sur `http://localhost:4200/admin/health`
   - Tous les services doivent être ✅ verts

3. **Tester la création de sinistre**:
   - Aller sur `/sinistres/create`
   - Remplir le formulaire
   - Vérifier les logs dans la console (F12)

4. **Si erreur persiste**:
   - Copier les logs de la console
   - Vérifier les logs du backend Spring Boot
   - Chercher l'exception Java complète

---

## 📋 API Backend - Endpoints Disponibles

### Contrats
```
GET    /contracts              - Liste tous les contrats (filtré par rôle)
GET    /contracts/{id}         - Détails d'un contrat
GET    /contracts/client/{id}  - Contrats d'un client
GET    /contracts/actifs       - Contrats actifs uniquement
POST   /contracts/create       - Créer un contrat (GESTIONNAIRE/ADMIN)
PATCH  /contracts/{id}/cancel  - Annuler un contrat (GESTIONNAIRE/ADMIN)
```

### Sinistres
```
GET    /sinistres                 - Liste tous les sinistres (filtré par rôle)
GET    /sinistres/{id}            - Détails d'un sinistre
GET    /sinistres/client/{id}     - Sinistres d'un client
GET    /sinistres/contrat/{id}    - Sinistres d'un contrat
POST   /sinistres                 - Créer un sinistre
PUT    /sinistres/{id}/statut     - Modifier le statut (GESTIONNAIRE/ADMIN)
DELETE /sinistres/{id}            - Supprimer un sinistre
GET    /sinistres/health          - Health check
```

---

## 💡 Messages d'Erreur Courants

### "Impossible de contacter le serveur"
- ❌ Backend non démarré
- ❌ URL incorrecte dans environment.ts
- ✅ Vérifier que Spring Boot tourne sur localhost:8080

### "CORS error"
- ❌ Configuration CORS manquante dans Spring Boot
- ✅ Ajouter `@CrossOrigin` ou configurer WebMvcConfigurer

### "Token manquant ou invalide"
- ❌ Pas connecté ou token expiré
- ✅ Se reconnecter pour obtenir un nouveau token

### "Contrat introuvable"
- ❌ Le contratId n'existe pas
- ✅ Vérifier avec GET /contracts/{id}

### "Le contrat doit être actif"
- ❌ Le contrat a le statut CANCELED ou EXPIRED
- ✅ Utiliser uniquement les contrats avec statut ACTIVE

---

## 🎓 Comprendre le Flux RBAC

1. **CLIENT** connecté:
   - Voit uniquement SES contrats
   - Voit uniquement SES sinistres
   - Peut créer des sinistres sur SES contrats
   - Ne peut PAS modifier les statuts

2. **GESTIONNAIRE** connecté:
   - Voit TOUS les contrats
   - Voit TOUS les sinistres
   - Peut créer des contrats
   - Peut modifier les statuts de sinistres
   - Peut annuler des contrats

3. **ADMIN** connecté:
   - Accès complet
   - Toutes les permissions

Le backend filtre automatiquement selon les headers `X-User-Id` et `X-User-Role`.
