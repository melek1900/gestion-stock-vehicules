package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.CompteurOrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.repository.CompteurOrdreMissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Year;
import java.util.Map;

@Service
public class CompteurOrdreMissionService {

    @Autowired
    private CompteurOrdreMissionRepository repository;

    public String genererNumeroOrdreMission() {
        int annee = Year.now().getValue();
        CompteurOrdreMission compteur = repository.findByAnnee(annee)
                .orElseGet(() -> {
                    CompteurOrdreMission nouveau = new CompteurOrdreMission();
                    nouveau.setAnnee(annee);
                    nouveau.setCompteur(0);
                    return repository.save(nouveau);
                });

        compteur.setCompteur(compteur.getCompteur() + 1);
        repository.save(compteur);

        String numeroFormate = String.format("%05d", compteur.getCompteur());
        return "OM-" + annee + "" + numeroFormate; // ✅ Nouveau format
    }
    public Map<String, Object> getCompteur(int annee) {
        CompteurOrdreMission c = repository.findByAnnee(annee)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun compteur pour cette année"));
        String numero = annee + "-OM " + String.format("%05d", c.getCompteur());
        return Map.of("annee", annee, "compteur", c.getCompteur(), "numeroComplet", numero);
    }

    public Map<String, Object> initialiserCompteur(int annee, int compteur) {
        if (repository.findByAnnee(annee).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Déjà initialisé.");
        }
        CompteurOrdreMission c = new CompteurOrdreMission();
        c.setAnnee(annee);
        c.setCompteur(compteur);
        repository.save(c);
        return getCompteur(annee);
    }

    public Map<String, Object> modifierCompteur(int annee, int nouveauCompteur) {
        CompteurOrdreMission c = repository.findByAnnee(annee)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Non trouvé"));
        c.setCompteur(nouveauCompteur);
        repository.save(c);
        return getCompteur(annee);
    }
}
