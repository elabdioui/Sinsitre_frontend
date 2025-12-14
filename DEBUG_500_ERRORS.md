# 🔍 Guide de Diagnostic - Erreurs 500

## Causes Principales des Erreurs 500

### ✅ **CORRECTION APPLIQUÉE : URL de l'API**
- **Problème**: L'URL était configurée sur `http://192.168.100.1:8080`
- **Solution**: Changée en `http://localhost:8080`
- **Fichier**: `src/environments/environment.development.ts`

---

## 🔧 Points à Vérifier Côté Backend

### 1. **Serveur Backend Démarré?**
```bash
# Vérifier si le backend Spring Boot tourne sur le port 8080
curl http://localhost:8080/sinistres/health
# Devrait retourner: "Service Sinistre is running"
```

### 2. **CORS Configuré?**
Le backend doit autoriser les requêtes depuis `http://localhost:4200`

**Configuration CORS nécessaire dans Spring Boot:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:4200")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .exposedHeaders("Authorization", "X-User-Id", "X-User-Role")
                    .allowCredentials(true);
            }
        };
    }
}
```

### 3. **Base de Données Connectée?**
Vérifier que PostgreSQL/MySQL est démarré et accessible

### 4. **Headers RBAC Manquants?**
Le backend attend ces headers:
- `X-User-Id`: ID de l'utilisateur connecté
- `X-User-Role`: Rôle (CLIENT, GESTIONNAIRE, ADMIN)
- `Authorization`: Bearer token

**Ces headers sont maintenant automatiquement ajoutés par `auth.interceptor.ts`**

---

## 🔍 Comment Débugger dans le Navigateur

### Console Développeur (F12)
1. Ouvrir l'onglet **Network** (Réseau)
2. Filtrer par **XHR/Fetch**
3. Reproduire l'erreur
4. Cliquer sur la requête en échec
5. Vérifier:
   - **Request URL**: Doit être `http://localhost:8080/...`
   - **Request Headers**: Doit contenir Authorization, X-User-Id, X-User-Role
   - **Response**: Lire le message d'erreur exact

### Console (Logs)
Les erreurs affichent maintenant:
```
Erreur HTTP complète: {...}
Message d'erreur: [message du backend]
```

---

## 🐛 Erreurs Courantes et Solutions

### Erreur: "Contrat introuvable"
**Cause**: Le `contratId` fourni n'existe pas ou n'est pas actif
**Solution**: 
- Vérifier que le contrat existe: `GET http://localhost:8080/contracts/{id}`
- Vérifier que le statut est `ACTIVE` (pas `ACTIF`)

### Erreur: "Vous ne pouvez créer un sinistre que sur vos propres contrats"
**Cause**: Le `clientId` du contrat ne correspond pas à l'utilisateur connecté
**Solution**: 
- Le backend hérite automatiquement le `clientId` du contrat
- Ne pas envoyer `clientId` dans le DTO de création

### Erreur: "Le contrat doit être actif"
**Cause**: Le contrat a le statut `CANCELED` ou `EXPIRED`
**Solution**: Utiliser uniquement des contrats avec statut `ACTIVE`

### Erreur: "Seul un gestionnaire peut modifier le statut"
**Cause**: Un CLIENT essaie de changer le statut d'un sinistre
**Solution**: Seuls GESTIONNAIRE et ADMIN peuvent modifier les statuts

---

## 📋 Checklist de Vérification

- [ ] Backend Spring Boot démarré
- [ ] Port 8080 disponible
- [ ] CORS configuré pour localhost:4200
- [ ] Base de données connectée
- [ ] Service Auth accessible sur `http://localhost:8080/auth`
- [ ] Service Contrats accessible sur `http://localhost:8080/contracts`
- [ ] Service Sinistres accessible sur `http://localhost:8080/sinistres`
- [ ] Token JWT valide dans localStorage
- [ ] User avec id et role dans localStorage

---

## 🧪 Tests à Effectuer

### 1. Tester la Connexion Backend
```bash
# Test service Auth
curl http://localhost:8080/auth/users/1

# Test service Contrats
curl http://localhost:8080/contracts

# Test service Sinistres
curl http://localhost:8080/sinistres/health
```

### 2. Tester avec Token
```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
console.log('Token:', token);
console.log('User:', user);

// Tester une requête manuelle
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

## 🎯 Prochaines Étapes

1. **Démarrer tous les services backend**
   - Service Auth (port 8081 ou autre)
   - Service Contrats (port 8082 ou autre)
   - Service Sinistres (port 8083 ou autre)
   - API Gateway (port 8080)

2. **Vérifier les logs backend**
   - Rechercher les stack traces
   - Identifier les NullPointerException
   - Vérifier les erreurs de validation

3. **Tester les endpoints un par un**
   - Commencer par `/sinistres/health`
   - Puis `/sinistres` (GET)
   - Puis création d'un sinistre (POST)

4. **Vérifier la cohérence des données**
   - Nom des propriétés (statut vs status)
   - Format des dates
   - Valeurs des enums
