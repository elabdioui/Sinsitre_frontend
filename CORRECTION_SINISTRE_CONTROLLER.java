// ============================================
// CORRECTION POUR SinistreController.java
// (Le ContratController est déjà correct !)
// ============================================

package com.pfa.service_sinistre.controller;

import com.pfa.service_sinistre.dto.ClientDTO;
import com.pfa.service_sinistre.dto.ContratDTO;
import com.pfa.service_sinistre.dto.UpdateStatutDTO;
import com.pfa.service_sinistre.entity.Sinistre;
import com.pfa.service_sinistre.entity.StatutSinistre;
import com.pfa.service_sinistre.repository.SinistreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sinistres")
public class SinistreController {

    @Autowired
    private SinistreRepository sinistreRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_GATEWAY = "http://localhost:8080";
    private static final String SERVICE_AUTH_URL = API_GATEWAY + "/auth/users/";
    private static final String SERVICE_CONTRAT_URL = API_GATEWAY + "/contracts/";

    // ✅ POST créer un sinistre (avec validation complète)
    @PostMapping
    public ResponseEntity<?> createSinistre(
            @RequestBody Sinistre sinistre,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        // 1. Vérifier que le contrat existe
        ContratDTO contrat = getContratById(sinistre.getContratId());
        if (contrat == null) {
            return ResponseEntity.badRequest()
                    .body("Contrat introuvable avec l'ID : " + sinistre.getContratId());
        }

        // 2. ✅ CORRECTION : Vérifier que le contrat est ACTIVE (pas "ACTIF")
        if (!"ACTIVE".equals(contrat.getStatut())) {
            return ResponseEntity.badRequest()
                    .body("Le contrat doit être actif pour déclarer un sinistre (statut actuel: " + contrat.getStatut() + ")");
        }

        // 3. SÉCURITÉ : Hériter automatiquement le clientId du contrat
        sinistre.setClientId(contrat.getClientId());

        // 4. Si CLIENT, vérifier qu'il est bien propriétaire du contrat
        if ("CLIENT".equals(userRole) && !contrat.getClientId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous ne pouvez créer un sinistre que sur vos propres contrats");
        }

        // 5. Générer les valeurs par défaut
        sinistre.setNumeroSinistre("SIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sinistre.setStatut(StatutSinistre.DECLARE);
        sinistre.setDateDeclaration(LocalDateTime.now());

        // 6. Sauvegarder
        Sinistre saved = sinistreRepository.save(sinistre);
        enrichirAvecDonneesClient(saved);

        return ResponseEntity.ok(saved);
    }

    // ... reste du code identique (autres méthodes) ...

    private ContratDTO getContratById(Long contratId) {
        try {
            String url = SERVICE_CONTRAT_URL + contratId;
            return restTemplate.getForObject(url, ContratDTO.class);
        } catch (Exception e) {
            return null;
        }
    }

    private void enrichirAvecDonneesClient(Sinistre sinistre) {
        // ... votre code existant ...
    }
}

// ============================================
// RÉSUMÉ DES CHANGEMENTS
// ============================================
//
// Ligne 51 (dans createSinistre) :
//
// ❌ AVANT :
// if (!"ACTIF".equals(contrat.getStatut())) {
//
// ✅ APRÈS :
// if (!"ACTIVE".equals(contrat.getStatut())) {
//
// OU ENCORE MIEUX (si ContratDTO utilise l'enum) :
// import com.pfa.service_assurance.entity.StatutContrat;
// if (contrat.getStatut() != StatutContrat.ACTIVE) {
//
