package com.melek.vehicule.gestion_stock_vehicules.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final AvarieRepository avarieRepository;
    private final ParcRepository parcRepository;
    private final StockRepository stockRepository;
    private final PhotoRepository photoRepository;
    private final ObjectMapper objectMapper;
    private final UtilisateurRepository utilisateurRepository;

    public VehiculeService(
            VehiculeRepository vehiculeRepository,
            AvarieRepository avarieRepository,
            ParcRepository parcRepository,
            StockRepository stockRepository,
            PhotoRepository photoRepository,
            ObjectMapper objectMapper,
            UtilisateurRepository utilisateurRepository) {
        this.vehiculeRepository = vehiculeRepository;
        this.avarieRepository = avarieRepository;
        this.parcRepository = parcRepository;
        this.stockRepository = stockRepository;
        this.photoRepository = photoRepository;
        this.objectMapper = objectMapper;
        this.utilisateurRepository = utilisateurRepository;
    }
    @PersistenceContext
    private EntityManager entityManager;
    /**
     * ✅ Enregistrer une liste de véhicules (Import Excel)
     */
    @Transactional
    public void saveAllVehicules(List<Vehicule> vehicules) {
        vehiculeRepository.saveAll(vehicules);
    }

    /**
     * ✅ Récupérer les véhicules d'un parc donné
     */


    /**
     * ✅ Ajouter un véhicule avec ses avaries et photos
     */
    @Transactional
    public Vehicule createVehicule(Vehicule vehicule, List<Avarie> avaries, List<MultipartFile> photos) {
        // ✅ 1️⃣ Vérifier que le parc MEGRINE existe et l'associer au véhicule
        Parc parcAuport = parcRepository.findById(3L)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Parc AUPORT (ID = 3) introuvable"));

        vehicule.setParc(parcAuport);

        // ✅ 2️⃣ Vérifier le stock du parc MEGRINE

        vehicule.setStatut(StatutVehicule.EN_ETAT);

        // ✅ 3️⃣ Enregistrer le véhicule
        Vehicule savedVehicule = vehiculeRepository.save(vehicule);

        // ✅ 4️⃣ Gérer les avaries et photos si présentes
        if (avaries != null && !avaries.isEmpty()) {
            for (Avarie avarie : avaries) {
                avarie.setVehicule(savedVehicule);
                avarieRepository.save(avarie);
            }
        }

        if (photos != null && !photos.isEmpty()) {
            for (MultipartFile file : photos) {
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());
                    photoRepository.save(photo);
                } catch (Exception e) {
                    throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
                }
            }
        }



        return savedVehicule;
    }

    @Transactional
    public Vehicule updateVehiculeFromDTO(String numeroChassis, VehiculeDTO dto) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new RuntimeException("🚨 Véhicule non trouvé : " + numeroChassis));

        vehicule.setModele(dto.getModele());
        vehicule.setNumeroChassis(dto.getNumeroChassis());
        vehicule.setCouleur(dto.getCouleur());
        vehicule.setDescription(dto.getDescription());
        vehicule.setEngine(dto.getEngine());
        vehicule.setKeyCode(dto.getKeyCode());
        vehicule.setPegCode(dto.getPegCode());
        vehicule.setProductionDate(dto.getProductionDate());
        vehicule.setStatut(dto.getStatut());

        // ✅ Gestion du Parc (obligatoire)
        Parc parc = parcRepository.findById(dto.getParcId())
                .orElseThrow(() -> new RuntimeException("🚨 Parc introuvable avec ID : " + dto.getParcId()));

        vehicule.setParc(parc);

        vehiculeRepository.save(vehicule);

        return vehicule;
    }



    /**
     * ✅ Changer le statut d'un véhicule
     */
    @Transactional
    public Vehicule changerStatutParChassis(String numeroChassis, StatutVehicule statut) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé : " + numeroChassis));


        vehicule.setStatut(statut);

        if (statut == StatutVehicule.EN_ETAT) {
            Parc parcMegrine = parcRepository.findByNom("MEGRINE")
                    .orElseThrow(() -> new EntityNotFoundException("🚨 Parc MEGRINE introuvable"));
            vehicule.setParc(parcMegrine);
        }

        vehiculeRepository.save(vehicule);
        vehiculeRepository.flush(); // Forcer Hibernate à exécuter immédiatement l'UPDATE en base
        System.out.println("✅ Flush effectué, transaction confirmée !");
        entityManager.clear(); // Invalider le cache

        return vehicule;
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

        vehiculeRepository.delete(vehicule);
    }

    /**
     * ✅ Convertir JSON en Vehicule
     */
    public Vehicule convertJsonToVehicule(String vehiculeJson) {
        try {
            return objectMapper.readValue(vehiculeJson, Vehicule.class);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la conversion du JSON vers Vehicule", e);
        }
    }

    /**
     * ✅ Convertir JSON en liste d'avaries
     */
    public List<Avarie> convertJsonToAvaries(String avariesJson) {
        try {
            return List.of(objectMapper.readValue(avariesJson, Avarie[].class));
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la conversion du JSON vers Avaries", e);
        }
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
    @Transactional
    public Photo ajouterPhotos(Long avarieId, MultipartFile file) {
        Avarie avarie = avarieRepository.findById(avarieId)
                .orElseThrow(() -> new EntityNotFoundException("Avarie non trouvée avec l'ID : " + avarieId));

        try {
            Photo photo = new Photo();
            photo.setFileName(file.getOriginalFilename()); // ✅ Associe le nom du fichier
            photo.setAvarie(avarie); // ✅ Associe la photo à l'avarie

            return photoRepository.save(photo);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }


    @Transactional
    public Vehicule signalerAvarie(String numeroChassis, String avarieJson, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé avec le numéro de châssis : " + numeroChassis));

        System.out.println("📡 Véhicule trouvé, ajout de l'avarie...");

        // ✅ Désérialiser l’avarie reçue en JSON
        Avarie avarie;
        try {
            avarie = objectMapper.readValue(avarieJson, Avarie.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("❌ Erreur conversion JSON de l'avarie", e);
        }

        avarie.setVehicule(vehicule);
        avarieRepository.save(avarie);
        System.out.println("✅ Avarie enregistrée avec succès : " + avarie.getType());

        // ✅ Associer les photos à l’avarie
        if (photos != null && !photos.isEmpty()) {
            for (MultipartFile file : photos) {
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());
                    photo.setAvarie(avarie);
                    photoRepository.save(photo);
                    System.out.println("📸 Photo enregistrée : " + file.getOriginalFilename());
                } catch (Exception e) {
                    throw new RuntimeException("❌ Erreur enregistrement photo", e);
                }
            }
        } else {
            System.out.println("⚠️ Aucune photo reçue pour cette avarie.");
        }

        // ✅ Modifier le statut du véhicule en "AVARIÉ"
        vehicule.setStatut(StatutVehicule.AVARIE);
        vehiculeRepository.save(vehicule);

        return vehicule;
    }
    @Transactional
    public Vehicule reparerVehicule(String numeroChassis) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé : " + numeroChassis));

        if (!vehicule.getStatut().equals(StatutVehicule.AVARIE)) {
            throw new IllegalStateException("🚨 Ce véhicule n'est pas marqué comme AVARIE !");
        }

        System.out.println("🛠 Réparation en cours pour : " + numeroChassis);

        // ✅ Modifier le statut du véhicule en "EN_STOCK"
        vehicule.setStatut(StatutVehicule.EN_ETAT);
        vehiculeRepository.save(vehicule);
        System.out.println("✅ Statut mis à jour : " + vehicule.getStatut());

        return vehicule;
    }

    @Transactional
    public Vehicule receptionnerVehicule(String numeroChassis, Long parcId, String avarieJson, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé : " + numeroChassis));

        Parc nouveauParc = parcRepository.findById(parcId)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Parc introuvable : " + parcId));

        System.out.println("🚗 Avant mise à jour - Parc: " + vehicule.getParc().getNom() + ", Statut: " + vehicule.getStatut());

        // ✅ Mise à jour du parc
        vehicule.setParc(nouveauParc);

        // ✅ Vérification de l'avarie (si elle existe)
        boolean hasAvarie = false;

        if (avarieJson != null && !avarieJson.isEmpty()) {
            try {
                System.out.println("🔍 Contenu de `avarieJson` avant conversion : " + avarieJson);

                if (avarieJson.trim().startsWith("[") && avarieJson.trim().endsWith("]")) {
                    List<Avarie> avarieList = objectMapper.readValue(avarieJson, new TypeReference<List<Avarie>>() {});
                    if (!avarieList.isEmpty()) {
                        Avarie avarie = avarieList.get(0); // ✅ On prend la première avarie
                        avarie.setVehicule(vehicule);
                        avarieRepository.save(avarie);
                        hasAvarie = true;

                        // ✅ Ajouter les photos d’avarie
                        if (photos != null && !photos.isEmpty()) {
                            for (MultipartFile file : photos) {
                                Photo photo = new Photo();
                                photo.setFileName(file.getOriginalFilename());
                                photo.setAvarie(avarie);
                                photoRepository.save(photo);
                            }
                        }
                    }
                } else {
                    Avarie avarie = objectMapper.readValue(avarieJson, Avarie.class);
                    avarie.setVehicule(vehicule);
                    avarieRepository.save(avarie);
                    hasAvarie = true;

                    // ✅ Ajouter les photos d’avarie
                    if (photos != null && !photos.isEmpty()) {
                        for (MultipartFile file : photos) {
                            Photo photo = new Photo();
                            photo.setFileName(file.getOriginalFilename());
                            photo.setAvarie(avarie);
                            photoRepository.save(photo);
                        }
                    }
                }

            } catch (JsonProcessingException e) {
                throw new RuntimeException("❌ Erreur lors de la conversion JSON de l'avarie : " + e.getMessage(), e);
            }
        }

        // ✅ Vérification et mise à jour du statut
        if (hasAvarie) {
            vehicule.setStatut(StatutVehicule.AVARIE);
            System.out.println("🚨 Le véhicule a une avarie, statut mis à AVARIE.");
        } else {
            vehicule.setStatut(StatutVehicule.EN_ETAT);
            System.out.println("✅ Le véhicule est réceptionné sans avarie, statut mis à RECU.");
        }

        // ✅ Sauvegarde en base
        vehiculeRepository.saveAndFlush(vehicule);
        entityManager.clear(); // ✅ Vide le cache Hibernate

        System.out.println("✅ Après mise à jour - Parc: " + vehicule.getParc().getNom() + ", Statut: " + vehicule.getStatut());
        return vehicule;
    }
    /**
     * ✅ Réception manuelle d'un véhicule
     */
    @PostMapping("/reception-manuelle")
    public ResponseEntity<Map<String, String>> receptionManuelle(@RequestBody VehiculeDTO vehiculeDTO) {
        try {
            Parc parcMegrine = parcRepository.findByNom("MEGRINE")
                    .orElseThrow(() -> new EntityNotFoundException("🚨 Parc MEGRINE introuvable"));

            Vehicule vehicule = new Vehicule();
            vehicule.setProductionDate(vehiculeDTO.getProductionDate());
            vehicule.setNumeroChassis(vehiculeDTO.getNumeroChassis());
            vehicule.setModele(vehiculeDTO.getModele());
            vehicule.setDescription(vehiculeDTO.getDescription());
            vehicule.setEngine(vehiculeDTO.getEngine());
            vehicule.setKeyCode(vehiculeDTO.getKeyCode());
            vehicule.setCouleur(vehiculeDTO.getCouleur());
            vehicule.setPegCode(vehiculeDTO.getPegCode());

            vehicule.setStatut(StatutVehicule.EN_ETAT);
            vehicule.setParc(parcMegrine);
            Parc parcAuport = parcRepository.findById(3L)
                    .orElseThrow(() -> new EntityNotFoundException("🚨 Parc AUPORT (ID = 3) introuvable"));
            vehicule.setParc(parcAuport);
            vehiculeRepository.save(vehicule);

            // ✅ Mise à jour du stock du parc MEGRINE
            Stock stockMegrine = stockRepository.findByParc(parcMegrine)
                    .orElseThrow(() -> new EntityNotFoundException("🚨 Stock du parc MEGRINE introuvable"));

            stockMegrine.setNombreTotal(stockMegrine.getNombreTotal() + 1);
            stockRepository.save(stockMegrine);

            return ResponseEntity.ok(Map.of("message", "✅ Véhicule ajouté au parc MEGRINE", "status", "success"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", "❌ Erreur lors de l'ajout du véhicule", "status", "error"));
        }
    }
    @Transactional
    public Vehicule mettreAJourVehiculeDepuisReception(String numeroChassis, String avarieJson, List<MultipartFile> photos) {
        // ✅ 1️⃣ Vérifier que le véhicule existe
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé dans le parc AUPORT !"));

        // ✅ 2️⃣ Vérifier l'avarie
        if (avarieJson != null && !avarieJson.isEmpty()) {
            try {
                Avarie avarie = objectMapper.readValue(avarieJson, Avarie.class);
                avarie.setVehicule(vehicule);
                avarieRepository.save(avarie);

                // ✅ Filtrer les photos valides (exclure `{}`)
                if (photos != null && !photos.isEmpty()) {
                    System.out.println("📸 Nombre total de photos reçues : " + photos.size());

                    Set<String> fileNames = new HashSet<>();

                    for (MultipartFile file : photos) {
                        String fileName = file.getOriginalFilename();

                        // Vérification : éviter d'ajouter une photo vide ou en double
                        if (fileName != null && !fileName.isEmpty() && !fileNames.contains(fileName)) {
                            Photo photo = new Photo();
                            photo.setFileName(fileName);
                            photo.setAvarie(avarie);
                            photoRepository.save(photo);

                            fileNames.add(fileName);
                            System.out.println("✅ Photo ajoutée : " + fileName);
                        } else {
                            System.out.println("🚨 Doublon détecté ou fichier vide ignoré : " + fileName);
                        }
                    }
                }

                // ✅ Modifier le statut du véhicule en "AVARIÉ"
                vehicule.setStatut(StatutVehicule.AVARIE);
                System.out.println("🚗 Véhicule mis à jour en statut AVARIÉ.");
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Erreur lors de la conversion JSON de l'avarie", e);
            }
        } else {
            // ✅ Modifier le statut en "REÇU" si pas d’avarie
            vehicule.setStatut(StatutVehicule.EN_ETAT);
            System.out.println("✅ Véhicule réceptionné sans avarie, statut mis à REÇU.");
        }

        return vehiculeRepository.save(vehicule);
    }
    public Vehicule findByNumeroChassis(String numeroChassis) {
        return vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new RuntimeException("🚨 Véhicule non trouvé avec numéro de châssis : " + numeroChassis));
    }
    @Transactional
    public Vehicule save(Vehicule vehicule) {
        return vehiculeRepository.save(vehicule);
    }
    public List<Vehicule> getVehiculesByParcs(List<Long> ids) {
        return vehiculeRepository.findByParcIdIn(ids);
    }
    @Transactional
    public void ajouterAvariesAuVehicule(Vehicule vehicule, List<Avarie> avaries, List<MultipartFile> photos) {
        for (int i = 0; i < avaries.size(); i++) {
            Avarie avarie = avaries.get(i);
            avarie.setVehicule(vehicule);

            // ✅ Ajouter les photos si disponibles
            if (photos != null && !photos.isEmpty()) {
                List<Photo> photosAvarie = new ArrayList<>();
                for (MultipartFile photoFile : photos) {
                    try {
                        Photo photo = new Photo();
                        photo.setAvarie(avarie);
                        photo.setFileName(photoFile.getOriginalFilename());
                        photo.setData(photoFile.getBytes());
                        photosAvarie.add(photo);
                    } catch (IOException e) {
                        throw new RuntimeException("🚨 Erreur lors de l'enregistrement de la photo", e);
                    }
                }
                avarie.setPhotos(photosAvarie);
            }
            vehicule.getAvaries().add(avarie);
        }

        // ✅ Mettre à jour le statut si des avaries sont ajoutées
        if (!vehicule.getAvaries().isEmpty()) {
            vehicule.setStatut(StatutVehicule.AVARIE);
            System.out.println("🚨 Le véhicule a reçu des avaries, statut mis à AVARIE.");
        }

        vehiculeRepository.saveAndFlush(vehicule);
    }
    public List<VehiculeDTO> getVehiculesByParc(String parcNom) {
        System.out.println("🔍 Recherche des véhicules pour le parc : " + parcNom);
        List<Vehicule> vehicules = vehiculeRepository.findByParcNom(parcNom);
        System.out.println("📡 Véhicules trouvés : " + vehicules.size());

        return vehicules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    private VehiculeDTO convertToDTO(Vehicule vehicule) {
        return new VehiculeDTO(vehicule); // ✅ Utilisation du constructeur existant
    }
    public Map<String, Long> getNombreVehiculesParStatut() {
        List<Object[]> result = vehiculeRepository.countVehiculesByStatut();
        Map<String, Long> stats = new LinkedHashMap<>();
        for (Object[] row : result) {
            StatutVehicule statut = (StatutVehicule) row[0];
            Long count = (Long) row[1];
            stats.put(statut.name(), count);
        }
        return stats;
    }
}
