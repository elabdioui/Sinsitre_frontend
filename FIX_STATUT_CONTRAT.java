// ============================================
// CORRECTION POUR SinistreController.java
// ============================================
// Problème : Backend vérifie "ACTIF" mais le contrat en base a "ACTIVE"

// Dans la méthode createSinistre, ligne ~100 :

// ❌ ANCIEN CODE :
if (!"ACTIF".equals(contrat.getStatut())) {
    return ResponseEntity.badRequest()
            .body("Le contrat doit être actif pour déclarer un sinistre");
}

// ✅ NOUVEAU CODE (accepter les deux valeurs) :
if (!"ACTIF".equals(contrat.getStatut()) && !"ACTIVE".equals(contrat.getStatut())) {
    return ResponseEntity.badRequest()
            .body("Le contrat doit être actif pour déclarer un sinistre (statut actuel: " + contrat.getStatut() + ")");
}

// OU MIEUX : Utiliser l'enum
if (contrat.getStatut() != StatutContrat.ACTIVE && contrat.getStatut() != StatutContrat.ACTIF) {
    return ResponseEntity.badRequest()
            .body("Le contrat doit être actif pour déclarer un sinistre");
}

// ============================================
// ALTERNATIVE : Corriger l'enum StatutContrat.java
// ============================================
public enum StatutContrat {
    ACTIVE,   // ← Utiliser ACTIVE partout (comme le frontend)
    CANCELED,
    EXPIRED
}

// Puis dans le controller :
if (contrat.getStatut() != StatutContrat.ACTIVE) {
    return ResponseEntity.badRequest()
            .body("Le contrat doit être actif pour déclarer un sinistre");
}
