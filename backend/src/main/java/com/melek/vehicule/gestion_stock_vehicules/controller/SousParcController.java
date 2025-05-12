package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.SousParc;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.SousParcRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sous-parcs")
@CrossOrigin(origins = "http://localhost:4200")
public class SousParcController {

    private final SousParcRepository sousParcRepository;
    private final ParcRepository parcRepository;
    public SousParcController(SousParcRepository sousParcRepository,ParcRepository parcRepository) {
        this.sousParcRepository = sousParcRepository;
        this.parcRepository =parcRepository;
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

    @PostMapping
    public ResponseEntity<SousParc> createSousParc(@RequestBody SousParc sousParc) {
        Parc parcCarrosserie = parcRepository.findByNomIgnoreCase("CARROSSERIE")
                .orElseThrow(() -> new RuntimeException("Parc CARROSSERIE introuvable"));
        sousParc.setParc(parcCarrosserie);
        return ResponseEntity.ok(sousParcRepository.save(sousParc));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSousParc(@PathVariable Long id) {
        if (!sousParcRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sousParcRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
