package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.DemandeExpertise;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutDemande;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import com.melek.vehicule.gestion_stock_vehicules.repository.DemandeExpertiseRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class DemandeExpertiseService {
    private final DemandeExpertiseRepository repository;
    private final VehiculeRepository vehiculeRepository;

    public DemandeExpertiseService(DemandeExpertiseRepository repository, VehiculeRepository vehiculeRepository) {
        this.repository = repository;
        this.vehiculeRepository = vehiculeRepository;
    }

    public void creerDemandeExpertise(Long vehiculeId) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));

        DemandeExpertise demande = new DemandeExpertise();
        demande.setVehicule(vehicule);
        demande.setDateDemande(new Date());
        demande.setStatut(StatutDemande.EN_ATTENTE);
        repository.save(demande);
    }
}

