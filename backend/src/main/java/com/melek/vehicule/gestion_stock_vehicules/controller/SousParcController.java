package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.SousParc;
import com.melek.vehicule.gestion_stock_vehicules.repository.SousParcRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sous-parcs")
@CrossOrigin(origins = "http://localhost:4200")
public class SousParcController {

    private final SousParcRepository sousParcRepository;

    public SousParcController(SousParcRepository sousParcRepository) {
        this.sousParcRepository = sousParcRepository;
    }

    @GetMapping("/parc/{parcId}")
    public ResponseEntity<List<SousParc>> getSousParcsByParc(@PathVariable Long parcId) {
        return ResponseEntity.ok(sousParcRepository.findByParcId(parcId));
    }
    @GetMapping("/by-parc-nom/{nom}")
    public ResponseEntity<List<SousParc>> getSousParcsByParcNom(@PathVariable String nom) {
        List<SousParc> sousParcs = sousParcRepository.findByParcNomIgnoreCase(nom);
        return ResponseEntity.ok(sousParcs);
    }
}
