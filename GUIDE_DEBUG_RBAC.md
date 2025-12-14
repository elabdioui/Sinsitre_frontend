# Guide de Débogage RBAC (Role-Based Access Control)

## 📋 Modifications Appliquées

### 1. Logs ajoutés dans `auth.service.ts`
- ✅ Log de la réponse complète du backend lors du login
- ✅ Log des données stockées dans localStorage (userId, userRole, email, username)
- ✅ Alerte si pas de token dans la réponse

### 2. Logs ajoutés dans `contracts-list.component.ts`
- ✅ Log de l'état utilisateur au chargement (userId, userRole, isClient)
- ✅ Log du nombre de contrats reçus
- ✅ Indication si c'est CLIENT ou GESTIONNAIRE/ADMIN qui charge

### 3. Logs ajoutés dans `sinistres-list.component.ts`
- ✅ Log de l'état utilisateur au chargement
- ✅ Log du nombre de sinistres reçus
- ✅ Indication du rôle détecté

### 4. Logs existants dans `auth.interceptor.ts`
- ✅ Log des données utilisateur (userId, userRole, hasToken)
- ✅ Log des headers ajoutés aux requêtes HTTP

---

## 🔍 Comment Déboguer

### Étape 1 : Ouvrir la Console du Navigateur (F12)
1. Ouvrez votre navigateur
2. Appuyez sur **F12** ou clic droit → "Inspecter"
3. Allez dans l'onglet **Console**

### Étape 2 : Tester le Login
1. Connectez-vous avec un compte CLIENT
2. Vérifiez les logs suivants dans la console :

```
🔑 AuthService - Réponse login: { token: "...", userId: 1, role: "CLIENT", email: "...", username: "..." }
💾 Données stockées: { userId: 1, userRole: "CLIENT", userEmail: "...", username: "..." }
```

**⚠️ Si vous voyez "❌ Pas de token dans la réponse" :**
→ Problème avec le backend - la réponse du /auth/login ne contient pas de token

### Étape 3 : Vérifier les Requêtes HTTP
Après le login, lors du chargement des contrats/sinistres, vous devriez voir :

```
🔐 Auth Interceptor - User: { userId: "1", userRole: "CLIENT", hasToken: true }
📤 Request headers: { Authorization: "Bearer ...", X-User-Id: "1", X-User-Role: "CLIENT" }
```

**⚠️ Si userId ou userRole est null :**
→ Les données n'ont pas été correctement stockées dans localStorage après le login

### Étape 4 : Vérifier le Chargement des Contrats
Quand vous accédez à la page des contrats, vous devriez voir :

```
📋 ContractsListComponent - État utilisateur: { userId: "1", userRole: "CLIENT", isClient: true }
🔒 CLIENT détecté - Chargement des contrats pour ID: 1
✅ Contrats client reçus: 5
```

**Pour GESTIONNAIRE/ADMIN :**
```
📋 ContractsListComponent - État utilisateur: { userId: "2", userRole: "GESTIONNAIRE", isClient: false }
🔓 GESTIONNAIRE/ADMIN détecté - Chargement de tous les contrats
✅ Tous les contrats reçus: 25
```

### Étape 5 : Vérifier le Chargement des Sinistres
Même logique que les contrats :

```
📋 SinistresListComponent - État utilisateur: { userId: "1", userRole: "CLIENT", isClient: true }
🔒 CLIENT détecté - Chargement des sinistres pour ID: 1
✅ Sinistres client reçus: 3
```

---

## ❌ Problèmes Courants et Solutions

### Problème 1 : "userId: null, userRole: null" dans l'interceptor
**Cause :** Les données ne sont pas stockées dans localStorage

**Solution :**
1. Vérifiez que la réponse du backend contient bien : `{ token, userId, role, email, username }`
2. Vérifiez qu'il n'y a pas d'erreur dans la console lors du login
3. Testez manuellement dans la console du navigateur :
```javascript
localStorage.getItem('userId')
localStorage.getItem('userRole')
localStorage.getItem('token')
```

### Problème 2 : CLIENT voit tous les contrats au lieu des siens
**Cause :** Le rôle n'est pas correctement détecté ou le backend ne filtre pas

**Solutions :**
1. Vérifiez que `isClient: true` dans les logs
2. Vérifiez que l'URL appelée est `/contracts/client/{id}` et non `/contracts`
3. Vérifiez que le backend reçoit bien les headers `X-User-Id` et `X-User-Role`
4. Testez l'endpoint backend directement avec Postman/curl

### Problème 3 : Erreur 403 Forbidden
**Cause :** Le backend refuse l'accès

**Solutions :**
1. Vérifiez que les headers `X-User-Id` et `X-User-Role` sont bien envoyés (voir logs interceptor)
2. Vérifiez la configuration Spring Security du backend
3. Vérifiez que le token JWT est valide (non expiré)
4. Testez avec un compte ADMIN pour voir si c'est un problème de rôle

### Problème 4 : Erreur 401 Unauthorized
**Cause :** Token invalide ou expiré

**Solutions :**
1. Déconnectez-vous et reconnectez-vous
2. Videz le localStorage :
```javascript
localStorage.clear()
```
3. Vérifiez la durée de validité du token JWT sur le backend

---

## 🧪 Tests à Effectuer

### Test 1 : CLIENT ne peut voir que ses données
1. ✅ Connectez-vous avec un compte CLIENT (ex: user1)
2. ✅ Allez sur la page des contrats → Vous devez voir UNIQUEMENT vos contrats
3. ✅ Allez sur la page des sinistres → Vous devez voir UNIQUEMENT vos sinistres
4. ✅ Vérifiez les logs : doit afficher "🔒 CLIENT détecté"

### Test 2 : GESTIONNAIRE peut voir toutes les données
1. ✅ Connectez-vous avec un compte GESTIONNAIRE
2. ✅ Allez sur la page des contrats → Vous devez voir TOUS les contrats
3. ✅ Allez sur la page des sinistres → Vous devez voir TOUS les sinistres
4. ✅ Vérifiez les logs : doit afficher "🔓 GESTIONNAIRE/ADMIN détecté"

### Test 3 : ADMIN peut voir toutes les données
1. ✅ Connectez-vous avec un compte ADMIN
2. ✅ Allez sur la page des contrats → Vous devez voir TOUS les contrats
3. ✅ Allez sur la page des sinistres → Vous devez voir TOUS les sinistres
4. ✅ Dashboard admin accessible
5. ✅ Vérifiez les logs : doit afficher "🔓 GESTIONNAIRE/ADMIN détecté"

---

## 📝 Checklist Vérification Backend

Pour que le RBAC fonctionne, le backend doit :

### Réponse du /auth/login
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "userId": 1,
  "role": "CLIENT",
  "email": "user@example.com",
  "username": "user1"
}
```

### Endpoints pour CLIENT
- `GET /contracts/client/{clientId}` - Retourne les contrats du client
- `GET /sinistres/client/{clientId}` - Retourne les sinistres du client

### Endpoints pour GESTIONNAIRE/ADMIN
- `GET /contracts` - Retourne tous les contrats
- `GET /sinistres` - Retourne tous les sinistres

### Headers attendus par le backend
Toutes les requêtes doivent avoir :
- `Authorization: Bearer {token}`
- `X-User-Id: {userId}`
- `X-User-Role: {role}`

### Configuration Spring Security
Le backend doit vérifier les headers `X-User-Role` et autoriser :
- CLIENT : accès uniquement à ses propres ressources
- GESTIONNAIRE/ADMIN : accès à toutes les ressources

---

## 🚀 Prochaines Étapes

1. **Testez le login** et vérifiez tous les logs dans la console
2. **Notez exactement** quel log ne s'affiche pas ou affiche des valeurs incorrectes
3. **Testez chaque rôle** (CLIENT, GESTIONNAIRE, ADMIN)
4. **Capturez les erreurs** de la console et/ou du network tab (F12 → Network)
5. **Partagez les logs** pour un débogage plus précis

---

## 📞 Support

Si le problème persiste après ces vérifications, fournissez :
1. Les logs de la console lors du login
2. Les logs lors du chargement des contrats/sinistres
3. Les erreurs dans l'onglet Network (F12)
4. Le rôle de l'utilisateur de test utilisé
5. Les endpoints backend utilisés
