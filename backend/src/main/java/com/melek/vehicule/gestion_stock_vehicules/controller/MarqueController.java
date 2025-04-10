package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import com.melek.vehicule.gestion_stock_vehicules.service.MarqueService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marques")
@CrossOrigin(origins = "http://localhost:4200")
public class MarqueController {

    @Autowired
    private MarqueService marqueService;

    @GetMapping
    public List<Marque> getAllMarques() {
        return marqueService.getAllMarques();
    }

    @PostMapping
    public ResponseEntity<?> ajouterMarque(@RequestBody Map<String, String> body) {
        try {
            String nom = body.get("nom");
            Marque nouvelleMarque = marqueService.ajouterMarque(nom);
            return ResponseEntity.ok(nouvelleMarque);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerMarque(@PathVariable Long id) {
        marqueService.supprimerMarque(id);
        return ResponseEntity.noContent().build();
    }
}

