package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParModeleDTO;
import com.melek.vehicule.gestion_stock_vehicules.service.VenteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventes")
@CrossOrigin(origins = "http://localhost:4200")
public class VenteController {

    private final VenteService venteService;

    public VenteController(VenteService venteService) {
        this.venteService = venteService;
    }

    @GetMapping("/statistiques/par-modele")
    public ResponseEntity<List<StatVenteParModeleDTO>> getStatsParModele(@RequestParam(required = false) String marque) {
        return ResponseEntity.ok(venteService.getStatistiquesVenteParModele(marque));
    }
}
