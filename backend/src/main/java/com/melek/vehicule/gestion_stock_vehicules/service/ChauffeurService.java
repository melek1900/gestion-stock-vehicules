package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.Chauffeur;
import com.melek.vehicule.gestion_stock_vehicules.repository.ChauffeurRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChauffeurService {

    private final ChauffeurRepository chauffeurRepository;

    public ChauffeurService(ChauffeurRepository chauffeurRepository) {
        this.chauffeurRepository = chauffeurRepository;
    }
    public List<Chauffeur> getAllChauffeurs() {
        return chauffeurRepository.findAll();
    }

    public Chauffeur getChauffeurById(Long id) {
        return chauffeurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chauffeur introuvable"));
    }

    public Chauffeur createChauffeur(Chauffeur chauffeur) {

        return chauffeurRepository.save(chauffeur);
    }

    public Chauffeur updateChauffeur(Long id, Chauffeur updated) {
        Chauffeur existing = getChauffeurById(id);
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setQualification(updated.getQualification());
        existing.setCIN(updated.getCIN());
        existing.setDateDelivrance(updated.getDateDelivrance());
        existing.setNumeroPermis(updated.getNumeroPermis());
        existing.setDisponible(updated.isDisponible());
        existing.setTelephone(updated.getTelephone());
        return chauffeurRepository.save(existing);
    }

    public void deleteChauffeur(Long id) {
        try {
            chauffeurRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Ce chauffeur est utilisé dans une ou plusieurs missions. Suppression impossible.");
        }    }
    public List<Chauffeur> getChauffeursDisponibles() {
        return chauffeurRepository.findByDisponibleTrue();
    }


}
