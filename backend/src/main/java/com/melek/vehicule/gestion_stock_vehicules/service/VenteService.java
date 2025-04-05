package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParModeleDTO;
import com.melek.vehicule.gestion_stock_vehicules.repository.VenteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenteService {
    private final VenteRepository venteRepository;

    public VenteService(VenteRepository venteRepository) {
        this.venteRepository = venteRepository;
    }

    public List<StatVenteParModeleDTO> getStatistiquesVenteParModele(String marque) {
        return venteRepository.sumVenteByModeleFiltered(marque);
    }
}

