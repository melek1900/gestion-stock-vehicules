package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.service.DemandeExpertiseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expertise")
public class DemandeExpertiseController {
    private final DemandeExpertiseService demandeExpertiseService;

    public DemandeExpertiseController(DemandeExpertiseService demandeExpertiseService) {
        this.demandeExpertiseService = demandeExpertiseService;
    }

    @PostMapping("/demander/{vehiculeId}")
    public ResponseEntity<?> demanderExpertise(@PathVariable Long vehiculeId) {
        demandeExpertiseService.creerDemandeExpertise(vehiculeId);
        return ResponseEntity.ok("Demande d'expertise envoyée");
    }
}
