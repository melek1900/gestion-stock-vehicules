package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreParMarqueDTO;
import com.melek.vehicule.gestion_stock_vehicules.service.VenteGeneralService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventes-general")
@CrossOrigin(origins = "http://localhost:4200")
public class VenteGeneralController {
    private final VenteGeneralService service;

    public VenteGeneralController(VenteGeneralService service) {
        this.service = service;
    }

    @GetMapping("/par-genre-par-marque-concurrence")
    public ResponseEntity<List<StatVenteParGenreParMarqueDTO>> getParGenreParMarquesConcurrence(
            @RequestParam List<String> marques) {
        return ResponseEntity.ok(service.getStatParGenreConcurrenceParMarques(marques));
    }
    @GetMapping("/par-genre-par-marque")
    public ResponseEntity<List<StatVenteParGenreParMarqueDTO>> getParGenreParMarques(
            @RequestParam List<String> marques) {
        return ResponseEntity.ok(service.getStatParGenreParMarques(marques));
    }
}
