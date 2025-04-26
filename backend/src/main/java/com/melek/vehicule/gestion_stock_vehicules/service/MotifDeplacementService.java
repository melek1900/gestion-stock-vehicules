package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.MotifDeplacement;
import com.melek.vehicule.gestion_stock_vehicules.repository.MotifDeplacementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MotifDeplacementService {

    private final MotifDeplacementRepository motifRepository;

    public MotifDeplacementService(MotifDeplacementRepository motifRepository) {
        this.motifRepository = motifRepository;
    }

    public List<MotifDeplacement> getAllMotifs() {
        return motifRepository.findAll();
    }

    public MotifDeplacement getMotifById(Long id) {
        return motifRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Motif de déplacement non trouvé avec l'ID : " + id));
    }
}
