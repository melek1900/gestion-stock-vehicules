package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Chauffeur;
import com.melek.vehicule.gestion_stock_vehicules.service.ChauffeurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chauffeurs")
public class ChauffeurController {

    private final ChauffeurService chauffeurService;

    public ChauffeurController(ChauffeurService chauffeurService) {
        this.chauffeurService = chauffeurService;
    }
    @GetMapping
    public List<Chauffeur> getAllChauffeurs() {
        return chauffeurService.getAllChauffeurs();
    }

    @GetMapping("/{id}")
    public Chauffeur getChauffeur(@PathVariable Long id) {
        return chauffeurService.getChauffeurById(id);
    }

    @PostMapping
    public Chauffeur create(@RequestBody Chauffeur chauffeur) {
        return chauffeurService.createChauffeur(chauffeur);
    }

    @PutMapping("/{id}")
    public Chauffeur update(@PathVariable Long id, @RequestBody Chauffeur chauffeur) {
        return chauffeurService.updateChauffeur(id, chauffeur);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        chauffeurService.deleteChauffeur(id);
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Chauffeur>> getChauffeursDisponibles() {
        return ResponseEntity.ok(chauffeurService.getChauffeursDisponibles());
    }

}
