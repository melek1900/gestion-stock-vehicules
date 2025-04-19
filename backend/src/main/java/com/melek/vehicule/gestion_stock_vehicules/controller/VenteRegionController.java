package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParRegionDTO;
import com.melek.vehicule.gestion_stock_vehicules.service.VenteRegionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventes-region")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class VenteRegionController {
    private final VenteRegionService service;

    @GetMapping("/statistiques/par-region")
    public ResponseEntity<List<StatVenteParRegionDTO>> getStatsParRegion(@RequestParam(required = false) String marque) {
        return ResponseEntity.ok(service.getStatistiquesVenteParRegion(marque));
    }
}

