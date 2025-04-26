package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.MotifDeplacement;
import com.melek.vehicule.gestion_stock_vehicules.service.MotifDeplacementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motifs")
@CrossOrigin(origins = "*")
public class MotifDeplacementController {

    private final MotifDeplacementService motifService;

    public MotifDeplacementController(MotifDeplacementService motifService) {
        this.motifService = motifService;
    }

    @GetMapping
    public List<MotifDeplacement> getAllMotifs() {
        return motifService.getAllMotifs();
    }

    @GetMapping("/{id}")
    public MotifDeplacement getMotif(@PathVariable Long id) {
        return motifService.getMotifById(id);
    }
}
