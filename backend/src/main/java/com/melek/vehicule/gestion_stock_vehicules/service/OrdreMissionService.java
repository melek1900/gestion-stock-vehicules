package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.VehiculeDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrdreMissionService {
    private final OrdreMissionRepository ordreMissionRepository;
    private final ParcRepository parcRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final VehiculeTransportRepository vehiculeTransportRepository;
    private final UtilisateurRepository utilisateurRepository;
    @Autowired
    private CompteurOrdreMissionService compteurService;
    public OrdreMissionService(OrdreMissionRepository ordreMissionRepository, VehiculeRepository vehiculeRepository,
                               ChauffeurRepository chauffeurRepository, UtilisateurRepository utilisateurRepository,
                               VehiculeTransportRepository vehiculeTransportRepository, ParcRepository parcRepository) {
        this.ordreMissionRepository = ordreMissionRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.chauffeurRepository = chauffeurRepository;
        this.vehiculeTransportRepository = vehiculeTransportRepository;
        this.parcRepository = parcRepository;
        this.utilisateurRepository = utilisateurRepository;
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

        Parc parcTransfert = parcRepository.findByNom("TRANSFERT")
                .orElseThrow(() -> new EntityNotFoundException("🚨 Parc TRANSFERT introuvable"));

        vehicule.setParc(parcTransfert);
        vehicule.setStatut(StatutVehicule.EN_ETAT);
        vehiculeRepository.save(vehicule);

        boolean tousPreleves = ordre.getVehicules().stream().allMatch(this::estPreleve);
        boolean auMoinsUnPreleve = ordre.getVehicules().stream().anyMatch(this::estPreleve);

        if (tousPreleves) {
            ordre.setStatut(StatutOrdreMission.CLOTURE);
            System.out.println("✅ Tous les véhicules sont prélevés, l'ordre peut être clôturé.");
        } else if (auMoinsUnPreleve) {
            ordre.setStatut(StatutOrdreMission.PARTIEL);
            System.out.println("⚠️ Prélèvement partiel, statut mis à jour en PARTIELLE.");
        } else {
            ordre.setStatut(StatutOrdreMission.EN_COURS);
            System.out.println("📌 Aucun véhicule encore prélevé, ordre toujours EN_COURS.");
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

        // Libération des véhicules : suppression de leur lien avec cet ordre (s'ils sont "réquisitionnés")
        for (Vehicule vehicule : ordre.getVehicules()) {
            if ("TRANSFERT".equalsIgnoreCase(vehicule.getParc().getNom())) {
                Parc parcDepart = ordre.getParcDepart();
                vehicule.setParc(parcDepart); // retour au parc initial
                vehicule.setStatut(StatutVehicule.EN_ETAT); // statut réinitialisé
                vehiculeRepository.save(vehicule);
            }
        }

        ordre.setStatut(StatutOrdreMission.ANNULE);
        ordreMissionRepository.save(ordre);
    }

    @Transactional
    public OrdreMission creerOrdreMission(List<Integer> vehiculeIds, Integer chauffeurId, Integer vehiculeTransportId, Integer parcDepartId, Integer parcArriveeId) {
        List<Long> vehiculeIdsLong = vehiculeIds.stream().map(Integer::longValue).toList();
        List<Vehicule> vehicules = vehiculeRepository.findAllById(vehiculeIdsLong);
        List<Vehicule> vehiculesUtilisables = new ArrayList<>();

        for (Vehicule v : vehicules) {
            if (vehiculeDejaDansOrdre(v)) {
                throw new RuntimeException("❌ Le véhicule " + v.getNumeroChassis() + " est déjà utilisé dans un autre ordre non clôturé !");
            }
            vehiculesUtilisables.add(v);
        }

        if (vehicules.isEmpty()) throw new RuntimeException("❌ Aucun véhicule trouvé pour cet ordre de mission.");

        Chauffeur chauffeur = chauffeurRepository.findById(chauffeurId.longValue())
                .orElseThrow(() -> new RuntimeException("❌ Chauffeur introuvable."));
        VehiculeTransport vehiculeTransport = vehiculeTransportRepository.findById(vehiculeTransportId.longValue())
                .orElseThrow(() -> new RuntimeException("❌ Véhicule de transport introuvable."));
        Parc parcDepart = parcRepository.findById(parcDepartId.longValue())
                .orElseThrow(() -> new RuntimeException("❌ Parc de départ introuvable."));
        Parc parcArrivee = parcRepository.findById(parcArriveeId.longValue())
                .orElseThrow(() -> new RuntimeException("❌ Parc d'arrivée introuvable."));

        String emailUtilisateur = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(emailUtilisateur)
                .orElseThrow(() -> new RuntimeException("❌ Utilisateur introuvable pour l'email : " + emailUtilisateur));

        OrdreMission ordreMission = new OrdreMission();
        ordreMission.setNumeroOrdre(compteurService.genererNumeroOrdreMission()); // ✅ Numérotation
        ordreMission.setDateCreation(new Date());
        ordreMission.setStatut(StatutOrdreMission.EN_COURS);
        ordreMission.setVehicules(vehicules);
        ordreMission.setChauffeur(chauffeur);
        ordreMission.setVehiculeTransport(vehiculeTransport);
        ordreMission.setParcDepart(parcDepart);
        ordreMission.setParcArrivee(parcArrivee);
        ordreMission.setUtilisateur(utilisateur);

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

        ordreMission.setStatut(StatutOrdreMission.CLOTURE);
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
        return v.getParc() != null && "TRANSFERT".equalsIgnoreCase(v.getParc().getNom());
    }
}
