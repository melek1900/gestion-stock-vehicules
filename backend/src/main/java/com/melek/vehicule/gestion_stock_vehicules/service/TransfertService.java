package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationRequest;
import com.melek.vehicule.gestion_stock_vehicules.dto.TransfertRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransfertService {

    private final TransfertRepository transfertRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final VehiculeTransportRepository vehiculeTransportRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ParcRepository parcRepository;
    private final StockRepository stockRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final OrdreMissionRepository ordreMissionRepository;

    public TransfertService(VehiculeTransportRepository vehiculeTransportRepository,ChauffeurRepository chauffeurRepository,TransfertRepository transfertRepository, VehiculeRepository vehiculeRepository, ParcRepository parcRepository, StockRepository stockRepository,OrdreMissionRepository ordreMissionRepository,UtilisateurRepository utilisateurRepository) {
        this.transfertRepository = transfertRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.parcRepository = parcRepository;
        this.stockRepository = stockRepository;
        this.ordreMissionRepository = ordreMissionRepository;
        this.chauffeurRepository=chauffeurRepository;
        this.vehiculeTransportRepository=vehiculeTransportRepository;
        this.utilisateurRepository = utilisateurRepository;


    }

    @Transactional
    public OrdreMission creerOrdreMission(List<Long> vehiculeIds, Long chauffeurId, Long vehiculeTransportId, Long parcArriveeId) {
        List<Vehicule> vehicules = vehiculeRepository.findAllById(vehiculeIds);
        if (vehicules.isEmpty()) {
            throw new RuntimeException("🚨 Aucun véhicule trouvé pour cet ordre de mission !");
        }

        Chauffeur chauffeur = chauffeurRepository.findById(chauffeurId)
                .orElseThrow(() -> new RuntimeException("🚨 Chauffeur introuvable"));

        VehiculeTransport vehiculeTransport = vehiculeTransportRepository.findById(vehiculeTransportId)
                .orElseThrow(() -> new RuntimeException("🚨 Véhicule de transport introuvable"));

        Parc parcArrivee = parcRepository.findById(parcArriveeId)
                .orElseThrow(() -> new RuntimeException("🚨 Parc de destination introuvable"));

        Parc parcDepart = vehicules.get(0).getParc();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String emailUtilisateur = auth.getName();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(emailUtilisateur)
                .orElseThrow(() -> new RuntimeException("🚨 Utilisateur introuvable !"));

        String numeroOrdre = "OM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        OrdreMission ordreMission = new OrdreMission(numeroOrdre, new Date(), vehicules, chauffeur, vehiculeTransport, parcDepart, parcArrivee);
        ordreMission.setUtilisateur(utilisateur);

        // 🔥 Sauvegarde de l'ordre de mission
        ordreMission = ordreMissionRepository.save(ordreMission);

        // ✅ Vérifier si l'ID est bien généré
        if (ordreMission.getId() == null) {
            throw new RuntimeException("🚨 L'ordre de mission n'a pas été enregistré !");
        }

        System.out.println("✅ OrdreMission ID après sauvegarde : " + ordreMission.getId());

        return ordreMission;
    }

    @Transactional
    public void receptionnerTransfert(Long transfertId) {
        Transfert transfert = transfertRepository.findById(transfertId)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Transfert non trouvé !"));

        List<Vehicule> vehicules = transfert.getVehicules();
        Parc parcDestination = transfert.getParcDestination();

        // 🔥 Vérifier que tous les véhicules sont bien en transit
        for (Vehicule vehicule : vehicules) {
            if (!vehicule.getStatut().equals(StatutVehicule.EN_ETAT)) {
                throw new IllegalStateException("🚨 Le véhicule " + vehicule.getNumeroChassis() + " n'est pas en transit !");
            }

            vehicule.setStatut(StatutVehicule.EN_ETAT);
            vehicule.setParc(parcDestination);
        }

        vehiculeRepository.saveAll(vehicules);

        // 🔥 Mettre à jour l'ordre de mission s'il n'a plus de transferts en transit
        OrdreMission ordreMission = transfert.getOrdreMission();
        boolean allTransfertsReçus = ordreMission.getTransferts().stream()
                .allMatch(t -> t.getStatut() == StatutTransfert.RECU);

        if (allTransfertsReçus) {
            ordreMission.setStatut(StatutOrdreMission.CLOTURE);
            ordreMissionRepository.save(ordreMission);
        }

        transfert.setStatut(StatutTransfert.RECU);
        transfertRepository.save(transfert);
    }

    public  List<Transfert> getAllTransferts() {
        return transfertRepository.findAll();
    }
}
