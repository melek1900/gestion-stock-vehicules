package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.AvarieDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.service.AvarieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/avaries")
public class AvarieController {

    @Autowired
    private AvarieService avarieService;

    // ✅ Ajouter une avarie avec photos
    @PostMapping("/vehicule/{vehiculeId}")
    public ResponseEntity<AvarieDTO> ajouterAvarieAvecPhotos(
            @PathVariable Long vehiculeId,
            @RequestParam String type,
            @RequestParam String commentaire,
            @RequestParam(required = false) List<MultipartFile> photos) {

        Avarie avarie = avarieService.ajouterAvarie(vehiculeId, type, commentaire, photos);
        return ResponseEntity.ok(new AvarieDTO(avarie));
    }

    // ✅ Supprimer une avarie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerAvarie(@PathVariable Long id) {
        avarieService.supprimerAvarie(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Récupérer les avaries d’un véhicule
    @GetMapping("/vehicule/{vehiculeId}")
    public ResponseEntity<List<AvarieDTO>> getAvariesByVehicule(@PathVariable Long vehiculeId) {
        List<AvarieDTO> dtos = avarieService.getAvariesByVehicule(vehiculeId).stream()
                .map(AvarieDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}
