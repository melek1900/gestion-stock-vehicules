package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class OrdreMissionService {

    private final ParcService parcService;
    private static final String PARC_TRANSFERT = "TRANSFERT";
    private final OrdreMissionRepository ordreMissionRepository;
    private final ParcRepository parcRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final VehiculeTransportRepository vehiculeTransportRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final MotifDeplacementRepository motifDeplacementRepository;
    private final SousParcRepository sousParcRepository;

    @Autowired
    private CompteurOrdreMissionService compteurService;
    public OrdreMissionService(OrdreMissionRepository ordreMissionRepository, VehiculeRepository vehiculeRepository,
                               ChauffeurRepository chauffeurRepository, UtilisateurRepository utilisateurRepository,
                               VehiculeTransportRepository vehiculeTransportRepository, ParcRepository parcRepository, ParcService parcService, MotifDeplacementRepository motifDeplacementRepository,SousParcRepository sousParcRepository) {
        this.ordreMissionRepository = ordreMissionRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.chauffeurRepository = chauffeurRepository;
        this.vehiculeTransportRepository = vehiculeTransportRepository;
        this.parcRepository = parcRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.parcService = parcService;
        this.motifDeplacementRepository = motifDeplacementRepository;
        this.sousParcRepository = sousParcRepository;


    }

    @Transactional
    public boolean preleverVehiculeParNumeroOrdre(String numeroOrdre, String numeroChassis) {
        OrdreMission ordre = ordreMissionRepository.findByNumeroOrdre(numeroOrdre)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Ordre non trouvé : " + numeroOrdre));

        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé : " + numeroChassis));

        if (!ordre.getVehicules().contains(vehicule)) {
            System.out.println("❌ Ce véhicule ne fait pas partie de l’ordre de mission !");
            return false;
        }

        // 🔄 Utilisation dynamique
        Parc parcTransfert = parcService.getParcByNom(PARC_TRANSFERT);

        vehicule.setParc(parcTransfert);
        vehicule.setStatut(StatutVehicule.EN_ETAT);
        vehiculeRepository.save(vehicule);

        boolean tousPreleves = ordre.getVehicules().stream().allMatch(this::estPreleve);
        boolean auMoinsUnPreleve = ordre.getVehicules().stream().anyMatch(this::estPreleve);

        if (tousPreleves) {
            ordre.setStatut(StatutOrdreMission.CLOTURE);
        } else if (auMoinsUnPreleve) {
            ordre.setStatut(StatutOrdreMission.PARTIEL);
        } else {
            ordre.setStatut(StatutOrdreMission.EN_COURS);
        }

        ordreMissionRepository.save(ordre);
        return true;
    }


    @Transactional
    public boolean validerPrelevement(String numeroOrdre) {
        OrdreMission ordre = ordreMissionRepository.findByNumeroOrdre(numeroOrdre)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Ordre non trouvé : " + numeroOrdre));

        boolean tousPreleves = ordre.getVehicules().stream().allMatch(this::estPreleve);
        boolean auMoinsUnPreleve = ordre.getVehicules().stream().anyMatch(this::estPreleve);

        if (tousPreleves) {
            ordre.setStatut(StatutOrdreMission.CLOTURE);
            System.out.println("✅ Tous les véhicules ont été prélevés, ordre clôturé !");
        } else if (auMoinsUnPreleve) {
            ordre.setStatut(StatutOrdreMission.EN_COURS);
            System.out.println("⚡ Prélèvement partiel validé, ordre toujours en cours.");
        } else {
            System.out.println("❌ Aucun véhicule prélevé, impossible de valider.");
            return false;
        }

        ordreMissionRepository.save(ordre);
        return true;
    }

    public List<OrdreMission> getAllOrdresMission() {
        List<OrdreMission> ordres = ordreMissionRepository.findAll();
        ordres.forEach(ordre -> System.out.println("📜 Ordre ID: " + ordre.getId() + ", Numéro: " + ordre.getNumeroOrdre()));
        return ordres;
    }

    public OrdreMission getOrdreMissionById(Long id) {
        return ordreMissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Ordre de mission introuvable avec l'ID : " + id));
    }
    public boolean vehiculeDejaDansOrdre(Vehicule vehicule) {
        return ordreMissionRepository.existsByVehiculesContainingAndStatutNot(vehicule, StatutOrdreMission.CLOTURE);
    }
    @Transactional
    public void annulerOrdreMission(Long ordreId) {
        OrdreMission ordre = ordreMissionRepository.findById(ordreId)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Ordre de mission introuvable"));

        if (ordre.getStatut() == StatutOrdreMission.CLOTURE) {
            throw new IllegalStateException("🚨 Impossible d'annuler un ordre déjà clôturé !");
        }

        Parc parcTransfert = parcService.getParcByNom("TRANSFERT");

        for (Vehicule vehicule : ordre.getVehicules()) {
            if (vehicule.getParc() != null && parcTransfert.getId().equals(vehicule.getParc().getId())) {
                Parc parcDepart = ordre.getParcDepart();
                vehicule.setParc(parcDepart);
                vehicule.setStatut(StatutVehicule.EN_ETAT);
                vehiculeRepository.save(vehicule);
            }
        }

        // ✅ Libérer tous les chauffeurs associés à l’ordre
        Set<Chauffeur> chauffeurs = ordre.getChauffeurs();
        for (Chauffeur chauffeur : chauffeurs) {
            chauffeur.setDisponible(true);
        }
        chauffeurRepository.saveAll(chauffeurs);

        // ✅ Libérer le véhicule de transport
        VehiculeTransport vehiculeTransport = ordre.getVehiculeTransport();
        vehiculeTransport.setDisponible(true);
        vehiculeTransportRepository.save(vehiculeTransport);

        // ✅ Mise à jour de l’ordre
        ordre.setStatut(StatutOrdreMission.ANNULE);
        ordre.getVehicules().clear();
        ordre.getChauffeurs().clear(); // ✅ Important si tu veux libérer la relation
        ordreMissionRepository.save(ordre);
    }

    @Transactional
    public OrdreMission creerOrdreMission(List<Integer> vehiculeIds, List<Integer> chauffeurIds, Integer vehiculeTransportId, Integer parcDepartId, Integer parcArriveeId, Long motifDeplacementId, LocalDate dateDepart, LocalTime heureDepart,Long sousParcId
    ) {
        // 🚘 Vérifier et récupérer les véhicules
        List<Long> vehiculeIdsLong = vehiculeIds.stream().map(Integer::longValue).toList();
        List<Vehicule> vehicules = vehiculeRepository.findAllById(vehiculeIdsLong);
        List<Vehicule> vehiculesUtilisables = new ArrayList<>();

        for (Vehicule v : vehicules) {
            if (vehiculeDejaDansOrdre(v)) {
                throw new RuntimeException("❌ Le véhicule " + v.getNumeroChassis() + " est déjà utilisé dans un autre ordre non clôturé !");
            }
            vehiculesUtilisables.add(v);
        }
        MotifDeplacement motif = motifDeplacementRepository.findById(motifDeplacementId)
                .orElseThrow(() -> new RuntimeException("Motif introuvable"));
        if (vehiculesUtilisables.isEmpty()) {
            throw new RuntimeException("❌ Aucun véhicule valide trouvé pour cet ordre de mission.");
        }

        // 🧑‍✈️ Vérifier et récupérer les chauffeurs (1 ou 2 max)
        if (chauffeurIds == null || chauffeurIds.isEmpty() || chauffeurIds.size() > 2) {
            throw new RuntimeException("❌ Vous devez sélectionner un ou deux chauffeurs maximum.");
        }

        List<Chauffeur> chauffeurs = chauffeurRepository.findAllById(
                chauffeurIds.stream().map(Long::valueOf).toList()
        );

        if (chauffeurs.size() != chauffeurIds.size()) {
            throw new RuntimeException("❌ Un ou plusieurs chauffeurs sélectionnés sont introuvables.");
        }

        // 🚚 Véhicule de transport
        VehiculeTransport vehiculeTransport = vehiculeTransportRepository.findById(vehiculeTransportId.longValue())
                .orElseThrow(() -> new RuntimeException("❌ Véhicule de transport introuvable."));

        // 🅿️ Parcs
        Parc parcDepart = parcService.getParcById(parcDepartId.longValue());
        Parc parcArrivee = parcService.getParcById(parcArriveeId.longValue());

        // 👤 Utilisateur connecté
        String emailUtilisateur = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(emailUtilisateur)
                .orElseThrow(() -> new RuntimeException("❌ Utilisateur introuvable pour l'email : " + emailUtilisateur));

        // 📄 Création de l'ordre de mission
        OrdreMission ordreMission = new OrdreMission();
        ordreMission.setNumeroOrdre(compteurService.genererNumeroOrdreMission());
        ordreMission.setDateCreation(new Date());
        ordreMission.setStatut(StatutOrdreMission.EN_COURS);
        ordreMission.setVehicules(vehiculesUtilisables);
        ordreMission.setChauffeurs(new HashSet<>(chauffeurs));
        ordreMission.setVehiculeTransport(vehiculeTransport);
        ordreMission.setParcDepart(parcDepart);
        ordreMission.setParcArrivee(parcArrivee);
        ordreMission.setUtilisateur(utilisateur);
        ordreMission.setMotifDeplacement(motif);
        ordreMission.setDateDepart(dateDepart);
        ordreMission.setHeureDepart(heureDepart);
        if (sousParcId != null) {
            SousParc sousParc = sousParcRepository.findById(sousParcId)
                    .orElseThrow(() -> new RuntimeException("❌ Sous-parc introuvable avec ID : " + sousParcId));
            ordreMission.setSousParc(sousParc);
        }
        // 🔐 Marquer les ressources comme utilisées
        chauffeurs.forEach(c -> c.setDisponible(false));
        vehiculeTransport.setDisponible(false);

        chauffeurRepository.saveAll(chauffeurs);
        vehiculeTransportRepository.save(vehiculeTransport);

        return ordreMissionRepository.save(ordreMission);
    }


    public Map<String, Long> getStatsParStatutOrdre() {
        List<Object[]> results = ordreMissionRepository.countByStatut();
        Map<String, Long> stats = new LinkedHashMap<>();
        for (Object[] row : results) {
            StatutOrdreMission statut = (StatutOrdreMission) row[0];
            Long count = (Long) row[1];
            stats.put(statut.name(), count);
        }
        return stats;
    }
    @Transactional
    public void cloturerOrdreMission(Long ordreId) {
        OrdreMission ordreMission = ordreMissionRepository.findById(ordreId)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Ordre de mission introuvable !"));

        if (ordreMission.getStatut() == StatutOrdreMission.CLOTURE) {
            throw new IllegalStateException("🚨 Cet ordre de mission est déjà clôturé !");
        }

        // ✅ Rendre disponibles tous les chauffeurs associés
        Set<Chauffeur> chauffeurs = ordreMission.getChauffeurs();
        if (chauffeurs != null && !chauffeurs.isEmpty()) {
            for (Chauffeur chauffeur : chauffeurs) {
                chauffeur.setDisponible(true);
                chauffeurRepository.save(chauffeur);
            }
        }

        // ✅ Rendre disponible le véhicule de transport
        VehiculeTransport vehiculeTransport = ordreMission.getVehiculeTransport();
        if (vehiculeTransport != null) {
            vehiculeTransport.setDisponible(true);
            vehiculeTransportRepository.save(vehiculeTransport);
        }

        // ✅ Clôturer l’ordre
        ordreMission.setStatut(StatutOrdreMission.CLOTURE);
        ordreMission.getVehicules().clear(); // Libérer les véhicules
        ordreMissionRepository.save(ordreMission);
    }


    public List<VehiculeDTO> getVehiculesParOrdre(Long ordreId) {
        OrdreMission ordre = ordreMissionRepository.findById(ordreId)
                .orElseThrow(() -> new RuntimeException("Ordre non trouvé"));

        return ordre.getVehicules().stream()
                .map(VehiculeDTO::new)
                .toList();
    }

    private boolean estPreleve(Vehicule v) {
        return v.getParc() != null && PARC_TRANSFERT.equalsIgnoreCase(v.getParc().getNom());
    }

}
