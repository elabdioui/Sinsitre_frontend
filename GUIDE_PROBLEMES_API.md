# 🔧 Guide de Résolution - Problèmes d'Accès API

## ✅ Corrections Appliquées

### 1. **URLs des Services Corrigées**
Tous les services utilisent maintenant des URLs directes au lieu de `environment`:

```typescript
// ✅ AVANT (problématique)
private apiUrl = `${environment.apiUrl}${environment.endpoints.auth}`;

// ✅ APRÈS (corrigé)
private apiUrl = 'http://localhost:8080/auth';
```

**Services mis à jour:**
- ✅ `core/services/auth.service.ts`
- ✅ `core/services/contract.service.ts`
- ✅ `core/services/sinistre.service.ts`

---

## 🚨 Problèmes Identifiés

### Problème 1: Erreur CORS
**Symptôme**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Causes**:
- Backend n'autorise pas les requêtes depuis `http://localhost:4200`
- Headers personnalisés (`X-User-Id`, `X-User-Role`) non autorisés
- Méthode HTTP (PUT, PATCH, DELETE) non autorisée

**Solutions**:

#### Option A: Configuration CORS Backend (RECOMMANDÉ)
Ajouter ce fichier dans votre backend Spring Boot:

```java
// src/main/java/com/pfa/config/CorsConfig.java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        config.setExposedHeaders(Arrays.asList(
            "Authorization", "X-User-Id", "X-User-Role"
        ));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

📄 **Fichier de configuration créé**: `BACKEND_CORS_CONFIG.java`

#### Option B: Proxy Angular (Alternative)
Un fichier `proxy.conf.json` a été créé pour contourner CORS en développement:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

**Pour utiliser le proxy:**
```bash
npm start  # Démarre avec proxy
# ou
npm run start:no-proxy  # Démarre sans proxy
```

**Avec proxy, changez les URLs des services:**
```typescript
// Au lieu de
private apiUrl = 'http://localhost:8080/auth';

// Utilisez
private apiUrl = '/api/auth';
```

---

### Problème 2: Backend Non Démarré
**Symptôme**: `ERR_CONNECTION_REFUSED` ou status code 0

**Vérification:**
```bash
# Tester si le backend répond
curl http://localhost:8080/sinistres/health

# Devrait retourner
"Service Sinistre is running"
```

**Solution:**
```bash
# Dans le dossier backend Spring Boot
mvn spring-boot:run
# ou
./mvnw spring-boot:run
```

---

### Problème 3: Port 8080 Déjà Utilisé
**Symptôme**: Backend ne démarre pas, erreur "Port 8080 already in use"

**Vérification:**
```powershell
# Windows
netstat -ano | findstr :8080

# Tuer le processus
taskkill /PID <PID> /F
```

**Solution alternative:**
Changer le port dans `application.properties`:
```properties
server.port=8081
```

Puis mettre à jour les URLs dans le frontend.

---

### Problème 4: Headers RBAC Manquants
**Symptôme**: Backend retourne 403 ou erreurs de permission

**Vérification dans la console (F12):**
```javascript
// Dans Console
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
// Doit afficher: { id: ..., role: ... }

const token = localStorage.getItem('token');
console.log('Token:', token ? 'Présent' : 'Absent');
```

**Solution:**
Se reconnecter pour obtenir un token valide et des données utilisateur complètes.

---

### Problème 5: Token Expiré
**Symptôme**: Erreur 401 Unauthorized

**Solution:**
```javascript
// Dans Console
localStorage.removeItem('token');
localStorage.removeItem('user');
// Puis se reconnecter
```

---

## 🔍 Outils de Diagnostic

### 1. Page Health Check
Accédez à `http://localhost:4200/admin/health` après connexion

**Interprétation:**
- ✅ Vert: Service accessible
- ❌ Rouge: Problème de connexion
- ⚠️ Orange: En cours de vérification

**Codes d'erreur courants:**
- **Status 0**: Backend non accessible (CORS ou serveur éteint)
- **Status 401**: Token manquant ou invalide
- **Status 403**: Droits insuffisants
- **Status 404**: Endpoint inexistant
- **Status 500**: Erreur serveur backend

### 2. Console Navigateur (F12)
```javascript
// Vérifier les requêtes
// Onglet Network → Filtrer par XHR/Fetch

// Cliquer sur une requête en erreur
// Vérifier:
// - Request URL
// - Request Headers (Authorization, X-User-Id, X-User-Role)
// - Response
```

### 3. Logs Détaillés
Les logs sont maintenant activés dans:
- `create-sinistre.component.ts`: Lors de création
- `sinistre.service.ts`: Toutes les opérations
- `auth.interceptor.ts`: Erreurs 401/403

---

## 📋 Checklist de Vérification

### Backend
- [ ] Spring Boot démarré sur port 8080
- [ ] Configuration CORS ajoutée
- [ ] Base de données accessible
- [ ] Endpoints testés avec curl/Postman
- [ ] Logs backend vérifiés

### Frontend
- [ ] npm install exécuté
- [ ] ng serve en cours
- [ ] LocalStorage contient token et user
- [ ] Console sans erreurs rouges
- [ ] Page Health affiche services en vert

### Réseau
- [ ] Pare-feu autorise port 8080
- [ ] Antivirus n'interdit pas les connexions
- [ ] Localhost résout correctement (127.0.0.1)

---

## 🚀 Commandes de Test

### Test Backend Direct
```bash
# Health check
curl http://localhost:8080/sinistres/health

# Liste sinistres (avec token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-User-Id: 1" \
     -H "X-User-Role: CLIENT" \
     http://localhost:8080/sinistres

# Liste contrats actifs
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-User-Id: 1" \
     -H "X-User-Role: CLIENT" \
     http://localhost:8080/contracts/actifs
```

### Test depuis Console Navigateur
```javascript
// Dans F12 → Console
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

fetch('http://localhost:8080/sinistres', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': user.id.toString(),
    'X-User-Role': user.role
  }
})
.then(r => r.json())
.then(data => console.log('Sinistres:', data))
.catch(err => console.error('Erreur:', err));
```

---

## 🎯 Ordre de Résolution Recommandé

1. **Vérifier que le backend tourne**
   ```bash
   curl http://localhost:8080/sinistres/health
   ```

2. **Ajouter la configuration CORS au backend**
   - Copier `BACKEND_CORS_CONFIG.java` dans votre backend
   - Redémarrer Spring Boot

3. **Vérifier la connexion frontend**
   - Aller sur `/admin/health`
   - Tous les services doivent être ✅

4. **Se connecter à l'application**
   - Vérifier que token et user sont stockés

5. **Tester la création de sinistre**
   - Ouvrir F12 → Console
   - Remplir le formulaire
   - Vérifier les logs détaillés

6. **Si problème persiste**
   - Copier l'erreur complète de la console
   - Vérifier les logs Spring Boot
   - Chercher la stack trace Java

---

## 💡 Astuces

### Désactiver temporairement l'auth
Pour tester sans authentication:
```typescript
// Dans auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Commentez tout le contenu
  return next(req); // Passer la requête sans modification
};
```

### Tester avec Postman
1. Importer les endpoints
2. Ajouter les headers:
   - `Authorization: Bearer <token>`
   - `X-User-Id: 1`
   - `X-User-Role: CLIENT`
3. Tester chaque endpoint

### Activer les logs détaillés Spring Boot
```properties
# application.properties
logging.level.org.springframework.web=DEBUG
logging.level.com.pfa=DEBUG
```

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. **Copier les informations suivantes:**
   - Erreur complète de la console (F12)
   - Logs Spring Boot
   - Résultat de la page `/admin/health`
   - Version Angular: `ng version`
   - Version Spring Boot

2. **Vérifier:**
   - Backend démarre sans erreur
   - Aucune exception dans les logs
   - CORS configuré correctement

3. **Tester en isolation:**
   - Backend seul avec curl
   - Frontend seul avec mock data
   - Puis combiner les deux
