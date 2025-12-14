// ============================================
// CORRECTION POUR SinistreController.java
// ============================================
//
// Le problème actuel : L'endpoint updateStatut essaie de créer un nouveau
// Sinistre à partir du DTO incomplet au lieu de modifier le sinistre existant.
//
// SOLUTION : Charger le sinistre existant, modifier uniquement statut et montant,
// puis sauvegarder.

package com.pfa.service_sinistre.controller;

import com.pfa.service_sinistre.dto.UpdateStatutDTO;
import com.pfa.service_sinistre.entity.Sinistre;
import com.pfa.service_sinistre.repository.SinistreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sinistres")
public class SinistreController {

    @Autowired
    private SinistreRepository sinistreRepository;

    // ✅ MÉTHODE CORRIGÉE - Mise à jour du statut
    @PutMapping("/{id}/statut")
    public ResponseEntity<Sinistre> updateStatut(
            @PathVariable Long id,
            @RequestBody UpdateStatutDTO dto) {

        // 1. Charger le sinistre existant depuis la base de données
        Sinistre sinistre = sinistreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sinistre non trouvé avec l'ID: " + id));

        // 2. Modifier UNIQUEMENT le statut et montantApprouve
        sinistre.setStatut(dto.getStatut());

        if (dto.getMontantApprouve() != null) {
            sinistre.setMontantApprouve(dto.getMontantApprouve());
        }

        // 3. Sauvegarder (tous les autres champs restent inchangés car on a chargé l'entité existante)
        Sinistre updated = sinistreRepository.save(sinistre);

        return ResponseEntity.ok(updated);
    }

    // ... autres méthodes ...
}

// ============================================
// UpdateStatutDTO.java
// ============================================
package com.pfa.service_sinistre.dto;

import com.pfa.service_sinistre.entity.StatutSinistre;

public class UpdateStatutDTO {
    private StatutSinistre statut;
    private Double montantApprouve;

    // Getters et Setters
    public StatutSinistre getStatut() {
        return statut;
    }

    public void setStatut(StatutSinistre statut) {
        this.statut = statut;
    }

    public Double getMontantApprouve() {
        return montantApprouve;
    }

    public void setMontantApprouve(Double montantApprouve) {
        this.montantApprouve = montantApprouve;
    }
}

// ============================================
// EXPLICATION DU PROBLÈME
// ============================================
//
// ❌ ANCIEN CODE (PROBLÉMATIQUE):
// @PutMapping("/{id}/statut")
// public Sinistre updateStatut(@PathVariable Long id, @RequestBody UpdateStatutDTO dto) {
//     Sinistre sinistre = new Sinistre(); // ← PROBLÈME: nouveau sinistre vide
//     sinistre.setStatut(dto.getStatut());
//     sinistre.setMontantApprouve(dto.getMontantApprouve());
//     // contratId est null ← ERREUR
//     return sinistreRepository.save(sinistre);
// }
//
// ✅ NOUVEAU CODE (CORRECT):
// @PutMapping("/{id}/statut")
// public Sinistre updateStatut(@PathVariable Long id, @RequestBody UpdateStatutDTO dto) {
//     Sinistre sinistre = sinistreRepository.findById(id).orElseThrow(...);
//     // ← Sinistre existant chargé avec TOUS ses champs (contratId, clientId, etc.)
//     sinistre.setStatut(dto.getStatut()); // Modifier uniquement le statut
//     if (dto.getMontantApprouve() != null) {
//         sinistre.setMontantApprouve(dto.getMontantApprouve());
//     }
//     return sinistreRepository.save(sinistre); // Tous les champs sont présents
// }
//
// ============================================
// INSTRUCTIONS
// ============================================
// 1. Ouvrez votre SinistreController.java dans le backend
// 2. Localisez la méthode updateStatut
// 3. Remplacez-la par le code corrigé ci-dessus
// 4. Redémarrez le backend
// 5. Testez à nouveau depuis le frontend
//
