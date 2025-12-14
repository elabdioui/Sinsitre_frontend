# ✅ RBAC Implémenté - Guide de Test

## 🎯 Fonctionnalité Implémentée

Le système de contrôle d'accès basé sur les rôles (RBAC) est maintenant **entièrement fonctionnel** :

### Règles d'Accès

| Rôle | Contrats | Sinistres | Dashboard |
|------|----------|-----------|-----------|
| **CLIENT** | ✅ Uniquement ses contrats | ✅ Uniquement ses sinistres | ❌ Non accessible |
| **GESTIONNAIRE** | ✅ Tous les contrats | ✅ Tous les sinistres | ✅ Accessible |
| **ADMIN** | ✅ Tous les contrats | ✅ Tous les sinistres | ✅ Accessible |

---

## 🔍 Comment Vérifier que ça Fonctionne

### Étape 1 : Préparer les Comptes de Test

Dans votre base de données backend, assurez-vous d'avoir :

1. **Un compte CLIENT** (ex: `Haitham` avec role `CLIENT`)
   - Doit avoir quelques contrats et sinistres associés à son ID

2. **Un compte GESTIONNAIRE** (ex: `manager` avec role `GESTIONNAIRE`)
   - Doit pouvoir voir TOUS les contrats et sinistres

3. **Un compte ADMIN** (ex: `admin` avec role `ADMIN`)
   - Accès complet

---

### Étape 2 : Test avec CLIENT

1. **Connexion**
   - Allez sur http://localhost:4200
   - Connectez-vous avec le compte CLIENT

2. **Console du Navigateur (F12)**
   - Ouvrez la console avant de naviguer
   - Vous devriez voir à la connexion :
   ```
   ✅ Connexion réussie: { userId: X, role: "CLIENT", ... }
   🚀 Redirection vers: /admin/contracts
   ```

3. **Page Contrats** (`/admin/contracts`)
   - Dans la console :
   ```
   📋 ContractsListComponent - État utilisateur: {
     userId: "1",
     userRole: "CLIENT",
     isClient: true
   }
   🔒 CLIENT détecté - Chargement des contrats pour ID: 1
   ✅ Contrats client reçus: 3
   ```
   - **Vérification** : Vous voyez uniquement VOS contrats (ceux avec votre clientId)

4. **Page Sinistres** (`/admin/sinistres`)
   - Dans la console :
   ```
   📋 SinistresListComponent - État utilisateur: {
     userId: "1",
     userRole: "CLIENT",
     isClient: true
   }
   🔒 CLIENT détecté - Chargement des sinistres pour ID: 1
   ✅ Sinistres client reçus: 2
   ```
   - **Vérification** : Vous voyez uniquement VOS sinistres

5. **Page Health** (`/admin/health`)
   - Vous voyez :
     - **Nom** : Haitham (ou votre username)
     - **Rôle** : CLIENT (badge bleu)
     - **Email** : votre email

6. **Onglet Network (F12)**
   - Requête vers `/contracts` → **NON envoyée** (car CLIENT)
   - Requête vers `/contracts/client/1` → **200 OK** ✅
   - Requête vers `/sinistres/client/1` → **200 OK** ✅

---

### Étape 3 : Test avec GESTIONNAIRE

1. **Déconnexion**
   - Cliquez sur "Déconnexion" dans la navbar

2. **Connexion GESTIONNAIRE**
   - Connectez-vous avec le compte GESTIONNAIRE

3. **Page Contrats**
   - Dans la console :
   ```
   📋 ContractsListComponent - État utilisateur: {
     userId: "2",
     userRole: "GESTIONNAIRE",
     isClient: false
   }
   🔓 GESTIONNAIRE/ADMIN détecté - Chargement de tous les contrats
   ✅ Tous les contrats reçus: 25
   ```
   - **Vérification** : Vous voyez TOUS les contrats de TOUS les clients

4. **Page Sinistres**
   - Dans la console :
   ```
   📋 SinistresListComponent - État utilisateur: {
     userId: "2",
     userRole: "GESTIONNAIRE",
     isClient: false
   }
   🔓 GESTIONNAIRE/ADMIN détecté - Chargement de tous les sinistres
   ✅ Tous les sinistres reçus: 50
   ```
   - **Vérification** : Vous voyez TOUS les sinistres

5. **Page Dashboard** (`/admin/dashboard`)
   - ✅ Accessible (car GESTIONNAIRE)
   - Vous pouvez créer des contrats pour n'importe quel client

6. **Page Health**
   - **Rôle** : GESTIONNAIRE (badge orange)

7. **Onglet Network (F12)**
   - Requête vers `/contracts` → **200 OK** ✅ (tous les contrats)
   - Requête vers `/sinistres` → **200 OK** ✅ (tous les sinistres)

---

## 🔧 Endpoints Backend Utilisés

### Pour CLIENT (userId = 1)
```
GET http://localhost:8080/contracts/client/1
GET http://localhost:8080/sinistres/client/1
```

### Pour GESTIONNAIRE/ADMIN
```
GET http://localhost:8080/contracts
GET http://localhost:8080/sinistres
```

---

## ❌ Problèmes Possibles et Solutions

### Problème 1 : CLIENT voit tous les contrats
**Symptôme** : Dans la console vous voyez `isClient: false` alors que vous êtes CLIENT

**Cause** : Le rôle n'est pas correctement stocké dans localStorage

**Solution** :
1. Ouvrez la console (F12)
2. Tapez : `localStorage.getItem('userRole')`
3. Ça doit afficher `"CLIENT"` (avec les guillemets)
4. Si c'est autre chose, reconnectez-vous

### Problème 2 : Erreur 404 sur /contracts/client/1
**Symptôme** : Dans Network, vous voyez une erreur 404

**Cause** : Le backend n'a pas l'endpoint `/contracts/client/{id}`

**Solution Backend** : Ajoutez dans votre `ContractController` :
```java
@GetMapping("/client/{clientId}")
public ResponseEntity<List<Contract>> getContractsByClient(@PathVariable Long clientId) {
    List<Contract> contracts = contractService.findByClientId(clientId);
    return ResponseEntity.ok(contracts);
}
```

### Problème 3 : Les logs n'apparaissent pas
**Symptôme** : Pas de logs dans la console

**Cause** : Le serveur Angular n'est pas à jour

**Solution** :
```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
ng serve
```

---

## 📝 Checklist de Vérification

### Backend
- [ ] Endpoint `GET /contracts/client/{id}` existe
- [ ] Endpoint `GET /sinistres/client/{id}` existe
- [ ] Le backend renvoie le bon `role` dans la réponse du `/auth/login`
- [ ] Les données de test existent (contrats et sinistres pour différents clients)

### Frontend
- [ ] Le serveur Angular tourne sur http://localhost:4200
- [ ] La console (F12) est ouverte pour voir les logs
- [ ] localStorage contient : `token`, `userId`, `userRole`, `userEmail`, `username`

### Test CLIENT
- [ ] Login réussi
- [ ] Page Contrats : affiche uniquement ses contrats
- [ ] Page Sinistres : affiche uniquement ses sinistres
- [ ] Console : affiche "🔒 CLIENT détecté"
- [ ] Network : requête vers `/contracts/client/{id}` (pas `/contracts`)

### Test GESTIONNAIRE
- [ ] Login réussi
- [ ] Page Contrats : affiche TOUS les contrats
- [ ] Page Sinistres : affiche TOUS les sinistres
- [ ] Console : affiche "🔓 GESTIONNAIRE/ADMIN détecté"
- [ ] Network : requête vers `/contracts` (pas `/contracts/client/{id}`)
- [ ] Dashboard accessible

---

## 🚀 Commandes Utiles

### Vérifier le localStorage dans la Console
```javascript
// Voir tout ce qui est stocké
console.table({
  token: localStorage.getItem('token') ? '✅ Présent' : '❌ Absent',
  userId: localStorage.getItem('userId'),
  userRole: localStorage.getItem('userRole'),
  userEmail: localStorage.getItem('userEmail'),
  username: localStorage.getItem('username')
});

// Nettoyer le localStorage (se déconnecter complètement)
localStorage.clear();
```

### Tester les Endpoints Backend Manuellement
```bash
# Test CLIENT (remplacer {clientId} et {token})
curl -H "Authorization: Bearer {token}" http://localhost:8080/contracts/client/1

# Test GESTIONNAIRE (remplacer {token})
curl -H "Authorization: Bearer {token}" http://localhost:8080/contracts
```

---

## ✅ Résultat Attendu

Quand tout fonctionne correctement :

**CLIENT connecté :**
- ✅ Voit 3 contrats (les siens) au lieu de 25 (tous)
- ✅ Voit 2 sinistres (les siens) au lieu de 50 (tous)
- ✅ Console affiche "🔒 CLIENT détecté"

**GESTIONNAIRE connecté :**
- ✅ Voit 25 contrats (tous)
- ✅ Voit 50 sinistres (tous)
- ✅ Console affiche "🔓 GESTIONNAIRE/ADMIN détecté"
- ✅ Peut accéder au Dashboard

---

## 📞 Si Ça Ne Marche Pas

Partagez-moi :
1. **Les logs de la console** (F12 → Console) quand vous allez sur Contrats
2. **Les requêtes Network** (F12 → Network) : quelle URL est appelée ?
3. **Le rôle de l'utilisateur** : `localStorage.getItem('userRole')`
4. **Le résultat** : combien de contrats voyez-vous en tant que CLIENT vs GESTIONNAIRE ?
