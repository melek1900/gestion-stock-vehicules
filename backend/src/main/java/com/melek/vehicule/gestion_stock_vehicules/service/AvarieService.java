package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.repository.AvarieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvarieService {
    private final AvarieRepository avarieRepository;

    public AvarieService(AvarieRepository avarieRepository) {
        this.avarieRepository = avarieRepository;
    }

    public Avarie ajouterAvarie(Avarie avarie) {
        return avarieRepository.save(avarie);
    }

    public List<Avarie> getAvariesByVehiculeId(Long vehiculeId) {
        return avarieRepository.findAll()
                .stream()
                .filter(a -> a.getVehicule().getId().equals(vehiculeId))
                .toList();
    }
}
