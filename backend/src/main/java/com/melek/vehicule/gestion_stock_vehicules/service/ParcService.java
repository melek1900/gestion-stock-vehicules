package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ParcService {
    private final ParcRepository parcRepository;

    public ParcService(ParcRepository parcRepository) {
        this.parcRepository = parcRepository;
    }

    public Parc getParcByNom(String nom) {
        return parcRepository.findByNom(nom)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Parc introuvable : " + nom));
    }

    public Parc getParcById(Long id) {
        return parcRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Parc introuvable avec l'ID : " + id));
    }
}
