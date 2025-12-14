# 🔍 DEBUG BACKEND - Erreur contratId null

## Problème
L'erreur `not-null property references a null or transient value: com.pfa.service_sinistre.entity.Sinistre.contratId` 
survient même après avoir chargé le sinistre existant avec `findById()`.

## Causes possibles

### 1️⃣ Le sinistre en base n'a pas de contratId
Vérifier dans la base de données :
```sql
SELECT id, numero_sinistre, contrat_id, client_id, statut 
FROM sinistre 
WHERE id = 1;
```

Si `contrat_id` est NULL → Le sinistre a été créé sans contrat !

### 2️⃣ L'entité Sinistre a une relation @ManyToOne au lieu d'un Long
Votre entité ressemble probablement à ça (PROBLÉMATIQUE) :
```java
@Entity
public class Sinistre {
    @Id
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id", nullable = false)  // ← PROBLÈME ICI
    private Contrat contrat;  // ← Relation au lieu de Long contratId
    
    // Getters/Setters
}
```

Au lieu de (CORRECT) :
```java
@Entity
public class Sinistre {
    @Id
    private Long id;
    
    @Column(name = "contrat_id", nullable = false)
    private Long contratId;  // ← ID direct, pas de relation
    
    @Column(name = "client_id", nullable = false)
    private Long clientId;
    
    // Getters/Setters
}
```

### 3️⃣ Solution temporaire : Rendre contratId nullable
Dans `Sinistre.java` :
```java
@Column(name = "contrat_id", nullable = true)  // ← Changer de false à true
private Long contratId;
```

OU si c'est une relation :
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "contrat_id", nullable = true)  // ← Changer de false à true
private Contrat contrat;
```

## 🔧 Actions immédiates

1. **Vérifier l'entité Sinistre.java** - Cherchez ces lignes :
   ```
   @Column(name = "contrat_id"
   ```
   ou
   ```
   @JoinColumn(name = "contrat_id"
   ```

2. **Vérifier la base de données** :
   ```sql
   SELECT * FROM sinistre WHERE id = 1;
   ```

3. **Test rapide** - Ajouter un log dans le controller :
   ```java
   return sinistreRepository.findById(id)
       .map(sinistre -> {
           System.out.println("🔍 Sinistre chargé: " + sinistre);
           System.out.println("🔍 ContratId: " + sinistre.getContratId());
           System.out.println("🔍 ClientId: " + sinistre.getClientId());
           
           sinistre.setStatut(dto.getStatut());
           // ... reste du code
       })
   ```

## 📋 Partagez avec moi

Envoyez-moi :
1. Le code de votre classe **Sinistre.java** (l'entité complète)
2. Le résultat de `SELECT * FROM sinistre WHERE id = 1;`
3. Les logs du backend quand l'erreur 500 se produit

Cela me permettra de vous donner la solution exacte !
