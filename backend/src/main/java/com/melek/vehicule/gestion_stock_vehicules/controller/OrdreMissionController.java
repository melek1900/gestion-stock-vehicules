package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.OrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.repository.OrdreMissionRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;
import com.melek.vehicule.gestion_stock_vehicules.service.OrdreMissionPDFService;
import com.melek.vehicule.gestion_stock_vehicules.service.OrdreMissionService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordres-mission")
public class OrdreMissionController {

    private final OrdreMissionService ordreMissionService;
    private final OrdreMissionPDFService ordreMissionPDFService;
    private final OrdreMissionRepository ordreMissionRepository;
    private final VehiculeRepository vehiculeRepository ;


    public OrdreMissionController(OrdreMissionService ordreMissionService, OrdreMissionPDFService ordreMissionPDFService,OrdreMissionRepository ordreMissionRepository,VehiculeRepository vehiculeRepository) {
        this.ordreMissionService = ordreMissionService;
        this.ordreMissionPDFService = ordreMissionPDFService;
        this.ordreMissionRepository = ordreMissionRepository;
        this.vehiculeRepository = vehiculeRepository;

    }
    @GetMapping("/{numeroOrdre}/vehicules")
    public ResponseEntity<List<VehiculeDTO>> getVehiculesParNumeroOrdre(@PathVariable String numeroOrdre) {
        OrdreMission ordre = ordreMissionRepository.findByNumeroOrdre(numeroOrdre)
                .orElseThrow(() -> new RuntimeException("Ordre non trouvé : " + numeroOrdre));

        List<VehiculeDTO> vehicules = ordre.getVehicules().stream()
                .map(VehiculeDTO::new)
                .toList();

        return ResponseEntity.ok(vehicules);
    }
    @GetMapping("/statistiques/statut")
    public ResponseEntity<Map<String, Long>> getStatsOrdreParStatut() {
        return ResponseEntity.ok(ordreMissionService.getStatsParStatutOrdre());
    }
    @PatchMapping("/{numeroOrdre}/prelever/{numeroChassis}")
    @Transactional
    public ResponseEntity<?> preleverVehiculeParNumeroOrdre(
            @PathVariable String numeroOrdre,
            @PathVariable String numeroChassis
    ) {
        boolean success = ordreMissionService.preleverVehiculeParNumeroOrdre(numeroOrdre, numeroChassis);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "✅ Véhicule prélevé. L'ordre reste en cours s'il reste d'autres véhicules à prélever."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "❌ Impossible de prélever ce véhicule."));
        }
    }
    @GetMapping("/{ordreId}/pdf")
    public ResponseEntity<byte[]> telechargerOrdreMission(@PathVariable Long ordreId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("⛔ Authentification invalide");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        try {
            OrdreMission ordreMission = ordreMissionService.getOrdreMissionById(ordreId);
            byte[] pdfBytes = ordreMissionPDFService.generateOrdreMissionPDF(ordreMission);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("ordre_mission_" + ordreMission.getNumeroOrdre() + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // <-- ici
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    @GetMapping
    public ResponseEntity<List<OrdreMission>> getAllOrdresMission() {
        return ResponseEntity.ok(ordreMissionService.getAllOrdresMission());
    }
    @PostMapping("/creer")
    public ResponseEntity<?> creerOrdreMission(@RequestBody Map<String, Object> request) {
        try {
            List<Integer> vehiculeIds = (List<Integer>) request.get("vehiculeIds");
            Integer chauffeurId = (Integer) request.get("chauffeurId");
            Integer vehiculeTransportId = (Integer) request.get("vehiculeTransportId");
            Integer parcDepartId = (Integer) request.get("parcDepartId"); // ✅ Récupération du parc de départ
            Integer parcArriveeId = (Integer) request.get("parcArriveeId"); // ✅ Récupération du parc d'arrivée

            System.out.println("📌 Création d'un Ordre de Mission avec : " +
                    "Chauffeur: " + chauffeurId + ", Véhicule de Transport: " + vehiculeTransportId +
                    ", Véhicules: " + vehiculeIds + ", Parc Départ: " + parcDepartId + ", Parc Arrivée: " + parcArriveeId);

            // ✅ Logique pour enregistrer en base avec les parcs
            OrdreMission ordreMission = ordreMissionService.creerOrdreMission(vehiculeIds, chauffeurId, vehiculeTransportId, parcDepartId, parcArriveeId);

            return ResponseEntity.ok(Map.of(
                    "ordreMissionId", ordreMission.getId(),
                    "numeroOrdre", ordreMission.getNumeroOrdre(),
                    "pdfUrl", "/api/ordres-mission/" + ordreMission.getId() + "/pdf"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400).body("Erreur lors de la création de l'ordre de mission");
        }
    }

    @GetMapping("/vehicule/{vehiculeId}/en-utilisation")
    public ResponseEntity<Boolean> verifierVehiculeUtilise(@PathVariable Long vehiculeId) {
        boolean utilise = ordreMissionService.vehiculeDejaDansOrdre(
                vehiculeRepository.findById(vehiculeId)
                        .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"))
        );
        return ResponseEntity.ok(utilise);
    }
    @PutMapping("/annuler/{ordreId}")
    public ResponseEntity<Map<String, String>> annulerOrdreMission(@PathVariable Long ordreId) {
        ordreMissionService.annulerOrdreMission(ordreId);
        return ResponseEntity.ok(Map.of("message", "✅ Ordre de mission annulé et véhicules libérés."));
    }
    @PutMapping("/cloturer/{ordreId}")
    public ResponseEntity<Map<String, String>> cloturerOrdreMission(@PathVariable Long ordreId) {
        ordreMissionService.cloturerOrdreMission(ordreId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Ordre de mission clôturé avec succès !");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{numeroOrdre}/valider-prelevement")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    public ResponseEntity<?> validerPrelevement(@PathVariable String numeroOrdre) {
        try {
            boolean valide = ordreMissionService.validerPrelevement(numeroOrdre);
            if (valide) {
                return ResponseEntity.ok(Map.of("message", "✅ Prélèvement validé, véhicules transférés."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "❌ Aucun véhicule déplacé."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "❌ Erreur serveur", "error", e.getMessage()));
        }
    }
}
