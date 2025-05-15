package com.melek.vehicule.gestion_stock_vehicules.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalDate;
import java.time.LocalTime;
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
    private final ParcService parcService;
    private final SousParcRepository sousParcRepository;
    private final OrdreMissionRepository ordreMissionRepository;
    private final VehiculeTransportRepository vehiculeTransportRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final OrdreMissionService ordreMissionService;
    private final TypeMouvementRepository typeMouvementRepository;
    private final MouvementRepository mouvementRepository;
    public VehiculeService(
            VehiculeRepository vehiculeRepository,
            AvarieRepository avarieRepository,
            ParcRepository parcRepository,
            StockRepository stockRepository,
            PhotoRepository photoRepository,
            ObjectMapper objectMapper,
            ParcService parcService,
            UtilisateurRepository utilisateurRepository,
            SousParcRepository sousParcRepository,
            OrdreMissionRepository ordreMissionRepository,
            VehiculeTransportRepository vehiculeTransportRepository,
            ChauffeurRepository chauffeurRepository,
            OrdreMissionService ordreMissionService,
            TypeMouvementRepository typeMouvementRepository,
            MouvementRepository mouvementRepository) {
        this.vehiculeRepository = vehiculeRepository;
        this.avarieRepository = avarieRepository;
        this.parcRepository = parcRepository;
        this.stockRepository = stockRepository;
        this.photoRepository = photoRepository;
        this.objectMapper = objectMapper;
        this.parcService = parcService;
        this.utilisateurRepository = utilisateurRepository;
        this.sousParcRepository = sousParcRepository;
        this.ordreMissionRepository= ordreMissionRepository;
        this.vehiculeTransportRepository = vehiculeTransportRepository;
        this.chauffeurRepository = chauffeurRepository;
        this.ordreMissionService = ordreMissionService;
        this.typeMouvementRepository= typeMouvementRepository;
        this.mouvementRepository = mouvementRepository;
    }
    @PersistenceContext
    private EntityManager entityManager;
    /**
     * ✅ Enregistrer une liste de véhicules (Import Excel)
     */


    public List<VehiculeDTO> getVehiculesFiltres(List<Long> parcIds, Set<String> marquesAccessibles) {
        return vehiculeRepository.findAll().stream()
                .filter(v -> v.getParc() != null && parcIds.contains(v.getParc().getId()))
                .filter(v -> v.getShortDescription() != null && marquesAccessibles.contains(v.getShortDescription().toUpperCase()))
                .map(VehiculeDTO::new)
                .toList();
    }
    @Transactional
    public Avarie ajouterAvarieEtPhotos(Long vehiculeId, Avarie avarie, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé"));

        avarie.setVehicule(vehicule);
        avarie.setStatut(StatutAvarie.EN_COURS);

        Avarie saved = avarieRepository.save(avarie);

        if (photos != null) {
            for (MultipartFile file : photos) {
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());
                    photo.setData(file.getBytes());
                    photo.setAvarie(saved);
                    photoRepository.save(photo);
                } catch (IOException e) {
                    throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
                }
            }
        }

        return saved;
    }
    @Transactional
    public boolean transfertVersCarrosserie(String numeroChassis, Long sousParcId) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new RuntimeException("Véhicule introuvable"));

        Parc carrosserie = parcRepository.findByNomIgnoreCase("CARROSSERIE")
                .orElseThrow(() -> new RuntimeException("Parc Carrosserie introuvable"));

        SousParc sousParc = sousParcRepository.findById(sousParcId)
                .orElseThrow(() -> new RuntimeException("Sous-parc introuvable"));

        // Mise à jour du véhicule
        vehicule.setParc(carrosserie);
        vehicule.setSousParc(sousParc);
        vehiculeRepository.save(vehicule);

        // 🧠 Vérification de l’ordre de mission associé
        OrdreMission ordre = ordreMissionRepository.findByVehiculesContaining(vehicule)
                .orElse(null);

        if (ordre != null) {
            boolean tousTransferes = ordre.getVehicules().stream()
                    .allMatch(v -> "CARROSSERIE".equalsIgnoreCase(v.getParc().getNom()));

            if (tousTransferes) {
                ordre.setStatut(StatutOrdreMission.CLOTURE);

                // Rendre les chauffeurs et véhicule transport dispo
                if (ordre.getChauffeurs() != null) {
                    ordre.getChauffeurs().forEach(ch -> ch.setDisponible(true));
                    chauffeurRepository.saveAll(ordre.getChauffeurs());
                }

                if (ordre.getVehiculeTransport() != null) {
                    ordre.getVehiculeTransport().setDisponible(true);
                    vehiculeTransportRepository.save(ordre.getVehiculeTransport());
                }

                ordre.getVehicules().clear(); // Libère les véhicules
                ordreMissionRepository.save(ordre);

                return true;
            }
        }

        return false;
    }


    public List<Vehicule> getVehiculesAvecAvaries() {
        return vehiculeRepository.findAll().stream()
                .filter(v -> v.getAvaries() != null && !v.getAvaries().isEmpty())
                .toList();
    }
    /**
     * ✅ Ajouter un véhicule avec ses avaries et photos
     */
    @Transactional
    public Vehicule createVehicule(Vehicule vehicule, List<Avarie> avaries, List<MultipartFile> photos) {
        Parc parcAuport = parcService.getParcByNom("AUPORT");

        vehicule.setParc(parcAuport);
        vehicule.setStatut(StatutVehicule.EN_ETAT);

        // ✅ 2️⃣ Sauvegarde du véhicule
        Vehicule savedVehicule = vehiculeRepository.save(vehicule);

        // ✅ 3️⃣ Enregistrement des avaries (si fournies)
        List<Avarie> savedAvaries = new ArrayList<>();
        if (avaries != null && !avaries.isEmpty()) {
            for (Avarie avarie : avaries) {
                avarie.setVehicule(savedVehicule);
                avarie.setStatut(StatutAvarie.EN_COURS);
                Avarie savedAvarie = avarieRepository.save(avarie);
                savedAvaries.add(savedAvarie);
            }
        }

        // ✅ 4️⃣ Enregistrement des photos (si fournies)
        if (photos != null && !photos.isEmpty()) {
            for (MultipartFile file : photos) {
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());
                    photo.setData(file.getBytes());

                    // ✅ Si on a une seule avarie (souvent le cas), on l’associe
                    if (!savedAvaries.isEmpty()) {
                        photo.setAvarie(savedAvaries.get(0)); // ou un mapping plus avancé si besoin
                    }

                    photoRepository.save(photo);
                } catch (IOException e) {
                    throw new RuntimeException("❌ Erreur lors de l'enregistrement de la photo", e);
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
     * ✅ Ajouter une avarie à un véhicule existant
     */
    public Avarie ajouterAvarie(Long vehiculeId, Avarie avarie) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé avec l'ID : " + vehiculeId));

        avarie.setVehicule(vehicule);
        avarie.setStatut(StatutAvarie.EN_COURS);

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
            photo.setFileName(file.getOriginalFilename());
            photo.setData(file.getBytes()); // ✅ Ajout du contenu de la photo
            photo.setAvarie(avarie);

            return photoRepository.save(photo);
        } catch (IOException e) {
            throw new RuntimeException("❌ Erreur lors de l'enregistrement de la photo", e);
        }
    }



    @Transactional
    public Vehicule signalerAvarie(String numeroChassis, String avarieJson, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé avec le numéro de châssis : " + numeroChassis));

        System.out.println("📡 Véhicule trouvé, ajout de l'avarie...");

        Avarie avarie;
        try {
            avarie = objectMapper.readValue(avarieJson, Avarie.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("❌ Erreur conversion JSON de l'avarie", e);
        }

        avarie.setVehicule(vehicule);
        avarie.setStatut(StatutAvarie.EN_COURS); // ✅ Par défaut à la création

        Avarie savedAvarie = avarieRepository.save(avarie);
        System.out.println("✅ Avarie enregistrée avec succès : " + savedAvarie.getType());

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
        } else {
            System.out.println("⚠️ Aucune photo reçue pour cette avarie.");
        }

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

        // 🔁 Clôturer toutes les avaries EN_COURS du véhicule
        List<Avarie> avariesEnCours = avarieRepository.findByVehiculeAndStatut(vehicule, StatutAvarie.EN_COURS);
        for (Avarie avarie : avariesEnCours) {
            avarie.setStatut(StatutAvarie.CLOTURE);
            avarieRepository.save(avarie);
            System.out.println("✅ Avarie clôturée : " + avarie.getType());
        }

        vehicule.setStatut(StatutVehicule.EN_ETAT);
        vehiculeRepository.save(vehicule);
        System.out.println("✅ Véhicule réparé : statut EN_ETAT");

        return vehicule;
    }

    @Transactional
    public Vehicule receptionnerVehicule(String numeroChassis, Long parcId, String avarieJson, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new IllegalStateException("🚨 Véhicule non trouvé"));

        Parc parc = parcService.getParcById(parcId);
        vehicule.setParc(parc);

        Map<String, Avarie> avarieMap = new HashMap<>();

        if (avarieJson != null && !avarieJson.isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, String>> avariesList;
            try {
                avariesList = mapper.readValue(avarieJson, List.class);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("❌ Erreur lors du parsing du JSON des avaries", e);
            }

            for (Map<String, String> avarieData : avariesList) {
                String type = avarieData.get("type");
                String commentaire = avarieData.get("commentaire");
                String key = avarieData.get("key");

                Avarie avarie = new Avarie();
                avarie.setType(type);
                avarie.setCommentaire(commentaire);
                avarie.setStatut(StatutAvarie.EN_COURS);
                avarie.setVehicule(vehicule);

                avarieMap.put(key, avarie);
            }
        }

        if (photos != null) {
            for (MultipartFile file : photos) {
                String originalFileName = file.getOriginalFilename();
                if (originalFileName == null || !originalFileName.contains("photo-")) continue;

                String key = extractKeyFromFileName(originalFileName);

                Avarie avarie = avarieMap.get(key);
                if (avarie != null) {
                    try {
                        byte[] data = file.getBytes();
                        Photo photo = new Photo(originalFileName, data, avarie);
                        avarie.getPhotos().add(photo);
                    } catch (IOException e) {
                        throw new IllegalStateException("❌ Erreur lecture fichier photo : " + originalFileName, e);
                    }
                }
            }
        }

        if (!avarieMap.isEmpty()) {
            vehicule.setStatut(StatutVehicule.AVARIE);
        } else {
            vehicule.setStatut(StatutVehicule.EN_ETAT);
        }

        List<Avarie> avariesToSave = new ArrayList<>(avarieMap.values());
        vehicule.setAvaries(avariesToSave);

        Vehicule savedVehicule = vehiculeRepository.save(vehicule);

        // 🔐 Récupération de l'utilisateur connecté
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("❌ Utilisateur connecté introuvable"));

        // 🔁 Création du mouvement
        Mouvement mouvement = new Mouvement();
        mouvement.setNumeroChassis(numeroChassis);
        mouvement.setSequence(mouvementRepository.countByNumeroChassis(numeroChassis) + 1);
        mouvement.setParc(parc);
        mouvement.setTypeMouvement(
                typeMouvementRepository.findByLibelTransact("RC")
                        .orElseThrow(() -> new IllegalStateException("❌ Type mouvement 'RC' introuvable"))
        );
        mouvement.setQty(+1);
        mouvement.setDateMouvement(LocalDate.now());
        mouvement.setHeureMouvement(LocalTime.now());
        mouvement.setUtilisateur(utilisateur);
        mouvement.setUtilisateurNomComplet(utilisateur.getPrenom() + " " + utilisateur.getNom());

        mouvementRepository.save(mouvement);

        return savedVehicule;
    }




    private String extractKeyFromFileName(String fileName) {
        // ex: photo-av1679510923_0-0.png → renvoie "av1679510923_0"
        int start = fileName.indexOf("photo-") + 6;
        int end = fileName.lastIndexOf("-");
        return fileName.substring(start, end);
    }


    public Vehicule findByNumeroChassis(String numeroChassis) {
        return vehiculeRepository.findByNumeroChassis(numeroChassis).orElse(null);
    }
    @Transactional
    public Vehicule creerAvarie(String numeroChassis, String avarieJson, List<MultipartFile> photos) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé : " + numeroChassis));

        Avarie avarie;
        try {
            avarie = objectMapper.readValue(avarieJson, Avarie.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("❌ Erreur de format JSON pour l’avarie.");
        }

        avarie.setVehicule(vehicule);
        avarie.setStatut(StatutAvarie.EN_COURS); // ✅ statut initial
        avarie = avarieRepository.save(avarie);

        if (photos != null && !photos.isEmpty()) {
            for (MultipartFile file : photos) {
                try {
                    Photo photo = new Photo();
                    photo.setFileName(file.getOriginalFilename());
                    photo.setData(file.getBytes());
                    photo.setAvarie(avarie);
                    photoRepository.save(photo);
                } catch (IOException e) {
                    throw new RuntimeException("❌ Erreur lors de l’enregistrement de la photo", e);
                }
            }
        }

        if (vehicule.getStatut() != StatutVehicule.AVARIE) {
            vehicule.setStatut(StatutVehicule.AVARIE);
            vehiculeRepository.save(vehicule);
        }

        return vehicule;
    }

    @Transactional
    public Vehicule save(Vehicule vehicule) {
        return vehiculeRepository.save(vehicule);
    }
    public List<Vehicule> getVehiculesByParcs(List<Long> ids) {
        return vehiculeRepository.findByParcIdIn(ids);
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
