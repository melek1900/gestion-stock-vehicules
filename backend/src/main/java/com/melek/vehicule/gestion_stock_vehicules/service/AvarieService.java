package com.melek.vehicule.gestion_stock_vehicules.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.dto.AvarieDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Photo;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutAvarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import com.melek.vehicule.gestion_stock_vehicules.repository.AvarieRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.PhotoRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
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
    @Autowired
    private PhotoRepository photoRepository;

    @Transactional
    public Avarie ajouterAvarie(Long vehiculeId, String type, String commentaire, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule introuvable"));

        Avarie avarie = new Avarie();
        avarie.setVehicule(vehicule);
        avarie.setType(type);
        avarie.setCommentaire(commentaire);
        avarie.setStatut(StatutAvarie.EN_COURS);

        Avarie savedAvarie = avarieRepository.save(avarie);

        if (photos != null && !photos.isEmpty()) {
            for (MultipartFile file : photos) {
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());
                    photo.setData(file.getBytes());
                    photo.setAvarie(savedAvarie);
                    photoRepository.save(photo);
                } catch (IOException e) {
                    throw new RuntimeException("❌ Erreur lors de l'enregistrement de la photo", e);
                }
            }
        }

        return savedAvarie;
    }
    @Transactional
    public Avarie cloturerAvarie(Long id) {
        Avarie avarie = avarieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Avarie introuvable"));
        avarie.setStatut(StatutAvarie.CLOTURE);
        return avarieRepository.save(avarie);
    }
    private Avarie convertAvarieDTOToEntity(String avarieJson, List<MultipartFile> photoFiles) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            AvarieDTO avarieDTO = mapper.readValue(avarieJson, AvarieDTO.class);
            Avarie avarie = new Avarie();
            avarie.setType(avarieDTO.getType());
            avarie.setCommentaire(avarieDTO.getCommentaire());
            avarie.setStatut(StatutAvarie.EN_COURS);

            List<Photo> photos = new ArrayList<>();
            for (MultipartFile file : photoFiles) {
                Photo photo = new Photo();
                photo.setFileName(file.getOriginalFilename());
                photo.setData(file.getBytes());
                photo.setAvarie(avarie);
                photos.add(photo);
            }
            avarie.setPhotos(photos);

            return avarie;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture du JSON d'avarie ou des fichiers photo", e);
        }
    }
    public void supprimerAvarie(Long avarieId) {
        avarieRepository.deleteById(avarieId);
    }

    public List<Avarie> getAvariesByVehicule(Long vehiculeId) {
        return avarieRepository.findByVehiculeId(vehiculeId);
    }
}
