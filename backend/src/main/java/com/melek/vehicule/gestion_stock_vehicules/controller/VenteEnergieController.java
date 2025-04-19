package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParEnergieDTO;
import com.melek.vehicule.gestion_stock_vehicules.service.VenteEnergieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ventes-energie")
@RequiredArgsConstructor
public class VenteEnergieController {
    private final VenteEnergieService service;

    @GetMapping("/statistiques/par-energie")
    public ResponseEntity<List<StatVenteParEnergieDTO>> getStatsParEnergie(@RequestParam String marque) {
        return ResponseEntity.ok(service.getStatistiquesParEnergie(marque));
    }
}

