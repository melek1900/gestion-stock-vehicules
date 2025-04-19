package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParRegionDTO;
import com.melek.vehicule.gestion_stock_vehicules.repository.VenteRegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenteRegionService {
    private final VenteRegionRepository venteRegionRepository;

    public List<StatVenteParRegionDTO> getStatistiquesVenteParRegion(String marque) {
        return venteRegionRepository.sumVenteByRegionFiltered(marque);
    }
}

