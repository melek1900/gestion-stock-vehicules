package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParEnergieDTO;
import com.melek.vehicule.gestion_stock_vehicules.repository.VenteEnergieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenteEnergieService {
    private final VenteEnergieRepository repository;

    public List<StatVenteParEnergieDTO> getStatistiquesParEnergie(String marque) {
        return repository.sumVenteByEnergieFiltered(marque);
    }
}
