package com.melek.vehicule.gestion_stock_vehicules.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Photo;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import com.melek.vehicule.gestion_stock_vehicules.repository.AvarieRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class AvarieService {
    @Autowired
    private AvarieRepository avarieRepository;
    @Autowired
    private VehiculeRepository vehiculeRepository;

    public Avarie ajouterAvarie(Long vehiculeId, String type, String commentaire, String photoUrl) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule introuvable"));

        Avarie avarie = new Avarie();
        avarie.setVehicule(vehicule);
        avarie.setType(type);
        avarie.setCommentaire(commentaire);
        avarie.setPhotoUrl(photoUrl);

        return avarieRepository.save(avarie);
    }

    public void supprimerAvarie(Long avarieId) {
        avarieRepository.deleteById(avarieId);
    }

    public List<Avarie> getAvariesByVehicule(Long vehiculeId) {
        return avarieRepository.findByVehiculeId(vehiculeId);
    }
}
