package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationRequest;
import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.service.VehiculeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@RestController
@RequestMapping("/api/vehicules")
public class VehiculeController {

    private final VehiculeService vehiculeService;
    private final ObjectMapper objectMapper; // ✅ Utilisation d'ObjectMapper

    public VehiculeController(VehiculeService vehiculeService,ObjectMapper objectMapper) {
        this.vehiculeService = vehiculeService;
        this.objectMapper = objectMapper;

    }

    // ✅ Ajouter un véhicule avec avaries et photos
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Vehicule> createVehicule(
            @RequestPart("vehicule") String vehiculeJson,
            @RequestPart(value = "avaries", required = false) String avariesJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();

            // ✅ Convertir le JSON en objets Java
            Vehicule vehicule = objectMapper.readValue(vehiculeJson, Vehicule.class);
            List<Avarie> avaries = (avariesJson != null && !avariesJson.isEmpty()) ?
                    List.of(objectMapper.readValue(avariesJson, Avarie[].class)) : null;

            System.out.println("🚀 JSON reçu : " + vehiculeJson);
            System.out.println("🛑 Avaries reçues : " + avariesJson);
            System.out.println("📸 Nombre de photos reçues : " + (photos != null ? photos.size() : 0));

            Vehicule createdVehicule = vehiculeService.createVehicule(vehicule, avaries, photos);
            return new ResponseEntity<>(createdVehicule, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    // ✅ Ajouter une avarie à un véhicule
    @PostMapping("/{id}/avaries")
    public ResponseEntity<Avarie> ajouterAvarie(@PathVariable Long id, @RequestBody Avarie avarie) {
        Avarie nouvelleAvarie = vehiculeService.ajouterAvarie(id, avarie);
        return ResponseEntity.ok(nouvelleAvarie);
    }

    // ✅ Ajouter une photo à une avarie
    @PostMapping("/avaries/{id}/photos")
    public ResponseEntity<Photo> ajouterPhotos(@PathVariable Long id, @RequestBody Photo photo) {
        Photo nouvellePhoto = vehiculeService.ajouterPhotos(id, photo);
        return ResponseEntity.ok(nouvellePhoto);
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Vehicule> updateVehicule(
            @PathVariable Long id,
            @RequestPart("vehicule") String vehiculeJson,
            @RequestPart(value = "avaries", required = false) String avariesJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            @RequestPart(value = "deletedPhotoIds", required = false) String deletedPhotoIdsJson) {

        Vehicule updatedVehicule = vehiculeService.updateVehicule(id, vehiculeJson, avariesJson, photos, deletedPhotoIdsJson);
        return ResponseEntity.ok(updatedVehicule);
    }



    // ✅ Changer le statut d'un véhicule
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Vehicule> changerStatut(@PathVariable Long id, @RequestParam StatutVehicule statut) {
        Vehicule vehicule = vehiculeService.changerStatut(id, statut);
        return ResponseEntity.ok(vehicule);
    }
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    @PostMapping("/preparation")
    public ResponseEntity<String> mettreAJourPreparation(@RequestBody PreparationDTO preparation) {
        vehiculeService.mettreAJourPreparation(preparation);
        return ResponseEntity.ok("Préparation mise à jour !");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicule(@PathVariable Long id) {
        vehiculeService.deleteVehicule(id);
        return ResponseEntity.noContent().build(); // ✅ 204 No Content
    }
    @GetMapping
    public List<VehiculeDTO> getAllVehicules() {
        return vehiculeService.getAllVehicules();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculeDTO> getVehiculeById(@PathVariable Long id) {
        Vehicule vehicule = vehiculeService.getVehiculeById(id);
        return ResponseEntity.ok(new VehiculeDTO(vehicule));
    }

}
