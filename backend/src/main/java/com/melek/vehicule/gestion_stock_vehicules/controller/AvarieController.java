package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.service.AvarieService;
import com.melek.vehicule.gestion_stock_vehicules.service.VehiculeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaries")
public class AvarieController {
    private final AvarieService avarieService;
    private final VehiculeService vehiculeService;

    public AvarieController(AvarieService avarieService, VehiculeService vehiculeService) {
        this.avarieService = avarieService;
        this.vehiculeService = vehiculeService;
    }

    @PostMapping("/{vehiculeId}")
    public ResponseEntity<Avarie> ajouterAvarie(@PathVariable Long vehiculeId, @RequestBody Avarie avarie) {
        avarie.setVehicule(vehiculeService.getVehiculeById(vehiculeId));
        Avarie nouvelleAvarie = avarieService.ajouterAvarie(avarie);
        return ResponseEntity.ok(nouvelleAvarie);
    }

    @GetMapping("/{vehiculeId}")
    public ResponseEntity<List<Avarie>> getAvariesByVehicule(@PathVariable Long vehiculeId) {
        return ResponseEntity.ok(avarieService.getAvariesByVehiculeId(vehiculeId));
    }
}
