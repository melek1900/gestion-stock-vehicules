package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class VehiculeService {
    @Autowired
    private VehiculeRepository vehiculeRepository;

    public Vehicule createVehicule(Vehicule vehicule) {
        return vehiculeRepository.save(vehicule);
    }

    public List<Vehicule> getAllVehicules() {
        return vehiculeRepository.findAll();
    }

    public Vehicule getVehiculeById(Long id) {
        return vehiculeRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Vehicule not found"));
    }

    public Vehicule updateVehicule(Long id, Vehicule vehiculeDetails) {
        Vehicule vehicule = getVehiculeById(id);
        vehicule.setModele(vehiculeDetails.getModele());
        vehicule.setNumeroChassis(vehiculeDetails.getNumeroChassis());
        // Mettre à jour d'autres attributs...
        return vehiculeRepository.save(vehicule);
    }

    public void deleteVehicule(Long id) {
        Vehicule vehicule = getVehiculeById(id);
        vehiculeRepository.delete(vehicule);
    }
}
