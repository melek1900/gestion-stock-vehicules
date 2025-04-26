package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.SousParc;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.SousParcRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcs")
@CrossOrigin(origins = "http://localhost:4200") // ✅ Permet l'accès depuis Angular
public class ParcController {

    private final ParcRepository parcRepository;
    private final SousParcRepository sousParcRepository;
    public ParcController(ParcRepository parcRepository,SousParcRepository sousParcRepository) {
        this.parcRepository = parcRepository;
        this.sousParcRepository = sousParcRepository;
    }

    // ✅ Endpoint pour récupérer tous les parcs
    @GetMapping
    public ResponseEntity<List<Parc>> getAllParcs() {
        List<Parc> parcs = parcRepository.findAll();
        return ResponseEntity.ok(parcs);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Parc> getParcById(@PathVariable Long id) {
        return parcRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/by-parc-nom/{nom}")
    public ResponseEntity<List<SousParc>> getSousParcsByParcNom(@PathVariable String nom) {
        List<SousParc> sousParcs = sousParcRepository.findByParcNomIgnoreCase(nom);
        return ResponseEntity.ok(sousParcs);
    }
}
