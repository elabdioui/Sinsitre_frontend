# 🔧 Solution au Problème CORS

## ✅ Diagnostic Confirmé
- ✅ Backend fonctionne (teste avec PowerShell : Status 200)
- ❌ Angular ne peut pas accéder au backend depuis le navigateur
- 🚫 Message d'erreur : "Impossible de contacter le serveur. Problème CORS"

## 🎯 Solution : Ajouter la Configuration CORS au Backend

### Étape 1 : Créer CorsConfig.java dans votre Backend

**Chemin :** `src/main/java/com/pfa/config/CorsConfig.java`

```java
package com.pfa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Autoriser les requêtes depuis Angular
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));

        // ✅ Autoriser tous les headers
        config.setAllowedHeaders(Arrays.asList("*"));

        // ✅ Autoriser toutes les méthodes HTTP
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // ✅ Exposer les headers personnalisés RBAC
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-User-Id",
            "X-User-Role",
            "Content-Type"
        ));

        // ✅ Autoriser les credentials (important pour JWT)
        config.setAllowCredentials(true);

        // ✅ Cache des requêtes preflight
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
```

### Étape 2 : Vérifier Spring Security

Si vous utilisez Spring Security, ajoutez aussi ceci dans votre **SecurityConfig** :

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ✅ Activer CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // ✅ Désactiver CSRF (pour les API REST)
            .csrf(csrf -> csrf.disable())
            
            // Votre configuration existante...
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            );
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Étape 3 : Redémarrer le Backend

```bash
# Arrêtez votre backend Spring Boot
# Puis relancez-le
mvn spring-boot:run
```

### Étape 4 : Tester à Nouveau

1. Backend redémarré ✅
2. Angular tourne sur http://localhost:4200 ✅
3. Essayez de vous connecter avec :
   - Username: `Haitham`
   - Password: `Haitham1234`

Vous devriez maintenant voir dans la console :
```
🔐 Tentative de connexion avec: { username: "Haitham", passwordLength: 12 }
🔑 AuthService - Réponse login: { token: "...", userId: 1, role: "ADMIN", ... }
💾 Données stockées: { userId: 1, userRole: "ADMIN", ... }
✅ Connexion réussie
🚀 Redirection vers: /admin/dashboard
✅ Navigation réussie: true
```

## 🔍 Vérification

### Dans la Console du Navigateur (F12)
Avant correction CORS, vous voyiez :
```
Access to XMLHttpRequest at 'http://localhost:8080/auth/login' from origin 'http://localhost:4200' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

Après correction CORS, cette erreur disparaît !

### Dans l'onglet Network (F12)
- Requête `login` : **Status 200** ✅
- Response : Le JSON avec token, userId, role, etc.

## ⚠️ Problèmes Courants

### Le backend ne démarre pas après l'ajout
→ Vérifiez les imports Java (Spring Boot 3 vs 2 a des packages différents)

### L'erreur CORS persiste
→ Vérifiez que vous avez bien les DEUX configurations (CorsConfig ET SecurityConfig)

### Erreur "Cannot resolve symbol CorsConfiguration"
→ Ajoutez la dépendance dans `pom.xml` :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 📝 Checklist

- [ ] Créer `CorsConfig.java` dans le backend
- [ ] Modifier `SecurityConfig.java` si Spring Security est utilisé
- [ ] Redémarrer le backend Spring Boot
- [ ] Tester le login depuis Angular
- [ ] Vérifier les logs de la console (F12)
- [ ] Confirmer que vous voyez "✅ Connexion réussie"

---

## 🆘 Si ça ne marche toujours pas

Partagez-moi :
1. La version de Spring Boot (2.x ou 3.x)
2. Le contenu de votre SecurityConfig actuel
3. Les logs du backend au démarrage
4. Les logs de la console Angular (F12) lors du login
