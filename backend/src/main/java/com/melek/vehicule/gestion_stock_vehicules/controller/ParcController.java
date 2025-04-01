package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parcs")
@CrossOrigin(origins = "http://localhost:4200") // ✅ Permet l'accès depuis Angular
public class ParcController {

    private final ParcRepository parcRepository;

    public ParcController(ParcRepository parcRepository) {
        this.parcRepository = parcRepository;
    }

    // ✅ Endpoint pour récupérer tous les parcs
    @GetMapping
    public ResponseEntity<List<Parc>> getAllParcs() {
        List<Parc> parcs = parcRepository.findAll();
        return ResponseEntity.ok(parcs);
    }
}
