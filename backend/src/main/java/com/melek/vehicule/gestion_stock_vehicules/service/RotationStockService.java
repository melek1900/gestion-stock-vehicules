package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.RotationStockStatDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.RotationStockTauxDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.RotationStock;
import com.melek.vehicule.gestion_stock_vehicules.repository.RotationStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RotationStockService {

    private final RotationStockRepository rotationStockRepository;

    public List<RotationStock> getAll() {
        return rotationStockRepository.findAll();
    }
    public List<RotationStockStatDTO> getQuantiteVendueParMoisEtMarque() {
        return rotationStockRepository.findQuantiteVendueParMoisEtMarqueRaw();
    }
    public RotationStock save(RotationStock rs) {
        return rotationStockRepository.save(rs);
    }

    public void delete(Long id) {
        rotationStockRepository.deleteById(id);
    }
    public List<RotationStockTauxDTO> getTauxRotationQuantite(String marque) {
        return rotationStockRepository.findTauxRotationQuantite(marque).stream()
                .map(o -> new RotationStockTauxDTO((String) o[0], (String) o[1], o[2] != null ? ((Number) o[2]).doubleValue() : 0.0))
                .toList();
    }

    public List<RotationStockTauxDTO> getTauxRotationValeur(String marque) {
        return rotationStockRepository.findTauxRotationValeur(marque).stream()
                .map(o -> new RotationStockTauxDTO((String) o[0], (String) o[1], o[2] != null ? ((Number) o[2]).doubleValue() : 0.0))
                .toList();
    }
}
