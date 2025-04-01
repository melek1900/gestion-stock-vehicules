package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.service.CompteurOrdreMissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compteur-ordre-mission")
@RequiredArgsConstructor
public class CompteurOrdreMissionController {

    private final CompteurOrdreMissionService compteurService;

    @GetMapping("/{annee}")
    public ResponseEntity<?> getCompteur(@PathVariable int annee) {
        return ResponseEntity.ok(compteurService.getCompteur(annee));
    }

    @PostMapping("/initialiser")
    public ResponseEntity<?> initialiserCompteur(@RequestParam int annee, @RequestParam int compteur) {
        return ResponseEntity.ok(compteurService.initialiserCompteur(annee, compteur));
    }

    @PutMapping("/{annee}")
    public ResponseEntity<?> modifierCompteur(@PathVariable int annee, @RequestParam int nouveauCompteur) {
        return ResponseEntity.ok(compteurService.modifierCompteur(annee, nouveauCompteur));
    }
}
