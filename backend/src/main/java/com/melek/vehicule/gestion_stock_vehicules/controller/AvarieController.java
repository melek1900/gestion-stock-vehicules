package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.service.AvarieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/avaries")
public class AvarieController {

    @Autowired
    private AvarieService avarieService;

    @PostMapping("/ajouter")
    public ResponseEntity<Avarie> ajouterAvarie(
            @RequestParam Long vehiculeId,
            @RequestParam String type,
            @RequestParam String commentaire,
            @RequestParam(required = false) String photoUrl) {

        Avarie avarie = avarieService.ajouterAvarie(vehiculeId, type, commentaire, photoUrl);
        return ResponseEntity.ok(avarie);
    }

    @DeleteMapping("/supprimer/{id}")
    public ResponseEntity<Void> supprimerAvarie(@PathVariable Long id) {
        avarieService.supprimerAvarie(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/vehicule/{vehiculeId}")
    public ResponseEntity<List<Avarie>> getAvariesByVehicule(@PathVariable Long vehiculeId) {
        List<Avarie> avaries = avarieService.getAvariesByVehicule(vehiculeId);
        return ResponseEntity.ok(avaries);
    }
}
