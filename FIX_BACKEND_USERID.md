# ⚠️ CORRECTION BACKEND URGENTE REQUISE

## ❌ PROBLÈME IDENTIFIÉ

Votre **AuthController** ne renvoie **PAS** le `userId` dans la réponse du login !

### Ce que votre backend renvoie actuellement :
```json
{
  "token": "eyJhbGci...",
  "username": "Haitham",
  "email": "haitham@example.com",
  "role": "CLIENT",
  "message": "Connexion réussie"
}
```

### Ce dont le frontend a besoin :
```json
{
  "token": "eyJhbGci...",
  "userId": 1,           ← ✅ MANQUANT !
  "username": "Haitham",
  "email": "haitham@example.com",  
  "role": "CLIENT",
  "message": "Connexion réussie"
}
```

---

## ✅ SOLUTION BACKEND

### Fichier : AuthController.java (Ligne ~51)

**AVANT :**
```java
AuthResponse response = AuthResponse.builder()
        .token(token)
        .username(user.getUsername())
        .email(user.getEmail())
        .role(user.getRole().name())
        .message("Connexion réussie")
        .build();
```

**APRÈS (ajouter .userId(...)) :**
```java
AuthResponse response = AuthResponse.builder()
        .token(token)
        .userId(user.getId())          // ✅ AJOUTER CETTE LIGNE
        .username(user.getUsername())
        .email(user.getEmail())
        .role(user.getRole().name())
        .message("Connexion réussie")
        .build();
```

### Fichier : AuthResponse.java

Vérifiez que votre DTO contient :
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;      // ✅ DOIT ÊTRE PRÉSENT
    private String username;
    private String email;
    private String role;
    private String message;
}
```

---

## 🔄 SOLUTION TEMPORAIRE FRONTEND (Déjà appliquée)

J'ai modifié le frontend pour récupérer `userId` via `/auth/me` si absent dans la réponse du login.

Mais c'est **moins efficace** (2 requêtes au lieu d'1).

---

## 🧪 COMMENT TESTER

### 1. Modifier le backend comme ci-dessus
### 2. Redémarrer le backend
### 3. Tester avec PowerShell :

```powershell
$body = '{"username":"Haitham","password":"Haitham1234"}'
$response = Invoke-WebRequest -Uri "http://localhost:8080/auth/login" -Method POST -ContentType "application/json" -Body $body
$response.Content | ConvertFrom-Json

# Résultat attendu :
# token    : eyJhbGci...
# userId   : 1              ← ✅ DOIT ÊTRE LÀ
# username : Haitham
# email    : haitham@...
# role     : CLIENT
```

### 4. Tester avec le frontend :

1. Allez sur http://localhost:4200
2. F12 → Console
3. Connectez-vous
4. Cherchez ce log :
```
✅ UserId stocké: 1
```

Si vous voyez ça, c'est bon ! ✅

---

## 📋 POURQUOI C'EST IMPORTANT

Vos controllers (ContratController, SinistreController) utilisent les headers :
- `X-User-Id`
- `X-User-Role`

Le frontend les envoie automatiquement (via auth.interceptor.ts).

**MAIS** il ne peut les envoyer que si `userId` est dans localStorage !

Et `userId` est stocké lors du login à partir de la réponse du backend.

**Sans userId → pas de RBAC → CLIENT verra rien ou tout !**

---

## ✅ CHECKLIST

- [ ] Modifier `AuthController.java` ligne 51
- [ ] Vérifier `AuthResponse.java` a le champ `userId`
- [ ] Redémarrer le backend
- [ ] Tester avec PowerShell (voir userId dans la réponse)
- [ ] Tester avec le frontend (console montre "UserId stocké")
- [ ] Vérifier RBAC : CLIENT voit ses contrats, GESTIONNAIRE voit tout

---

## 🚀 UNE FOIS CORRIGÉ

Le RBAC fonctionnera parfaitement :
- ✅ CLIENT voit uniquement ses contrats et sinistres
- ✅ GESTIONNAIRE voit tous les contrats et sinistres
- ✅ Headers X-User-Id et X-User-Role sont envoyés
- ✅ Backend filtre correctement les données
