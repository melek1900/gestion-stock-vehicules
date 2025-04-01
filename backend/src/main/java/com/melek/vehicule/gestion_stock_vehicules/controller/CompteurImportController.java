package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.CompteurImport;
import com.melek.vehicule.gestion_stock_vehicules.repository.CompteurImportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/compteur-import")
public class CompteurImportController {

    private final CompteurImportRepository compteurImportRepository;

    public CompteurImportController(CompteurImportRepository compteurImportRepository) {
        this.compteurImportRepository = compteurImportRepository;
    }

    @GetMapping("/{annee}")
    public CompteurImport getCompteurByAnnee(@PathVariable String annee) {
        return compteurImportRepository.findByAnnee(annee)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun compteur pour cette année"));
    }

    @PutMapping("/{annee}")
    public CompteurImport updateCompteur(@PathVariable String annee, @RequestParam int nouveauCompteur) {
        CompteurImport compteur = compteurImportRepository.findByAnnee(annee)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun compteur pour cette année"));

        compteur.setCompteur(nouveauCompteur);
        return compteurImportRepository.save(compteur);
    }

    @PostMapping("/initialiser")
    public CompteurImport initialiserCompteur(@RequestParam String annee, @RequestParam(defaultValue = "0") int compteur) {
        if (compteurImportRepository.findByAnnee(annee).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Compteur déjà existant pour cette année");
        }

        CompteurImport nouveau = new CompteurImport();
        nouveau.setAnnee(annee);
        nouveau.setCompteur(compteur);
        return compteurImportRepository.save(nouveau);
    }
}