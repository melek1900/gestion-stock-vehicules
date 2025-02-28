package com.melek.vehicule.gestion_stock_vehicules.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationRequest;
import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final AvarieRepository avarieRepository;
    private final ParcRepository parcRepository;
    private final StockRepository stockRepository;
    private final DemandeExpertiseRepository demandeExpertiseRepository;
    private final PhotoRepository photoRepository;
    private final ObjectMapper objectMapper; // ✅ Ajout du ObjectMapper
    private final TransfertRepository transfertRepository;
    public VehiculeService(
            VehiculeRepository vehiculeRepository,
            AvarieRepository avarieRepository,
            ParcRepository parcRepository,
            StockRepository stockRepository,
            DemandeExpertiseRepository demandeExpertiseRepository,
            PhotoRepository photoRepository,
            ObjectMapper objectMapper,
            TransfertRepository transfertRepository) {
        this.vehiculeRepository = vehiculeRepository;
        this.avarieRepository = avarieRepository;
        this.parcRepository = parcRepository;
        this.stockRepository = stockRepository;
        this.demandeExpertiseRepository = demandeExpertiseRepository;
        this.photoRepository = photoRepository;
        this.objectMapper = objectMapper;
        this.transfertRepository=transfertRepository;
    }

    /**
     * ✅ Ajouter un véhicule avec ses avaries et ses photos
     */
    @Transactional
    public Vehicule createVehicule(Vehicule vehicule, List<Avarie> avaries, List<MultipartFile> photos) {
        Parc parc1 = parcRepository.findById(1L)
                .orElseThrow(() -> new EntityNotFoundException("Parc 1 non trouvé"));
        Stock stock = stockRepository.findById(1L)
                .orElseThrow(() -> new EntityNotFoundException("Stock non trouvé"));

        vehicule.setParc(parc1);
        vehicule.setStock(stock);
        vehicule.setStatut(StatutVehicule.EN_STOCK);

        Vehicule savedVehicule = vehiculeRepository.save(vehicule);

        // ✅ Ajout des avaries
        if (avaries != null && !avaries.isEmpty()) {
            for (Avarie avarie : avaries) {
                avarie.setVehicule(savedVehicule);
                avarieRepository.save(avarie);
            }
        }

        // ✅ Ajout des photos aux avaries
        if (photos != null && !photos.isEmpty()) {
            for (int i = 0; i < photos.size(); i++) {
                MultipartFile file = photos.get(i);
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());

                    // ✅ Associer la photo à une avarie (si disponible)
                    if (avaries != null && i < avaries.size()) {
                        photo.setAvarie(avaries.get(i));
                    }
                    photoRepository.save(photo);
                } catch (Exception e) {
                    throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
                }
            }
        }

        // ✅ Mise à jour du stock
        stock.setNombreTotal(stock.getNombreTotal() + 1);
        stockRepository.save(stock);

        return savedVehicule;
    }

    /**
     * ✅ Ajouter une avarie à un véhicule existant
     */
    public Avarie ajouterAvarie(Long vehiculeId, Avarie avarie) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé avec l'ID : " + vehiculeId));

        avarie.setVehicule(vehicule);
        return avarieRepository.save(avarie);
    }

    /**
     * ✅ Ajouter une photo à une avarie existante
     */
    public Photo ajouterPhotos(Long avarieId, Photo photo) {
        Avarie avarie = avarieRepository.findById(avarieId)
                .orElseThrow(() -> new EntityNotFoundException("Avarie non trouvée avec l'ID : " + avarieId));

        photo.setAvarie(avarie);
        return photoRepository.save(photo);
    }

    /**
     * ✅ Modifier un véhicule existant
     */
    @Transactional
    public Vehicule updateVehicule(Long id, String vehiculeJson, String avariesJson, List<MultipartFile> photos, String deletedPhotoIdsJson) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé avec l'ID : " + id));

        try {
            // ✅ Désérialisation sécurisée des avaries
            List<Avarie> nouvellesAvaries = avariesJson != null && !avariesJson.isEmpty()
                    ? new ArrayList<>(List.of(objectMapper.readValue(avariesJson, Avarie[].class)))
                    : new ArrayList<>();

            // ✅ Désérialisation sécurisée des photos à supprimer
            List<Long> deletedPhotoIds = deletedPhotoIdsJson != null && !deletedPhotoIdsJson.isEmpty()
                    ? objectMapper.readValue(deletedPhotoIdsJson, List.class)
                    : new ArrayList<>();

            // ✅ 1️⃣ Supprimer proprement les photos demandées
            if (!deletedPhotoIds.isEmpty()) {
                deletedPhotoIds.forEach(photoRepository::deleteById);
            }

            // ✅ 2️⃣ Mettre à jour uniquement les avaries existantes
            List<Avarie> avariesActuelles = vehicule.getAvaries();
            avariesActuelles.clear();  // 🔥 Corrige le problème des orphanRemoval
            for (Avarie nouvelleAvarie : nouvellesAvaries) {
                nouvelleAvarie.setVehicule(vehicule);
                avarieRepository.save(nouvelleAvarie);  // 🔥 Sauvegarde chaque avarie individuellement
                avariesActuelles.add(nouvelleAvarie);
            }

            // ✅ 3️⃣ Ajouter de nouvelles photos aux avaries
            if (photos != null && !photos.isEmpty()) {
                for (MultipartFile file : photos) {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());

                    // Associer la photo à une avarie si possible
                    if (!avariesActuelles.isEmpty()) {
                        photo.setAvarie(avariesActuelles.get(avariesActuelles.size() - 1));
                    }

                    photoRepository.save(photo);
                }
            }

            return vehiculeRepository.save(vehicule);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erreur lors du traitement JSON des avaries ou des photos supprimées", e);
        }
    }


    /**
     * ✅ Changer le statut d'un véhicule
     */
    public Vehicule changerStatut(Long vehiculeId, StatutVehicule statut) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé avec l'ID : " + vehiculeId));

        vehicule.setStatut(statut);
        return vehiculeRepository.save(vehicule);
    }

    /**
     * ✅ Récupérer tous les véhicules
     */
    public List<VehiculeDTO> getAllVehicules() {
        List<Vehicule> vehicules = vehiculeRepository.findAll();
        return vehicules.stream()
                .map(VehiculeDTO::new) // Convertit chaque Vehicule en DTO
                .toList();
    }

    /**
     * ✅ Récupérer un véhicule par ID
     */
    public Vehicule getVehiculeById(Long id) {
        return vehiculeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé avec l'ID : " + id));
    }

    /**
     * ✅ Supprimer un véhicule
     */
    @Transactional
    public void deleteVehicule(Long id) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé avec l'ID : " + id));

        // ✅ Supprime les relations entre le véhicule et les transferts
        transfertRepository.deleteTransfertRelationsByVehiculeId(id);

        // ✅ Supprime les transferts qui n'ont plus de véhicules associés
        transfertRepository.deleteOrphanTransferts();

        // ✅ Supprime ensuite le véhicule
        vehiculeRepository.delete(vehicule);
    }
    public Vehicule convertJsonToVehicule(String vehiculeJson) {
        try {
            return objectMapper.readValue(vehiculeJson, Vehicule.class);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la conversion du JSON vers Vehicule", e);
        }
    }

    public List<Avarie> convertJsonToAvaries(String avariesJson) {
        try {
            return List.of(objectMapper.readValue(avariesJson, Avarie[].class));
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la conversion du JSON vers Avaries", e);
        }
    }
    @Transactional
    public Vehicule mettreAJourPreparation(PreparationDTO preparation) {
        Vehicule vehicule = vehiculeRepository.findById(preparation.getVehiculeId())
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé"));

        if (!vehicule.getStatut().equals(StatutVehicule.EN_PREPARATION)) {
            throw new IllegalStateException("Le véhicule n'est pas en préparation !");
        }

        // ✅ Convertir la chaîne en Enum avant d'affecter
        vehicule.setStatut(StatutVehicule.PRET_A_LA_VENTE); // ✅ Utilisation correcte de l'Enum

        return vehiculeRepository.save(vehicule);
    }

}
