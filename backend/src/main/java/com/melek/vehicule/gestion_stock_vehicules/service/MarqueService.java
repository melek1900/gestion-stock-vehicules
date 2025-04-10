package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import com.melek.vehicule.gestion_stock_vehicules.repository.MarqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarqueService {
    @Autowired
    private MarqueRepository marqueRepository;

    public List<Marque> getAllMarques() {
        return marqueRepository.findAll();
    }

    public Marque ajouterMarque(String nom) {
        if (marqueRepository.existsByNomIgnoreCase(nom)) {
            throw new IllegalArgumentException("Cette marque existe déjà.");
        }
        Marque marque = new Marque();
        marque.setNom(nom);
        return marqueRepository.save(marque);
    }

    public void supprimerMarque(Long id) {
        marqueRepository.deleteById(id);
    }
}
