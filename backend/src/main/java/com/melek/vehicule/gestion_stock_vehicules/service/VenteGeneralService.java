package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreParMarqueDTO;
import com.melek.vehicule.gestion_stock_vehicules.repository.VenteGeneralRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenteGeneralService {
    private final VenteGeneralRepository repository;

    public VenteGeneralService(VenteGeneralRepository repository) {
        this.repository = repository;
    }

    public List<StatVenteParGenreParMarqueDTO> getStatParGenreConcurrenceParMarques(List<String> marques) {
        return repository.findVentesParGenrePourConcurrence(marques);
    }

    public List<StatVenteParGenreParMarqueDTO> getStatParGenreParMarques(List<String> marques) {
        return repository.findVentesParGenreParMarques(marques);
    }
}

